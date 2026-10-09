# Opdracht: elke knop en elk mechanisme een kleine animatie, overal dezelfde Apple-look

## Doel
Loop de hele site na. Elk klikbaar element en elk mechanisme dat iets opent, sluit, kiest of wisselt, krijgt een kleine, rustige animatie in Apple-stijl. Wat nog niet in dezelfde stijl staat, trek je gelijk met de rest. De site gebruikt al Apple-achtige tokens in `assets/style.css` (Inter, `--accent` #0071e3, `--surface` #F5F5F7, pillknoppen, zachte schaduwen). Je voegt GEEN nieuwe look toe; je maakt het bestaande overal af en consequent.

## Context (stand 26-09-2026, cachenummer nu 57)
- Lees eerst `README.md` helemaal; `AGENTS.md` is op een paar punten verouderd, de README is leidend.
- Pagina's: `index.html`, `aanmelden.html`, `inloggen.html`, `wachtwoord.html`, `nieuw.html` (welkomst plus Comit-voorstelscherm), `hub.html`, `jaar-1ba/2ba/3ba.html`, `vak/<id>/index.html` (via `assets/vak.js` en `assets/vak.css`), `profiel.html`, `voortgang.html`, `abonnement.html`, `fouten.html`, `examenplan.html`, `comit.html`, `examen-info.html`, `reken.html`, `leren.html`, `over-mij.html`, `whatsapp.html`, `feedback.html`, `privacy.html`, `account-wissen.html`, `gesloten.html`, `beheer.html`, `404.html`.
- Er bestaan al animaties: `rise`, `appear`, `menu-open` en de hover- en press-regels onderaan `assets/style.css` (`:where(html.has-hover) ...:hover`, `:active { transform: scale(.97) }`), het profielmenu, de carrousel, de kaarten op `abonnement.html`. Gebruik die als maatstaf en hergebruik ze; maak geen tweede stelsel.
- Hover-effecten staan altijd achter `:where(html.has-hover)`, zoals nu. Bij `prefers-reduced-motion: reduce` staat alle beweging uit (bestaande regels onderaan `style.css`); nieuwe animaties moeten daar ook onder vallen.

## Wat je doet
1. **Inventaris.** Maak per pagina een lijst van elk klikbaar element en elk mechanisme. Denk aan:
   - knoppen (`.knop`, `.knop-secundair`, `.pill`, `.tekstlink`, `.terug`), icoonknoppen (`.home-knop`, `.thema-knop`, `.menu-toggle`, `.profiel-knop`) en klikbare kaarten (`a.kaart`, `.kaart-pijl`);
   - het mobiele menu (Menu openen en sluiten), het profielmenu, de themaknop (zon en maan wisselen);
   - de tabs op de vakpagina (Oefenen, Studie-hacks, Theorie), de keuzes Training of Simulatie, Normaal of Hard, Zonder of Met tijd, de hoofdstukvinkjes, Alles en Niets, en de Start-knop;
   - antwoordopties (kiezen, goed, fout), Controleer, Volgende, de voortgangsbalk en het eindscherm met Comit-tip;
   - `details`/`summary` (Per hoofdstuk op voortgang, Volledige uitleg op de hub);
   - bevestigingen en lagen: Stop tijdens het oefenen, Opzeggen op het profiel, de stappen van Account wissen, het Comit-voorstelscherm;
   - meldingen en statusteksten (Opgeslagen, foutmeldingen), invoervelden en selects (focus), kalenderdagen, carrouselstippen, de knoppen op `abonnement.html`, `fouten.html` en `examenplan.html`, de chat op `comit.html`.
2. **Gat dichten.** Heeft iets geen animatie, of wijkt het af van de rest, geef het dan dezelfde behandeling als vergelijkbare elementen:
   - hover (alleen met muis): lichte kleurverschuiving of een lift van 1 tot 2 px, schaduw iets sterker;
   - indrukken: `scale(.97)` voor knoppen, `scale(.99)` voor kaarten;
   - focus met toetsenbord: de bestaande `:focus-visible` ring, zichtbaar en met een zachte overgang;
   - openen en sluiten (menu's, details, bevestigingen, lagen): fade plus 4 tot 8 px schuiven of `scale(.98)` naar 1; waar CSS het sluiten niet kan animeren, is alleen openen animeren genoeg;
   - kiezen (radio, segmenten, vinkjes, tabs): de gekozen staat vloeit over (kleur, achtergrond, vinkje), geen harde sprong;
   - verschijnende meldingen: fade in.
3. **Apple-look gelijktrekken.** Waar een element afwijkt van de rest (andere radius, harde schaduw, andere knopvorm, focusring die ontbreekt, rand die niet uit `--line` komt, overgang die veel sneller of trager is), trek je het gelijk met de bestaande tokens. Het navigatiebalk-glas (`--nav-bg` met blur) en de pillknoppen blijven zoals ze zijn.

## Regels voor beweging (MOET)
- Duur 150 tot 300 ms, `var(--ease)`. Geen stuiter- of overshoot-effecten, niets dat blijft herhalen, niets bij het laden van een pagina behalve wat er al is.
- Alleen `transform`, `opacity`, kleur, achtergrond, rand en schaduw animeren. Nooit `width`, `height`, `top` of `left` animeren (uitzondering: bestaande voortgangsbalken). Geen verschuiving van de lay-out.
- Alles uit bij `prefers-reduced-motion: reduce`.
- Knoppen blijven minstens 44 px; de tikvlakken onderaan `style.css` blijven werken.

## Bestanden
- Vooral `assets/style.css`, `assets/vak.css`, `assets/intro.css`, `assets/kalender.css`, `assets/comit.css` en de `<style>`-blokken in de pagina's zelf.
- JavaScript alleen als een open- of sluitanimatie niet zonder kan, en dan zo klein mogelijk in `assets/app.js` of `assets/vak.js`.
- NIET aanraken: `assets/auth.js`, `assets/deur.js`, `assets/config.js`, `assets/plan.js`, `supabase/`, `vak/*/data.js`, teksten op de site, de kleuren van de plannen (Free grijs, Plus teal, Pro zwart met goud), de lay-out van pagina's. Geen bibliotheek, geen nieuwe fonts.
- Cachenummer `?v=` in alle html-bestanden één hoger (58), en een korte alinea in `README.md` onder een nieuw kopje "Animaties".

## Klaar wanneer
- De PR-beschrijving bevat de inventaris als tabel: pagina, element of mechanisme, animatie nu (wat), en of je iets veranderd hebt.
- Lokaal getest met `npx http-server . -p 4477 -c-1`: desktop en 375 px, licht en donker, met en zonder `prefers-reduced-motion` (emuleer in DevTools). Geen consolefouten, niets scrolt zijwaarts op 375 px.
- Pagina's achter de login kan je lokaal zonder account niet openen; beschrijf in de PR wat je daar via de code hebt nagelopen, zodat Claude het live kan controleren.

## Stoppen en vragen (in de PR-beschrijving)
Als iets alleen kan door `auth.js` of `deur.js` te veranderen (bijvoorbeeld een sluitanimatie van het profielmenu), als een wijziging de lay-out of een tekst zou raken, of als je twijfelt of iets nog "Apple-stijl" is.
