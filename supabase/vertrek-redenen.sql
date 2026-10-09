-- Eenmalig uitvoeren in de SQL-editor van Supabase (project Berie's Exam Space).
-- Tabel vertrek_redenen: waarom iemand zijn account wist. Alleen de reden en de datum, nooit een naam,
-- e-mailadres of gebruikers-id, zodat de lijst niet naar een persoon te herleiden is.

begin;

create table if not exists public.vertrek_redenen (
  id bigint generated always as identity primary key,
  reden text not null check (reden in ('klaar', 'gebruik-niet', 'te-weinig-vakken', 'werkt-niet', 'anders')),
  toelichting text check (char_length(toelichting) <= 500),
  gemaakt_op timestamptz not null default now()
);

alter table public.vertrek_redenen enable row level security;
revoke all on public.vertrek_redenen from anon, authenticated;
grant insert on public.vertrek_redenen to authenticated;

-- Schrijven mag, lezen niet: een student kan zijn reden insturen maar niemands antwoorden teruglezen.
drop policy if exists "reden insturen" on public.vertrek_redenen;
create policy "reden insturen" on public.vertrek_redenen for insert to authenticated with check (true);

-- Alleen beheerders (zie account-en-beheer.sql) lezen de lijst.
drop policy if exists "beheerder leest redenen" on public.vertrek_redenen;
create policy "beheerder leest redenen" on public.vertrek_redenen for select to authenticated using (public.is_beheerder());
grant select on public.vertrek_redenen to authenticated;

commit;
