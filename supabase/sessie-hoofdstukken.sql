-- Eenmalig uitvoeren in de SQL-editor van Supabase.
-- Per ronde ook bewaren welke hoofdstukken erin zaten en hoeveel goed per hoofdstuk,
-- zodat de groei per hoofdstuk later te zien is (wens van 02-10-2026: alles terugzien, ook na jaren).
-- Vorm: [{"h": "h1", "goed": 3, "totaal": 5}, ...]. Oudere rondes houden null.
-- De rechten van sessies blijven gelijk: alleen eigen rijen lezen en toevoegen, geen update of delete.

begin;

alter table public.sessies add column if not exists hoofdstukken jsonb;
alter table public.sessies drop constraint if exists sessies_hoofdstukken_vorm;
alter table public.sessies add constraint sessies_hoofdstukken_vorm check (
  hoofdstukken is null
  or (jsonb_typeof(hoofdstukken) = 'array' and jsonb_array_length(hoofdstukken) <= 100 and pg_column_size(hoofdstukken) <= 8000)
);

commit;

notify pgrst, 'reload schema';
