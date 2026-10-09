# Opdracht: Verkoop je boeken (contact via WhatsApp) en het reconstructiehoofdstuk van sociologie weghalen

## Belangrijkste regels (lees eerst)
- Het WhatsApp-nummer van een verkoper mag NOOIT zonder login te zien zijn. Het mag niet in een html- of js-bestand in de repo staan, en niet in `localStorage`. Het komt alleen uit Supabase, met RLS die lezen beperkt tot ingelogde accounts.
- Geen `innerHTML` met tekst van gebruikers (titel, plek, vak). Gebruik altijd `textContent` of elementen die je maakt met `createElement`.
- Zichtbare tekst in het Nederlands, kort en rustig. Nooit het woord "gratis". Geen gedachtestreepjes (de tekens — of –). Geen namen van derden. Alles opent in hetzelfde tabblad, ook de WhatsApp-link. Knoppen en invoervelden zijn minstens 44 px hoog.
- Het is voor iedereen met een account (Free, Plus en Pro). Er komt geen slot en geen Plus-label.
- Je kan geen SQL uitvoeren. Schrijf de SQL in een bestand; Claude voert het uit in Supabase.

## Doel
1. Studenten kunnen hun studieboeken aan elkaar verkopen. Een koper neemt contact op via WhatsApp met de verkoper. De site regelt geen betaling en geen verzending.
2. Het hoofdstuk "Examenreconstructies" verdwijnt uit sociologie in v2, want reconstructies zijn niet toegestaan (afspraak van 21-09-2026).

## Context (stand 27-09-2026)
- Lees eerst in `README.md` de delen Regels, De deur, Accounts (Supabase), Profielfoto's inschakelen, Privacy, account wissen en beheer, en Vakpagina.
- Het hele plan staat hieronder. Het is afgeleid van de notitie van Berat. Volg dit bestand, niet je eigen ideeën.
- De hub (`hub.html`, rond regel 313) heeft bij Tools een kaart "Verkoop je boeken" met `kaart-binnenkort` en het label Binnenkort.
- Accountclient: `BES.auth.client` (supabase-js 2.45.4), `await BES.auth.gereed`, `await BES.auth.gebruiker()`. Beheerder: `rpc('is_beheerder')`.
- Profielfoto's gebruiken de bucket `avatars`. Het verkleinen met een canvas staat in `profiel.html` (rond regel 505 tot 525). Gebruik hetzelfde principe voor boekfoto's.
- Vakkenlijst: `window.BES_VAKKEN` uit `assets/vakken.js` (id, naam, jaar).
- `supabase/account-en-beheer.sql` heeft `account_verwijderen()`. Die wist nu de profielfoto en daarna het account.
- De beheerpagina `beheer.html` haalt alles op via `beheer_overzicht()` uit `supabase/beheer-overzicht.sql`.

## Wat je bouwt

### A. Sociologie: reconstructiehoofdstuk weg
- In `vak/sociologie/data.js`: verwijder het hoofdstuk `{ "id": "h17", "naam": "Examenreconstructies" }` en alle vragen, Hard-vragen, theorie en hacks met `"h": "h17"`. Het gaat om 51 vragen.
- Laat al het andere precies gelijk. Het bestand gebruikt 2 spaties inspringing en `window.BES_VAK = {...};`. Houd die opmaak aan.
- Controleer met node dat geen enkele vraag nog naar een hoofdstuk verwijst dat niet bestaat.
- Blijven er in het vak na het weghalen nog andere hoofdstukken met echte of oude examenvragen over? Laat die staan, maar noem ze in de PR.

### B. Verkoop je boeken

**1. Database: nieuw bestand `supabase/boeken.sql`**
- Tabel `public.boeken` met deze kolommen:
  - id (uuid)
  - user_id (standaard `auth.uid()`, verwijst naar `auth.users`, met `on delete cascade`)
  - vak (tekst, een vak-id of 'ander')
  - titel (1 tot 120 tekens)
  - staat (`nieuw`, `als-nieuw`, `gebruikt` of `notities`)
  - prijs (numeric van 0 tot 500, met 2 decimalen)
  - plek (optioneel, maximaal 60 tekens)
  - fotos (text[], maximaal 3 paden)
  - whatsapp (tekst die het patroon `^\+(32|31)[0-9]{8,10}$` volgt)
  - toestemming (boolean, moet true zijn)
  - gemaakt (standaard `now()`)
  - verloopt (standaard `now() + 60 dagen`)
  - verkocht (boolean, standaard false)
- Tabel `public.boek_meldingen`: id, boek_id (verwijst naar boeken, cascade), user_id (standaard `auth.uid()`), reden (maximaal 300 tekens), gemaakt.
- RLS op beide tabellen. Trek alles in voor `anon`.
  - **boeken:**
    - select voor `authenticated`: je eigen boeken altijd; die van anderen alleen als ze niet verkocht en niet verlopen zijn.
    - insert, update en delete alleen je eigen boeken, met `user_id = auth.uid()`.
    - de beheerder (`public.is_beheerder()`) mag elk boek wissen.
    - Maak het onmogelijk dat een update `user_id` verandert.
  - **boek_meldingen:**
    - insert voor `authenticated`, maximaal één melding per boek per account.
    - select alleen voor de beheerder.
- Bucket `boekfotos`: openbaar lezen. Uploaden en wissen alleen in je eigen map `<user_id>/`, alleen jpeg, maximaal 1 MB. Maak de bucket en de policies in de SQL.
- Pas `account_verwijderen()` aan: wis ook de bestanden in `boekfotos/<user_id>/`. De rijen verdwijnen al via de cascade.
- Voeg aan `beheer_overzicht()` een blok `boeken` toe met:
  - `te_koop`: niet verkocht en niet verlopen
  - `verkocht`
  - `meldingen`: de nieuwste 10, met titel, reden en datum, en het boek-id zodat de beheerder het kan wissen

**2. Pagina `boeken.html`** (achter de deur, zelfde opbouw en stijl als de andere pagina's)
- Titel: "Verkoop je boeken".
- **Lijst.** Tabs of filters per jaar (1ste, 2de, 3de bachelor, Ander vak), een zoekveld op titel en vak, en een kaart per boek met:
  - foto (of een rustige plek zonder foto)
  - titel en vak
  - staat en prijs (bijvoorbeeld "12 euro")
  - plek
  - "geplaatst op 27 sep"
  - de knop **Stuur een WhatsApp**
- **De WhatsApp-knop.** De link is `https://wa.me/<nummer zonder +>?text=` met dit bericht (URL-gecodeerd): `Hoi, ik zag je boek "<titel>" op Berie's Exam Space. Is het nog te koop?` De link opent in hetzelfde tabblad.
- **Melden.** Een tekstknop "Meld dit boek" opent een kort veld voor de reden en verstuurt een melding. Daarna staat er "Bedankt, we kijken ernaar."
- **Formulier "Zet een boek erbij".** Velden:
  - vak (keuzelijst uit `BES_VAKKEN`, plus "Ander vak")
  - titel
  - staat
  - prijs
  - plek
  - foto's (tot 3, in de browser verkleind tot maximaal 1200 px en jpeg 0,8)
  - WhatsApp-nummer (met de hint "met landcode, zoals +32 470 12 34 56"; spaties weghalen voor het opslaan)
  - het vinkje: "Mijn nummer mag zichtbaar zijn voor ingelogde studenten bij dit boek."

  Onder het formulier staat deze regel: "Alleen echte boeken en cursussen. Geen kopieën, pdf's of samenvattingen van anderen." Zonder vinkje of met een ongeldig nummer is de knop uitgeschakeld, met een duidelijke melding.
- **Mijn boeken.** Je eigen advertenties, met:
  - **Verkocht**: zet `verkocht = true`
  - **Prijs aanpassen**
  - **Verlengen**: zet `verloopt` op nu + 60 dagen
  - **Wissen**: met een bevestiging, en ook de foto's uit de bucket weg

  Een verlopen advertentie krijgt het label "Verlopen" en de knop Verlengen.
- Een lege lijst krijgt een vriendelijke tekst en de knop "Zet een boek erbij".
- Licht en donker thema via de bestaande tokens, gebruik van de kaartstijlen uit `assets/style.css`, zachte animaties zoals op de rest van de site, en niets zijwaarts scrollen op 375 px.

**3. Hub, beheer, privacy, voorwaarden**
- **`hub.html`:** maak de kaart actief. Haal `kaart-binnenkort`, `aria-disabled` en het label weg, zodat het een link naar `boeken.html` wordt, zoals de andere Tools-kaarten.
- **`beheer.html`:** een sectie "Boeken" met de aantallen (te koop, verkocht) en de meldingen, met per melding een knop "Wis dit boek" (met een bevestiging).
- **`privacy.html`:** bij "Wat we bewaren" een punt toevoegen:
  > **Je boeken, als je iets verkoopt.** De gegevens van je advertentie, de foto's en je WhatsApp-nummer. Alleen ingelogde studenten zien ze, en alleen zolang de advertentie loopt. Wis je de advertentie of je account, dan is alles weg.

  In de lijst bij "Wissen" komt "je boeken" erbij.
- **`voorwaarden.html`:** een deel "Boeken verkopen" vóór "Privacy":
  > Bij Verkoop je boeken bied je zelf je boeken aan. De koop, de betaling en het ophalen spreek je samen af; Berie's Exam Space is daar geen partij in. Zet alleen echte boeken en cursussen erbij, geen kopieën of samenvattingen van anderen. Meld een advertentie die niet klopt, dan halen we ze weg.

## Bestanden
- **Nieuw:** `boeken.html`, `supabase/boeken.sql`. Eigen JS en CSS mogen in de pagina zelf, of in `assets/boeken.js` en `assets/boeken.css`.
- **Aanpassen:** `vak/sociologie/data.js`, `hub.html` (alleen de kaart), `beheer.html`, `privacy.html`, `voorwaarden.html`, `supabase/account-en-beheer.sql` (`account_verwijderen`), `supabase/beheer-overzicht.sql` (blok `boeken`).
- **Cachenummer:** `?v=` in alle html-bestanden één hoger dan het huidige nummer in `hub.html`. Zet in `README.md` het nieuwe nummer bij "(nu ...)" en schrijf een kort deel "Verkoop je boeken".
- **NIET aanraken:** `assets/auth.js`, `assets/deur.js`, `assets/plan.js`, `assets/comit*.js`, `supabase/functions/`, en andere vakken. Geen bibliotheken.

## Klaar wanneer
- Een node-check geeft `0` hoofdstukken of vragen met h17 in sociologie, en elke vraag verwijst naar een bestaand hoofdstuk.
- `supabase/boeken.sql` is idempotent: `create ... if not exists` en `drop policy if exists` vóór `create policy`. Onderaan staan in commentaar drie controlequery's.
- `boeken.html` werkt lokaal met nepgegevens. Test dat in een testbestand dat je NIET meelevert, en beschrijf in de PR wat je getest hebt:
  - de lijst, filteren en zoeken
  - het formulier, met de controle op het nummer en het vinkje
  - de WhatsApp-link met het juiste bericht
  - Mijn boeken (verkocht, verlengen, wissen)
  - melden
- De pagina werkt in licht en donker thema, er scrolt niets zijwaarts op 375 px, en de console geeft geen fouten.
- In de PR staat: de SQL die Claude moet uitvoeren, in welke volgorde, en wat live nog getest moet worden.

## Stoppen en vragen (in de PR-beschrijving)
Stop en vraag het in de PR:
- als iets alleen kan door `auth.js`, `deur.js` of `plan.js` te veranderen;
- als RLS het nummer toch zichtbaar zou maken zonder login;
- als het weghalen van h17 iets anders in sociologie zou breken.
