-- Hard mode-vragen alleen voor Plus en Pro (11-10-2026).
-- De Hard mode-vragen stonden in de openbare data.js van elk vak, dus iedereen kon ze lezen. Nu staan ze in deze tabel;
-- data.js heeft alleen nog hardPerHoofdstuk (het aantal per hoofdstuk, voor de keuzes op de vakpagina).
-- Stap 1: dit bestand uitvoeren. Stap 2: hard-vragen-data.sql uitvoeren (gemaakt door supabase/maak-hard-vragen.js).

create table if not exists public.hard_vragen (
  vak text primary key,
  vragen jsonb not null,
  bijgewerkt timestamptz not null default now()
);
alter table public.hard_vragen enable row level security;
revoke all on public.hard_vragen from anon, authenticated;

-- De Hard mode-vragen van één vak, alleen voor een ingelogd account met Plus of Pro; anders null.
create or replace function public.hard_vragen_voor(p_vak text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select v.vragen
  from public.hard_vragen v
  where v.vak = p_vak
    and auth.uid() is not null
    and public.plan_van(auth.uid()) in ('plus', 'pro');
$$;
revoke all on function public.hard_vragen_voor(text) from public, anon;
grant execute on function public.hard_vragen_voor(text) to authenticated;
