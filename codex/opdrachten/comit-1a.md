# Opdracht: Comit stap 1a (pagina, logo, opening, gesprek zonder antwoorden)

## Doel
Comit wordt het studiemaatje van de site. In deze eerste stap bouw je alleen het uiterlijk: een eigen pagina met het logo, een openingsanimatie zoals wanneer je Gemini voor het eerst opent, een begroeting met de naam van de student, een invoerveld, voorstelkaartjes en tekstwolkjes. Comit geeft nog geen echte antwoorden; dat komt in stap 1b. Berat moet het logo en de animatie eerst zien, dus de pagina wordt nog nergens gelinkt.

## Bestanden
- Nieuw: `comit.html` (bovenste map, zelfde opbouw als `account-wissen.html`: `assets/deur.js` in de head zodat alleen ingelogde accounts erin kunnen, `robots noindex`, dezelfde navigatiebalk en voettekst)
- Nieuw: `assets/comit.css` en `assets/comit.js` (alleen voor deze pagina)
- `README.md` (nieuw kopje "Comit")
- Cachenummer `?v=` in alle html-bestanden één hoger dan het huidige nummer in `hub.html`

NIET aanraken: `hub.html` (de kaart "Praat met Comit" blijft op Binnenkort; alleen het cachenummer), `assets/style.css`, `assets/intro.js`, `assets/vak.js`, `supabase/`, `vak/*/data.js`. Geen bibliotheek, geen afbeeldingsbestand, geen nieuwe tabel, geen verbinding met een AI.

## Gewenst gedrag
1. **Logo, in SVG-code (geen afbeelding).** Een ronde C die tegelijk een tekstwolkje is (een klein staartje linksonder), met een klein vierpuntig sterretje in de opening van de C. Kleurverloop van teal `var(--teal)` naar blauw `var(--accent)`. Maak er een functie van, `window.BES.comitLogo(grootte)`, die een `<svg>` teruggeeft met `aria-hidden="true"`, zodat we hem later ook op de hub en in de intro kunnen gebruiken. Moet scherp zijn van 20 px tot 160 px en goed zichtbaar in licht en donker. Eigen vorm: niet de vorm van het Gemini- of een ander bestaand logo.
2. **Opening, de eerste keer (ongeveer twee seconden):**
   1. Rustige achtergrond (`var(--bg)`).
   2. Het logo verschijnt klein in het midden, groeit tot ongeveer 72 px en krijgt een zachte teal-blauwe gloed.
   3. Een zacht kleurverloop (teal en blauw, lage dekking, bijvoorbeeld 15 procent) schuift één keer door de achtergrond en blijft daarna heel licht staan.
   4. "Hallo, Voornaam." verschijnt woord voor woord, groot (ongeveer 2,5rem), met dezelfde kleurverloop-letters (`background-clip: text`).
   5. Daaronder in `var(--ink-soft)`: "Waar kan ik je mee helpen?"
   6. Daarna schuiven de voorstelkaartjes en het invoerveld een voor een omhoog (8 px omhoog en van doorzichtig naar zichtbaar, 200 ms elk, `var(--ease)`).
   De naam komt uit `BES.auth.naamGegevens(user).aanspreeknaam` na `await BES.auth.gereed` en `await BES.auth.gebruiker()`, precies zoals `hub.html` het doet; zonder naam: "Hallo."
3. **Tweede keer en daarna:** alleen de begroeting met een korte fade (300 ms), de rest staat meteen klaar. Onthoud dit in `localStorage` onder `bes_comit_gezien`, altijd binnen `try/catch`.
4. **Minder beweging** (`prefers-reduced-motion: reduce`): geen animatie, alles meteen zichtbaar.
5. **Het scherm, na de opening:**
   - Bovenaan de inhoud: klein logo (24 px) met het woord "Comit".
   - In het midden: de begroeting met vier voorstelkaartjes in een raster (twee naast elkaar, op de telefoon onder elkaar): "Waar moet ik nog op oefenen?", "Hoe ging mijn week?", "Hoe werkt Hard mode?", "Hoe werkt de tijdklok?".
   - Onderaan: een invoerveld (`<textarea>` van één regel die meegroeit tot vier regels) met placeholder "Vraag Comit iets" en een ronde verstuurknop met een pijl. Enter verstuurt, Shift+Enter is een nieuwe regel. Het invoerveld blijft onderaan het scherm staan (`position: sticky` of vaste plek), ook op de telefoon boven het toetsenbord.
6. **Gesprek (nog zonder echte antwoorden):** klik je een kaartje of verstuur je tekst, dan verdwijnen begroeting en kaartjes, verschijnt jouw vraag als tekstwolkje rechts (achtergrond `var(--accent-zacht)`), daarna links naast het kleine logo drie bewegende puntjes (ongeveer 900 ms), en dan het antwoord "Hier kan ik nog niet op antwoorden. Binnenkort wel." als tekstwolkje links (achtergrond `var(--surface)`). De gesprekslijst heeft `role="log"` en `aria-live="polite"`. Leeg bericht versturen doet niets.
7. **Vaste regels** (zie AGENTS.md): nergens het woord "gratis", geen gedachtestreepjes in zichtbare tekst, geen namen van derden, geen sleutels of persoonsgegevens in de code, knoppen minstens 44 px, licht en donker via de bestaande tokens, alles in hetzelfde tabblad, werkt op 375 px zonder zijwaarts scrollen.

## Klaar als
- `comit.html` opent alleen voor ingelogde accounts; uitgelogd kom je op de inlogpagina, zoals bij `account-wissen.html`.
- De eerste keer speelt de hele opening; na verversen alleen de korte fade; met "minder beweging" staat alles meteen stil.
- De begroeting toont de aanspreeknaam van het account.
- Een kaartje of getypte vraag geeft: jouw wolkje rechts, puntjes, en het vaste antwoord links. Enter en de knop werken, Shift+Enter maakt een nieuwe regel.
- Het logo ziet er scherp uit op 20, 24, 72 en 160 px, in licht en donker. Voeg in de PR-beschrijving een screenshot toe van het logo op die maten en van de pagina op 375 px en op 1280 px, licht en donker.
- `hub.html` is inhoudelijk niet veranderd (alleen het cachenummer); cachenummer overal verhoogd; `node --check assets/comit.js` slaagt; geen consolefouten.
