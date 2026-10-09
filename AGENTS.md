# Berie's Exam Space v2: context voor Codex

Je werkt in de repo `beriesexamspace/v2` (GitHub Pages, live op https://beriesexamspace.com/v2/). Werk in een eigen branch en open een pull request; voeg NOOIT zelf samen naar `main`. Lees eerst `README.md` helemaal, daarna de bestanden die de opdracht noemt. De opdrachten staan in `codex/opdrachten/`; werk aan één opdracht per branch.

## Stack

Gewone HTML, CSS en vanilla JavaScript, geen frameworks, geen build-stap, geen npm-dependencies. Gedeelde bestanden in `assets/`: `style.css`, `app.js` (navigatie, muisbol, terugknop), `auth.js` (Supabase-accounts, `BES.auth`), `deur.js` (inloggen verplicht), `vak.js` en `vak.css` (vakpagina), `vakken.js` (lijst van 34 vakken), `updates.js` (Wat is nieuw, met `BES_VERSIE`), `intro.js` en `intro.css` (kennismaking en carrousel), `activiteit.js` (studiekalender). Elk vak: `vak/<id>/index.html` (identiek sjabloon) en `vak/<id>/data.js` (`window.BES_VAK` met `hoofdstukken`, `vragen`, `hardVragen`, `hacks`, `theorie`). Supabase-tabellen: `voortgang`, `feedback`, `studieactiviteit`, `beheerders`; SQL in `supabase/`. De publieke Supabase-sleutel staat in `assets/config.js`; er staan nergens geheimen in de code en dat blijft zo.

## Zo werkt de site nu (versie 34)

1. Startpagina `index.html`: handgeschreven logo, "Jouw leerstof. Jouw eigen space.", knoppen Aanmelden en Log in. Zonder account zijn alleen startpagina, `aanmelden.html`, `inloggen.html`, `wachtwoord.html`, `privacy.html`, `over-mij.html`, `whatsapp.html` en `404.html` bereikbaar. Alle andere pagina's laden `assets/deur.js` in de head en sturen zonder sessie naar `inloggen.html?terug=<pad>`.
2. Aanmelden: naam, e-mail, wachtwoord, of "Verder met Google". Na inloggen stuurt `auth.terugNa` terug naar de pagina van herkomst.
3. Kennismaking `nieuw.html`: één keer per persoon per versie (`BES_VERSIE` in `updates.js`, gezien-status in `localStorage.bes_versie_gezien` en `user_metadata.versie_gezien`). Elf stappen met Volgende, Vorige, Overslaan (`BES.stappen` in `intro.js`). Laatste knop "Begin met leren →". Om hem opnieuw te zien: `hub.html?welkom`.
4. Hub `hub.html`: navigatiebalk schuift binnen, jaarkaarten 1, 2, 3, Tools (Reken je punten, Examen-info, Leren leren, "Praat met Comit" als Binnenkort zonder link), Wat is nieuw, en Hoe werkt het als Apple-carrousel (`BES.carrousel`).
5. Jaarpagina `jaar-1ba.html` enz. → vakpagina. Elke vakpagina heeft drie stappen: Training of Simulatie, Normaal of Hard (Hard alleen bij `inlped`; elders "Komt binnenkort"), hoofdstukken aanvinken, Start. Hard mode vraagt minstens 8 vragen.
6. Oefenen (`assets/vak.js`): Training geeft uitleg per vraag, Simulatie de uitslag op het einde. Voortgang per hoofdstuk lokaal én in de tabel `voortgang` (sleutel `<vakid>` of `<vakid>__hard`). Teal betekent gelukt, blauw betekent doen, grijs is rust.
7. Profiel `profiel.html`: naam, foto, wachtwoord, e-mail, studiekalender, Account wissen (`rpc('account_verwijderen')`).
8. Feedback `feedback.html` schrijft naar de tabel `feedback`. `beheer.html` toont alleen voor beheerders hoeveel accounts per dag oefenden. `voortgang.html` (per vak en hoofdstuk) bestaat maar staat nog nergens gelinkt.

## Vaste regels (MOET)

- Nooit het woord "gratis" op de site. Nooit gedachtestreepjes in zichtbare tekst of vakdata; gebruik een komma, punt of ";".
- Nooit namen van derden op de site. Nooit persoonsgegevens, wachtwoorden of sleutels in code of commits.
- Alles opent in hetzelfde tabblad (geen `target="_blank"`, behalve links naar vub.be).
- Knoppen minstens 44 px hoog. Licht én donker thema via de tokens in `style.css` (`--ink`, `--accent`, `--teal`, `--teal-tekst`, `--surface`, `--line`); nooit losse kleuren.
- Kleurregel: blauw = actie, teal = gelukt of bijzonder, grijs = rust.
- Uitleg op de hub is tekst, geen screenshots van de site in de site.
- Nieuw vak = het sjabloon `vak/voorbeeld/index.html` exact kopiëren; alleen `<title>` en `data.js` verschillen.
- Elk gedeeld bestand in `assets/` gewijzigd? Verhoog het cachenummer in ALLE html-bestanden (zoek `?v=` en tel één op; het huidige nummer staat in `README.md` onder "Regels"), anders zien telefoons de oude versie.
- Raak de oude site (repo `beriesexamspace.github.io`) nooit aan. Verwijder nooit repos, bestanden buiten de opdracht, of Supabase-tabellen.
- Alleen de wijzigingen uit de opdracht maken. Geen extra bestanden, abstracties, refactors of functies erbij.
- Zet in `README.md` een korte alinea over wat je veranderd hebt, in dezelfde stijl als de rest.

## Testen (MOET vóór de PR)

- Start lokaal: `npx http-server . -p 4477 -c-1` en open `http://localhost:4477/`. Controleer licht en donker, desktop en 375 px breed.
- Geen fouten in de browserconsole. Voortgang-, auth- en Supabase-aanroepen alleen met de bestaande `BES.auth.client`.
- Schrijf in de PR-beschrijving: wat er veranderd is, welke bestanden, hoe je het getest hebt, en wat je bewust NIET gedaan hebt.

## Stopregels

Stop en vraag in de PR-beschrijving (niet zelf beslissen) bij: iets dat een Supabase-tabel, policy of SQL-functie moet wijzigen (lever dan wel de SQL mee in `supabase/`, maar voer niets uit); iets dat `auth.js`, `deur.js` of `config.js` moet veranderen; onduidelijkheid over de opdracht; meer dan de genoemde bestanden aanraken.
