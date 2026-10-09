# Opdracht: nacontrole van herschreven afleiders (22 vakken)

## Doel
In augustus 2026 zijn bij 22 vakken ongeveer 860 afleiders (foute antwoordopties) herschreven omdat het juiste antwoord te herkenbaar was aan zijn lengte. Die nieuwe afleiders zijn nooit nagekeken. Bij de wel gecontroleerde vakken zat ongeveer 4 procent scheef. Controleer ze nu en herstel wat fout is.

## Bestanden
- Lijsten met de herschreven afleiders: `codex/materiaal/afleiders/<vakid>.json`. Elk item: `sleutel` (positie in de OUDE site, niet betrouwbaar voor v2), `index` (positie van de optie) en `tekst` (de herschreven afleider). Zoek de vraag dus op via de TEKST van de afleider in `vak/<vakid>/data.js`, niet via de sleutel.
- Aanpassingen alleen in `vak/<vakid>/data.js`.
- Doe per pull request maximaal 6 vakken; begin met `inlped`, `stat1`, `mbg`, `ontwikkeling`, `sociologie`, `kpsy`. De andere 16 komen in volgende opdrachten.

## Gewenst gedrag
Per herschreven afleider drie controles:
1. Is de afleider echt FOUT voor deze vraag? Als hij (ook) juist is, of hetzelfde zegt als het juiste antwoord in andere woorden, herschrijf hem tot iets dat duidelijk fout maar geloofwaardig is.
2. Klopt het aangeduide juiste antwoord (`a`) nog met de uitleg (`u`) en met de theorie in hetzelfde bestand? Zo niet: `a` corrigeren, niet de uitleg wegpoetsen.
3. Zijn alle opties ongeveer even lang en in dezelfde stijl (zelfde grammaticale vorm, geen hoofdletter- of puntverschillen die de juiste verraden)?

Verzin geen nieuwe feiten; gebruik alleen wat in het bestand staat. Twijfel? Laat de vraag staan en zet hem in de PR-beschrijving onder "Twijfel, Berat kijkt na" met vraagzin en reden.

## Klaar als
- Per vak in de PR-beschrijving: aantal gecontroleerd, aantal aangepast, lijst van aangepaste vraagzinnen, lijst met twijfels.
- Dit geeft `true` voor elk vak:
  `node -e "global.window={};require('./vak/<id>/data.js');const d=window.BES_VAK;console.log(d.vragen.every(q=>q.v&&q.o&&q.o.length>=2&&(Array.isArray(q.a)?q.a.every(i=>q.o[i]!==undefined):q.o[q.a]!==undefined)))"`
- Geen gedachtestreepjes toegevoegd, geen andere velden gewijzigd dan `o`, `a` en `u`.
