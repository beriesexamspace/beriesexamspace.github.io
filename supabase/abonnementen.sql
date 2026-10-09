-- Abonnementen: welk plan iemand heeft (Plus of Pro) en tot wanneer.
-- Nu alleen de proefmaand van 1 maand, zonder betaalgegevens. Mollie vult later betaald_tot aan.
-- De tabellen zijn niet rechtstreeks te lezen of te schrijven; alles loopt via de functies hieronder.
-- Uitgevoerd in de SQL-editor van Supabase op 25-09-2026.

create table if not exists public.abonnementen (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null check (plan in ('plus', 'pro')),
  status text not null default 'proef' check (status in ('proef', 'actief', 'opgezegd')),
  proef_tot timestamptz,
  betaald_tot timestamptz,
  gestart_op timestamptz not null default now(),
  opgezegd_op timestamptz
);

-- Elke proefmaand maar één keer per account en per plan.
create table if not exists public.proefmaanden (
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null check (plan in ('plus', 'pro')),
  gestart_op timestamptz not null default now(),
  primary key (user_id, plan)
);

alter table public.abonnementen enable row level security;
alter table public.proefmaanden enable row level security;
revoke all on public.abonnementen from anon, authenticated;
revoke all on public.proefmaanden from anon, authenticated;

-- Het plan dat nu geldt: 'free', 'plus' of 'pro', met status en einddatum, en welke proefmaanden al gebruikt zijn.
create or replace function public.mijn_abonnement()
returns json
language sql
stable
security definer
set search_path = public
as $$
  with a as (
    select plan, status,
      greatest(coalesce(proef_tot, '-infinity'::timestamptz), coalesce(betaald_tot, '-infinity'::timestamptz)) as geldig_tot
    from public.abonnementen
    where user_id = auth.uid()
  )
  select json_build_object(
    'plan', coalesce((select plan from a where geldig_tot > now()), 'free'),
    'status', (select status from a where geldig_tot > now()),
    'geldig_tot', (select geldig_tot from a where geldig_tot > now()),
    'proef_plus', exists (select 1 from public.proefmaanden where user_id = auth.uid() and plan = 'plus'),
    'proef_pro', exists (select 1 from public.proefmaanden where user_id = auth.uid() and plan = 'pro')
  );
$$;

-- Proefmaand starten. Van Plus naar Pro mag; terug van Pro naar Plus niet zolang Pro loopt.
create or replace function public.start_proef(p_plan text)
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
  v_nu := public.mijn_abonnement();
  if v_nu->>'plan' = p_plan then return json_build_object('ok', false, 'reden', 'al_actief'); end if;
  if v_nu->>'plan' = 'pro' and p_plan = 'plus' then return json_build_object('ok', false, 'reden', 'al_hoger'); end if;
  if exists (select 1 from public.proefmaanden where user_id = v_user and plan = p_plan) then
    return json_build_object('ok', false, 'reden', 'al_gebruikt');
  end if;
  insert into public.proefmaanden (user_id, plan) values (v_user, p_plan);
  insert into public.abonnementen (user_id, plan, status, proef_tot, gestart_op, opgezegd_op)
  values (v_user, p_plan, 'proef', v_tot, now(), null)
  on conflict (user_id) do update
    set plan = excluded.plan, status = 'proef', proef_tot = excluded.proef_tot, gestart_op = now(), opgezegd_op = null;
  return json_build_object('ok', true, 'plan', p_plan, 'geldig_tot', v_tot);
end;
$$;

-- Opzeggen: je houdt je plan tot de einddatum, daarna ben je weer Free.
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
    where user_id = auth.uid() and status <> 'opgezegd'
    returning greatest(coalesce(proef_tot, '-infinity'::timestamptz), coalesce(betaald_tot, '-infinity'::timestamptz)) into v_tot;
  return json_build_object('ok', v_tot is not null, 'geldig_tot', v_tot);
end;
$$;

revoke all on function public.mijn_abonnement() from public;
revoke all on function public.start_proef(text) from public;
revoke all on function public.zeg_op() from public;
grant execute on function public.mijn_abonnement() to authenticated;
grant execute on function public.start_proef(text) to authenticated;
grant execute on function public.zeg_op() to authenticated;

-- Controle na het uitvoeren:
-- select count(*) from public.abonnementen;
-- Een proefmaand van één account terugzetten (alleen voor testen):
-- delete from public.proefmaanden where user_id = '<id>'; delete from public.abonnementen where user_id = '<id>';

-- Voor de Edge Function comit (service_role): het plan van een student, voor het maximum aantal vragen per dag
-- en om ezelsbruggetjes alleen aan Pro te geven. Uitgevoerd op 26-09-2026.
create or replace function public.plan_van(p_user uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select plan from public.abonnementen
    where user_id = p_user
      and greatest(coalesce(proef_tot, '-infinity'::timestamptz), coalesce(betaald_tot, '-infinity'::timestamptz)) > now()
  ), 'free');
$$;
revoke all on function public.plan_van(uuid) from public, anon, authenticated;
grant execute on function public.plan_van(uuid) to service_role;
