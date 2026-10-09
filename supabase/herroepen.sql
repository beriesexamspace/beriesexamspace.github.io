-- Herroepen, "plan meteen laten starten" en Plus na een proefmaand Pro (03-10-2026).
-- Eenmalig uitvoeren in de SQL-editor van Supabase, na abonnementen.sql. Uitgevoerd op 05-10-2026.
--
-- Nieuwe kolommen in abonnementen:
--   betaald_plan      het plan waarvoor betaald_tot geldt. Zo blijft een betaalde Plus bestaan als je een proefmaand Pro start;
--                     na die proefmaand heb je weer Plus in plaats van Free.
--   overeenkomst_op   moment waarop een BETAALDE overeenkomst is gesloten (vult de Mollie-koppeling later). De bedenktijd
--                     van 14 dagen telt vanaf de dag erna; zolang die loopt, staat op Profiel de knop
--                     "Hier de overeenkomst herroepen". Een proefmaand zonder betaalgegevens vult dit niet.
--   meteen_starten_op wanneer de student het vinkje "Laat mijn plan meteen starten" aanzette (bewijs van de keuze).
--   herroepen_op      wanneer de student herroepen heeft. Status wordt dan 'herroepen'.
-- Terugbetalen gebeurt (nog) niet automatisch: dat hoort bij de Mollie-koppeling, net als de bevestigingsmail.

begin;

alter table public.abonnementen add column if not exists betaald_plan text check (betaald_plan in ('plus', 'pro'));
alter table public.abonnementen add column if not exists overeenkomst_op timestamptz;
alter table public.abonnementen add column if not exists meteen_starten_op timestamptz;
alter table public.abonnementen add column if not exists herroepen_op timestamptz;
alter table public.abonnementen drop constraint if exists abonnementen_status_check;
alter table public.abonnementen add constraint abonnementen_status_check check (status in ('proef', 'actief', 'opgezegd', 'herroepen'));

-- Einde van de bedenktijd: 14 dagen, te tellen vanaf de dag na het sluiten van de overeenkomst (tijdzone Amsterdam).
create or replace function public.herroep_tot(p_op timestamptz)
returns timestamptz
language sql
stable
as $$
  select case when p_op is null then null
    else (date_trunc('day', p_op at time zone 'Europe/Amsterdam') + interval '15 days') at time zone 'Europe/Amsterdam' end;
$$;

-- Het plan dat nu geldt: het hoogste van een lopende proefmaand en een lopende betaalde periode.
create or replace function public.plan_nu(p_plan text, p_proef_tot timestamptz, p_betaald_plan text, p_betaald_tot timestamptz)
returns text
language sql
stable
as $$
  select case
    when (p_proef_tot > now() and p_plan = 'pro') or (p_betaald_tot > now() and coalesce(p_betaald_plan, p_plan) = 'pro') then 'pro'
    when (p_proef_tot > now() and p_plan = 'plus') or (p_betaald_tot > now() and coalesce(p_betaald_plan, p_plan) = 'plus') then 'plus'
    else 'free' end;
$$;

create or replace function public.mijn_abonnement()
returns json
language sql
stable
security definer
set search_path = public
as $$
  with a as (
    select *,
      public.plan_nu(plan, proef_tot, betaald_plan, betaald_tot) as nu,
      case when proef_tot > now() then plan end as proef_nu,
      case when betaald_tot > now() then coalesce(betaald_plan, plan) end as betaald_nu,
      public.herroep_tot(overeenkomst_op) as bedenktijd_tot
    from public.abonnementen
    where user_id = auth.uid()
  )
  select json_build_object(
    'plan', coalesce((select nu from a), 'free'),
    'status', (select status from a where nu <> 'free'),
    'geldig_tot', (select case
        when proef_nu = nu and betaald_nu = nu then greatest(proef_tot, betaald_tot)
        when proef_nu = nu then proef_tot
        else betaald_tot end
      from a where nu <> 'free'),
    'daarna', (select betaald_nu from a where proef_nu = nu and betaald_nu is not null and betaald_nu <> nu and betaald_tot > proef_tot),
    'kan_herroepen', coalesce((select overeenkomst_op is not null and status <> 'herroepen' and now() < bedenktijd_tot from a), false),
    'herroep_tot', (select bedenktijd_tot from a where overeenkomst_op is not null and status <> 'herroepen' and now() < bedenktijd_tot),
    'proef_plus', exists (select 1 from public.proefmaanden where user_id = auth.uid() and plan = 'plus'),
    'proef_pro', exists (select 1 from public.proefmaanden where user_id = auth.uid() and plan = 'pro')
  );
$$;

-- Proefmaand starten, alleen met het vinkje "Laat mijn plan meteen starten".
-- Een lopende betaalde periode (betaald_plan, betaald_tot) blijft staan; die geldt weer na de proefmaand.
drop function if exists public.start_proef(text);
create or replace function public.start_proef(p_plan text, p_meteen boolean default false)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_nu json;
  v_tot timestamptz := now() + interval '1 month';
begin
  if v_user is null then raise exception 'niet ingelogd'; end if;
  if p_plan is null or p_plan not in ('plus', 'pro') then raise exception 'onbekend plan'; end if;
  if not coalesce(p_meteen, false) then return json_build_object('ok', false, 'reden', 'meteen_nodig'); end if;
  v_nu := public.mijn_abonnement();
  if v_nu->>'plan' = p_plan then return json_build_object('ok', false, 'reden', 'al_actief'); end if;
  if v_nu->>'plan' = 'pro' and p_plan = 'plus' then return json_build_object('ok', false, 'reden', 'al_hoger'); end if;
  if exists (select 1 from public.proefmaanden where user_id = v_user and plan = p_plan) then
    return json_build_object('ok', false, 'reden', 'al_gebruikt');
  end if;
  insert into public.proefmaanden (user_id, plan) values (v_user, p_plan);
  insert into public.abonnementen (user_id, plan, status, proef_tot, gestart_op, opgezegd_op, meteen_starten_op)
  values (v_user, p_plan, 'proef', v_tot, now(), null, now())
  on conflict (user_id) do update
    set betaald_plan = case when abonnementen.betaald_tot is not null then coalesce(abonnementen.betaald_plan, abonnementen.plan) else abonnementen.betaald_plan end,
        plan = excluded.plan, status = 'proef', proef_tot = excluded.proef_tot, gestart_op = now(), opgezegd_op = null,
        meteen_starten_op = now();
  return json_build_object('ok', true, 'plan', p_plan, 'geldig_tot', v_tot);
end;
$$;

-- Opzeggen: je houdt je plan tot de einddatum, daarna ben je weer Free. Na herroepen valt er niets meer op te zeggen.
create or replace function public.zeg_op()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tot timestamptz;
begin
  if auth.uid() is null then raise exception 'niet ingelogd'; end if;
  update public.abonnementen
    set status = 'opgezegd', opgezegd_op = now()
    where user_id = auth.uid() and status not in ('opgezegd', 'herroepen')
    returning greatest(coalesce(proef_tot, '-infinity'::timestamptz), coalesce(betaald_tot, '-infinity'::timestamptz)) into v_tot;
  return json_build_object('ok', v_tot is not null, 'geldig_tot', v_tot);
end;
$$;

-- Herroepen binnen de bedenktijd: het plan stopt meteen. Terugbetalen van de rest volgt via Mollie.
create or replace function public.herroep()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rij public.abonnementen%rowtype;
  v_op timestamptz := now();
begin
  if auth.uid() is null then raise exception 'niet ingelogd'; end if;
  select * into v_rij from public.abonnementen where user_id = auth.uid() for update;
  if not found or v_rij.overeenkomst_op is null or v_rij.status = 'herroepen' then
    return json_build_object('ok', false, 'reden', 'geen_bedenktijd');
  end if;
  if v_op >= public.herroep_tot(v_rij.overeenkomst_op) then
    return json_build_object('ok', false, 'reden', 'bedenktijd_voorbij');
  end if;
  update public.abonnementen
    set status = 'herroepen', herroepen_op = v_op, opgezegd_op = coalesce(opgezegd_op, v_op),
        proef_tot = case when proef_tot is null then null else least(proef_tot, v_op) end,
        betaald_tot = case when betaald_tot is null then null else least(betaald_tot, v_op) end
    where user_id = auth.uid();
  return json_build_object('ok', true, 'herroepen_op', v_op, 'plan', coalesce(v_rij.betaald_plan, v_rij.plan));
end;
$$;

-- Voor de Edge Function comit (service_role): dezelfde regel als mijn_abonnement.
create or replace function public.plan_van(p_user uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select public.plan_nu(plan, proef_tot, betaald_plan, betaald_tot) from public.abonnementen where user_id = p_user), 'free');
$$;

revoke all on function public.mijn_abonnement() from public;
revoke all on function public.start_proef(text, boolean) from public;
revoke all on function public.zeg_op() from public;
revoke all on function public.herroep() from public;
revoke all on function public.plan_van(uuid) from public, anon, authenticated;
grant execute on function public.mijn_abonnement() to authenticated;
grant execute on function public.start_proef(text, boolean) to authenticated;
grant execute on function public.zeg_op() to authenticated;
grant execute on function public.herroep() to authenticated;
grant execute on function public.plan_van(uuid) to service_role;

commit;

notify pgrst, 'reload schema';

-- Controle na het uitvoeren (als ingelogde gebruiker via de site): BES.plan(true) geeft nu ook daarna, kan_herroepen en herroep_tot.
