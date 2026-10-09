-- Eenmalig uitvoeren in de SQL-editor van Supabase (project Berie's Exam Space).
-- Teller voor Comit: hoeveel vragen een student per dag aan de AI stelde. Alleen het aantal,
-- nooit de vraag of het antwoord. Alleen de Edge Function comit (service role) mag tellen.

begin;

create table if not exists public.comit_gebruik (
  user_id uuid not null references auth.users(id) on delete cascade,
  dag date not null,
  aantal integer not null default 0 check (aantal >= 0),
  primary key (user_id, dag)
);

alter table public.comit_gebruik enable row level security;
revoke all on public.comit_gebruik from anon, authenticated;

-- Telt één vraag op en zegt of het nog mag (true) of dat het maximum van vandaag bereikt is (false).
create or replace function public.comit_tel(p_user uuid, p_max integer)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  vandaag date := (now() at time zone 'Europe/Brussels')::date;
  nieuw integer;
begin
  insert into public.comit_gebruik (user_id, dag, aantal) values (p_user, vandaag, 1)
  on conflict (user_id, dag) do update set aantal = public.comit_gebruik.aantal + 1
    where public.comit_gebruik.aantal < p_max
  returning aantal into nieuw;
  return nieuw is not null;
end;
$$;

revoke all on function public.comit_tel(uuid, integer) from public, anon, authenticated;
grant execute on function public.comit_tel(uuid, integer) to service_role;

commit;

-- Aanvulling 23-09-2026: lukt het antwoord niet (Gemini te druk), dan telt die vraag niet mee.
create or replace function public.comit_terug(p_user uuid)
returns void
language sql security definer set search_path = ''
as $$
  update public.comit_gebruik set aantal = greatest(aantal - 1, 0)
  where user_id = p_user and dag = (now() at time zone 'Europe/Brussels')::date;
$$;

revoke all on function public.comit_terug(uuid) from public, anon, authenticated;
grant execute on function public.comit_terug(uuid) to service_role;
