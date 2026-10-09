-- Eenmalig uitvoeren in de SQL-editor van Supabase (project Berie's Exam Space).
-- Voor de lancering: de nieuwe site is dicht. Alleen beheerders (tabel beheerders) en accounts in de tabel toegang
-- komen binnen. Openen bij de lancering is één regel:
--   update public.site_instellingen set waarde = true where sleutel = 'open';
-- en daarna in Supabase bij Authentication het aanmelden van nieuwe accounts weer aanzetten.

begin;

create table if not exists public.site_instellingen (
  sleutel text primary key,
  waarde boolean not null
);
alter table public.site_instellingen enable row level security;
revoke all on public.site_instellingen from anon, authenticated;
insert into public.site_instellingen (sleutel, waarde) values ('open', false) on conflict (sleutel) do nothing;

create table if not exists public.toegang (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sinds timestamptz not null default now()
);
alter table public.toegang enable row level security;
revoke all on public.toegang from anon, authenticated;

-- Is de site open voor iedereen? (Ook zonder account te vragen, voor de aanmeldpagina.)
create or replace function public.site_open()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select waarde from public.site_instellingen where sleutel = 'open'), false);
$$;
revoke all on function public.site_open() from public;
grant execute on function public.site_open() to anon, authenticated;

-- Mag dit ingelogde account binnen?
create or replace function public.heeft_toegang()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.site_open()
      or exists (select 1 from public.beheerders where user_id = auth.uid())
      or exists (select 1 from public.toegang where user_id = auth.uid());
$$;
revoke all on function public.heeft_toegang() from public, anon;
grant execute on function public.heeft_toegang() to authenticated;

commit;
