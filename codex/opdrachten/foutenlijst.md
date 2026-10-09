# Opdracht: foutenlijst over alle sessies

## Doel
Elke vraag die iemand fout had, blijft per vak bewaard tot hij hem goed heeft. De student kan zijn fouten van alle vorige sessies opnieuw oefenen, niet alleen die van de laatste ronde.

## Bestanden
- `assets/vak.js`, `assets/vak.css`
- `vak/voorbeeld/index.html` en daarna EXACT dezelfde wijziging in alle `vak/*/index.html`
- `README.md` (korte alinea onder "Oefenen en voortgang")
- Optioneel: `supabase/foutenlijst.sql` met een VOORSTEL voor opslag bij het account (niet uitvoeren, niet aanroepen; zie de stopregels in AGENTS.md)

## Gewenst gedrag
1. Opslag lokaal per account en per vak: `localStorage` sleutel `bes_fouten_<vakid>` met `{ profielen: { "gast": [...], "account:<id>": [...] } }`, lijst van vraag-id's (het veld `id` dat `vak.js` aan elke vraag geeft, ook `hard:N`). Zelfde patroon als `bes_voortgang_<vakid>`; altijd in try/catch.
2. Na elk trainingsantwoord en na elke simulatie: fout beantwoorde vragen toevoegen; goed beantwoorde vragen die in de lijst stonden verwijderen. Een vraag staat maximaal één keer in de lijst.
3. Op het keuzescherm (stap 1, naast de kaarten Training en Simulatie) een derde, secundaire knop `knop-secundair` met id `fouten-herhalen`: "Fouten herhalen (N)". Verborgen als N nul is. Klik start een Training met precies die vragen, in willekeurige volgorde, op het huidige niveau (Normaal of Hard hebben elk een eigen lijst, zoals `courseKey`).
4. Op het eindscherm blijft "Fouten opnieuw →" (alleen de fouten van deze ronde) bestaan; daaronder komt een zin "Je foutenlijst voor dit vak: N vragen" met dezelfde knop als in punt 3.
5. Uitloggen of wisselen van account: de lijst van het andere profiel blijft bewaard, zoals bij voortgang.

## Klaar als
- Twee sessies later staan fouten van beide sessies in de lijst; een vraag die daarna goed gaat, verdwijnt eruit.
- "Fouten herhalen (N)" toont het juiste aantal en start alleen die vragen.
- Alle `vak/*/index.html` identiek aan het sjabloon op titel en data.js na; cachenummer verhoogd; geen consolefouten; licht, donker en 375 px getest.
