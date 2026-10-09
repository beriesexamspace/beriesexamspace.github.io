# Opdracht: echte cijfers op Over mij, automatisch geteld

## Doel
Op `over-mij.html` staan drie cijfers (vakken, oefenvragen, bachelorjaren) die met de hand zijn ingevuld en dus verouderen. Laat ze uit de echte data komen, zodat de site nooit een getal noemt dat niet klopt.

## Bestanden
- Nieuw: `lancering/tel-cijfers.js` (node-script) dat `assets/cijfers.js` schrijft.
- Nieuw: `assets/cijfers.js` (gegenereerd, wél in git).
- `over-mij.html`: de drie `.over-cijfer`-blokken lezen uit `window.BES_CIJFERS`.
- `README.md`: korte alinea "Cijfers op Over mij" met hoe je het script draait.

## Gewenst gedrag
1. `node lancering/tel-cijfers.js` leest `assets/vakken.js` en alle `vak/<id>/data.js` (alleen vakken met `v2: true`) en schrijft `window.BES_CIJFERS = { vakken, vragen, hardVragen, hoofdstukken, jaren, bijgewerkt: "2026-09-21" }` naar `assets/cijfers.js`. Tel `vragen.length` en `hardVragen.length` per vak.
2. `over-mij.html` laadt `assets/cijfers.js` (met cachenummer) en vult de drie bestaande `dd`-elementen: vakken, oefenvragen (vragen plus hardVragen, met een punt als duizendtal, bijvoorbeeld 4.209), bachelorjaren. Staat het bestand er niet, dan blijven de huidige getallen in de html staan (de html houdt dus een geldige fallback).
3. Geen nieuwe cijfers erbij, geen claims over geld, bezoekers of leden; alleen wat geteld kan worden uit de repo.

## Klaar als
- Het script draait zonder fouten en het totaal in `assets/cijfers.js` klopt met een handmatige steekproef van twee vakken.
- Over mij toont de getelde cijfers, in licht en donker, op desktop en 375 px.
- Cachenummer verhoogd in alle html-bestanden.
