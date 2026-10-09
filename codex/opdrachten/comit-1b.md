# Opdracht: Comit stap 1b (echte antwoorden, zonder AI)

## Doel
Comit (`comit.html`, `assets/comit.js`) geeft nu op alles hetzelfde vaste antwoord. In deze stap geeft hij echte antwoorden op de vier voorstellen en op een paar herkenbare vragen, met de eigen gegevens van de student. Nog geen AI: die koppelt Claude later via een aparte haak (punt 2), daar hoef jij niets voor te bouwen.

## Bestanden
- Nieuw: `assets/comit-antwoorden.js` (alle antwoordlogica)
- `assets/comit.js` (alleen de plek waar nu het vaste antwoord staat, zie punt 2, plus het tekenen van knoppen in een antwoord)
- `assets/comit.css` (alleen stijl voor de knoppen in een antwoord)
- `comit.html` (laad `assets/vakken.js` zonder defer in de head, en `assets/comit-antwoorden.js` met defer vóór `assets/comit.js`)
- `README.md` (kopje Comit aanvullen)
- Cachenummer `?v=` in alle html-bestanden één hoger dan het huidige nummer in `hub.html`

NIET aanraken: `hub.html` (de kaart blijft Binnenkort; alleen het cachenummer), `assets/intro.js`, `assets/vak.js`, `assets/style.css`, `supabase/`, `vak/*/data.js`. Geen bibliotheek, geen nieuwe tabel, geen verbinding met een AI.

## Gewenst gedrag
1. **Eén functie voor antwoorden.** `assets/comit-antwoorden.js` zet `window.BES.comitAntwoord = async (vraag, { client, user }) => ...`. Die geeft een object `{ tekst, knoppen }` terug (`tekst` is gewone tekst, regels gescheiden door `\n`; `knoppen` is een lijst `{ label, href }`, mag leeg zijn), of `null` als hij de vraag niet herkent.
2. **Aansluiten in `comit.js`.** Waar nu na 900 ms het vaste antwoord komt:
   1. `let antwoord = await BES.comitAntwoord(vraag, { client: BES.auth.client, user })`
   2. Is dat `null` en bestaat `window.BES.comitVrij` als functie, dan `antwoord = await BES.comitVrij(vraag, { client: BES.auth.client, user })`. Gooit die een fout of geeft hij `null`, dan verder met stap 3. (Deze haak bouwt Claude later; nu bestaat hij niet.)
   3. Nog steeds niets: `{ tekst: 'Dat kan ik nog niet. Wil je het als feedback sturen?', knoppen: [{ label: 'Stuur als feedback →', href: 'feedback.html' }] }`.
   De puntjes blijven minstens 600 ms zichtbaar, ook als het antwoord sneller klaar is. Tekst altijd als tekst in de wolk zetten (`textContent` of tekstknopen), nooit als HTML. Knoppen komen onder de tekst in dezelfde wolk als `<a class="knop-secundair comit-antwoord-knop" href="...">`, naast elkaar met ruimte ertussen, op de telefoon onder elkaar, minstens 44 px hoog. Links openen in hetzelfde tabblad.
3. **"Waar moet ik nog op oefenen?"** Lees `voortgang` (`vak, hoofdstuk, laatst_goed, laatst_totaal`) van de ingelogde gebruiker. Sla vakken over die eindigen op `__hard` en rijen met `laatst_totaal` onder 3. Kies de drie hoofdstukken met de laagste `laatst_goed / laatst_totaal` onder 80 procent. Hoofdstuknamen haal je uit `vak/<id>/data.js` (laad het script zoals `laadVak` in `voortgang.html`), vaknamen uit `window.BES_VAKKEN`.
   - Tekst: `Deze hoofdstukken hebben nu de meeste aandacht nodig:` en dan per hoofdstuk een regel `Vaknaam · Hoofdstuknaam · 40 procent goed`.
   - Knoppen: per hoofdstuk `Oefen Hoofdstuknaam →` naar `vak/<id>/?hoofdstuk=<hoofdstuk-id>` (die link start al meteen een training).
   - Niets geoefend: `Je hebt nog niets geoefend. Kies een vak, dan zie ik daarna waar je kan groeien.` met knop `Naar de hub →` (`hub.html`).
   - Alles 80 procent of hoger: `Alles wat je oefende zit op 80 procent of hoger. Kies een nieuw hoofdstuk of probeer Hard mode.` met knop `Naar de hub →`.
4. **"Hoe ging mijn week?"** Lees `sessies` (`goed, totaal, gemaakt_op`) van de laatste 14 kalenderdagen, lokale tijd, zoals `voortgang.html` het doet. Deze week = vandaag en de zes dagen ervoor, vorige week = de zeven dagen daarvoor.
   - Tekst: `Deze week: 4 sessies, 42 vragen, 24 procent goed.` en op een nieuwe regel het verschil: `Dat is 8 punten beter dan vorige week.` / `Dat is 5 punten minder dan vorige week.` / `Even goed als vorige week.` / `Vorige week had je nog niet geoefend.`
   - Deze week niets: `Deze week heb je nog niet geoefend. Eén korte ronde is al een goed begin.`
   - Knop: `Weekoverzicht →` (`voortgang.html`).
5. **"Hoe werkt Hard mode?"** Vaste tekst: `Hard mode is een moeilijker niveau met toepassings- en casusvragen. Je kiest het op de vakpagina bij de stap Niveau. Bij vakken waar het nog niet kan, staat Hard mode grijs met Binnenkort. Je voortgang op Hard telt apart.` Geen knop.
6. **"Hoe werkt de tijdklok?"** Vaste tekst: `Op de vakpagina kies je bij de stap Tijd voor Met tijd en stel je 45 seconden tot 2 minuten per vraag in. Tijdens het oefenen telt de klok af. Bij nul stopt de ronde en tellen onbeantwoorde vragen als fout. Op het eindscherm zie je hoe lang je erover deed.` Geen knop.
7. **Getypte vragen.** Herken (hoofdletters negeren) deze woorden en geef hetzelfde antwoord als bij het bijbehorende voorstel: `hard` → punt 5; `tijd` of `klok` → punt 6; `week` → punt 4; `oefenen`, `zwak`, `slecht` of `verbeter` → punt 3. Extra vaste antwoorden:
   - `wachtwoord`, `profiel`, `naam` of `e-mail`: `Je naam, e-mailadres en wachtwoord pas je aan op Profiel, via de knop Bewerken.` met knop `Naar Profiel →` (`profiel.html`).
   - `wissen` of `verwijderen`: `Je account wis je via Profiel, onderaan bij Account wissen. Je ziet eerst precies wat er verdwijnt.` met knop `Naar Account wissen →` (`account-wissen.html`).
   - `deliberatie`, `tweede zit`, `herexamen` of `inschrijven`: `Daar staat veel over in Examen-info.` met knop `Naar Examen-info →` (`examen-info.html`).
   Niets herkend: `null` teruggeven.
8. **Fouten.** Lukt het ophalen uit Supabase niet: `Ik kon je voortgang nu niet ophalen. Probeer het zo opnieuw.` zonder knop.
9. **Vaste regels** (zie AGENTS.md): nergens het woord "gratis", geen gedachtestreepjes in zichtbare tekst, geen namen van derden, geen persoonsgegevens of sleutels in de code, knoppen minstens 44 px, licht en donker via de bestaande tokens, 375 px zonder zijwaarts scrollen.

## Klaar als
- De vier voorstellen geven het juiste antwoord, met echte cijfers voor 3 en 4 (controleer één keer met de hand tegen de tabellen) en werkende knoppen.
- De getypte woorden uit punt 7 geven het juiste antwoord; iets onbekends geeft de feedbackregel met knop.
- Zonder `window.BES.comitVrij` werkt alles; met een proef-`comitVrij` die `{ tekst: 'proef', knoppen: [] }` teruggeeft verschijnt 'proef' bij een onbekende vraag (daarna die proef weer weghalen).
- `node --check` slaagt op `assets/comit.js` en `assets/comit-antwoorden.js`; geen consolefouten; licht, donker, 375 px en 1280 px getest; cachenummer overal verhoogd; `hub.html` inhoudelijk ongewijzigd.
