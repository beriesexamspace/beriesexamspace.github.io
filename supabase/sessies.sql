-- Eenmalig uitvoeren in de SQL-editor van Supabase.
-- Tabel sessies: één rij per afgeronde oefenronde (training of simulatie), voor de inzichten van de student.
-- Alleen de eigen rijen zijn leesbaar en schrijfbaar; geen antwoorden per vraag, alleen de score.

begin;

create table if not exists public.sessies (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  vak text not null,
  niveau text not null default 'normaal',
  modus text not null,
  goed integer not null check (goed >= 0),
  totaal integer not null check (totaal > 0 and totaal <= 500),
  gemaakt_op timestamptz not null default now()
);
create index if not exists sessies_gebruiker_datum on public.sessies (user_id, gemaakt_op desc);

alter table public.sessies enable row level security;
revoke all on public.sessies from anon, authenticated;
grant select, insert on public.sessies to authenticated;
drop policy if exists "eigen sessies lezen" on public.sessies;
create policy "eigen sessies lezen" on public.sessies for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "eigen sessies schrijven" on public.sessies;
create policy "eigen sessies schrijven" on public.sessies for insert to authenticated with check ((select auth.uid()) = user_id and modus in ('training', 'simulatie') and goed <= totaal);

-- Account wissen neemt de sessies mee (cascade); de functie account_verwijderen hoeft niet te veranderen.

commit;
