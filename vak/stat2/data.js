// Vak "Statistiek II: kansrekening en inductieve statistiek" (1ba), automatisch omgezet vanaf de oude site op 2026-09-14.
// Formaat: zie README, kop "Vakpagina". Aanpassen kan hier; de pagina (index.html) hoeft niet te veranderen.
window.BES_VAK = {
 "id": "stat2",
 "jaar": "1ba",
 "naam": "Statistiek II: kansrekening en inductieve statistiek",
 "hoofdstukken": [
  {
   "id": "h1",
   "naam": "Verzamelingen en combinatieleer"
  },
  {
   "id": "h2",
   "naam": "Toeval en kansmodellen"
  },
  {
   "id": "h3",
   "naam": "Rekenregels en voorwaardelijke kans"
  },
  {
   "id": "h4",
   "naam": "Stochastische variabelen"
  },
  {
   "id": "h5",
   "naam": "Verwachting en variantie"
  },
  {
   "id": "h6",
   "naam": "Binomiale verdeling en proporties"
  },
  {
   "id": "h7",
   "naam": "Steekproevenverdeling en CLS"
  },
  {
   "id": "h8",
   "naam": "Betrouwbaarheidsintervallen"
  },
  {
   "id": "h9",
   "naam": "Significantietoetsen"
  },
  {
   "id": "h10",
   "naam": "Werken met SPSS"
  }
 ],
 "vragen": [
  {
   "h": "h1",
   "q": "Welke uitspraak over deelverzamelingen is juist?",
   "o": [
    "De lege verzameling is een deelverzameling van elke verzameling",
    "De lege verzameling heeft geen enkele deelverzameling",
    "Alleen verzamelingen met evenveel elementen kunnen deelverzamelingen zijn",
    "Een verzameling is nooit een deelverzameling van zichzelf"
   ],
   "a": 0,
   "u": "Twee afspraken horen bij de definitie: elke verzameling is een deelverzameling van zichzelf, en de lege verzameling is een deelverzameling van elke verzameling."
  },
  {
   "h": "h1",
   "q": "In een Venn-diagram is het gebied 'A of B' gearceerd. Welke bewerking is dat?",
   "o": [
    "De doorsnede van A en B",
    "De unie van A en B",
    "Het verschil A minus B",
    "Het complement van A"
   ],
   "a": 1,
   "u": "'A of B' is de unie: alles wat in A zit, in B zit, of in allebei. 'A en B' is de doorsnede, dus enkel het gemeenschappelijke deel."
  },
  {
   "h": "h1",
   "q": "Wanneer vormen de deelverzamelingen A1 tot An een partitie van A?",
   "o": [
    "Als hun doorsnede gelijk is aan A",
    "Als elke deelverzameling minstens twee elementen heeft",
    "Als hun unie A oplevert en ze twee aan twee uitsluitend zijn",
    "Als ze allemaal evenveel elementen tellen"
   ],
   "a": 2,
   "u": "Een partitie moet aan twee voorwaarden voldoen: samen dekken de delen heel A, en ze overlappen nergens (twee aan twee een lege doorsnede)."
  },
  {
   "h": "h1",
   "q": "Omega is de uitkomstenruimte en A een gebeurtenis daarin. Wat stelt het complement van A voor?",
   "o": [
    "Het grootste deel van A",
    "De unie van A met Omega",
    "Alles wat zowel in A als in Omega zit",
    "Alles in Omega dat niet in A zit"
   ],
   "a": 3,
   "u": "Het complement van A, genoteerd als niet-A, bevat precies de uitkomsten van Omega die buiten A vallen."
  },
  {
   "h": "h1",
   "q": "Een cijferslot heeft vier posities en op elke positie kan een cijfer van 0 tot 9 staan. Hoeveel codes zijn mogelijk?",
   "o": [
    "10000",
    "3628800",
    "40",
    "5040"
   ],
   "a": 0,
   "u": "Herhaling is toegelaten, dus elke positie heeft 10 keuzes: 10 x 10 x 10 x 10 = 10^4 = 10000."
  },
  {
   "h": "h1",
   "q": "Hoeveel volgorden kan je maken met de tien cijfers 0 tot 9, waarbij elk cijfer precies een keer voorkomt?",
   "o": [
    "9! = 362880",
    "10! = 3628800",
    "10^10 = 10 miljard",
    "C(10,10) = 1"
   ],
   "a": 1,
   "u": "Dit is een permutatie van de hele verzameling: 10 x 9 x 8 x ... x 1 = 10! = 3628800."
  },
  {
   "h": "h1",
   "q": "Hoeveel geordende groepjes van drie verschillende cijfers kan je vormen uit de cijfers 0 tot 9?",
   "o": [
    "30",
    "120",
    "720",
    "1000"
   ],
   "a": 2,
   "u": "Dit is een variatie: de volgorde is belangrijk en herhaling mag niet. 10 x 9 x 8 = 720."
  },
  {
   "h": "h1",
   "q": "Uit tien cijfers kies je een groepje van drie, waarbij de volgorde niet uitmaakt. Hoeveel groepjes zijn er?",
   "o": [
    "30",
    "1000",
    "720",
    "120"
   ],
   "a": 3,
   "u": "Dit is een combinatie: C(10,3) = (10 x 9 x 8) / (3 x 2 x 1) = 720 / 6 = 120."
  },
  {
   "h": "h1",
   "q": "Wat is het verschil tussen een variatie en een combinatie?",
   "o": [
    "Bij een variatie telt de volgorde mee, bij een combinatie niet",
    "Bij een combinatie telt de volgorde mee, bij een variatie niet",
    "Een variatie laat herhaling toe, een combinatie nooit",
    "Een combinatie gebruikt de hele verzameling, een variatie maar een deel"
   ],
   "a": 0,
   "u": "Beide kiezen r elementen uit n. Alleen bij variaties zijn dezelfde elementen in een andere volgorde twee verschillende uitkomsten."
  },
  {
   "h": "h1",
   "q": "Op hoeveel manieren kan je vijf objecten kiezen uit acht, zonder op de volgorde te letten?",
   "o": [
    "336",
    "56",
    "40320",
    "6720"
   ],
   "a": 1,
   "u": "C(8,5) = 8! / (5! x 3!) = (8 x 7 x 6) / (3 x 2 x 1) = 56."
  },
  {
   "h": "h1",
   "q": "Je kiest twee kleuren uit vier en de volgorde is belangrijk. Hoeveel mogelijkheden zijn er?",
   "o": [
    "6",
    "8",
    "12",
    "24"
   ],
   "a": 2,
   "u": "Variatie van 2 uit 4: 4 x 3 = 12. Zonder volgorde zouden het er 6 zijn."
  },
  {
   "h": "h1",
   "q": "Hoeveel deelverzamelingen heeft A = {rood, groen, blauw} in totaal, de lege verzameling en A zelf meegerekend?",
   "o": [
    "9",
    "3",
    "6",
    "8"
   ],
   "a": 3,
   "u": "Per element kies je of het meedoet of niet: 2^3 = 8. Uitgeschreven: 1 lege, 3 met een kleur, 3 met twee kleuren en 1 met alle drie."
  },
  {
   "h": "h1",
   "q": "Waarom is het aantal permutaties een speciaal geval van het aantal variaties?",
   "o": [
    "Omdat een permutatie een variatie is waarbij r gelijk is aan n",
    "Omdat een permutatie de volgorde negeert",
    "Omdat een permutatie altijd op de lege verzameling slaat",
    "Omdat een permutatie herhaling toelaat"
   ],
   "a": 0,
   "u": "Een variatie ordent r gekozen elementen uit n. Neem je alle n elementen, dus r = n, dan krijg je alle volgorden van de hele verzameling: n!."
  },
  {
   "h": "h1",
   "q": "Een onderzoekster kiest 7 testen uit 10 (volgorde maakt niet uit). De promotor koos al 4 vaste testen die er sowieso bij moeten. Hoeveel testbatterijen kan ze samenstellen?",
   "o": [
    "P(3) = 6",
    "C(4,4)+C(6,3) = 21",
    "C(6,3) = 20",
    "V(3 uit 6) = 120"
   ],
   "a": 2,
   "u": "4 testen liggen vast, dus ze kiest nog 3 uit de overige 6, en de volgorde maakt niet uit → combinatie C(6,3) = 20."
  },
  {
   "h": "h1",
   "q": "Je stelt een team van 5 samen uit 16 sporters (10 gemiddelde, 6 topsporters). Het team moet exact 2 óf exact 3 topsporters bevatten. Hoeveel teams kun je maken?",
   "o": [
    "2700",
    "200",
    "32400",
    "270"
   ],
   "a": 0,
   "u": "Exact 2 top: C(6,2)·C(10,3) = 15·120 = 1800. Exact 3 top: C(6,3)·C(10,2) = 20·45 = 900. Samen = 1800 + 900 = 2700. (De volgorde maakt niet uit → combinaties.)"
  },
  {
   "h": "h2",
   "q": "Wanneer noem je een fenomeen toevallig (random)?",
   "o": [
    "Als het resultaat op geen enkele manier te voorspellen valt, ook niet op lange termijn",
    "Als de losse uitkomsten onzeker zijn maar op lange termijn regelmatig verdeeld",
    "Als het experiment maar een keer kan worden uitgevoerd",
    "Als elke individuele uitkomst even waarschijnlijk is"
   ],
   "a": 1,
   "u": "Bij toeval kan je de losse uitkomst niet voorspellen, maar over heel veel herhalingen tekent zich een duidelijk patroon af. Gelijke kansen zijn geen voorwaarde."
  },
  {
   "h": "h2",
   "q": "Hoe wordt de kans op een uitkomst frequentieel gedefinieerd?",
   "o": [
    "Als de verhouding tussen gunstige en ongunstige gebeurtenissen in een steekproef",
    "Als het gemiddelde van alle mogelijke uitkomsten",
    "Als de proportie keren dat die uitkomst voorkomt bij zeer veel herhalingen",
    "Als het aantal keer dat de uitkomst in tien pogingen voorkomt"
   ],
   "a": 2,
   "u": "De frequentiele definitie kijkt naar de lange termijn: de kans is de proportie waar de relatieve frequentie naartoe gaat bij een zeer groot aantal herhalingen."
  },
  {
   "h": "h2",
   "q": "Onder welke voorwaarde is het langetermijnpatroon van herhaalde pogingen voorspelbaar?",
   "o": [
    "Als elke poging hetzelfde resultaat geeft",
    "Als de uitkomstenruimte maar twee elementen bevat",
    "Als het aantal pogingen even is",
    "Als de pogingen onderling onafhankelijk zijn"
   ],
   "a": 3,
   "u": "De uitkomst van een nieuwe poging mag niet beinvloed worden door het resultaat van de vorige. Zonder die onafhankelijkheid gaat de redenering niet op."
  },
  {
   "h": "h2",
   "q": "Waaruit bestaat een kansmodel?",
   "o": [
    "Uit een uitkomstenruimte S en de kans van elke uitkomst",
    "Uit een nulhypothese en een alternatieve hypothese",
    "Uit een histogram en een dichtheidskromme",
    "Uit een steekproef en een populatiegemiddelde"
   ],
   "a": 0,
   "u": "Een kansmodel beschrijft een toevalsverschijnsel: de lijst van alle mogelijke uitkomsten (S) plus de waarschijnlijkheid van elk daarvan."
  },
  {
   "h": "h2",
   "q": "Wat is een gebeurtenis (event) in de kansrekening?",
   "o": [
    "Een uitkomst met een kans van precies 0,5",
    "Een uitkomst of een verzameling uitkomsten van een toevalsverschijnsel",
    "Altijd de volledige uitkomstenruimte, dus nooit een losse uitkomst apart",
    "Elke waarde die groter is dan het gemiddelde"
   ],
   "a": 1,
   "u": "Een gebeurtenis kan een enkele uitkomst zijn, maar evengoed een groep uitkomsten, bijvoorbeeld 'een even aantal ogen'."
  },
  {
   "h": "h2",
   "q": "Je gooit een eerlijke dobbelsteen. Wat is P(even aantal ogen) volgens de klassieke definitie?",
   "o": [
    "1/6, omdat elke zijde van de dobbelsteen een kans van 1/6 heeft",
    "2/6, omdat alleen 2 en 4 als even tellen",
    "1/2, omdat de zes uitkomsten even waarschijnlijk zijn",
    "5/6, omdat enkel de 1 als oneven telt"
   ],
   "a": 2,
   "u": "A = {2, 4, 6} en S = {1, 2, 3, 4, 5, 6}, dus P(A) = 3/6 = 1/2. De klassieke definitie mag hier omdat alle uitkomsten even waarschijnlijk zijn."
  },
  {
   "h": "h2",
   "q": "Iemand berekent de kans om een val van 200 meter te overleven als 1/2, want je overleeft of je overleeft niet. Wat is de fout?",
   "o": [
    "Hij had de complementregel moeten gebruiken",
    "Kansen mogen nooit als breuk geschreven worden",
    "De uitkomstenruimte is verkeerd opgesteld, want er bestaan meer dan twee mogelijke afloopwijzen",
    "De twee uitkomsten zijn niet even waarschijnlijk, dus de klassieke definitie geldt niet"
   ],
   "a": 3,
   "u": "De klassieke definitie deelt het aantal gunstige uitkomsten door het totaal, maar dat mag alleen als alle uitkomsten even waarschijnlijk zijn. Overleven en niet overleven zijn dat duidelijk niet."
  },
  {
   "h": "h2",
   "q": "Je werpt een oranje en een blauwe dobbelsteen en noteert beide resultaten. Hoe ziet het kansmodel eruit?",
   "o": [
    "36 uitkomsten die elk een kans van 1/36 hebben",
    "12 uitkomsten die elk een kans van 1/12 hebben",
    "6 uitkomsten die elk een kans van 1/6 hebben",
    "11 uitkomsten met verschillende kansen"
   ],
   "a": 0,
   "u": "Elk paar (oranje, blauw) is een aparte uitkomst: 6 x 6 = 36 gelijk waarschijnlijke uitkomsten, elk met kans 1/36."
  },
  {
   "h": "h2",
   "q": "Je noteert enkel het totaal aantal ogen van twee eerlijke dobbelstenen. Wat is P(totaal = 5)?",
   "o": [
    "2/36",
    "4/36",
    "5/36",
    "1/36"
   ],
   "a": 1,
   "u": "Vier van de 36 paren geven samen 5: (1,4), (4,1), (2,3) en (3,2). Dus 4/36 = 1/9."
  },
  {
   "h": "h2",
   "q": "Waarom hebben de elf mogelijke totalen bij twee dobbelstenen geen gelijke kansen?",
   "o": [
    "Omdat de uitkomstenruimte oneindig is",
    "Omdat de dobbelstenen niet eerlijk zijn",
    "Omdat sommige totalen op meer manieren tot stand komen dan andere",
    "Omdat 7 het gemiddelde van de verdeling is en daardoor altijd zwaarder doorweegt"
   ],
   "a": 2,
   "u": "Een totaal van 2 kan enkel via (1,1), maar een totaal van 7 kan op zes manieren. Hoe meer paren tot hetzelfde totaal leiden, hoe groter de kans."
  },
  {
   "h": "h2",
   "q": "Vier mensen antwoorden willekeurig ja of nee op een opiniepeiling. Welk model past daarop?",
   "o": [
    "Een keer een dobbelsteen gooien",
    "Vier kaarten trekken uit een spel zonder de getrokken kaarten terug te leggen",
    "Een normaalverdeling met gemiddelde 4",
    "Vier keer een muntstuk opgooien en het aantal keer kruis tellen"
   ],
   "a": 3,
   "u": "Bij willekeurig antwoorden zijn ja en nee even waarschijnlijk, net als kruis en munt. De uitkomstenruimte voor het aantal keer ja is S = {0, 1, 2, 3, 4}, precies zoals bij vier muntworpen."
  },
  {
   "h": "h2",
   "q": "Een rat kiest bij elke trial uit vier foto's en gokt puur op toeval. Hoeveel correcte keuzes verwacht je gemiddeld op 20 trials?",
   "o": [
    "5",
    "10",
    "20",
    "4"
   ],
   "a": 0,
   "u": "Per trial is de kans op de juiste foto 1/4. Over 20 trials verwacht je 20 x 1/4 = 5 toevalstreffers. Alleen resultaten die daar duidelijk boven liggen wijzen op meer dan toeval."
  },
  {
   "h": "h2",
   "q": "Een kansmodel geeft de leeftijdsgroepen 18 tot 23 (0,57), 24 tot 29 (0,17), 30 tot 39 (0,14) en 40 of meer (0,12). Wat is de kans dat een student niet in de groep 18 tot 23 zit?",
   "o": [
    "0,29",
    "0,43",
    "0,57",
    "0,88"
   ],
   "a": 1,
   "u": "Complementregel: P(niet A) = 1 - P(A) = 1 - 0,57 = 0,43. De vier kansen samen geven 1, dus het model klopt."
  },
  {
   "h": "h2",
   "q": "Historische muntexperimenten gaven proporties kruis van 0,5069, 0,5016 en 0,5067. Wat illustreren die cijfers?",
   "o": [
    "Dat kansen alleen theoretisch bestaan",
    "Dat echte munten door slijtage systematisch naar een van beide zijden neigen",
    "Dat de proportie kruis bij zeer veel worpen dicht bij 0,5 komt te liggen",
    "Dat de kans op kruis afhangt van wie er gooit"
   ],
   "a": 2,
   "u": "De veronderstelling P(kruis) = 1/2 wordt bevestigd door de praktijk: hoe meer worpen, hoe dichter de waargenomen proportie bij de theoretische kans komt."
  },
  {
   "h": "h2",
   "q": "Welke twee basisregels moeten altijd gelden in een kansmodel?",
   "o": [
    "Elke kans is groter dan 0, en de som is kleiner dan 1",
    "Elke kans is een breuk, en de noemer is het aantal uitkomsten",
    "Elke kans is even groot, en er zijn minstens twee uitkomsten",
    "Elke kans ligt tussen 0 en 1, en de som van alle kansen is 1"
   ],
   "a": 3,
   "u": "Regel 1: 0 is kleiner dan of gelijk aan P(A), en P(A) is kleiner dan of gelijk aan 1. Regel 2: P(S) = 1, dus alle kansen samen geven precies 1."
  },
  {
   "h": "h3",
   "q": "Wat is de algemene somregel voor twee willekeurige gebeurtenissen A en B?",
   "o": [
    "P(A of B) = P(A) + P(B) - P(A en B)",
    "P(A of B) = P(A) x P(B)",
    "P(A of B) = P(A) + P(B) + P(A en B)",
    "P(A of B) = P(A) + P(B)"
   ],
   "a": 0,
   "u": "Wie gewoon optelt, telt de overlap dubbel. Daarom trek je P(A en B) er weer af. Zijn A en B disjunct, dan is die doorsnede leeg en valt de correctie weg."
  },
  {
   "h": "h3",
   "q": "A, B en C zijn disjuncte gebeurtenissen. Wat is de kans dat er minstens een van de drie optreedt?",
   "o": [
    "1 - P(A) - P(B) - P(C)",
    "P(A) + P(B) + P(C)",
    "P(A) + P(B) + P(C) - P(A en B en C)",
    "P(A) x P(B) x P(C)"
   ],
   "a": 1,
   "u": "Disjunct betekent dat de gebeurtenissen geen enkele uitkomst delen. Er valt dus niets dubbel geteld te worden en je mag de kansen gewoon optellen."
  },
  {
   "h": "h3",
   "q": "Van een gebeurtenis A weet je dat P(A) = 0,35. Wat is de kans op het complement van A?",
   "o": [
    "0,35",
    "0,50",
    "0,65",
    "Dat hangt af van de andere gebeurtenissen in S"
   ],
   "a": 2,
   "u": "Complementregel: P(niet A) = 1 - P(A) = 1 - 0,35 = 0,65. Je hebt daarvoor verder niets over S nodig."
  },
  {
   "h": "h3",
   "q": "Hoe is de voorwaardelijke kans P(A gegeven B) gedefinieerd?",
   "o": [
    "P(A en B) gedeeld door P(A)",
    "P(A) gedeeld door P(A of B)",
    "P(A) x P(B)",
    "P(A en B) gedeeld door P(B)"
   ],
   "a": 3,
   "u": "Je verkleint de uitkomstenruimte tot B: van alle gevallen waarin B optreedt, kijk je welk deel ook A oplevert. Vandaar P(A en B) / P(B), met P(B) niet gelijk aan 0."
  },
  {
   "h": "h3",
   "q": "Je gooit een eerlijke dobbelsteen. A = meer dan 2 ogen, B = een even aantal ogen. Wat is P(A gegeven B)?",
   "o": [
    "2/3",
    "3/4",
    "1/3",
    "1/2"
   ],
   "a": 0,
   "u": "B = {2, 4, 6}, en daarvan zijn er twee groter dan 2 (namelijk 4 en 6). Dus P(A gegeven B) = 2/3. Zonder die voorwaarde was het 4/6 geweest."
  },
  {
   "h": "h3",
   "q": "Zelfde dobbelsteen. A = een even aantal ogen, B = minstens 4 ogen. Wat is P(B gegeven A)?",
   "o": [
    "1/2",
    "2/3",
    "1/6",
    "1/3"
   ],
   "a": 1,
   "u": "A = {2, 4, 6}. Daarvan zijn 4 en 6 minstens 4, dus P(B gegeven A) = 2/3. Let op: je deelt door het aantal even ogen, niet door 6."
  },
  {
   "h": "h3",
   "q": "Wat zegt de algemene productregel voor twee gebeurtenissen?",
   "o": [
    "P(A en B) = P(A gegeven B) gedeeld door P(B)",
    "P(A en B) = P(A) x P(B)",
    "P(A en B) = P(B) x P(A gegeven B)",
    "P(A en B) = P(A) + P(B) - P(A of B)"
   ],
   "a": 2,
   "u": "Dit volgt rechtstreeks uit de definitie van de voorwaardelijke kans en geldt ook als A en B afhankelijk zijn. Enkel bij onafhankelijkheid wordt het P(A) x P(B)."
  },
  {
   "h": "h3",
   "q": "Je trekt drie harten na elkaar uit een spel van 52 kaarten, zonder teruglegging. Hoe bereken je die kans?",
   "o": [
    "(13/52) + (12/51) + (11/50)",
    "(13 x 12 x 11) gedeeld door 52",
    "(13/52) x (13/52) x (13/52)",
    "(13/52) x (12/51) x (11/50)"
   ],
   "a": 3,
   "u": "Zonder teruglegging verandert de situatie na elke trekking. Met de productregel voor afhankelijke gebeurtenissen: (13/52) x (12/51) x (11/50), ongeveer 1,3 procent."
  },
  {
   "h": "h3",
   "q": "Welk paar gebeurtenissen is waarschijnlijk NIET onafhankelijk?",
   "o": [
    "Correct antwoorden op twee opeenvolgende meerkeuzevragen",
    "Het geslacht van twee babys van twee verschillende moeders",
    "Twee keer na elkaar een dobbelsteen gooien",
    "Correct gokken op twee opeenvolgende meerkeuzevragen"
   ],
   "a": 0,
   "u": "Wie de eerste vraag echt kent, kent de tweede vaak ook: kennis werkt door. Bij zuiver gokken speelt dat niet, en dobbelstenen of babys van verschillende moeders hebben geen onderling verband."
  },
  {
   "h": "h3",
   "q": "Je gooit twee keer een eerlijke munt. Wat is de kans op twee keer kruis?",
   "o": [
    "1/3",
    "1/4",
    "3/4",
    "1/2"
   ],
   "a": 1,
   "u": "De steekproefruimte is KK, KM, MK en MM, allemaal even waarschijnlijk. P(KK) = 1/4, wat ook uit de productregel volgt: 1/2 x 1/2."
  },
  {
   "h": "h3",
   "q": "Van de internetgebruikers is 29 procent 18 tot 29 jaar (47 procent daarvan chat), 47 procent is 30 tot 49 jaar (21 procent chat) en 24 procent is 50-plus (7 procent chat). Hoe groot is de kans dat een toevallige gebruiker chat?",
   "o": [
    "Ongeveer 33 procent",
    "Ongeveer 14 procent",
    "Ongeveer 25 procent",
    "Ongeveer 47 procent"
   ],
   "a": 2,
   "u": "Je telt de drie takken van het boomdiagram op: 0,29 x 0,47 + 0,47 x 0,21 + 0,24 x 0,07 = 0,1363 + 0,0987 + 0,0168 = 0,2518, dus ongeveer 25 procent."
  },
  {
   "h": "h3",
   "q": "Een student neemt in 30 procent van de gevallen de bus (kans op controle 20 procent) en anders de metro (kans op controle 10 procent). Hij wordt gecontroleerd. Wat is de kans dat dit in de bus gebeurde?",
   "o": [
    "60 procent",
    "20 procent",
    "30 procent",
    "46 procent"
   ],
   "a": 3,
   "u": "P(bus en controle) = 0,3 x 0,2 = 0,06 en P(metro en controle) = 0,7 x 0,1 = 0,07, samen 0,13. Bayes: 0,06 / 0,13 = 0,46, dus ongeveer 46 procent."
  },
  {
   "h": "h3",
   "q": "Diezelfde student heeft per traject 13 procent kans om gecontroleerd te worden. Wat is de kans dat hij op vijf trajecten nooit betrapt wordt?",
   "o": [
    "Ongeveer 50 procent",
    "Ongeveer 65 procent",
    "Ongeveer 87 procent",
    "Ongeveer 35 procent"
   ],
   "a": 0,
   "u": "Per traject is de kans om niet betrapt te worden 0,87. De trajecten zijn onafhankelijk, dus 0,87^5 = 0,498, dus ongeveer 50 procent."
  },
  {
   "h": "h3",
   "q": "Bij vrouwen van 20 tot 30 jaar is de incidentie van borstkanker 0,04 procent. Een mammografie detecteert 80 procent van de gevallen, maar geeft bij gezonde vrouwen 10 procent vals-positieven. Hoe groot is P(kanker gegeven positieve test)?",
   "o": [
    "Ongeveer 8 procent",
    "Ongeveer 0,3 procent",
    "Ongeveer 80 procent",
    "Ongeveer 20 procent"
   ],
   "a": 1,
   "u": "Bayes: (0,0004 x 0,8) gedeeld door (0,0004 x 0,8 + 0,9996 x 0,1) = 0,00032 / 0,10028 = 0,0032. Omdat de ziekte zo zeldzaam is, zijn bijna alle positieve uitslagen vals-positief."
  },
  {
   "h": "h3",
   "q": "Wat leert het mammografievoorbeeld over een goede test bij een zeldzame aandoening?",
   "o": [
    "Vals-positieven verdwijnen als de test vaker wordt herhaald",
    "Een hoge sensitiviteit garandeert een hoge kans op ziekte na een positieve test",
    "Zelfs bij een goede test kunnen de meeste positieve uitslagen vals-positief zijn",
    "De kans op ziekte na een positieve test is gelijk aan de sensitiviteit"
   ],
   "a": 2,
   "u": "P(positief gegeven kanker) en P(kanker gegeven positief) zijn twee verschillende dingen. Bij een lage incidentie wegen de vals-positieven uit de grote gezonde groep veel zwaarder."
  },
  {
   "h": "h3",
   "q": "Waarvoor gebruik je een boomdiagram in de kansrekening?",
   "o": [
    "Om de spreiding van een continue variabele in beeld te brengen met een kromme",
    "Om te tonen dat twee gebeurtenissen disjunct zijn",
    "Om een steekproefgemiddelde te schatten",
    "Om opeenvolgende gebeurtenissen en hun kansen stap voor stap uit te tekenen"
   ],
   "a": 3,
   "u": "Elke tak is een stap met een voorwaardelijke kans. Vermenigvuldigen langs een tak geeft de kans op dat pad, en optellen over de takken geeft de totale kans."
  },
  {
   "h": "h3",
   "q": "Je gooit twee dobbelstenen. Wat is de kans dat je exact één 6 gooit?",
   "o": [
    "10/36",
    "12/36",
    "1/6",
    "5/36"
   ],
   "a": 0,
   "u": "Eén 6 kan op twee manieren: (6, geen 6) of (geen 6, 6). P = 2 × (1/6)(5/6) = 10/36 ≈ 27,8%."
  },
  {
   "h": "h3",
   "q": "100 personen: 60% is vrouw, 70% vlucht, en 75% van de mannen vlucht. Wat is P(man | niet-vluchten)?",
   "o": [
    "25%",
    "33,33%",
    "80%",
    "10%"
   ],
   "a": 1,
   "u": "P(man)=0,4. P(niet vluchten | man)=1−0,75=0,25. P(niet vluchten)=1−0,70=0,30. Bayes: P(man | niet vl.) = 0,25·0,4 / 0,30 = 0,1/0,3 = 33,33%."
  },
  {
   "h": "h3",
   "q": "2500 deelnemers: 1200 hebben chronische stress, 1150 hebben slaaptekort, 785 hebben beide. Welke uitspraak is FOUT?",
   "o": [
    "P(stress ∪ slaaptekort) = 62,60%",
    "P(stress ∩ géén slaaptekort) = 16,60%",
    "Stress en slaaptekort zijn niet-disjunct",
    "P(stress ∩ slaaptekort) = 31,70%"
   ],
   "a": 3,
   "u": "P(stress ∩ slaaptekort) = 785/2500 = 31,40% (niet 31,70%). De rest klopt: ∪ = (1200+1150−785)/2500 = 62,60%; stress ∩ géén slaaptekort = (1200−785)/2500 = 16,60%."
  },
  {
   "h": "h3",
   "q": "4 ballen (zwart, geel, rood, groen). Je trekt ze alle 4 zonder teruglegging. Wat is de kans dat je zwart–geel–rood in die volgorde trekt (de eerste drie)?",
   "o": [
    "0,25",
    "0,0166",
    "0,0833",
    "0,0417"
   ],
   "a": 3,
   "u": "P = 1/4 · 1/3 · 1/2 = 1/24 ≈ 0,0417. (De vierde bal is dan automatisch groen.)"
  },
  {
   "h": "h3",
   "q": "Wanneer zijn twee gebeurtenissen A en B stochastisch ONAFHANKELIJK?",
   "o": [
    "Als P(A∩B) = P(A) + P(B)",
    "Als P(A∩B) = P(A) · P(B)",
    "Als ze disjunct zijn",
    "Als P(A) = P(B)"
   ],
   "a": 1,
   "u": "Onafhankelijk ⇔ P(A∩B) = P(A)·P(B) (en dan ook P(B|A) = P(B)). Let op: disjunct (elkaar uitsluitend) is iets ánders dan onafhankelijk."
  },
  {
   "h": "h3",
   "q": "Studenten doen mee aan experiment A (60%), experiment B (70%), of geen experiment (10%). Wat is de kans dat iemand aan énkel experiment B meedoet?",
   "o": [
    "50%",
    "30%",
    "40%",
    "20%"
   ],
   "a": 1,
   "u": "P(A of B) = 1 − P(geen) = 0,90. P(A én B) = P(A) + P(B) − P(A∪B) = 0,6 + 0,7 − 0,9 = 0,4. P(alleen B) = P(B) − P(A én B) = 0,7 − 0,4 = 0,30."
  },
  {
   "h": "h4",
   "q": "Wat is een stochastische variabele?",
   "o": [
    "Een variabele met getalwaarden die de uitkomsten van een toevalsproces beschrijven",
    "Elke variabele die in een steekproef gemeten wordt",
    "Een variabele waarvan de waarde vooraf vastligt",
    "Een variabele die enkel nominale categorieen aanneemt en dus niet berekend kan worden"
   ],
   "a": 0,
   "u": "Een stochastische variabele koppelt getallen aan de uitkomsten van een toevalsproces. De kansverdeling geeft daarbij welke waarden mogelijk zijn en met welke kans."
  },
  {
   "h": "h4",
   "q": "Je gooit drie keer een eerlijke munt en X is het aantal keer kruis. Wat is P(X = 2)?",
   "o": [
    "2/8",
    "3/8",
    "4/8",
    "1/8"
   ],
   "a": 1,
   "u": "Van de acht even waarschijnlijke uitkomsten geven er drie precies twee keer kruis: KKM, KMK en MKK. Dus 3/8."
  },
  {
   "h": "h4",
   "q": "Zelfde experiment met drie muntworpen. Wat is P(X groter dan of gelijk aan 2)?",
   "o": [
    "1/8",
    "3/8",
    "1/2",
    "5/8"
   ],
   "a": 2,
   "u": "P(X = 2) + P(X = 3) = 3/8 + 1/8 = 4/8 = 1/2."
  },
  {
   "h": "h4",
   "q": "Waaraan moeten de kansen in een discrete kansverdeling voldoen?",
   "o": [
    "Elke kans is groter dan 0, en samen geven ze minder dan 1",
    "Alle kansen zijn even groot",
    "De grootste kans hoort bij de grootste waarde",
    "Elke kans ligt tussen 0 en 1, en samen geven ze 1"
   ],
   "a": 3,
   "u": "Dat zijn precies de twee voorwaarden. De kans op een gebeurtenis is dan de som van de kansen van de waarden die tot die gebeurtenis horen."
  },
  {
   "h": "h4",
   "q": "Wat is het verschil tussen een discrete en een continue stochastische variabele?",
   "o": [
    "Een discrete variabele neemt een op te sommen verzameling waarden aan, een continue alle waarden in een interval",
    "Een discrete variabele kan negatief zijn, een continue niet",
    "Een discrete variabele heeft geen verwachting",
    "Een discrete variabele komt voort uit metingen met een toestel, terwijl een continue variabele uit tellingen ontstaat"
   ],
   "a": 0,
   "u": "Tellen geeft meestal discrete variabelen, meten meestal continue. Bij een continue variabele zitten er tussen twee waarden altijd nog oneindig veel andere."
  },
  {
   "h": "h4",
   "q": "Waarom krijgt elke afzonderlijke waarde van een continue variabele kans 0?",
   "o": [
    "Omdat continue variabelen in de praktijk altijd worden afgerond, waardoor een exacte waarde nooit voorkomt",
    "Omdat er oneindig veel mogelijke waarden zijn, zodat enkel intervallen een kans groter dan 0 hebben",
    "Omdat de dichtheidskromme onder de x-as ligt",
    "Omdat de kans altijd wordt afgerond"
   ],
   "a": 1,
   "u": "Bij een continue variabele is de kans de oppervlakte onder de dichtheidskromme. De oppervlakte boven een enkel punt is nul, dus alleen intervallen hebben een kans."
  },
  {
   "h": "h4",
   "q": "Hoe lees je een kans af bij een continue stochastische variabele?",
   "o": [
    "Als het gemiddelde van de twee grenswaarden van het gekozen interval",
    "Als de hoogte van de dichtheidskromme op dat punt",
    "Als de oppervlakte onder de dichtheidskromme boven dat interval",
    "Als de helling van de dichtheidskromme"
   ],
   "a": 2,
   "u": "De kans is altijd een oppervlakte. De totale oppervlakte onder de dichtheidskromme is 1, precies zoals de som van alle kansen bij een discrete variabele."
  },
  {
   "h": "h4",
   "q": "X is uniform verdeeld tussen 0 en 1. Wat is P(X kleiner dan of gelijk aan 0,5 of X groter dan 0,8)?",
   "o": [
    "0,8",
    "0,3",
    "0,5",
    "0,7"
   ],
   "a": 3,
   "u": "De twee stukken zijn disjunct, dus je telt de oppervlakten op: 0,5 + 0,2 = 0,7. De hoogte van de uniforme dichtheidskromme is hier 1."
  },
  {
   "h": "h4",
   "q": "Hoe worden normaalverdelingen in de kansrekening gebruikt?",
   "o": [
    "Als dichtheidskromme, zodat je kansen van intervallen kan berekenen",
    "Als telmethode om het aantal discrete uitkomsten in de steekproef te bepalen",
    "Als vervanging voor de somregel",
    "Enkel om steekproeven te trekken"
   ],
   "a": 0,
   "u": "De normaalverdeling is een dichtheidskromme. Door te standaardiseren naar z-scores herleid je elke normaalverdeling tot de standaardnormaalverdeling N(0,1), waarvan de oppervlakten in tabellen staan."
  },
  {
   "h": "h4",
   "q": "Wat doet standaardiseren met een normaal verdeelde variabele?",
   "o": [
    "Het maakt de verdeling symmetrisch",
    "Het herleidt N(mu, sigma) via een lineaire transformatie tot N(0,1)",
    "Het verandert de vorm van de verdeling van scheef naar symmetrisch normaal",
    "Het verkleint de steekproef"
   ],
   "a": 1,
   "u": "De z-score (x min mu, gedeeld door sigma) is een lineaire transformatie. De vorm blijft dus gelijk, alleen het centrum wordt 0 en de standaardafwijking 1."
  },
  {
   "h": "h4",
   "q": "De APGAR-scores 0 tot 10 hebben kansen die samen 1 geven, met de grootste kansen bij 8 en 9. Hoe beschrijf je die verdeling?",
   "o": [
    "Uniform, want alle scores zijn even waarschijnlijk",
    "Symmetrisch rond 5",
    "Links-scheef, want de meeste babys halen een vrij hoge score",
    "Rechts-scheef, want lage scores komen het vaakst voor"
   ],
   "a": 2,
   "u": "De hoge waarden dragen het grootste deel van de kansmassa en de staart loopt naar links uit. De kans op een score onder 6 is klein."
  },
  {
   "h": "h4",
   "q": "Voor de APGAR-verdeling geldt P(X groter dan of gelijk aan 7) = 0,908. Hoe interpreteer je dat?",
   "o": [
    "Ruim 90 procent van de pasgeborenen behaalt precies de score 7 bij de eerste meting",
    "De gemiddelde score is 0,908",
    "Score 7 komt in 90,8 procent van de gevallen voor",
    "Ruim 90 procent van de pasgeborenen haalt een score die op een gezonde baby wijst"
   ],
   "a": 3,
   "u": "Je telt de kansen van de waarden 7 tot en met 10 op. De kans dat een toevallig gekozen pasgeborene in die groep valt, is 0,908."
  },
  {
   "h": "h5",
   "q": "Hoe bereken je de verwachting E(X) van een discrete stochastische variabele?",
   "o": [
    "Als de som van elke waarde vermenigvuldigd met haar kans",
    "Als de waarde met de grootste kans",
    "Als de som van alle waarden gedeeld door het aantal waarden",
    "Als de mediaan van de kansverdeling"
   ],
   "a": 0,
   "u": "De verwachting is een gewogen gemiddelde: elke uitkomst telt mee volgens haar kans. Een gewoon gemiddelde van de waarden zou de kansen negeren."
  },
  {
   "h": "h5",
   "q": "Bij een loterij noem je een getal van 0 tot 999 en win je 500 euro bij een treffer. Wat is de verwachting van de opbrengst?",
   "o": [
    "500 euro",
    "0,50 euro",
    "1 euro",
    "5 euro"
   ],
   "a": 1,
   "u": "E(X) = 500 x (1/1000) + 0 x (999/1000) = 0,50 euro. Kost deelnemen 1 euro, dan verlies je gemiddeld 0,50 euro per spel."
  },
  {
   "h": "h5",
   "q": "De verwachting van de APGAR-score is 8,128. Wat betekent dat getal?",
   "o": [
    "Dat 8,128 de mediaan van de verdeling is",
    "Dat 8,128 de score is die bij pasgeborenen het vaakst wordt waargenomen in de kliniek",
    "Dat de gemiddelde score op lange termijn 8,128 bedraagt bij heel veel toevallig gekozen babys",
    "Dat elke baby ongeveer 8,128 scoort"
   ],
   "a": 2,
   "u": "De verwachting is het langetermijngemiddelde over heel veel herhalingen. Het is geen typische score van een individuele baby."
  },
  {
   "h": "h5",
   "q": "Moet de verwachting van een stochastische variabele zelf een mogelijke uitkomst zijn?",
   "o": [
    "Ja, maar alleen bij discrete variabelen",
    "Nee, maar ze ligt altijd precies in het midden van alle mogelijke uitkomsten",
    "Ja, anders is de berekening fout",
    "Nee, het is een berekende waarde die zelfs geen geheel getal hoeft te zijn"
   ],
   "a": 3,
   "u": "De APGAR-verwachting 8,128 is geen mogelijke score, want er zijn enkel gehele scores. De verwachting geeft het te verwachten gemiddelde, niet een concrete uitkomst."
  },
  {
   "h": "h5",
   "q": "Wat zegt de wet van de grote getallen?",
   "o": [
    "Dat het steekproefgemiddelde het populatiegemiddelde mu benadert naarmate het aantal waarnemingen toeneemt",
    "Dat de variantie kleiner wordt naarmate de waarden groter worden",
    "Dat elke reeks waarnemingen vanzelf perfect symmetrisch rond het populatiegemiddelde komt te liggen",
    "Dat grote steekproeven altijd normaal verdeeld zijn"
   ],
   "a": 0,
   "u": "Neem je onafhankelijke waarnemingen uit een populatie met eindige verwachting mu, dan schuift het steekproefgemiddelde bij toenemende n steeds dichter naar mu."
  },
  {
   "h": "h5",
   "q": "Waarom is de intuitie over korte reeksen vaak fout, bijvoorbeeld bij drie keer kruis na elkaar?",
   "o": [
    "Omdat de wet van de grote getallen enkel opgaat bij dobbelstenen en niet bij munten",
    "Omdat mensen verwachten dat het langetermijnpatroon ook in korte reeksen zichtbaar is",
    "Omdat munten in korte reeksen niet eerlijk zijn",
    "Omdat de kans op kruis stijgt na elke munt"
   ],
   "a": 1,
   "u": "De regelmaat geldt pas op lange termijn. In korte reeksen zijn series juist gewoon, en toch worden hun kansen stelselmatig onderschat."
  },
  {
   "h": "h5",
   "q": "Hoe bereken je de variantie van een discrete stochastische variabele X met verwachting mu?",
   "o": [
    "Als het kwadraat van de verwachting",
    "Als de som van de kwadraten van alle mogelijke waarden in de verdeling, gedeeld door hun aantal",
    "Als de som van (x min mu) in het kwadraat, telkens vermenigvuldigd met de kans van x",
    "Als het gemiddelde van de afwijkingen van mu"
   ],
   "a": 2,
   "u": "Je weegt de kwadratische afwijkingen van mu met hun kansen. De standaardafwijking is daarna de vierkantswortel uit die variantie."
  },
  {
   "h": "h5",
   "q": "De standaarddeviatie van de APGAR-score is 1,437 bij een verwachting van 8,128. Wat betekent dat?",
   "o": [
    "Dat de laagste score 1,437 is",
    "Dat de variantie 1,437 bedraagt",
    "Dat 1,437 procent van de pasgeborenen afwijkt van de gemiddelde score van 8,128",
    "Dat een toevallig gekozen score gemiddeld ongeveer 1,4 punten van 8,128 afwijkt"
   ],
   "a": 3,
   "u": "De standaarddeviatie is de typische afstand tot de verwachting, in dezelfde eenheid als de scores. De variantie is hier het kwadraat, ongeveer 2,065."
  },
  {
   "h": "h5",
   "q": "De gemiddelde temperatuur is 10,54 graden Celsius. Wat is het gemiddelde in Fahrenheit, met F = 32 + 9/5 x C?",
   "o": [
    "50,97",
    "59,00",
    "18,97",
    "42,54"
   ],
   "a": 0,
   "u": "Regel 1 voor verwachtingen: mu(a + bX) = a + b x mu(X). Dus 32 + 1,8 x 10,54 = 50,97 graden Fahrenheit."
  },
  {
   "h": "h5",
   "q": "Studenten maken gemiddeld 1,3 spelfouten en 3,2 redeneerfouten. Hoeveel fouten van beide soorten samen verwacht je gemiddeld?",
   "o": [
    "4,16",
    "4,5",
    "1,9",
    "2,25"
   ],
   "a": 1,
   "u": "Regel 2 voor verwachtingen: mu(X + Y) = mu(X) + mu(Y) = 1,3 + 3,2 = 4,5. Dit geldt altijd, ook als de twee soorten fouten samenhangen."
  },
  {
   "h": "h5",
   "q": "X is een stochastische variabele en a en b zijn vaste getallen. Wat is de variantie van a + bX?",
   "o": [
    "sigma kwadraat van X",
    "b x sigma kwadraat van X",
    "b kwadraat x sigma kwadraat van X",
    "a + b kwadraat x sigma kwadraat van X"
   ],
   "a": 2,
   "u": "Een constante optellen verschuift de verdeling zonder de spreiding te veranderen, dus a valt weg. Vermenigvuldigen met b schaalt de standaardafwijking met b, en dus de variantie met b kwadraat."
  },
  {
   "h": "h5",
   "q": "X en Y zijn onafhankelijk. Wat geldt voor de variantie van het verschil X min Y?",
   "o": [
    "Ze is altijd 0",
    "Ze is gelijk aan de variantie van X",
    "Ze is gelijk aan de variantie van X min die van Y",
    "Ze is gelijk aan de som van beide varianties"
   ],
   "a": 3,
   "u": "Bij onafhankelijkheid tellen varianties op, ook bij een verschil: sigma kwadraat van X min Y is sigma kwadraat van X plus sigma kwadraat van Y. Onzekerheid trek je niet van elkaar af."
  },
  {
   "h": "h5",
   "q": "X en Y zijn positief gecorreleerd. Wat gebeurt er met de variantie van X + Y ten opzichte van het geval zonder samenhang?",
   "o": [
    "Ze wordt groter, want er komt een term met de covariantie bij",
    "Ze wordt kleiner, want de samenhang dempt de spreiding",
    "Ze blijft precies gelijk",
    "Ze wordt altijd nul"
   ],
   "a": 0,
   "u": "Regel 3: sigma kwadraat van X + Y = sigma kwadraat van X + sigma kwadraat van Y + 2 x de covariantie. Bij een positieve correlatie is die extra term positief."
  },
  {
   "h": "h5",
   "q": "Wat wordt bedoeld met steekproevenvariabiliteit?",
   "o": [
    "Dat de metingen binnen een steekproef onderling van persoon tot persoon verschillen",
    "Dat de waarde van een steekproefgrootheid verschilt van steekproef tot steekproef",
    "Dat de populatie zelf verandert in de tijd",
    "Dat een steekproef nooit aselect kan zijn"
   ],
   "a": 1,
   "u": "Elke nieuwe aselecte steekproef geeft een ander steekproefgemiddelde. Precies die variabiliteit maakt het nodig om met kansen en betrouwbaarheidsintervallen te werken."
  },
  {
   "h": "h5",
   "q": "Een variabele N = W − H. De correlatie tussen W en H is −0,7; de variantie van W is 25 en van H is 16. Wat is de variantie van N?",
   "o": [
    "9",
    "13",
    "69",
    "41"
   ],
   "a": 2,
   "u": "Var(W − H) = Var(W) + Var(H) − 2·Cov(W,H). Cov = r·σ_W·σ_H = −0,7·√25·√16 = −0,7·5·4 = −14. Dus Var = 25 + 16 − 2·(−14) = 41 + 28 = 69."
  },
  {
   "h": "h6",
   "q": "Wat is het verschil tussen een parameter en een karakteristieke waarde?",
   "o": [
    "Een parameter is geschat, een karakteristieke waarde is exact gekend in de populatie",
    "Een parameter beschrijft een steekproef, een karakteristieke waarde de populatie",
    "Een parameter beschrijft de populatie, een karakteristieke waarde wordt uit de steekproefdata berekend",
    "Een parameter is altijd een gemiddelde, terwijl een karakteristieke waarde altijd een proportie in de steekproef is"
   ],
   "a": 2,
   "u": "Parameters horen bij de populatie en krijgen Griekse letters, zoals mu en sigma. Een karakteristieke waarde (een statistiek) reken je uit op je steekproef en gebruik je vaak als schatter van de parameter."
  },
  {
   "h": "h6",
   "q": "Wat is een steekproevenverdeling (sampling distribution)?",
   "o": [
    "De verdeling van de meetfouten in een onderzoek",
    "De frequentieverdeling van alle waarden die in een concrete steekproef zijn gemeten en genoteerd",
    "De verdeling van de waarden in de hele populatie",
    "De verdeling van een steekproefgrootheid over alle mogelijke steekproeven van dezelfde grootte"
   ],
   "a": 3,
   "u": "Let op het verschil met de steekproefverdeling, die je gewoon in je data ziet. De steekproevenverdeling is theoretisch: ze zegt hoe bijvoorbeeld het gemiddelde varieert van steekproef tot steekproef."
  },
  {
   "h": "h6",
   "q": "Aan welke vier voorwaarden moet een binomiale situatie voldoen?",
   "o": [
    "Binair, onafhankelijk, vooraf bepaald aantal pogingen, constante succeskans",
    "Normaal verdeeld, voldoende groot, zuiver aselect en zonder uitschieters in de data",
    "Binair, gepaard, groot en symmetrisch",
    "Onafhankelijk, continu, aselect en met teruglegging"
   ],
   "a": 0,
   "u": "Het ezelsbruggetje is BOAS: Binair (succes of mislukking), Onafhankelijk, Aantal pogingen n ligt vooraf vast, en de Succeskans p blijft bij elke poging gelijk."
  },
  {
   "h": "h6",
   "q": "Wat geeft de binomiaalcoefficient C(n,k) weer?",
   "o": [
    "De kans op k successen",
    "Het aantal volgorden waarin k successen kunnen voorkomen in n pogingen",
    "Het gemiddelde aantal successen",
    "Het aantal mislukkingen dat je bij n opeenvolgende pogingen mag verwachten"
   ],
   "a": 1,
   "u": "C(n,k) telt de plaatsingen: op hoeveel manieren k successen over n pogingen verdeeld kunnen liggen. Vermenigvuldig je dat met de kans op een specifieke volgorde, dan krijg je de binomiale kans."
  },
  {
   "h": "h6",
   "q": "Hoe luidt de binomiale kansformule voor P(X = k)?",
   "o": [
    "n x p^k x (1 - p)",
    "p^k x (1 - p)^(n - k)",
    "C(n,k) x p^k x (1 - p)^(n - k)",
    "C(n,k) x p x (1 - p)"
   ],
   "a": 2,
   "u": "De kans op een bepaalde volgorde met k successen is p^k x (1-p)^(n-k). Omdat de volgorde niet uitmaakt, vermenigvuldig je met het aantal mogelijke volgorden, C(n,k)."
  },
  {
   "h": "h6",
   "q": "Twee ouders hebben per kind 25 procent kans op bloedgroep O en krijgen vijf kinderen. Wat is de kans dat precies drie kinderen bloedgroep O hebben?",
   "o": [
    "Ongeveer 25 procent",
    "Ongeveer 60 procent",
    "Ongeveer 1,5 procent",
    "Ongeveer 8,8 procent"
   ],
   "a": 3,
   "u": "X is binomiaal met n = 5 en p = 0,25. P(X = 3) = C(5,3) x 0,25^3 x 0,75^2 = 10 x 0,015625 x 0,5625 = 0,088."
  },
  {
   "h": "h6",
   "q": "Bij diezelfde ouders is de kans op meer dan drie kinderen met bloedgroep O ongeveer 1,5 procent. Wat besluit je daaruit?",
   "o": [
    "Vier of vijf kinderen met bloedgroep O is een opmerkelijk resultaat",
    "Dat is een heel gewoon resultaat bij p = 0,25",
    "De kans op bloedgroep O moet in dit gezin groter zijn dan de opgegeven 0,25",
    "De binomiale verdeling is hier niet bruikbaar"
   ],
   "a": 0,
   "u": "P(X = 4) + P(X = 5) = 0,0146 + 0,0010 = 0,0156. Zoiets gebeurt in ongeveer een op de 64 gezinnen, dus het is zeldzaam genoeg om verbaasd te zijn."
  },
  {
   "h": "h6",
   "q": "Bij tien procent van de CDs zit een ernstige fout. Je controleert er tien uit een levering van 10000. Waarom mag je hier de binomiale verdeling gebruiken?",
   "o": [
    "Omdat je met teruglegging trekt",
    "Omdat de populatie veel groter is dan de steekproef, met als vuistregel N groter dan of gelijk aan 20n",
    "Omdat tien een even getal is",
    "Omdat de fouten bij de productie normaal verdeeld zijn rond een vast gemiddelde per levering van tienduizend stuks"
   ],
   "a": 1,
   "u": "Strikt genomen trek je zonder teruglegging, dus de pogingen zijn niet perfect onafhankelijk. Bij N groter dan of gelijk aan 20n is dat verschil verwaarloosbaar en werkt B(n, p) als benadering."
  },
  {
   "h": "h6",
   "q": "X is binomiaal verdeeld met n = 10 en p = 0,1. Wat is P(X = 0)?",
   "o": [
    "0,9000",
    "0,1000",
    "0,3487",
    "0,5000"
   ],
   "a": 2,
   "u": "P(X = 0) = 0,9^10 = 0,3487. Er is dus ruim 34 procent kans dat een controle van tien stuks geen enkele fout opmerkt."
  },
  {
   "h": "h6",
   "q": "Wat zijn de verwachting en de standaarddeviatie van een binomiaal verdeelde X?",
   "o": [
    "mu = p en sigma = wortel uit p(1 - p)",
    "mu = n(1 - p) en sigma = np",
    "mu = np en sigma = np(1 - p)",
    "mu = np en sigma = wortel uit np(1 - p)"
   ],
   "a": 3,
   "u": "Deze formules gelden uitsluitend voor binomiale verdelingen. Vergeet de vierkantswortel niet: np(1-p) zonder wortel is de variantie."
  },
  {
   "h": "h6",
   "q": "In een steekproef van 2500 mensen is p = 0,60. Wat is de verwachting van het aantal successen?",
   "o": [
    "1500",
    "2500",
    "600",
    "1000"
   ],
   "a": 0,
   "u": "mu = np = 2500 x 0,60 = 1500. De standaarddeviatie is de wortel uit 2500 x 0,6 x 0,4 = wortel uit 600, dus ongeveer 24,5."
  },
  {
   "h": "h6",
   "q": "Wat is het verschil tussen een steekproefaantal en een steekproeffractie?",
   "o": [
    "Er is geen verschil, het zijn twee namen voor hetzelfde",
    "Een aantal loopt van 0 tot n, een fractie is een proportie tussen 0 en 1",
    "Een aantal is continu, een fractie is discreet",
    "Een aantal hoort bij de populatie, een fractie bij de steekproef"
   ],
   "a": 1,
   "u": "De fractie is het aantal gedeeld door n. Beide beschrijven hetzelfde resultaat, maar op een andere schaal, en ze hebben dus ook een andere standaarddeviatie."
  },
  {
   "h": "h6",
   "q": "Wat is de standaarddeviatie van een steekproefproportie?",
   "o": [
    "p(1 - p) gedeeld door de wortel uit n",
    "De wortel uit p(1 - p)",
    "De wortel uit de breuk p(1 - p)/n",
    "De wortel uit np(1 - p)"
   ],
   "a": 2,
   "u": "Voor de proportie deel je de binomiale spreiding door n, wat de wortel uit p(1-p)/n oplevert. De spreiding krimpt dus naarmate de steekproef groeit."
  },
  {
   "h": "h6",
   "q": "Wanneer mag je een binomiale verdeling benaderen met een normaalverdeling?",
   "o": [
    "Als p ongeveer 0,5 bedraagt",
    "Als de populatie waaruit je de steekproef trekt zelf al normaal verdeeld is",
    "Als n groter is dan 30",
    "Als np groter dan of gelijk aan 10 en n(1 - p) groter dan of gelijk aan 10"
   ],
   "a": 3,
   "u": "Beide voorwaarden moeten samen gelden, want anders is de binomiale verdeling nog te scheef. Bij n = 2500 en p = 0,6 zijn np = 1500 en n(1-p) = 1000, dus ruim voldoende."
  },
  {
   "h": "h6",
   "q": "Waarom heb je een continuiteitscorrectie nodig bij die benadering?",
   "o": [
    "Omdat de binomiale verdeling discreet is en de normaalverdeling continu",
    "Omdat de steekproef te klein is",
    "Omdat p onbekend is",
    "Omdat de normaalverdeling bij kleine n te scheef uitvalt om bruikbaar te zijn"
   ],
   "a": 0,
   "u": "Een discrete waarde als X = 8 komt overeen met de strook tussen 7,5 en 8,5 onder de normaalkromme. Zonder die halve eenheid wordt de benadering merkbaar onnauwkeurig."
  },
  {
   "h": "h6",
   "q": "Je wil P(X groter dan of gelijk aan 1520) benaderen met de normaalverdeling. Welke grens gebruik je?",
   "o": [
    "1520",
    "1519,5",
    "1520,5",
    "1521"
   ],
   "a": 1,
   "u": "De klasse rond 1520 loopt van 1519,5 tot 1520,5. Omdat 1520 zelf moet meetellen, begin je de oppervlakte bij de ondergrens 1519,5."
  },
  {
   "h": "h6",
   "q": "Voor n = 20 en p = 0,4 is de exacte binomiale P(X kleiner dan of gelijk aan 9) gelijk aan 0,755. Zonder continuiteitscorrectie geeft de normaalbenadering 0,676, met correctie 0,753. Wat leert dat?",
   "o": [
    "Dat de correctie alleen bij grote n nodig is",
    "Dat de normaalbenadering bij deze waarden van n en p nooit bruikbaar is",
    "Dat de correctie de benadering sterk verbetert wanneer np klein is",
    "Dat de exacte berekening fout is"
   ],
   "a": 2,
   "u": "Bij np = 8 zit je onder de vuistregel van 10, dus de benadering is wankel. De halve eenheid haalt het resultaat toch tot dicht bij de exacte waarde."
  },
  {
   "h": "h6",
   "q": "De kans op een glimlach is 0,5% (p = 0,005). Wat is de kans dat exact 2 van de 15 mensen glimlachen?",
   "o": [
    "Kan niet berekend worden",
    "0,25%",
    "2,5%",
    "95%"
   ],
   "a": 1,
   "u": "Binomiaal B(n=15; p=0,005). P(X=2) = C(15,2)·0,005²·0,995¹³ ≈ 0,25%."
  },
  {
   "h": "h6",
   "q": "80% van de kinderen lust ontbijtgranen. Wat is de kans dat minstens 3 van de 8 kleuters ze NIET lusten?",
   "o": [
    "20,31%",
    "79,69%",
    "14,8%",
    "48%"
   ],
   "a": 0,
   "u": "Niet lusten: p = 0,20. X ~ B(8; 0,20). P(X ≥ 3) = 1 − P(X ≤ 2) = 1 − (0,168 + 0,336 + 0,294) = 1 − 0,797 = 20,31%."
  },
  {
   "h": "h6",
   "q": "Ongeveer 30% van de patiënten komt binnen met een depressie. Wat is de kans dat minstens 15 van de 40 patiënten een depressie hebben?",
   "o": [
    "6,2%",
    "19,49%",
    "88,69%",
    "50%"
   ],
   "a": 1,
   "u": "X ~ B(40; 0,30): µ = 12, σ = √(40·0,3·0,7) = 2,90. Met continuïteitscorrectie: z = (14,5−12)/2,90 = 0,86 → P(Z>0,86) ≈ 19,5% (exact ≈ 19,3%)."
  },
  {
   "h": "h6",
   "q": "Wat is FOUT?",
   "o": [
    "Inductieve statistiek = op basis van een steekproef een uitspraak doen over de hele populatie",
    "De normaalverdeling is symmetrisch rond het gemiddelde",
    "Een binomiale verdeling is altijd symmetrisch",
    "Bij een continue verdeling maakt het niet uit of je P(X≤a) of P(X<a) neemt"
   ],
   "a": 2,
   "u": "Een binomiale verdeling is alleen symmetrisch als p = 0,5; bij andere p is ze scheef. De andere uitspraken kloppen: bij een continue verdeling is P(X=x)=0, dus ≤ en < geven hetzelfde; inductieve (inferentiële) statistiek veralgemeent van steekproef naar populatie; de normaalverdeling is inderdaad symmetrisch."
  },
  {
   "h": "h7",
   "q": "Waarom noemt men het steekproefgemiddelde een zuivere schatter van mu?",
   "o": [
    "Omdat de berekening enkel opgaat bij populaties die exact normaal verdeeld zijn",
    "Omdat het geen standaardfout heeft",
    "Omdat het altijd exact gelijk is aan mu",
    "Omdat het gemiddeld noch systematisch boven, noch systematisch onder mu ligt"
   ],
   "a": 3,
   "u": "Zuiver betekent dat de verwachting van de schatter gelijk is aan de parameter. Losse steekproeven wijken uiteraard wel af, maar zonder systematische richting, ook bij scheve populaties."
  },
  {
   "h": "h7",
   "q": "Wat is de standaardfout van het steekproefgemiddelde?",
   "o": [
    "sigma gedeeld door de wortel uit n",
    "sigma gedeeld door n",
    "de wortel uit sigma gedeeld door n",
    "sigma"
   ],
   "a": 0,
   "u": "De standaardfout is de standaarddeviatie van de steekproevenverdeling: sigma gedeeld door de wortel uit n. Ze is dus kleiner dan de spreiding van de individuele waarnemingen."
  },
  {
   "h": "h7",
   "q": "Waarom zijn steekproefgemiddelden minder variabel dan individuele waarnemingen?",
   "o": [
    "Omdat het gemiddelde de uitschieters verwijdert",
    "Omdat extreme waarden binnen een steekproef elkaar deels opheffen",
    "Omdat steekproeven altijd aselect zijn",
    "Omdat de populatie bij elke trekking kleiner wordt en daardoor stabieler meet"
   ],
   "a": 1,
   "u": "In een gemiddelde compenseren hoge en lage waarden elkaar. Daarom krimpt de spreiding met een factor wortel uit n, en niet met n zelf."
  },
  {
   "h": "h7",
   "q": "Een populatie is normaal verdeeld met gemiddelde mu en standaarddeviatie sigma. Hoe is het steekproefgemiddelde dan verdeeld?",
   "o": [
    "Altijd rechts scheef",
    "Uniform tussen de kleinste en de grootste waarde",
    "Exact normaal, met gemiddelde mu en standaardfout sigma gedeeld door de wortel uit n",
    "Bij benadering normaal, maar uitsluitend wanneer de steekproef minstens dertig eenheden telt"
   ],
   "a": 2,
   "u": "Bij een normaal verdeelde populatie is het gemiddelde exact normaal verdeeld, ongeacht n. De centrale limietstelling heb je pas nodig als de populatie niet normaal is."
  },
  {
   "h": "h7",
   "q": "Een populatie is sterk rechts scheef. Wat gebeurt er met de steekproevenverdeling van het gemiddelde als n toeneemt van 1 naar 25?",
   "o": [
    "Ze blijft identiek aan de populatieverdeling",
    "Ze wordt uniform",
    "Ze wordt steeds schever",
    "Ze wordt steeds symmetrischer en smaller"
   ],
   "a": 3,
   "u": "Bij n = 1 is de steekproevenverdeling gelijk aan de populatieverdeling. Hoe groter n, hoe meer de vorm naar een normaalverdeling neigt en hoe kleiner de standaardfout wordt."
  },
  {
   "h": "h7",
   "q": "Een onderhoudsbeurt duurt gemiddeld 1 uur met sigma = 1, sterk rechts scheef. Voor 70 toestellen budgetteer je 1,1 uur per toestel. Hoe pak je dit aan?",
   "o": [
    "Je gebruikt de centrale limietstelling, want n = 70 is groter dan 30",
    "Je kan hier niets berekenen zonder de volledige data",
    "Je gebruikt de binomiale verdeling",
    "Je gebruikt de populatieverdeling zelf, want die is sterk rechts scheef"
   ],
   "a": 0,
   "u": "Met n = 70 mag je de steekproevenverdeling van het gemiddelde als normaal beschouwen: N(1; 1 gedeeld door wortel 70), dus N(1; 0,12). De scheefheid van de populatie zelf speelt dan geen rol meer."
  },
  {
   "h": "h7",
   "q": "In dat voorbeeld is er ongeveer 20 procent kans dat het gemiddelde boven 1,1 uur uitkomt. Wat betekent dat voor het budget?",
   "o": [
    "Het budget is zeker voldoende",
    "Er is een op vijf kans dat de techniekers te weinig tijd hebben",
    "Het budget is in 80 procent van de gevallen te ruim berekend",
    "Het gemiddelde zal altijd 1,1 uur bedragen"
   ],
   "a": 1,
   "u": "Twintig procent kans op overschrijding is niet verwaarloosbaar. Wil je meer zekerheid, dan moet je per toestel meer tijd inschrijven."
  },
  {
   "h": "h7",
   "q": "Je verviervoudigt de steekproefgrootte van n naar 4n. Wat gebeurt er met de standaardfout?",
   "o": [
    "Ze wordt twee keer groter",
    "Ze wordt vier keer kleiner",
    "Ze wordt twee keer kleiner",
    "Ze blijft gelijk"
   ],
   "a": 2,
   "u": "De standaardfout is sigma gedeeld door de wortel uit n. De wortel uit 4n is 2 keer de wortel uit n, dus de standaardfout halveert. Meer precisie kost dus onevenredig veel extra deelnemers."
  },
  {
   "h": "h7",
   "q": "X en Y zijn onafhankelijk en normaal verdeeld. Wat geldt voor hun som?",
   "o": [
    "De som is binomiaal verdeeld",
    "De som is uniform verdeeld",
    "Over de som valt niets te zeggen",
    "De som is opnieuw normaal verdeeld"
   ],
   "a": 3,
   "u": "Elke lineaire combinatie van onafhankelijke normaal verdeelde variabelen is opnieuw normaal verdeeld. De gemiddelden tellen op en, bij onafhankelijkheid, ook de varianties."
  },
  {
   "h": "h7",
   "q": "Bij een normaal verdeelde steekproevenverdeling ligt welk aandeel van de steekproefgemiddelden binnen een standaardfout van mu?",
   "o": [
    "Ongeveer 68 procent",
    "Ongeveer 95 procent",
    "Ongeveer 99,7 procent",
    "Ongeveer 50 procent"
   ],
   "a": 0,
   "u": "Dit is de vuistregel voor normaalverdelingen toegepast op de steekproevenverdeling: ongeveer 68 procent binnen een standaardfout, ongeveer 95 procent binnen twee."
  },
  {
   "h": "h7",
   "q": "Het aantal seconden dat wolven huilen is scheef verdeeld met gemiddelde 25 s en standaarddeviatie 7 s. Wat is de kans dat 49 wolven gemiddeld minstens 26 s huilen (door toeval)?",
   "o": [
    "84,13%",
    "ongeveer 20%",
    "Niet genoeg gegevens",
    "15,87%"
   ],
   "a": 3,
   "u": "Standaardfout = σ/√n = 7/√49 = 1. z = (26−25)/1 = 1, dus P(Z>1) = 1−0,8413 = 15,87%. De centrale limietstelling geldt (n=49 ≥ 30), dus de steekproevenverdeling is ongeveer normaal, ook al is de populatie scheef."
  },
  {
   "h": "h7",
   "q": "6 kleuren snoep, je verwacht 1/6 van elke kleur. Merel koopt een kleine zak, Christine een grote. A: minder dan 10% groen. B: meer dan 25% rood. Wat is juist?",
   "o": [
    "A bij klein, B bij groot",
    "Op toevalsbasis niet te zeggen",
    "A én B zijn waarschijnlijker bij de kleine zak",
    "A én B zijn waarschijnlijker bij de grote zak"
   ],
   "a": 2,
   "u": "A en B zijn beide afwijkingen van het verwachte 1/6 (≈16,7%). Bij een kleinere steekproef is de standaardfout groter, dus zulke afwijkingen zijn waarschijnlijker → beide bij de kleine zak."
  },
  {
   "h": "h7",
   "q": "Wat zegt de centrale limietstelling?",
   "o": [
    "De populatie wordt normaalverdeeld bij grote n",
    "Bij n ≥ 30 gaat de verdeling van de steekproef steeds meer op de verdeling van de populatie lijken, ongeacht haar vorm",
    "Als de steekproef groot genoeg is, benadert de steekproevenverdeling een normaalverdeling, ongeacht de vorm van de populatie",
    "Bij n ≥ 30 pas je altijd continuïteitscorrectie toe"
   ],
   "a": 2,
   "u": "De CLT gaat over de verdeling van het steekproef-GEMIDDELDE: bij voldoende grote n is die ongeveer normaal, ongeacht de vorm van de populatie."
  },
  {
   "h": "h7",
   "q": "Wat gebeurt er met de standaardfout (σ/√n) als n toeneemt?",
   "o": [
    "Ze wordt kleiner",
    "Ze blijft gelijk",
    "Ze wordt 0",
    "Ze wordt groter"
   ],
   "a": 0,
   "u": "Standaardfout = σ/√n. Een grotere n → grotere noemer → kleinere standaardfout → een preciezere schatting van het gemiddelde."
  },
  {
   "h": "h8",
   "q": "Wat is het verschil tussen een puntschatting en een intervalschatting?",
   "o": [
    "Een puntschatting werkt enkel bij proporties",
    "Een puntschatting geeft een getal, een intervalschatting geeft een reeks aannemelijke waarden met een betrouwbaarheidsniveau",
    "Een puntschatting is altijd juist, een intervalschatting bij benadering",
    "Een puntschatting hoort bij de populatie, terwijl een intervalschatting enkel iets zegt over de steekproef die je getrokken hebt"
   ],
   "a": 1,
   "u": "Een puntschatting is een enkele waarde, bijvoorbeeld het steekproefgemiddelde als schatting van mu. Een betrouwbaarheidsinterval geeft er een marge bij en zegt hoe vaak die methode de parameter vangt."
  },
  {
   "h": "h8",
   "q": "Welke drie kwaliteitseisen stelt men aan een goede schatter?",
   "o": [
    "Groot, aselect en zonder uitschieters",
    "Discreet, continu en lineair",
    "Zuiver, efficient en consistent",
    "Normaal, symmetrisch en robuust"
   ],
   "a": 2,
   "u": "Zuiver: gemiddeld gelijk aan de parameter. Efficient: zo klein mogelijke standaardfout. Consistent: bij grotere n komt de schatter dichter bij de echte waarde. Consequent is geen statistische eigenschap."
  },
  {
   "h": "h8",
   "q": "Welke schatter is efficienter wanneer twee schatters allebei zuiver zijn?",
   "o": [
    "Die met de grootste verwachting",
    "Die op de mediaan is gebaseerd",
    "Die met de grootste steekproef",
    "Die met de kleinste standaardfout"
   ],
   "a": 3,
   "u": "Bij gelijke zuiverheid kijk je naar de spreiding: hoe kleiner de standaardfout, hoe minder de schatting van steekproef tot steekproef zwalkt."
  },
  {
   "h": "h8",
   "q": "Waarom deel je bij de steekproefvariantie door n min 1 en niet door n?",
   "o": [
    "Omdat delen door n een onzuivere schatter van sigma kwadraat oplevert",
    "Omdat de steekproef altijd te klein is",
    "Omdat de mediaan anders verschuift",
    "Omdat de berekening met n min 1 in de praktijk eenvoudiger uit te voeren is"
   ],
   "a": 0,
   "u": "Delen door n onderschat de populatievariantie systematisch, want je meet afwijkingen ten opzichte van het steekproefgemiddelde zelf. Delen door n min 1 herstelt die vertekening."
  },
  {
   "h": "h8",
   "q": "Waaruit bestaat een betrouwbaarheidsinterval altijd?",
   "o": [
    "Uit het populatiegemiddelde plus of min de standaarddeviatie",
    "Uit de schatting plus of min de foutmarge",
    "Uit de kleinste en de grootste waarneming",
    "Uit de p-waarde en het significantieniveau"
   ],
   "a": 1,
   "u": "De algemene vorm is schatting plus of min foutmarge. Bij een gemiddelde met gekende sigma is die foutmarge gelijk aan z-ster maal sigma gedeeld door de wortel uit n."
  },
  {
   "h": "h8",
   "q": "Bij 500 leerlingen is het gemiddelde 461 en is sigma gelijk aan 100. De standaardfout is dan ongeveer 4,5. Hoe luidt het 95 procent betrouwbaarheidsinterval bij benadering?",
   "o": [
    "Van 459 tot 463",
    "Van 456,5 tot 465,5",
    "Van 452 tot 470",
    "Van 361 tot 561"
   ],
   "a": 2,
   "u": "Bij 95 procent hoort ongeveer twee standaardfouten: 2 x 4,5 = 9. Het interval loopt dus van 461 min 9 tot 461 plus 9."
  },
  {
   "h": "h8",
   "q": "Wat betekent een betrouwbaarheidsniveau van 95 procent precies?",
   "o": [
    "Dat 95 procent van alle waarnemingen in de steekproef netjes binnen het interval valt",
    "Dat de schatting in 95 procent van de gevallen exact klopt",
    "Dat de kans 95 procent is dat mu in dit ene interval ligt",
    "Dat 95 procent van alle mogelijke steekproeven een interval oplevert dat mu bevat"
   ],
   "a": 3,
   "u": "Het niveau slaat op de methode, niet op dit ene interval. Mu ligt er wel of niet in, dus over een concreet interval mag je geen kansuitspraak doen."
  },
  {
   "h": "h8",
   "q": "Welke formulering is fout bij een 95 procent betrouwbaarheidsinterval van 39,02 tot 40,98?",
   "o": [
    "De kans dat mu tussen 39,02 en 40,98 ligt bedraagt 95 procent",
    "Op basis van deze steekproef schatten we mu tussen 39,02 en 40,98",
    "Bij herhaald steekproeven zou 5 procent van de intervallen mu missen",
    "De gevolgde methode vangt mu in 95 procent van alle mogelijke steekproeven"
   ],
   "a": 0,
   "u": "Mu is een vaste, onbekende waarde en niet toevallig. Zodra het interval berekend is, ligt mu erin of niet, en dan hoort er geen kans meer bij."
  },
  {
   "h": "h8",
   "q": "Je verkleint de steekproef van n = 100 naar n = 25. Wat gebeurt er met de breedte van het betrouwbaarheidsinterval?",
   "o": [
    "Ze blijft gelijk",
    "Ze verdubbelt",
    "Ze wordt vier keer groter",
    "Ze halveert"
   ],
   "a": 1,
   "u": "De foutmarge hangt af van de wortel uit n. Deel je n door vier, dan wordt de wortel gehalveerd en verdubbelt de foutmarge."
  },
  {
   "h": "h8",
   "q": "Wat moet je doen om een betrouwbaarheidsinterval te halveren?",
   "o": [
    "Sigma halveren, wat altijd mogelijk is",
    "De steekproefgrootte verdubbelen",
    "De steekproefgrootte verviervoudigen",
    "Het betrouwbaarheidsniveau verdubbelen"
   ],
   "a": 2,
   "u": "Omdat de wortel uit n in de noemer staat, moet n vier keer groter om de marge te halveren. Meer precisie kost dus snel veel extra deelnemers."
  },
  {
   "h": "h8",
   "q": "Je wil mu schatten met een foutmarge van hoogstens 5 punten en 95 procent betrouwbaarheid, met sigma = 100. Hoeveel deelnemers heb je minstens nodig?",
   "o": [
    "2500",
    "Dat hangt af van de populatiegrootte N",
    "400",
    "1537"
   ],
   "a": 3,
   "u": "n is minstens (1,96 x 100 gedeeld door 5) in het kwadraat, dus 1536,6, wat je naar boven afrondt tot 1537. De grootte van de populatie speelt hierbij geen rol."
  },
  {
   "h": "h8",
   "q": "Welke maatregel maakt een betrouwbaarheidsinterval NIET smaller?",
   "o": [
    "Een grotere populatie bestuderen",
    "Een grotere steekproef nemen",
    "Een lager betrouwbaarheidsniveau kiezen",
    "De spreiding sigma verkleinen door betere meetprocedures"
   ],
   "a": 0,
   "u": "De formule bevat n, sigma en z-ster, maar niet de populatiegrootte N. Een grotere populatie verandert dus niets aan de precisie."
  },
  {
   "h": "h8",
   "q": "Onder welke voorwaarden gelden de klassieke formules voor een betrouwbaarheidsinterval voor mu?",
   "o": [
    "Bij elke steekproef, zolang n groter is dan 10",
    "Bij een enkelvoudige aselecte steekproef, met een gekende sigma en zonder grote vertekening",
    "Enkel bij een volledige populatie",
    "Enkel wanneer het waargenomen steekproefgemiddelde samenvalt met de mediaan van de verdeling"
   ],
   "a": 1,
   "u": "De werkhypothesen zijn streng: een EAS, geen non-respons, een normaal verdeelde variabele en een gekende sigma. Bij ad-hocsteekproeven met onbekende vertekening bestaat er geen correcte inferentie."
  },
  {
   "h": "h8",
   "q": "Waarom is het gemiddelde een gevoelige basis voor een betrouwbaarheidsinterval?",
   "o": [
    "Omdat het enkel bij discrete variabelen bestaat",
    "Omdat het niet zuiver is",
    "Omdat het niet robuust is voor uitschieters",
    "Omdat het altijd kleiner is dan de mediaan"
   ],
   "a": 2,
   "u": "Een enkele extreme waarde trekt het gemiddelde mee en verplaatst het hele interval. Bij kleine steekproeven worden de intervallen bovendien vaak te smal geschat."
  },
  {
   "h": "h8",
   "q": "Waarvoor dient bootstrapping?",
   "o": [
    "Om uitschieters te verwijderen",
    "Om sigma te vervangen door de mediaan",
    "Om de steekproef kunstmatig groter te maken dan de populatie waaruit ze getrokken werd, zodat de foutmarge daalt",
    "Om de steekproevenverdeling te benaderen door heel veel hersteekproeven met teruglegging uit de eigen steekproef"
   ],
   "a": 3,
   "u": "De klassieke formules veronderstellen normaliteit of een grote n. Bij kleine steekproeven uit niet-normale populaties kan je met duizend hersteekproeven de steekproevenverdeling nabootsen."
  },
  {
   "h": "h8",
   "q": "Welke eigenschap hoort NIET bij een goede schatter?",
   "o": [
    "Zuiver (onvertekend)",
    "Consistent",
    "Efficiënt",
    "Consequent"
   ],
   "a": 3,
   "u": "Een goede schatter is zuiver (gemiddeld correct), consistent (beter bij grotere n) en efficiënt (zo klein mogelijke variantie). 'Consequent' is geen statistische eigenschap, verwarring met 'consistent'."
  },
  {
   "h": "h9",
   "q": "Wat is het doel van een significantietoets?",
   "o": [
    "Nagaan hoe sterk de data pleiten tegen een bewering over een populatieparameter",
    "De grootte van een effect meten",
    "Een steekproef representatief maken",
    "Sluitend aantonen dat de nulhypothese in de bestudeerde populatie wel degelijk waar is"
   ],
   "a": 0,
   "u": "Een toets vergelijkt de waargenomen data met een claim. Het resultaat is een kans die aangeeft in welke mate de data met die claim te verzoenen zijn."
  },
  {
   "h": "h9",
   "q": "Welke hypothese wordt door de statistische toets zelf getoetst?",
   "o": [
    "De alternatieve hypothese",
    "De nulhypothese",
    "De rivale hypothese",
    "Beide tegelijk"
   ],
   "a": 1,
   "u": "De toets evalueert de sterkte van de evidentie tegen H0. De alternatieve hypothese is de bewering die je met je onderzoek net wil ondersteunen."
  },
  {
   "h": "h9",
   "q": "Een speler beweert 80 procent van zijn vrije worpen te scoren en haalt 32 op 50. Hoe luiden de hypothesen?",
   "o": [
    "H0: p = 0,80 en Ha: p verschillend van 0,64",
    "H0: p = 0,64 en Ha: p groter dan 0,64",
    "H0: p = 0,80 en Ha: p kleiner dan 0,80",
    "H0: p kleiner dan 0,80 en Ha: p = 0,80"
   ],
   "a": 2,
   "u": "De claim van de speler komt in H0. Omdat de steekproefproportie 0,64 lager ligt, toets je eenzijdig: Ha stelt dat de echte succeskans onder 0,80 ligt."
  },
  {
   "h": "h9",
   "q": "Wanneer gebruik je een tweezijdige alternatieve hypothese?",
   "o": [
    "Als de steekproef klein is",
    "Als sigma onbekend is",
    "Als de p-waarde groter uitvalt dan het gekozen significantieniveau",
    "Als je vooraf geen richting van het verschil vooropstelt"
   ],
   "a": 3,
   "u": "Eenzijdig toets je als je stelt dat de parameter groter of juist kleiner is. Weet je enkel dat er een verschil zou kunnen zijn, dan is Ha tweezijdig."
  },
  {
   "h": "h9",
   "q": "Wat drukt de z-toetsingsgrootheid uit?",
   "o": [
    "Hoeveel standaardfouten de schatter afwijkt van de waarde in H0",
    "De kans dat H0 waar is",
    "De grootte van het effect in de populatie",
    "Het aantal waarnemingen dat boven het steekproefgemiddelde uitkomt"
   ],
   "a": 0,
   "u": "z = (steekproefgemiddelde min mu0) gedeeld door de standaardfout. Grote absolute waarden betekenen dat de data slecht bij H0 passen."
  },
  {
   "h": "h9",
   "q": "Wat is de juiste definitie van de p-waarde?",
   "o": [
    "De kans dat de nulhypothese waar is",
    "De kans op een toetsingsgrootheid die minstens zo extreem is, als H0 waar zou zijn",
    "De kans dat je een fout besluit trekt",
    "Het significantieniveau dat de onderzoeker vooraf heeft vastgelegd voor deze toets"
   ],
   "a": 1,
   "u": "De p-waarde is een voorwaardelijke kans, berekend onder de veronderstelling dat H0 klopt. Ze zegt niets over de kans dat H0 zelf waar is."
  },
  {
   "h": "h9",
   "q": "Wat betekent een kleine p-waarde?",
   "o": [
    "Dat H0 met zekerheid onjuist is",
    "Dat het effect groot is",
    "Dat de data een resultaat opleveren dat uitzonderlijk zou zijn als H0 klopt",
    "Dat de steekproef wel groot genoeg was om het effect betrouwbaar op te pikken"
   ],
   "a": 2,
   "u": "Kleine p-waarden vormen sterke evidentie tegen H0, want het waargenomen resultaat past er slecht bij. Over de grootte van het effect zegt de p-waarde niets."
  },
  {
   "h": "h9",
   "q": "Bij 18 bandwerkers is het gemiddelde verschil 17 punten, met sigma = 60. Wat is de toetsingsgrootheid?",
   "o": [
    "z = 2,04",
    "z = 17,00",
    "z = 0,28",
    "z = 1,20"
   ],
   "a": 3,
   "u": "De standaardfout is 60 gedeeld door de wortel uit 18, dus ongeveer 14,14. z = 17 gedeeld door 14,14 = 1,20."
  },
  {
   "h": "h9",
   "q": "Bij die tweezijdige toets met z = 1,20 hoort een p-waarde van 0,2302. Wat besluit je?",
   "o": [
    "H0 kan niet verworpen worden, het resultaat is niet uitzonderlijk onder H0",
    "H0 wordt aanvaard, er is geen verschil",
    "Het onderzoek moet worden overgedaan met een eenzijdige toets en meer deelnemers",
    "H0 wordt verworpen, want 0,2302 is groter dan 0,05"
   ],
   "a": 0,
   "u": "Bij 23 procent kans op zo een resultaat onder H0 is er geen sterke evidentie tegen H0. Je besluit dat je H0 niet kan verwerpen, niet dat H0 juist is."
  },
  {
   "h": "h9",
   "q": "Waarom schrijf je nooit 'we aanvaarden H0'?",
   "o": [
    "Omdat H0 altijd fout is",
    "Omdat geen bewijs tegen H0 nog geen bewijs voor H0 is",
    "Omdat de nulhypothese enkel bij tweezijdige toetsen bestaat",
    "Omdat de p-waarde dan negatief zou zijn"
   ],
   "a": 1,
   "u": "Absence of evidence is not evidence of absence. Mogelijk was je steekproef te klein of je meetinstrument te ruw om een bestaand verschil op te pikken."
  },
  {
   "h": "h9",
   "q": "Wat is het significantieniveau alfa?",
   "o": [
    "Het getal dat je bekomt door de p-waarde van een af te trekken na afloop van de toets",
    "De kans dat H0 waar is",
    "De vooraf gekozen grens waaronder je de p-waarde klein genoeg vindt om H0 te verwerpen",
    "De kans op een grote steekproef"
   ],
   "a": 2,
   "u": "Alfa leg je vooraf vast, meestal op 0,05. Is p kleiner dan alfa, dan noem je het resultaat statistisch significant op dat niveau."
  },
  {
   "h": "h9",
   "q": "Welke volgorde hoort bij een significantietoets in vier stappen?",
   "o": [
    "Conclusie in APA-stijl, hypothesen, p-waarde, toetsingsgrootheid",
    "p-waarde, hypothesen, conclusie, toetsingsgrootheid",
    "Toetsingsgrootheid, hypothesen, conclusie, p-waarde",
    "Hypothesen, toetsingsgrootheid, p-waarde, conclusie in APA-stijl"
   ],
   "a": 3,
   "u": "Eerst formuleer je H0 en Ha, dan bereken je de toetsingsgrootheid, daarna de overschrijdingskans, en pas op het einde volgt de conclusie in de context van het onderzoek."
  },
  {
   "h": "h9",
   "q": "Welk verband bestaat er tussen een tweezijdige toets en een betrouwbaarheidsinterval?",
   "o": [
    "C is gelijk aan 1 min alfa, en beide gebruiken dezelfde grenzen rond een centrum",
    "Er bestaat geen verband tussen beide technieken",
    "Een toets werkt altijd op 99 procent, terwijl een interval altijd op 95 procent werkt",
    "Het interval ligt rond het steekproefgemiddelde, de toets ook"
   ],
   "a": 0,
   "u": "Een tweezijdige toets op niveau alfa lijkt op een betrouwbaarheidsinterval met niveau C = 1 min alfa, maar dan met de waarde uit H0 als centrum. Valt je resultaat buiten dat aanvaardingsinterval, dan verwerp je H0."
  },
  {
   "h": "h9",
   "q": "Een p-waarde zegt niet alles. Wat mis je als je enkel meldt dat p kleiner is dan 0,05?",
   "o": [
    "De steekproefgrootte",
    "Het interval van waarschijnlijke waarden voor mu",
    "De hypothesen waarop de hele analyse gebaseerd is",
    "Het significantieniveau"
   ],
   "a": 1,
   "u": "De p-waarde geeft alleen de sterkte van de evidentie tegen H0. Waar de parameter waarschijnlijk ligt, lees je pas af uit een betrouwbaarheidsinterval."
  },
  {
   "h": "h9",
   "q": "Wat zegt statistische significantie NIET?",
   "o": [
    "Dat de data slecht passen bij H0",
    "Dat het resultaat moeilijk door toeval alleen te verklaren is",
    "Hoe groot en hoe belangrijk het effect in de praktijk is",
    "Dat de p-waarde onder alfa ligt"
   ],
   "a": 2,
   "u": "Significantie gaat enkel over de vraag of er een effect is, niet hoe groot het is. Bij zeer grote steekproeven wordt ook een verwaarloosbaar effect significant."
  },
  {
   "h": "h9",
   "q": "Een medicijn verlaagt de lichaamstemperatuur betrouwbaar met 0,4 graden (p kleiner dan 0,01), terwijl klinisch minstens 1 graad nodig is. Hoe beoordeel je dat?",
   "o": [
    "Niet significant, dus zonder waarde",
    "Significant en dus klinisch bruikbaar",
    "De p-waarde moet groter zijn om iets te betekenen",
    "Statistisch significant, maar klinisch niet betekenisvol"
   ],
   "a": 3,
   "u": "De toets toont aan dat het effect niet louter toeval is, maar de effectgrootte blijft onder de drempel die in de praktijk telt. Significant en belangrijk zijn twee verschillende dingen."
  },
  {
   "h": "h9",
   "q": "Er wordt geen significant verschil gevonden tussen twee groepen. Wat mag je daaruit besluiten?",
   "o": [
    "Dat er in deze data onvoldoende bewijs is voor een verschil, meer niet",
    "Dat het verschil in werkelijkheid nul is",
    "Dat de nulhypothese bewezen is",
    "Dat beide groepen met zekerheid uit een en dezelfde populatie afkomstig zijn"
   ],
   "a": 0,
   "u": "Een niet-significant resultaat weerlegt H0 niet en bevestigt ze evenmin. Twee heel verschillende populaties kunnen bovendien toevallig gelijke wiskundige kenmerken hebben."
  },
  {
   "h": "h9",
   "q": "Hoe gaat APA om met de grens tussen significant en niet significant?",
   "o": [
    "Enkel p kleiner dan 0,05 telt als resultaat, en alle andere bevindingen worden uit het verslag geweerd zonder vermelding",
    "Significant vanaf p kleiner dan 0,05 en marginaal significant vanaf p kleiner dan 0,10, met vermelding van de precieze p-waarde",
    "Alles onder 0,20 mag significant genoemd worden",
    "De grens hangt af van de steekproefgrootte"
   ],
   "a": 1,
   "u": "Vage uitdrukkingen als 'vrij significant' of 'sterk significant' vermijd je beter. Hanteer de cutoff ook niet absoluut: 4,9 procent en 5,1 procent liggen dicht bij elkaar."
  },
  {
   "h": "h9",
   "q": "Waarom kan het bij een pilotstudie zinvol zijn om een hogere alfa te kiezen?",
   "o": [
    "Omdat de p-waarde dan kleiner wordt",
    "Om sneller klaar te zijn met de analyse",
    "Om bij kleine steekproeven geen interessante aanwijzingen over het hoofd te zien",
    "Omdat resultaten uit kleine steekproeven anders bijna nooit significant genoemd worden"
   ],
   "a": 2,
   "u": "Bij verkennend werk met weinig deelnemers is de kans groot dat een echt effect onder een strenge drempel blijft. De keuze van alfa hangt af van de gevolgen van een verkeerde beslissing."
  },
  {
   "h": "h9",
   "q": "Normaal geneest 50% na 3 maanden. Een therapeut beweert dat haar therapie beter werkt: 8 van haar 10 patiënten genazen. Hoe gaat ze na of dit significant is?",
   "o": [
    "Mét teruglegging modelleren met 2 'balletjes' (50/50, de populatie) en kijken hoe vaak je ≥ 8 haalt",
    "Zónder teruglegging modelleren met 10 balletjes die haar eigen patiënten voorstellen",
    "Gewoon aannemen dat het betrouwbaar is",
    "Kan niet, want minder dan 30 patiënten"
   ],
   "a": 0,
   "u": "Je simuleert onder H0 (p=0,5): trek mét teruglegging uit een model met 2 gelijke uitkomsten (genezen/niet), 10 keer, en kijk hoe vaak je ≥ 8 genezingen krijgt. Is dat zeldzaam (< 5%), dan is het significant."
  },
  {
   "h": "h9",
   "q": "Een steekproef geeft gemiddelde 33; populatiegemiddelde = 30; σ = 16; n = 64. Verschilt 33 significant van 30 (α = 10%, tweezijdig)?",
   "o": [
    "Niet-significant, z = 1,5, p = 0,1336",
    "Niet-significant, z = 1,5, p = 0,9839",
    "Significant, z = 2,5, p = 0,0124",
    "Significant, z = 1,5, p = 0,0062"
   ],
   "a": 0,
   "u": "Standaardfout = 16/√64 = 2. z = (33−30)/2 = 1,5. Tweezijdig: p = 2·P(Z>1,5) = 2·0,0668 = 0,1336 = 13,36% > 10% → niet significant."
  },
  {
   "h": "h9",
   "q": "Reactietijd: µ = 0,5 s, σ = 0,12 s. Een steekproef (n = 36) geeft gemiddeld 0,55 s. Reageren ze significant trager? (eenzijdig)",
   "o": [
    "Kan niet berekend worden",
    "Ja, significant trager, z = 2,5 (p = 0,0062)",
    "Nee, niet significant, z = 2,5 (p = 0,9475)",
    "Significant sneller, z = 2,5"
   ],
   "a": 1,
   "u": "Standaardfout = 0,12/√36 = 0,02. z = (0,55−0,5)/0,02 = 2,5. Eenzijdig p = P(Z>2,5) = 0,0062 < 5% → significant. 0,55 > 0,5 betekent een lángere reactietijd = trager."
  },
  {
   "h": "h9",
   "q": "Wanneer verwerp je de nulhypothese?",
   "o": [
    "Nooit",
    "Als p > α",
    "Als p ≤ α",
    "Altijd bij n ≥ 30"
   ],
   "a": 2,
   "u": "Is de p-waarde kleiner dan of gelijk aan het significantieniveau α (bv. 0,05), dan verwerp je H0: het resultaat is significant. Ezelsbruggetje: 'p klein → H0 weg'."
  },
  {
   "h": "h9",
   "q": "Wat is een Type I-fout?",
   "o": [
    "H0 behouden terwijl H0 fout is",
    "De steekproef te klein kiezen",
    "Een rekenfout maken",
    "H0 verwerpen terwijl H0 waar is"
   ],
   "a": 3,
   "u": "Type I (α) = je verwerpt H0 onterecht (vals alarm). Type II (β) = je behoudt H0 terwijl Ha waar is (een gemiste vondst)."
  },
  {
   "h": "h9",
   "q": "Een tweezijdige toets geeft een waargenomen z = 2,51 (significantieniveau α = 1%). Wat is de p-waarde en de conclusie?",
   "o": [
    "p = 0,006 → H0 verwerpen",
    "p = 0,012 → H0 verwerpen",
    "p = 0,06 → H0 niet verwerpen",
    "p = 0,012 → H0 niet verwerpen"
   ],
   "a": 3,
   "u": "Tweezijdig: p = 2·P(Z > 2,51) = 2·0,006 = 0,012. Vergelijk met α = 0,01: omdat 0,012 > 0,01 verwerp je H0 NIET (net niet significant)."
  },
  {
   "h": "h10",
   "q": "Je wil een csv-bestand met je data inlezen in SPSS. Waar begin je?",
   "o": [
    "File > Open > Data, en bij Files of type kies je Text",
    "Analyze > Descriptive Statistics > Frequencies",
    "Transform > Compute Variable",
    "Data > Select Cases"
   ],
   "a": 0,
   "u": "Inlezen doe je via File, Open, Data. Zet Files of type op Text, anders ziet SPSS je csv-bestand niet staan."
  },
  {
   "h": "h10",
   "q": "In stap 4 van de Import Wizard moet je twee dingen goed zetten. Welke?",
   "o": [
    "Het scheidingsteken, en of de eerste rij de variabelenamen bevat",
    "Het meetniveau en de labels van elke variabele",
    "Het aantal decimalen en de ontbrekende waarden",
    "De naam van het bestand en de map waarin het staat"
   ],
   "a": 0,
   "u": "Bij stap 4 vink je aan welk scheidingsteken gebruikt wordt, meestal komma of puntkomma, en geef je aan of de variabelenamen bovenaan staan."
  },
  {
   "h": "h10",
   "q": "Bij de laatste stap van de Import Wizard vraagt SPSS of je de syntax wil plakken. Waarom kies je Yes?",
   "o": [
    "Zodat je de actie later opnieuw kan uitvoeren via de Syntax Editor",
    "Omdat de data anders niet wordt ingelezen",
    "Omdat SPSS anders de variabelenamen weggooit",
    "Omdat je anders geen grafieken kan maken"
   ],
   "a": 0,
   "u": "Met de geplakte syntax kan je dezelfde bewerking later opnieuw draaien. Je selecteert ze en klikt op de groene Run-knop."
  },
  {
   "h": "h10",
   "q": "Wat mag je nooit gebruiken in de kolom Name van de Variable View?",
   "o": [
    "Spaties",
    "Hoofdletters",
    "Cijfers",
    "Afkortingen"
   ],
   "a": 0,
   "u": "Een spatie in Name geeft meteen foutmeldingen in SPSS. Gebruik bijvoorbeeld een liggend streepje of schrijf de naam aan elkaar."
  },
  {
   "h": "h10",
   "q": "Waarvoor dient de kolom Values in de Variable View?",
   "o": [
    "Om betekenis te geven aan getallen, bijvoorbeeld 1 = man en 2 = vrouw",
    "Om te bepalen hoeveel decimalen getoond worden",
    "Om aan te geven welke waarden ontbrekend zijn",
    "Om het meetniveau van de variabele vast te leggen"
   ],
   "a": 0,
   "u": "Bij Values koppel je een label aan een getal. Dat is vooral belangrijk bij binaire en categorische variabelen, anders staan er in je output alleen kale cijfers."
  },
  {
   "h": "h10",
   "q": "Je codeert ontbrekende antwoorden als 999. Wat doe je in SPSS zodat die niet meetellen?",
   "o": [
    "Bij Missing kiezen voor Discrete missing values en 999 invoeren",
    "De rijen met 999 handmatig verwijderen uit de Data View",
    "Bij Values het label ontbrekend toekennen aan 999",
    "Bij Measure het meetniveau op Nominal zetten"
   ],
   "a": 0,
   "u": "Via de kolom Missing geef je aan welke codes als ontbrekend behandeld worden. Doe je dat niet, dan telt SPSS 999 gewoon mee in het gemiddelde."
  },
  {
   "h": "h10",
   "q": "Een variabele meet tevredenheid van 1 is helemaal oneens tot 5 is helemaal eens. Wat zet je in de kolom Measure?",
   "o": [
    "Ordinal",
    "Scale",
    "Nominal",
    "Ratio"
   ],
   "a": 0,
   "u": "Een Likertschaal heeft een duidelijke ordening maar geen gelijke afstanden, dus ordinaal. Scale is voor interval- en rationiveau."
  },
  {
   "h": "h10",
   "q": "Je vraagt beschrijvende maten op voor de nominale variabele afdeling. Wat vink je aan bij Frequencies > Statistics?",
   "o": [
    "Enkel Mode",
    "Mean en Std. deviation",
    "Median en Quartiles",
    "Minimum en Maximum"
   ],
   "a": 0,
   "u": "Bij nominaal niveau mag je alleen de modus rapporteren. Een gemiddelde of spreidingsmaat heeft daar geen betekenis."
  },
  {
   "h": "h10",
   "q": "Voor een ordinale variabele vraag je de vijf-getallensamenvatting op. Wat vink je aan?",
   "o": [
    "Mode en Median, plus Quartiles en Minimum en Maximum",
    "Enkel Mean en Std. deviation",
    "Enkel Mode",
    "Skewness en Kurtosis"
   ],
   "a": 0,
   "u": "Vanaf ordinaal niveau mag je modus, mediaan en kwartielen gebruiken. Samen met minimum en maximum heb je de vijf-getallensamenvatting."
  },
  {
   "h": "h10",
   "q": "SPSS berekent probleemloos een gemiddelde voor een nominale variabele als je het aanvinkt. Waarom doe je dat toch niet?",
   "o": [
    "Het is methodologisch fout en levert puntenaftrek op",
    "SPSS geeft dan altijd een foutmelding in de output",
    "Het gemiddelde wordt dan verkeerd berekend door het programma",
    "Het mag wel, zolang je het maar niet rapporteert"
   ],
   "a": 0,
   "u": "Het programma controleert je meetniveau niet. Het rekent gewoon, ook als de uitkomst inhoudelijk nergens op slaat. Die controle moet jij zelf doen."
  },
  {
   "h": "h10",
   "q": "In je output staat een scheefheid van g1 = 0,84. Hoe beschrijf je die verdeling?",
   "o": [
    "Rechts-scheef, met de staart naar rechts en de meeste waarnemingen links",
    "Links-scheef, met de staart naar links",
    "Symmetrisch, want de waarde ligt dicht bij nul",
    "Leptokurtisch, dus gepiekter dan normaal"
   ],
   "a": 0,
   "u": "Een positieve g1 betekent rechts-scheef: de staart loopt naar rechts en het gros van de waarnemingen ligt links."
  },
  {
   "h": "h10",
   "q": "Je vindt een gepiektheid van g2 = -1,20. Wat betekent dat?",
   "o": [
    "Platykurtisch, dus platter met dunnere staarten dan de normaalverdeling",
    "Leptokurtisch, dus steiler met dikkere staarten",
    "Mesokurtisch, dus een perfecte klokvorm",
    "Links-scheef verdeeld"
   ],
   "a": 0,
   "u": "Een negatieve g2 wijst op een plattere verdeling dan de normaalverdeling. Positief is juist steiler en gepiekter."
  },
  {
   "h": "h10",
   "q": "Een vraag gaat enkel over militairen die minstens 15 scoorden op de posttest. Wat doe je eerst?",
   "o": [
    "Data > Select Cases, optie If condition is satisfied, en dan post >= 15",
    "Transform > Recode into Different Variables",
    "De rijen met een lagere score verwijderen uit de Data View",
    "Analyze > Compare Means > One-Sample T Test"
   ],
   "a": 0,
   "u": "Met Select Cases filter je op een voorwaarde. In de Data View zie je daarna schuine strepen door de rijnummers die niet meedoen."
  },
  {
   "h": "h10",
   "q": "Je filtert op een tekstwaarde, bijvoorbeeld de provincie Antwerpen. Hoe typ je die voorwaarde?",
   "o": [
    "provincie = 'Antwerpen', dus de waarde tussen aanhalingstekens",
    "provincie = Antwerpen, zonder aanhalingstekens",
    "provincie >= Antwerpen",
    "provincie CONTAINS Antwerpen"
   ],
   "a": 0,
   "u": "Kwalitatieve of tekstcriteria zet je tussen enkele of dubbele aanhalingstekens. Bij getallen doe je dat juist niet."
  },
  {
   "h": "h10",
   "q": "Je wil enkel de Franstalige sergeanten selecteren, dus taal gelijk aan 2 en graad gelijk aan 3. Wat typ je?",
   "o": [
    "(taal = 2) & (graad = 3)",
    "(taal = 2) | (graad = 3)",
    "taal = 2 OF graad = 3",
    "taal en graad = 2 en 3"
   ],
   "a": 0,
   "u": "Het teken & staat voor EN, het teken | voor OF. Haakjes bepalen de volgorde, dus zet je voorwaarden er netjes tussen."
  },
  {
   "h": "h10",
   "q": "Wat moet je absoluut doen nadat je een analyse op een gefilterde subgroep hebt uitgevoerd?",
   "o": [
    "De filter meteen uitzetten via Select Cases en All cases",
    "Het databestand opnieuw inlezen",
    "De output opslaan voor je verder gaat",
    "De variabele opnieuw hercoderen"
   ],
   "a": 0,
   "u": "Een actieve filter blijft staan. Vergeet je hem uit te zetten, dan zijn al je volgende opgaven op de gefilterde groep berekend en dus fout."
  },
  {
   "h": "h10",
   "q": "Waarom kies je Recode into Different Variables en niet Recode into Same Variables?",
   "o": [
    "Om je originele data niet te overschrijven",
    "Omdat Same Variables geen labels ondersteunt",
    "Omdat Same Variables alleen bij nominale variabelen werkt",
    "Omdat je anders geen syntax kan plakken"
   ],
   "a": 0,
   "u": "Hercodeer altijd naar een nieuwe variabele. Overschrijf je de originele kolom, dan ben je je ruwe data kwijt en kan je niets meer controleren."
  },
  {
   "h": "h10",
   "q": "Je wil alle scores van 15 tot en met de hoogste in één nieuwe categorie stoppen. Welke optie kies je bij Old and New Values?",
   "o": [
    "Range, value through HIGHEST",
    "Range, LOWEST through value",
    "All other values",
    "System-missing"
   ],
   "a": 0,
   "u": "Range, value through HIGHEST vangt alles vanaf een bepaalde waarde tot het maximum. De tegenhanger LOWEST through value doet hetzelfde aan de onderkant."
  },
  {
   "h": "h10",
   "q": "In je bestand staan push-ups per minuut, maar je hebt het aantal per tien seconden nodig. Wat doe je?",
   "o": [
    "Transform > Compute Variable, met als expressie push / 6",
    "Transform > Recode into Different Variables",
    "Data > Select Cases met push / 6",
    "Analyze > Descriptives met de optie Divide"
   ],
   "a": 0,
   "u": "Een nieuwe variabele bereken je met Compute Variable. Een minuut telt zes keer tien seconden, dus deel je door zes."
  },
  {
   "h": "h10",
   "q": "Je wil per respondent het gemiddelde over item1 tot en met item10 berekenen. Wat typ je bij Numeric Expression?",
   "o": [
    "MEAN(item1 to item10)",
    "SUM(item1 to item10)",
    "AVERAGE(item1 : item10)",
    "MEAN(item1 + item10)"
   ],
   "a": 0,
   "u": "De functie MEAN met het woordje to pakt de hele reeks in één keer. Je kan de items ook los opsommen met komma's."
  },
  {
   "h": "h10",
   "q": "Waar vind je in deze cursus de klassieke grafiekfuncties?",
   "o": [
    "Graphs > Legacy Dialogs",
    "Analyze > Descriptive Statistics",
    "Transform > Visual Binning",
    "Graphs > Chart Builder"
   ],
   "a": 0,
   "u": "In deze cursus werk je met Legacy Dialogs. Titels en labels voeg je achteraf toe door in de output op de grafiek te dubbelklikken, dat opent de Chart Editor."
  },
  {
   "h": "h10",
   "q": "Je wil de verdeling van graad tonen, opgesplitst per geslacht, met de staafjes naast elkaar. Welk type staafdiagram kies je?",
   "o": [
    "Clustered",
    "Simple",
    "Stacked",
    "Pie"
   ],
   "a": 0,
   "u": "Clustered zet de staafjes van de subgroepen naast elkaar. Stacked stapelt ze binnen één staaf, en Simple toont maar één variabele."
  },
  {
   "h": "h10",
   "q": "Voor welk soort variabele mag je een histogram gebruiken?",
   "o": [
    "Uitsluitend voor continue kwantitatieve variabelen op interval- of rationiveau",
    "Voor elke variabele, ongeacht het meetniveau",
    "Enkel voor nominale variabelen",
    "Vanaf ordinaal niveau"
   ],
   "a": 0,
   "u": "Een histogram hoort bij continue data, daarom plakken de staven aan elkaar. Voor categorische variabelen gebruik je een staaf- of cirkeldiagram."
  },
  {
   "h": "h10",
   "q": "Je maakt een scatterplot om te onderzoeken of gewicht de lichaamslengte voorspelt. Wat zet je op de Y-as?",
   "o": [
    "Lichaamslengte, want dat is de verklaarde variabele",
    "Gewicht, want dat is de verklarende variabele",
    "Dat maakt niet uit voor een scatterplot",
    "Beide variabelen, elk op een eigen as naar keuze"
   ],
   "a": 0,
   "u": "Op de Y-as staat de variabele die voorspeld wordt, op de X-as de verklarende variabele. De onderzoeksvraag bepaalt dus welke waar komt."
  },
  {
   "h": "h10",
   "q": "Hoe voeg je de regressierechte toe aan een scatterplot?",
   "o": [
    "Dubbelklikken op de grafiek en in de Chart Editor kiezen voor Add Fit Line at Total",
    "Bij het maken van de scatterplot de optie Regression aanvinken",
    "Via Analyze > Regression > Linear met de optie Plot",
    "Dat kan niet in SPSS, dat teken je zelf"
   ],
   "a": 0,
   "u": "De rechte voeg je achteraf toe in de Chart Editor. SPSS tekent dan meteen de lijn met de bijhorende formule erbij."
  },
  {
   "h": "h10",
   "q": "Je gooit zes keer met een toestel dat in 70 procent van de gevallen lukt. Hoe bereken je de kans op precies drie keer succes?",
   "o": [
    "PDF.BINOM(3, 6, 0.7)",
    "CDF.BINOM(3, 6, 0.7)",
    "1 - CDF.BINOM(3, 6, 0.7)",
    "IDF.BINOM(3, 6, 0.7)"
   ],
   "a": 0,
   "u": "PDF geeft de kans op exact dat aantal successen. CDF is cumulatief en telt alles tot en met dat aantal op."
  },
  {
   "h": "h10",
   "q": "Bij dezelfde binomiale verdeling wil je de kans op minder dan drie successen. Wat typ je?",
   "o": [
    "CDF.BINOM(2, 6, 0.7)",
    "CDF.BINOM(3, 6, 0.7)",
    "PDF.BINOM(2, 6, 0.7)",
    "1 - CDF.BINOM(3, 6, 0.7)"
   ],
   "a": 0,
   "u": "Aantallen zijn discreet, dus minder dan drie is hetzelfde als hoogstens twee. Daarom vul je k min 1 in."
  },
  {
   "h": "h10",
   "q": "En de kans op minstens drie successen?",
   "o": [
    "1 - CDF.BINOM(2, 6, 0.7)",
    "1 - CDF.BINOM(3, 6, 0.7)",
    "CDF.BINOM(3, 6, 0.7)",
    "PDF.BINOM(3, 6, 0.7)"
   ],
   "a": 0,
   "u": "Minstens drie is het complement van hoogstens twee. Je trekt dus de cumulatieve kans tot en met k min 1 af van één."
  },
  {
   "h": "h10",
   "q": "Scores zijn normaal verdeeld met gemiddelde 75 en standaardafwijking 8. Hoe bereken je de kans op een score tussen 55 en 85?",
   "o": [
    "CDF.NORMAL(85, 75, 8) - CDF.NORMAL(55, 75, 8)",
    "CDF.NORMAL(85, 75, 8) + CDF.NORMAL(55, 75, 8)",
    "PDF.NORMAL(85, 75, 8) - PDF.NORMAL(55, 75, 8)",
    "IDF.NORMAL(0.85, 75, 8) - IDF.NORMAL(0.55, 75, 8)"
   ],
   "a": 0,
   "u": "De oppervlakte tussen twee grenzen krijg je door de cumulatieve kans tot de bovengrens te verminderen met die tot de ondergrens."
  },
  {
   "h": "h10",
   "q": "Bij diezelfde verdeling wil je weten onder welke score de laagste 5 procent valt. Wat gebruik je?",
   "o": [
    "IDF.NORMAL(0.05, 75, 8)",
    "CDF.NORMAL(0.05, 75, 8)",
    "PDF.NORMAL(0.05, 75, 8)",
    "1 - CDF.NORMAL(0.05, 75, 8)"
   ],
   "a": 0,
   "u": "IDF is de inverse functie: je geeft een kans en krijgt de bijhorende grenswaarde terug. Voor de hoogste 5 procent vul je 0.95 in."
  },
  {
   "h": "h10",
   "q": "Waarom is PDF.NORMAL bij een continue verdeling geen kans?",
   "o": [
    "Omdat de kans op exact één waarde bij een continue verdeling altijd nul is, het is een dichtheid",
    "Omdat SPSS die functie alleen voor discrete verdelingen kan gebruiken",
    "Omdat de uitkomst altijd groter is dan één",
    "Omdat je daarvoor eerst moet standaardiseren"
   ],
   "a": 0,
   "u": "PDF geeft bij een continue verdeling de hoogte van de klokcurve, niet een kans. Kansen lees je af als oppervlakten, dus via CDF."
  },
  {
   "h": "h10",
   "q": "Je onderzoekt de samenhang tussen twee nominale variabelen. Welke procedure gebruik je?",
   "o": [
    "Analyze > Descriptive Statistics > Crosstabs, met Chi-square en eventueel Lambda",
    "Analyze > Correlate > Bivariate met Pearson",
    "Analyze > Regression > Linear",
    "Analyze > Compare Means > One-Way ANOVA"
   ],
   "a": 0,
   "u": "Twee nominale variabelen zet je in een kruistabel. Chi-kwadraat toetst de afhankelijkheid, lambda geeft de proportionele foutenreductie."
  },
  {
   "h": "h10",
   "q": "Eén variabele is ordinaal, de andere op rationiveau. Wat vink je aan bij Correlate > Bivariate?",
   "o": [
    "Spearman en Kendall's tau-b, en Pearson uit",
    "Enkel Pearson",
    "Pearson en Spearman samen",
    "Chi-square"
   ],
   "a": 0,
   "u": "Zodra één van beide ordinaal is, werk je met rangcorrelaties. Pearson veronderstelt dat beide variabelen minstens intervalniveau hebben."
  },
  {
   "h": "h10",
   "q": "Hoe stel je in SPSS een betrouwbaarheidsinterval op voor een populatiegemiddelde?",
   "o": [
    "Analyze > Compare Means > One-Sample T Test, en het niveau instellen bij Options",
    "Analyze > Descriptive Statistics > Descriptives",
    "Analyze > Regression > Linear met de optie Save",
    "Analyze > Nonparametric Tests > 1-Sample K-S"
   ],
   "a": 0,
   "u": "De One-Sample T Test geeft in de output de onder- en bovengrens onder de kolom Confidence Interval of the Difference."
  },
  {
   "h": "h10",
   "q": "Voor een ANOVA moet je eerst de normaliteit per groep controleren. Hoe doe je dat?",
   "o": [
    "Analyze > Descriptive Statistics > Explore, met bij Plots de optie Normality plots with tests",
    "Analyze > Compare Means > One-Way ANOVA met de optie Descriptive",
    "Analyze > Correlate > Bivariate",
    "Graphs > Legacy Dialogs > Histogram per groep"
   ],
   "a": 0,
   "u": "Via Explore zet je de afhankelijke variabele bij Dependent List en de groepsvariabele bij Factor List. Met Normality plots with tests krijg je Kolmogorov-Smirnov en Shapiro-Wilk per groep."
  },
  {
   "h": "h10",
   "q": "In de tabel Tests of Normality staat bij elke groep een p-waarde boven 0,05. Wat besluit je?",
   "o": [
    "De normaliteitsveronderstelling mag aangenomen worden",
    "De verdeling wijkt significant af van normaal",
    "De groepen hebben een gelijke variantie",
    "De ANOVA mag zeker niet uitgevoerd worden"
   ],
   "a": 0,
   "u": "Een p-waarde groter dan alfa betekent dat de verdeling niet significant afwijkt van de normaalverdeling. Je mag dus van normaliteit uitgaan."
  },
  {
   "h": "h10",
   "q": "Je wil de gemiddelden van een continue variabele vergelijken tussen vier onafhankelijke groepen. Welke procedure?",
   "o": [
    "Analyze > Compare Means > One-Way ANOVA",
    "Analyze > Compare Means > One-Sample T Test",
    "Analyze > Correlate > Bivariate",
    "Analyze > Descriptive Statistics > Crosstabs"
   ],
   "a": 0,
   "u": "Vanaf drie of meer onafhankelijke groepen gebruik je een one-way ANOVA. Bij Options vink je Descriptive en Means plot aan."
  },
  {
   "h": "h10",
   "q": "Je wil met de 1-Sample K-S toetsen tegen een normaalverdeling met mu 1500 en sigma 500. Hoe doe je dat?",
   "o": [
    "In de syntax de regel aanpassen naar /K-S(NORMAL, 1500, 500) = variabele",
    "In het venster de waarden invullen bij Test Distribution",
    "Eerst de variabele standaardiseren via Compute",
    "Dat kan niet, SPSS gebruikt altijd het steekproefgemiddelde"
   ],
   "a": 0,
   "u": "Vooropgestelde parameters kan je niet in het venster kwijt. Je plakt de syntax en typt de twee waarden er zelf achter NORMAL bij."
  },
  {
   "h": "h10",
   "q": "Je wil nagaan of de categorieën van jobcategorie gelijkmatig verdeeld zijn. Welke toets en welke instelling?",
   "o": [
    "Nonparametric Tests > Chi-square, met All categories equal",
    "Crosstabs met Chi-square",
    "One-Way ANOVA met Descriptive",
    "1-Sample K-S met Test Distribution Normal"
   ],
   "a": 0,
   "u": "De aanpassingstoets vergelijkt waargenomen met verwachte frequenties. All categories equal toetst op een uniforme verdeling, met Values vul je eigen verwachtingen in."
  },
  {
   "h": "h10",
   "q": "Je hebt een lineaire regressie gedraaid. Waar lees je de determinatiecoëfficiënt af?",
   "o": [
    "In de tabel Model Summary, onder R Square",
    "In de tabel Model Summary, onder R",
    "In de tabel Coefficients, onder B",
    "In de tabel ANOVA, onder Sig."
   ],
   "a": 0,
   "u": "Onder R staat de correlatiecoëfficiënt, onder R Square de proportie verklaarde variantie."
  },
  {
   "h": "h10",
   "q": "In de tabel Coefficients staat bij (Constant) de waarde 11,048 en bij gewicht 1,859. Wat is de regressievergelijking?",
   "o": [
    "Lengte = 11,048 + 1,859 maal gewicht",
    "Lengte = 1,859 + 11,048 maal gewicht",
    "Lengte = 11,048 maal 1,859 maal gewicht",
    "Gewicht = 11,048 + 1,859 maal lengte"
   ],
   "a": 0,
   "u": "De waarde bij (Constant) is b0, het snijpunt met de Y-as. De waarde bij de onafhankelijke variabele is b1, de helling."
  },
  {
   "h": "h10",
   "q": "Jonathan weegt 100 kg. Hoe bereken je zijn voorspelde lengte met bovenstaand model?",
   "o": [
    "Transform > Compute Variable met de expressie 11.048 + (1.859 * 100)",
    "Data > Select Cases met gewicht = 100",
    "Analyze > Descriptives op de variabele gewicht",
    "Dat kan alleen als 100 kg in de dataset voorkomt"
   ],
   "a": 0,
   "u": "Je vult het getal in de regressieformule in en laat SPSS rekenen. Het kan ook via Regression > Save met Unstandardized predicted values."
  },
  {
   "h": "h10",
   "q": "Je hebt onderaan in de Data View een extra regel toegevoegd om een voorspelling te laten berekenen. Wat doe je daarna?",
   "o": [
    "Die regel meteen wissen, zodat de dataset niet vervuild raakt",
    "De regel laten staan als bewijs van je berekening",
    "Het bestand onder een nieuwe naam opslaan met die regel erin",
    "De regel omzetten naar een missing value"
   ],
   "a": 0,
   "u": "Een extra case verandert je aantallen en dus al je volgende resultaten. Klik met de rechtermuisknop op het rijnummer en kies Clear."
  },
  {
   "h": "h10",
   "q": "Wat zijn de vier kernstappen bij een SPSS-examenvraag?",
   "o": [
    "Kies altijd eerst een grafiek, daarna de variabelen en ten slotte het meetniveau.",
    "Bepaal het meetniveau, kies de analyse/grafiek, voer de SPSS-stappen uit en interpreteer.",
    "Kies eerst een p-waarde, maak een tabel, bepaal daarna het meetniveau en interpreteer.",
    "Open eerst Descriptives, verwijder missings, maak een grafiek en bereken het gemiddelde."
   ],
   "a": 1,
   "u": "Altijd in deze volgorde werken. Begin je met de knoppen in plaats van met het meetniveau, dan kies je vaak een methode die niet mag."
  },
  {
   "h": "h10",
   "q": "Wat onderstreep je eerst in de vraag?",
   "o": [
    "CDF.NORMAL(x,mu,sigma); bij een continue verdeling maakt < of ≤ geen verschil.",
    "q = .90, niet .10.",
    "Of gevraagd wordt naar een aantal, percentage, verband, verdeling, vijf-getallensamenvatting of kans.",
    "PDF.BINOM(k,n,p)."
   ],
   "a": 2,
   "u": "De vraagsoort bepaalt je hele aanpak. Een aantal vraagt om Frequencies, een verband om een associatiemaat, een kans om een van de kansfuncties."
  },
  {
   "h": "h10",
   "q": "Welke richtingwoorden moet je altijd controleren?",
   "o": [
    "Een kruistabel met Chi-kwadraat, omdat één variabele nominaal is.",
    "Aantal; percentage inclusief missings; percentage zonder missings; oplopend geldig percentage.",
    "Voorwaardelijk op de rijvariabele; elke rij telt op tot 100%.",
    "Exact, hoogstens, minstens, meer dan, tussen en laagste/hoogste."
   ],
   "a": 3,
   "u": "Die woordjes bepalen of je met CDF, met 1 min CDF of met een verschil van twee CDF's rekent. Ze lezen scheelt punten."
  },
  {
   "h": "h10",
   "q": "Wat is een nominale variabele?",
   "o": [
    "Categorieën met een volgorde, zoals laag/midden/hoog of een Likertschaal; de afstanden hoeven niet gelijk te zijn.",
    "Een numerieke variabele met gelijke afstanden en een echt nulpunt, zoals inkomen, gewicht of leeftijd.",
    "Categorieën zonder volgorde, zoals geslacht, continent of kustlijn ja/nee. Cijfers kunnen alleen codes zijn.",
    "Nominal, Ordinal en Scale."
   ],
   "a": 2,
   "u": "Geen volgorde, dus je mag enkel tellen. Een gemiddelde van geslacht of continent betekent niets, ook al rekent SPSS het uit."
  },
  {
   "h": "h10",
   "q": "Wat is een ordinale variabele?",
   "o": [
    "SPSS zet numerieke categoriecodes vaak automatisch op Scale en voorkomt dus geen methodologische fout.",
    "Een numerieke variabele met gelijke afstanden maar zonder absoluut nulpunt.",
    "Nominal, Ordinal en Scale.",
    "Categorieën met een volgorde, zoals laag/midden/hoog of een Likertschaal; de afstanden hoeven niet gelijk te zijn."
   ],
   "a": 3,
   "u": "Er zit wel een volgorde in, maar de stappen zijn niet even groot. Daarom mag je de mediaan gebruiken en het gemiddelde niet."
  },
  {
   "h": "h10",
   "q": "Wat is een intervalvariabele?",
   "o": [
    "Een numerieke variabele met gelijke afstanden en een echt nulpunt, zoals inkomen, gewicht of leeftijd.",
    "SPSS zet numerieke categoriecodes vaak automatisch op Scale en voorkomt dus geen methodologische fout.",
    "Een numerieke variabele met gelijke afstanden maar zonder absoluut nulpunt.",
    "Categorieën zonder volgorde, zoals geslacht, continent of kustlijn ja/nee. Cijfers kunnen alleen codes zijn."
   ],
   "a": 2,
   "u": "Gelijke afstanden, maar geen echt nulpunt. Temperatuur in graden Celsius is het schoolvoorbeeld: twintig graden is niet dubbel zo warm als tien."
  },
  {
   "h": "h10",
   "q": "Wat is een ratiovariabele?",
   "o": [
    "Categorieën zonder volgorde, zoals geslacht, continent of kustlijn ja/nee. Cijfers kunnen alleen codes zijn.",
    "Een numerieke variabele met gelijke afstanden maar zonder absoluut nulpunt.",
    "Een numerieke variabele met gelijke afstanden en een echt nulpunt, zoals inkomen, gewicht of leeftijd.",
    "Nominal, Ordinal en Scale."
   ],
   "a": 2,
   "u": "Zelfde als interval, maar met een echt nulpunt. Daardoor mag je hier wel zeggen dat iets dubbel zoveel is."
  },
  {
   "h": "h10",
   "q": "Welke SPSS Measure kies je voor nominaal, ordinaal en interval/ratio?",
   "o": [
    "Scale, Nominal en Ordinal",
    "Ordinal, Scale en Nominal",
    "Nominal, Scale en Scale",
    "Nominal, Ordinal en Scale"
   ],
   "a": 3,
   "u": "Onthoud de koppeling: nominaal wordt Nominal, ordinaal wordt Ordinal, en zowel interval als ratio worden Scale."
  },
  {
   "h": "h10",
   "q": "Waarom mag je niet blind vertrouwen op de Measure die SPSS automatisch kiest?",
   "o": [
    "SPSS zet numerieke categoriecodes vaak automatisch op Scale en voorkomt dus geen methodologische fout.",
    "Nominal, Ordinal en Scale.",
    "Categorieën met een volgorde, zoals laag/midden/hoog of een Likertschaal; de afstanden hoeven niet gelijk te zijn.",
    "Een numerieke variabele met gelijke afstanden en een echt nulpunt, zoals inkomen, gewicht of leeftijd."
   ],
   "a": 0,
   "u": "Het programma ziet alleen cijfers, niet wat ze betekenen. Codes als 1 en 2 voor geslacht belanden zo op Scale, en dan staat de deur open voor een fout gemiddelde."
  },
  {
   "h": "h10",
   "q": "Welke maat kies je voor nominaal + minstens nominaal?",
   "o": [
    "Spearman of Kendall",
    "Lineaire regressie",
    "Chi-kwadraat",
    "Pearson r"
   ],
   "a": 2,
   "u": "Zodra één van beide variabelen nominaal is, werk je met een kruistabel en de chi-kwadraattoets."
  },
  {
   "h": "h10",
   "q": "Wat rapporteer je voor Chi-kwadraat in Statistiek II?",
   "o": [
    "Pearson r via Analyze > Correlate > Bivariate > Pearson.",
    "De waarde van Pearson Chi-Square onder Value; de significantie hoef je volgens de afbakening niet te interpreteren.",
    "Chi-kwadraat via Analyze > Descriptive Statistics > Crosstabs > Statistics > Chi-square.",
    "De afhankelijke variabele op Y en de verklarende variabele op X."
   ],
   "a": 1,
   "u": "Je leest de waarde af bij Pearson Chi-Square onder Value. Het interpreteren van de significantie hoort volgens de afbakening bij Statistiek III."
  },
  {
   "h": "h10",
   "q": "Welke maat kies je voor nominaal + nominaal als je voorspelfouten wilt verminderen?",
   "o": [
    "Pearson r",
    "R²",
    "Lambda",
    "Chi-kwadraat"
   ],
   "a": 2,
   "u": "Lambda meet de proportionele foutenreductie: hoeveel minder voorspelfouten je maakt als je de andere variabele kent."
  },
  {
   "h": "h10",
   "q": "Welke Lambda-waarde lees je af?",
   "o": [
    "Een kruistabel met Chi-kwadraat, omdat één variabele nominaal is.",
    "Om met twee scale-variabelen Y te voorspellen uit X: Analyze > Regression > Linear.",
    "Nee. Dezelfde correlatie staat gespiegeld in de tabel.",
    "De rij/richting waarbij de juiste afhankelijke of voorspelde variabele wordt voorspeld."
   ],
   "a": 3,
   "u": "Lambda is richtingsgevoelig. Kijk dus welke variabele voorspeld wordt en neem de rij die daarbij hoort."
  },
  {
   "h": "h10",
   "q": "Welke maat kies je voor ordinaal + minstens ordinaal?",
   "o": [
    "Spearman of Kendall",
    "Pearson r",
    "Chi-kwadraat",
    "Lineaire regressie"
   ],
   "a": 0,
   "u": "Vanaf ordinaal niveau werk je met rangcorrelaties, dus Spearman of Kendall. Pearson veronderstelt minstens intervalniveau."
  },
  {
   "h": "h10",
   "q": "Verandert Spearman of Kendall als je de volgorde van de variabelen omdraait?",
   "o": [
    "De afhankelijke variabele op Y en de verklarende variabele op X.",
    "Pearson r via Analyze > Correlate > Bivariate > Pearson.",
    "Nee. Dezelfde correlatie staat gespiegeld in de tabel.",
    "Chi-kwadraat via Analyze > Descriptive Statistics > Crosstabs > Statistics > Chi-square."
   ],
   "a": 2,
   "u": "De correlatiematrix is symmetrisch, dus dezelfde waarde staat gewoon aan de andere kant van de diagonaal."
  },
  {
   "h": "h10",
   "q": "Welke maat kies je voor twee interval- of ratiovariabelen?",
   "o": [
    "Pearson r",
    "Lambda",
    "Chi-kwadraat",
    "Kendall uitsluitend"
   ],
   "a": 0,
   "u": "Pearson r hoort bij twee kwantitatieve variabelen op interval- of rationiveau."
  },
  {
   "h": "h10",
   "q": "Wanneer kies je lineaire regressie?",
   "o": [
    "Pearson r via Analyze > Correlate > Bivariate > Pearson.",
    "Spearman of Kendall via Analyze > Correlate > Bivariate.",
    "Lambda via Crosstabs > Statistics > Lambda.",
    "Om met twee scale-variabelen Y te voorspellen uit X: Analyze > Regression > Linear."
   ],
   "a": 3,
   "u": "Regressie gebruik je om te voorspellen, niet alleen om samenhang te tonen. Beide variabelen moeten daarvoor op Scale staan."
  },
  {
   "h": "h10",
   "q": "Waar zet je de variabelen bij lineaire regressie?",
   "o": [
    "De afhankelijke variabele op Y en de verklarende variabele op X.",
    "Pearson r via Analyze > Correlate > Bivariate > Pearson.",
    "Spearman of Kendall via Analyze > Correlate > Bivariate.",
    "Lambda via Crosstabs > Statistics > Lambda."
   ],
   "a": 0,
   "u": "De onderzoeksvraag bepaalt wat je voorspelt. Wat voorspeld wordt is de afhankelijke variabele en gaat naar Dependent, de verklarende naar Independent."
  },
  {
   "h": "h10",
   "q": "BNP per capita is ratio en continent is nominaal. Welke methode kies je?",
   "o": [
    "Pearson r",
    "Spearman",
    "Lineaire regressie",
    "Een kruistabel met Chi-kwadraat"
   ],
   "a": 3,
   "u": "Het laagste meetniveau bepaalt wat mag. Zodra één variabele nominaal is, val je terug op een kruistabel met chi-kwadraat."
  },
  {
   "h": "h10",
   "q": "Wat staat in Variable View?",
   "o": [
    "System-missing.",
    "Maak per antwoordmogelijkheid een aparte binaire ja/nee-variabele.",
    "Labels maken output leesbaar; Value Labels vertalen codes, bijvoorbeeld 1 = man en 2 = vrouw.",
    "Elke rij is één variabele; belangrijke velden zijn Name, Type, Label, Values, Missing en Measure."
   ],
   "a": 3,
   "u": "Hier beschrijf je je variabelen, je ziet er geen data. Elke rij is één variabele met haar naam, label, waardelabels en meetniveau."
  },
  {
   "h": "h10",
   "q": "Wat staat in Data View?",
   "o": [
    "System-missing.",
    "Elke kolom is één variabele en elke rij één respondent of waarneming.",
    "Labels maken output leesbaar; Value Labels vertalen codes, bijvoorbeeld 1 = man en 2 = vrouw.",
    "Elke rij is één variabele; belangrijke velden zijn Name, Type, Label, Values, Missing en Measure."
   ],
   "a": 1,
   "u": "Hier staan de echte gegevens: kolommen zijn variabelen, rijen zijn respondenten. Verwar dit niet met Variable View."
  },
  {
   "h": "h10",
   "q": "Waarvoor dienen Labels en Value Labels?",
   "o": [
    "System-missing.",
    "Maak per antwoordmogelijkheid een aparte binaire ja/nee-variabele.",
    "Labels maken output leesbaar; Value Labels vertalen codes, bijvoorbeeld 1 = man en 2 = vrouw.",
    "Elke rij is één variabele; belangrijke velden zijn Name, Type, Label, Values, Missing en Measure."
   ],
   "a": 2,
   "u": "Zonder labels staan er in je output kale cijfers. Met labels leest je tabel meteen als man en vrouw in plaats van 1 en 2."
  },
  {
   "h": "h10",
   "q": "Hoe voer je een multiple-responsevraag in?",
   "o": [
    "System-missing.",
    "Maak per antwoordmogelijkheid een aparte binaire ja/nee-variabele.",
    "Elke kolom is één variabele en elke rij één respondent of waarneming.",
    "Elke rij is één variabele; belangrijke velden zijn Name, Type, Label, Values, Missing en Measure."
   ],
   "a": 1,
   "u": "Iemand kan meerdere antwoorden aankruisen, dus dat past niet in één kolom. Je maakt per optie een ja of nee variabele."
  },
  {
   "h": "h10",
   "q": "Wat betekent een punt in SPSS-data?",
   "o": [
    "Maak per antwoordmogelijkheid een aparte binaire ja/nee-variabele.",
    "Labels maken output leesbaar; Value Labels vertalen codes, bijvoorbeeld 1 = man en 2 = vrouw.",
    "System-missing.",
    "Elke rij is één variabele; belangrijke velden zijn Name, Type, Label, Values, Missing en Measure."
   ],
   "a": 2,
   "u": "Een punt in een cel betekent system-missing: er staat geen waarde ingevuld en SPSS telt die case niet mee."
  },
  {
   "h": "h10",
   "q": "Wanneer gebruik je Frequencies?",
   "o": [
    "De Count in de gevraagde kruising.",
    "Meetniveaus → methode; CDF = links; binomiaal minstens k = 1-CDF(k-1); boxplot groups of cases + Category Axis; filters met haakjes.",
    "Categorieën met een volgorde, zoals laag/midden/hoog of een Likertschaal; de afstanden hoeven niet gelijk te zijn.",
    "Voor de verdeling van een categorische of discrete variabele: Analyze > Descriptive Statistics > Frequencies."
   ],
   "a": 3,
   "u": "Frequencies geeft je de tabel met aantallen en percentages per categorie, precies wat je nodig hebt bij een categorische variabele."
  },
  {
   "h": "h10",
   "q": "Wat betekenen Frequency, Percent, Valid Percent en Cumulative Percent?",
   "o": [
    "Lambda via Crosstabs > Statistics > Lambda.",
    "Een kruistabel met Chi-kwadraat, omdat één variabele nominaal is.",
    "Via Options.",
    "Aantal; percentage inclusief missings; percentage zonder missings; oplopend geldig percentage."
   ],
   "a": 3,
   "u": "Het verschil zit in de missings: Percent telt ze mee, Valid Percent niet. Cumulative Percent telt de percentages op naarmate je zakt."
  },
  {
   "h": "h10",
   "q": "Wanneer gebruik je Valid Percent in plaats van Percent?",
   "o": [
    "Bij weinig categorieën, meestal twee; N of cases voor aantallen en % of cases voor percentages.",
    "Een scatterplot met X = verklarende variabele en Y = verklaarde variabele.",
    "Wanneer er missende waarden zijn en je het percentage onder de geldige antwoorden bedoelt.",
    "Om categorieën samen te voegen zonder de originele variabele te overschrijven."
   ],
   "a": 2,
   "u": "Vraagt de opgave naar het percentage van wie geantwoord heeft, dan neem je Valid Percent. Anders vertekenen de missings je antwoord."
  },
  {
   "h": "h10",
   "q": "Wanneer gebruik je Descriptives?",
   "o": [
    "Om een numerieke variabele samen te vatten met N, minimum, maximum, gemiddelde en standaardafwijking.",
    "g2 < -1: platykurtisch; -1 t/m 1: mesokurtisch; g2 > 1: leptokurtisch.",
    "Via Options.",
    "g1 < -0,5: links scheef; -0,5 t/m 0,5: vrij symmetrisch; g1 > 0,5: rechts scheef."
   ],
   "a": 0,
   "u": "Descriptives is de snelste weg naar de kengetallen van een kwantitatieve variabele. Voor percentielen gebruik je Frequencies."
  },
  {
   "h": "h10",
   "q": "Waar vind je skewness en kurtosis bij Descriptives?",
   "o": [
    "Via Options.",
    "Om een numerieke variabele samen te vatten met N, minimum, maximum, gemiddelde en standaardafwijking.",
    "g1 < -0,5: links scheef; -0,5 t/m 0,5: vrij symmetrisch; g1 > 0,5: rechts scheef.",
    "g2 < -1: platykurtisch; -1 t/m 1: mesokurtisch; g2 > 1: leptokurtisch."
   ],
   "a": 0,
   "u": "De vormmaten staan niet standaard aan. Je vinkt ze aan achter de knop Options."
  },
  {
   "h": "h10",
   "q": "Hoe interpreteer je g1 in deze cursus?",
   "o": [
    "Om een numerieke variabele samen te vatten met N, minimum, maximum, gemiddelde en standaardafwijking.",
    "Via Options.",
    "g2 < -1: platykurtisch; -1 t/m 1: mesokurtisch; g2 > 1: leptokurtisch.",
    "g1 < -0,5: links scheef; -0,5 t/m 0,5: vrij symmetrisch; g1 > 0,5: rechts scheef."
   ],
   "a": 3,
   "u": "Het teken geeft de richting van de staart. Tussen min een half en een half noem je de verdeling vrij symmetrisch."
  },
  {
   "h": "h10",
   "q": "Hoe interpreteer je g2 in deze cursus?",
   "o": [
    "g1 < -0,5: links scheef; -0,5 t/m 0,5: vrij symmetrisch; g1 > 0,5: rechts scheef.",
    "Om een numerieke variabele samen te vatten met N, minimum, maximum, gemiddelde en standaardafwijking.",
    "g2 < -1: platykurtisch; -1 t/m 1: mesokurtisch; g2 > 1: leptokurtisch.",
    "Via Options."
   ],
   "a": 2,
   "u": "Positief is gepiekter dan normaal, negatief platter. Tussen min één en één spreek je van mesokurtisch, dus klokvormig."
  },
  {
   "h": "h10",
   "q": "Waar maak je een kruistabel?",
   "o": [
    "Voorwaardelijk op de rijvariabele; elke rij telt op tot 100%.",
    "Voorwaardelijk op de kolomvariabele; elke kolom telt op tot 100%.",
    "Het percentage in de volledige steekproef; alle cellen samen tellen op tot 100%.",
    "Analyze > Descriptive Statistics > Crosstabs."
   ],
   "a": 3,
   "u": "Crosstabs zit onder Descriptive Statistics. Daar vind je ook de knoppen voor chi-kwadraat en de percentages."
  },
  {
   "h": "h10",
   "q": "Wat betekent Row %?",
   "o": [
    "Percentage van de volledige steekproef; alle cellen tellen samen op tot 100%.",
    "Het absolute aantal in elke cel.",
    "Voorwaardelijk op de rijvariabele; elke rij telt op tot 100%.",
    "Voorwaardelijk op de kolomvariabele; elke kolom telt op tot 100%."
   ],
   "a": 2,
   "u": "Je deelt door het rijtotaal, dus je kijkt binnen elke rij. Handig als de rijvariabele de voorwaarde is."
  },
  {
   "h": "h10",
   "q": "Wat betekent Column %?",
   "o": [
    "Voorwaardelijk op de kolomvariabele; elke kolom telt op tot 100%.",
    "Voorwaardelijk op de rijvariabele; elke rij telt op tot 100%.",
    "Percentage inclusief missende waarden.",
    "Het absolute aantal in elke cel."
   ],
   "a": 0,
   "u": "Je deelt door het kolomtotaal, dus je kijkt binnen elke kolom. Handig als de kolomvariabele de voorwaarde is."
  },
  {
   "h": "h10",
   "q": "Wat betekent Total %?",
   "o": [
    "Percentage in de volledige steekproef; alle cellen samen tellen op tot 100%.",
    "Voorwaardelijk op de rijvariabele.",
    "Voorwaardelijk op de kolomvariabele.",
    "Oplopend geldig percentage."
   ],
   "a": 0,
   "u": "Hier deel je door het totaal van iedereen. Alle cellen samen komen dan op honderd procent uit."
  },
  {
   "h": "h10",
   "q": "Wat betekent Count?",
   "o": [
    "De variabele na “gegeven” of “onder de” is de voorwaarde. Staat ze in kolommen, kies Column %; staat ze in rijen, kies Row %.",
    "Column %, want vrouw is de voorwaarde.",
    "De absolute frequentie: het werkelijke aantal in een cel.",
    "Het percentage in de volledige steekproef; alle cellen samen tellen op tot 100%."
   ],
   "a": 2,
   "u": "Count is gewoon het aantal personen in die cel, zonder omrekening naar percentages."
  },
  {
   "h": "h10",
   "q": "Hoe kies je tussen Row % en Column %?",
   "o": [
    "De absolute frequentie: het werkelijke aantal in een cel.",
    "De variabele na “gegeven” of “onder de” is de voorwaarde. Staat ze in kolommen, kies Column %; staat ze in rijen, kies Row %.",
    "Voorwaardelijk op de kolomvariabele; elke kolom telt op tot 100%.",
    "Het percentage in de volledige steekproef; alle cellen samen tellen op tot 100%."
   ],
   "a": 1,
   "u": "Zoek in de vraag het woordje gegeven, onder of van. Wat daarna komt is de groep waarbinnen je moet rekenen."
  },
  {
   "h": "h10",
   "q": "Welk percentage kies je voor “welk percentage vrouwen is akkoord?” als geslacht in de kolommen staat?",
   "o": [
    "Analyze > Descriptive Statistics > Crosstabs.",
    "Column %, want vrouw is de voorwaarde.",
    "De absolute frequentie: het werkelijke aantal in een cel.",
    "De variabele na “gegeven” of “onder de” is de voorwaarde. Staat ze in kolommen, kies Column %; staat ze in rijen, kies Row %."
   ],
   "a": 1,
   "u": "Je rekent binnen de vrouwen, en die staan in een kolom. Dus deel je door het kolomtotaal."
  },
  {
   "h": "h10",
   "q": "Wat betekenen &, | en ~= in een filter?",
   "o": [
    "OF, EN en gelijk aan",
    "EN, niet gelijk aan en OF",
    "Groeperen, EN en OF",
    "EN, OF en niet gelijk aan"
   ],
   "a": 3,
   "u": "Het teken & staat voor EN, het teken | voor OF, en ~= voor niet gelijk aan."
  },
  {
   "h": "h10",
   "q": "Schrijf: Europa of Noord-Amerika én laag of zeer laag.",
   "o": [
    "continent = 2 | continent = 4 & inkomen = 1 | inkomen = 2",
    "(continent = 2 & continent = 4) | (inkomen = 1 & inkomen = 2)",
    "(continent = 2 | continent = 4) | (inkomen = 1 | inkomen = 2)",
    "(continent = 2 | continent = 4) & (inkomen = 1 | inkomen = 2)"
   ],
   "a": 3,
   "u": "Zet elk stuk van de zin tussen haakjes: eerst de twee continenten met OF, dan de twee inkomensgroepen met OF, en die twee groepen verbind je met EN."
  },
  {
   "h": "h10",
   "q": "Wanneer gebruik je Compute Variable?",
   "o": [
    "Het berekent per respondent het gemiddelde van de geselecteerde Likertitems.",
    "Voor een nieuwe variabele op basis van een formule of voorwaarde: Transform > Compute Variable.",
    "Om categorieën samen te voegen zonder de originele variabele te overschrijven.",
    "Compute bijvoorbeeld antwoord = (inkomen = 2 & regio = 4), vraag Frequencies op en lees Frequency bij antwoord = 1."
   ],
   "a": 1,
   "u": "Compute maakt een nieuwe variabele uit een berekening of voorwaarde. Voor het hergroeperen van categorieën gebruik je Recode."
  },
  {
   "h": "h10",
   "q": "Wanneer gebruik je Recode into Different Variables?",
   "o": [
    "Om categorieën samen te voegen zonder de originele variabele te overschrijven.",
    "Om een formule of gemiddelde te berekenen.",
    "Om cases tijdelijk te filteren.",
    "Om de originele waarden rechtstreeks te overschrijven."
   ],
   "a": 0,
   "u": "Recode groepeert bestaande waarden opnieuw. Door naar een nieuwe variabele te schrijven houd je je ruwe data intact."
  },
  {
   "h": "h10",
   "q": "Waarom vermijd je Recode into Same Variables?",
   "o": [
    "Omdat SPSS dan alle missings verwijdert.",
    "Omdat de nieuwe variabele altijd nominaal wordt.",
    "Omdat je de originele waarden overschrijft.",
    "Omdat je geen categorieën kunt samenvoegen."
   ],
   "a": 2,
   "u": "Dan ben je je oorspronkelijke waarden kwijt en kan je niets meer controleren of terugdraaien."
  },
  {
   "h": "h10",
   "q": "Hoe maak je een indicatorvariabele voor een aantal?",
   "o": [
    "Compute bijvoorbeeld antwoord = (inkomen = 2 & regio = 4), vraag Frequencies op en lees Frequency bij antwoord = 1.",
    "Alles ≤ de grens; alles ≥ de grens; alle overige waarden.",
    "Voor een nieuwe variabele op basis van een formule of voorwaarde: Transform > Compute Variable.",
    "Omdat je de originele waarden overschrijft."
   ],
   "a": 0,
   "u": "De uitdrukking levert per persoon 1 op als de voorwaarde klopt en anders 0. In de frequentietabel lees je bij 1 meteen het aantal af."
  },
  {
   "h": "h10",
   "q": "Wat betekenen LOWEST through value, value through HIGHEST en All other values bij Recode?",
   "o": [
    "Compute bijvoorbeeld antwoord = (inkomen = 2 & regio = 4), vraag Frequencies op en lees Frequency bij antwoord = 1.",
    "Voor een nieuwe variabele op basis van een formule of voorwaarde: Transform > Compute Variable.",
    "Alles ≤ de grens; alles ≥ de grens; alle overige waarden.",
    "Om categorieën samen te voegen zonder de originele variabele te overschrijven."
   ],
   "a": 2,
   "u": "Met die drie vang je de onderkant, de bovenkant en alle resterende waarden op, zonder elke waarde apart in te typen."
  },
  {
   "h": "h10",
   "q": "Wat doet MEAN(item1, item3 TO item7, item9)?",
   "o": [
    "Alles ≤ de grens; alles ≥ de grens; alle overige waarden.",
    "Om categorieën samen te voegen zonder de originele variabele te overschrijven.",
    "Compute bijvoorbeeld antwoord = (inkomen = 2 & regio = 4), vraag Frequencies op en lees Frequency bij antwoord = 1.",
    "Het berekent per respondent het gemiddelde van de geselecteerde Likertitems."
   ],
   "a": 3,
   "u": "MEAN rekent per rij, dus per respondent. Met TO pak je een hele reeks items in één keer mee."
  },
  {
   "h": "h10",
   "q": "Welke grafiek kies je voor frequenties van een nominale of ordinale variabele?",
   "o": [
    "Graphs > Boxplot > Simple > Summaries for groups of cases; Variable = numerieke variabele en Category Axis = groepsvariabele.",
    "Een staafdiagram.",
    "Een histogram; de balken sluiten aan bij continue data.",
    "Dubbelklik op de outputgrafiek; sluit met het kruisje. Wijzigingen verschijnen automatisch in Output."
   ],
   "a": 1,
   "u": "Categorieën staan los van elkaar, dus staven met ruimte ertussen. Een histogram zou hier ten onrechte continuïteit suggereren."
  },
  {
   "h": "h10",
   "q": "Wat is het verschil tussen Simple, Clustered en Stacked bij een staafdiagram?",
   "o": [
    "Een scatterplot met X = verklarende variabele en Y = verklaarde variabele.",
    "Een boxplot: minimum, Q1, mediaan, Q3, maximum en uitschieters.",
    "Een staafdiagram.",
    "Simple = één variabele; Clustered = subgroepen als aparte staven; Stacked = subgroepen in dezelfde staaf."
   ],
   "a": 3,
   "u": "Clustered zet de subgroepen naast elkaar, Stacked stapelt ze in dezelfde staaf. Simple toont maar één variabele."
  },
  {
   "h": "h10",
   "q": "Wanneer gebruik je een taartdiagram?",
   "o": [
    "Een scatterplot met X = verklarende variabele en Y = verklaarde variabele.",
    "Bij weinig categorieën, meestal twee; N of cases voor aantallen en % of cases voor percentages.",
    "Graphs > Boxplot > Simple > Summaries for groups of cases; Variable = numerieke variabele en Category Axis = groepsvariabele.",
    "Simple = één variabele; Clustered = subgroepen als aparte staven; Stacked = subgroepen in dezelfde staaf."
   ],
   "a": 1,
   "u": "Een taart werkt alleen bij weinig categorieën. Kies zelf of je aantallen of percentages toont."
  },
  {
   "h": "h10",
   "q": "Welke grafiek kies je voor de verdeling van een interval- of ratiovariabele?",
   "o": [
    "Staafdiagram",
    "Taartdiagram",
    "Kruistabel",
    "Histogram"
   ],
   "a": 3,
   "u": "Een histogram hoort bij continue data. De staven raken elkaar, precies om dat continue karakter te tonen."
  },
  {
   "h": "h10",
   "q": "Wat doet Panel by?",
   "o": [
    "Simple = één variabele; Clustered = subgroepen als aparte staven; Stacked = subgroepen in dezelfde staaf.",
    "Een scatterplot met X = verklarende variabele en Y = verklaarde variabele.",
    "Een boxplot: minimum, Q1, mediaan, Q3, maximum en uitschieters.",
    "Het maakt afzonderlijke subgrafieken, niet één gezamenlijke verdeling."
   ],
   "a": 3,
   "u": "Panel by splitst je grafiek op in aparte deelgrafieken per groep. Wil je alles in één beeld, gebruik het dan niet."
  },
  {
   "h": "h10",
   "q": "Welke grafiek toont de vijf-getallensamenvatting en uitschieters?",
   "o": [
    "Scatterplot",
    "Clustered bar chart",
    "Boxplot",
    "Histogram"
   ],
   "a": 2,
   "u": "De boxplot toont minimum, Q1, mediaan, Q3 en maximum, plus de punten die als uitschieter buiten de snorharen vallen."
  },
  {
   "h": "h10",
   "q": "Welke boxplotinstelling gebruik je voor één numerieke variabele tussen groepen met dezelfde y-as?",
   "o": [
    "Clustered > Summaries for groups; groep bij Column(s).",
    "Twee aparte boxplots met elk een eigen y-as.",
    "Simple > Summaries for groups of cases; numeriek bij Variable en groep bij Category Axis.",
    "Simple > Summaries of separate variables; groep bij Boxes Represent."
   ],
   "a": 2,
   "u": "Groups of cases vergelijkt één variabele over groepen heen. De groepsvariabele hoort daarbij op Category Axis."
  },
  {
   "h": "h10",
   "q": "Welke boxplotinstelling gebruik je voor verschillende numerieke variabelen naast elkaar?",
   "o": [
    "Een scatterplot met X = verklarende variabele en Y = verklaarde variabele.",
    "Het maakt afzonderlijke subgrafieken, niet één gezamenlijke verdeling.",
    "Simple > Summaries of separate variables; Boxes Represent = de numerieke variabelen.",
    "Simple = één variabele; Clustered = subgroepen als aparte staven; Stacked = subgroepen in dezelfde staaf."
   ],
   "a": 2,
   "u": "Separate variables zet meerdere variabelen naast elkaar in één beeld, elk met een eigen boxplot."
  },
  {
   "h": "h10",
   "q": "Waarom is Column(s) fout om groepen te maken in een groups-of-cases-boxplot?",
   "o": [
    "De groepen horen op Category Axis.",
    "Simple > Summaries of separate variables; Boxes Represent = de numerieke variabelen.",
    "Een histogram; de balken sluiten aan bij continue data.",
    "Titel, astitel, category label, datalabels/frequenties, kleuren, asschaal en een regressierechte."
   ],
   "a": 0,
   "u": "Column is bedoeld om je grafiek op te splitsen in panelen. De groepen zelf horen op de categorieas."
  },
  {
   "h": "h10",
   "q": "Welke grafiek kies je voor samenhang tussen twee scale-variabelen?",
   "o": [
    "Histogram",
    "Scatterplot",
    "Boxplot",
    "Taartdiagram"
   ],
   "a": 1,
   "u": "Een puntenwolk laat de vorm van het verband zien, en dat is precies wat je wil weten voor je een correlatie berekent."
  },
  {
   "h": "h10",
   "q": "Hoe open en sluit je Chart Editor?",
   "o": [
    "Simple = één variabele; Clustered = subgroepen als aparte staven; Stacked = subgroepen in dezelfde staaf.",
    "De groepen horen op Category Axis.",
    "Dubbelklik op de outputgrafiek; sluit met het kruisje. Wijzigingen verschijnen automatisch in Output.",
    "Een boxplot: minimum, Q1, mediaan, Q3, maximum en uitschieters."
   ],
   "a": 2,
   "u": "Je bewerkt een grafiek nooit in de opdracht zelf, maar achteraf in de output. Wat je daar aanpast, staat meteen in je resultaat."
  },
  {
   "h": "h10",
   "q": "Wat kun je in Chart Editor aanpassen?",
   "o": [
    "De groepen horen op Category Axis.",
    "Titel, astitel, category label, datalabels/frequenties, kleuren, asschaal en een regressierechte.",
    "Een boxplot: minimum, Q1, mediaan, Q3, maximum en uitschieters.",
    "Simple = één variabele; Clustered = subgroepen als aparte staven; Stacked = subgroepen in dezelfde staaf."
   ],
   "a": 1,
   "u": "Titels en labels horen erbij op het examen. Ook de regressierechte voeg je hier toe, niet bij het maken van de grafiek."
  },
  {
   "h": "h10",
   "q": "Wat geeft PDF.BINOM(k,n,p)?",
   "o": [
    "P(X = k)",
    "P(X ≤ k)",
    "P(X ≥ k)",
    "De grensscore bij cumulatieve kans q"
   ],
   "a": 0,
   "u": "PDF geeft de kans op exact dat aantal successen. CDF telt op tot en met dat aantal."
  },
  {
   "h": "h10",
   "q": "Wat geeft CDF.BINOM(k,n,p)?",
   "o": [
    "De dichtheid bij k",
    "P(X ≤ k)",
    "P(X = k)",
    "P(X > k)"
   ],
   "a": 1,
   "u": "CDF is cumulatief: het telt alle kansen op tot en met k."
  },
  {
   "h": "h10",
   "q": "Wat geeft PDF.NORMAL(x,mu,sigma)?",
   "o": [
    "De dichtheid f(x), niet de kans P(X=x).",
    "P(X ≤ x)",
    "P(X ≥ x)",
    "De grens x waarvoor P(X≤x)=q"
   ],
   "a": 0,
   "u": "Bij een continue verdeling is de kans op precies één waarde nul. PDF geeft dus enkel de hoogte van de kromme."
  },
  {
   "h": "h10",
   "q": "Wat geeft CDF.NORMAL(x,mu,sigma)?",
   "o": [
    "De hoogte van de normale curve zonder oppervlakte",
    "P(X ≤ x)",
    "P(X = x)",
    "P(X > x)"
   ],
   "a": 1,
   "u": "CDF geeft altijd de oppervlakte links van de grens, dus de kans op hoogstens x."
  },
  {
   "h": "h10",
   "q": "Wat geeft IDF.NORMAL(q,mu,sigma)?",
   "o": [
    "De grens x waarvoor P(X≤x)=q.",
    "De kans P(X≤q).",
    "De dichtheid bij q.",
    "De kans rechts van q."
   ],
   "a": 0,
   "u": "IDF is de omgekeerde functie: je geeft een kans en krijgt de bijhorende grenswaarde terug."
  },
  {
   "h": "h10",
   "q": "Wat is de hoofdregel voor CDF?",
   "o": [
    "q = .05.",
    "De grens x waarvoor P(X≤x)=q; hiermee zoek je een percentiel of grensscore.",
    "Omdat k zelf moet meetellen; je trekt alleen de kansen tot en met k-1 af.",
    "CDF geeft de kans links van de grens; voor rechts gebruik je 1 - CDF."
   ],
   "a": 3,
   "u": "Onthoud dit als CDF is links. Alles wat rechts ligt bereken je als één min de cumulatieve kans."
  },
  {
   "h": "h10",
   "q": "Hoe bereken je binomiaal exact k?",
   "o": [
    "CDF geeft de kans links van de grens; voor rechts gebruik je 1 - CDF.",
    "PDF.BINOM(k,n,p).",
    "Omdat k zelf moet meetellen; je trekt alleen de kansen tot en met k-1 af.",
    "q = .95, want onder de grens ligt 95%."
   ],
   "a": 1,
   "u": "Exact k successen is de kansdichtheid op dat ene punt, dus PDF."
  },
  {
   "h": "h10",
   "q": "Hoe bereken je binomiaal hoogstens k?",
   "o": [
    "CDF.BINOM(k,n,p).",
    "Alleen wanneer je een discrete verdeling benadert met een normaalverdeling.",
    "P(X ≤ x): de oppervlakte links van x.",
    "CDF.BINOM(b) - CDF.BINOM(a-1)."
   ],
   "a": 0,
   "u": "Hoogstens k betekent alles tot en met k, en dat is precies wat CDF geeft."
  },
  {
   "h": "h10",
   "q": "Hoe bereken je binomiaal minder dan k?",
   "o": [
    "1 - CDF.BINOM(k,n,p)",
    "PDF.BINOM(k-1,n,p)",
    "CDF.BINOM(k-1,n,p)",
    "CDF.BINOM(k,n,p)"
   ],
   "a": 2,
   "u": "Aantallen zijn discreet, dus minder dan k is hetzelfde als hoogstens k min 1."
  },
  {
   "h": "h10",
   "q": "Hoe bereken je binomiaal meer dan k?",
   "o": [
    "1 - CDF.BINOM(k,n,p)",
    "1 - CDF.BINOM(k-1,n,p)",
    "CDF.BINOM(k-1,n,p)",
    "PDF.BINOM(k,n,p)"
   ],
   "a": 0,
   "u": "Meer dan k is het complement van hoogstens k, dus één min de cumulatieve kans tot en met k."
  },
  {
   "h": "h10",
   "q": "Hoe bereken je binomiaal minstens k?",
   "o": [
    "PDF.BINOM(k-1,n,p)",
    "1 - CDF.BINOM(k-1,n,p)",
    "1 - CDF.BINOM(k,n,p)",
    "CDF.BINOM(k,n,p)"
   ],
   "a": 1,
   "u": "Minstens k is het complement van hoogstens k min 1. Let op dat k zelf moet meetellen."
  },
  {
   "h": "h10",
   "q": "Hoe bereken je binomiaal tussen a en b, inclusief?",
   "o": [
    "PDF.BINOM(b) - PDF.BINOM(a-1)",
    "CDF.BINOM(b) - CDF.BINOM(a-1)",
    "CDF.BINOM(b) - CDF.BINOM(a)",
    "1 - CDF.BINOM(b) + CDF.BINOM(a)"
   ],
   "a": 1,
   "u": "Je neemt alles tot en met b en trekt daar alles tot en met a min 1 van af, zodat a zelf meetelt."
  },
  {
   "h": "h10",
   "q": "Waarom gebruik je k-1 bij binomiaal “minstens k”?",
   "o": [
    "Omdat k zelf moet meetellen; je trekt alleen de kansen tot en met k-1 af.",
    "Alleen wanneer je een discrete verdeling benadert met een normaalverdeling.",
    "P(X ≤ x): de oppervlakte links van x.",
    "1 - CDF.BINOM(k-1,n,p)."
   ],
   "a": 0,
   "u": "Minstens k betekent k zelf inbegrepen. Trek je tot en met k af, dan gooi je die ene weg."
  },
  {
   "h": "h10",
   "q": "Hoe bereken je normaal hoogstens of minder dan x?",
   "o": [
    "P(X ≤ k): de linkerkans inclusief k, dus hoogstens k.",
    "CDF.BINOM(k-1,n,p).",
    "CDF.NORMAL(x,mu,sigma); bij een continue verdeling maakt < of ≤ geen verschil.",
    "CDF.NORMAL(b) - CDF.NORMAL(a)."
   ],
   "a": 2,
   "u": "Bij een continue verdeling heeft één punt geen kans, dus kleiner dan en hoogstens leveren hetzelfde getal op."
  },
  {
   "h": "h10",
   "q": "Hoe bereken je normaal meer dan of minstens x?",
   "o": [
    "1 - IDF.NORMAL(x,mu,sigma)",
    "1 - CDF.NORMAL(x,mu,sigma)",
    "CDF.NORMAL(x,mu,sigma)",
    "PDF.NORMAL(x,mu,sigma)"
   ],
   "a": 1,
   "u": "Rechts van de grens is het complement van links ervan, dus één min de cumulatieve kans."
  },
  {
   "h": "h10",
   "q": "Hoe bereken je normaal tussen a en b?",
   "o": [
    "CDF.NORMAL(b) - CDF.NORMAL(a-1)",
    "PDF.NORMAL(b) - PDF.NORMAL(a)",
    "1 - CDF.NORMAL(b) + CDF.NORMAL(a)",
    "CDF.NORMAL(b) - CDF.NORMAL(a)"
   ],
   "a": 3,
   "u": "De oppervlakte tussen twee grenzen is het verschil van de twee cumulatieve kansen."
  },
  {
   "h": "h10",
   "q": "Wanneer gebruik je géén continuïteitscorrectie?",
   "o": [
    "q = .05.",
    "De grens x waarvoor P(X≤x)=q; hiermee zoek je een percentiel of grensscore.",
    "CDF.BINOM(b) - CDF.BINOM(a-1).",
    "Bij een echt normaal verdeelde variabele. Voor P(X>80) gebruik je 1 - CDF.NORMAL(80,mu,sigma)."
   ],
   "a": 3,
   "u": "De correctie hoort bij het benaderen van iets discreets. Is je variabele zelf al continu, dan heb je ze niet nodig."
  },
  {
   "h": "h10",
   "q": "Wanneer gebruik je wel ±0,5?",
   "o": [
    "Bij elke vraag met ‘meer dan’ of ‘minstens’.",
    "Alleen bij het gebruik van IDF.NORMAL.",
    "Alleen bij een normaalbenadering van een discrete verdeling.",
    "Bij elke normaal verdeelde variabele."
   ],
   "a": 2,
   "u": "Alleen als je een telbare uitkomst met de normaalverdeling benadert. Je rekt de grens dan een halve eenheid op."
  },
  {
   "h": "h10",
   "q": "Welke IDF-proportie gebruik je voor de laagste 5%?",
   "o": [
    "CDF.NORMAL(x,mu,sigma); bij een continue verdeling maakt < of ≤ geen verschil.",
    "P(X = k): de kans op exact k successen bij een binomiale verdeling.",
    "q = .05.",
    "PDF.BINOM(k,n,p)."
   ],
   "a": 2,
   "u": "De laagste vijf procent betekent dat vijf procent eronder ligt, dus vul je 0.05 in."
  },
  {
   "h": "h10",
   "q": "Welke IDF-proportie gebruik je voor de hoogste 5%?",
   "o": [
    "q = .50",
    "q = 1.05",
    "q = .95",
    "q = .05"
   ],
   "a": 2,
   "u": "De hoogste vijf procent betekent dat vijfennegentig procent eronder ligt, dus vul je 0.95 in."
  },
  {
   "h": "h10",
   "q": "Welke IDF-proportie gebruik je voor de grens van de hoogste 10%?",
   "o": [
    "q = .99",
    "q = .90",
    "q = .10",
    "q = .95"
   ],
   "a": 1,
   "u": "De grens van de hoogste tien procent ligt op het negentigste percentiel, dus q is 0.90."
  },
  {
   "h": "h10",
   "q": "Welke drie geldige manieren bestaan om cases te tellen die aan A én B voldoen?",
   "o": [
    "Het aantal geselecteerde cases of de passende frequentie; zet daarna All cases terug aan.",
    "Filter + Frequencies, indicatorvariabele + Frequencies, of Crosstabs met Count.",
    "De Frequency bij indicator = 1.",
    "De Count in de gevraagde kruising."
   ],
   "a": 1,
   "u": "Alle drie geven hetzelfde getal. Kies de weg die het snelst is en vergeet bij de filter niet om hem daarna uit te zetten."
  },
  {
   "h": "h10",
   "q": "Wat lees je af na filter + Frequencies?",
   "o": [
    "Filter + Frequencies, indicatorvariabele + Frequencies, of Crosstabs met Count.",
    "De Frequency bij indicator = 1.",
    "De Count in de gevraagde kruising.",
    "Het aantal geselecteerde cases of de passende frequentie; zet daarna All cases terug aan."
   ],
   "a": 3,
   "u": "Na het filteren rekent SPSS alleen nog met de geselecteerde groep. Zet de filter daarna meteen weer uit."
  },
  {
   "h": "h10",
   "q": "Wat lees je af bij een indicatorvariabele?",
   "o": [
    "De Cumulative Percent bij indicator = 0.",
    "De Pearson Chi-Square onder Value.",
    "De Frequency bij indicator = 1.",
    "De Frequency bij indicator = 0."
   ],
   "a": 2,
   "u": "Je maakt met Compute een variabele die 1 is als aan de voorwaarde voldaan is, en leest daarna de frequentie bij 1 af."
  },
  {
   "h": "h10",
   "q": "Wat lees je af bij een kruistabel?",
   "o": [
    "Filter + Frequencies, indicatorvariabele + Frequencies, of Crosstabs met Count.",
    "Het aantal geselecteerde cases of de passende frequentie; zet daarna All cases terug aan.",
    "De Count in de gevraagde kruising.",
    "De Frequency bij indicator = 1."
   ],
   "a": 2,
   "u": "In een kruistabel lees je gewoon de Count af in het vakje waar de twee gevraagde categorieën samenkomen."
  },
  {
   "h": "h10",
   "q": "Hoe interpreteer je Spearman, Kendall of Pearson?",
   "o": [
    "1 - CDF.BINOM(k,n,p).",
    "Bij een echt normaal verdeelde variabele. Voor P(X>80) gebruik je 1 - CDF.NORMAL(80,mu,sigma).",
    "Het teken geeft de richting en de absolute grootte de sterkte; correlatie met zichzelf is 1.",
    "De dichtheid f(x), niet P(X=x). Bij een continue verdeling is P(X=x)=0."
   ],
   "a": 2,
   "u": "Het minteken zegt alleen iets over de richting, niet over de sterkte. Een verband van min 0,8 is sterker dan een van 0,4."
  },
  {
   "h": "h10",
   "q": "Wat betekent R² bij regressie?",
   "o": [
    "Omdat k zelf moet meetellen; je trekt alleen de kansen tot en met k-1 af.",
    "Het percentage variantie in Y verklaard door X, ook te formuleren als het percentage minder voorspellingsfouten.",
    "Dubbelklik op de outputgrafiek; sluit met het kruisje. Wijzigingen verschijnen automatisch in Output.",
    "CDF geeft de kans links van de grens; voor rechts gebruik je 1 - CDF."
   ],
   "a": 1,
   "u": "R kwadraat is de proportie verklaarde variantie. Maal honderd lees je het als een percentage."
  },
  {
   "h": "h10",
   "q": "Wat is de algemene beslisregel met p en alfa?",
   "o": [
    "p ≤ alfa: H0 verwerpen; p > alfa: H0 niet verwerpen.",
    "p ≥ alfa: H0 verwerpen; p < alfa: H0 niet verwerpen.",
    "p = alfa: H0 nooit verwerpen.",
    "De p-waarde moet eerst door twee worden gedeeld."
   ],
   "a": 0,
   "u": "Klein p betekent dat je resultaat moeilijk door toeval te verklaren is, en dan verwerp je de nulhypothese."
  },
  {
   "h": "h10",
   "q": "Welke onderwerpen uit de oude bundel hoef je voor dit S2-software-examen niet centraal te leren?",
   "o": [
    "Compare Means, betrouwbaarheidsintervallen, verdelingstoetsen, niet-parametrische toetsen, ANOVA/Kruskal-Wallis en de meeste significantie-interpretaties zijn volgens de aanvulling Statistiek III.",
    "Of gevraagd wordt naar een aantal, percentage, verband, verdeling, vijf-getallensamenvatting of kans.",
    "SPSS zet numerieke categoriecodes vaak automatisch op Scale en voorkomt dus geen methodologische fout.",
    "Pearson r via Analyze > Correlate > Bivariate > Pearson."
   ],
   "a": 0,
   "u": "Die onderdelen horen bij Statistiek III. Ken je afbakening, dan verlies je geen tijd aan stof die niet gevraagd wordt."
  },
  {
   "h": "h10",
   "q": "Welke samenvatting kies je voor een ordinale Likertvariabele?",
   "o": [
    "De dichtheid f(x), niet P(X=x). Bij een continue verdeling is P(X=x)=0.",
    "1 - CDF.BINOM(k,n,p).",
    "Bij een echt normaal verdeelde variabele. Voor P(X>80) gebruik je 1 - CDF.NORMAL(80,mu,sigma).",
    "Frequencies met mediaan en percentielen; een gemiddelde is methodologisch niet de bedoelde keuze."
   ],
   "a": 3,
   "u": "Bij ordinaal niveau mag je de mediaan en percentielen gebruiken, maar geen gemiddelde."
  },
  {
   "h": "h10",
   "q": "Categorieën samenvoegen of een formule/gemiddelde/indicator maken: Recode of Compute?",
   "o": [
    "Voor beide gebruik je altijd Recode into Different Variables.",
    "Categorieën samenvoegen = Recode into Different Variables; formule/gemiddelde/indicator = Compute Variable.",
    "Categorieën samenvoegen = Compute; formule/gemiddelde/indicator = Recode into Same Variables.",
    "Voor beide gebruik je altijd Compute Variable."
   ],
   "a": 1,
   "u": "Vuistregel: hergroeperen doe je met Recode, rekenen doe je met Compute."
  },
  {
   "h": "h10",
   "q": "Welke vijf zaken zijn het belangrijkst om vlak voor het examen te herhalen?",
   "o": [
    "P(X ≤ x): de oppervlakte links van x.",
    "1 - CDF.BINOM(k-1,n,p).",
    "Meetniveaus → methode; CDF = links; binomiaal minstens k = 1-CDF(k-1); boxplot groups of cases + Category Axis; filters met haakjes.",
    "De groepen horen op Category Axis."
   ],
   "a": 2,
   "u": "Dit zijn de vijf plekken waar de meeste punten verloren gaan. Loop ze de avond voor je examen nog eens door."
  },
  {
   "h": "h10",
   "q": "Waar stel je een filter in?",
   "o": [
    "Data > Select Cases > If condition is satisfied > If",
    "Transform > Compute Variable > If",
    "Analyze > Descriptive Statistics > Frequencies > Statistics",
    "Edit > Options > Data > Filter"
   ],
   "a": 0,
   "u": "Filteren doe je onder Data, Select Cases. Kies daar If condition is satisfied en klik op de knop If om je voorwaarde te typen."
  },
  {
   "h": "h10",
   "q": "Verwijdert een filter cases uit de dataset?",
   "o": [
    "Nee, cases worden tijdelijk uitgesloten van analyses",
    "Ja, de niet geselecteerde rijen worden gewist",
    "Ja, maar je kan ze terughalen met Undo",
    "Nee, maar de waarden worden op system-missing gezet"
   ],
   "a": 0,
   "u": "De rijen blijven staan, ze doen alleen even niet mee. In Data View zie je een streep door het rijnummer van wie buiten de selectie valt."
  },
  {
   "h": "h10",
   "q": "Waarom zijn haakjes belangrijk bij EN en OF?",
   "o": [
    "Ze groeperen voorwaarden en voorkomen dat de bewerkingsvolgorde verkeerde cases selecteert",
    "Ze zijn verplicht, zonder haakjes geeft SPSS een foutmelding",
    "Ze zorgen dat tekstwaarden als tekst gelezen worden",
    "Ze maken de voorwaarde sneller, wat bij grote bestanden uitmaakt"
   ],
   "a": 0,
   "u": "EN wordt voor OF uitgevoerd. Zonder haakjes selecteer je dus iets anders dan je bedoelt, ook al geeft SPSS geen foutmelding."
  },
  {
   "h": "h10",
   "q": "Hoe schrijf je tekstwaarden in een filter?",
   "o": [
    "Tussen aanhalingstekens, bijvoorbeeld geslacht = \"vrouw\"",
    "Zonder aanhalingstekens, bijvoorbeeld geslacht = vrouw",
    "Met de code in plaats van de tekst, tekst kan niet",
    "Tussen vierkante haken, bijvoorbeeld geslacht = [vrouw]"
   ],
   "a": 0,
   "u": "Tekst zet je tussen enkele of dubbele aanhalingstekens. Bij getallen doe je dat juist niet, dan typ je gewoon de code."
  },
  {
   "h": "h10",
   "q": "Wat moet je na een gefilterde analyse doen?",
   "o": [
    "Data > Select Cases > All cases, om de filter weer uit te zetten",
    "Het bestand opslaan zodat de filter bewaard blijft",
    "Niets, de filter vervalt vanzelf na de analyse",
    "Transform > Compute Variable om de filter ongedaan te maken"
   ],
   "a": 0,
   "u": "Een filter blijft aan staan tot je hem uitzet. Vergeet je dat, dan zijn al je volgende opgaven op de verkeerde groep berekend."
  },
  {
   "h": "h10",
   "q": "Wat toont een frequentietabel van filter_$?",
   "o": [
    "Hoeveel cases geselecteerd (1) of niet geselecteerd (0) zijn, niet automatisch het inhoudelijke antwoord",
    "Het gemiddelde van de geselecteerde cases",
    "Welke variabelen in de filter gebruikt zijn",
    "De verdeling van de variabele waarop je gefilterd hebt"
   ],
   "a": 0,
   "u": "De variabele filter_$ zegt alleen wie meedoet en wie niet. Voor het inhoudelijke antwoord vraag je daarna de frequenties van de variabele zelf op."
  }
 ],
 "hardVragen": [
  {
   "h": "h1",
   "q": "Je stelt een batterij van zeven testen samen uit tien, waarvan vier vaste testen verplicht zijn. Daarna leg je ook de volgorde van alle zeven testen vast; welke berekening telt de mogelijke geordende batterijen?",
   "o": [
    "C(10,7) maal 7!: kies zeven testen uit alle tien en orden vervolgens die zeven.",
    "C(6,3) maal 7!: kies drie aanvullende testen uit de overige zes en orden vervolgens alle zeven.",
    "V(3 uit 6) maal 7!: kies drie aanvullende testen met volgorde en orden vervolgens alle zeven opnieuw.",
    "C(6,3) maal 3!: kies drie aanvullende testen uit de overige zes en orden vervolgens alleen die drie."
   ],
   "a": 1,
   "u": "De vier verplichte testen liggen vast, dus je kiest de overige drie zonder volgorde uit zes met C(6,3). Elke gekozen batterij bevat zeven verschillende testen die je op 7! manieren kunt ordenen."
  },
  {
   "h": "h2",
   "q": "Bij twee eerlijke dobbelstenen berekent iemand P(totaal = 2 of totaal = 5) als 2/11, omdat twee van de elf totalen gunstig zijn. Welke correctie past bij het kansmodel?",
   "o": [
    "Gebruik 5/36: totaal 2 ontstaat uit één paar en totaal 5 uit vier van de gelijk waarschijnlijke paren.",
    "Gebruik 2/36: de twee gunstige totalen tellen elk als één van de gelijk waarschijnlijke paren.",
    "Gebruik 5/11: de vijf gunstige paren tel je ten opzichte van de elf mogelijke totalen.",
    "Gebruik 2/11: eerlijke dobbelstenen zorgen ervoor dat alle elf mogelijke totalen even waarschijnlijk zijn."
   ],
   "a": 0,
   "u": "De 36 afzonderlijke paren zijn gelijk waarschijnlijk, maar de elf totalen niet. Totaal 2 heeft één gunstig paar en totaal 5 heeft er vier, zodat de gezamenlijke kans 5/36 is."
  },
  {
   "h": "h3",
   "q": "Een reiziger neemt in 30 procent van de gevallen de bus en anders de metro, met controlekansen van respectievelijk 20 en 10 procent. Er is geen controle geweest; wat is dan de kans dat de reiziger de bus nam?",
   "o": [
    "Ongeveer 30 procent: zonder controle blijft het oorspronkelijke aandeel busritten de gevraagde kans.",
    "Ongeveer 24 procent: vermenigvuldig het aandeel busritten met de kans op geen controle in de bus.",
    "Ongeveer 46 procent: deel de kans op bus en controle door de totale kans op controle.",
    "Ongeveer 28 procent: deel de kans op bus zonder controle door de totale kans op geen controle."
   ],
   "a": 3,
   "u": "De kans op bus zonder controle is 0,30 maal 0,80 = 0,24 en die op metro zonder controle is 0,70 maal 0,90 = 0,63. Voorwaardelijk op geen controle krijg je 0,24 gedeeld door 0,87, dus ongeveer 28 procent."
  },
  {
   "h": "h4",
   "q": "X telt het aantal keer kruis bij drie eerlijke muntworpen en Y is uniform verdeeld tussen 0 en 1. Wat gebeurt er als je bij X de grens ≥ 2 vervangt door > 2 en bij Y de grens ≥ 0,5 door > 0,5?",
   "o": [
    "Beide kansen blijven gelijk, want een grenswaarde heeft bij beide variabelen kans nul.",
    "Beide kansen worden kleiner, want bij beide variabelen verwijder je een grens met positieve kans.",
    "De kans bij X wordt kleiner, maar die bij Y blijft gelijk omdat één continue waarde kans nul heeft.",
    "De kans bij X blijft gelijk, maar die bij Y wordt kleiner omdat het continue interval smaller wordt."
   ],
   "a": 2,
   "u": "Bij X verwijder je de kansmassa P(X = 2) = 3/8, zodat alleen P(X = 3) overblijft. Bij de continue Y is P(Y = 0,5) gelijk aan nul, zodat de oppervlakte en dus de kans niet verandert."
  },
  {
   "h": "h5",
   "q": "X en Y zijn onafhankelijk, a en b zijn vaste getallen en Z = a + b(X - Y). Welke combinatie van verwachting en variantie volgt uit de rekenregels?",
   "o": [
    "E(Z) = a + b(E(X) - E(Y)); Var(Z) = b²(Var(X) - Var(Y)).",
    "E(Z) = a + b(E(X) - E(Y)); Var(Z) = b²(Var(X) + Var(Y)).",
    "E(Z) = a + b(E(X) + E(Y)); Var(Z) = b²(Var(X) + Var(Y)).",
    "E(Z) = a + b(E(X) - E(Y)); Var(Z) = a + b²(Var(X) + Var(Y))."
   ],
   "a": 1,
   "u": "Verwachtingen volgen de lineaire bewerking, dus de verwachtingen worden hier afgetrokken, met b vermenigvuldigd en met a verhoogd. Bij onafhankelijke variabelen tellen de varianties ook voor een verschil op; vermenigvuldigen met b geeft factor b² en de constante a verandert de variantie niet."
  },
  {
   "h": "h6",
   "q": "X is binomiaal met n = 2500 en p = 0,60 en je zoekt P(X ≥ 1520) met een normaalbenadering. Welke keuze combineert de voorwaarden, de continuïteitscorrectie en de juiste staart?",
   "o": [
    "De benadering is toegestaan; gebruik z = (1519,5 - 1500) / √600 en neem de rechterstaart.",
    "De benadering is toegestaan; gebruik z = (1520,5 - 1500) / √600 en neem de rechterstaart.",
    "De benadering is toegestaan; gebruik z = (1519,5 - 1500) / √600 en neem de linkerstaart.",
    "De benadering is niet toegestaan; bij p = 0,60 zijn de successen en mislukkingen niet even waarschijnlijk."
   ],
   "a": 0,
   "u": "np = 1500 en n(1 - p) = 1000 voldoen beide aan de grens van 10, met verwachting 1500 en standaarddeviatie √600. Omdat 1520 zelf meetelt, begint de rechterstaart na continuïteitscorrectie bij 1519,5."
  },
  {
   "h": "h7",
   "q": "Uit dezelfde scheve populatie vergelijk je aselecte steekproeven met omvang n en 4n, allebei groot genoeg voor de centrale limietstelling. Wat klopt voor de steekproevenverdeling van het gemiddelde en voor de populatie?",
   "o": [
    "De steekproevenverdeling is bij benadering normaal, haar standaardfout wordt viermaal kleiner en de populatie blijft scheef.",
    "De steekproevenverdeling is bij benadering normaal, haar standaardfout halveert en de populatie wordt eveneens normaal.",
    "De steekproevenverdeling blijft even scheef als de populatie, haar standaardfout halveert en de populatie blijft scheef.",
    "De steekproevenverdeling is bij benadering normaal, haar standaardfout halveert en de populatie blijft scheef."
   ],
   "a": 3,
   "u": "De centrale limietstelling gaat over de verdeling van de steekproefgemiddelden, niet over de populatie zelf. De standaardfout is σ/√n, zodat verviervoudigen van n de standaardfout halveert."
  },
  {
   "h": "h8",
   "q": "Een onderzoeker wil een smaller betrouwbaarheidsinterval van 95 procent door alleen de populatiegrootte te verhogen en noemt 95 procent de kans dat mu in het berekende interval ligt. Welke twee correcties zijn nodig?",
   "o": [
    "Vergroot de steekproef bij gelijkblijvende sigma; 95 procent is het aandeel individuele waarnemingen dat in het interval valt.",
    "Vergroot de populatie bij gelijkblijvende steekproef; 95 procent is het aandeel herhaalde intervallen dat mu bevat.",
    "Vergroot de steekproef bij gelijkblijvende sigma; 95 procent is het aandeel herhaalde intervallen dat mu bevat.",
    "Vergroot de populatie bij gelijkblijvende steekproef; 95 procent is de kans dat mu in dit ene berekende interval ligt."
   ],
   "a": 2,
   "u": "Bij gelijk niveau en gelijke sigma wordt de foutmarge kleiner door een grotere steekproef n, niet door een grotere populatie N. De betrouwbaarheid beschrijft hoe vaak de methode mu vangt bij herhaald steekproeven; mu ligt in een eenmaal berekend interval of niet."
  },
  {
   "h": "h9",
   "q": "Een tweezijdige toets geeft p = 0,012. Hoe verschillen de beslissingen bij de vooraf gekozen grenzen alfa = 0,01 en alfa = 0,05, en welke fout is verwerpen wanneer H0 toch waar is?",
   "o": [
    "Bij 0,01 H0 niet verwerpen, bij 0,05 wel verwerpen; onterecht verwerpen is een Type I-fout.",
    "Bij 0,01 H0 wel verwerpen, bij 0,05 niet verwerpen; onterecht verwerpen is een Type I-fout.",
    "Bij 0,01 H0 niet verwerpen, bij 0,05 wel verwerpen; onterecht verwerpen is een Type II-fout.",
    "Bij beide grenzen H0 verwerpen, want 0,012 moet nog gehalveerd worden; dat risico is een Type I-fout."
   ],
   "a": 0,
   "u": "De gegeven tweezijdige p-waarde ligt boven 0,01 maar onder 0,05 en hoeft niet opnieuw aangepast te worden. H0 verwerpen terwijl ze waar is, is een Type I-fout."
  },
  {
   "h": "h10",
   "q": "Je wilt in SPSS binnen Franstalige sergeanten percentages van geldige antwoorden berekenen, met taal = 2, graad = 3 en ontbrekende antwoorden als 999. Welke aanpak past?",
   "o": [
    "Filter met (taal = 2) | (graad = 3), stel Missing = 999 in, lees Valid Percent en herstel daarna All cases.",
    "Filter met (taal = 2) & (graad = 3), stel Missing = 999 in, lees Valid Percent en herstel daarna All cases.",
    "Filter met (taal = 2) & (graad = 3), stel Missing = 999 in, lees Percent en herstel daarna All cases.",
    "Filter met (taal = 2) & (graad = 3), geef 999 alleen een waardelabel, lees Valid Percent en herstel All cases."
   ],
   "a": 1,
   "u": "Beide selectievoorwaarden moeten gelden, dus je gebruikt EN (&), en 999 moet als Missing ingesteld worden om niet mee te tellen. Valid Percent gebruikt alleen geldige antwoorden; met All cases voorkom je dat volgende analyses onbedoeld gefilterd blijven."
  }
 ],
 "hacks": [
  {
   "h": "algemeen",
   "kop": "p klein → H0 weg",
   "t": "Is de p-waarde kleiner dan α (meestal 0,05)? Dan verwerp je H0 en is het resultaat significant. Grote p betekent enkel: geen bewijs, niet dat H0 klopt."
  },
  {
   "h": "algemeen",
   "kop": "BOAS voor binomiaal",
   "t": "Binair, Onafhankelijk, Aantal pogingen vooraf vast, Succeskans constant. Ontbreekt er een letter, dan is de binomiale verdeling niet de juiste keuze."
  },
  {
   "h": "algemeen",
   "kop": "Volgorde telt? Dan variatie",
   "t": "Volgorde belangrijk → variatie of permutatie. Volgorde onbelangrijk → combinatie C(n,r). Een permutatie is gewoon de variatie waarbij je alle n elementen neemt."
  },
  {
   "h": "algemeen",
   "kop": "Standaardfout: meer data, kleiner foutje",
   "t": "σ/√n heeft n in de noemer. Vier keer zoveel deelnemers halveert de standaardfout en dus ook de foutmarge, want de wortel groeit maar half zo snel."
  },
  {
   "h": "algemeen",
   "kop": "CLS gaat over gemiddelden",
   "t": "De centrale limietstelling maakt het gemiddelde normaal, niet je ruwe data. De populatie blijft even scheef als ze altijd was."
  },
  {
   "h": "algemeen",
   "kop": "Onafhankelijk is niet disjunct",
   "t": "Onafhankelijk: P(A en B) = P(A)·P(B), de ene zegt niets over de andere. Disjunct: P(A en B) = 0, ze sluiten elkaar uit en zijn dus juist sterk afhankelijk."
  },
  {
   "h": "algemeen",
   "kop": "Bayes: draai de voorwaarde niet om",
   "t": "P(positieve test | ziek) en P(ziek | positieve test) zijn twee verschillende dingen. Bij een zeldzame ziekte is de tweede veel kleiner dan je denkt."
  },
  {
   "h": "algemeen",
   "kop": "De methode vangt, niet dit interval",
   "t": "Bij 95 procent betrouwbaarheid vangt de methode µ in 95 van de 100 steekproeven. Over dit ene berekende interval mag je geen kansuitspraak doen."
  },
  {
   "h": "algemeen",
   "kop": "Type I is vals alarm",
   "t": "Type I (α): je verwerpt H0 terwijl ze klopt, je 'vindt' iets dat er niet is. Type II (β): je mist een effect dat er wel degelijk is."
  },
  {
   "h": "algemeen",
   "kop": "Significant is niet hetzelfde als belangrijk",
   "t": "Een daling van 0,4 graden kan significant zijn en klinisch toch niets betekenen. Kijk altijd naar de effectgrootte, niet enkel naar de p-waarde."
  },
  {
   "h": "algemeen",
   "kop": "Halve eenheid bij de overstap",
   "t": "Ga je van binomiaal naar normaal, tel dan 0,5 mee. X ≥ 1520 wordt dus vanaf 1519,5. Zonder die correctie wordt je antwoord merkbaar fout."
  },
  {
   "h": "algemeen",
   "kop": "Varianties tel je op, ook bij min",
   "t": "Bij onafhankelijke variabelen geldt σ²(X − Y) = σ²(X) + σ²(Y). Onzekerheid trek je nooit van elkaar af, ook niet bij een verschilscore."
  }
 ],
 "theorie": [
  {
   "h": "h1",
   "kop": "Kernpunten",
   "items": [
    "Unie A ∪ B = 'A of B' (alles wat in minstens een van beide zit). Doorsnede A ∩ B = 'A en B' (enkel het gemeenschappelijke deel).",
    "Verschil A \\ B = 'A minus B'. Complement van A = alles in Ω dat niet in A zit, genoteerd als niet-A.",
    "Elke verzameling is een deelverzameling van zichzelf, en de lege verzameling is een deelverzameling van elke verzameling.",
    "Partitie: deelverzamelingen die samen A dekken en twee aan twee een lege doorsnede hebben. Geen overlap, geen gaten.",
    "Met herhaling: k posities en n keuzes per positie geeft n^k mogelijkheden (cijferslot: 10^4 = 10000 codes).",
    "Permutatie = alle n elementen ordenen = n! Voorbeeld: 10! = 3 628 800 volgorden.",
    "Variatie = r elementen kiezen uit n, volgorde telt mee: n × (n−1) × … × (n−r+1). Voorbeeld: 10 × 9 × 8 = 720.",
    "Combinatie = r elementen kiezen uit n, volgorde telt niet mee: C(n,r) = n! / (r! (n−r)!). Voorbeeld: C(10,3) = 120.",
    "Ezelsbrug: volgorde belangrijk → variatie, volgorde onbelangrijk → combinatie. Een permutatie is de variatie met r = n.",
    "Een verzameling met n elementen heeft 2^n deelverzamelingen, de lege verzameling en de verzameling zelf meegerekend."
   ]
  },
  {
   "h": "h2",
   "kop": "Kernpunten",
   "items": [
    "Toevalsverschijnsel: de losse uitkomst is onzeker, maar over veel herhalingen ontstaat een regelmatig patroon.",
    "Frequentiële definitie: de kans is de proportie keren dat de uitkomst voorkomt bij een zeer groot aantal herhalingen.",
    "Die regelmaat geldt enkel als de pogingen onderling onafhankelijk zijn.",
    "Uitkomstenruimte S = alle mogelijke uitkomsten. Gebeurtenis = een uitkomst of een verzameling uitkomsten.",
    "Kansmodel = uitkomstenruimte S plus de kans van elke uitkomst.",
    "Klassieke definitie P(A) = aantal gunstige uitkomsten / aantal mogelijke uitkomsten, maar enkel bij gelijke kansen.",
    "Fout gebruik van die formule: 'overleven of niet' is geen 50/50, want de twee uitkomsten zijn niet even waarschijnlijk.",
    "Twee dobbelstenen apart noteren geeft 36 gelijk waarschijnlijke uitkomsten, elk 1/36. Enkel het totaal noteren geeft 11 uitkomsten met ongelijke kansen.",
    "Basisregels: 0 ≤ P(A) ≤ 1 en P(S) = 1. De kansen van alle uitkomsten samen geven precies 1.",
    "Modellen zijn uitwisselbaar: vier mensen die willekeurig ja of nee antwoorden = vier keer een munt opgooien."
   ]
  },
  {
   "h": "h3",
   "kop": "Kernpunten",
   "items": [
    "Somregel: P(A of B) = P(A) + P(B) − P(A en B). Bij disjuncte gebeurtenissen valt de laatste term weg.",
    "Complementregel: P(niet A) = 1 − P(A).",
    "Voorwaardelijke kans: P(A | B) = P(A en B) / P(B), met P(B) niet gelijk aan 0. Je verkleint de uitkomstenruimte tot B.",
    "Algemene productregel: P(A en B) = P(B) × P(A | B). Die geldt ook als A en B afhankelijk zijn.",
    "Zonder teruglegging verandert de kans per trekking: drie harten uit 52 kaarten = (13/52)(12/51)(11/50).",
    "Onafhankelijk betekent P(A | B) = P(A), en dan geldt P(A en B) = P(A) × P(B).",
    "Onafhankelijk is niet hetzelfde als disjunct. Disjuncte gebeurtenissen zijn juist sterk afhankelijk: als de ene optreedt, kan de andere niet meer.",
    "Boomdiagram: vermenigvuldig langs een tak, tel op over de takken. Een kruistabel doet hetzelfde werk.",
    "Regel van Bayes: van P(test | ziekte) naar P(ziekte | test). Die twee zijn niet gelijk.",
    "Bij een zeldzame aandoening zijn de meeste positieve testuitslagen vals-positief, ook bij een goede test. Mammografie: 80 procent detectie, maar P(kanker | positief) is toch maar ongeveer 0,3 procent."
   ]
  },
  {
   "h": "h4",
   "kop": "Kernpunten",
   "items": [
    "Stochastische variabele: getalwaarden die de uitkomsten van een toevalsproces beschrijven. De kansverdeling geeft de waarden en hun kansen.",
    "Discreet = op te sommen waarden (tellen). Continu = alle waarden in een interval (meten).",
    "Discrete kansverdeling: elke kans ligt tussen 0 en 1 en de som van de kansen is 1.",
    "Kans op een gebeurtenis = som van de kansen van de waarden die tot die gebeurtenis behoren.",
    "Drie muntworpen, X = aantal kruis: kansen 1/8, 3/8, 3/8, 1/8. Dus P(X = 2) = 3/8 en P(X ≥ 2) = 1/2.",
    "Bij een continue variabele is de kans op een exacte waarde 0. Enkel intervallen hebben een kans groter dan 0.",
    "De kans is de oppervlakte onder de dichtheidskromme boven dat interval. De totale oppervlakte is 1.",
    "Uniforme verdeling tussen 0 en 1: P(X ≤ 0,5 of X > 0,8) = 0,5 + 0,2 = 0,7.",
    "Normaalverdelingen dienen als dichtheidskromme. Standaardiseren met z = (x − µ) / σ herleidt N(µ, σ) tot N(0,1).",
    "Standaardiseren is een lineaire transformatie: de vorm blijft, enkel het centrum (0) en de eenheid (1) veranderen."
   ]
  },
  {
   "h": "h5",
   "kop": "Kernpunten",
   "items": [
    "Verwachting E(X) = som van elke waarde maal haar kans. Het is een gewogen gemiddelde, geen gewoon gemiddelde van de waarden.",
    "De verwachting hoeft zelf geen mogelijke uitkomst te zijn. De APGAR-verwachting 8,128 komt als score niet voor.",
    "Interpretatie: het gemiddelde op lange termijn, over heel veel herhalingen.",
    "Loterij: 500 euro winst met kans 1/1000 geeft E(X) = 0,50 euro. Kost het spel 1 euro, dan verlies je gemiddeld 0,50 euro.",
    "Wet van de grote getallen: naarmate n stijgt, benadert het steekproefgemiddelde het populatiegemiddelde µ.",
    "Intuïtie over korte reeksen is onbetrouwbaar: series zoals KKK worden stelselmatig onderschat.",
    "Variantie van X = som van (x − µ)² maal de kans van x. De standaarddeviatie is de wortel daaruit.",
    "Regels voor verwachtingen: µ(a + bX) = a + b·µ(X) en µ(X + Y) = µ(X) + µ(Y), altijd, ook bij samenhang.",
    "Regels voor varianties: σ²(a + bX) = b²·σ²(X). Een constante optellen verandert de spreiding niet.",
    "Bij onafhankelijke X en Y: σ²(X + Y) = σ²(X − Y) = σ²(X) + σ²(Y). Varianties tel je op, ook bij een verschil.",
    "Met correlatie: σ²(X ± Y) = σ²(X) + σ²(Y) ± 2·covariantie, met covariantie = r·σ(X)·σ(Y).",
    "Steekproevenvariabiliteit: de waarde van een steekproefgrootheid verschilt van steekproef tot steekproef."
   ]
  },
  {
   "h": "h6",
   "kop": "Kernpunten",
   "items": [
    "Parameter = kenmerk van de populatie (Griekse letter, µ en σ). Karakteristieke waarde = berekend op de steekproef, gebruikt als schatter.",
    "Steekproefverdeling = de verdeling in je data. Steekproevenverdeling = de verdeling van een steekproefgrootheid over alle mogelijke steekproeven.",
    "BOAS-check voor een binomiale situatie: Binair, Onafhankelijk, Aantal pogingen vooraf vast, Succeskans p constant.",
    "Binomiale kans: P(X = k) = C(n,k) · p^k · (1 − p)^(n−k). C(n,k) telt de volgorden, de rest is de kans op een volgorde.",
    "Trekking zonder teruglegging mag je binomiaal benaderen als de populatie veel groter is dan de steekproef: N ≥ 20n.",
    "Voorbeeld: n = 5 en p = 0,25 geeft P(X = 3) = 10 × 0,015625 × 0,5625 = 0,088, en P(X > 3) = 0,0156.",
    "Verwachting en spreiding: µ = np en σ = wortel uit np(1 − p). Deze formules gelden alleen binomiaal.",
    "Steekproefproportie = X/n. De verwachting is p en de standaarddeviatie is de wortel uit p(1 − p)/n.",
    "Normaalbenadering mag als np ≥ 10 én n(1 − p) ≥ 10.",
    "Continuïteitscorrectie: de discrete waarde 8 komt overeen met de strook 7,5 tot 8,5. Voor P(X ≥ 1520) reken je vanaf 1519,5.",
    "Zonder die correctie loopt de benadering flink mis: bij n = 20 en p = 0,4 geeft ze 0,676 in plaats van 0,755."
   ]
  },
  {
   "h": "h7",
   "kop": "Kernpunten",
   "items": [
    "Het steekproefgemiddelde is een zuivere schatter van µ: gemiddeld ligt het noch te hoog, noch te laag.",
    "Standaardfout van het gemiddelde = σ/√n. Steekproefgemiddelden zijn dus minder variabel dan losse waarnemingen.",
    "Vier keer zoveel deelnemers halveert de standaardfout, want de wortel uit 4n is 2 keer de wortel uit n.",
    "Normaal verdeelde populatie → het gemiddelde is exact normaal verdeeld, ongeacht n.",
    "Centrale limietstelling: bij een willekeurig verdeelde populatie benadert de steekproevenverdeling van het gemiddelde een normaalverdeling zodra n groot genoeg is (vuistregel n ≥ 30).",
    "De CLS gaat over het gemiddelde, niet over de ruwe data. De populatie blijft even scheef als ze was.",
    "Bij n = 1 valt de steekproevenverdeling samen met de populatieverdeling. Hoe groter n, hoe symmetrischer en smaller.",
    "Voorbeeld: µ = 1 uur, σ = 1, n = 70 geeft N(1; 0,12). De kans op een gemiddelde boven 1,1 uur is ongeveer 20 procent.",
    "Ongeveer 68 procent van de steekproefgemiddelden ligt binnen een standaardfout van µ, ongeveer 95 procent binnen twee.",
    "Elke lineaire combinatie van onafhankelijke normaal verdeelde variabelen is opnieuw normaal verdeeld."
   ]
  },
  {
   "h": "h8",
   "kop": "Kernpunten",
   "items": [
    "Puntschatting = een getal. Intervalschatting = een reeks aannemelijke waarden met een betrouwbaarheidsniveau erbij.",
    "Goede schatter: zuiver (gemiddeld juist), efficiënt (kleinste standaardfout) en consistent (beter bij grotere n).",
    "De steekproefvariantie deelt door n − 1, want delen door n geeft een onzuivere schatter van σ².",
    "BI = schatting ± foutmarge, met foutmarge = z* · σ/√n. Voor 95 procent is z* = 1,96, in de praktijk vaak afgerond op 2.",
    "Interpretatie: 95 procent van alle mogelijke steekproeven levert een interval op dat µ bevat. Zeg niet dat de kans 95 procent is dat µ in dít interval ligt.",
    "Voorbeeld: gemiddelde 461, σ = 100, n = 500 geeft standaardfout 4,5 en dus een interval van ongeveer 452 tot 470.",
    "Steekproefgrootte delen door vier verdubbelt de breedte. Het interval halveren vraagt dus vier keer zoveel deelnemers.",
    "Vooraf plannen: n ≥ (z* · σ / foutmarge)². Voor σ = 100 en een marge van 5 punten: n ≥ 1537.",
    "De populatiegrootte N speelt in die formule geen rol. Enkel n, σ en het gekozen niveau tellen.",
    "Smaller interval: grotere n, kleinere σ, of een lager betrouwbaarheidsniveau. Hoger niveau (99 in plaats van 95 procent) maakt het interval breder.",
    "Voorwaarden: een enkelvoudige aselecte steekproef, geen non-respons, een normaal verdeelde variabele en een gekende σ.",
    "Het gemiddelde is niet robuust voor uitschieters. Bij kleine steekproeven uit scheve populaties biedt de bootstrap een alternatief."
   ]
  },
  {
   "h": "h9",
   "kop": "Kernpunten",
   "items": [
    "Een significantietoets vergelijkt data met een bewering over een parameter en drukt het resultaat uit als een kans.",
    "H0 = geen effect, geen verschil. Ha = wat je met je onderzoek wil ondersteunen. De toets evalueert de evidentie tegen H0.",
    "Eenzijdig als je een richting vooropstelt (groter of kleiner), tweezijdig als je enkel 'verschillend van' beweert.",
    "Toetsingsgrootheid: z = (steekproefgemiddelde − µ0) / (σ/√n). Ze telt hoeveel standaardfouten je van H0 af zit.",
    "p-waarde = de kans op een minstens zo extreme toetsingsgrootheid, áls H0 waar zou zijn. Niet de kans dat H0 waar is.",
    "Klein p → sterke evidentie tegen H0. Groot p → het resultaat is gewoon plausibel onder H0.",
    "Beslissing: p < α → H0 verwerpen en besluiten tot Ha. p ≥ α → H0 niet verwerpen. Schrijf nooit 'H0 aanvaarden'.",
    "Vier stappen: hypothesen formuleren, toetsingsgrootheid berekenen, overschrijdingskans bepalen, conclusie in APA-stijl.",
    "Tweezijdig: p = 2 × P(Z > |z|). Voorbeeld: z = 1,20 geeft p = 2 × 0,1151 = 0,2302, dus H0 blijft staan.",
    "Een tweezijdige toets op niveau α hoort bij een betrouwbaarheidsinterval met C = 1 − α, maar dan rond de waarde uit H0.",
    "Type I-fout = H0 onterecht verwerpen (vals alarm, kans α). Type II-fout = een echt effect missen (kans β).",
    "Significantie zegt niets over de grootte van een effect. Bij zeer grote steekproeven wordt ook een onbeduidend verschil significant.",
    "Geen significantie is geen bewijs van afwezigheid. Mogelijk was de steekproef te klein of het meetinstrument te ruw.",
    "APA: significant vanaf p < 0,05, marginaal significant vanaf p < 0,10. Vermeld de precieze p-waarde en vermijd 'sterk significant'."
   ]
  },
  {
   "h": "algemeen",
   "kop": "Software kort: SPSS en R",
   "items": [
    "Frequencies en Descriptives geven de beschrijvende statistiek per variabele.",
    "Crosstabs met Chi-square toetst de samenhang tussen categorische variabelen.",
    "Compare Means en ANOVA vergelijken gemiddelden van groepen. Kijk naar de sig-waarde, dat is de p-waarde.",
    "Correlate geeft Pearson bij scale-variabelen, Spearman of Kendall bij ordinale variabelen.",
    "Transform → Compute of Recode maakt nieuwe variabelen. Data → Select Cases beperkt de analyse tot een groep.",
    "In R: pbinom(k, n, p) geeft de binomiale kans tot en met k, pnorm(x, mean, sd) de oppervlakte links van x onder de normaalkromme.",
    "sample(x, n, replace = TRUE) simuleert trekkingen met teruglegging, handig om toeval na te bootsen.",
    "Het examen bestaat uit twee delen: theorie plus oefeningen in meerkeuze, en een softwaredeel in SPSS of R."
   ]
  },
  {
   "h": "algemeen",
   "kop": "Begrippen in het kort",
   "items": [
    "Deductief tegenover inductief: deductief is beschrijvend, je vertrekt van wat je hebt en beschrijft het. Inductief is verklarend, je gebruikt de steekproef om uitspraken te doen over de hele populatie.",
    "Disjunct: twee gebeurtenissen die elkaar uitsluiten, de doorsnede is leeg. Bij niet-disjunct is er wel overlap, en die overlap moet je aftrekken als je de kansen optelt.",
    "Partitie: deelverzamelingen vormen een partitie van A als ze samen heel A opleveren en elkaar nergens overlappen.",
    "Combinatie tegenover variatie: bij een combinatie doet de volgorde er niet toe, bij een variatie wel. Is r gelijk aan n, dan heet het een permutatie. Bij een herhalingsvariatie mag dezelfde uitkomst meermaals voorkomen.",
    "Faculteit: het product van een getal met alle kleinere gehele getallen, dus 4! is 4 maal 3 maal 2 maal 1.",
    "Toeval: de afzonderlijke uitkomsten liggen niet vast, maar op lange termijn ontstaat er wel een vast patroon.",
    "Kans: de proportie keren dat een uitkomst voorkomt als je het experiment heel vaak zou herhalen.",
    "Met of zonder teruglegging: met teruglegging blijven de trekkingen onafhankelijk, zonder teruglegging beïnvloeden ze elkaar.",
    "Kansmodel: de lijst van alle mogelijke uitkomsten met de kans op elk daarvan. De uitkomstenruimte S is de verzameling van al die mogelijke uitkomsten.",
    "Voorwaardelijke kans: de kans op A gegeven dat B al gebeurd is. Je rekent dan enkel nog binnen B.",
    "Stochastische variabele: een grootheid waarvan de waarde door toeval bepaald wordt, bijvoorbeeld het aantal klanten per uur.",
    "Discreet tegenover continu: discrete variabelen tel je, elke waarde heeft een eigen kans en samen tellen die op tot 1. Continue variabelen meet je, daar werk je met een dichtheidsfunctie en zijn kansen oppervlakten.",
    "EAS: een eenvoudige aselecte steekproef, waarbij iedereen in de populatie evenveel kans heeft om gekozen te worden.",
    "De vijf kansregels: elke kans ligt tussen 0 en 1, de kans op de hele uitkomstenruimte is 1, de optelregel is P(A of B) = P(A) + P(B) min P(A en B), de complementregel is P(niet A) = 1 min P(A), en de productregel is P(A en B) = P(A) maal P(B gegeven A).",
    "Stochastische onafhankelijkheid: A en B zijn onafhankelijk als B geen invloed heeft op de kans op A. Dan geldt P(A gegeven B) = P(A) en P(A en B) = P(A) maal P(B).",
    "Regel van Bayes: hiermee keer je een voorwaardelijke kans om, dus van de kans op B gegeven A naar de kans op A gegeven B.",
    "Standaardnormaalverdeling: door waarden om te zetten naar z-scores herleid je elke normaalverdeling tot N(0,1), zodat je alle kansen uit één tabel kan aflezen.",
    "Wet van de grote getallen: hoe groter je steekproef, hoe dichter het steekproefgemiddelde bij het echte populatiegemiddelde komt te liggen.",
    "Steekproefvariabiliteit: elke nieuwe steekproef geeft een ander gemiddelde, ook al verandert er niets aan de populatie.",
    "Parameter tegenover statistiek: een parameter beschrijft de populatie en is theoretisch, meestal met een Griekse letter. Een statistiek bereken je uit je eigen steekproef.",
    "Steekproefverdeling tegenover steekproevenverdeling: de steekproefverdeling is die van je eigen steekproef, die ken je en kan je meten. De steekproevenverdeling is theoretisch, namelijk de verdeling van het gemiddelde over alle mogelijke steekproeven. Het is die tweede die bij voldoende grote n naar een normaalverdeling neigt. Deze twee worden op het examen graag verwisseld.",
    "Standaardfout: de standaardafwijking van de steekproevenverdeling van het gemiddelde. Ze zegt hoe hard je gemiddelde zou schommelen als je heel veel steekproeven zou nemen.",
    "Een grotere steekproef maakt je schatting stabieler en de standaardfout kleiner, maar lost systematische fouten niet op.",
    "Centrale limietstelling: bij voldoende grote n benadert de steekproevenverdeling van het gemiddelde een normaalverdeling, ook als de populatie zelf niet normaal verdeeld is.",
    "Binomiale situatie, te onthouden als BOAS: binair, onafhankelijk, aantal pogingen ligt vooraf vast, en steeds dezelfde succeskans. Dat laatste betekent met teruglegging.",
    "Binomiaalcoëfficiënt: het aantal volgorden waarop k successen kunnen voorkomen in n waarnemingen. De binomiale kans is dat aantal maal de kans op elke afzonderlijke volgorde.",
    "Vorm van de binomiale verdeling: ligt de kans dicht bij nul, dan is ze scheef. Hoe dichter bij vijftig procent, hoe symmetrischer.",
    "Normale benadering van de binomiale verdeling: toegestaan als n maal p en n maal q allebei minstens 10 zijn. Omdat je iets discreets benadert met iets continus, hoort daar een continuïteitscorrectie bij.",
    "Vuistregel N groter dan of gelijk aan 20n: bij een heel grote populatie maakt het nauwelijks nog verschil of je met of zonder teruglegging trekt.",
    "Zuiver, efficiënt en consistent: een schatter is zuiver als hij gemiddeld precies de echte waarde geeft, efficiënt als de schattingen dicht bij elkaar liggen, en consistent als hij nauwkeuriger wordt naarmate n groeit.",
    "Twee manieren van inferentie: met een betrouwbaarheidsinterval schat je waar de populatiewaarde ongeveer ligt, met een significantietoets controleer je of een bestaande claim klopt.",
    "Puntschatting tegenover intervalschatting: één exact getal tegenover een gebied met een foutenmarge eromheen.",
    "Overschrijdingskans p: de kans op een resultaat dat minstens zo extreem is als het jouwe, in de veronderstelling dat H0 waar is.",
    "Alfa: de grootste toevalskans die je nog aanvaardbaar vindt, meestal vijf procent. Is p kleiner dan alfa, dan is het resultaat significant.",
    "H0 en HA: de nulhypothese gaat uit van geen effect. Verwerp je H0 niet, dan heb je onvoldoende bewijs, wat iets anders is dan bewijs dat H0 waar is. Eenzijdig toets je op groter of kleiner, tweezijdig op verschillend.",
    "De vier stappen van een significantietoets: hypothesen en voorwaarden opschrijven, de toetsingsgrootheid berekenen, de overschrijdingskans bepalen, en besluiten in APA-stijl.",
    "z-waarde tegenover kritieke z-waarde: de z-waarde zegt hoeveel standaardafwijkingen jouw waarde van het gemiddelde ligt. De kritieke z-waarde is de vaste grens uit de tabel en is altijd positief.",
    "Significant: het resultaat is zo extreem dat toeval als verklaring onwaarschijnlijk wordt. Niet significant betekent dat toeval het nog steeds kan verklaren."
   ]
  }
 ]
};
