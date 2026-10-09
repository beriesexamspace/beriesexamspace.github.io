-- Beheer-overzicht: één functie met alles wat de beheerder wil zien. Geeft null voor wie geen beheerder is.
-- Per account (de laatste 500) naam, e-mailadres, plan en hoeveel er geoefend is, op vraag van Berat (26-09-2026);
-- nooit Comit-gesprekken of antwoorden op vragen. Feedbacktekst ingekort.
-- Uitgevoerd in de SQL-editor van Supabase op 26-09-2026 (daarna opnieuw met de accountgegevens).
-- 04-10-2026: per account ook 'over' (Over jezelf: studie, jaar, tekst, openbaar). Uitgevoerd op 05-10-2026.

create or replace function public.beheer_overzicht()
returns json
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_vandaag date := (now() at time zone 'Europe/Brussels')::date;
  v_uit json;
begin
  if not public.is_beheerder() then return null; end if;

  select json_build_object(
    'accounts', json_build_object(
      'totaal', (select count(*) from auth.users),
      'vandaag', (select count(*) from auth.users where (created_at at time zone 'Europe/Brussels')::date = v_vandaag),
      'week', (select count(*) from auth.users where created_at >= now() - interval '7 days'),
      'actief_week', (select count(distinct user_id) from public.sessies where gemaakt_op >= now() - interval '7 days'),
      'per_dag', (
        select coalesce(json_agg(json_build_object('dag', d::date, 'nieuw', (
          select count(*) from auth.users u where (u.created_at at time zone 'Europe/Brussels')::date = d::date
        )) order by d), '[]'::json)
        from generate_series(v_vandaag - 13, v_vandaag, interval '1 day') as d
      ),
      'nieuwste', (
        select coalesce(json_agg(json_build_object(
          'email', x.email,
          'naam', coalesce(
            nullif(trim(concat_ws(' ', x.raw_user_meta_data->>'voornaam', x.raw_user_meta_data->>'achternaam')), ''),
            nullif(trim(x.raw_user_meta_data->>'naam'), ''),
            nullif(trim(x.raw_user_meta_data->>'full_name'), ''),
            nullif(trim(x.raw_user_meta_data->>'name'), '')
          ),
          'bijnaam', nullif(trim(x.raw_user_meta_data->>'bijnaam'), ''),
          -- Alleen de vier bekende velden, ingekort: user_metadata kan iedereen voor zijn eigen account zelf schrijven.
          'over', case when jsonb_typeof(x.raw_user_meta_data->'over') = 'object' then jsonb_build_object(
            'studie', left(x.raw_user_meta_data->'over'->>'studie', 60),
            'jaar', left(x.raw_user_meta_data->'over'->>'jaar', 10),
            'tekst', left(x.raw_user_meta_data->'over'->>'tekst', 300),
            'openbaar', coalesce(x.raw_user_meta_data->'over'->'openbaar' = 'true'::jsonb, false)
          ) end,
          'gemaakt', x.created_at,
          'laatst_ingelogd', x.last_sign_in_at,
          'bevestigd', x.email_confirmed_at is not null,
          'via', coalesce(x.raw_app_meta_data->'providers', jsonb_build_array(coalesce(x.raw_app_meta_data->>'provider', 'email'))),
          'plan', public.plan_van(x.id),
          'plan_status', a.status,
          'plan_tot', greatest(a.proef_tot, a.betaald_tot),
          'rondes', (select count(*) from public.sessies s where s.user_id = x.id),
          'vragen', (select coalesce(sum(s.totaal), 0) from public.sessies s where s.user_id = x.id),
          'score', (select case when sum(s.totaal) > 0 then round(100.0 * sum(s.goed) / sum(s.totaal)) end from public.sessies s where s.user_id = x.id),
          'laatst_geoefend', (select max(s.gemaakt_op) from public.sessies s where s.user_id = x.id),
          'comit_vragen', (select coalesce(sum(c.aantal), 0) from public.comit_gebruik c where c.user_id = x.id),
          'open_fouten', (select count(*) from public.fouten f where f.user_id = x.id and not f.opgelost),
          'beheerder', exists (select 1 from public.beheerders b where b.user_id = x.id)
        ) order by x.created_at desc), '[]'::json)
        from (select id, email, created_at, last_sign_in_at, email_confirmed_at, raw_user_meta_data, raw_app_meta_data from auth.users order by created_at desc limit 500) as x
        left join public.abonnementen a on a.user_id = x.id
      )
    ),
    'plannen', json_build_object(
      'plus', (select count(*) from public.abonnementen a where a.plan = 'plus' and greatest(coalesce(a.proef_tot, '-infinity'::timestamptz), coalesce(a.betaald_tot, '-infinity'::timestamptz)) > now()),
      'pro', (select count(*) from public.abonnementen a where a.plan = 'pro' and greatest(coalesce(a.proef_tot, '-infinity'::timestamptz), coalesce(a.betaald_tot, '-infinity'::timestamptz)) > now()),
      'in_proef', (select count(*) from public.abonnementen a where a.status = 'proef' and a.proef_tot > now()),
      'betaald', (select count(*) from public.abonnementen a where a.betaald_tot > now()),
      'opgezegd', (select count(*) from public.abonnementen a where a.status = 'opgezegd' and greatest(coalesce(a.proef_tot, '-infinity'::timestamptz), coalesce(a.betaald_tot, '-infinity'::timestamptz)) > now()),
      'proeven_plus', (select count(*) from public.proefmaanden p where p.plan = 'plus'),
      'proeven_pro', (select count(*) from public.proefmaanden p where p.plan = 'pro')
    ),
    'oefenen', json_build_object(
      'sessies_week', (select count(*) from public.sessies where gemaakt_op >= now() - interval '7 days'),
      'vragen_week', (select coalesce(sum(totaal), 0) from public.sessies where gemaakt_op >= now() - interval '7 days'),
      'score_week', (select case when sum(totaal) > 0 then round(100.0 * sum(goed) / sum(totaal)) end from public.sessies where gemaakt_op >= now() - interval '7 days'),
      'top_vakken', (
        select coalesce(json_agg(json_build_object('vak', t.vak, 'sessies', t.n) order by t.n desc), '[]'::json)
        from (select vak, count(*) as n from public.sessies where gemaakt_op >= now() - interval '30 days' group by vak order by n desc limit 6) as t
      ),
      'open_fouten', (select count(*) from public.fouten where not opgelost),
      'examens', (select count(*) from public.examendata)
    ),
    'comit', json_build_object(
      'vandaag', (select coalesce(sum(aantal), 0) from public.comit_gebruik where dag = v_vandaag),
      'week', (select coalesce(sum(aantal), 0) from public.comit_gebruik where dag >= v_vandaag - 6),
      'mensen_week', (select count(distinct user_id) from public.comit_gebruik where dag >= v_vandaag - 6)
    ),
    'feedback', json_build_object(
      'week', (select count(*) from public.feedback where gemaakt >= now() - interval '7 days'),
      'totaal', (select count(*) from public.feedback),
      'nieuwste', (
        select coalesce(json_agg(json_build_object('soort', f.soort, 'vak', f.vak, 'tekst', left(f.tekst, 300), 'gemaakt', f.gemaakt) order by f.gemaakt desc), '[]'::json)
        from (select soort, vak, tekst, gemaakt from public.feedback order by gemaakt desc limit 5) as f
      )
    ),
    'boeken', json_build_object(
      'te_koop', (select count(*) from public.boeken where not verkocht and verloopt > now()),
      'verkocht', (select count(*) from public.boeken where verkocht),
      'meldingen', (
        select coalesce(json_agg(json_build_object(
          'boek_id', m.boek_id, 'titel', m.titel, 'reden', m.reden, 'gemaakt', m.gemaakt
        ) order by m.gemaakt desc, m.id desc), '[]'::json)
        from (
          select bm.id, bm.boek_id, b.titel, bm.reden, bm.gemaakt
          from public.boek_meldingen bm join public.boeken b on b.id = bm.boek_id
          order by bm.gemaakt desc, bm.id desc limit 10
        ) as m
      )
    ),
    'vertrek', (select coalesce(json_object_agg(v.reden, v.n), '{}'::json) from (select reden, count(*) as n from public.vertrek_redenen group by reden) as v)
  ) into v_uit;
  return v_uit;
end;
$$;

revoke all on function public.beheer_overzicht() from public, anon;
grant execute on function public.beheer_overzicht() to authenticated;
