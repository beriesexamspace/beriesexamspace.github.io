-- Foutenlijst (Plus en Pro): welke vragen iemand fout had, per vak, om ze gericht weg te werken.
-- Per vraag alleen een korte sleutel (hash van de vraagtekst), het hoofdstuk, hoe vaak fout en of hij intussen goed is beantwoord.
-- Lezen en wissen mag je alleen je eigen rijen; schrijven loopt via fouten_bijwerken (controleert het plan).
-- Uitgevoerd in de SQL-editor van Supabase op 26-09-2026.

create table if not exists public.fouten (
  user_id uuid not null references auth.users (id) on delete cascade,
  vak text not null check (char_length(vak) <= 40),
  sleutel text not null check (char_length(sleutel) <= 40),
  hoofdstuk text check (char_length(hoofdstuk) <= 40),
  keer_fout int not null default 1,
  laatst_fout timestamptz not null default now(),
  opgelost boolean not null default false,
  primary key (user_id, vak, sleutel)
);

alter table public.fouten enable row level security;
revoke all on public.fouten from anon, authenticated;
grant select, delete on public.fouten to authenticated;
drop policy if exists "eigen fouten lezen" on public.fouten;
create policy "eigen fouten lezen" on public.fouten for select to authenticated using (user_id = auth.uid());
drop policy if exists "eigen fouten wissen" on public.fouten;
create policy "eigen fouten wissen" on public.fouten for delete to authenticated using (user_id = auth.uid());

-- Na een ronde: p_fout = [{"s": sleutel, "h": hoofdstuk}, ...] voor foute antwoorden, p_goed = sleutels van goede antwoorden.
-- Geeft het aantal open fouten in dit vak terug, of null zonder Plus of Pro (dan wordt niets bewaard).
create or replace function public.fouten_bijwerken(p_vak text, p_fout jsonb, p_goed text[])
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_aantal int;
begin
  if v_user is null then raise exception 'niet ingelogd'; end if;
  if (public.mijn_abonnement()->>'plan') = 'free' then return null; end if;
  if p_vak is null or char_length(p_vak) = 0 or char_length(p_vak) > 40 then raise exception 'onbekend vak'; end if;

  insert into public.fouten (user_id, vak, sleutel, hoofdstuk)
  select distinct on (left(e->>'s', 40)) v_user, p_vak, left(e->>'s', 40), left(e->>'h', 40)
  from jsonb_array_elements(case when jsonb_typeof(p_fout) = 'array' then p_fout else '[]'::jsonb end) as e
  where coalesce(e->>'s', '') <> ''
  limit 100
  on conflict (user_id, vak, sleutel) do update
    set keer_fout = fouten.keer_fout + 1, laatst_fout = now(), opgelost = false, hoofdstuk = excluded.hoofdstuk;

  update public.fouten
    set opgelost = true
    where user_id = v_user and vak = p_vak and not opgelost and sleutel = any(coalesce(p_goed, '{}'::text[]));

  select count(*) into v_aantal from public.fouten where user_id = v_user and vak = p_vak and not opgelost;
  return v_aantal;
end;
$$;

revoke all on function public.fouten_bijwerken(text, jsonb, text[]) from public;
grant execute on function public.fouten_bijwerken(text, jsonb, text[]) to authenticated;
