-- Examenplan (Pro): per student en per vak de datum van het examen, om een plan tot die dag te maken.
-- Iedereen leest en wijzigt alleen zijn eigen rijen; opslaan kan alleen met Pro (controle in de policy).
-- Uitgevoerd in de SQL-editor van Supabase op 26-09-2026.

create table if not exists public.examendata (
  user_id uuid not null references auth.users (id) on delete cascade,
  vak text not null check (char_length(vak) <= 40),
  datum date not null,
  bijgewerkt timestamptz not null default now(),
  primary key (user_id, vak)
);

alter table public.examendata enable row level security;
revoke all on public.examendata from anon, authenticated;
grant select, insert, update, delete on public.examendata to authenticated;

drop policy if exists "eigen examendata lezen" on public.examendata;
create policy "eigen examendata lezen" on public.examendata for select to authenticated using (user_id = auth.uid());
drop policy if exists "eigen examendata wissen" on public.examendata;
create policy "eigen examendata wissen" on public.examendata for delete to authenticated using (user_id = auth.uid());
drop policy if exists "examendata toevoegen met pro" on public.examendata;
create policy "examendata toevoegen met pro" on public.examendata for insert to authenticated
  with check (user_id = auth.uid() and public.mijn_abonnement()->>'plan' = 'pro');
drop policy if exists "examendata wijzigen met pro" on public.examendata;
create policy "examendata wijzigen met pro" on public.examendata for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.mijn_abonnement()->>'plan' = 'pro');
