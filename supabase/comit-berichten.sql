-- Eenmalig uitvoeren in de SQL-editor van Supabase (project Berie's Exam Space).
-- Geschiedenis van Comit: elk bericht van de student en elk antwoord van Comit, per gesprek.
-- Alleen de student zelf kan zijn berichten lezen, toevoegen en wissen. Wis je je account, dan zijn ze weg.
-- Per student blijven de laatste 1000 berichten bewaard; oudere vallen er vanzelf af.

begin;

create table if not exists public.comit_berichten (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  gesprek uuid not null,
  rol text not null check (rol in ('student', 'comit')),
  tekst text not null check (char_length(tekst) between 1 and 4000),
  knoppen jsonb check (knoppen is null or (jsonb_typeof(knoppen) = 'array' and jsonb_array_length(knoppen) <= 8)),
  gemaakt timestamptz not null default now()
);

create index if not exists comit_berichten_user_gemaakt on public.comit_berichten (user_id, gemaakt desc);

alter table public.comit_berichten enable row level security;
revoke all on public.comit_berichten from anon, authenticated;
grant select, insert, delete on public.comit_berichten to authenticated;

drop policy if exists "eigen berichten lezen" on public.comit_berichten;
create policy "eigen berichten lezen" on public.comit_berichten for select to authenticated using (user_id = auth.uid());
drop policy if exists "eigen berichten toevoegen" on public.comit_berichten;
create policy "eigen berichten toevoegen" on public.comit_berichten for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "eigen berichten wissen" on public.comit_berichten;
create policy "eigen berichten wissen" on public.comit_berichten for delete to authenticated using (user_id = auth.uid());

-- Houdt per student alleen de laatste 1000 berichten.
create or replace function public.comit_berichten_inkorten()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.comit_berichten
  where user_id = new.user_id
    and id in (
      select id from public.comit_berichten
      where user_id = new.user_id
      order by gemaakt desc
      offset 1000
    );
  return null;
end;
$$;

revoke all on function public.comit_berichten_inkorten() from public, anon, authenticated;

drop trigger if exists comit_berichten_inkorten on public.comit_berichten;
create trigger comit_berichten_inkorten after insert on public.comit_berichten
  for each row execute function public.comit_berichten_inkorten();

commit;
