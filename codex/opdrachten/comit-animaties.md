# Opdracht: Comit denkt en praat met mooie animaties (zoals Codex)

## Doel
De chat op `comit.html` moet levendiger aanvoelen, zoals bij Codex: een rustige "denk"-animatie terwijl Comit nadenkt, berichten die de chat in glijden, en een antwoord dat woord voor woord verschijnt. De inhoud en de logica van de antwoorden veranderen niet.

## Context (stand 26-09-2026)
- Lees eerst het kopje Comit in `README.md`.
- `assets/comit.js` tekent de berichten met `bericht(inhoud, assistent)` (rij `.comit-bericht`, wolk `.comit-wolk`). Terwijl Comit nadenkt, krijgt de wolk `.comit-denkt` met de tekst "Comit denkt na." en drie puntjes (`.comit-puntjes`, animatie `comit-denken` in `assets/comit.css`). Die denkwolk blijft minstens 600 ms staan. Daarna komt het antwoord (vast antwoord uit `comit-antwoorden.js` of AI via `comit-ai.js`), soms met knoppen (`.comit-antwoord-knop`).
- Een AI-antwoord duurt 4 tot 7 seconden, dus de denk-animatie is lang in beeld.
- Bij `prefers-reduced-motion: reduce` staat alle beweging op de Comit-pagina al uit (regel onderaan `comit.css`); dat moet zo blijven.

## Wat je bouwt
1. **Denken zoals Codex.** Vervang de drie puntjes door een glans die over de tekst "Comit denkt na" loopt: de tekst in `--ink-soft`, met een lichte streep die in ongeveer 1,6 s van links naar rechts schuift en herhaalt (gradient met `background-clip: text`). Het kleine Comit-logo naast de wolk "ademt" zacht (schaal 1 naar 1,06 en terug, ongeveer 1,6 s). Duurt het langer dan 3 seconden, dan wordt de tekst "Nog even denken". Geen andere teksten, geen neppe voortgang.
2. **Berichten glijden in.** Een bericht van de student komt van rechts (8 tot 12 px schuiven plus fade, ongeveer 220 ms), een bericht van Comit van links. De denkwolk komt op dezelfde manier binnen.
3. **Antwoord woord voor woord.** Het antwoord verschijnt woord voor woord met een korte fade per woord. Gebruik tekstknopen of `span`-elementen met `textContent`, NOOIT `innerHTML`. Tempo ongeveer 25 ms per woord, maar een lang antwoord mag in totaal hooguit 1,5 s duren (verdeel de vertraging). Regels (`\n`) blijven behouden. Knoppen onder het antwoord komen pas met een fade als de tekst er staat.
4. **Voorlezen blijft goed.** Schermlezers krijgen het hele antwoord in één keer: zet de volledige tekst in een visueel verborgen element met `aria-live`, of zet `aria-hidden="true"` op de woord-spans en lees de hele tekst voor. De denkwolk krijgt `aria-busy="true"` zolang Comit nadenkt.
5. **Meescrollen.** Tijdens het verschijnen scrolt de chat zacht mee naar het nieuwste bericht, maar alleen als de student al onderaan zat.
6. **Kleine extra's.** De verstuurknop krijgt een indruk-animatie (`scale(.94)`), en de voorstelknoppen boven de invoer glijden weg zodra het gesprek start, als ze nu nog abrupt verdwijnen.

## Regels (MOET)
- Duur 150 tot 300 ms per overgang (behalve de doorlopende glans en het ademen), `var(--ease)`. Alleen `transform`, `opacity` en de glans-gradient animeren. Geen stuiter-effecten.
- Bij `prefers-reduced-motion: reduce`: geen glans en geen ademen (gewoon "Comit denkt na." in `--ink-soft`), berichten en tekst meteen in beeld.
- Licht en donker thema via de bestaande tokens. Op 375 px niets zijwaarts scrollen. Knoppen minstens 44 px.
- Nergens het woord "gratis", geen gedachtestreepjes in zichtbare tekst.

## Bestanden
- `assets/comit.js` (alleen het tekenen van berichten, de denkwolk en het verschijnen van het antwoord)
- `assets/comit.css`
- Cachenummer `?v=` in alle html-bestanden één hoger dan het huidige nummer in `hub.html`, en een korte alinea onder het kopje Comit in `README.md`
- NIET aanraken: `assets/comit-ai.js`, `assets/comit-antwoorden.js`, `supabase/`, `assets/auth.js`, `assets/deur.js`, andere pagina's (behalve het cachenummer). Geen bibliotheek.

## Klaar wanneer
- De vier punten hierboven werken, met en zonder `prefers-reduced-motion`.
- Geen consolefouten. `comit.html` zit achter de login; test het tekenen los (bijvoorbeeld door de functies met een nep-antwoord aan te roepen in een testbestand dat je NIET meelevert) en beschrijf in de PR wat je getest hebt, zodat Claude het live kan nakijken.

## Stoppen en vragen (in de PR-beschrijving)
Als iets alleen kan door `comit-ai.js`, `comit-antwoorden.js` of `auth.js` te veranderen, of als het woord-voor-woord verschijnen de knoppen of links in een antwoord zou breken.
