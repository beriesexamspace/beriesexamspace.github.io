-- Alles open (besluit 12-10-2026): voorlopig geen abonnementen. Eerst groeien (meer scholen, meer studenten),
-- later eventueel een goedkoop abonnement. Zolang 'alles_open' aanstaat, krijgt iedereen Pro: mijn_abonnement en
-- plan_van geven 'pro' terug, dus Hard mode, foutenlijst, weekoverzicht, klaar-meter, examenplan en Comit zijn open.
-- Betalen met Mollie gaat uit. De oude regels blijven bewaard in mijn_abonnement_betaald en plan_van_betaald.
--
-- Eenmalig uitvoeren in de SQL-editor van Supabase, na mollie.sql.
-- Terug naar abonnementen:
--   update public.site_instellingen set waarde = false where sleutel = 'alles_open';
--   update public.site_instellingen set waarde = true where sleutel = 'betalen';

begin;

insert into public.site_instellingen (sleutel, waarde) values ('alles_open', true)
  on conflict (sleutel) do update set waarde = true;
update public.site_instellingen set waarde = false where sleutel = 'betalen';

-- Staat alles open? Ook zonder account te vragen (voor de abonnementspagina).
create or replace function public.alles_open()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select waarde from public.site_instellingen where sleutel = 'alles_open'), false);
$$;
revoke all on function public.alles_open() from public;
grant execute on function public.alles_open() to anon, authenticated, service_role;

-- De regels van mollie.sql, ongewijzigd, onder een nieuwe naam.
create or replace function public.mijn_abonnement_betaald()
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
revoke all on function public.mijn_abonnement_betaald() from public, anon, authenticated;

create or replace function public.plan_van_betaald(p_user uuid)
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
revoke all on function public.plan_van_betaald(uuid) from public, anon, authenticated;

-- Dezelfde namen als altijd (de site, fouten.sql, examendata.sql, hard-vragen.sql en de Edge Function comit
-- gebruiken ze), maar met alles open altijd Pro.
create or replace function public.mijn_abonnement()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select case when public.alles_open()
    then (public.mijn_abonnement_betaald()::jsonb
          || jsonb_build_object('plan', 'pro', 'status', null, 'geldig_tot', null, 'daarna', null, 'alles_open', true))::json
    else public.mijn_abonnement_betaald()
  end;
$$;

create or replace function public.plan_van(p_user uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case when public.alles_open() then 'pro' else public.plan_van_betaald(p_user) end;
$$;

commit;
