# Berie's Exam Space v2

Nieuwe versie van beriesexamspace.com, in opbouw. Live voorbeeld (niet delen tot het af is): https://beriesexamspace.com/v2/

## Hoe we hieraan werken

Voor Codex staat de volledige context in `AGENTS.md` (wordt door Codex automatisch gelezen) en staan de losse opdrachten in `codex/opdrachten/`; zie `codex/opdrachten/LEESMIJ.md`.
- Claude Code bouwt alle stappen (sinds 14-09-2026). Codex springt alleen bij als Berat dat vraagt, in een eigen branch met een PR. Nooit tegelijk aan hetzelfde bestand.
- Elke stap is een eigen commit met de stapnaam in het bericht, bijvoorbeeld `Stap 2: gedeelde basis`.
- Voor je begint: eerst de laatste versie ophalen (`git pull`). Na je stap: alles committen en pushen.
- De bouwstappen (1, 1b, 2, 3, 4, 5, 6a, 6b, 6c) staan in Berats to-do lijst; elke stap is een aparte prompt.

## Bestandsstructuur (doel)
```
index.html            startpagina (de deur)
aanmelden.html        account maken, één vraag per stap
inloggen.html         inloggen en herstelmail aanvragen
wachtwoord.html       wachtwoord instellen via een herstel-link
nieuw.html            highlights-carrousel na iedere nieuwe login, vóór de hub; daarna stelt Comit zich één keer per toestel voor in een laag over bijna het hele scherm (localStorage bes_comit_voorgesteld), met Praat met Comit of Later
hub.html              jaren + tools
over-mij.html         kennismaking, sociale links en het ontstaan van de site
profiel.html          naam, e-mailadres, profielfoto, wachtwoord en studiekalender
jaar-1ba.html         vakken 1ste bachelor
jaar-2ba.html         vakken 2de bachelor
jaar-3ba.html         vakken 3de bachelor
whatsapp.html         uitleg, link en QR-code (assets/whatsapp-qr.svg, gemaakt met `npx qrcode`) naar de WhatsApp-groep
feedback.html         feedback sturen (fout in een vraag, idee, iets anders) naar de tabel feedback
leren.html            leren leren: slim studeren, concentratie en hulplijnen; gelinkt vanaf de hub (Tools) en boven elk tabblad Studie-hacks
examenplan.html       Jouw examenplan (Pro): examendata per vak (tabel examendata), plan voor de komende zeven dagen (twee hoofdstukken per dag, eerst nieuw en dan laagste score, de dag voor een examen een simulatie), weekcijfers en drie verbeterpunten met Ezelsbruggetjes van Comit (soort ezelsbrug); zonder Pro een uitlegkaart; gelinkt vanaf de hub
fouten.html           Foutenlijst (Plus en Pro): open fouten per vak uit de tabel fouten, met knop naar vak/<id>/?fouten=1; zonder Plus een uitlegkaart; gelinkt vanaf de hub (Tools)
voortgang.html        Jouw voortgang: per vak en per hoofdstuk wat je kent (tabel voortgang, hoofdstuknamen uit vak/<id>/data.js, laagste score bovenaan); staat sinds 21-09 niet meer op de hub (Berat: later bij Profiel of later), alleen via de URL bereikbaar
privacy.html          wat we bewaren, waar, cookies, rechten en contact; gelinkt in elke voettekst en onder het aanmeldformulier
abonnement.html       Free, Plus (2,99 euro per maand) en Pro (9,99 euro per maand, nog bezig): drie kaarten plus "Goed om te weten"; openbaar (geen deur) zodat Mollie hem kan keuren; nog nergens gelinkt, betaalknop staat uit; geen kaart staat standaard blauw, alleen de kaart onder de muis wordt blauw en komt iets naar voren; Probeer 1 maand start de proefmaand (start_proef) en stuurt naar profiel.html#abonnement, de knoppen tonen je huidige plan; Profiel toont plan, einddatum en Opzeggen (zeg_op)
beheer.html           alleen voor de beheerder (link Beheer in het profielmenu, via is_beheerder): accounts, nieuwste accounts (e-mail afgeschermd), abonnementen, oefenen, Comit, feedback, vertrekredenen en per dag; data uit beheer_overzicht() (supabase/beheer-overzicht.sql, uitgevoerd 26-09-2026) en studie_dagcijfers()
404.html              nette foutpagina van GitHub Pages; gebruikt absolute paden /v2/ (bij de lancering aanpassen)
manifest.webmanifest  naam, kleuren en iconen voor "Zet op beginscherm" (Android); Safari gebruikt de apple-touch-icon
vak/voorbeeld/        vak-template (index.html + data.js)
assets/style.css      gedeelde stijl
assets/app.js         gedeelde logica (nav, fade, terugknop, naam)
assets/config.js      publieke Supabase-instellingen
assets/auth.js        gedeelde sessie- en accountlogica; de knop Profiel in de nav klapt een menu uit (Profiel, Abonnement, Weekoverzicht, Foutenlijst, Examenplan, Uitloggen), met je naam en plan bovenaan; dicht met Escape of een klik ernaast
assets/deur.js        de deur: pagina alleen voor ingelogde accounts (in de head laden)
assets/vak.css        aanvullende stijl van de vakpagina
assets/vak.js         logica van de vakpagina
assets/vakken.js      lijst van alle vakken per jaar
assets/updates.js     updates voor de sectie Wat is nieuw op de hub
assets/intro.css      stijl van de stap-voor-stap-intro (welkomstscherm en Hoe werkt het op de hub), inclusief de animaties per stap
assets/intro.js       bouwt de stappen: BES.stappen(element, { soorten, kopniveau, overslaan, lus, laatsteTekst, bijKlaar })
assets/icoon-*.png    beginscherm-iconen (180 Apple, 192 en 512 manifest); assets/deel.png is het deelvoorbeeld (1200x630) voor WhatsApp en co
assets/activiteit.js  persoonlijke dagtotalen, bezoeksessies en studiekalender
assets/plan.js        BES.plan(): Free, Plus of Pro van het account via mijn_abonnement(); BES.heeftPlan("plus"), BES.planNaam, BES.planDatum; laden na auth.js; Hard mode en Met tijd op de vakpagina (vak.js, label Met Plus) en het weekoverzicht met verbeterpunten op voortgang.html zijn alleen voor Plus en Pro
supabase/examendata.sql tabel examendata (vak, datum), lezen en wissen eigen rijen, opslaan alleen met Pro via de policy (uitgevoerd 26-09-2026); vak.js toont met Pro na elke simulatie de vergelijking met je vorige simulatie (tabel sessies)
supabase/fouten.sql   tabel fouten (sleutel = hash van de vraagtekst met n: of h:) en fouten_bijwerken(vak, fout, goed), alleen met Plus of Pro (uitgevoerd 26-09-2026); vak.js bewaart na elke ronde de foute en goede antwoorden en toont bovenaan de keuzes "Oefen je fouten"
supabase/abonnementen.sql tabellen abonnementen en proefmaanden plus mijn_abonnement(), start_proef(plan) en zeg_op() (uitgevoerd 25-09-2026); proefmaand van 1 maand zonder betaalgegevens, elke proef één keer per account
assets/inzichten.js   Jouw voortgang op Profiel: balk per vak en laatste sessies (tabellen voortgang en sessies)
supabase/sessies.sql  tabel sessies: één rij per afgeronde ronde
assets/kalender.css   aanvullende stijl voor de studiekalender
supabase/studieactiviteit.sql optionele accountopslag voor de studiekalender
supabase/account-en-beheer.sql account_verwijderen(), tabel beheerders, studie_dagcijfers() en studie_totalen() (uitgevoerd op 20-09-2026)
lancering/maak-doorsturen.js maakt doorstuurpagina's voor de oude vaklinks; uitvoer lancering/doorsturen/ staat niet in git en gaat pas bij de lancering naar de oude site
referentie/comit-schetsen.html drie schetsen van de mascotte Comit met vier bewegingen, niet gelinkt, alleen om te kiezen
referentie/comit-pixel/ Comit als pixel-poppetje: raster + palet in comit-pixel.js (bron voor SVG op de site en voor PNG via node maak-png.js), voorbeeldpagina index.html; trainingspak wit in licht, zwart in donker
```

## Stand van zaken
- Klaar: startpagina, gedeelde basis, accounts, hub, drie jaarpagina's, vak-template en oefenlogica. Het voorbeeldvak bevat 14 vragen, waaronder twee vragen met meerdere te kiezen antwoorden. Alle 34 vakken in `assets/vakken.js` hebben een eigen map met overgezette inhoud; Sociologie I (19-09-2026) gebruikt het formaat met meerdere antwoorden (`a: [..]` en `kies: 'fout'`), en vragen met één antwoord maar meer dan vijf opties staan daar als lijst met één index.
- De jaarpagina's zijn één sjabloon; alleen `data-jaar` op `<body>`, de titel en de `<h1>` verschillen. De vakkaarten linken naar de bestaande tools op de huidige site tot `v2: true` staat in `vakken.js`.
- Gedeelde kaartstijl in `style.css`: `.pagina` (binnenpagina met terugknop), `.kaart-pijl`, `.kaart-tekst`, `.kaart-titel`, `.kaart-sub`, `.pijl`, `.rooster-2`, `.sectie`, `.sectie-kop`.
- Reken je punten en Examen-info staan nu in v2 (`reken.html` en `examen-info.html`), bereikbaar via de tool-kaarten op de hub.
- De startpagina (`index.html`) heeft bewust geen navigatiebalk en past in één schermhoogte. De getekende muisaanwijzer (overgenomen uit Helder) zit in `style.css` en `app.js`; hij kiest zwart of wit op basis van de tekst die hij raakt (lichte tekst = zwarte bol, donkere tekst = witte bol, ook als de bol de tekst maar half raakt) en anders op basis van de berekende achtergrondkleur onder de muis, inclusief transparante bovenliggende vlakken. Op touch verschijnt hij niet.
- Gedeelde helpers staan op `window.BES` (`naamOpslaan`, `naamOphalen`, `jaarOpslaan`, `jaarOphalen`); de losse `window.naamOpslaan` enz. blijven als alias bestaan.
- Navigatiebalk: `<nav class="navigation">` of `<nav class="nav-vol">` staat bovenaan gecentreerd met zijmarges en wordt bij scrollen een pill. De ruststand is maximaal 1160 px breed, de zwevende stand maximaal 1100 px. De startpagina heeft geen balk. Elke binnenpagina heeft naast het logo een Home-knop naar de hub. Op `profiel.html` houdt `data-nav="vast"` de balk stil. Uitloggen staat onder Opslaan op Profiel; de bestaande uitloglink op de startpagina blijft werken. De logolink blijft naar de startpagina wijzen.
- Kleurvariabelen: `--ink-soft`, `--grey-title`, `--accent-dark`, `--line` (#E9E7F3), `--pill`, `--font`, `--ease`; `--muted`, `--secondary`, `--radius-pill` en `--font-family` zijn aliassen daarvan.

## Regels
- Verandert een gedeeld bestand in `assets`? Verhoog dan in alle pagina's het nummer achter `?v=` (nu 81), anders zien telefoons nog tien minuten de oude versie.
- Alleen HTML, CSS en vanilla JavaScript. Geen framework, geen build-stap.
- De Supabase-client is de enige externe JavaScript-bibliotheek, vastgezet op `2.45.4` via `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js`.
- Kleurregel: blauw = doen (knoppen, links, balk), teal = bijzonder (logo, gelukt, afgerond, "Laatst gekozen"), grijs = rust. Rood is alleen voor de afgesproken foutmarkering bij een ongeldig veld of onjuist antwoord.
- Relatieve links, zodat alles lokaal en op GitHub Pages werkt.
- De live site (beriesexamspace.github.io) wordt niet aangeraakt tot v2 klaar is.

Sinds 06-10-2026 vermeldt `voorwaarden.html` Berat Yildirim als eenmanszaak met KvK-nummer 42183092 bij Wie we zijn en in het modelformulier. Het telefoonnummer is +31 6 1568 5727; het adres en het btw-nummer blijven aangekondigd. De melding "Betalen kan nog niet." blijft staan. Alleen deze teksten zijn aangepast; het cachenummer blijft 79.

Sinds 04-10-2026 toont de vakkaart Inleiding pedagogiek 145 vragen, waarvan 50 uit echte examens. Forensische Psychiatrie vermeldt 47 oefenvragen over 6 hoofdstukken, met uitleg. De verwijzingen naar examenreconstructies zijn verwijderd volgens de afspraak van 21-09-2026. De vakdata zijn gelijk gebleven. Cachenummer: 77.

Elke regel in `assets/updates.js` heeft `soort: 'nieuw'` of `soort: 'verbeterd'`, een datum en tekst. De hub toont eerst vier regels; bij meer regels wisselt de knop tussen Alles bekijken en Minder tonen. Het updatescherm na inloggen toont altijd alle regels. Beide gebruiken dezelfde labels en veilige tekstweergave.

In `assets/updates.js` mogen korte belangrijke stukjes in `tekst` tussen `**dubbele sterretjes**` staan. Ze verschijnen als vetgedrukte tekst op de hub en het updatescherm. De rest blijft gewone tekst; HTML wordt niet uitgevoerd. Gebruik nadruk voor de naam van een veranderd onderdeel, niet voor hele alinea's.

Hover volgt de werkelijk gebruikte invoer via `html.has-hover`: muisbewegingen schakelen de effecten in, aanraken schakelt ze uit. Dit werkt ook in ingebouwde browsers die geen hovermogelijkheid melden. Knoppen bewegen maximaal 2 px met een kleine vergroting; bij verminderde beweging blijven alleen kleur en schaduw veranderen.

## Verkoop je boeken

`boeken.html` is bereikbaar via de hub en gebruikt voor alle ingelogde accounts de bestaande client. Studenten zoeken op titel of vak, filteren per jaar, plaatsen een boek met maximaal drie verkleinde foto's en nemen via WhatsApp contact op. Bij Mijn boeken kunnen ze de prijs wijzigen, verlengen, als verkocht markeren en hun advertentie met foto's wissen. Meldingen verschijnen met aantallen en een bevestigde wisactie in Beheer. Nummers komen uit Supabase, worden nooit lokaal opgeslagen en verdwijnen bij uitloggen uit de pagina. Sociologie bevat geen hoofdstuk h17 of bijbehorende vragen meer; h18 en h19 zijn behouden.

De SQL is alleen voorbereid, niet uitgevoerd. Na het oplossen van de open punten in de PR is de volgorde: `supabase/boeken.sql`, `supabase/account-en-beheer.sql`, `supabase/beheer-overzicht.sql`. De fotokeuze is nog open: de opdracht noemt een openbare bucket, terwijl de privacytekst toegang beperkt tot ingelogde studenten. De bucket staat voorlopig privaat; de pagina gebruikt nog de voorgeschreven openbare foto-URL's. Ook accountwissen moet eerst echte boekbestanden via de Storage API opruimen; de SQL blokkeert wissen zolang die bestanden bestaan. De benodigde aanvulling in `account-wissen.html` valt buiten de toegestane bestanden en wacht op akkoord. Deze versie is daarom nog niet klaar voor ingebruikname. Beheer wist de advertentie en meldingen, maar laat de fotobestanden in de map van de verkoper tot diens accountopruiming. Cache 65.

## De deur: inloggen verplicht

Sinds 23-09-2026 staat de nieuwe site dicht tot de lancering. `openDeur` in `auth.js` vraagt na het inloggen `heeft_toegang()` op (SQL in `supabase/toegang.sql`, uitgevoerd): alleen beheerders en accounts in de tabel `toegang` komen binnen, alle anderen gaan naar `gesloten.html` ("nog niet open", met knop naar de WhatsApp-groep en Uitloggen). `aanmelden.html` toont een melding in plaats van het formulier zolang `site_open()` onwaar is, en aanmelden van nieuwe accounts staat in Supabase uit. Openen bij de lancering: in de SQL-editor `update public.site_instellingen set waarde = true where sleutel = 'open';` en in Supabase bij Authentication het aanmelden weer aanzetten. Iemand eerder binnenlaten: zijn gebruikers-id in `public.toegang` zetten.

Sinds 20-09-2026 zijn de hub, het welkomstscherm, de jaarpagina's, alle vakpagina's, de tools (reken, examen-info, leren), feedback, profiel en beheer alleen voor ingelogde accounts. Elke pagina laadt `assets/deur.js` in de head (zonder defer): zonder Supabase-sessie in localStorage (sleutel `sb-…-auth-token`) gaat de bezoeker meteen naar `inloggen.html?terug=<pad>`; met sessie krijgt `<html>` de klasse `deur-check` (pagina onzichtbaar, maximaal 4 seconden) tot `auth.js` het account bevestigt (`openDeur`), anders alsnog naar inloggen. Na het inloggen stuurt `auth.terugNa` terug naar de pagina van herkomst (alleen eigen relatieve paden). Openbaar blijven: startpagina, aanmelden, inloggen, wachtwoord, privacy, Over mij, WhatsApp-pagina en 404.

## Accounts (Supabase)

Sinds 22-09-2026 opent `profiel.html` als één kaart met foto, naam en e-mailadres en de knop Bewerken (`#profiel-bewerken`); het formulier (`#profiel-form`) staat dicht tot je die knop gebruikt, met Opslaan en Annuleren, en sluit na het opslaan. Daaronder staan de studiekalender en Jouw voortgang, en onderaan een rij met Uitloggen en de link Account wissen die het bestaande blok opent.

Sinds 07-10-2026 bewegen de knoppen en actielinks in de profielinhoud rustig omhoog en worden ze iets groter bij aanwijzen met de muis; bij klikken of tikken drukken ze kort in. Dit geldt ook voor abonnementsacties en de keuzes onder Over jezelf. Kalenderdagen en de dicht bij elkaar staande abonnementsacties bewegen minder ver zodat ze elkaar niet raken. Uitgeschakelde knoppen bewegen niet en bij verminderde beweging staan de effecten uit. Alleen de eigen stijlen in `profiel.html` zijn aangepast; gedeelde bestanden en het cachenummer blijven gelijk.

1. De beheerder vult `assets/config.js` in met de project-URL en publieke anon key uit Supabase, via Settings → API. Vervang `[SUPABASE_URL]` en `[SUPABASE_ANON_KEY]`. De anon key mag publiek zijn; voeg nooit een geheime sleutel of service-role key toe.
2. Zet onder Authentication → Providers → Email de instelling "Confirm email" uit. Een nieuw account krijgt dan direct een sessie.
3. Stel in dezelfde e-mailinstellingen de minimale wachtwoordlengte in op 8 tekens en voeg geen extra tekenvereisten toe, zodat de server overeenkomt met de formulieren.
4. Stel onder Authentication → URL Configuration de Site URL in op `https://beriesexamspace.com/v2/` en voeg `https://beriesexamspace.com/v2/wachtwoord.html` toe als Redirect URL.
5. Test na het invullen aanmelden, inloggen, herstelmail, het nieuwe wachtwoord en uitloggen. Zonder ingevulde instellingen blijven accounts uitgeschakeld en kan iedereen wel oefenen. Voor herstelmail in een lokale preview moet ook de exacte lokale `wachtwoord.html`-URL in Supabase als Redirect URL zijn toegestaan.

Nieuwe accounts bewaren `voornaam`, `achternaam` en de optionele `bijnaam` in Supabase user metadata. `naam` blijft de volledige naam voor bestaande koppelingen. `BES.auth.naamGegevens(user)` geeft de volledige naam en aanspreeknaam terug; `BES.naamOpslaan` bewaart de bijnaam of voornaam. Alleen Profiel toont de volledige naam. Een oude, ongesplitste naam wordt niet automatisch verdeeld en blijft op Profiel behouden; de hub gebruikt daarvoor een algemene begroeting totdat de gebruiker de losse velden invult. Bestaande gebruikers hoeven naamvelden niet opnieuw in te vullen om hun wachtwoord of e-mailadres te wijzigen.

De client wordt na `app.js` en `config.js` geladen; `auth.js` regelt de sessie en de inloglink centraal. `BES.auth.client` geeft de bestaande Supabase-client door aan de vakpagina. Voortgang tussen toestellen werkt voor ingelogde gebruikers na het aanmaken van de tabel en toegangsregels onder "Vakpagina".

Sinds 04-10-2026 komt na Account maken een optioneel scherm "Vertel een beetje over jezelf" (studie, jaar, een vrije tekst van hoogstens 300 tekens en de keuze Alleen Berie of Openbaar), met Opslaan of Overslaan. Het formulier en de weergave staan in `assets/over-jezelf.js` (`BES.overJezelf`), de gegevens in `user_metadata.over` via `BES.auth.profielBijwerken({ over })`; `auth.js` maakt ze schoon en `BES.auth.overGegevens(user)` leest ze. Op `profiel.html` staat het blok Over jezelf met Bewerken en Alles weghalen. `beheer.html` toont het per account zodra `supabase/beheer-overzicht.sql` opnieuw is uitgevoerd. Openbare profielen zijn voor anderen nog nergens te lezen; dat is de volgende stap. Cachenummer: 77.

### Inloggen met Google

`aanmelden.html` en `inloggen.html` hebben de knop "Verder met Google" (`BES.auth.metGoogle()`). De knop controleert eerst of de provider aanstaat; zolang dat niet zo is, toont hij de rode regel "Inloggen met Google is nog niet ingeschakeld." en blijft de gebruiker op de pagina. Na een geslaagde login komt de gebruiker terug op `inloggen.html?google=terug`, waarna de bestaande logica hem naar de hub stuurt (en dus eerst langs `nieuw.html`). Ontbreken voornaam en achternaam, dan neemt `auth.js` ze één keer over uit de naam die Google meegeeft. De profielfoto van Google wordt niet overgenomen.

Eenmalig inrichten door de eigenaar:
1. Google Cloud Console (console.cloud.google.com): nieuw project, "APIs & Services" → "OAuth consent screen" (extern, app-naam Berie's Exam Space, je e-mailadres), daarna "Credentials" → "Create credentials" → "OAuth client ID", type "Web application".
2. Bij "Authorized redirect URIs" de callback-URL plakken die Supabase toont onder Authentication → Providers → Google (eindigt op `/auth/v1/callback`).
3. Client ID en Client Secret in Supabase bij de Google-provider plakken, de provider aanzetten, Save.
4. Supabase → Authentication → URL Configuration → Redirect URLs: `https://beriesexamspace.com/v2/inloggen.html?google=terug` toevoegen (en voor de zekerheid `https://beriesexamspace.com/v2/**`).
5. Testen met een Google-account dat nog geen Berie-account heeft: knop, Google-scherm, terug op de site, "Wat is nieuw", hub met voornaam, en op Profiel de naam.

### E-mailadres wijzigen

Profiel gebruikt de bestaande `auth.updateUser`-functie. De gebruikers-ID blijft gelijk. De bevestiging volgt de huidige Supabase-instellingen; schakel beveiligde e-mailwijziging niet uit. Zolang de provider een `new_email` teruggeeft, meldt Profiel dat bevestiging nodig is. Alleen `user.email` geldt als het bevestigde adres.

Voeg voor deze flow `https://beriesexamspace.com/v2/profiel.html?email=bevestigen` toe aan de toegestane redirect-URL's in Supabase. Voor een echte lokale test is ook de exacte lokale URL nodig. De wijziging in deze PR voert geen configuratie-aanpassing of e-mailverzending uit. Browsercontroles gebruiken een nagebootste auth-provider; een echte bevestigingsmail, inclusief eventuele bevestiging via het oude adres, moet na inrichting met een testaccount worden gecontroleerd.

Een project op het instapplan kan na een week zonder voldoende gebruik pauzeren. Open dan het project in het Supabase-dashboard en kies "Resume project". Zie de [Supabase-uitleg over projectpauzes](https://supabase.com/docs/guides/platform/free-project-pausing).

## Versies en het welkomstscherm

Sinds 22-09-2026 toont de stap "Oud naast nieuw: startpagina" echte schermafbeeldingen (`assets/intro/oud-start.png` en `nieuw-start.png`, 480 px breed op 2x, met headless Chrome gemaakt; de nieuwe in het lichte thema). De knop "Word lid" in de WhatsApp-stap heeft het WhatsApp-icoon.

Het welkomstscherm (`nieuw.html`, de highlights-carrousel met de dia Wat is nieuw) verschijnt **één keer per persoon per versie**. Het versienummer staat in `assets/updates.js` als `window.BES_VERSIE`; elke update in `BES_UPDATES` heeft een `versie`. De dia Wat is nieuw toont alleen de updates van de huidige versie (maximaal vijf) met het label "Versie N"; de hub toont onder Wat is nieuw alles.

Hoe het bijhoudt wie het gezien heeft: "Begrepen →" zet `localStorage.bes_versie_gezien` en, bij een ingelogd account, `user_metadata.versie_gezien` (via `profielBijwerken({ versieGezien })`). De poort in de head van `hub.html` laat iedereen door die het lokaal al zag; anders krijgt `<html>` de klasse `versie-check` (pagina onzichtbaar, maximaal 2,5 seconde) en beslist de pagina na DOMContentLoaded op basis van het account: al gezien op een ander toestel, dan lokaal noteren en doorgaan; anders naar `nieuw.html`. Gasten zonder account zien het dus één keer per toestel. Aanmelden en inloggen sturen gewoon naar de hub; die beslist zelf. Om de kennismaking opnieuw te zien (testen): `hub.html?welkom`; dat wist alleen de lokale vlag en opent het welkomstscherm; na "Begrepen →" staat alles weer als gezien. Sinds 29-09-2026 wist uitloggen de lokale vlaggen `bes_versie_gezien` en `bes_comit_voorgesteld`; na opnieuw inloggen beslist dus het account. Wie het account-veld `versie_gezien` weghaalt (SQL op auth.users), krijgt na uitloggen en inloggen de hele kennismaking opnieuw, inclusief het voorstelscherm van Comit.

**Nieuwe versie uitbrengen** (alleen als Berat het zegt, alle wijzigingen van de tussenliggende periode samen): 1) de updates toevoegen met `versie: N`, 2) `window.BES_VERSIE = N`, 3) cachenummer verhogen. Daarna ziet iedereen die inlogt het scherm één keer.

`nieuw.html` is sinds 20-09-2026 (avond) een stap-voor-stap-intro: één kaart per stap met "Volgende →", "← Vorige", "Overslaan" en een teller, elf stappen (Welkom, drie keer Oud naast nieuw (startpagina, oefenen, hoofdstukken), Vakken, Examensimulatie, Hoofdstukken kiezen, Voortgang, Laptop-tip met iPhone en laptop naast elkaar, WhatsApp-groep met QR, Wat is nieuw als uitleg van het blok op de hub met de drie laatste updates in het klein). De getekende iPhone (rand, dynamisch eiland, thuisbalkje) veert één keer binnen en blijft daarna staan zolang opeenvolgende stappen een telefoon tonen; alleen het scherm en de tekst wisselen (`telefoon: true` + `scherm` in de stap). Niets loopt vanzelf; elke stap heeft korte animaties (elementen komen na elkaar binnen, vinkjes tikken aan, balken vullen, een antwoord wordt gekozen) via klassen `anim`, `anim-pop`, `anim-vink`, `anim-vul` (met `--doel`), `anim-kies`, `anim-teal`, `anim-puls` en `--i` voor de volgorde; bij "prefers-reduced-motion" staan ze uit en staat alles meteen in de eindstand. Vegen werkt op de telefoon, pijltoetsen op de pc. De laatste knop heet "Begin met leren →" en schuift op de laatste stap naar het midden; Overslaan telt ook als gezien. Het scherm van de iPhone en de laptop is altijd wit (lichte kleuren), ook in de donkere modus; het beeldvak is daar wat grijzer zodat de zwarte rand van de toestellen zichtbaar blijft. De beelden zijn getekende telefoons in gewone opmaak (geen screenshots van de site). Let op: de klasse `.intro` bestaat al in style.css (startpagina), daarom heten de klassen hier `.stappen` en `.stap-*`.

De licht/donkerkeuze staat in `localStorage.bes_thema` (`licht` of `donker`). Zonder keuze volgt de pagina het systeem. Bij ingelogde accounts wordt de keuze ook opgeslagen in `user_metadata.thema`; de accountkeuze wordt toegepast zodra de sessie geladen is. Het kleine script vóór de stylesheet past de lokaal bekende keuze al vóór het eerste beeld toe. Op een nieuw toestel kan de accountkeuze pas worden toegepast zodra de accountgegevens beschikbaar zijn. `BES.themaToepassen()` past een keuze toe en bewaart die lokaal.

### Profielfoto's inschakelen

Voer onderstaande SQL één keer uit via **SQL Editor → Run**. De bucket is publiek leesbaar zodat avatars kunnen worden weergegeven. Elk ingelogd account kan alleen het eigen bestand schrijven, bijwerken of verwijderen. Profielfoto's worden in de browser vierkant bijgesneden, verkleind tot 256 × 256 pixels en als JPEG opgeslagen. De pagina weigert een resultaat groter dan 150 KB; de bucketlimiet is 200 KB.

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 204800, array['image/jpeg'])
on conflict (id) do nothing;
create policy "avatar lezen" on storage.objects for select using (bucket_id = 'avatars');
create policy "eigen avatar uploaden" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));
create policy "eigen avatar bijwerken" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));
create policy "eigen avatar verwijderen" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '.', 1));
```

Zolang de bucket ontbreekt, meldt de profielpagina "Foto's zijn nog niet ingeschakeld." bij een fotobewerking. Naam, wachtwoord en thema blijven zelfstandig werken. De publieke foto-URL met tijdparameter staat in `user_metadata.foto`. Een upload en de daaropvolgende metadatawijziging zijn aparte verzoeken; bij een storing toont de pagina een fout en kan de gebruiker opnieuw proberen. Voer na het aanmaken van de bucket een echte upload en verwijdering uit en controleer met een tweede account dat alleen het eigen bestand aangepast kan worden. De browsercontroles bij deze wijziging gebruiken een nagebootste account- en opslagdienst en veranderen geen bestaande accounts of bestanden.

## Privacy, account wissen en beheer

Sinds 22-09-2026 is account wissen een eigen pagina, `account-wissen.html` (achter de deur, `noindex`), in drie stappen: wat er verdwijnt (ook: een betaald abonnement stopt en de lopende maand wordt niet terugbetaald), waarom je weggaat, en de bevestiging. Het vakje "typ WISSEN" is weg; Profiel linkt onderaan naar deze pagina. De reden gaat als losse rij naar `public.vertrek_redenen` (SQL in `supabase/vertrek-redenen.sql`), zonder gebruikers-id: iedereen mag insturen, alleen beheerders lezen. Het wissen zelf gebruikt nog steeds `account_verwijderen()`.

- `privacy.html` beschrijft in gewone taal wat er bewaard wordt. De link en het contactadres berie007yldrm@gmail.com staan op Over mij (bij de sociale links) en het adres ook op de feedbackpagina; het aanmeldformulier heeft een regel over privacy onder de knop. In de voettekst staan ze bewust niet (Berat, 20-09-2026).
- Account wissen: onderaan `profiel.html` (alleen ingelogd zichtbaar). Eerst WISSEN typen, dan roept de pagina `rpc('account_verwijderen')` aan. Die functie (security definer) wist de avatar in de bucket, de rijen in voortgang, feedback en studieactiviteit en de rij in auth.users. Daarna signOut en terug naar de startpagina.
- Beheer: `beheer.html` roept `studie_totalen()` en `studie_dagcijfers(30)` aan. Beide geven alleen rijen terug als de ingelogde gebruiker in de tabel `beheerders` staat (gevuld via de SQL-editor, nooit een e-mailadres in de code). Een dag telt zodra iemand minstens 60 seconden leertijd of één bezoek had.
- De SQL staat in `supabase/account-en-beheer.sql`.

## Deelvoorbeeld, iconen en toegankelijkheid

- Elke pagina heeft og-tags (titel, omschrijving, `assets/deel.png`, url), een `apple-touch-icon` en een link naar `manifest.webmanifest`. De paden zijn absoluut (`/v2/...`) omdat vakpagina's twee mappen diep staan. **Bij de lancering op het hoofddomein:** `/v2/` vervangen door `/` in alle pagina's, in het manifest en in `404.html`.
- Elke pagina begint met een `.skip-link` ("Ga naar inhoud") naar `<main id="inhoud">`; alleen zichtbaar met de tab-toets.
- De muisbol heeft sinds 20-09-2026 één vaste kleur per thema (zwart in licht, wit in donker, token --cursor-tone); de oude logica die de kleur per element en per letter aanpaste is verwijderd op verzoek van Berat.
- Teal als tekstkleur is te licht voor kleine tekst. Gebruik daarvoor `--teal-tekst` (licht #15756f, donker #5fd0c9); `--teal` blijft voor balken, randen en vinkjes.

## Feedback

Sinds 27-09-2026 staat bij elke oefenvraag en bij de vragen in de simulatie-uitslag Meld een fout. De melding opent in een dialoog op dezelfde pagina; de vraag en gekozen antwoorden blijven staan. Vak, hoofdstuk, niveau, oefenvorm, bronnummer, vraagsleutel en vraagtekst gaan met het bericht naar de bestaande feedbacktabel. De tekstlimiet van 2000 tekens omvat ook die vraaggegevens. Bij een storing blijft de melding staan om opnieuw te versturen. Bij oefenen met tijd loopt de klok door, ook terwijl de melding openstaat; bij nul staat de uitslag klaar achter de dialoog.

De hub toont sinds 27-09-2026 Verder oefenen voor iedere ingelogde gebruiker. De kaart opent de oefenkeuzes van je laatst geoefende vak. Het vak-id wordt bij het starten van een ronde lokaal per account bewaard (`bes_laatst_geoefend_<account-id>`). Zonder geldige lokale marker haalt de hub de recentste eigen afgeronde ronde uit de bestaande tabel `sessies` op; een pas gestarte lokale ronde krijgt voorrang. Zonder historie of bij een ophaalfout blijft de kaart zichtbaar met Kies een vak, die naar de jaarkeuze springt. Dit hervat geen onafgemaakte ronde; de uit de accountgeschiedenis opgehaalde waarde wordt niet lokaal vastgezet. Cachenummer: 65.

De menulink "Feedback" op elke pagina opent `feedback.html`. Alleen ingelogde gebruikers kunnen sturen; het bericht gaat met naam, e-mailadres, soort (fout, idee, anders), gekozen vak en tekst naar de tabel `feedback`. Je leest de berichten in Supabase onder Table Editor. Een link naar de pagina mag `?vak=<id>` en `?vraag=<nummer>` meegeven om het vak en het vraagnummer vooraf in te vullen.

Eenmalig in de SQL-editor uitvoeren:

```sql
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  naam text, email text,
  soort text not null check (soort in ('fout', 'idee', 'anders')),
  vak text, tekst text not null check (char_length(tekst) between 1 and 2000),
  pagina text,
  gemaakt timestamptz not null default now());
alter table public.feedback enable row level security;
create policy "eigen feedback sturen" on public.feedback for insert with check (auth.uid() = user_id);
create policy "eigen feedback lezen" on public.feedback for select using (auth.uid() = user_id);
```

Zolang de tabel ontbreekt, toont de pagina de rode regel "Feedback is nog niet ingeschakeld." en verwijst ze naar de WhatsApp-groep.

## Examen-info

26 vragen sinds 15-09-2026, plus sinds 21-09-2026 de categorie "Volgend jaar" met vijf vragen over herinschrijving en studievoortgang (OER art. 60 §4, 88 §1 tot §3, 59 §3; bron: het geverifieerde rapport in Backup-D-schijf/Bestanden/Notities/examen-info-vub-geverifieerd.md). Zoekvak en categorieën bestonden al. Onderaan een kaart "Mijn vraag staat er niet bij →" naar feedback.html; de lege zoekstaat verwijst ook naar Feedback in plaats van de WhatsApp-groep. Nooit iets uit het rapportdeel "Nog te bevestigen" publiceren.

## Inzichten (Free)

Sinds 22-09-2026 opent `voortgang.html` met het weekoverzicht: een zelfgetekende SVG-grafiek van de laatste zeven kalenderdagen (blauw gemaakt, teal goed), de tegels sessies, vragen en score van deze week met het verschil in procentpunten tegenover de zeven dagen daarvoor, daarna Verbeterpunten (de drie laagste hoofdstukken met minstens drie vragen, met een knop naar `vak/<id>/?hoofdstuk=<h>` die meteen een training start) en Gaat goed (chips vanaf 80 procent). Op Profiel heet de link Weekoverzicht.

`voortgang.html` groepeert de vakken per jaar (1ste, 2de, 3de bachelor) en toont alleen vakken die geoefend zijn; de lijst "Nog niet geoefend" is op 22-09-2026 weggehaald.

Sinds 21-09-2026 bewaart `vak.js` na elke afgeronde ronde één rij in de tabel `sessies` (`bewaarSessie`: vak, niveau, modus, goed, totaal; SQL in `supabase/sessies.sql`, uitgevoerd). Op `profiel.html` staat boven de studiekalender de sectie Jouw voortgang (`assets/inzichten.js`, element `[data-inzichten]`): per geoefend vak een balk met het gemiddelde van de laatste score per hoofdstuk (laagste bovenaan, maximaal zes, link naar voortgang.html) en de laatste vijf sessies. Hard mode telt hier niet mee. Plus en Pro bouwen hierop voort (wekelijks overzicht, grafieken, verbeterpunten).

## Persoonlijke studiekalender

Met de muis over een dag komt er een blauwe rand die weer weggaat zodra je hem wegneemt, en verschijnt de regel eronder; de gekozen dag houdt een blauwe rand met een zachte ring (`previewDay` en `previewOff` in `activiteit.js`, sinds 22-09-2026).

Sinds 07-10-2026 toont de studiekalender meteen alle dagen van de gekozen maand, ook de dagen die nog komen. Toekomstige dagen blijven gestippeld en lichter en tonen bij aanwijzen of kiezen "Deze dag moet nog komen". De bestaande leertijd, bezoeken en maandnavigatie blijven gelijk. Cachenummer: 80.

`assets/activiteit.js` wordt na `auth.js` geladen. Alleen ingelogde accounts worden gemeten. Lokale dagsamenvattingen staan onder `bes_studieactiviteit_<account-id>`. De willekeurige browser-ID in `bes_studieapparaat` bevat geen persoonsgegevens. Alleen leertijd en bezoeken per dag worden gesynchroniseerd, geen antwoorden of bezochte pagina's.

- Een bezoek is een sessie met maximaal 30 minuten tussen activiteiten. Navigeren en herladen tellen niet opnieuw. Verschillende toestellen hebben afzonderlijke bezoeksessies.
- Leertijd loopt alleen op een zichtbaar en actief oefenscherm, theorietabblad of tabblad Studie-hacks. Instellingen, uitslag, hub en Profiel tellen niet mee.
- Na 120 seconden zonder invoer pauzeert de teller. Hervatten telt de pauze niet achteraf mee. Een verborgen of niet-actief tabblad telt niet mee.
- Web Locks en gedeelde lokale opslag voorkomen dat meerdere tabbladen in dezelfde browser dezelfde tijd dubbel boeken. Als deze functies ontbreken, wordt dat gemeld en stopt de meting.
- Intervallen over middernacht worden over lokale kalenderdagen verdeeld. Leertijd is een indicatie op basis van activiteit, geen concentratiemeting.
- Ontbrekende dagen tonen "Geen gegevens geregistreerd" met een stippelrand. Een geregistreerde dag met nul leertijd is herkenbaar als zo'n dag. Historische gegevens worden niet verzonnen.
- De maandkalender begint bij de huidige maand. Vorige/volgende maand, hover, toetsenbordfocus en tikken tonen de dagsamenvatting. De legenda loopt van minder naar meer leertijd.

### Opslag tussen apparaten inschakelen

Voer [supabase/studieactiviteit.sql](supabase/studieactiviteit.sql) één keer uit via de SQL Editor van het bijbehorende Supabase-project. Deze PR voert dit niet op productie uit. Het script maakt een tabel met per account, browser en dag een rij. Lezen vereist de eigen account-ID via RLS. Schrijven loopt via een beperkte functie die de ingelogde gebruiker controleert; anon heeft geen toegang. Updates zijn monotoon en idempotent, zodat herhaalde of verlate verzoeken geen tijd verdubbelen of terugzetten. De kalender telt de dagtotalen van de eigen browsers op.

Zonder tabel, functie of verbinding blijft de kalender lokaal werken en vermeldt hij expliciet dat synchronisatie niet beschikbaar is. Verwar deze lokale werking niet met een bevestigde koppeling tussen apparaten. Na inrichting moeten een echt testaccount op twee apparaten en de toegangscontrole met een tweede testaccount nog worden gecontroleerd. De geautomatiseerde controles gebruiken nagebootste accounts en een nagebootste database.

## Startpagina

De handgeschreven "Berie's Exam Space" op de startpagina heeft sinds 20-09-2026 een dikke lijn (stroke-width 9, krul 7, verbindingen 6, opacity .95) op verzoek van Berat: zelfde beweging en kleur, alleen dikker.

## Hoe werkt het (hub)

De eerste dia schuift na 3 seconden door (`EERSTE_DUUR` in `intro.js`), daarna 6 seconden per dia; zo ziet iedereen meteen dat de carrousel beweegt. Het blok Wat is nieuw op de hub heeft label en datum in een linkerkolom en een lijntje tussen de regels.

Sinds 20-09-2026 (nacht) staat hier de Apple-carrousel `BES.carrousel(element, { soorten: ['uitleg'] })` uit assets/intro.js: dezelfde vijf uitleg-stappen als dia's, schuift elke 8 seconden door, balkjes die zich vullen, pauzeknop, swipen; loopt alleen zolang hij in beeld is. Het welkomstscherm blijft stap voor stap (BES.stappen). De uitklapbare volledige uitleg is op verzoek van Berat weggehaald. Bij Tools staat een vierde kaart "Praat met Comit" met het label Binnenkort (nog geen link). De navigatiebalk heeft geen link Wat is nieuw meer; de sectie op de hub bestaat nog wel (`#nieuw`).

De sectie `hub.html#hoe-werkt-het` bestaat uit vier korte kaarten (Log in, Kies je jaar en vak, Kies hoofdstukken en oefenvorm, Zie je voortgang groeien) en daaronder een `details` "Volledige uitleg →" met tien tekststappen (Waar / Klik op / Daarna) met de exacte knopnamen van de site. Vaste regel: uitleg op de hub is tekst. Geen screenshots van de site in de site, geen nagemaakte muis, geen animaties in uitleg; maximaal vier kaarten zichtbaar, de rest ingeklapt. Verandert een knopnaam, pas dan ook de tekst hier aan.

## Wie is Berie (hub)

Sinds 29-09-2026 staat op de hub onder de slideshow Hoe werkt het het blok Wie is Berie (`#wie-is-berie`): links een korte tekst over Berat (geen woord over de site), rechts de staande foto (`assets/berie-foto.jpg`, 768 x 1034, zonder bijsnijden in de pagina, dus het blok is zo hoog als de foto). De lege rode ruimte boven de pet is er in het bestand afgesneden (vanaf y = 310 van de volle foto van 768 x 1344, bewaard in Claude-werk/materiaal), zodat het blok vlak boven de pet begint. Het hele blok is donkerrood (`#450c11`), precies de achtergrondkleur van de foto zoals Chrome die toont, zodat tekst en foto in elkaar overlopen. De foto is via Chrome naar sRGB omgezet en heeft geen ICC-profiel meer; met het oorspronkelijke profiel wijkt de kleur af en zie je een naad. Op de telefoon staat de foto boven de tekst. De knop Lees meer gaat naar `over-mij.html`. De volgorde onderaan de hub is nu: Hoe werkt het, Wie is Berie, Wat is nieuw. Later wordt Over mij uitgebreid met het lange verhaal en meer foto's.

## Comit

Sinds 27-09-2026 is het Comit-logo een vierpuntige ster met gebogen zijden en het bestaande verloop van teal naar blauw (`--teal` en `--accent`). De gedeelde SVG via `BES.comitLogo` staat op de hub, bij de kennismaking, in de chat en geschiedenis, en vervangt ook de C bij het oefenresultaat. De vakpagina's en het sjabloon laden hiervoor hetzelfde bestaande `assets/comit.js`; de chat start alleen op de Comit-pagina. Cachenummer: 65.

Sinds 27-09-2026 vermelden de hubknop, het voorstelscherm na de kennismaking en de begroeting op de Comit-pagina dat Comit een demo is. De twee uitlegteksten verwijzen naar Feedback. Het voorstelscherm toont achtergrond, kaart, logo en tekst na elkaar en fadet bij Praat met Comit of Later eerst 200 ms uit. De eerste opening van Comit sluit in maximaal 1,8 seconde aan; bij een volgend bezoek duurt de begroeting 300 ms. De schermruimte en invoerhoogte staan vooraf vast zodat de voettekst niet kort in beeld komt. Bij minder beweging staat alles meteen stil en vervalt de vertrekvertraging. De demo-uitleg verdwijnt met het welkom zodra het gesprek of Geschiedenis opent. Cachenummer: 65.

Sinds 26-09-2026 toont de chat een glans over "Comit denkt na" en een zacht ademend logo; na drie seconden staat er "Nog even denken". Berichten schuiven kort binnen en antwoorden verschijnen woord voor woord, met behoud van regels en maximaal 1,5 seconde voor de volledige tekst. Antwoordknoppen verschijnen daarna. Schermlezers krijgen het antwoord als één volledige tekst. De chat volgt alleen zolang je onderaan blijft; omhoog scrollen onderbreekt het volgen. Bij minder beweging staan berichten en antwoorden meteen stil in beeld, ook als die voorkeur tijdens het antwoord verandert. De antwoordlogica blijft gelijk en het cachenummer is 58.

`comit.html` is sinds 23-09-2026 de losse kennismakingspagina voor Comit, alleen bereikbaar met een account en nog nergens gelinkt. `assets/comit.js` levert het SVG-logo via `BES.comitLogo(grootte)`, haalt de aanspreeknaam op via de bestaande accountlogica en regelt de opening en het gesprek. Sinds 27-09-2026 speelt de volledige opening elke keer (ongeveer twee seconden): de ster draait in het midden van het scherm binnen, groeit even aan met een gloed en een ring, en schuift dan naar zijn plek; daarna de begroeting woord voor woord. Bij minder beweging staat alles meteen stil. Bij minder beweging staat alles meteen stil. Er is nog geen AI-koppeling; berichten blijven alleen in de geopende pagina. De eigen stijl staat in `assets/comit.css`, met het invoerveld onderaan het zichtbare scherm, ook bij een kleiner toetsenbordvenster.

Stap 1b (23-09-2026): `assets/comit-antwoorden.js` beantwoordt de vier voorstellen en herkenbare getypte vragen. De bestaande accountclient leest de eigen hoofdstukvoortgang en de laatste veertien lokale kalenderdagen aan sessies; Comit toont maximaal drie verbeterpunten met directe oefenknoppen of het weekverschil. Hard-voortgang en hoofdstukken met minder dan drie vragen tellen niet mee bij de verbeterpunten. De vakkenlijst en losse vakdata leveren de namen. De uitleg over Hard mode vermeldt dat de stap Niveau ontbreekt bij vakken zonder Hard-vragen. De denkpuntjes blijven minstens 600 ms staan, antwoorden verschijnen als gewone tekst en de knoppen openen in hetzelfde tabblad. Onbekende vragen gaan naar de optionele haak `BES.comitVrij` als die bestaat, anders naar de feedbackverwijzing; ophalen dat mislukt geeft een korte foutmelding. Er wordt geen AI aangeroepen. De hubkaart blijft Binnenkort en het cachenummer is overal 48.

Geschiedenis (26-09-2026): elk bericht van de student en elk antwoord van Comit (met de knoppen) gaat naar de tabel `comit_berichten` (`supabase/comit-berichten.sql`): per bezoek één gesprek-id, alleen de student zelf mag lezen, toevoegen en wissen (RLS), per account de laatste 1000 berichten (trigger), weg bij Account wissen (cascade). De knop Geschiedenis in de kop van `comit.html` toont de laatste 200 berichten van eerdere gesprekken, per gesprek met datum, boven het lopende gesprek, met Wis alle gesprekken (met bevestiging). Een nieuwe vraag scrolt het gesprek altijd naar onderen. De beheerder kan de gesprekken niet lezen.

Stap 2 en plannen (26-09-2026): vrije vragen gaan via `assets/comit-ai.js` naar de Edge Function `comit` (Gemini). Het maximum per dag hangt af van het plan (`plan_van` in `supabase/abonnementen.sql`): Free 10, Plus 30, Pro 60. Met `soort: "ezelsbrug"` maakt Comit ezelsbruggetjes voor een zwak hoofdstuk, alleen voor Pro. De hubkaart Praat met Comit linkt nu naar `comit.html`.

Stap 2 (AI, 23-09-2026): de Edge Function `comit` (`supabase/functions/comit/index.ts`, via de Supabase-editor gezet) stuurt vrije vragen van ingelogde studenten naar Gemini. De sleutel staat alleen in Supabase bij Edge Functions, Secrets (`GEMINI_API_KEY`); `GEMINI_MODEL` kan er optioneel bij om een ander model te kiezen. Er gaat geen naam of e-mailadres mee, alleen de vraag en optioneel een kort anoniem voortgangsoverzicht (`context`). Per student maximaal 20 vragen per dag via `public.comit_tel` en de tabel `comit_gebruik` (alleen een teller; SQL in `supabase/comit-gebruik.sql`, uitgevoerd). Is een model te druk of verdwenen, dan probeert de functie het volgende uit de lijst. Aanroepen vanuit de pagina: `BES.auth.client.functions.invoke('comit', { body: { vraag, context } })`; antwoord `{ tekst, model }`, bij het maximum `{ tekst, limiet: true }`, bij een fout status 502 met `{ fout: 'ai', pogingen }` (per model de status en korte melding van Google, ook in de functielogs). Een mislukte vraag telt niet mee voor het maximum (`public.comit_terug`, uitgevoerd). Sinds 23-09-2026 gebruikt de pagina dit via `assets/comit-ai.js` (`BES.comitVrij`): alles wat `comit-antwoorden.js` niet herkent, gaat naar Gemini, met als context alleen de gemiddelde score per geoefend vak. De woordherkenning in `comit-antwoorden.js` is daarom smal gehouden (alleen duidelijke vragen over de site zelf). Mislukt de AI-aanroep, dan zegt Comit "Ik kan nu even niet nadenken. Probeer het zo opnieuw." De privacy-pagina heeft een blok Comit.

## Vakpagina

### Leeg scherm tijdens het oefenen (21-09-2026)

Zodra een ronde start zet `showScreen` de klasse `is-oefenen` op `<html>` (vaktitel, terugknop, tabbladen en voettekst verborgen) en bij een simulatie ook `is-examen` (navigatiebalk en losse themaknop verborgen). Alleen de vraag, de opties en Stop blijven; weg willen betekent eerst Stop. Na Stop of het eindscherm komt alles terug.

### Comit-basis (21-09-2026)

Op het eindscherm van elke ronde staat een kaart van Comit (`renderComit` in `vak.js`, markup `#comit` in het sjabloon), zonder AI: sterke hoofdstukken (alles goed), het zwakste hoofdstuk met de score, en één tip die afhangt van modus en score (na een simulatie: doe het hoofdstuk in Training; onder de helft goed: eerst de theorie; anders: nog één keer). De knop start meteen een training van dat hoofdstuk op het huidige niveau. Bij alles goed: tip richting Hard mode (als er minstens 8 Hard-vragen zijn) en de knop Terug naar het vak. Comit gebruikt ook hier het gedeelde sterlogo.

Sinds 21-09-2026 staat er geen reco-link meer op de vakpagina's (examenreconstructies insturen is niet toegestaan; het reconstructiesysteem is geschrapt).

`vak/voorbeeld/index.html` is het inhoudsloze sjabloon voor alle vakken. `assets/vak.css` sluit aan op de gedeelde stijl; `assets/vak.js` vult de kop, hoofdstukken en drie tabbladen vanuit `data.js`. Open het voorbeeld rechtstreeks via `vak/voorbeeld/index.html`; het staat bewust niet in de vakkenlijst of op een jaarpagina.

### Datamodel

Elk vak heeft één `data.js` dat `window.BES_VAK` instelt. Dit is de vorm, met één verkorte voorbeeldvraag:

```js
window.BES_VAK = {
  id: 'voorbeeld',
  jaar: '1ba',
  naam: 'Voorbeeldvak: studievaardigheden',
  hoofdstukken: [
    { id: 'h1', naam: 'Plannen' },
    { id: 'h2', naam: 'Onthouden' },
    { id: 'h3', naam: 'Examens' }
  ],
  vragen: [
    {
      h: 'h1',
      q: 'Vraagtekst',
      o: ['Optie A', 'Optie B', 'Optie C', 'Optie D'],
      a: 1,
      u: 'Uitleg waarom optie B juist is.'
    }
  ],
  hacks: [{ h: 'h1', t: 'Korte studietip.' }],
  theorie: [{ h: 'h1', kop: 'Titel', items: ['Kernpunt 1.', 'Kernpunt 2.'] }]
};
```

- `id` komt overeen met de mapnaam en het id in `assets/vakken.js`. `jaar` is `1ba`, `2ba` of `3ba`.
- Hoofdstuk-id's zijn uniek binnen een vak. Elk `h` verwijst naar zo'n id.
- Een vraag met één antwoord heeft 2 tot 5 verschillende opties. `a` is de index vanaf nul: `0` is de eerste optie, `1` de tweede. `u` legt uit waarom het antwoord juist is.
- Voor meerdere te kiezen antwoorden is `a` een niet-lege lijst met unieke indexen, bijvoorbeeld `a: [1, 3]`. Deze vragen mogen 2 tot 10 verschillende opties hebben. Voeg optioneel `kies: 'fout'` toe als de onjuiste uitspraken gekozen moeten worden. De indexen in `a` zijn altijd precies de opties die de leerling moet selecteren, ook bij `kies: 'fout'`.
- Boven deze opties staat bijvoorbeeld "Kies 2 antwoorden." of "Kies de 2 foute antwoorden." Een optie aanvinken of uitvinken telt nog niet als antwoord. "Controleer →" verschijnt alleen als precies het gevraagde aantal gekozen is. Alleen de volledige juiste combinatie levert één goed beantwoorde vraag op; er zijn geen deelpunten.
- Vragen en opties worden tijdens het oefenen geschud; alle juiste keuzes blijven gekoppeld aan de oorspronkelijke opties. De toetsen 1 tot en met 9 kiezen de bijbehorende optie, 0 kiest optie 10. Bij meerdere antwoorden schakelen deze toetsen de keuze aan of uit. Tab en spatie werken ook op de vinkopties.
- Tekst is gewone tekst, geen HTML. De vakinhoud staat uitsluitend in `data.js`.
- Het volledige voorbeeld heeft 3 hoofdstukken met respectievelijk 4, 5 en 5 vragen, 2 studie-hacks per hoofdstuk en 1 theorieblok per hoofdstuk. De tweede nieuwe meervoudige vraag bevat 10 opties en vraagt om de twee onjuiste uitspraken.
- Lege hoofdstukken tonen "Nog geen vragen". Lege lijsten voor vragen, hacks en theorie hebben ieder een eigen lege melding.

### Oefenen en voortgang

Sinds 22-09-2026 blijft de pagina op dezelfde plek bij het aan- of uitvinken van hoofdstukken, ook bij het eerste vinkje en bij Alles en Niets. Na het kiezen van modus, niveau en tijd schuift de pagina nog wel mee naar de volgende stap.

Alle 34 vakpagina's (en het sjabloon `vak/voorbeeld/index.html`) hebben sinds 22-09-2026 dezelfde oefenkeuze in stappen, met `data-niveaus` op `.vak-pagina`: Examen Training of Examensimulatie, Normaal of Hard mode, Zonder tijd of Met tijd, en de hoofdstukken. Eerst is alleen de modus zichtbaar; na iedere keuze verschijnt de volgende stap. Eerdere stappen blijven zichtbaar en hun keuzes blijven bewaard. Zonder geldige `hardVragen` wordt de niveaustap overgeslagen en schuift de nummering op. Alle hoofdstukken met vragen zijn standaard aangevinkt; Alles en Niets blijven werken. De kaart Jouw oefening toont Modus, Niveau, Tijd en Hoofdstukken op aparte regels, met het aantal vragen en Start ernaast (op de telefoon eronder). Nieuwe stappen verschijnen in 200 ms en de pagina schuift ernaartoe; bij minder beweging staan beide effecten uit. De pagina's verschillen alleen in de titel, og-regels en de versie van `data.js`.

Zonder tijd blijft de standaard. Met tijd geeft een schuif van 45 tot 120 seconden per vraag, in stappen van 15 en standaard 75. De totale tijd verandert mee met het aantal vragen en wordt naar boven afgerond op hele minuten. Tijdens de ronde telt de klok vanaf de vaste starttijd, ook na een tabbladwissel. Bij 5 en 1 minuut klinkt één melding voor schermlezers; de laatste minuut kleurt de klok met de bestaande foutkleur. Bij nul stopt de ronde vanzelf: onbeantwoorde vragen tellen als fout, ook voor de trainingsvoortgang, en het eindscherm vermeldt dat de tijd om was. Een ronde met tijd toont daar ook de gebruikte minuten, naar boven afgerond. Stoppen zet de klok stil zodra je bevestigt; het bevestigingsvenster pauzeert niet. Fouten opnieuw, Opnieuw en de hoofdstukknop van Comit behouden de tijd per vraag en berekenen de totale tijd opnieuw voor hun aantal vragen.

Normaal gebruikt de bestaande `vragen` zonder wijziging. De optionele lijst `hardVragen` gebruikt hetzelfde vraagformaat en bevat bij Inleiding pedagogiek een eerste set van 14 toepassingsvragen, twee per hoofdstuk h1 tot en met h7. Ze zijn uit de bestaande leerstof uitgewerkt en gecontroleerd op consistentie met die inhoud; verdere beoordeling door de vakinhoudelijke gebruiker blijft nodig vóór een brede uitrol. h8 (Echte examenvragen) krijgt geen verzonnen examenvragen. Sinds 22-09-2026 hebben ook stat1, stat2, ontwikkeling, philsci en logica elk 10 Hard-vragen (Codex, opdracht `codex/opdrachten/hard-vragen.md`, PR 16; per vak nagekeken tegen de eigen theorie voordat ze samengevoegd zijn). Sinds 27-09-2026 hebben ook de 28 andere vakken 8 tot 10 Hard-vragen (271 in totaal): per vak door een agent gemaakt uit alleen de eigen stof en daarna los door een tweede agent nagekeken (afgekeurde vragen zijn weggelaten); juiste antwoorden verspreid over de posities en niet te raden aan de lengte. Een hoofdstuk zonder Hard mode-vragen is niet selecteerbaar op dat niveau; zonder geldige Hard mode-set is het niveau uitgeschakeld.

Hard mode gebruikt dezelfde trainings- en simulatieregels. Een Hard-training vraagt minstens 8 vragen (bij 2 per hoofdstuk dus 4 hoofdstukken); anders blijft Start uit met een hint. De simulatie neemt maximaal 20 vragen uit de gekozen moeilijkheid, dus bij deze eerste Hard mode-set 14. Een foutenronde en Opnieuw behouden het niveau. Zowel de oefening als de uitslag vermelden het niveau. De hoofdstukkeuze blijft per niveau bewaard zolang de pagina open is.

Normale voortgang behoudt de sleutel `bes_voortgang_inlped` en de bestaande Supabase-vakwaarde `inlped`. Hard mode bewaart dezelfde account-/gaststructuur apart onder `bes_voortgang_inlped__hard`, met Supabase-vakwaarde `inlped__hard`. De bestaande tabel laat tekstwaarden toe; er is geen schemawijziging nodig. Resultaten van de twee niveaus worden niet samengevoegd. Test aanpassingen met nagebootste accounts voordat je echte voortgang gebruikt.

Examen Training gebruikt alle vragen van de gekozen hoofdstukken en geeft uitleg na ieder antwoord. Examensimulatie gebruikt maximaal 20 willekeurige vragen uit alle hoofdstukken, zonder feedback tussendoor. Beide modi kunnen met of zonder tijd. Alleen de uitslag van een simulatie bevat de antwoorden en uitleg, met bij tijdsoverschrijding ook een melding bij onbeantwoorde vragen. "Fouten opnieuw" begint altijd een nieuwe trainingssessie met alleen de fouten uit de afgeronde sessie, ook na een simulatie. In die foutenronde krijg je na ieder antwoord uitleg en wordt de hoofdstukvoortgang bijgewerkt.

Bij meerdere antwoorden markeert de training na "Controleer →" elke benodigde optie teal en elke verkeerd gekozen optie rood. In een simulatie blijven goed/fout en uitleg verborgen tot de uitslag. Het overzicht toont daar per benodigde of gekozen optie wat juist was. De volledige combinatie bepaalt ook in de simulatie en foutenronde de score.

De lokale sleutel is `bes_voortgang_<vakid>`, voor het voorbeeld dus `bes_voortgang_voorbeeld`. `BES.vak.voortgang` geeft een kopie van de actieve hoofdstukgegevens. De opgeslagen JSON bevat de actieve gegevens en de bewaarde profielen. Dit verkorte voorbeeld toont de actieve gegevens:

```js
{
  eigenaar: null,
  hoofdstukken: {
    h1: {
      beantwoord: 8,
      goed: 6,
      laatstGoed: 3,
      laatstTotaal: 4,
      bijgewerkt: '2026-01-01T12:00:00.000Z'
    }
  },
  laatsteSimulatie: {
    goed: 9,
    totaal: 12,
    bijgewerkt: '2026-01-01T12:05:00.000Z'
  }
}
```

`eigenaar` is `null` voor een gast, anders het gebruikers-id van het account. `beantwoord` en `goed` tellen de trainingsantwoorden op. `laatstGoed` en `laatstTotaal` horen bij de laatste trainingssessie voor het hoofdstuk; het totaal is het aantal vragen van dat hoofdstuk in die sessie. Daardoor geeft één goed antwoord aan het begin van een reeks geen afgerond hoofdstuk. Na ieder trainingsantwoord wordt de stand bewaard. Bij een nieuwe training worden alleen de hoofdstukken met een beantwoord trainingsantwoord bijgewerkt.

Een foutenronde is een nieuwe sessie met een kleiner totaal. Bij een volledig juiste sessie is de hoofdstukbalk teal en staat er "Afgerond ✓". Een afgeronde simulatie wordt apart in `laatsteSimulatie` opgeslagen en verandert de hoofdstukbalken niet; zonder eerdere simulatie is die waarde `null`.

In dezelfde JSON staat daarnaast `profielen`: een map met de sleutels `gast` en `account:<gebruikers-id>`. Elk profiel bevat `{ eigenaar, hoofdstukken, laatsteSimulatie }`. De bovenste velden blijven de actieve stand; de profielen bewaren ook de andere lokale standen over uitloggen en herladen heen. Wie later opnieuw met hetzelfde account inlogt, kan zo ook zonder verbinding zijn eigen lokale voortgang terugkrijgen.

Alle lokale opslag zit in `try/catch`. Als de browser opslag weigert, blijft oefenen werken binnen de geopende pagina. Bij aanmelding wordt gastvoortgang eenmalig samengevoegd met dat account, waarbij per hoofdstuk de nieuwste `bijgewerkt` wint. Het overgenomen gastprofiel wordt daarna leeggemaakt, zodat het niet nogmaals naar een volgend account gaat. Afzonderlijke profielen voorkomen dat de bewaarde stand van het ene account naar een ander account wordt geüpload.

Met een ingelogd account haalt de pagina de hoofdstukrijen van dit vak op via de bestaande Supabase-client. Per hoofdstuk wint de nieuwste waarde van `bijgewerkt`. Wijzigingen gaan als batch naar Supabase, maximaal één batch per 2 seconden. De aparte laatste simulatie blijft lokaal. Bij een ontbrekende tabel, netwerkfout of geweigerde toegang gaat de pagina stil verder met lokale voortgang.

### Supabase-tabel aanmaken

Voer deze SQL één keer uit in het Supabase-project via **SQL Editor → Run**. De toegangsregels zorgen dat elk account alleen de eigen rijen kan lezen, invoegen en bijwerken:

```sql
create table if not exists public.voortgang (
  user_id uuid not null references auth.users(id) on delete cascade,
  vak text not null, hoofdstuk text not null,
  beantwoord int not null default 0, goed int not null default 0,
  laatst_goed int not null default 0, laatst_totaal int not null default 0,
  bijgewerkt timestamptz not null default now(),
  primary key (user_id, vak, hoofdstuk));
alter table public.voortgang enable row level security;
create policy "eigen voortgang lezen" on public.voortgang for select using (auth.uid() = user_id);
create policy "eigen voortgang schrijven" on public.voortgang for insert with check (auth.uid() = user_id);
create policy "eigen voortgang bijwerken" on public.voortgang for update using (auth.uid() = user_id);
```

De accountkoppeling uit de sectie "Accounts" moet ook zijn ingesteld. Totdat de tabel en regels bestaan, werkt de vakpagina lokaal; voortgang ophalen op een ander toestel en naar het account schrijven werken pas daarna. Test dat met hetzelfde account op twee toestellen. Controleer ook dat een tweede account de rijen van het eerste niet kan lezen of wijzigen.

### Een echt vak aansluiten

1. Neem het bestaande `id` en `jaar` uit `assets/vakken.js`. Maak de map `vak/<id>/`.
2. Kopieer `vak/voorbeeld/index.html` naar die map als `index.html`. Zet `data-terug` op `../../jaar-1ba.html`, `../../jaar-2ba.html` of `../../jaar-3ba.html`, passend bij het vak. De logica leidt de teruglink ook af uit `BES_VAK.jaar`.
3. Voeg in dezelfde map een `data.js` toe in het beschreven formaat. Vul id, jaar, vaknaam, hoofdstukken, vragen, uitleg, studie-hacks en theorie in. De HTML hoeft geen vakinhoud te krijgen.
4. Controleer de vakpagina lokaal op desktop en 375 px: tabbladen, training, simulatie, score, foutenronde en voortgang na herladen.
5. Zet voor dat bestaande vak `v2: true` in `assets/vakken.js`. `BES.vakLink` laat de jaarpagina dan naar `vak/<id>/` verwijzen. Verhoog bij deze gedeelde wijziging de versienummers in alle pagina's.

Voeg het voorbeeldvak niet aan de 34 vakken toe. Het sjabloon maakt deze stap compleet; het overzetten van de echte vakinhoud is een volgende opdracht.

## Animaties

De knoppen, kaarten, menu's, themakeuze, vakkeuzes, meldingen en bevestigingen gebruiken dezelfde rustige bewegingen met `var(--ease)`: 150 tot 300 ms, 1 tot 2 px hover en een druk-effect van .97 voor knoppen of .99 voor kaarten. Openende lagen hergebruiken `appear` en `menu-open`. Een kleine haak in `app.js` laat pas na bediening nieuwe rekenrijen, zoekresultaten, meldingen en de terugkeer naar de eerste wisstap verschijnen. Hover werkt alleen met een muis; bij minder beweging staan animaties, overgangen en verplaatsingen uit. Bestaande pagina-introducties en voortgangsbalken blijven behouden. Cachenummer: 58.

## Studie-hacks en simulatie (26-09-2026)

In de tab Studie-hacks staat bovenaan "Voor jou" (Plus): je drie zwakste hoofdstukken in dit vak (Normaal, minstens 3 vragen, onder 80 procent) met hun eigen hacks, of anders de eerste drie kernpunten uit de theorie, plus Oefen dit hoofdstuk en Ezelsbruggetjes van Comit (Pro, Edge Function comit met soort ezelsbrug). Zonder Plus een korte uitleg met link naar Abonnement. Met Plus verschijnt bij een fout antwoord in Training de hack van dat hoofdstuk onder de uitleg, als die bestaat. Bij Examensimulatie toont stap 4 geen hoofdstukkenlijst meer maar een balk "De simulatie kiest ... uit alle hoofdstukken, in Normaal/Hard mode". Op Profiel krijgt het hele blok Jouw abonnement de kleur van je plan.

## Betalen met Mollie (testmodus)

Sinds 05-10-2026 voorbereid, nog niet aan. Een proefmaand start dan MET betaalgegevens: de student betaalt bij Mollie een machtiging van 0,02 euro (het minimum van Bancontact; of meteen de volle maandprijs als de proefmaand van dat plan al gebruikt is), en na de proefmaand (of de eerste betaalde maand) loopt een maandelijks Mollie-abonnement: Plus 2,99 euro, Pro 9,99 euro per maand, inclusief btw. Zolang de schakelaar uit staat, werkt alles zoals nu (`start_proef`, `zeg_op`, `herroep`). Staat hij aan, dan weigert `start_proef` (reden `betalen_aan`). Een account dat ooit via Mollie betaalde, zegt altijd op en herroept via de Edge Function `mollie`, ook met de schakelaar uit: `zeg_op` en `herroep` weigeren dan (reden `via_mollie`) en `mijn_abonnement` geeft `via_mollie: true` zodat Profiel de juiste weg kiest.

Bestanden:
- `supabase/mollie.sql`: schakelaar `betalen` in `site_instellingen` en `betalen_aan()`, tabellen `mollie_koppeling` (klant, machtiging en abonnement per account, alleen de Edge Functions) en `betalingen` (elke Mollie-betaling; een student leest alleen zijn eigen rijen), de hulpfuncties `heeft_mollie`, `mollie_marge`, `mollie_mag_starten`, `mollie_verwerk`, `mollie_zeg_op`, `mollie_herroep`, `mollie_herroep_info` en `mollie_terug` (alleen service role), en aangepaste versies van `mijn_abonnement`, `plan_van`, `start_proef`, `zeg_op` en `herroep`. Zolang er een Mollie-abonnement loopt, geldt je plan nog 7 dagen na de einddatum (`mollie_marge`): een maandbetaling via SEPA-incasso is pas enkele werkdagen later betaald. Een maandbetaling verlengt vanaf de vorige einddatum, zodat de periode niet opschuift.
- `supabase/functions/mollie/index.ts`: acties `start` (klant en eerste betaling bij Mollie, antwoord `{ url }` naar de betaalpagina), `opzeggen` (abonnement bij Mollie stoppen en `mollie_zeg_op`, antwoord `{ ok, geldig_tot }`) en `herroepen` (eerst het abonnement bij Mollie stoppen; lukt dat niet, dan wordt er niet herroepen; dan `mollie_herroep` en terugbetalen van de huidige overeenkomst, met een Idempotency-Key per terugbetaling; met het vinkje "meteen starten" betaal je de begonnen dagen van een betaalde maand, antwoord `{ ok, terug, herroepen_op, plan }`, met `onvolledig: true` als terugbetalen bij Mollie niet helemaal lukte; Profiel vraagt de student dan te mailen, en een nieuwe aanroep doet alleen het Mollie-deel opnieuw). Opzeggen en herroepen werken ook als de schakelaar weer uit staat.
- `supabase/functions/mollie-webhook/index.ts`: Mollie meldt hier elke betaling. De functie haalt de betaling altijd zelf op bij Mollie, zet bij een geslaagde eerste betaling het plan aan (proefmaand of betaalde maand, met `overeenkomst_op` voor de bedenktijd) en maakt het maandabonnement; elke maandbetaling verlengt `betaald_tot` met een maand. Het abonnement krijgt de Idempotency-Key `sub-<betaling>`, zodat twee meldingen tegelijk er geen twee maken. Een maandbetaling die niets aanzet (na herroepen of van een oud abonnement) gaat helemaal terug en dat abonnement stopt. Bij een terugboeking via de bank (chargeback, `amountChargedBack`) stopt het plan meteen en ook het Mollie-abonnement. Mislukte betalingen veranderen niets aan het plan.

Eenmalig inrichten door Berat:
1. In de SQL-editor van Supabase `supabase/mollie.sql` uitvoeren (na `abonnementen.sql` en `herroepen.sql`).
2. Mollie-dashboard, Developers, API-keys: de test-sleutel (begint met `test_`) kopiëren. In Supabase bij Edge Functions, Secrets: `MOLLIE_API_KEY` met die sleutel. Optioneel `SITE_URL` (standaard `https://beriesexamspace.com/v2/`). `SUPABASE_URL`, `SUPABASE_ANON_KEY` en `SUPABASE_SERVICE_ROLE_KEY` zet Supabase zelf.
3. Edge Functions, Deploy a new function, via de editor: `mollie` met de inhoud van `supabase/functions/mollie/index.ts`, met "Verify JWT" AAN. Daarna `mollie-webhook` met de inhoud van `supabase/functions/mollie-webhook/index.ts`, met "Verify JWT" UIT (Mollie stuurt geen sessie mee).
4. Aanzetten: `update public.site_instellingen set waarde = true where sleutel = 'betalen';` Uitzetten: dezelfde regel met `false`.
5. Testen met een testaccount: Probeer 1 maand, op de testpagina van Mollie "Paid" kiezen, terug op de site wordt de betaling gecontroleerd en ga je naar Profiel. In Supabase: `select * from public.betalingen order by gemaakt_op desc;` en in het Mollie-dashboard (testmodus) de klant met zijn abonnement. Ook "Failed" en "Expired" proberen (plan blijft Free), Opzeggen (abonnement bij Mollie op Canceled) en Herroepen (terugbetaling zichtbaar bij de betaling).

Naar echte betalingen: in Mollie de website laten keuren, de `live_`-sleutel in `MOLLIE_API_KEY` zetten en eenmalig `update public.mollie_koppeling set klant_id = null, mandaat_id = null, abonnement_id = null;` (nummers uit testmodus bestaan niet bij de echte sleutel). Nog open: een bevestigingsmail na betalen, opzeggen en herroepen; een student die meldt dat herroepen bij Mollie onvolledig was, met de hand in het Mollie-dashboard nakijken en terugbetalen.
