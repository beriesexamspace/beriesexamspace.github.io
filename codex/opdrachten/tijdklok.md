# Opdracht: examensimulatie met tijdklok

> Vervangen door codex/opdrachten/oefenen-stappen.md (22-09-2026). Niet meer uitvoeren.

## Doel
Een echte examensfeer: de Examensimulatie krijgt een aftellende klok. Training blijft zonder klok.

## Bestanden
- `assets/vak.js` (logica), `assets/vak.css` (stijl)
- `vak/voorbeeld/index.html` (het sjabloon) en daarna EXACT dezelfde wijziging in alle `vak/*/index.html` (alleen `<title>` en de `data.js`-regel mogen verschillen; controleer dat met een diff)
- `README.md` (korte alinea onder "Vakpagina")

## Gewenst gedrag
1. Alleen in de modus Examensimulatie. Tijd = 1 minuut per vraag (constante `SECONDEN_PER_VRAAG = 60` bovenaan in `vak.js`), dus 20 vragen = 20 minuten.
2. Op het keuzescherm staat bij de kaart Examensimulatie een zin "Met tijdklok: X minuten voor Y vragen" (X en Y uit het gekozen aantal). Op het oefenscherm staat de klok als `<p class="vak-hint tijdklok" id="tijdklok" hidden>` direct onder `#vraag-teller`, formaat `mm:ss`, `aria-live="off"`.
3. De laatste 60 seconden: de klok in de kleur `var(--fout)`. Bij 5 minuten en bij 1 minuut één keer een `aria-live="polite"`-melding ("Nog 5 minuten").
4. Tijd om: de simulatie stopt vanzelf; onbeantwoorde vragen tellen als fout; het eindscherm toont bovenaan de zin "De tijd was om. Onbeantwoorde vragen tellen als fout." De uitslag en het overzicht werken verder zoals nu.
5. Stop → "Ja, stoppen" werkt zoals nu en zet de klok stil. Pauzeren bestaat niet. Bij het verlaten van het tabblad loopt de klok gewoon door (gebruik de starttijd, niet een teller per seconde).
6. Bij "prefers-reduced-motion" niets anders; de klok knippert nooit.

## Klaar als
- Simulatie van 20 vragen toont 20:00 en telt af; Training toont geen klok.
- Tijd om leidt automatisch naar het eindscherm met de juiste score en de zin uit punt 4.
- Alle `vak/*/index.html` zijn identiek aan het sjabloon op titel en data.js na.
- Cachenummer verhoogd in alle html-bestanden; geen consolefouten; licht en donker en 375 px getest.
