-- Betalen met Mollie (testmodus eerst). NOG NIET UITGEVOERD.
-- Eenmalig uitvoeren in de SQL-editor van Supabase, na abonnementen.sql en herroepen.sql. Mag vaker: alles is
-- "if not exists" of "create or replace".
--
-- Werking:
--   Een student start een proefmaand MET betaalgegevens. De Edge Function mollie maakt bij Mollie een klant en een
--   eerste betaling (sequenceType first): 0,02 euro als machtiging als de proefmaand van dat plan nog niet gebruikt is,
--   anders meteen de volle maandprijs. Is die betaling betaald, dan zet de Edge Function mollie-webhook het plan aan
--   (via mollie_verwerk hieronder) en maakt een maandelijks Mollie-abonnement dat na de proefmaand (of na de eerste
--   betaalde maand) begint. Elke maandbetaling verlengt betaald_tot met een maand.
--
-- Schakelaar: zolang 'betalen' in site_instellingen false is, blijft alles zoals vroeger (start_proef, zeg_op, herroep).
-- Staat hij aan, dan weigert start_proef (proefmaand alleen met machtiging). Een account dat via Mollie betaalde, zegt
-- altijd op en herroept via de Edge Function mollie (zeg_op en herroep weigeren dan met reden 'via_mollie').
-- Aanzetten:  update public.site_instellingen set waarde = true where sleutel = 'betalen';
-- Uitzetten:  update public.site_instellingen set waarde = false where sleutel = 'betalen';
--
-- Van testmodus naar echte betalingen: klant-, machtigings- en abonnementsnummers uit testmodus bestaan niet bij de
-- echte sleutel. Wis ze dan eenmalig:
--   update public.mollie_koppeling set klant_id = null, mandaat_id = null, abonnement_id = null;
--
-- De tabellen mollie_koppeling en betalingen schrijft alleen de service role (de Edge Functions). Een student mag
-- alleen zijn eigen rijen in betalingen lezen.

begin;

-- 1. De schakelaar.
insert into public.site_instellingen (sleutel, waarde) values ('betalen', false) on conflict (sleutel) do nothing;

-- Staat betalen met Mollie aan? Voor de pagina's (ook zonder account) en de Edge Function mollie.
create or replace function public.betalen_aan()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select waarde from public.site_instellingen where sleutel = 'betalen'), false);
$$;
revoke all on function public.betalen_aan() from public;
grant execute on function public.betalen_aan() to anon, authenticated, service_role;

-- 2. Koppeling tussen een account en Mollie: klant (cst_...), machtiging (mdt_...) en het lopende abonnement (sub_...).
-- abonnement_id blijft ook na opzeggen staan, zodat een maandbetaling die al onderweg was nog herkend wordt.
create table if not exists public.mollie_koppeling (
  user_id uuid primary key references auth.users (id) on delete cascade,
  klant_id text,
  mandaat_id text,
  abonnement_id text,
  plan text check (plan in ('plus', 'pro')),
  bijgewerkt timestamptz default now()
);
create index if not exists mollie_koppeling_klant on public.mollie_koppeling (klant_id);
alter table public.mollie_koppeling enable row level security;
revoke all on public.mollie_koppeling from anon, authenticated;
grant all on public.mollie_koppeling to service_role;

-- 3. Alle betalingen, met het Mollie-nummer (tr_...) als sleutel. Wordt bijgewerkt door de webhook (Mollie is de bron).
-- uitkomst (alleen voor de functies): wat een betaalde betaling deed. 'proef' of 'actief' = plan aangezet,
-- 'dubbel' = er liep al zo'n plan (wordt teruggestort), 'genegeerd' = maandbetaling van een oud abonnement of na herroepen.
create table if not exists public.betalingen (
  id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  plan text,
  soort text check (soort in ('eerste', 'maandelijks')),
  bedrag numeric(10,2),
  valuta text default 'EUR',
  status text,
  terugbetaald numeric(10,2) default 0,
  gemaakt_op timestamptz default now(),
  betaald_op timestamptz,
  bijgewerkt timestamptz default now()
);
alter table public.betalingen add column if not exists uitkomst text;
-- teruggeboekt: wat de student via zijn bank heeft teruggedraaid (chargeback, bijvoorbeeld een SEPA-incasso storneren).
alter table public.betalingen add column if not exists teruggeboekt numeric(10,2) default 0;
create index if not exists betalingen_user on public.betalingen (user_id, betaald_op);
alter table public.betalingen enable row level security;
revoke all on public.betalingen from anon, authenticated;
grant select on public.betalingen to authenticated;
grant all on public.betalingen to service_role;
drop policy if exists "eigen betalingen lezen" on public.betalingen;
create policy "eigen betalingen lezen" on public.betalingen
  for select to authenticated using (user_id = auth.uid());

-- Heeft dit account ooit via Mollie betaald (of loopt er een Mollie-abonnement)? Dan lopen opzeggen en herroepen
-- altijd via de Edge Function mollie, ook als de schakelaar weer uit staat: anders blijft Mollie maandelijks afschrijven.
create or replace function public.heeft_mollie(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user is not null and (
    exists (select 1 from public.betalingen where user_id = p_user and status = 'paid')
    or exists (select 1 from public.mollie_koppeling where user_id = p_user and abonnement_id is not null)
  );
$$;
revoke all on function public.heeft_mollie(uuid) from public, anon, authenticated;
grant execute on function public.heeft_mollie(uuid) to service_role;

-- Marge na het einde van een periode zolang er een Mollie-abonnement loopt (niet opgezegd of herroepen): een
-- maandbetaling via SEPA-incasso (machtiging uit iDEAL of Bancontact) is pas enkele werkdagen na de afschrijfdatum
-- betaald. Zo staat een betalende student in die dagen niet op Free. Zonder Mollie-abonnement: geen marge.
create or replace function public.mollie_marge(p_user uuid, p_status text)
returns interval
language sql
stable
security definer
set search_path = public
as $$
  select case when p_status in ('proef', 'actief')
      and exists (select 1 from public.mollie_koppeling where user_id = p_user and abonnement_id is not null)
    then interval '7 days' else interval '0' end;
$$;
revoke all on function public.mollie_marge(uuid, text) from public, anon, authenticated;
grant execute on function public.mollie_marge(uuid, text) to service_role;

-- 3b. Bestaande functies van herroepen.sql, aangepast voor Mollie.

-- Zoals in herroepen.sql, met de marge van mollie_marge en via_mollie (de pagina kiest daarmee de weg voor
-- opzeggen en herroepen). Zonder Mollie-abonnement is de uitkomst gelijk aan vroeger.
create or replace function public.mijn_abonnement()
returns json
language sql
stable
security definer
set search_path = public
as $$
  with a0 as (
    select ab.*, public.mollie_marge(ab.user_id, ab.status) as marge
    from public.abonnementen ab
    where ab.user_id = auth.uid()
  ),
  a as (
    select *,
      public.plan_nu(plan, proef_tot + marge, betaald_plan, betaald_tot + marge) as nu,
      case when proef_tot + marge > now() then plan end as proef_nu,
      case when betaald_tot + marge > now() then coalesce(betaald_plan, plan) end as betaald_nu,
      public.herroep_tot(overeenkomst_op) as bedenktijd_tot
    from a0
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
    'proef_pro', exists (select 1 from public.proefmaanden where user_id = auth.uid() and plan = 'pro'),
    'via_mollie', public.heeft_mollie(auth.uid())
  );
$$;

-- Voor de Edge Function comit (service_role): dezelfde regel als mijn_abonnement, ook met de marge.
create or replace function public.plan_van(p_user uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select public.plan_nu(plan, proef_tot + public.mollie_marge(user_id, status), betaald_plan, betaald_tot + public.mollie_marge(user_id, status))
    from public.abonnementen where user_id = p_user), 'free');
$$;

-- Proefmaand zonder betaalgegevens: kan niet meer zodra betalen met Mollie aanstaat (dan alleen via de Edge Function
-- mollie, met machtiging). Verder gelijk aan herroepen.sql.
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
  if public.betalen_aan() then return json_build_object('ok', false, 'reden', 'betalen_aan'); end if;
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

-- Opzeggen en herroepen voor een account (alleen service role, de Edge Function mollie stopt eerst bij Mollie).
create or replace function public.mollie_zeg_op(p_user uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tot timestamptz;
begin
  if p_user is null then raise exception 'niet ingelogd'; end if;
  update public.abonnementen
    set status = 'opgezegd', opgezegd_op = now()
    where user_id = p_user and status not in ('opgezegd', 'herroepen')
    returning greatest(coalesce(proef_tot, '-infinity'::timestamptz), coalesce(betaald_tot, '-infinity'::timestamptz)) into v_tot;
  return json_build_object('ok', v_tot is not null, 'geldig_tot', v_tot);
end;
$$;

create or replace function public.mollie_herroep(p_user uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rij public.abonnementen%rowtype;
  v_op timestamptz := now();
begin
  if p_user is null then raise exception 'niet ingelogd'; end if;
  select * into v_rij from public.abonnementen where user_id = p_user for update;
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
    where user_id = p_user;
  return json_build_object('ok', true, 'herroepen_op', v_op, 'plan', coalesce(v_rij.betaald_plan, v_rij.plan));
end;
$$;

-- zeg_op en herroep van de pagina zelf: weigeren als het account via Mollie betaalt (reden 'via_mollie'). Anders zegt de
-- database "opgezegd" terwijl Mollie blijft afschrijven. Verder gelijk aan herroepen.sql.
create or replace function public.zeg_op()
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'niet ingelogd'; end if;
  if public.heeft_mollie(auth.uid()) then return json_build_object('ok', false, 'reden', 'via_mollie'); end if;
  return public.mollie_zeg_op(auth.uid());
end;
$$;

create or replace function public.herroep()
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'niet ingelogd'; end if;
  if public.heeft_mollie(auth.uid()) then return json_build_object('ok', false, 'reden', 'via_mollie'); end if;
  return public.mollie_herroep(auth.uid());
end;
$$;

revoke all on function public.mijn_abonnement() from public;
revoke all on function public.start_proef(text, boolean) from public;
revoke all on function public.zeg_op() from public;
revoke all on function public.herroep() from public;
revoke all on function public.plan_van(uuid) from public, anon, authenticated;
revoke all on function public.mollie_zeg_op(uuid) from public, anon, authenticated;
revoke all on function public.mollie_herroep(uuid) from public, anon, authenticated;
grant execute on function public.mijn_abonnement() to authenticated;
grant execute on function public.start_proef(text, boolean) to authenticated;
grant execute on function public.zeg_op() to authenticated;
grant execute on function public.herroep() to authenticated;
grant execute on function public.plan_van(uuid) to service_role;
grant execute on function public.mollie_zeg_op(uuid) to service_role;
grant execute on function public.mollie_herroep(uuid) to service_role;

-- 4. Hulpfuncties, alleen voor de service role (Edge Functions mollie en mollie-webhook).

-- Mag dit account een betaling voor dit plan starten? Dezelfde regels als start_proef:
-- niet als je dat plan al hebt, niet Plus als je Pro hebt. proef = de proefmaand van dit plan is nog niet gebruikt.
create or replace function public.mollie_mag_starten(p_user uuid, p_plan text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_nu text;
  v_k public.mollie_koppeling%rowtype;
begin
  if p_user is null then return json_build_object('ok', false, 'reden', 'niet_ingelogd'); end if;
  if p_plan is null or p_plan not in ('plus', 'pro') then return json_build_object('ok', false, 'reden', 'onbekend_plan'); end if;
  select public.plan_nu(plan, proef_tot, betaald_plan, betaald_tot) into v_nu from public.abonnementen where user_id = p_user;
  v_nu := coalesce(v_nu, 'free');
  if v_nu = p_plan then return json_build_object('ok', false, 'reden', 'al_actief'); end if;
  if v_nu = 'pro' and p_plan = 'plus' then return json_build_object('ok', false, 'reden', 'al_hoger'); end if;
  select * into v_k from public.mollie_koppeling where user_id = p_user;
  return json_build_object(
    'ok', true,
    'proef', not exists (select 1 from public.proefmaanden where user_id = p_user and plan = p_plan),
    'klant_id', v_k.klant_id,
    'abonnement_id', v_k.abonnement_id,
    'abonnement_plan', v_k.plan
  );
end;
$$;

-- Een betaling van Mollie verwerken (de webhook roept dit bij elke melding aan, ook vaker voor dezelfde betaling).
-- Werkt de rij in betalingen bij en zet, alleen de eerste keer dat de betaling 'paid' wordt, in één keer het plan aan:
--   eerste + proef   -> status 'proef', proef_tot = nu + 1 maand, rij in proefmaanden (zoals start_proef)
--   eerste zonder    -> status 'actief', betaald_plan, betaald_tot = nu + 1 maand
--   maandelijks      -> status 'actief', betaald_tot = max(betaald_tot, betaald op) + 1 maand
-- Bij een eerste betaling: overeenkomst_op = nu (bedenktijd van 14 dagen) en meteen_starten_op als het vinkje aan stond.
-- mag_abonnement: of er bij deze eerste betaling (nog) een Mollie-abonnement hoort te komen.
-- Teruggeboekt (chargeback): de status bij Mollie blijft 'paid', alleen amountChargedBack verandert. De eerste keer
-- stopt het plan meteen (status 'opgezegd') en geeft de functie stop_abonnement = true, zodat de webhook het
-- Mollie-abonnement stopt.
drop function if exists public.mollie_verwerk(text, uuid, text, text, numeric, text, text, numeric, timestamptz, boolean, boolean, text, text, text);
create or replace function public.mollie_verwerk(
  p_id text,
  p_user uuid,
  p_plan text,
  p_soort text,
  p_bedrag numeric,
  p_valuta text,
  p_status text,
  p_terugbetaald numeric,
  p_teruggeboekt numeric,
  p_betaald_op timestamptz,
  p_proef boolean,
  p_meteen boolean,
  p_klant text,
  p_mandaat text,
  p_abonnement text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := p_user;
  v_oud text;
  v_uitkomst text;
  v_verwerkt text := 'geen';
  v_rij public.abonnementen%rowtype;
  v_k public.mollie_koppeling%rowtype;
  v_nu text;
  v_tot timestamptz := now() + interval '1 month';
  v_nieuwste text;
  v_mag boolean := false;
  v_oud_terug numeric;
  v_stop boolean := false;
begin
  if p_id is null or p_id !~ '^tr_[A-Za-z0-9]+$' then raise exception 'onbekende betaling'; end if;
  if p_soort is null or p_soort not in ('eerste', 'maandelijks') then raise exception 'onbekende soort'; end if;
  if p_plan is not null and p_plan not in ('plus', 'pro') then raise exception 'onbekend plan'; end if;

  -- Maandbetalingen: het account volgt uit de Mollie-klant, niet uit de metadata.
  if p_soort = 'maandelijks' and p_klant is not null then
    select user_id, coalesce(p_plan, plan) into v_user, p_plan from public.mollie_koppeling where klant_id = p_klant limit 1;
  end if;
  -- Account intussen gewist: de betaling blijft bewaard, zonder account.
  if v_user is not null and not exists (select 1 from auth.users where id = v_user) then v_user := null; end if;

  insert into public.betalingen (id, user_id, plan, soort, bedrag, valuta, status)
  values (p_id, v_user, p_plan, p_soort, p_bedrag, coalesce(p_valuta, 'EUR'), null)
  on conflict (id) do nothing;
  select status, uitkomst, coalesce(teruggeboekt, 0) into v_oud, v_uitkomst, v_oud_terug from public.betalingen where id = p_id for update;
  update public.betalingen
    set user_id = coalesce(user_id, v_user),
        plan = coalesce(p_plan, plan),
        soort = p_soort,
        bedrag = coalesce(p_bedrag, bedrag),
        valuta = coalesce(p_valuta, valuta),
        status = p_status,
        terugbetaald = greatest(coalesce(terugbetaald, 0), coalesce(p_terugbetaald, 0)),
        teruggeboekt = greatest(coalesce(teruggeboekt, 0), coalesce(p_teruggeboekt, 0)),
        betaald_op = coalesce(p_betaald_op, betaald_op),
        bijgewerkt = now()
    where id = p_id;

  if p_status = 'paid' and v_oud is distinct from 'paid' and v_user is not null and p_plan is not null then
    v_verwerkt := 'nieuw';
    select * into v_rij from public.abonnementen where user_id = v_user for update;
    v_nu := coalesce(public.plan_nu(v_rij.plan, v_rij.proef_tot, v_rij.betaald_plan, v_rij.betaald_tot), 'free');

    if p_soort = 'eerste' then
      if v_nu = p_plan or (v_nu = 'pro' and p_plan = 'plus')
         or (coalesce(p_proef, false) and exists (select 1 from public.proefmaanden where user_id = v_user and plan = p_plan)) then
        -- Er liep intussen al zo'n plan (bijvoorbeeld twee keer op de knop): niets aanzetten, de webhook stort terug.
        v_uitkomst := 'dubbel';
      elsif coalesce(p_proef, false) then
        insert into public.proefmaanden (user_id, plan) values (v_user, p_plan);
        insert into public.abonnementen (user_id, plan, status, proef_tot, gestart_op, opgezegd_op, overeenkomst_op, meteen_starten_op, herroepen_op)
        values (v_user, p_plan, 'proef', v_tot, now(), null, now(), case when p_meteen then now() end, null)
        on conflict (user_id) do update
          set betaald_plan = case when abonnementen.betaald_tot is not null then coalesce(abonnementen.betaald_plan, abonnementen.plan) else abonnementen.betaald_plan end,
              plan = excluded.plan, status = 'proef', proef_tot = excluded.proef_tot, gestart_op = now(), opgezegd_op = null,
              overeenkomst_op = now(), meteen_starten_op = excluded.meteen_starten_op, herroepen_op = null;
        v_uitkomst := 'proef';
      else
        -- Volle eerste maand. Een lopende proefmaand van een ander plan stopt (je stapt over).
        insert into public.abonnementen (user_id, plan, status, betaald_plan, betaald_tot, gestart_op, opgezegd_op, overeenkomst_op, meteen_starten_op, herroepen_op)
        values (v_user, p_plan, 'actief', p_plan, v_tot, now(), null, now(), case when p_meteen then now() end, null)
        on conflict (user_id) do update
          set proef_tot = case when abonnementen.proef_tot > now() then now() else abonnementen.proef_tot end,
              plan = excluded.plan, status = 'actief', betaald_plan = excluded.betaald_plan, betaald_tot = excluded.betaald_tot,
              gestart_op = now(), opgezegd_op = null, overeenkomst_op = now(),
              meteen_starten_op = excluded.meteen_starten_op, herroepen_op = null;
        v_uitkomst := 'actief';
      end if;

      if v_uitkomst in ('proef', 'actief') then
        insert into public.mollie_koppeling (user_id, klant_id, mandaat_id, plan, bijgewerkt)
        values (v_user, p_klant, p_mandaat, p_plan, now())
        on conflict (user_id) do update
          set klant_id = coalesce(excluded.klant_id, mollie_koppeling.klant_id),
              mandaat_id = coalesce(excluded.mandaat_id, mollie_koppeling.mandaat_id),
              plan = excluded.plan, bijgewerkt = now();
      end if;
    else
      -- Maandbetaling: alleen van het abonnement dat nu bij het account hoort, en niet na herroepen.
      select * into v_k from public.mollie_koppeling where user_id = v_user;
      -- Ook niet als de nieuwste eerste betaling via de bank is teruggeboekt: dan hoort dat abonnement al gestopt te zijn.
      if v_rij.user_id is null or v_rij.status = 'herroepen' or p_abonnement is null or p_abonnement is distinct from v_k.abonnement_id
         or coalesce((select b.teruggeboekt from public.betalingen b
                      where b.user_id = v_user and b.soort = 'eerste' and b.status = 'paid' and b.uitkomst in ('proef', 'actief')
                      order by b.betaald_op desc nulls last, b.gemaakt_op desc limit 1), 0) > 0 then
        v_uitkomst := 'genegeerd';
      else
        -- Verlengen vanaf het einde van de vorige periode (proefmaand of betaalde maand van dit plan), niet vanaf de
        -- betaaldatum: een SEPA-incasso is pas enkele dagen na de afschrijfdatum betaald, en zo schuift de periode niet
        -- elke maand op. Na een lange onderbreking telt de betaaldatum (min een week marge).
        update public.abonnementen
          set status = case when status = 'opgezegd' then 'opgezegd' else 'actief' end,
              betaald_plan = p_plan,
              betaald_tot = greatest(
                case when coalesce(betaald_plan, plan) = p_plan then coalesce(betaald_tot, '-infinity'::timestamptz) else '-infinity'::timestamptz end,
                case when plan = p_plan then coalesce(proef_tot, '-infinity'::timestamptz) else '-infinity'::timestamptz end,
                coalesce(p_betaald_op, now()) - interval '7 days'
              ) + interval '1 month'
          where user_id = v_user;
        v_uitkomst := 'actief';
      end if;
    end if;

    update public.betalingen set uitkomst = v_uitkomst where id = p_id;
  elsif v_oud = 'paid' then
    v_verwerkt := 'al';
  end if;

  -- Teruggeboekt via de bank, de eerste keer: een betaling die een plan aanzette of verlengde, stopt het plan meteen.
  if coalesce(p_teruggeboekt, 0) > 0 and v_oud_terug = 0 and v_user is not null and v_uitkomst in ('proef', 'actief') then
    update public.abonnementen
      set status = case when status = 'herroepen' then status else 'opgezegd' end,
          opgezegd_op = coalesce(opgezegd_op, now()),
          proef_tot = case when proef_tot is null then null else least(proef_tot, now()) end,
          betaald_tot = case when betaald_tot is null then null else least(betaald_tot, now()) end
      where user_id = v_user;
    v_stop := true;
  end if;
  -- Een latere melding van dezelfde terugboeking vraagt opnieuw om het Mollie-abonnement te stoppen (lukte dat de vorige
  -- keer niet, dan probeert Mollie het opnieuw), zolang er geen nieuwere eerste betaling met een eigen abonnement is.
  if not v_stop and greatest(coalesce(p_teruggeboekt, 0), v_oud_terug) > 0 and v_user is not null and v_uitkomst in ('proef', 'actief')
     and not exists (
       select 1 from public.betalingen b, public.betalingen h
       where h.id = p_id and b.user_id = v_user and b.id <> p_id and b.soort = 'eerste' and b.status = 'paid'
         and b.uitkomst in ('proef', 'actief')
         and coalesce(b.betaald_op, b.gemaakt_op) > coalesce(h.betaald_op, h.gemaakt_op)) then
    v_stop := true;
  end if;

  -- Hoort er bij deze eerste betaling (nog) een Mollie-abonnement? Alleen bij de nieuwste geslaagde eerste betaling,
  -- als het plan nog loopt (niet opgezegd of herroepen) en er niets is teruggestort.
  if p_soort = 'eerste' and p_status = 'paid' and v_uitkomst in ('proef', 'actief') and v_user is not null then
    select id into v_nieuwste from public.betalingen
      where user_id = v_user and soort = 'eerste' and status = 'paid' and uitkomst in ('proef', 'actief')
      order by betaald_op desc nulls last, gemaakt_op desc limit 1;
    select * into v_rij from public.abonnementen where user_id = v_user;
    v_mag := v_nieuwste = p_id and v_rij.status in ('proef', 'actief') and v_rij.plan = p_plan and v_rij.herroepen_op is null
      and coalesce((select coalesce(terugbetaald, 0) + coalesce(teruggeboekt, 0) from public.betalingen where id = p_id), 0) = 0;
  end if;

  select * into v_k from public.mollie_koppeling where user_id = v_user;
  return json_build_object(
    'verwerkt', v_verwerkt,
    'uitkomst', v_uitkomst,
    'mag_abonnement', coalesce(v_mag, false),
    'stop_abonnement', v_stop,
    'user_id', v_user,
    'klant_id', v_k.klant_id,
    'abonnement_id', v_k.abonnement_id
  );
end;
$$;

-- Voor herroepen: de betaalde betalingen van de huidige overeenkomst (vanaf de nieuwste geslaagde eerste betaling)
-- waarvan nog iets terug kan, en of het vinkje "Laat mijn plan meteen starten" aan stond.
create or replace function public.mollie_herroep_info(p_user uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with begin_ as (
    select betaald_op from public.betalingen
    where user_id = p_user and soort = 'eerste' and status = 'paid' and uitkomst in ('proef', 'actief')
    order by betaald_op desc nulls last, gemaakt_op desc limit 1
  )
  select json_build_object(
    -- Mag er nu herroepen worden (zelfde regel als mollie_herroep)? En is er al herroepen binnen de bedenktijd
    -- (dan mag de Edge Function het stoppen en terugbetalen bij Mollie opnieuw proberen)?
    'kan_herroepen', coalesce((select overeenkomst_op is not null and status <> 'herroepen' and now() < public.herroep_tot(overeenkomst_op)
      from public.abonnementen where user_id = p_user), false),
    'al_herroepen', coalesce((select status = 'herroepen' and herroepen_op is not null and overeenkomst_op is not null
        and herroepen_op < public.herroep_tot(overeenkomst_op)
      from public.abonnementen where user_id = p_user), false),
    'meteen', coalesce((select meteen_starten_op is not null from public.abonnementen where user_id = p_user), false),
    'herroepen_op', (select herroepen_op from public.abonnementen where user_id = p_user),
    'klant_id', (select klant_id from public.mollie_koppeling where user_id = p_user),
    'abonnement_id', (select abonnement_id from public.mollie_koppeling where user_id = p_user),
    'betalingen', coalesce((
      select json_agg(json_build_object(
          'id', b.id, 'soort', b.soort, 'plan', b.plan, 'bedrag', b.bedrag, 'valuta', b.valuta,
          'terugbetaald', coalesce(b.terugbetaald, 0), 'betaald_op', b.betaald_op, 'uitkomst', b.uitkomst
        ) order by b.betaald_op)
      from public.betalingen b
      where b.user_id = p_user and b.status = 'paid' and b.uitkomst in ('proef', 'actief')
        and b.betaald_op >= (select betaald_op from begin_)
        and b.bedrag > coalesce(b.terugbetaald, 0) + coalesce(b.teruggeboekt, 0)
    ), '[]'::json)
  );
$$;

-- Een terugbetaling bij Mollie is gelukt: optellen bij terugbetaald (nooit meer dan het bedrag).
create or replace function public.mollie_terug(p_id text, p_bedrag numeric)
returns void
language sql
security definer
set search_path = public
as $$
  update public.betalingen
    set terugbetaald = least(bedrag, coalesce(terugbetaald, 0) + greatest(coalesce(p_bedrag, 0), 0)), bijgewerkt = now()
    where id = p_id;
$$;

revoke all on function public.mollie_mag_starten(uuid, text) from public, anon, authenticated;
revoke all on function public.mollie_verwerk(text, uuid, text, text, numeric, text, text, numeric, numeric, timestamptz, boolean, boolean, text, text, text) from public, anon, authenticated;
revoke all on function public.mollie_herroep_info(uuid) from public, anon, authenticated;
revoke all on function public.mollie_terug(text, numeric) from public, anon, authenticated;
grant execute on function public.mollie_mag_starten(uuid, text) to service_role;
grant execute on function public.mollie_verwerk(text, uuid, text, text, numeric, text, text, numeric, numeric, timestamptz, boolean, boolean, text, text, text) to service_role;
grant execute on function public.mollie_herroep_info(uuid) to service_role;
grant execute on function public.mollie_terug(text, numeric) to service_role;

commit;

notify pgrst, 'reload schema';

-- Controle na het uitvoeren:
-- select public.betalen_aan();                          -- false tot je de schakelaar omzet
-- select * from public.betalingen order by gemaakt_op desc limit 20;
-- select * from public.mollie_koppeling;
