// Vak "Statistiek I: meetschalen en beschrijvende statistiek" (1ba), automatisch omgezet vanaf de oude site op 2026-09-14.
// Formaat: zie README, kop "Vakpagina". Aanpassen kan hier; de pagina (index.html) hoeft niet te veranderen.
window.BES_VAK = {
 "id": "stat1",
 "jaar": "1ba",
 "naam": "Statistiek I: meetschalen en beschrijvende statistiek",
 "hoofdstukken": [
  {
   "id": "h1",
   "naam": "Meetschalen en variabelen"
  },
  {
   "id": "h2",
   "naam": "Data visualiseren"
  },
  {
   "id": "h3",
   "naam": "Centrummaten en boxplot"
  },
  {
   "id": "h4",
   "naam": "Spreidingsmaten"
  },
  {
   "id": "h5",
   "naam": "Normaalverdelingen"
  },
  {
   "id": "h6",
   "naam": "Scatterplots en correlatie"
  },
  {
   "id": "h7",
   "naam": "Regressie en residuen"
  },
  {
   "id": "h8",
   "naam": "Contingentietabellen"
  },
  {
   "id": "h9",
   "naam": "Rangcorrelaties"
  }
 ],
 "vragen": [
  {
   "h": "h1",
   "q": "Een onderzoeker wil intelligentie meten bij studenten. Waarom is dat geen rechtstreeks meetbare variabele?",
   "o": [
    "Omdat de scores in de praktijk altijd worden afgerond op gehele getallen",
    "Omdat de variabele wordt ingedeeld in niet-numerieke categorieen",
    "Omdat het een abstract construct is dat een operationele definitie vereist",
    "Omdat er voor deze variabele geen absoluut nulpunt bestaat"
   ],
   "a": 2,
   "u": "Intelligentie kan je niet direct observeren, je hebt eerst een operationele definitie nodig om er een construct van te maken. Afronden, het soort categorieen en het nulpunt zeggen niets over het onderscheid rechtstreeks versus niet rechtstreeks meetbaar."
  },
  {
   "h": "h1",
   "q": "In een databestand krijgt geslacht de codering man = 0 en vrouw = 1. Hoe noem je die stap en wat doet ze met het meetniveau?",
   "o": [
    "Dichotomiseren, en het meetniveau blijft nominaal",
    "Dichotomiseren, en de variabele wordt daardoor een intervalvariabele",
    "Operationaliseren, waardoor de variabele continu wordt",
    "Partitioneren, waardoor er een volgorde tussen de categorieen ontstaat"
   ],
   "a": 0,
   "u": "Dichotomiseren is het toekennen van numerieke scores aan een categorische variabele, de cijfers zijn hier enkel labels. De variabele blijft dus nominaal: er komt geen orde, geen vaste meeteenheid en zeker geen verhouding bij."
  },
  {
   "h": "h1",
   "q": "Bij een examen zonder giscorrectie krijg je enkel hele punten, bij een examen met giscorrectie kunnen er ook tussenliggende waarden uitkomen. Hoe typeer je die twee variabelen?",
   "o": [
    "Allebei continu, want een examenscore is nu eenmaal een getal",
    "De eerste is continu en de tweede is discreet",
    "Allebei discreet, want punten worden in de praktijk toch afgerond",
    "De eerste is discreet en de tweede is continu"
   ],
   "a": 3,
   "u": "Discrete variabelen kunnen enkel in gehele getallen uitgedrukt worden, dat past bij een score zonder giscorrectie. Met giscorrectie kan de score elke waarde binnen een interval aannemen, en dat is per definitie continu. Dat scores in de praktijk vaak afgerond worden, verandert de aard van de variabele niet."
  },
  {
   "h": "h1",
   "q": "Aan welke drie voorwaarden moet een relatie voldoen om een verzameling netjes op te delen in equivalentieklassen?",
   "o": [
    "Reflexiviteit, anti-symmetrie en transitiviteit",
    "Reflexiviteit, symmetrie en transitiviteit",
    "Symmetrie, transitiviteit en totaalheid",
    "Reflexiviteit, symmetrie en totaalheid"
   ],
   "a": 1,
   "u": "Een equivalentierelatie is reflexief, symmetrisch en transitief, en verdeelt de verzameling zo in klassen waarbij elk object tot precies een klasse behoort. Anti-symmetrie en totaalheid horen bij een orderelatie, dus bij ordening en niet bij loutere identiteit."
  },
  {
   "h": "h1",
   "q": "Je rangschikt mensen op lengte, maar mannen en vrouwen worden apart bekeken, waardoor je sommige koppels niet met elkaar kunt vergelijken. Welke eigenschap van de relatie ontbreekt dan?",
   "o": [
    "Totaalheid",
    "Transitiviteit",
    "Anti-symmetrie",
    "Reflexiviteit"
   ],
   "a": 0,
   "u": "Totaalheid betekent dat je elk willekeurig paar elementen tegenover elkaar kunt plaatsen, en net dat lukt hier niet. De andere drie eigenschappen blijven wel gelden, daarom spreken we van een partiele orde in plaats van een totale orde."
  },
  {
   "h": "h1",
   "q": "Waarom mag je bij temperatuur in graden Celsius niet zeggen dat 28 graden dubbel zo warm is als 14 graden?",
   "o": [
    "Omdat verhoudingen enkel mogen bij variabelen in gehele getallen",
    "Omdat temperatuur eigenlijk een categorische variabele is",
    "Omdat de categorieen van deze schaal geen vaste volgorde hebben",
    "Omdat het nulpunt arbitrair is en geen afwezigheid aanduidt"
   ],
   "a": 3,
   "u": "Nul graden betekent niet dat er geen temperatuur is, dus je mist het absolute nulpunt en verhoudingen zijn zinloos. De schaal is wel numeriek en geordend, en de intervallen zijn gelijk: het verschil tussen 37 en 39 graden is even groot als tussen 23 en 25 graden. Of een variabele in gehele getallen wordt uitgedrukt, heeft niets met verhoudingen te maken."
  },
  {
   "h": "h1",
   "q": "Bij welke van deze metingen duidt de waarde nul er echt op dat de gemeten eigenschap volledig afwezig is?",
   "o": [
    "Temperatuur in graden Celsius",
    "Reactietijd in seconden",
    "Een jaartal in onze tijdrekening",
    "Motivatie gescoord op een schaal van 1 tot 5"
   ],
   "a": 1,
   "u": "Een reactietijd van nul betekent letterlijk geen reactietijd, dat is een absoluut nulpunt en dus een ratioschaal. Bij Celsius en bij een jaartal is het nulpunt afgesproken en dus arbitrair, en de motivatieschaal is een geordende reeks zonder echte nul."
  },
  {
   "h": "h1",
   "q": "Een docent zet de ruwe punten op 20 om in enkel de uitkomst geslaagd of niet geslaagd. Wat gebeurt er daarbij?",
   "o": [
    "Er verandert niets, want het meetniveau van de variabele blijft hetzelfde",
    "Het meetniveau stijgt, want twee klassen zijn makkelijker te vergelijken",
    "Het meetniveau daalt en een deel van de informatie gaat verloren",
    "De variabele wordt continu, omdat de grens op een getal ligt"
   ],
   "a": 2,
   "u": "Een variabele met een hoog meetniveau mag je behandelen als een variabele met een lager meetniveau, maar daarbij gaat informatie verloren. Je gaat hier van een schaal met afstanden naar twee categorieen, dus je weet nog wie geslaagd is maar niet meer met hoeveel punten. Het meetniveau kan door zo een ingreep nooit stijgen."
  },
  {
   "h": "h1",
   "q": "Kledingmaten S, M en L staan in een duidelijke volgorde. Wat kan je op basis van die maten NIET besluiten?",
   "o": [
    "Hoe groot het verschil tussen twee maten precies is",
    "Of twee personen exact dezelfde kledingmaat dragen",
    "Welke van twee personen de grootste maat draagt",
    "Of er tussen twee personen een verschil bestaat"
   ],
   "a": 0,
   "u": "Een ordinale schaal geeft de richting van het verschil, dus meer of minder, maar zegt niets over de grootte van dat verschil. Gelijkheid vaststellen en de volgorde bepalen kan hier wel, want identiteit en orde zitten allebei in dit meetniveau."
  },
  {
   "h": "h1",
   "q": "Waarom moeten de categorieen van een nominale variabele exhaustief en mutueel exclusief zijn?",
   "o": [
    "Zodat je de categorieen achteraf kunt ordenen van klein naar groot",
    "Zodat de afstanden tussen de categorieen even groot worden",
    "Zodat er in de codering een absoluut nulpunt ontstaat",
    "Zodat elke case in precies een categorie valt"
   ],
   "a": 3,
   "u": "Dat is precies wat een partitie doet: de verzameling wordt opgedeeld in niet-overlappende klassen waarbij elk object tot een en slechts een groep behoort. Orde, gelijke afstanden en een absoluut nulpunt horen bij hogere meetniveaus en spelen op nominaal niveau geen rol."
  },
  {
   "h": "h2",
   "q": "Wat bedoelt men in dit hoofdstuk precies met de verdeling van een variabele?",
   "o": [
    "Enkel het gemiddelde en de spreiding van de meetwaarden",
    "Enkel de laagste en de hoogste meetwaarde in de dataset",
    "Welke waarden de variabele aanneemt en hoe vaak elke waarde voorkomt",
    "Het verband tussen twee variabelen, zoals je dat in een kruistabel afleest"
   ],
   "a": 2,
   "u": "Een verdeling zegt twee dingen tegelijk: welke waarden er voorkomen en met welke frequentie. Gemiddelde, spreiding en het bereik zijn samenvattende maten die je uit een verdeling haalt, maar ze zijn de verdeling niet, en een verband tussen twee variabelen hoort bij een heel andere analyse."
  },
  {
   "h": "h2",
   "q": "Je maakt een grafiek van lichaamslengte en een grafiek van het aantal juiste antwoorden op een examen. Waar mag er ruimte tussen de balkjes staan?",
   "o": [
    "Bij het aantal juiste antwoorden, want die waarden zijn telbaar",
    "Bij lichaamslengte, want mensen verschillen sterk in lengte",
    "Bij allebei, want ruimte maakt elke grafiek leesbaarder",
    "Bij geen van beide, want het gaat in beide gevallen om kwantitatieve variabelen"
   ],
   "a": 0,
   "u": "Mensen groeien niet in sprongetjes van een centimeter, dus lengte is continu en de balkjes sluiten aan (histogram). Het aantal juiste antwoorden is telbaar, daar bestaan geen tussenwaarden en mag er ruimte tussen. Dat beide variabelen kwantitatief zijn verandert niets: het onderscheid continu versus discreet beslist."
  },
  {
   "h": "h2",
   "q": "Hoe verhoudt een staafdiagram zich volgens de cursus tot een kolomdiagram?",
   "o": [
    "Het zijn gewoon twee namen voor exact dezelfde grafiek",
    "Een staafdiagram is een kolomdiagram met kolommen versmald tot lijnen",
    "Een staafdiagram werkt altijd met relatieve frequenties, het andere type met absolute",
    "Een staafdiagram past bij continue data, het andere type enkel bij nominale data"
   ],
   "a": 1,
   "u": "De cursus waarschuwt expliciet dat de twee niet identiek zijn: de kolommen worden versmald tot lijnen. Het verschil zit dus in de voorstelling, niet in het soort frequentie of in het meetniveau, want beide worden voor categorische of discrete gegevens gebruikt."
  },
  {
   "h": "h2",
   "q": "Wat is het voordeel van een histogram met relatieve frequenties tegenover een histogram met absolute frequenties?",
   "o": [
    "Je kunt er groepen mee vergelijken die niet even groot zijn",
    "Je hoeft de klassengrenzen dan niet meer exact te bepalen",
    "De vorm van de verdeling wordt er symmetrisch door",
    "Je kunt er meteen de mediaan uit aflezen zonder verdere stappen"
   ],
   "a": 0,
   "u": "Relatieve frequenties zijn aandelen van het totaal (Fi gedeeld door N), waardoor groepen met een verschillend aantal waarnemingen toch vergelijkbaar worden. De klassenindeling blijft gewoon nodig, de vorm van de verdeling verandert niet, en voor de mediaan heb je de cumulatieve curve nodig."
  },
  {
   "h": "h2",
   "q": "Welke maat lees je het gemakkelijkst af uit een cumulatieve frequentiecurve?",
   "o": [
    "De modus, want dat is het hoogste punt van de curve",
    "Het gemiddelde, want dat lees je af waar de curve het steilst stijgt",
    "De mediaan, door de cumulatieve frequentie in twee te splitsen",
    "De klassenbreedte, want die staat op de verticale as"
   ],
   "a": 2,
   "u": "Splits je de cumulatieve frequentie in twee gelijke helften, dan vind je de middelste waarneming, en dat is de mediaan (bij twee middelste waarnemingen neem je de mediaan van die twee). De curve loopt altijd stijgend naar het totaal, dus haar hoogste punt zegt niets over de modus, en het gemiddelde volgt er evenmin rechtstreeks uit."
  },
  {
   "h": "h2",
   "q": "Bij het groeperen van continue meetwaarden moeten de klassen exhaustief en disjunct zijn. Wat houdt dat in?",
   "o": [
    "Alle klassen zijn even breed en starten bij nul",
    "Elke meetwaarde hoort in een klasse thuis en de klassen overlappen elkaar niet",
    "Elke klasse bevat evenveel waarnemingen en er blijft niets over",
    "De klassen sluiten aan bij het meetniveau en mogen elkaar lichtjes overlappen"
   ],
   "a": 1,
   "u": "Exhaustief wil zeggen dat geen enkele meetwaarde buiten de indeling valt, disjunct dat geen enkele meetwaarde in twee klassen tegelijk past. Gelijke breedte of een gelijk aantal waarnemingen per klasse is geen voorwaarde, en overlap is net wat disjunct uitsluit."
  },
  {
   "h": "h2",
   "q": "Wat is het verschil tussen een homogene en een heterogene klasse?",
   "o": [
    "Een homogene klasse telt evenveel waarnemingen, een heterogene niet",
    "Een homogene klasse hoort bij continue data, een heterogene bij nominale data",
    "Een homogene klasse staat altijd onderaan in de frequentietabel, een heterogene bovenaan",
    "Bij een homogene klasse blijft het meetniveau behouden, bij een heterogene niet"
   ],
   "a": 3,
   "u": "Het onderscheid draait volledig om het meetniveau: behoud ervan levert een homogene klasse op, verlaging een heterogene. Het aantal waarnemingen, de plaats in de tabel en het onderscheid continu versus nominaal spelen daarbij geen rol."
  },
  {
   "h": "h2",
   "q": "In welke situatie is een stam-en-loofdiagram de geschikte keuze?",
   "o": [
    "Bij grote datasets waarin je enkel de globale vorm van de verdeling wil zien",
    "Bij nominale variabelen zoals haarkleur of geslacht",
    "Bij tijdsreeksen, om een trend over de jaren heen te tonen",
    "Bij kleine datasets waarbij je de exacte meetwaarden wil kunnen terugvinden"
   ],
   "a": 3,
   "u": "De sterkte van dit diagram is dat de oorspronkelijke cijfers zichtbaar blijven, en dat is enkel werkbaar bij een beperkte dataset. Voor de globale vorm bij veel data neem je een histogram, voor categorieën een staaf- of taartdiagram, en voor evolutie in de tijd een lijndiagram."
  },
  {
   "h": "h2",
   "q": "Wat doe je met de klassengrenzen bij een discrete variabele tegenover een continue variabele?",
   "o": [
    "Bij allebei tel je er 0,5 bij op om de exacte grenzen te krijgen",
    "Bij een continue variabele trek je 0,5 af, bij een discrete laat je de grenzen staan",
    "Bij een discrete variabele trek je 0,5 van de grenzen af, bij een continue niet",
    "Bij allebei laat je de grenzen ongewijzigd en verschuif je enkel het klassenmidden"
   ],
   "a": 2,
   "u": "Discrete meetwaarden staan op een schaal met sprongen, dus je zet de grens 0,5 lager om de exacte klassengrens te krijgen die het onderliggende continue interval afbakent. Bij een continue variabele is die correctie overbodig, want daar liggen de grenzen al op een doorlopende schaal. Het klassenmidden bereken je pas daarna als (X+Y)/2."
  },
  {
   "h": "h2",
   "q": "Wat is het oordeel van de cursus over grafieken in drie dimensies?",
   "o": [
    "Ze zijn af te raden, want ze verminderen de leesbaarheid en vertekenen",
    "Ze zijn de beste keuze bij categorische data omdat er meer informatie in past",
    "Ze mogen zonder bezwaar, zolang je maar met absolute frequenties werkt",
    "Ze vormen enkel bij continue variabelen een probleem, bij categorische niet"
   ],
   "a": 0,
   "u": "Diepte maakt een figuur visueel aantrekkelijk, maar de blokjes staan niet tegen de achterkant van de bodem, waardoor je bovenaan wat hoogte moet bijtellen en dus verkeerd afleest. Een taartdiagram in drie dimensies gebruik je volgens de cursus zelfs nooit. Een goede grafiek is overzichtelijk, duidelijk en eenvoudig leesbaar, en het type frequentie of het meetniveau lost dat leesprobleem niet op."
  },
  {
   "h": "h3",
   "q": "Je maakt een tijdcurve (time plot) van het aantal uren slaap van een deelnemer over twaalf weken. Hoe zet je de assen op?",
   "o": [
    "De gemeten variabele op de horizontale as en de tijd op de verticale as",
    "Beide assen mag je vrij kiezen, zolang je het onderschrift maar duidelijk maakt",
    "De tijd op de horizontale as en de gemeten variabele op de verticale as",
    "De tijd op de horizontale as en de cumulatieve frequentie op de verticale as"
   ],
   "a": 2,
   "u": "Bij een tijdcurve staat de tijd altijd op de horizontale as en de gemeten variabele op de verticale as, dat is geen vrije keuze. Een cumulatieve frequentie hoort bij kwantielen, niet bij een tijdcurve."
  },
  {
   "h": "h3",
   "q": "In een dataset van reactietijden voeg je per ongeluk een deelnemer toe met een absurd hoge score. Wat gebeurt er met de centrummaten?",
   "o": [
    "Het rekenkundig gemiddelde wordt naar de staart getrokken, de mediaan verschuift nauwelijks",
    "De mediaan schuift sterk mee omhoog, terwijl het gemiddelde gelijk blijft",
    "Beide maten schuiven even sterk omhoog, want ze meten hetzelfde centrum",
    "Geen van beide verandert, want een centrummaat gebruikt enkel de middelste waarden"
   ],
   "a": 0,
   "u": "Het gemiddelde gebruikt alle waarden in de som en wordt daardoor altijd naar de staart getrokken door extreme waarnemingen, het is dus geen robuuste maat. De mediaan kijkt enkel naar de positie van de middelste waarneming en blijft zo goed als op zijn plaats."
  },
  {
   "h": "h3",
   "q": "Hoe wordt het eerste kwartiel Q1 in dit hoofdstuk omschreven?",
   "o": [
    "De kleinste waarneming van de hele reeks",
    "Het gemiddelde van de laagste helft van de waarnemingen",
    "De waarde die precies een kwart van de variatiebreedte boven het minimum ligt",
    "De mediaan van de waarnemingen die kleiner zijn dan de mediaan"
   ],
   "a": 3,
   "u": "Q1 is de mediaan van het deel van de reeks dat onder de mediaan ligt, net zoals Q3 de mediaan is van het deel erboven. Het is dus geen gemiddelde en het heeft niets te maken met de variatiebreedte of met het minimum."
  },
  {
   "h": "h3",
   "q": "Een onderzoeker rapporteert Q1 = 12, Q2 = 18 en Q3 = 24. Wat is de interkwartielafstand en wat zegt die?",
   "o": [
    "18, namelijk de mediaan, die het centrum van de reeks aangeeft",
    "12, namelijk Q3 min Q1, de spreiding van de middelste helft van de waarnemingen",
    "36, namelijk Q3 plus Q1, de totale breedte van de verdeling",
    "6, namelijk het verschil tussen twee opeenvolgende kwartielen, de gemiddelde afwijking"
   ],
   "a": 1,
   "u": "De IKA is per definitie Q3 min Q1, hier dus 24 min 12 is 12, en beschrijft hoe breed de middelste helft van de gegevens ligt. Kwartielen optellen of enkel Q2 min Q1 nemen zijn geen gedefinieerde maten in dit hoofdstuk."
  },
  {
   "h": "h3",
   "q": "Bij welke grens spreek je van een extreme uitschieter in plaats van een gewone?",
   "o": [
    "Onder Q1 min 3 keer de IKA of boven Q3 plus 3 keer de IKA",
    "Onder Q1 min 1.5 keer de IKA of boven Q3 plus 1.5 keer de IKA",
    "Onder de mediaan min 3 keer de IKA of boven de mediaan plus 3 keer de IKA",
    "Zodra een waarde buiten het minimum en maximum van de middelste helft valt"
   ],
   "a": 0,
   "u": "De grens van 1.5 keer de IKA voorbij Q1 of Q3 levert gewone buitenbeentjes op, pas bij 3 keer de IKA heet een waarneming extreem. De grenzen worden bovendien vanaf de kwartielen gerekend, niet vanaf de mediaan."
  },
  {
   "h": "h3",
   "q": "Welke van deze karakteristieke waarden is robuust, dus niet gevoelig voor buitenbeentjes?",
   "o": [
    "De variatiebreedte",
    "De standaarddeviatie",
    "De mediaan",
    "Het rekenkundig gemiddelde"
   ],
   "a": 2,
   "u": "Maten die op alle waarnemingen steunen, zoals gemiddelde en standaarddeviatie, of net op de extreme waarden, zoals variatiebreedte, minimum en maximum, zijn gevoelig voor buitenbeentjes. De mediaan, de kwantielen en de interkwartielafstand zijn dat niet en heten daarom robuust."
  },
  {
   "h": "h3",
   "q": "Welke reeks gelijkheden klopt volgens dit hoofdstuk?",
   "o": [
    "Mediaan = Q1 = D1 = P25",
    "Mediaan = Q2 = D5 = P50",
    "Mediaan = Q3 = D5 = P75",
    "Mediaan = Q2 = D2 = P20"
   ],
   "a": 1,
   "u": "De mediaan is het tweede kwartiel, het vijfde deciel en het vijftigste percentiel, want alle vier wijzen ze naar het punt waar de helft van de waarnemingen bereikt is. Q1 hoort bij P25 en Q3 bij P75, dat zijn andere posities in de verdeling."
  },
  {
   "h": "h3",
   "q": "Wat betekent het als in een verslag staat dat D3 gelijk is aan 41?",
   "o": [
    "Dat drie waarnemingen de waarde 41 hebben",
    "Dat 41 procent van alle waarnemingen onder de meetwaarde 3 ligt",
    "Dat de derde grootste waarneming gelijk is aan 41",
    "Dat de cumulatieve frequentie bij 41 op 3/10 van de waarnemingen staat"
   ],
   "a": 3,
   "u": "Een deciel is een kwantiel dat de reeks in tienden verdeelt, dus D3 is de meetwaarde waar de cumulatieve frequentie 3/10 van alle waarnemingen bereikt. Het gaat om een positie in de opgebouwde verdeling, niet om hoe vaak een waarde voorkomt of om de derde grootste score."
  },
  {
   "h": "h3",
   "q": "Je beschrijft de maandinkomens in een steekproef waarin enkele mensen extreem veel verdienen. Welke keuze past het best bij het centrum van die verdeling, en waarom?",
   "o": [
    "De mediaan, omdat die robuust is en dus niet meegetrokken wordt door de hoge staart",
    "Het rekenkundig gemiddelde, omdat het alle waarnemingen gebruikt en daardoor nauwkeuriger is",
    "De variatiebreedte, omdat die meteen laat zien hoe ver de inkomens uit elkaar liggen",
    "Het maximum, omdat de hoogste waarde het meest zegt over de verdeling"
   ],
   "a": 0,
   "u": "Precies omdat het gemiddelde alle waarden meetelt, wordt het door een paar zeer hoge inkomens naar de rechterstaart getrokken en overschat het het typische inkomen. De mediaan is robuust en geeft hier een eerlijker beeld, terwijl variatiebreedte en maximum spreidings- of randinformatie zijn en helemaal geen centrummaat."
  },
  {
   "h": "h3",
   "q": "Een testscore van 118 blijkt overeen te komen met P23. Hoe lees je dat correct?",
   "o": [
    "23 personen scoorden hoger dan die score",
    "Bij die score staat de cumulatieve frequentie op 23 procent",
    "De score ligt 23 punten boven de mediaan van de reeks",
    "23 procent van de waarnemingen heeft precies deze score"
   ],
   "a": 1,
   "u": "Een percentiel is een kwantiel uitgedrukt in procenten, dus P23 is de meetwaarde waarbij de cumulatieve frequentie 23 procent van alle waarnemingen bedraagt. Het gaat dus om het opgestapelde aandeel tot die score, niet om een aantal personen erboven, niet om een afstand tot de mediaan en niet om hoeveel waarnemingen exact die score halen."
  },
  {
   "h": "h4",
   "q": "Een onderzoeker berekent voor elke deelnemer de waarde (xi min het gemiddelde). Wat heeft ze daarmee precies uitgerekend?",
   "o": [
    "De variantie van de steekproef, dus de gemiddelde spreiding rond het centrum",
    "De variatiebreedte van de reeks",
    "Een deviatiescore, dus hoe ver die waarneming van het gemiddelde ligt",
    "De standaardafwijking van die ene waarneming"
   ],
   "a": 2,
   "u": "Een deviatiescore is het verschil tussen een waarneming en het gemiddelde en geeft dus de afstand tot het gemiddelde weer. De variantie en de standaardafwijking komen pas daarna, na kwadrateren en middelen, en de variatiebreedte kijkt enkel naar hoogste min laagste."
  },
  {
   "h": "h4",
   "q": "Waarom werkt men met gekwadrateerde deviaties in plaats van met de gewone gemiddelde afstand tot het gemiddelde?",
   "o": [
    "Omdat de gewone deviaties elkaar opheffen en je altijd nul zou uitkomen",
    "Omdat kwadrateren de meeteenheid van de data bewaart",
    "Omdat je zonder kwadraten enkel de mediaan kan berekenen en niet het gemiddelde",
    "Omdat kwadrateren de invloed van uitschieters netjes wegwerkt"
   ],
   "a": 0,
   "u": "Positieve en negatieve afwijkingen heffen elkaar op, dus de gewone gemiddelde afstand is altijd nul en daarom neem je de omweg via de variantie. Kwadrateren negeert juist de richting en versterkt grote afstanden, waardoor uitschieters zwaarder meetellen, en de oorspronkelijke meeteenheid komt pas terug na het worteltrekken."
  },
  {
   "h": "h4",
   "q": "Wat is het verband tussen de variantie en de standaardafwijking?",
   "o": [
    "De standaardafwijking is de variantie gedeeld door het aantal waarnemingen",
    "De variantie is de gemiddelde absolute afwijking en de standaardafwijking het kwadraat daarvan",
    "Het zijn twee namen voor exact dezelfde waarde",
    "De standaardafwijking is de vierkantswortel uit de variantie"
   ],
   "a": 3,
   "u": "De variantie is de gemiddelde gekwadrateerde afstand tot het gemiddelde, en daar trek je de vierkantswortel uit om bij de standaardafwijking te komen. Daardoor staat de standaardafwijking weer in dezelfde meeteenheid als de data, terwijl de variantie in kwadraten blijft steken."
  },
  {
   "h": "h4",
   "q": "Een student trekt een steekproef en wil daaruit de spreiding in de populatie schatten. Door welk getal deelt hij bij het berekenen van de variantie, en waarom?",
   "o": [
    "Door n, want anders overschat hij de spreiding systematisch",
    "Door n - 1, want er zijn maar n - 1 vrijheidsgraden",
    "Door n - 1, want een steekproef is per definitie te klein",
    "Door het aantal categorieën van de variabele"
   ],
   "a": 1,
   "u": "Bij schatten deel je door het aantal vrijheidsgraden, en dat zijn er n - 1, omdat het gemiddelde uit dezelfde gegevens berekend is als de deviaties. Delen door n zou de spreiding onderschatten, de omvang van de steekproef op zich is niet de reden, en het aantal categorieën speelt hier geen enkele rol."
  },
  {
   "h": "h4",
   "q": "Voor welke variabele mag je zonder bezwaar een standaardafwijking rapporteren?",
   "o": [
    "Reactietijd in milliseconden",
    "De studierichting van de deelnemers",
    "De rangorde waarin deelnemers een taak afwerkten",
    "De postcode van de woonplaats"
   ],
   "a": 0,
   "u": "De standaardafwijking is een spreidingsmaat rond het gemiddelde, dus je hebt minstens meetniveau interval of ratio nodig, en reactietijd voldoet daaraan. Studierichting en postcode zijn nominaal en een rangorde is ordinaal, dus daar kan je het gemiddelde niet zinvol berekenen, ook al staan er cijfers."
  },
  {
   "h": "h4",
   "q": "De inkomens in een steekproef vormen een duidelijk scheve verdeling met enkele zeer hoge uitschieters. Welk paar maten rapporteer je dan het best?",
   "o": [
    "Het gemiddelde en de standaardafwijking",
    "De modus en de variatiebreedte",
    "Het gemiddelde en de variatiecoëfficiënt",
    "De mediaan en de interkwartielafstand"
   ],
   "a": 3,
   "u": "Bij scheve verdelingen of uitschieters zijn de mediaan en de interkwartielafstand geschikter, want die laten zich niet meeslepen door extreme waarden. Het gemiddelde en de standaardafwijking zijn juist wel gevoelig voor uitschieters en horen bij min of meer symmetrische verdelingen, en de variatiebreedte wordt volledig bepaald door de twee extreemste scores."
  },
  {
   "h": "h4",
   "q": "Temperatuurmetingen worden omgerekend van graden Celsius naar graden Fahrenheit. Wat is het gevolg voor de gegevens?",
   "o": [
    "De verdeling wordt symmetrischer, maar het centrum blijft liggen waar het lag",
    "De vorm van de verdeling blijft dezelfde, maar het gemiddelde en de standaardafwijking krijgen andere waarden",
    "Zowel de vorm als alle karakteristieke maten blijven ongewijzigd, want een omrekening verandert enkel de naam van de eenheid",
    "Enkel het centrum verschuift, de spreiding blijft in getalwaarde gelijk"
   ],
   "a": 1,
   "u": "Een lineaire transformatie verandert niets aan de vorm van de frequentieverdeling, je legt in feite gewoon een andere X-as onder dezelfde data. De maten van centrum en spreiding schuiven en schalen wel mee, dus zowel het gemiddelde als de standaardafwijking krijgt een andere getalwaarde."
  },
  {
   "h": "h4",
   "q": "Twee onderzoekers meten op schalen met een heel verschillende grootteorde en willen de spreiding relatief met elkaar vergelijken. Welke maat is daarvoor bedoeld?",
   "o": [
    "De variatiebreedte",
    "De interdecielafstand",
    "De variatiecoëfficiënt",
    "De gemiddelde absolute afwijking"
   ],
   "a": 2,
   "u": "De variatiecoëfficiënt is de verhouding tussen de standaardafwijking en het gemiddelde en zegt dus hoe groot de spreiding is ten opzichte van de schaal zelf. De drie andere maten blijven in de oorspronkelijke meeteenheid staan en zijn daardoor niet zomaar over verschillende schalen heen te vergelijken."
  },
  {
   "h": "h4",
   "q": "Wat geldt altijd voor een dichtheidskromme?",
   "o": [
    "De totale oppervlakte eronder is gelijk aan 1 en de curve blijft boven de X-as",
    "De curve raakt de X-as precies in het midden van de verdeling",
    "De oppervlakte eronder komt overeen met het aantal waarnemingen",
    "De curve is per definitie symmetrisch rond het gemiddelde, met mediaan en modus in datzelfde punt"
   ],
   "a": 0,
   "u": "Een dichtheidskromme beschrijft de verdeling met een gladde curve die boven de X-as blijft, want het gaat om kansen, en de totale oppervlakte is precies 1. Symmetrie is geen voorwaarde, en de oppervlakte staat voor een proportie of kans, niet voor een aantal waarnemingen."
  },
  {
   "h": "h4",
   "q": "In een tekst lees je dat het centrum gelijk is aan mu en de spreiding aan sigma. Waarover gaat het dan?",
   "o": [
    "Over de waargenomen data van de steekproef",
    "Over een geobserveerde proportie en de bijhorende spreiding in de steekproef",
    "Over de deviatiescores van de ruwe gegevens",
    "Over de dichtheidskromme, dus het model of de populatie erachter"
   ],
   "a": 3,
   "u": "Griekse letters zoals mu, sigma en pi horen bij de dichtheidskromme, dus bij de populatie of het model. Voor waargenomen data gebruik je x met een streepje, s en p, en deviatiescores krijgen geen apart symbool van dat type."
  },
  {
   "h": "h5",
   "q": "Welke twee kengetallen leggen een normaalverdeling volledig vast, zodat je met de notatie N(...) meteen weet over welke kromme het gaat?",
   "o": [
    "De mediaan en het bereik van de scores",
    "De modus en het aantal observaties",
    "Het gemiddelde en de standaarddeviatie",
    "De klassenbreedte en de hoogte van de top"
   ],
   "a": 2,
   "u": "Elke normaalverdeling wordt volledig bepaald door haar verwachting (gemiddelde) en haar standaarddeviatie, vandaar de notatie N(mu ; sigma). Mediaan, modus, bereik of aantal observaties voegen daar niets aan toe, want de vorm ligt al vast zodra je die twee kent."
  },
  {
   "h": "h5",
   "q": "Een student krijgt op een toets een gestandaardiseerde score van z = 1,5. Wat betekent dat getal?",
   "o": [
    "De score ligt anderhalve standaarddeviatie boven het gemiddelde",
    "De score ligt anderhalf punt boven het gemiddelde",
    "Anderhalf procent van de groep scoort hoger dan deze student",
    "De score valt precies op percentielrang 15"
   ],
   "a": 0,
   "u": "Standaardiseren zet ruwe waarden om via z = (x - mu) / sigma, en een z-score drukt dus uit hoeveel standaarddeviaties een waarde van het gemiddelde af ligt. Het gaat niet om ruwe punten, niet om een percentage en niet om een percentielrang, dat zijn andere schalen."
  },
  {
   "h": "h5",
   "q": "Volgens de 68-95-99.7 regel: hoeveel van de observaties liggen in een standaardnormaalverdeling tussen z = -2 en z = 2?",
   "o": [
    "Ongeveer 68 procent",
    "Ongeveer 99,7 procent",
    "Ongeveer 50 procent",
    "Ongeveer 95 procent"
   ],
   "a": 3,
   "u": "De vuistregel koppelt 1 standaarddeviatie aan ongeveer 68 procent, 2 aan ongeveer 95 procent en 3 aan ongeveer 99,7 procent. De 68 hoort dus bij het interval van -1 tot 1 en de 99,7 bij -3 tot 3; 50 procent is enkel de helft links of rechts van het gemiddelde."
  },
  {
   "h": "h5",
   "q": "Je kent de z-score van een observatie en wil de bijbehorende ruwe waarde terugvinden. Welke bewerking hoort bij dat ontstandaardiseren?",
   "o": [
    "De z-score delen door de standaarddeviatie en daarna het gemiddelde eraf trekken",
    "De z-score vermenigvuldigen met de standaarddeviatie en daar het gemiddelde bij optellen",
    "De z-score vermenigvuldigen met het gemiddelde en daar de standaarddeviatie bij optellen",
    "Het gemiddelde van de z-score aftrekken en het resultaat delen door de standaarddeviatie"
   ],
   "a": 1,
   "u": "Ontstandaardiseren is de omgekeerde weg van standaardiseren: x = mu + z maal sigma. Eerst aftrekken en dan delen door de standaarddeviatie is net de beweging heen, dus standaardiseren, en de varianten die het gemiddelde en de standaarddeviatie van rol wisselen vervormen de schaal onherkenbaar."
  },
  {
   "h": "h5",
   "q": "De empirische coëfficiënt van Pearson komt in een dataset uit op een duidelijk positieve waarde. Wat leid je daaruit af over de vorm van de verdeling?",
   "o": [
    "Ze is rechtsscheef, de staart loopt naar de rechterkant",
    "Ze is linksscheef, de staart loopt naar de linkerkant",
    "Ze is perfect symmetrisch rond het gemiddelde",
    "Ze is sterker gepiekt dan een normaalverdeling"
   ],
   "a": 0,
   "u": "Die coëfficiënt meet in standaarddeviaties hoe groot het verschil tussen gemiddelde en mediaan is: kleiner dan 0 betekent linksscheef, gelijk aan 0 symmetrisch en groter dan 0 rechtsscheef. Gepiektheid is een aparte vormmaat (kurtosis) en zegt niets over scheefheid."
  },
  {
   "h": "h5",
   "q": "Waarom kun je in principe met slechts een van de twee standaardnormaaltabellen werken?",
   "o": [
    "Omdat z-waarden nooit negatief kunnen worden, zodat de tweede tabel leeg zou blijven",
    "Omdat de kromme ophoudt bij drie standaarddeviaties en er daarbuiten niets meer te tabelleren valt",
    "Omdat de tabel enkel bruikbaar is voor ruwe X-waarden en niet voor gestandaardiseerde scores",
    "Omdat je met de complementregel de ontbrekende oppervlakte uit de gegeven oppervlakte kunt afleiden"
   ],
   "a": 3,
   "u": "De totale oppervlakte onder de kromme is 1, dus wat je niet aflezen kunt, haal je met de complementregel uit wat je wel afleest. Negatieve z-waarden bestaan wel degelijk, de staarten lopen theoretisch door voorbij 3, en de tabel is net gemaakt voor z-waarden."
  },
  {
   "h": "h5",
   "q": "Wat wordt binnen de maten van vorm bedoeld met kurtosis?",
   "o": [
    "De mate waarin de verdeling scheef ligt ten opzichte van het gemiddelde",
    "De gepiektheid of afplatting van de kromme, met de normaalverdeling als middenreferentie",
    "Het verschil tussen gemiddelde en mediaan, uitgedrukt in standaarddeviaties",
    "De gemiddelde afstand van de scores tot het gemiddelde, uitgedrukt in de eenheid van de meting"
   ],
   "a": 1,
   "u": "Kurtosis is de vormmaat voor gepiektheid of afplatting, en een normaalverdeling geldt daarbij als de middenklasse (mesokurtisch). Scheefheid is een andere vormmaat, het verschil tussen gemiddelde en mediaan in standaarddeviaties is de empirische coëfficiënt van Pearson, en de gemiddelde afstand van de scores tot het gemiddelde is gewoon een spreidingsmaat."
  },
  {
   "h": "h5",
   "q": "Je benadert een discreet gemeten variabele met een continue verdeling en gebruikt bij de waarde 8 het interval van 7,5 tot 8,5. Waarom doe je dat?",
   "o": [
    "Om gemiddelde en standaarddeviatie van beide verdelingen exact gelijk te maken",
    "Omdat een discrete waarde anders een negatieve kans zou krijgen en oppervlaktes onder de kromme nooit negatief mogen zijn",
    "Omdat een afgeronde waarde in werkelijkheid een hele klasse dekt en je die klasse volledig in de oppervlakte moet meenemen",
    "Omdat de normaalverdeling enkel gedefinieerd is voor gehele getallen"
   ],
   "a": 2,
   "u": "Dit is de continuïteitscorrectie: door af te ronden verandert een continue meting in een discreet punt, terwijl dat punt eigenlijk voor een heel klasse-interval staat. Je neemt dat volledige interval mee, anders reken je een stuk oppervlakte en dus een stuk kans niet mee."
  },
  {
   "h": "h5",
   "q": "Wat is de belangrijkste beperking van percentielrangen, die je in de gaten moet houden bij normaal kwantielplots?",
   "o": [
    "Ze respecteren de afstanden tussen de ruwe meetwaarden niet, want de stap van P40 naar P50 hoeft niet even groot te zijn als die van P50 naar P60",
    "Ze kunnen alleen berekend worden bij verdelingen die perfect symmetrisch zijn",
    "Ze veranderen het gemiddelde en de standaarddeviatie van de oorspronkelijke verdeling",
    "Ze zijn enkel bruikbaar bij variabelen op nominaal meetniveau, want zodra je met echte meetwaarden werkt, verliezen percentielrangen hun betekenis"
   ],
   "a": 0,
   "u": "Een percentielrang zegt alleen hoeveel procent onder je zit, niet hoeveel ruwe punten er tussen twee rangen liggen, dus gelijke stappen in rang zijn geen gelijke stappen in meetwaarde. De verdeling zelf wordt er niet door veranderd, en rangorde vraagt minstens ordinaal meetniveau, niet nominaal."
  },
  {
   "h": "h5",
   "q": "Bij de centrale momenten hoort een vast rijtje eigenschappen. Welke uitspraak klopt?",
   "o": [
    "Het eerste moment is het gemiddelde, het tweede de mediaan en het derde de modus",
    "Het eerste moment is de variantie, het tweede is nul en het derde meet de gepiektheid",
    "Centrale momenten met een even macht zijn maten voor asymmetrie",
    "Het eerste moment is nul, het tweede is de variantie en het derde is een maat voor asymmetrie"
   ],
   "a": 3,
   "u": "De afwijkingen tot het gemiddelde tellen samen op tot nul, dus m1 = 0; m2 komt overeen met de variantie en m3 werkt als maat voor asymmetrie. Even machten geven spreidingsmaten en oneven machten maten voor asymmetrie, dus wie de even momenten aan asymmetrie koppelt draait het net om."
  },
  {
   "h": "h6",
   "q": "Je onderzoekt of het aantal uren slaap iets doet met de score op een geheugentest. Welke variabele is hier de verklarende (onafhankelijke) variabele?",
   "o": [
    "De testscore, want dat is het cijfer dat je effectief meet",
    "Het aantal uren slaap, want dat verklaart of veroorzaakt de verandering in de andere variabele",
    "Allebei, want bij samenhang zijn de rollen van de twee variabelen altijd inwisselbaar",
    "Geen van beide, want zo'n variabele moet altijd categorisch zijn"
   ],
   "a": 1,
   "u": "De verklarende variabele verklaart of veroorzaakt veranderingen in de verklaarde variabele, en de verklaarde (afhankelijke) variabele meet de uitkomst van de studie. De testscore is dus de uitkomst, en de rollen liggen vast zodra je bepaalt wat je wil verklaren."
  },
  {
   "h": "h6",
   "q": "Bij welk soort verband laat de meetwaarde van de ene variabele toe om de meetwaarde van de andere perfect te voorspellen?",
   "o": [
    "Een analytisch verband",
    "Een stochastisch verband",
    "Een monotoon dalend verband",
    "Een niet-monotoon verband"
   ],
   "a": 0,
   "u": "Bij een analytisch verband volgt de ene waarde exact uit de andere, bij een stochastisch verband kun je enkel min of meer correct schatten. Monotoon of niet-monotoon gaat over de richting van het verband, niet over hoe perfect de voorspelling is."
  },
  {
   "h": "h6",
   "q": "In een scatterplot gaat elke toename op de x-as samen met een toename op de y-as, en de richting keert nergens om. Hoe omschrijf je dat verband?",
   "o": [
    "Niet-monotoon stijgend, want de punten liggen niet exact op een rechte",
    "Analytisch, want de richting blijft dezelfde",
    "Monotoon stijgend",
    "Monotoon dalend"
   ],
   "a": 2,
   "u": "Monotoon stijgend betekent precies dat: verandering op x gaat altijd samen met een stijging op y, zonder richtingsverandering. Niet-monotoon zou betekenen dat de richting regelmatig omslaat, en analytisch slaat op perfecte voorspelbaarheid, niet op de richting."
  },
  {
   "h": "h6",
   "q": "Je wil de samenhang nagaan tussen twee dichotome variabelen, bijvoorbeeld wel of niet gestudeerd en wel of niet geslaagd. Welke associatiemaat hoort daarbij?",
   "o": [
    "De Pearson correlatie r",
    "Lambda",
    "Een t-test",
    "De determinatiecoëfficiënt r kwadraat"
   ],
   "a": 1,
   "u": "Voor twee dichotome variabelen gebruik je lambda, die uitdrukt welk deel van de oorspronkelijke voorspelfouten wegvalt zodra je de tweede variabele kent. De correlatie r hoort bij twee continue variabelen en een t-test bij een continue met een dichotome variabele."
  },
  {
   "h": "h6",
   "q": "Je vergelijkt de reactietijd (continu) tussen twee groepen, namelijk wel of niet uitgeslapen (dichotoom). Welke techniek past bij die combinatie van meetniveaus?",
   "o": [
    "Lambda, omdat die met foutenreductie werkt",
    "Een driedimensionale scatterplot, omdat er twee soorten variabelen zijn",
    "Pearson correlatie, want die kan met elk meetniveau overweg",
    "Een t-test"
   ],
   "a": 3,
   "u": "Bij een combinatie van een continue en een dichotome variabele hoort de t-test. Lambda vraagt twee dichotome variabelen, en de correlatie r vraagt twee kwantitatieve variabelen (of een kwantitatieve met een dichotome), dus zeker niet elk meetniveau."
  },
  {
   "h": "h6",
   "q": "Uit een studie komt een correlatie van 0,60 tussen studietijd en examenscore. Wat leer je uit de bijhorende determinatiecoëfficiënt?",
   "o": [
    "Dat 60 procent van de variantie in de examenscore verklaard wordt door studietijd",
    "Dat studietijd 36 procent van de examenscore veroorzaakt",
    "Dat 36 procent van de variantie in de examenscore verklaard wordt door studietijd",
    "Dat 36 procent van de gegevens uitschieters zijn die het beeld vertekenen"
   ],
   "a": 2,
   "u": "De determinatiecoëfficiënt is de correlatie in het kwadraat, dus 0,60 maal 0,60 is 0,36 of 36 procent verklaarde variantie. Je mag die 60 procent dus niet rechtstreeks aflezen uit r, en verklaarde variantie is nog altijd geen bewijs van oorzaak."
  },
  {
   "h": "h6",
   "q": "Studie A vindt een correlatie van -0,85, studie B vindt 0,40. In welke studie is de lineaire samenhang het sterkst?",
   "o": [
    "In studie B, want een positief verband weegt zwaarder dan een negatief",
    "In allebei even sterk, want een correlatie toont enkel of er samenhang is en het teken zegt verder niets over de grootte",
    "In studie A, want de sterkte zit in hoe ver de waarde van nul ligt en het minteken geeft enkel de richting aan",
    "Dat valt niet te zeggen zolang je de steekproefgrootte niet kent"
   ],
   "a": 2,
   "u": "De correlatie loopt van -1 (perfect negatief) over 0 (geen samenhang) tot 1 (perfect positief), dus hoe verder van nul, hoe sterker. Het teken zegt alleen of het verband stijgend of dalend is, niet hoe sterk het is."
  },
  {
   "h": "h6",
   "q": "In een dataset hangt het aantal verkochte ijsjes sterk samen met het aantal zonnesteken, met een correlatie van 0,80. Wat mag je daaruit besluiten?",
   "o": [
    "Dat er een verband bestaat, maar niet dat het ene het andere veroorzaakt",
    "Dat ijsjes eten zonnesteken veroorzaakt, want de correlatie is hoog",
    "Dat er nog geen verband is zolang de waarde niet gelijk is aan 1",
    "Dat de rol van verklarende variabele automatisch vastligt bij zo'n hoge waarde"
   ],
   "a": 0,
   "u": "Correlatie geeft enkel aan dat er een verband is, ze impliceert geen oorzakelijk verband. Een waarde van 0,80 wijst op een sterk lineair verband, dus zeker niet op geen verband, en welke variabele verklarend is bepaal jij op inhoudelijke gronden."
  },
  {
   "h": "h6",
   "q": "Waarom is het volgens de cursus een goede gewoonte om altijd eerst een scatterplot te tekenen voor je de correlatie berekent?",
   "o": [
    "Omdat je de correlatie pas mag berekenen vanaf drie variabelen",
    "Omdat je zo een niet-lineair verband kunt uitsluiten, want die maat vat enkel de lineaire samenhang",
    "Omdat je uit de figuur meteen de waarde van de correlatiecoëfficiënt kunt aflezen zonder te rekenen",
    "Omdat de figuur afwijkende punten automatisch uit de gegevens haalt"
   ],
   "a": 1,
   "u": "De tip in de cursus is om eerst een scatterplot te maken zodat je een eventueel niet-lineair verband uitsluit, en meteen ziet of er uitschieters zijn, want de correlatie is daar gevoelig voor. Een figuur verwijdert natuurlijk niets uit je data en verandert je resultaat niet."
  },
  {
   "h": "h6",
   "q": "Je hebt een scatterplot van studietijd tegenover examenscore en wil daar ook de opleidingsrichting in tonen. Hoe pak je zo'n categorische variabele aan?",
   "o": [
    "Je zet de richting op de y-as en de examenscore op de x-as",
    "Je laat de figuur vallen en rapporteert enkel een aparte correlatie per groep",
    "Dat kan niet, in een scatterplot passen nooit meer dan twee variabelen",
    "Je geeft de datapunten per categorie een andere kleur"
   ],
   "a": 3,
   "u": "Een categorische variabele voeg je toe door de punten per categorie anders te kleuren, zodat je de twee kwantitatieve assen behoudt. Voeg je een derde variabele op intervalschaal toe, dan kijk je wel naar een driedimensionale figuur."
  },
  {
   "h": "h7",
   "q": "Wat wordt er precies zo klein mogelijk gemaakt bij de methode van de kleinste kwadraten voor de rechte van y op x?",
   "o": [
    "De som van de gekwadrateerde verticale afstanden van de datapunten tot de rechte",
    "De som van de gekwadrateerde horizontale afstanden van de datapunten tot de rechte",
    "De som van de afwijkingen zelf, dus zonder ze eerst te kwadrateren",
    "De som van de loodrechte (kortste) afstanden van elk punt tot de rechte"
   ],
   "a": 0,
   "u": "De kleinste-kwadratenrechte van y op x minimaliseert de som van de kwadraten van de verticale afstanden, en die verticale afstanden zijn net de residuen. Horizontale of loodrechte afstanden horen niet bij dit model, en de gewone afwijkingen zonder kwadraat heffen elkaar op omdat plus en min elkaar wegvegen."
  },
  {
   "h": "h7",
   "q": "In de regressievergelijking y-dak = b0 + b1x, wat drukt b1 uit?",
   "o": [
    "De voorspelde waarde van de afhankelijke variabele wanneer de verklarende variabele nul is",
    "Het percentage van de variantie in y dat door x verklaard wordt",
    "Het gemiddelde van de afhankelijke variabele in de steekproef",
    "De verandering in y die hoort bij een toename van x met een eenheid"
   ],
   "a": 3,
   "u": "b1 is de helling en geeft dus aan hoeveel y verandert als x met een eenheid toeneemt. Het intercept b0 is de voorspelde y bij x gelijk aan nul, en het aandeel verklaarde variantie is r kwadraat, niet de helling."
  },
  {
   "h": "h7",
   "q": "Door welk punt loopt een kleinste-kwadratenregressierechte hoe dan ook?",
   "o": [
    "Door de oorsprong, dus door het punt (0,0)",
    "Door het punt gevormd door het gemiddelde van x en het gemiddelde van y",
    "Door de laagste en de hoogste waarneming van de dataset",
    "Door het punt gevormd door de mediaan van x en de mediaan van y"
   ],
   "a": 1,
   "u": "Een vaste eigenschap van de regressierechte is dat ze altijd door het punt van de twee gemiddelden gaat. Door de oorsprong gaat ze alleen toevallig, en medianen of extreme waarnemingen spelen in dit model geen rol."
  },
  {
   "h": "h7",
   "q": "Een onderzoeker vindt r = 0,40 tussen studietijd en examenscore. Iemand scoort 1 standaarddeviatie boven het gemiddelde op studietijd. Wat voorspelt het model voor de examenscore?",
   "o": [
    "Ongeveer 1 standaarddeviatie boven het gemiddelde, want de rechte is lineair",
    "Ongeveer 0,16 standaarddeviatie boven het gemiddelde",
    "Ongeveer 0,40 standaarddeviatie boven het gemiddelde",
    "Niets, want deze regel geldt enkel als je de rechte in z-waarden opschrijft"
   ],
   "a": 2,
   "u": "In z-scores geldt dat z-dak van y gelijk is aan r maal z van x, dus een verschuiving van 1 standaarddeviatie in x hoort bij r standaarddeviaties in y, hier 0,40. Die regel blijft ook gelden als de rechte niet in z-waarden staat, en 0,16 is r kwadraat, dat gaat over verklaarde variantie."
  },
  {
   "h": "h7",
   "q": "Bij een waarneming hoort een negatief residu. Wat weet je dan over dat punt?",
   "o": [
    "Het ligt onder de regressierechte, want de echte waarde is lager dan de voorspelde",
    "Het ligt boven de regressierechte, want de echte waarde is hoger dan de voorspelde",
    "De voorspelling voor dat punt was perfect en er valt niets meer te verklaren",
    "De helling van de rechte is negatief, dus het verband tussen x en y is omgekeerd"
   ],
   "a": 0,
   "u": "Een residu is de waargenomen waarde min de geschatte waarde, dus negatief betekent dat het bolletje onder de rechte ligt. Een residu van nul zou een perfecte voorspelling zijn, en het teken van een residu zegt niets over de richting van het verband."
  },
  {
   "h": "h7",
   "q": "Wat wil je zien in een residuendiagram als de lineaire regressie goed past?",
   "o": [
    "Een duidelijk stijgende lijn van residuen, dat toont een sterk verband",
    "Een mooie kromme, bijvoorbeeld een U-vorm, rond de nullijn",
    "Residuen die allemaal exact nul zijn, anders is het model onbruikbaar",
    "Residuen die willekeurig rond nul verspreid liggen zonder herkenbaar patroon"
   ],
   "a": 3,
   "u": "Een residuendiagram zet de residuen uit tegenover de verklarende variabele om de fit van de rechte te beoordelen, en een willekeurige wolk rond nul wijst erop dat er niets systematisch overblijft. Elk patroon, zoals een stijging of een kromme, wijst juist op een afwijking van het lineaire verband, en residuen die allemaal precies nul zijn komen in de praktijk niet voor."
  },
  {
   "h": "h7",
   "q": "Een deelnemer is een uitschieter in de x-richting: zijn x-waarde ligt ver buiten het bereik van de rest van de groep. Wat is hiervan het typische gevolg?",
   "o": [
    "Hij heeft een heel groot residu en verstoort daardoor vooral de spreiding van y",
    "Hij heeft sowieso geen invloed, zolang zijn y-waarde niet extreem is",
    "Hij heeft veel invloed: de rechte verschuift merkbaar als je hem weglaat",
    "Hij duwt de correlatiecoëfficiënt automatisch naar nul"
   ],
   "a": 2,
   "u": "Uitschieters in de x-richting hebben vaak een grote invloed op de kleinste-kwadratenrechte, zodat die sterk verandert wanneer je zo een punt verwijdert. Een groot residu hoort bij uitschieters in de y-richting, dus een gewone y-waarde betekent zeker niet dat zo een punt onschuldig is."
  },
  {
   "h": "h7",
   "q": "Een model is gebouwd op deelnemers tussen 18 en 25 jaar. Je gebruikt het om de score van een zestigjarige te schatten. Hoe heet dat en wat betekent het voor je schatting?",
   "o": [
    "Interpolatie, en dat is meestal net de betrouwbaarste manier van schatten",
    "Extrapolatie, en dat brengt vaak veel meer onzekerheid mee",
    "Extrapolatie, en dat is even betrouwbaar zolang de rechte goed past binnen het bereik",
    "Interpolatie, al is de onzekerheid groter dan bij schatten buiten het bereik"
   ],
   "a": 1,
   "u": "Schatten buiten het bereik van de beschikbare data heet extrapoleren en gaat gepaard met veel grotere onzekerheid, zeker ver van de waargenomen x-waarden. Schatten binnen het bereik heet interpoleren en is doorgaans betrouwbaarder, dus die twee begrippen worden hier makkelijk omgewisseld."
  },
  {
   "h": "h7",
   "q": "Er wordt een t-toets gebruikt om na te gaan of een correlatiecoëfficiënt significant van nul verschilt. Welke bedenking hoort daarbij?",
   "o": [
    "Die toets werkt enkel wanneer beide variabelen dichotoom zijn, bij continue metingen mag je hem niet toepassen",
    "De uitkomst van de toets hangt helemaal niet af van de steekproefgrootte",
    "Een p-waarde onder 0,05 bewijst meteen dat x de oorzaak is van y",
    "Met een voldoende groot aantal deelnemers krijg je vrijwel altijd een significant resultaat"
   ],
   "a": 3,
   "u": "De kritiek is precies dat N zo groot gekozen kan worden dat de toets bijna altijd een significant verband oplevert, ook bij een piepklein effect. De t-waarde hangt dus juist wel van N af, de toets werkt ook met een kwantitatieve variabele en een dummy, en significantie zegt niets over oorzakelijkheid."
  },
  {
   "h": "h7",
   "q": "Twee variabelen vertonen een hoge correlatie. Welke conclusie is verantwoord?",
   "o": [
    "Er kan een verborgen derde variabele meespelen, want samenhang betekent niet automatisch oorzaak en gevolg",
    "Het oorzakelijk verband is aangetoond, zeker als r dicht bij 1 of bij min 1 ligt",
    "Uitschieters spelen bij zo een sterk verband geen rol meer in de analyse",
    "Een spreidingsdiagram bekijken is overbodig zodra r hoog genoeg is, want de coëfficiënt vat de puntenwolk dan volledig samen"
   ],
   "a": 0,
   "u": "Correlatie beschrijft een lineair verband, maar impliceert niet altijd causaliteit, en een verborgen derde variabele kan de samenhang veroorzaken zonder dat ze in de analyse zit. Uitschieters beïnvloeden zowel correlatie als regressie sterk, dus een spreidingsdiagram maken en bekijken blijft altijd de eerste stap."
  },
  {
   "h": "h8",
   "q": "Waarvoor dient een contingentietabel?",
   "o": [
    "Om de gemiddelden van twee continue variabelen naast elkaar te zetten",
    "Om de spreiding van 1 numerieke variabele in beeld te brengen",
    "Om de relatie tussen twee categorische variabelen te analyseren, met de frequenties in de cellen",
    "Om te toetsen of een numerieke variabele normaal verdeeld is, door de klassen in kolommen te zetten"
   ],
   "a": 2,
   "u": "Een contingentietabel zet twee categorische variabelen tegen elkaar af, met frequenties in de cellen en de marginale frequenties buiten de tabel. Gemiddelden, spreiding en normaliteit horen bij numerieke variabelen en niet bij dit type tabel."
  },
  {
   "h": "h8",
   "q": "Waarom is het handig om in zo'n tabel met relatieve in plaats van absolute frequenties te werken?",
   "o": [
    "Omdat je groepen die niet even groot zijn dan toch eerlijk met elkaar kunt vergelijken",
    "Omdat absolute aantallen niet in een tweedimensionele tabel passen",
    "Omdat je de marginale totalen dan niet meer nodig hebt om de cellen met elkaar te vergelijken",
    "Omdat je pas met percentages een oorzaak-gevolgverband kunt aantonen"
   ],
   "a": 0,
   "u": "Percentages of verhoudingen maken vergelijken mogelijk zonder dat je in elke groep identiek dezelfde aantallen nodig hebt. De marginale totalen blijf je gewoon nodig, aantallen passen prima in een tabel, en causaliteit toon je nooit aan met een rekenwijze."
  },
  {
   "h": "h8",
   "q": "Iemand berekent alleen de verdeling van elke variabele apart. Wat lukt daarmee niet?",
   "o": [
    "Zien hoeveel cases er in elke categorie van 1 variabele vallen",
    "Uitspraken doen over de samenhang tussen de twee variabelen",
    "De totalen buiten de tabel aflezen",
    "Een grafiek maken van 1 van de twee variabelen"
   ],
   "a": 1,
   "u": "Marginale verdelingen gaan over 1 variabele tegelijk en zeggen dus niets over het verband tussen de twee. Voor dat verband moet je naar de voorwaardelijke verdelingen kijken, terwijl de andere drie opties net wel uit de marginale info volgen."
  },
  {
   "h": "h8",
   "q": "Wat beschrijft een voorwaardelijke verdeling precies?",
   "o": [
    "De ruwe aantallen in elke cel van de tabel, zonder omrekening, zodat je de cellen rechtstreeks met elkaar kunt vergelijken",
    "Het totaal aantal cases in de hele steekproef",
    "Het verschil tussen waargenomen en verwachte celfrequenties",
    "De waarden van de ene variabele bij cases die een specifieke waarde hebben op de andere variabele, uitgedrukt in percentages"
   ],
   "a": 3,
   "u": "Je legt eerst 1 variabele vast op een bepaalde waarde, bijvoorbeeld 1 rij, en kijkt dan hoe de andere variabele zich binnen die groep verdeelt in percentages. Ruwe celaantallen en totalen zijn daarvoor de input, en het verschil met verwachte frequenties hoort bij chi-kwadraat."
  },
  {
   "h": "h8",
   "q": "Je hebt per rij de voorwaardelijke verdelingen berekend. Welke stap sluit het stappenplan af?",
   "o": [
    "Ze grafisch vergelijken in een zij-aan-zij of gesegmenteerd strookdiagram",
    "Een spreidingsdiagram met regressielijn tekenen",
    "Een histogram van de marginale totalen maken en daar de vorm van aflezen",
    "Een normaalcurve over de celfrequenties leggen"
   ],
   "a": 0,
   "u": "Het stappenplan eindigt met een grafiek van de voorwaardelijke verdelingen, en die vergelijk je zij aan zij of in een gesegmenteerde variant. Spreidingsdiagrammen en normaalcurves horen bij numerieke variabelen, en een histogram van de marginalen laat het verband juist weer los."
  },
  {
   "h": "h8",
   "q": "Wat is de kern van de paradox van Simpson?",
   "o": [
    "Het verband wordt automatisch sterker zodra je een derde variabele opneemt",
    "De richting van het verband draait om of het verband verdwijnt wanneer je de subgroepen tot 1 groep samenvoegt",
    "Twee variabelen lijken sterk samen te hangen, terwijl de samenhang volledig door toeval in een te kleine steekproef ontstaat",
    "De cellen van de tabel bevatten te weinig cases om percentages te berekenen"
   ],
   "a": 1,
   "u": "Bij Simpson zie je binnen elke subgroep een bepaald patroon, maar zodra alles op 1 hoop gaat keert dat patroon om of valt het weg, zoals bij het verband tussen het aantal pagina's en de prijs van een boek. Steekproefgrootte en lege cellen zijn andere problemen, en een derde variabele maakt een verband niet vanzelf sterker."
  },
  {
   "h": "h8",
   "q": "In een studie is het verband tussen twee variabelen duidelijk aanwezig bij de ene subgroep en zo goed als afwezig bij de andere. Welk derde-variabele-probleem is dit?",
   "o": [
    "Mediatie, want de derde variabele is de tussenstap die het verband verklaart",
    "Confounding, want de derde variabele correleert met beide variabelen en verstoort zo het verband",
    "Gemeenschappelijke afhankelijkheid, want beide variabelen hangen van eenzelfde oorzaak af",
    "Moderatie, want de sterkte van het verband hangt af van de subgroep"
   ],
   "a": 3,
   "u": "Moderatie betekent precies dit: de relatie tussen de twee variabelen verschilt binnen de subgroepen die door de derde variabele gedefinieerd worden. Bij mediatie zit de derde variabele als tussenstap in de keten, bij confounding vertekent ze het beeld via correlatie met beide, en bij gemeenschappelijke afhankelijkheid is er tussen x en y zelf geen causaal verband."
  },
  {
   "h": "h8",
   "q": "Je bekijkt de samenhang tussen 1 continue en 1 dichotome variabele. Welke techniek hoort daarbij?",
   "o": [
    "Lambda",
    "De correlatie r",
    "Een t-test",
    "Een gesegmenteerd strookdiagram"
   ],
   "a": 2,
   "u": "Het overzicht koppelt twee dichotome variabelen aan lambda, twee continue variabelen aan de correlatie r, en de combinatie van 1 continue met 1 dichotome variabele aan de t-test. Een strookdiagram is een grafiek en geen associatiemaat."
  },
  {
   "h": "h8",
   "q": "Wat vertelt lambda je over twee nominale variabelen?",
   "o": [
    "Welk percentage cellen in de tabel leeg blijft",
    "Hoe steil de rechte is die het beste door de puntenwolk loopt",
    "Hoeveel beter je de uitkomst op de ene variabele voorspelt als je de score op de andere kent",
    "Hoe sterk de waargenomen frequenties afwijken van wat je bij onafhankelijkheid verwacht"
   ],
   "a": 2,
   "u": "Lambda is een associatiemaat voor nominale data en drukt winst in voorspelbaarheid uit: hoeveel beter voorspel je de ene variabele als je de andere kent. De afwijking tussen waargenomen en verwachte frequenties is chi-kwadraat, en een helling hoort bij numerieke variabelen."
  },
  {
   "h": "h8",
   "q": "Waarop steunt de chi-kwadraatbenadering bij een contingentietabel?",
   "o": [
    "Op het vergelijken van de gemiddelden van de twee groepen in de tabel, waarbij de spreiding binnen elke groep als maatstaf dient",
    "Op het vergelijken van de waargenomen frequenties met de frequenties die je bij statistische onafhankelijkheid zou verwachten",
    "Op de winst in voorspelbaarheid van de ene variabele door de andere",
    "Op de sterkte van het lineaire verband tussen twee numerieke variabelen"
   ],
   "a": 1,
   "u": "De verwachte frequentie van een cel volgt uit de marginale verdelingen: je vermenigvuldigt het bijhorende rijtotaal met het kolomtotaal en deelt door N, en dat leg je naast wat je echt geteld hebt. Gemiddelden vergelijken is de t-test, winst in voorspelbaarheid is lambda en een lineair verband is r."
  },
  {
   "h": "h9",
   "q": "Waarom wordt de rangcorrelatie van Spearman met hetzelfde symbool aangeduid als de correlatie van Pearson?",
   "o": [
    "Omdat je bij Spearman gewoon de ruwe scores gebruikt, alleen met een andere formule",
    "Omdat Spearman net als Pearson enkel bij interval- of ratiodata mag worden gebruikt",
    "Omdat Spearman letterlijk de Pearson-correlatie is, maar dan berekend op de rangen in plaats van op de ruwe meetwaarden",
    "Omdat beide maten vertrekken van het aantal concordante en discordante paren en dus dezelfde formule gebruiken"
   ],
   "a": 2,
   "u": "Spearman zet de ruwe meetwaarden eerst om naar rangen (dus naar ordinale data) en berekent daarop een Pearson-correlatie, vandaar hetzelfde symbool met een s erbij. De ruwe scores worden dus juist niet gebruikt, ordinaal niveau volstaat, en het tellen van concordante en discordante paren hoort bij tau en gamma."
  },
  {
   "h": "h9",
   "q": "Een onderzoeker ziet een samenhang die altijd stijgt, maar met heel ongelijke stappen, de puntenwolk loopt duidelijk krom. Welke uitspraak klopt?",
   "o": [
    "Spearman kan hier hoog uitvallen omdat die een monotoon verband meet, terwijl Pearson lager blijft omdat die beschrijft hoe goed een rechte lijn past",
    "Pearson valt hier altijd hoger uit, want ruwe scores bevatten meer informatie dan rangen",
    "Beide maten moeten hier dezelfde waarde geven, want elk stijgend verband is ook lineair en rangen veranderen niets aan de vorm van de puntenwolk",
    "Geen van beide maten mag je hier gebruiken, want de samenhang volgt geen rechte lijn"
   ],
   "a": 0,
   "u": "Pearson meet hoe goed een rechte lijn de samenhang beschrijft, een rangcorrelatie meet of de variabelen consistent samen stijgen of dalen, ook als de vorm krom is. Elk lineair verband is monotoon, maar niet elk monotoon verband is lineair, dus de maten hoeven zeker niet gelijk te zijn."
  },
  {
   "h": "h9",
   "q": "Bij het toekennen van rangen kom je twee personen tegen met exact dezelfde meetwaarde, die samen de plaatsen 2 en 3 innemen. Hoe pak je dat aan?",
   "o": [
    "Allebei krijgen ze rang 2 en de eerstvolgende waarneming krijgt rang 3",
    "Je laat die twee waarnemingen weg, want ze zijn niet te ordenen",
    "Wie het eerst in de tabel staat krijgt rang 2, de andere krijgt rang 3",
    "Allebei krijgen ze 2,5 als rang en de eerstvolgende waarneming krijgt rang 4"
   ],
   "a": 3,
   "u": "Bij gelijke meetwaarden noteer je de gemiddelde rang van de plaatsen die ze innemen, dus (2+3)/2 = 2,5 voor allebei, en daarna spring je door naar 4 omdat plaats 3 al opgebruikt is. Zomaar 2 en 3 verdelen of naar volgorde in de tabel toekennen is willekeurig, en waarnemingen weglaten mag niet."
  },
  {
   "h": "h9",
   "q": "Wat stelt Di voor in de formule van Spearman, en welke controle kan je daarmee doen?",
   "o": [
    "Het verschil tussen de ruwe scores van paar i, de som van alle verschillen hoort 1 te zijn",
    "Het verschil tussen de twee rangnummers binnen paar i, als controle moet de som van alle Di's 0 zijn",
    "Het al gekwadrateerde verschil tussen de rangnummers, waarvan de som per definitie 0 is",
    "Het aantal concordante paren min het aantal discordante paren bij waarneming i"
   ],
   "a": 1,
   "u": "Di is het verschil tussen de rangnummers binnen eenzelfde paar, en omdat de plussen en de minnen elkaar opheffen moet de som van alle Di's uitkomen op 0, een handige rekencontrole voor je verder gaat. Pas daarna kwadrateer je, want een som van kwadraten is bijna nooit 0, en concordante of discordante paren horen bij tau en gamma."
  },
  {
   "h": "h9",
   "q": "Twee variabelen zijn allebei gemeten als een rangorde, bijvoorbeeld de plaats van elke student in een klassement. Welke maat is hier het meest gepast?",
   "o": [
    "Een rangcorrelatiecoëfficiënt, want de gegevens zitten op ordinaal niveau",
    "De Pearson-correlatie, want die is in alle omstandigheden de sterkste maat",
    "De Pearson-correlatie, op voorwaarde dat je de rangen eerst omzet naar z-scores",
    "Geen enkele correlatiemaat, samenhang meten kan pas vanaf intervalniveau"
   ],
   "a": 0,
   "u": "Pearson veronderstelt interval- of ratiodata, terwijl rangcorrelaties precies gemaakt zijn voor ordinaal niveau of hoger, dus hier is een rangcorrelatie de gepaste keuze. Rangen omzetten naar z-scores maakt de data niet plots intervalgeschikt, en samenhang meten kan wel degelijk bij ordinale gegevens."
  },
  {
   "h": "h9",
   "q": "Wat is het verschil tussen de noemer van Kendall's tau en die van gamma?",
   "o": [
    "Tau deelt enkel door concordant plus discordant, terwijl gamma door het totale aantal paren deelt, geknoopte paren inbegrepen",
    "Allebei delen ze door het totale aantal paren, maar gamma trekt daar de discordante paren nog van af",
    "Tau deelt door het aantal concordante paren en gamma door het aantal discordante paren",
    "Tau deelt door het totale aantal paren, geknoopte paren inbegrepen, gamma deelt enkel door concordant plus discordant"
   ],
   "a": 3,
   "u": "De teller is bij beide maten hetzelfde, namelijk concordante paren min discordante paren, het verschil zit volledig in de noemer: tau houdt alle paren in de noemer, ook de geknoopte, terwijl gamma die geknoopte paren eruit gooit. De noemer van gamma is daardoor gelijk of kleiner, nooit groter."
  },
  {
   "h": "h9",
   "q": "In een dataset zitten heel wat gelijke meetwaarden, dus veel ex aequo. Wat verwacht je van tau en gamma?",
   "o": [
    "Tau wordt groter dan gamma, want tau baseert zich op meer paren",
    "Gamma wordt groter dan tau, want gamma laat de geknoopte paren uit de noemer vallen",
    "Tau en gamma blijven exact gelijk, ties spelen bij geen van beide een rol",
    "Gamma wordt kleiner dan tau, want gamma verliest informatie door de ties weg te laten"
   ],
   "a": 1,
   "u": "Een kleinere noemer bij dezelfde teller geeft een grotere breuk, en omdat gamma de geknoopte paren schrapt komt gamma hoger uit dan tau zodra er ex aequo zijn. Tau corrigeert wel voor die ties, wat een voorzichtiger en realistischer, maar lager cijfer oplevert."
  },
  {
   "h": "h9",
   "q": "Wat betekent het dat een paar waarnemingen discordant is?",
   "o": [
    "De twee waarnemingen hebben op allebei de variabelen precies dezelfde score",
    "De twee waarnemingen gaan op beide variabelen samen omhoog, zodat de volgorde bij allebei dezelfde blijft",
    "Wie hoger scoort op de ene variabele, scoort lager op de andere, de volgorde wordt dus niet gerespecteerd",
    "Het paar is niet te ordenen en valt daarom sowieso buiten elke berekening"
   ],
   "a": 2,
   "u": "Discordant wil zeggen dat de volgorde tussen de twee scores niet gerespecteerd wordt, bijvoorbeeld beter op taal maar zwakker op wiskunde. Samen stijgen is concordant, en een paar met dezelfde rangorde is geknoopt, wat bij tau nog steeds in de noemer meetelt."
  },
  {
   "h": "h9",
   "q": "Je berekent voor twee ordinale variabelen een gamma van 0,33. Hoe lees je die waarde rechtstreeks af?",
   "o": [
    "Er is 33% kans dat het verband van richting verandert en 66% kans dat het in dezelfde richting blijft",
    "33% van de paren is geknoopt, de overige paren lopen allemaal in dezelfde richting als het verband",
    "33% van de verschillen in de ene variabele wordt verklaard door de andere",
    "Het verband is zwak, maar je kan er net als bij tau geen concrete kans aan koppelen"
   ],
   "a": 0,
   "u": "Gamma heeft als voordeel dat je hem rechtstreeks in kansen kan lezen: 0,33 betekent 33% kans dat het verband van richting verandert en 66% kans dat het dezelfde richting aanhoudt. Dat is precies wat tau niet toelaat, en het gaat niet over geknoopte paren of over verklaarde verschillen."
  },
  {
   "h": "h9",
   "q": "De ene onderzoeker rapporteert een rangcorrelatie van -0,60, de andere van +0,60. Wat besluit je?",
   "o": [
    "Het verband van de tweede is sterker, want positieve samenhang weegt zwaarder door",
    "Het verband van de eerste is sterker, want het minteken telt mee in de sterkte",
    "De twee waarden zijn niet vergelijkbaar zolang je niet weet op welk meetniveau beide variabelen gemeten zijn",
    "Even sterke samenhang, alleen de richting verschilt: het teken geeft de richting, de absolute waarde de sterkte"
   ],
   "a": 3,
   "u": "Bij sterkte kijk je naar de absolute waarde, en |-0,60| is gelijk aan |+0,60|, dus de samenhang is even sterk, alleen loopt ze bij de eerste de andere kant op. Het teken zegt alleen iets over de richting, niet over hoe sterk het verband is."
  }
 ],
 "hardVragen": [
  {
   "h": "h1",
   "q": "Je codeert kledingmaten S, M en L als 1, 2 en 3 en berekent verschillen tussen die codes. Welke interpretatie is verantwoord?",
   "o": [
    "De gelijke stappen tussen de codes tonen dat de verschillen tussen de kledingmaten even groot zijn.",
    "De codes bewaren de volgorde van de maten, maar bewijzen niet dat de verschillen even groot zijn.",
    "De numerieke codes geven de maten een vaste meeteenheid, maar laten hun volgorde verloren gaan.",
    "De numerieke codes maken verhoudingen mogelijk, zodat maat 3 driemaal zo groot is als maat 1."
   ],
   "a": 1,
   "u": "Kledingmaten zijn ordinaal: je kent de volgorde, maar niet de grootte van de afstanden. Cijfers als codes toevoegen levert geen vaste meeteenheid of absoluut nulpunt op."
  },
  {
   "h": "h2",
   "q": "Je vergelijkt de verdelingen van reactietijden in twee ongelijk grote groepen en zoekt ook hun medianen. Welke combinatie van grafieken en aflezing past daarbij?",
   "o": [
    "Histogrammen met absolute frequenties voor de vergelijking en het hoogste punt van elke curve voor de mediaan.",
    "Histogrammen met relatieve frequenties voor de vergelijking en de hoogste balk van elk histogram voor de mediaan.",
    "Histogrammen met relatieve frequenties voor de vergelijking en de cumulatieve curves bij 50 procent voor de medianen.",
    "Histogrammen met absolute frequenties voor de vergelijking en de cumulatieve curves bij 100 procent voor de medianen."
   ],
   "a": 2,
   "u": "Relatieve frequenties maken groepen van ongelijke grootte vergelijkbaar. De mediaan ligt waar de cumulatieve frequentie de helft bereikt, niet bij de hoogste balk of het eindpunt van de curve."
  },
  {
   "h": "h3",
   "q": "Bij Q1 = 12 en Q3 = 24 ligt een waarneming twee interkwartielafstanden boven Q3. Hoe classificeer je die waarneming en welk duo blijft robuust voor uitschieters?",
   "o": [
    "Een gewone, niet extreme uitschieter; kies de mediaan en de interkwartielafstand als robuust duo.",
    "Een extreme uitschieter; kies de mediaan en de interkwartielafstand als robuust duo.",
    "Een gewone, niet extreme uitschieter; kies het gemiddelde en de standaardafwijking als robuust duo.",
    "Een extreme uitschieter; kies het gemiddelde en de standaardafwijking als robuust duo."
   ],
   "a": 0,
   "u": "De IKA is 24 min 12 = 12, zodat de waarneming op 48 ligt, voorbij Q3 plus 1,5 keer de IKA maar niet voorbij Q3 plus 3 keer de IKA. De mediaan en de IKA zijn robuust, terwijl gemiddelde en standaardafwijking gevoelig zijn voor uitschieters."
  },
  {
   "h": "h4",
   "q": "Je gebruikt dezelfde steekproef eerst om de waargenomen spreiding te beschrijven en daarna om de populatiespreiding te schatten. Welke noemers voor de variantie en welke stap naar de standaardafwijking passen daarbij?",
   "o": [
    "Beschrijven: delen door n - 1; schatten: delen door n; de vierkantswortel herstelt de oorspronkelijke meeteenheid.",
    "Beschrijven: delen door n; schatten: delen door n; de vierkantswortel herstelt de oorspronkelijke meeteenheid.",
    "Beschrijven: delen door n; schatten: delen door n - 1; kwadrateren herstelt de oorspronkelijke meeteenheid.",
    "Beschrijven: delen door n; schatten: delen door n - 1; de vierkantswortel herstelt de oorspronkelijke meeteenheid."
   ],
   "a": 3,
   "u": "Voor het beschrijven van de aanwezige gegevens deel je door n, voor het schatten van de populatievariantie door de n - 1 vrijheidsgraden. De standaardafwijking is de vierkantswortel van de variantie en staat weer in de meeteenheid van de data."
  },
  {
   "h": "h5",
   "q": "Een score ligt twee standaarddeviaties boven het gemiddelde van een normaalverdeling. Welk aandeel ligt volgens de 68-95-99,7-regel ongeveer boven die score?",
   "o": [
    "Ongeveer 5 procent, want al het aandeel buiten twee standaarddeviaties ligt boven deze score.",
    "Ongeveer 2,5 procent, want het aandeel buiten twee standaarddeviaties is gelijk over beide staarten verdeeld.",
    "Ongeveer 47,5 procent, want de helft van het centrale aandeel ligt boven deze score.",
    "Ongeveer 95 procent, want het aandeel binnen twee standaarddeviaties ligt boven deze score."
   ],
   "a": 1,
   "u": "Ongeveer 95 procent ligt tussen twee standaarddeviaties onder en boven het gemiddelde, zodat samen ongeveer 5 procent in de staarten ligt. Door de symmetrie ligt de helft daarvan, ongeveer 2,5 procent, boven de score met z = 2."
  },
  {
   "h": "h6",
   "q": "Twee studies vinden respectievelijk r = -0,60 en r = 0,60. Welke vergelijking van de verklaarde variantie en de causale betekenis klopt?",
   "o": [
    "Beide verklaren 60 procent van de variantie; het verschil in richting bewijst geen oorzakelijk verband.",
    "De eerste verklaart -36 procent en de tweede 36 procent; alleen de positieve waarde ondersteunt causaliteit.",
    "Beide verklaren 36 procent van de variantie; de richting verschilt, maar geen van beide bewijst causaliteit.",
    "Beide verklaren 36 procent van de variantie; de gelijke sterkte bewijst bij beide een oorzakelijk verband."
   ],
   "a": 2,
   "u": "De determinatiecoëfficiënt is r in het kwadraat, dus beide waarden leveren 0,36 op. Het teken van r geeft de richting aan, terwijl correlatie ook bij gelijke sterkte geen bewijs van causaliteit vormt."
  },
  {
   "h": "h7",
   "q": "Bij r = 0,40 ligt x één standaarddeviatie boven zijn gemiddelde en de waargenomen y één standaarddeviatie boven het zijne. Wat voorspelt de regressie in z-scores en welk residu volgt daaruit?",
   "o": [
    "Voorspelde z-score van y: 0,40; residu: +0,60, dus de waarneming ligt boven de rechte.",
    "Voorspelde z-score van y: 0,16; residu: +0,84, dus de waarneming ligt boven de rechte.",
    "Voorspelde z-score van y: 0,40; residu: -0,60, dus de waarneming ligt onder de rechte.",
    "Voorspelde z-score van y: 1,00; residu: 0,00, dus de waarneming ligt op de rechte."
   ],
   "a": 0,
   "u": "De voorspelde z-score is r maal de z-score van x, dus 0,40 maal 1 = 0,40. Het residu is waargenomen min voorspeld, hier 1 min 0,40 = +0,60, zodat het punt boven de rechte ligt."
  },
  {
   "h": "h7",
   "q": "Een regressiemodel voor deelnemers van 18 tot 25 jaar heeft residuen zonder herkenbaar patroon rond nul. Wat betekent dat voor een voorspelling voor een zestigjarige?",
   "o": [
    "Het residuendiagram ondersteunt de lineaire fit, waardoor de voorspelling buiten het bereik even betrouwbaar wordt.",
    "Het residuendiagram bewijst een oorzakelijk verband, waardoor de leeftijd buiten het bereik geen bezwaar vormt.",
    "Het residuendiagram ondersteunt de lineaire fit, waardoor de voorspelling voor de zestigjarige interpolatie heet.",
    "Het residuendiagram ondersteunt de lineaire fit, maar de voorspelling blijft extrapolatie met grotere onzekerheid."
   ],
   "a": 3,
   "u": "Residuen zonder patroon passen bij een geschikte lineaire vorm voor de geobserveerde gegevens. Een zestigjarige valt buiten het bereik van 18 tot 25 jaar, zodat de voorspelling extrapolatie blijft en onzekerder is."
  },
  {
   "h": "h8",
   "q": "Je vergelijkt in een contingentietabel groepen van ongelijke grootte die elk in een rij staan. Het verband keert om wanneer subgroepen worden samengenomen; welke aanpak en interpretatie passen daarbij?",
   "o": [
    "Vergelijk percentages binnen de rijen; het omkeren bij samenvoegen past bij de paradox van Simpson.",
    "Vergelijk percentages van het algemene totaal; het omkeren bij samenvoegen past bij de paradox van Simpson.",
    "Vergelijk percentages binnen de rijen; het omkeren bij samenvoegen bewijst dat een derde variabele medieert.",
    "Vergelijk de absolute celaantallen; het omkeren bij samenvoegen bewijst dat een derde variabele medieert."
   ],
   "a": 0,
   "u": "Voorwaardelijke verdelingen binnen de rijen maken groepen van ongelijke grootte vergelijkbaar. Een omkering van het verband door samenvoegen past bij de paradox van Simpson en bewijst op zichzelf geen tussenstap in een causale keten."
  },
  {
   "h": "h9",
   "q": "Je onderzoekt een stijgend maar krom verband met Spearman. Twee gelijke meetwaarden nemen de plaatsen 2 en 3 in; welke rangtoekenning en controle van de rangverschillen Di passen daarbij?",
   "o": [
    "Geef beide waarden rang 2 en de volgende rang 3; controleer dat de som van de rangverschillen Di nul is.",
    "Geef de waarden rang 2 en 3 op volgorde van invoer; controleer dat de som van de rangverschillen Di nul is.",
    "Geef beide waarden rang 2,5 en de volgende rang 4; controleer dat de som van de rangverschillen Di nul is.",
    "Geef beide waarden rang 2,5 en de volgende rang 4; controleer dat de som van de gekwadrateerde Di nul is."
   ],
   "a": 2,
   "u": "Spearman past bij het monotone verband en gelijke meetwaarden krijgen hun gemiddelde rang, hier 2,5, waarna de volgende waarneming rang 4 krijgt. De gewone rangverschillen Di moeten samen nul geven; na kwadrateren heffen positieve en negatieve verschillen elkaar niet meer op."
  }
 ],
 "hacks": [
  {
   "h": "algemeen",
   "kop": "NOIR: de trap van meetniveaus",
   "t": "Onthoud de volgorde nominaal, ordinaal, interval, ratio als het woord NOIR. Elke trede krijgt er een eigenschap bij: N staat voor Naam (enkel gelijk of verschillend), O voegt Orde toe (meer of minder), I voegt Identieke intervallen toe (even grote afstanden) en R voegt de echte nul toe (verhoudingen mogen). Zo zie je meteen welke bewerkingen mogen: hoger op de trap mag alles wat lager mag, maar niet omgekeerd. Zak je vrijwillig een trede, dan mag dat wel, maar je verliest informatie."
  },
  {
   "h": "algemeen",
   "kop": "Meten plakt, tellen laat ruimte",
   "t": "Vraag je bij elke grafiek eerst af: heb ik gemeten of geteld? Meten levert continue data op (lengte, gewicht, tijd), en dan plakken de balken tegen elkaar, dat is een histogram. Tellen of indelen levert discrete of categorische data op (aantal juiste antwoorden, haarkleur), en dan laat je ruimte tussen de balken, dat is een staaf- of kolomdiagram. Kort samengevat: meten plakt, tellen laat ruimte."
  },
  {
   "h": "algemeen",
   "kop": "Anderhalf is gewoon, drie is extreem",
   "t": "Denk aan twee hekjes rond de doos van de boxplot: op 1.5 keer de IKA voorbij Q1 en Q3 staat het hekje voor gewone buitenbeentjes, op 3 keer de IKA staat het hekje voor de extreme. Wie over het eerste hekje springt is opvallend, wie over het tweede springt is verdacht. Voor de centrummaten helpt het beeld van de rots en de zwemmer: de mediaan is de rots die blijft liggen, het gemiddelde is de zwemmer die altijd naar de staart drijft."
  },
  {
   "h": "algemeen",
   "kop": "Scheef? Pak de M van mediaan",
   "t": "Karakteristieke maten komen in vaste duo's: gemiddelde hoort bij de standaardafwijking, mediaan hoort bij de interkwartielafstand. Is de verdeling scheef of zitten er uitschieters in, kies dan het mediaan-duo, want geen van beide leden laat zich meeslepen door extreme waarden. Bij een min of meer symmetrische verdeling zonder uitschieters neem je het gemiddelde-duo. En onthou de volgorde van de wortel: eerst variantie, daarna standaardafwijking als vierkantswortel daarvan."
  },
  {
   "h": "algemeen",
   "kop": "Z is een liniaal, geen punt",
   "t": "Denk bij een z-score altijd aan een liniaal met de standaarddeviatie als eenheid: z = 2 betekent twee stappen boven het gemiddelde, niet twee punten. Voor de weg heen trek je eerst af en deel je daarna (min mu, gedeeld door sigma), voor de weg terug doe je alles omgekeerd en in omgekeerde volgorde (maal sigma, plus mu). En de trap 1, 2, 3 hoort bij 68, 95, 99.7, dus hoe verder je op de liniaal stapt, hoe meer je binnen hebt."
  },
  {
   "h": "algemeen",
   "kop": "Tel je continue variabelen: L, T, R",
   "t": "Kijk eerst hoeveel van je twee variabelen continu zijn. Nul continue variabelen (dus twee dichotome) geeft Lambda, een continue met een dichotome geeft de T-test, en twee continue variabelen geven de correlatie R. De letters L, T, R staan netjes op volgorde: hoe meer continue variabelen, hoe verder je in het alfabet opschuift."
  },
  {
   "h": "algemeen",
   "kop": "Residu = Realiteit min Raming",
   "t": "Onthoud een residu als Realiteit min Raming: de echte waarneming min wat de rechte voorspelde. Ligt de realiteit hoger dan de raming, dan is het residu positief en zit het bolletje boven de rechte, ligt ze lager, dan is het residu negatief en zit het punt eronder. De kleinste-kwadratenrechte is dan gewoon de rechte die al die missers samen, in het kwadraat, zo klein mogelijk houdt."
  },
  {
   "h": "algemeen",
   "kop": "Percenteer in de richting van je vraag",
   "t": "Bij een contingentietabel bepaalt de richting van je percentages het antwoord: wil je weten hoe het zit binnen de mannen, dan deel je door het rijtotaal van de mannen en niet door het algemene totaal. Percenteer je in de verkeerde richting, of laat je een derde variabele weg, dan kan het verband zelfs omkeren zodra je opsplitst, en dat is precies de paradox van Simpson. Onthoud de drie rollen van zo'n derde variabele als de drie M's: Meebepalend (verstrengeling), Modererend (het verband verschilt per subgroep) en Mediërend (de tussenstap in de keten)."
  },
  {
   "h": "algemeen",
   "kop": "Recht, of gewoon omhoog?",
   "t": "Pearson vraagt: hoe recht is de lijn? Spearman vraagt: gaan ze samen omhoog of omlaag? Voor de noemer van de paren-maten: Tau neemt het Totaal aantal paren, ties inbegrepen, terwijl Gamma Gewoon concordant plus discordant overhoudt. Een kleinere noemer geeft een grotere breuk, dus bij ex aequo is gamma altijd de hoogste van de twee, en zonder ex aequo vallen ze samen."
  }
 ],
 "theorie": [
  {
   "h": "h1",
   "kop": "Kernpunten",
   "items": [
    "Indicator: een variabel begrip, dus een geoperationaliseerd kenmerk van een individu, waaraan meerdere variabelen gekoppeld kunnen zijn.",
    "Rechtstreeks meetbare variabele: een kenmerk dat je direct kunt observeren zonder operationele definitie, zoals reactietijd of de frequentie van een gedrag.",
    "Niet rechtstreeks meetbare variabele: een abstract kenmerk dat pas meetbaar wordt via een operationele definitie, zoals intelligentie of persoonlijkheid.",
    "Categorische variabele: een variabele die indeelt in niet-numerieke, afzonderlijke categorieen, bijvoorbeeld geslacht of opleidingsniveau.",
    "Numerieke variabele: een variabele die indeelt in numerieke categorieen, bijvoorbeeld leeftijd of inkomen.",
    "Case: het individu, de groep of het object dat beschreven wordt door de meetwaarden van de variabelen.",
    "Dichotomiseren: numerieke scores toekennen aan een categorische variabele, bijvoorbeeld man = 0 en vrouw = 1.",
    "Continue versus discrete variabele: continue variabelen kunnen elke waarde binnen een interval aannemen, discrete variabelen enkel gehele getallen.",
    "Identiteit: de eigenschap van meten waarbij je enkel bepaalt of cases gelijk of ongelijk zijn en ze in klassen indeelt.",
    "Equivalentierelatie: een relatie die reflexief, symmetrisch en transitief is en een verzameling opdeelt in equivalentieklassen.",
    "Partitie: een verdeling van een verzameling in niet-overlappende klassen waarbij elk object tot precies een groep behoort.",
    "Totaalheid: de eigenschap die een totale orde onderscheidt van een partiele orde, want ze zorgt dat elk paar elementen vergelijkbaar is.",
    "Vaste meeteenheid: een standaardmaat waardoor eenzelfde verschil in meetwaarden over de hele schaal dezelfde betekenis heeft.",
    "Absoluut nulpunt: het punt waarop de gemeten eigenschap volledig afwezig is, wat het verschil maakt tussen een interval- en een ratioschaal."
   ]
  },
  {
   "h": "h2",
   "kop": "Kernpunten",
   "items": [
    "Verdeling van een variabele: het overzicht van welke waarden een variabele aanneemt en hoe vaak elke waarde voorkomt.",
    "Frequentietabel: tabel die per meetwaarde of per klasse weergeeft hoeveel waarnemingen erin vallen.",
    "Absolute frequentie (Fi): het aantal waarnemingen met dezelfde waarde xi.",
    "Relatieve frequentie (fi): de absolute frequentie gedeeld door het totaal aantal waarnemingen N.",
    "Cumulatieve frequentie (Cj): de optelling van alle frequenties tot en met een bepaalde waarde of klasse.",
    "Histogram: grafiek van de verdeling van een continue variabele, waarbij de balken zonder ruimte tegen elkaar aansluiten.",
    "Staafdiagram: grafiek die categorieën met elkaar vergelijkt en waarbij er ruimte tussen de balken staat.",
    "Taartdiagram: cirkelgrafiek voor de verdeling van proporties bij categorische variabelen, in de praktijk vaak moeilijk leesbaar.",
    "Stam-en-loofdiagram: weergave voor kleine datasets waarbij de exacte meetwaarden zichtbaar blijven.",
    "Frequentieveelhoek: lijnvormige weergave van een frequentieverdeling die het idee van groei en continue frequentie oproept.",
    "Cumulatieve frequentiecurve: curve van opgetelde frequenties waaruit je onder meer de mediaan kunt aflezen.",
    "Exhaustief en disjunct: elke meetwaarde valt in een klasse en geen enkele klasse overlapt met een andere.",
    "Exacte klassengrenzen: de grenzen die aangeven welk interval van continue waarden door eenzelfde meetwaarde op de discrete schaal wordt voorgesteld.",
    "Klassenmidden (xi): het gemiddelde van de onderste en de bovenste klassengrens, dus (X+Y)/2."
   ]
  },
  {
   "h": "h3",
   "kop": "Kernpunten",
   "items": [
    "Tijdcurve: grafiek die het gedrag van een variabele over de tijd toont, met de tijd op de horizontale as en de gemeten variabele op de verticale as.",
    "Seizoenschommeling: terugkerend patroon in een tijdcurve dat samenvalt met gekende, zich herhalende perioden.",
    "Rekenkundig gemiddelde: de som van alle waargenomen waarden gedeeld door het aantal waarnemingen.",
    "Gevoeligheid van het gemiddelde: omdat het gemiddelde alle waarden meetelt, wordt het door extreme waarnemingen altijd naar de staart getrokken.",
    "Mediaan: de middelste waarneming, waarbij de helft van de waarnemingen kleiner is en de andere helft groter.",
    "Eerste kwartiel Q1: de mediaan van de waarnemingen die kleiner zijn dan de mediaan.",
    "Tweede kwartiel Q2: de mediaan zelf.",
    "Derde kwartiel Q3: de mediaan van de waarnemingen die groter zijn dan de mediaan.",
    "Interkwartielafstand IKA: het verschil Q3 min Q1, dus de breedte van de middelste helft van de waarnemingen.",
    "Gewone uitschieter: een waarneming kleiner dan Q1 min 1.5 keer de IKA of groter dan Q3 plus 1.5 keer de IKA, ook buitenbeentje genoemd.",
    "Extreme uitschieter: een waarneming kleiner dan Q1 min 3 keer de IKA of groter dan Q3 plus 3 keer de IKA.",
    "Robuuste maat: een karakteristieke waarde zoals de mediaan, de kwantielen of de IKA die niet gevoelig is voor buitenbeentjes, in tegenstelling tot gemiddelde, standaarddeviatie, variatiebreedte, minimum en maximum.",
    "Boxplot: figuur die de verdeling samenvat op basis van de kwartielen en waarin buitenbeentjes zichtbaar worden.",
    "Kwantiel: de waarde van een variabele waarbij de relatieve cumulatieve frequentie het bijhorende niveau bereikt, met kwartielen in vierden, decielen in tienden en percentielen in procenten, zodat mediaan = Q2 = D5 = P50."
   ]
  },
  {
   "h": "h4",
   "kop": "Kernpunten",
   "items": [
    "Deviatiescore: het verschil tussen een waarneming en het gemiddelde, dus hoe ver die waarneming van het gemiddelde af ligt.",
    "Gekwadrateerde deviatie: het kwadraat van die afstand, wat de richting (plus of min) wegneemt en grote afstanden extra zwaar laat wegen.",
    "Variantie: de gemiddelde gekwadrateerde afstand van de waarnemingen tot het rekenkundig gemiddelde.",
    "Standaardafwijking: de vierkantswortel uit de variantie, dus de 'gemiddelde afstand' tot het gemiddelde in dezelfde meeteenheid als de data.",
    "Delen door n: je beschrijft gewoon de gegevens die je voor je hebt, van een populatie of van de steekproef zelf.",
    "Delen door n - 1: je schat op basis van steekproefdata de spreiding in de populatie, wat een strengere en iets grotere waarde oplevert.",
    "Vrijheidsgraden: het aantal gegevens dat nog vrij kan variëren wanneer het gemiddelde vastligt, bij een steekproef dus n - 1.",
    "Eigenschappen van s: s is nul als alle waarnemingen gelijk zijn, anders groter dan nul, s is gevoelig voor uitschieters en vereist meetniveau interval of ratio.",
    "Lineaire transformatie: een omrekening naar een andere meeteenheid die de vorm van de verdeling ongemoeid laat, maar centrum en spreiding wel wijzigt.",
    "Modus: de waarde met de hoogste frequentie, dus de meetwaarde die het vaakst voorkomt (bimodaal bij twee toppen, multimodaal bij meer).",
    "Meetkundig gemiddelde: de n-de machtswortel uit het product van alle n getallen, vooral gebruikt in financiële wiskunde.",
    "Variatiebreedte: het verschil tussen de hoogste en de laagste meetwaarde.",
    "Variatiecoëfficiënt: de verhouding tussen de standaardafwijking en het gemiddelde, dus hoe groot de spreiding relatief is ten opzichte van de schaal.",
    "Dichtheidskromme: een gladde curve boven de X-as die de verdeling beschrijft en waaronder de totale oppervlakte gelijk is aan 1."
   ]
  },
  {
   "h": "h5",
   "kop": "Kernpunten",
   "items": [
    "Normaalverdeling: een symmetrische, unimodale en klokvormige dichtheidskromme die volledig vastligt door haar gemiddelde en standaarddeviatie, genoteerd als N(mu ; sigma).",
    "Standaardnormaalverdeling: de normaalverdeling met gemiddelde 0 en standaarddeviatie 1, genoteerd als N(0,1), waarvoor de tabellen zijn opgesteld.",
    "68-95-99.7 regel: vuistregel die zegt dat ongeveer 68, 95 en 99,7 procent van de observaties binnen respectievelijk 1, 2 en 3 standaarddeviaties rond het gemiddelde vallen.",
    "Standaardiseren: elke ruwe waarde omzetten met z = (x - mu) / sigma, zodat je afleest hoeveel standaarddeviaties die waarde van het gemiddelde af ligt.",
    "Z-score: de gestandaardiseerde waarde zelf, positief boven het gemiddelde en negatief eronder.",
    "Ontstandaardiseren: de omgekeerde bewerking x = mu + z maal sigma, waarmee je van een z-score terugkeert naar de ruwe meetwaarde.",
    "Complementregel: het gegeven dat de totale oppervlakte 1 is, waardoor een van beide standaardnormaaltabellen volstaat om de ontbrekende oppervlakte af te leiden.",
    "Percentielrang: het percentage observaties onder een score, dat de onderlinge afstanden tussen ruwe meetwaarden niet respecteert.",
    "Continuïteitscorrectie: het volledige klasse-interval rond een afgeronde waarde meerekenen wanneer je een discrete verdeling benadert met een continue verdeling.",
    "Kurtosis: de vormmaat voor gepiektheid of afplatting, waarbij de normaalverdeling als middenreferentie geldt (mesokurtisch).",
    "Scheefheid: de vormmaat voor symmetrie, waarbij linksscheef betekent dat de staart naar links loopt en rechtsscheef dat ze naar rechts loopt.",
    "Empirische coëfficiënt van Pearson: maat die uitdrukt hoeveel standaarddeviaties het verschil tussen gemiddelde en mediaan groot is, negatief bij linksscheef, nul bij symmetrie en positief bij rechtsscheef.",
    "Centrale momenten: veralgemening van de afwijkingen tot het gemiddelde, met m1 gelijk aan nul, m2 gelijk aan de variantie en m3 als maat voor asymmetrie.",
    "Even en oneven momenten: momenten met een even macht werken als spreidingsmaten, momenten met een oneven macht als maten voor asymmetrie, en hogere machten versterken telkens het gewicht van extreme waarden."
   ]
  },
  {
   "h": "h6",
   "kop": "Kernpunten",
   "items": [
    "Verklaarde variabele: de afhankelijke variabele die de uitkomst van een studie meet.",
    "Verklarende variabele: de onafhankelijke variabele die veranderingen in de verklaarde variabele verklaart of veroorzaakt.",
    "Samenhang: kennis van de waarde van de ene variabele laat toe om de waarde van de andere beter te voorspellen.",
    "Analytisch verband: de meetwaarde van de ene variabele laat een perfecte voorspelling van de andere toe.",
    "Stochastisch verband: de meetwaarde van de ene variabele laat enkel een min of meer correcte schatting van de andere toe.",
    "Monotoon verband: verband waarbij de richting nooit omkeert, dus altijd stijgend of altijd dalend.",
    "Niet-monotoon verband: verband waarbij de richting regelmatig verandert terwijl x toeneemt.",
    "Uitschieter: datapunt dat duidelijk afwijkt van de algemene trend in de scatterplot.",
    "Lambda: associatiemaat voor twee dichotome variabelen, gebaseerd op het deel van de oorspronkelijke fouten dat wegvalt als je de tweede variabele kent.",
    "Determinatiecoëfficiënt r kwadraat: het kwadraat van de Pearson correlatie, oftewel het deel van de variantie in de afhankelijke variabele dat de onafhankelijke variabele verklaart.",
    "Verklarende kracht: r kwadraat gelijk aan 0 betekent geen verklarende kracht, r kwadraat gelijk aan 1 betekent perfecte verklarende kracht.",
    "Correlatiecoëfficiënt r: numerieke maat voor de sterkte en de richting van de lineaire relatie tussen twee variabelen, met bereik van -1 tot 1.",
    "Correlatie en causaliteit: een correlatie toont enkel dat er een verband is, ze bewijst geen oorzakelijk verband en is gevoelig voor uitschieters.",
    "Covariantie: het verband Sxy is gelijk aan Rxy maal Sx maal Sy, dus de correlatie maal de twee standaardafwijkingen."
   ]
  },
  {
   "h": "h7",
   "kop": "Kernpunten",
   "items": [
    "Lineair regressiemodel: model waarin de regressielijnen vervangen worden door de best passende rechten, zodat je y kunt voorspellen uit x.",
    "Kleinste kwadraten: methode die de best passende rechte zoekt door de som van de gekwadrateerde verticale afstanden van de punten tot die rechte zo klein mogelijk te maken.",
    "Regressievergelijking: y-dak = b0 + b1x, waarbij y-dak de voorspelde waarde van de afhankelijke variabele is.",
    "Intercept b0: de plek waar de rechte de y-as snijdt, dus de voorspelde y wanneer x nul is.",
    "Helling b1: de verandering in y die hoort bij een toename van x met een eenheid, en die de richting en de sterkte van het verband aangeeft.",
    "Eigenschap van de rechte: de regressierechte gaat altijd door het punt van het gemiddelde van x en het gemiddelde van y.",
    "Regressie in z-scores: een toename van 1 standaarddeviatie in x hoort bij een toename van r standaarddeviaties in y, ook wanneer de rechte niet in z-waarden staat.",
    "Dummy variabele: hercodering van een categorische variabele naar 1 en 0, zodat correlatie en determinatiecoëfficiënt op de gewone manier berekend kunnen worden.",
    "T-toets bij correlatie: toets die nagaat of r significant van nul verschilt (significant bij een p-waarde kleiner dan 0,05), met als kritiek dat een heel grote N bijna altijd significantie geeft.",
    "Residu: het verschil tussen de waargenomen waarde en de voorspelde waarde, dus de verticale afstand van het bolletje tot de rechte.",
    "Residuendiagram: spreidingsdiagram van de residuen tegenover de verklarende variabele, waarmee je de fit van de rechte beoordeelt, want patronen wijzen op afwijking van lineariteit.",
    "Uitschieters: punten die ver van de rest liggen, waarbij afwijkers in de y-richting grote residuen hebben en afwijkers in de x-richting de rechte sterk kunnen verschuiven.",
    "Extrapolatie en interpolatie: schatten buiten het bereik van de data, wat onzeker is, tegenover schatten binnen het bereik, wat doorgaans betrouwbaarder is.",
    "Verborgen variabele: een derde variabele die het verband mee bepaalt terwijl ze niet in de analyse zit, waardoor correlatie geen bewijs van causaliteit is."
   ]
  },
  {
   "h": "h8",
   "kop": "Kernpunten",
   "items": [
    "Contingentietabel: tabel met frequenties in de cellen die de relatie tussen twee categorische variabelen laat zien.",
    "Marginale frequenties: de rij- en kolomtotalen die buiten de eigenlijke tabel staan.",
    "Relatieve frequenties: frequenties omgezet naar verhoudingen of percentages, zodat groepen van ongelijke grootte toch vergelijkbaar worden.",
    "Marginale verdeling: de verdeling van 1 variabele apart, zonder informatie over het verband met de andere.",
    "Voorwaardelijke verdeling: de verdeling van de ene variabele in percentages, berekend binnen de cases met een specifieke waarde op de andere variabele.",
    "Strookdiagram: grafiek waarin je voorwaardelijke verdelingen zij aan zij of gesegmenteerd met elkaar vergelijkt.",
    "Confounding: een derde variabele verstoort het waargenomen verband omdat ze met beide variabelen correleert.",
    "Moderatie: het verband tussen twee variabelen verschilt binnen de subgroepen die door een derde variabele gevormd worden.",
    "Mediatie: de derde variabele is de tussenstap die het verband tussen de twee andere variabelen verklaart.",
    "Paradox van Simpson: de richting van het verband keert om of het verband verdwijnt wanneer subgroepen tot 1 groep worden samengenomen.",
    "Gemeenschappelijke afhankelijkheid: x en y hangen samen omdat ze allebei van eenzelfde variabele z afhangen, zonder onderling causaal verband.",
    "Criteria voor causaliteit zonder experiment: het verband is sterk, consistent en repliceerbaar, hogere dosissen geven sterkere responsen, en de vermoedelijke oorzaak is plausibel en gaat het effect vooraf.",
    "Lambda: associatiemaat voor nominale variabelen die aangeeft hoeveel beter je de ene variabele voorspelt met kennis van de andere.",
    "Chi-kwadraat: maat die de waargenomen frequenties vergelijkt met de verwachte frequenties bij statistische onafhankelijkheid, waarbij een verwachte celfrequentie gelijk is aan het product van de marginalen gedeeld door N."
   ]
  },
  {
   "h": "h9",
   "kop": "Kernpunten",
   "items": [
    "Concordant paar: paar waarbij de volgorde tussen de twee scores gerespecteerd wordt, wie hoger scoort op de ene variabele scoort ook hoger op de andere.",
    "Discordant paar: paar waarbij de volgorde niet gerespecteerd wordt, hoger op de ene variabele gaat samen met lager op de andere.",
    "Geknoopt paar (ex aequo): paar waarnemingen dat je niet ten opzichte van elkaar kan ordenen omdat ze dezelfde rangorde hebben.",
    "Aantal paren: bij N waarnemingen vergelijk je N(N-1)/2 koppels, want elke waarneming wordt met elke andere gekoppeld.",
    "Kendall's tau: concordante paren min discordante paren, gedeeld door het totale aantal paren, geknoopte paren inbegrepen.",
    "Gamma: concordante paren min discordante paren, gedeeld door de som van concordante en discordante paren, de geknoopte paren vliegen eruit.",
    "Tau versus gamma: zonder ex aequo geven ze dezelfde waarde, met ex aequo is gamma altijd groter omdat tau wel en gamma niet corrigeert voor ties.",
    "Directe interpretatie van gamma: een gamma van 0,33 betekent 33% kans dat het verband van richting verandert en 66% kans dat het in dezelfde richting blijft.",
    "Spearman (rs): de Pearson-correlatie berekend op rangen, dus je zet de ruwe meetwaarden eerst om naar ordinale data.",
    "Di: het verschil tussen de rangnummers binnen paar i, waarvan de som over alle paren gelijk moet zijn aan 0.",
    "Rangen bij gelijke meetwaarden: gelijke waarden krijgen de gemiddelde rang, bijvoorbeeld allebei 2,5, en de volgende waarneming schuift door naar 4.",
    "Lineair verband: de relatie volgt een rechte lijn, elke toename in X gaat samen met een even grote verandering in Y.",
    "Monotoon verband: de relatie gaat altijd dezelfde richting uit, alleen stijgend of alleen dalend, maar niet per se met gelijke stappen.",
    "Richting en sterkte: alle rangcorrelaties liggen tussen -1 en +1, het teken geeft de richting en de absolute waarde geeft de sterkte."
   ]
  }
 ]
};
