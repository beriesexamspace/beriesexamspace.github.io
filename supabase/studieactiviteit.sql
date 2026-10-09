begin;

create table if not exists public.studieactiviteit (
  user_id uuid not null references auth.users(id) on delete cascade,
  apparaat uuid not null,
  dag date not null,
  leertijd_ms bigint not null default 0 check (leertijd_ms between 0 and 86400000),
  bezoeken integer not null default 0 check (bezoeken between 0 and 1000),
  primary key (user_id, apparaat, dag)
);

alter table public.studieactiviteit enable row level security;
revoke all on public.studieactiviteit from anon, authenticated;
grant select on public.studieactiviteit to authenticated;
drop policy if exists "eigen studieactiviteit lezen" on public.studieactiviteit;
create policy "eigen studieactiviteit lezen" on public.studieactiviteit
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.studieactiviteit_bewaren(
  p_eigenaar uuid, p_apparaat uuid, p_dagen jsonb
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or p_eigenaar is distinct from auth.uid() then
    raise exception 'Geen toegang' using errcode = '42501';
  end if;
  if p_apparaat is null or p_dagen is null or jsonb_typeof(p_dagen) <> 'array' then
    raise exception 'Ongeldige activiteitgegevens' using errcode = '22023';
  end if;
  if jsonb_array_length(p_dagen) > 100 then
    raise exception 'Te veel dagen in een verzoek' using errcode = '22023';
  end if;

  insert into public.studieactiviteit as opgeslagen (user_id, apparaat, dag, leertijd_ms, bezoeken)
  select auth.uid(), p_apparaat, rij.dag, rij.leertijd_ms, rij.bezoeken
  from jsonb_to_recordset(p_dagen) as rij(dag date, leertijd_ms bigint, bezoeken integer)
  on conflict (user_id, apparaat, dag) do update set
    leertijd_ms = greatest(opgeslagen.leertijd_ms, excluded.leertijd_ms),
    bezoeken = greatest(opgeslagen.bezoeken, excluded.bezoeken);
end;
$$;

revoke all on function public.studieactiviteit_bewaren(uuid, uuid, jsonb) from public, anon;
grant execute on function public.studieactiviteit_bewaren(uuid, uuid, jsonb) to authenticated;

commit;
