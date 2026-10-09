# Opdracht: oefenen in stappen, met tijdklok

## Doel
De keuze op de vakpagina wordt een pad: je ziet één stap tegelijk. Kies je iets, dan schuift de volgende stap rustig in beeld. Nieuw is een stap voor de tijd: zonder tijd, of met een tijd die de student zelf kiest. Kiest hij tijd, dan loopt er tijdens het oefenen een klok mee die bij nul inlevert. Deze opdracht vervangt `codex/opdrachten/tijdklok.md`; voer die niet meer uit.

## Bestanden
- `assets/vak.js` (logica), `assets/vak.css` (stijl)
- `vak/voorbeeld/index.html` (het sjabloon) en daarna EXACT dezelfde wijziging in alle `vak/*/index.html` (die 36 pagina's verschillen alleen in `<title>`, de og-regels en de versie van `data.js`; controleer dat met een diff)
- `README.md` (de alinea's onder "Vakpagina" bijwerken)
- Cachenummer `?v=` in alle html-bestanden één hoger dan het huidige nummer in `hub.html`

NIET aanraken: `supabase/`, `vak/*/data.js`, `assets/style.css`, `hub.html`, `profiel.html`, `voortgang.html`, `assets/auth.js`, `assets/inzichten.js`, `assets/activiteit.js`. Geen bibliotheek, geen nieuwe tabel, geen nieuwe pagina.

## Wat er nu staat
In `#vak-instellingen` staan drie secties onder elkaar, altijd alle drie zichtbaar: Stap 1 modus (`#modus-keuzes`), Stap 2 niveau (`#niveau-keuzes`, alleen bij vakken met `data-niveaus`), Stap 3 hoofdstukken (`#hoofdstuk-selectie`), en daaronder de kaart `.keuze-start` met `#keuze-samenvatting`, `#keuze-aantal` en `#start-oefening`. De logica zit in `setMode`, `setLevel`, `renderChapters`, `updateStart` en `start(questions, runMode, runLevel)`; `scrollNaar` schuift al naar de volgende sectie.

## Gewenst gedrag
1. **Stap voor stap.** Bij het openen van het vak is alleen Stap 1 zichtbaar. Zodra de student een modus kiest, verschijnt Stap 2 (of, bij een vak zonder Hard mode, meteen de tijdstap) en schuift de pagina er rustig naartoe met de bestaande `scrollNaar`. Zo verder tot en met de hoofdstukken en de kaart Jouw oefening. Een stap die al gekozen is blijft zichtbaar en aanpasbaar; wijzigt de student een eerdere stap, dan blijven de latere stappen zichtbaar met hun keuze. Nieuwe stappen komen in beeld met een zachte animatie (opacity en 8 px omhoog, 200 ms, `var(--ease)`), en bij `prefers-reduced-motion: reduce` zonder animatie en zonder schuiven.
2. **Hoofdstukken standaard aan.** Bij het openen staan alle hoofdstukken met vragen aangevinkt (nu staat er niets aan); de student vinkt uit wat hij niet wil. De knoppen Alles en Niets blijven werken. Bij Examensimulatie blijft de huidige gedimde staat met de zin over alle hoofdstukken.
3. **Nieuwe stap Tijd**, tussen niveau en hoofdstukken, als eigen `<section class="sectie">` met `<p class="keuze-stap">Stap 3</p>` en kop "Hoe lang doe je erover?" (de hoofdstukken worden dan Stap 4; bij een vak zonder Hard mode schuiven de nummers één op). Twee knoppen als radiogroep, net als de niveaukeuze: "Zonder tijd" (standaard) en "Met tijd".
4. **Schuif bij Met tijd.** Kiest de student "Met tijd", dan verschijnt daaronder een `<input type="range">` met `min="45"`, `max="120"`, `step="15"`, standaard `75`, met een label "Tijd per vraag" en een zichtbare waarde ("1 min 15 per vraag"). Daaronder een regel met de totale tijd: "20 vragen, 25 minuten" (aantal vragen maal de seconden, naar boven afgerond op hele minuten). De regel verandert mee als de student de schuif of het aantal vragen wijzigt. Toetsenbord werkt vanzelf via `input[type=range]`; geef het element `aria-describedby` naar de regel met de totale tijd.
5. **Klok tijdens het oefenen.** Alleen als "Met tijd" gekozen is. De totale tijd staat vast bij de start (aantal vragen maal seconden per vraag) en loopt door op basis van de starttijd, niet op een teller per seconde, zodat wisselen van tabblad niets verschuift. Toon hem als `<p class="vak-hint tijdklok" id="tijdklok" hidden>` direct onder `#vraag-teller`, formaat `mm:ss`, `aria-live="off"`. De laatste 60 seconden in `var(--fout)`; bij 5 minuten en bij 1 minuut één keer een `aria-live="polite"`-melding ("Nog 5 minuten"). Nooit knipperen.
6. **Tijd om.** De ronde stopt vanzelf, onbeantwoorde vragen tellen als fout, en het eindscherm toont bovenaan "De tijd was om. Onbeantwoorde vragen tellen als fout." Score, overzicht en de kaart van Comit werken verder zoals nu.
7. **Op het eindscherm** staat bij een ronde met tijd één regel: "Je deed er 14 minuten over van de 25." (afgerond op hele minuten). Zonder tijd verandert het eindscherm niet.
8. **Stoppen** werkt zoals nu en zet de klok stil. Pauzeren bestaat niet. `start()` met een foutenronde of Opnieuw houdt dezelfde tijdinstelling aan.
9. **Kaart Jouw oefening** toont elk onderdeel op een eigen regel in plaats van achter elkaar met punten: Modus, Niveau, Tijd, Hoofdstukken, en daaronder het aantal vragen; de knop Start staat rechts ernaast (op de telefoon eronder). Gebruik de bestaande id's `#keuze-samenvatting` en `#keuze-aantal`; `#keuze-samenvatting` blijft `aria-live="polite"`.
10. **Vaste regels** (zie AGENTS.md): nergens het woord "gratis", geen gedachtestreepjes in zichtbare tekst, geen namen van derden, geen persoonsgegevens of sleutels in de code, knoppen en de schuifknop minstens 44 px hoog, alles in hetzelfde tabblad, licht en donker via de bestaande tokens, geen losse kleurcodes.

## Klaar als
- Bij het openen van een vakpagina is alleen Stap 1 zichtbaar; na elke keuze komt de volgende stap in beeld en schuift de pagina er rustig naartoe.
- Alle hoofdstukken staan standaard aangevinkt; Alles en Niets werken nog.
- Met tijd: de schuif loopt van 45 tot 120 seconden in stappen van 15, de totale tijd klopt met het aantal vragen, en tijdens het oefenen telt de klok af vanaf die tijd.
- Tijd om leidt automatisch naar het eindscherm met de juiste score en de zin uit punt 6; het eindscherm toont de gebruikte tijd.
- Zonder tijd is er geen klok te zien en verandert er niets aan het huidige gedrag.
- Alle `vak/*/index.html` zijn identiek aan het sjabloon op titel, og-regels en de versie van `data.js` na.
- Cachenummer overal verhoogd; README bijgewerkt; `node --check assets/vak.js` slaagt; geen consolefouten; getest in licht en donker, op 375 px en met het toetsenbord.
