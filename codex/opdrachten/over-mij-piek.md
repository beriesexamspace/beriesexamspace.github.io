# Opdracht: op Over mij het volgende blok laten piepen

## Doel
Open je `over-mij.html`, dan vult de kaart "Hoi, ik ben Berie" nu vaak precies het scherm, zodat je niet ziet dat eronder nog "Hoe het allemaal begon" staat. Er moet zonder scrollen al een stukje van die tweede kaart zichtbaar zijn, zodat duidelijk is dat er meer staat.

## Bestanden
- `over-mij.html` (alleen de `<style>` in die pagina zelf)
- Cachenummer `?v=` in alle html-bestanden één hoger dan het huidige nummer in `hub.html`

NIET aanraken: `supabase/`, `assets/style.css`, `assets/*.js`, en van alle andere html-bestanden alleen het cachenummer. Geen tekst, geen markup, geen nieuwe elementen: alleen de bestaande CSS-waarden in `over-mij.html` (padding, margin, gap, lettergrootte van de eerste kaart en de ruimte eromheen) mogen kleiner.

## Gewenst gedrag
1. Zonder te scrollen moet minstens de kop "Hoe het allemaal begon" (of een stukje van die tweede kaart erboven) al net zichtbaar zijn onderaan het scherm, op de gebruikelijke schermhoogtes: 667, 736, 812, 900 en 1024 px, bij 375 px en bij 1280 px breed.
2. Bereik dat door de bestaande ruimte compacter te maken: minder padding in `.over-intro`, kleinere marges bij `.pagina-kop`, minder ruimte tussen de tekstalinea's of de contactrij, in die volgorde van voorkeur. De tekst zelf, de knoppen (Instagram, e-mail, Privacy, minstens 44 px hoog) en de leesbaarheid blijven zoals ze zijn; niks mag verdwijnen of onleesbaar worden.
3. Werkt in licht en donker, en blijft er netjes uitzien op 1280 px breed en breder (niet té krap).

## Klaar als
- Op alle schermhoogtes uit punt 1 zie je zonder scrollen al iets van de tweede kaart.
- De pagina blijft er op 375 px en op een brede desktop verzorgd uitzien, licht en donker.
- Cachenummer overal verhoogd; geen consolefouten.
