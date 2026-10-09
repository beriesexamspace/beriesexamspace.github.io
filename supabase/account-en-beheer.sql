-- Eenmalig uitvoeren in de SQL-editor van Supabase (project Berie's Exam Space).
-- 1. account_verwijderen(): de ingelogde gebruiker wist zijn eigen account, inclusief voortgang,
--    feedback, studieactiviteit (cascade) en de profielfoto in de bucket avatars.
-- 2. beheerders + studie_dagcijfers(): alleen voor de eigenaar, telt per dag hoeveel accounts oefenden.
--    Alleen aantallen, nooit namen of e-mailadressen.

begin;

create or replace function public.account_verwijderen()
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  eigenaar uuid := auth.uid();
begin
  if eigenaar is null then
    raise exception 'Niet ingelogd' using errcode = '42501';
  end if;
  -- Boekfoto's eerst via de Storage API wissen, inclusief losse uploads en
  -- foto's van eerder door beheer verwijderde advertenties. Een SQL DELETE
  -- wist alleen metadata, niet het bestand in de onderliggende opslag:
  -- https://supabase.com/docs/guides/storage/schema/design
  -- Vereist de voorbereidende Storage-opruiming op account-wissen.html.
  if exists (
    select 1 from storage.objects
    where bucket_id = 'boekfotos' and (storage.foldername(name))[1] = eigenaar::text
  ) then
    raise exception 'Wis eerst je boekfoto''s en probeer opnieuw.' using errcode = '23514';
  end if;
  delete from storage.objects
    where bucket_id = 'avatars'
      and (owner = eigenaar or name = eigenaar::text || '.jpg' or name like eigenaar::text || '/%');
  delete from public.voortgang where user_id = eigenaar;
  delete from public.feedback where user_id = eigenaar;
  delete from public.studieactiviteit where user_id = eigenaar;
  delete from auth.users where id = eigenaar;
end;
$$;

revoke all on function public.account_verwijderen() from public, anon;
grant execute on function public.account_verwijderen() to authenticated;

-- Beheerders: alleen de gebruikers-id's die de dagcijfers mogen zien. Vul via Table Editor (geen e-mail in code).
create table if not exists public.beheerders (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sinds timestamptz not null default now()
);
alter table public.beheerders enable row level security;
revoke all on public.beheerders from anon, authenticated;

create or replace function public.is_beheerder()
returns boolean
language sql security definer set search_path = ''
stable
as $$
  select exists (select 1 from public.beheerders where user_id = auth.uid());
$$;
revoke all on function public.is_beheerder() from public, anon;
grant execute on function public.is_beheerder() to authenticated;

-- Per dag: hoeveel verschillende accounts hebben geoefend (minstens 1 minuut leertijd of 1 bezoek).
create or replace function public.studie_dagcijfers(p_dagen integer default 30)
returns table (dag date, oefenaars integer, leertijd_min integer)
language sql security definer set search_path = ''
stable
as $$
  select d::date as dag,
         coalesce(count(distinct s.user_id), 0)::integer as oefenaars,
         coalesce(round(sum(s.leertijd_ms) / 60000.0), 0)::integer as leertijd_min
  from generate_series(current_date - (greatest(1, least(coalesce(p_dagen, 30), 365)) - 1), current_date, interval '1 day') as d
  left join public.studieactiviteit s on s.dag = d::date and (s.leertijd_ms >= 60000 or s.bezoeken >= 1)
  where public.is_beheerder()
  group by d
  order by d;
$$;
revoke all on function public.studie_dagcijfers(integer) from public, anon;
grant execute on function public.studie_dagcijfers(integer) to authenticated;

-- Totalen: aantal accounts en aantal accounts dat ooit oefende.
create or replace function public.studie_totalen()
returns table (accounts integer, ooit_geoefend integer, laatste_7_dagen integer)
language sql security definer set search_path = ''
stable
as $$
  select (select count(*) from auth.users)::integer as accounts,
         (select count(distinct user_id) from public.studieactiviteit)::integer as ooit_geoefend,
         (select count(distinct user_id) from public.studieactiviteit where dag >= current_date - 6)::integer as laatste_7_dagen
  where public.is_beheerder();
$$;
revoke all on function public.studie_totalen() from public, anon;
grant execute on function public.studie_totalen() to authenticated;

commit;
