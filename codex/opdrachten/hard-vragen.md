# Opdracht: Hard mode-vragen voor vakken die er nog geen hebben

## Doel
Hard mode werkt nu alleen bij `inlped` (14 vragen). Geef de andere vakken elk een eerste set van 10 Hard-vragen, zodat de knop Hard niet meer "Komt binnenkort" toont.

## Bestanden
- Alleen `vak/<id>/data.js` van de vakken in deze batch. Niets anders.
- Batch 1 (deze opdracht): `stat1`, `stat2`, `ontwikkeling`, `philsci`, `logica`. Volgende batches komen als aparte opdrachten.

## Gewenst gedrag
1. Voeg in elk `data.js` de lijst `hardVragen` toe (of vul hem) met 10 vragen, verdeeld over de hoofdstukken (`h` = een bestaand hoofdstuk-id). Zelfde formaat als `vragen`: `{ h, v, o: [...], a, u }`, of `a: [i, j]` met `kies: 'fout'` als het antwoord uit meerdere opties bestaat. Eén juist antwoord: maximaal 5 opties. Meerdere: maximaal 10.
2. Hard betekent: begrippen combineren, een toepassing of casus, "welke stelling is FOUT", of een vergelijking tussen twee begrippen. Geen strikvragen op een woord, geen vragen die alleen op lengte van het antwoord te raden zijn (alle opties ongeveer even lang).
3. Inhoud uitsluitend gebaseerd op wat al in dat `data.js` staat (`vragen`, `theorie`, `hacks`). Verzin geen feiten, jaartallen of namen die daar niet in staan. Twijfel je, dan die vraag weglaten.
4. Elke vraag heeft een `u` (uitleg) van 1 tot 3 zinnen die zegt waarom het juiste antwoord juist is.
5. Geen gedachtestreepjes, nergens het woord "gratis", geen namen van docenten of studenten.

## Klaar als
- Dit geeft `10 true` voor elk vak van de batch:
  `node -e "global.window={};require('./vak/<id>/data.js');const d=window.BES_VAK;console.log(d.hardVragen.length, d.hardVragen.every(q=>q.h&&q.q&&q.o&&q.u&&(Array.isArray(q.a)?q.a.every(i=>q.o[i]!==undefined):q.o[q.a]!==undefined)))"`
- De vakpagina toont Hard als kiesbaar en start een Hard-training met minstens 8 vragen.
- De PR-beschrijving bevat per vak de 10 vragen in het kort (alleen de vraagzin), zodat Berat ze kan nakijken.
