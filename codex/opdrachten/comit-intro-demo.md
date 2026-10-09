# Opdracht: Comit-intro vloeiend animeren en duidelijk zeggen dat Comit een demo is

## Doel
Alles rond de kennismaking met Comit moet vloeiend en netjes bewegen. Daarnaast moet iedereen bij de kennismaking weten dat Comit nog een demo is: je test hem mee en hij wordt vanaf nu alleen maar beter.

## Context (stand 26-09-2026)
- Lees eerst in `README.md` de kopjes Comit en Animaties.
- Er zijn drie plekken waar iemand Comit leert kennen:
  1. **Hub** (`hub.html`): een eigen knop onder de drie jaren (`.hub-comit-knop`, met logo, "Praat met Comit" en een ondertitel).
  2. **Voorstelscherm na de welkomst** (`nieuw.html`, functie `comitVoorstellen`): een laag over bijna het hele scherm met logo, "Nieuw op Berie's Exam Space", "Hallo, ik ben Comit.", een zin uitleg en de knoppen "Praat met Comit →" en "Later".
  3. **Comit-pagina** (`comit.html`, `assets/comit.js`, `assets/comit.css`): de opening met `data-opening="eerste"` (eerste bezoek) of `"herhaal"`, met logo, begroeting woord voor woord, vier voorstellen en het invoerveld.
- De chat zelf (denkglans, berichten die inglijden, antwoord woord voor woord) is net gebouwd en blijft zoals hij is. Hetzelfde geldt voor de knop Geschiedenis in de kop en de eerdere gesprekken (`#comit-geschiedenis`).
- `BES.comitLogo(grootte)` in `assets/comit.js` tekent het logo.

## Wat je bouwt

### 1. Vloeiende animaties
- **Voorstelscherm (`nieuw.html`):**
  - Eerst de donkere achtergrond, daarna de kaart (van `scale(.96)` naar 1, met fade).
  - Dan het logo: van `scale(.8)` naar 1, met één zachte gloed rond het logo die één keer uitdooft.
  - Daarna na elkaar: eyebrow, kop, tekst en knoppen, elk 8 px omhoog met fade, 80 tot 100 ms na elkaar.
  - Bij een klik op "Praat met Comit" of "Later" fadet de laag eerst uit (ongeveer 200 ms) en pas daarna ga je naar de nieuwe pagina.
- **Comit-pagina (`comit.html`):** de bestaande opening blijft, maar alles moet één rustig geheel vormen:
  - overal dezelfde `var(--ease)`;
  - geen sprongen in de lay-out en geen flits bij het laden;
  - de stappen sluiten zonder pauzes of overlap op elkaar aan;
  - de hele opening duurt bij een eerste bezoek hooguit ongeveer 2 seconden, bij "herhaal" hooguit 400 ms.
- **Hubknop:** komt mee binnen met de jaarkaarten (dezelfde `rise`, iets later). Bij de muis erop kantelt het logo heel licht (`rotate(-6deg)`) en schuift het pijltje 2 px.

### 2. Demo-melding (teksten letterlijk overnemen)
- **Voorstelscherm (`nieuw.html`):** zet naast de eyebrow een klein label "Demo", met de stijl van `.label`. Zet onder de bestaande uitleg een tweede zin, in dezelfde stijl maar iets kleiner:

  > Comit is nog een demo. Je test hem mee en hij wordt vanaf nu alleen maar beter. Klopt er iets niet? Laat het weten via Feedback.

  "Feedback" is een link naar `feedback.html`.
- **Comit-pagina (`comit.html`):** zet bij de begroeting ook het label "Demo". Zet onder de begroeting een korte regel in `--ink-soft`:

  > Dit is een demo. Comit leert nog en wordt steeds beter. Klopt iets niet? Laat het weten via Feedback.

  Ook hier is "Feedback" een link naar `feedback.html`. De regel doet mee in de opening-animatie en neemt geen ruimte weg van het gesprek.
- **Hubknop (`hub.html`):** zet een klein label "Demo" naast "Praat met Comit".

## Regels (MOET)
- Alleen `transform` en `opacity` animeren (plus kleur, achtergrond en schaduw), duur 150 tot 400 ms per stap, `var(--ease)`. Geen stuiter-effecten, niets dat blijft herhalen.
- Bij `prefers-reduced-motion: reduce` staat alles meteen stil in beeld, en het wegfaden bij een klik valt weg.
- Licht en donker thema via de bestaande tokens. Op 375 px niets zijwaarts scrollen. Knoppen minstens 44 px.
- Nergens het woord "gratis", geen gedachtestreepjes in zichtbare tekst, alles in hetzelfde tabblad.

## Bestanden
- `nieuw.html` (stijl en de functie `comitVoorstellen`), `hub.html` (alleen de Comit-knop), `comit.html`, `assets/comit.css`, `assets/comit.js` (alleen de opening en de begroeting).
- Cachenummer `?v=` in alle html-bestanden één hoger dan het huidige nummer in `hub.html`, en een korte alinea onder het kopje Comit in `README.md`.
- NIET aanraken: `assets/comit-ai.js`, `assets/comit-antwoorden.js`, de chat-animaties (denken, berichten, woord voor woord), `assets/auth.js`, `assets/deur.js`, `supabase/`. Geen bibliotheek.

## Klaar wanneer
- De drie plekken bewegen zoals hierboven, met en zonder `prefers-reduced-motion`, in licht en donker, op desktop en 375 px.
- De drie demo-teksten staan er letterlijk, met werkende links naar Feedback.
- Geen consolefouten. `hub.html`, `nieuw.html` en `comit.html` zitten achter de login. Beschrijf in de PR wat je lokaal wel en niet kon bekijken, zodat Claude het live nakijkt.

## Stoppen en vragen (in de PR-beschrijving)
Als iets alleen kan door de chat-animaties, `comit-ai.js`, `comit-antwoorden.js` of `auth.js` te veranderen.
