-- Verkoop je boeken. Foto's privé (tijdelijke links voor ingelogden), besloten 27-09-2026.
-- Zolang de site dicht is (toegang.sql) zien alleen accounts met toegang de boeken van anderen.
-- Vereist de bestaande public.is_beheerder() uit account-en-beheer.sql.
-- Uitvoervolgorde: dit bestand, account-en-beheer.sql, beheer-overzicht.sql.
-- Storage-bestanden altijd wissen via de Storage API, nooit via DELETE op storage.objects:
-- https://supabase.com/docs/guides/storage/schema/design

begin;

-- Alleen unieke JPEG-paden direct in de eigen map; ook geen NULL-elementen,
-- multidimensionale arrays, vreemde array-indexen of paden naar een ander account.
create or replace function public.boeken_fotos_geldig(p_fotos text[], p_user_id uuid)
returns boolean
language sql immutable set search_path = ''
as $$
  select p_fotos is not null
    and p_user_id is not null
    and cardinality(p_fotos) between 0 and 3
    and coalesce(array_ndims(p_fotos), 1) = 1
    and coalesce(array_lower(p_fotos, 1), 1) = 1
    and not exists (
      select 1 from unnest(p_fotos) as f(pad)
      where pad is null or pad !~ ('^' || p_user_id::text || '/[A-Za-z0-9_-]+[.]jpg$')
    )
    and (select count(distinct pad) from unnest(p_fotos) as f(pad)) = cardinality(p_fotos);
$$;
revoke all on function public.boeken_fotos_geldig(text[], uuid) from public, anon;
grant execute on function public.boeken_fotos_geldig(text[], uuid) to authenticated;

create table if not exists public.boeken (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vak text not null,
  titel text not null,
  staat text not null,
  -- Geen numeric(5,2): dat rondt een ongeldige invoer stil af voor de CHECK.
  prijs numeric not null,
  plek text,
  fotos text[] not null default '{}'::text[],
  whatsapp text not null,
  toestemming boolean not null,
  gemaakt timestamptz not null default now(),
  verloopt timestamptz not null default (now() + interval '60 days'),
  verkocht boolean not null default false,
  constraint boeken_vak_geldig check (vak in (
    'inlped', 'stat2', 'stat1', 'ontwikkeling', 'philsci', 'logica', 'mbg',
    'sociologie', 'omt1', 'socpsy', 'algpsy', 'biopsy1', 'pers', 'thg',
    'cross', 'stat3', 'ao', 'ortho', 'biologische2', 'cogpsy', 'kpsy',
    'rmt2', 'socpsy2', 'onderwijspsy', 'stat4', 'diffpsy', 'pg', 'gezpsy',
    'ebkh', 'omt3', 'ppka', 'hrm', 'ohv', 'forensische', 'ander'
  )),
  constraint boeken_titel_geldig check (char_length(titel) between 1 and 120 and char_length(btrim(titel)) > 0),
  constraint boeken_staat_geldig check (staat in ('nieuw', 'als-nieuw', 'gebruikt', 'notities')),
  constraint boeken_prijs_geldig check (prijs between 0 and 500 and prijs = round(prijs, 2)),
  constraint boeken_plek_geldig check (plek is null or char_length(plek) <= 60),
  constraint boeken_fotos_geldig check (public.boeken_fotos_geldig(fotos, user_id)),
  constraint boeken_whatsapp_geldig check (whatsapp ~ '^[+](32|31)[0-9]{8,10}$'),
  constraint boeken_toestemming_verplicht check (toestemming is true),
  constraint boeken_datums_geldig check (isfinite(gemaakt) and isfinite(verloopt) and verloopt > gemaakt)
);

create index if not exists boeken_eigenaar_idx on public.boeken (user_id, gemaakt desc);
create index if not exists boeken_beschikbaar_idx on public.boeken (verloopt, gemaakt desc) where not verkocht;

create table if not exists public.boek_meldingen (
  id uuid primary key default gen_random_uuid(),
  boek_id uuid not null references public.boeken(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reden text not null,
  gemaakt timestamptz not null default now(),
  constraint boek_meldingen_reden_geldig check (char_length(reden) between 1 and 300 and char_length(btrim(reden)) > 0),
  constraint boek_meldingen_per_account_uniek unique (boek_id, user_id)
);
create index if not exists boek_meldingen_nieuwste_idx on public.boek_meldingen (gemaakt desc, id desc);
create index if not exists boek_meldingen_eigenaar_idx on public.boek_meldingen (user_id);

-- De eigenaar blijft ook bij rechtstreekse SQL-updates dezelfde.
create or replace function public.boeken_eigenaar_vast()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'De eigenaar van een boek kan niet veranderen.' using errcode = '23514';
  end if;
  -- Verlengen kan alleen met de klok van de server: altijd precies 60 dagen vanaf nu.
  if new.verloopt is distinct from old.verloopt then
    new.verloopt := now() + interval '60 days';
  end if;
  return new;
end;
$$;
revoke all on function public.boeken_eigenaar_vast() from public, anon, authenticated;
drop trigger if exists boeken_eigenaar_vast on public.boeken;
create trigger boeken_eigenaar_vast before update on public.boeken
  for each row execute function public.boeken_eigenaar_vast();

alter table public.boeken enable row level security;
alter table public.boek_meldingen enable row level security;
revoke all on table public.boeken, public.boek_meldingen from public, anon, authenticated;
grant select, delete on table public.boeken to authenticated;
grant insert (id, user_id, vak, titel, staat, prijs, plek, fotos, whatsapp, toestemming)
  on public.boeken to authenticated;
grant update (vak, titel, staat, prijs, plek, fotos, whatsapp, toestemming, verloopt, verkocht)
  on public.boeken to authenticated;
grant select on table public.boek_meldingen to authenticated;
grant insert (boek_id, user_id, reden) on public.boek_meldingen to authenticated;

drop policy if exists "boeken lezen na inloggen" on public.boeken;
create policy "boeken lezen na inloggen" on public.boeken for select to authenticated
  using (auth.uid() is not null and (user_id = auth.uid() or ((select public.heeft_toegang()) and not verkocht and verloopt > now())));

drop policy if exists "eigen boeken toevoegen" on public.boeken;
create policy "eigen boeken toevoegen" on public.boeken for insert to authenticated
  with check (auth.uid() is not null and user_id = auth.uid() and (select public.heeft_toegang()));

drop policy if exists "eigen boeken bijwerken" on public.boeken;
create policy "eigen boeken bijwerken" on public.boeken for update to authenticated
  using (auth.uid() is not null and user_id = auth.uid())
  with check (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "boeken wissen door eigenaar of beheerder" on public.boeken;
create policy "boeken wissen door eigenaar of beheerder" on public.boeken for delete to authenticated
  using (auth.uid() is not null and (user_id = auth.uid() or public.is_beheerder()));

drop policy if exists "boek melden na inloggen" on public.boek_meldingen;
create policy "boek melden na inloggen" on public.boek_meldingen for insert to authenticated
  with check (auth.uid() is not null and user_id = auth.uid() and (select public.heeft_toegang()) and exists (
    select 1 from public.boeken b where b.id = boek_id
  ));

drop policy if exists "boekmeldingen lezen door beheerder" on public.boek_meldingen;
create policy "boekmeldingen lezen door beheerder" on public.boek_meldingen for select to authenticated
  using (auth.uid() is not null and public.is_beheerder());

-- Een gefilterde DELETE via PostgREST vereist ook SELECT-zichtbaarheid.
-- Deze kleine beheer-RPC kan daarom ook een verlopen/verkocht boek wissen,
-- zonder beheerders extra leesrechten op het WhatsApp-nummer te geven.
-- Foto's blijven eigendom van de verkoper; deze functie wist geen Storage-metadata.
create or replace function public.beheer_boek_wissen(p_boek_id uuid)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_beheerder() then
    raise exception 'Geen toegang.' using errcode = '42501';
  end if;
  delete from public.boeken where id = p_boek_id;
  return found;
end;
$$;
revoke all on function public.beheer_boek_wissen(uuid) from public, anon;
grant execute on function public.beheer_boek_wissen(uuid) to authenticated;

-- BOEKFOTOS: privaat (besluit 27-09-2026); de pagina toont ze met tijdelijke links.
-- Een publieke bucket omzeilt lees-RLS; wijzig dit niet zonder de privacytekst
-- en de gekozen downloadmethode samen te controleren.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('boekfotos', 'boekfotos', false, 1048576, array['image/jpeg'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "boekfotos lezen na inloggen" on storage.objects;
create policy "boekfotos lezen na inloggen" on storage.objects for select to authenticated
  using (bucket_id = 'boekfotos' and auth.uid() is not null and (
    (storage.foldername(name))[1] = auth.uid()::text or (select public.heeft_toegang()) and exists (
      select 1 from public.boeken b where name = any(b.fotos) and not b.verkocht and b.verloopt > now()
    )
  ));

drop policy if exists "eigen boekfotos uploaden" on storage.objects;
create policy "eigen boekfotos uploaden" on storage.objects for insert to authenticated
  with check (bucket_id = 'boekfotos' and auth.uid() is not null and (select public.heeft_toegang())
    and name ~ ('^' || auth.uid()::text || '/[A-Za-z0-9_-]+[.]jpg$'));

drop policy if exists "eigen boekfotos wissen" on storage.objects;
create policy "eigen boekfotos wissen" on storage.objects for delete to authenticated
  using (bucket_id = 'boekfotos' and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text);

-- Restrictieve regels begrenzen ook eventuele oudere, ruimere Storage-policies.
-- Andere buckets (zoals avatars) houden hun bestaande gedrag.
drop policy if exists "boekfotos leesgrens" on storage.objects;
create policy "boekfotos leesgrens" on storage.objects as restrictive for select to authenticated
  using (bucket_id <> 'boekfotos' or (auth.uid() is not null and (
    (storage.foldername(name))[1] = auth.uid()::text or exists (
      select 1 from public.boeken b where name = any(b.fotos) and not b.verkocht and b.verloopt > now()
    )
  )));

-- Geen verwijzing naar public.boeken in de anon-policy: anon heeft daar geen
-- tabelrechten; zo blijft ook het lezen van bestaande avatars werken.
drop policy if exists "boekfotos geen gasttoegang" on storage.objects;
create policy "boekfotos geen gasttoegang" on storage.objects as restrictive for all to anon
  using (bucket_id <> 'boekfotos') with check (bucket_id <> 'boekfotos');

drop policy if exists "boekfotos uploadgrens" on storage.objects;
create policy "boekfotos uploadgrens" on storage.objects as restrictive for insert to public
  with check (bucket_id <> 'boekfotos' or (auth.uid() is not null
    and name ~ ('^' || auth.uid()::text || '/[A-Za-z0-9_-]+[.]jpg$')));

drop policy if exists "boekfotos wisgrens" on storage.objects;
create policy "boekfotos wisgrens" on storage.objects as restrictive for delete to public
  using (bucket_id <> 'boekfotos' or (auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text));

drop policy if exists "boekfotos niet overschrijven" on storage.objects;
create policy "boekfotos niet overschrijven" on storage.objects as restrictive for update to public
  using (bucket_id <> 'boekfotos') with check (bucket_id <> 'boekfotos');

commit;

-- Drie controlequery's voor Claude na uitvoering, zonder nummers of advertentietekst:
-- 1. RLS en anon-rechten: beide tabellen true; alle anon_* kolommen false.
-- select c.relname, c.relrowsecurity,
--   has_table_privilege('anon', c.oid, 'SELECT') as anon_lezen,
--   has_table_privilege('anon', c.oid, 'INSERT,UPDATE,DELETE') as anon_schrijven
-- from pg_class c join pg_namespace n on n.oid = c.relnamespace
-- where n.nspname = 'public' and c.relname in ('boeken', 'boek_meldingen');
-- 2. Controleer de eigenaren-/beheerregels en de restrictieve boekfotos-grenzen.
-- select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- from pg_policies where (schemaname = 'public' and tablename in ('boeken', 'boek_meldingen'))
--   or (schemaname = 'storage' and tablename = 'objects' and policyname like '%boekfoto%')
-- order by schemaname, tablename, policyname;
-- 3. Bucketlimieten en beveiliging van de beheer-RPC.
-- select b.id, b.public, b.file_size_limit, b.allowed_mime_types,
--   has_function_privilege('anon', 'public.beheer_boek_wissen(uuid)', 'EXECUTE') as anon_beheer_rpc,
--   has_function_privilege('authenticated', 'public.beheer_boek_wissen(uuid)', 'EXECUTE') as account_beheer_rpc
-- from storage.buckets b where b.id = 'boekfotos';
