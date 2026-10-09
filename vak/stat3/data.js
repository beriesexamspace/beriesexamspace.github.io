// Vak "Statistiek III: univariate data-analyse" (2ba), automatisch omgezet vanaf de oude site op 2026-09-14.
// Formaat: zie README, kop "Vakpagina". Aanpassen kan hier; de pagina (index.html) hoeft niet te veranderen.
window.BES_VAK = {
 "id": "stat3",
 "jaar": "2ba",
 "naam": "Statistiek III: univariate data-analyse",
 "hoofdstukken": [
  {
   "id": "h1",
   "naam": "z-toets & onderscheidingsvermogen"
  },
  {
   "id": "h2",
   "naam": "t-toetsen (one sample, paired, ongepaard)"
  },
  {
   "id": "h3",
   "naam": "Proportie- & niet-parametrische toetsen"
  },
  {
   "id": "h4",
   "naam": "Chi-kwadraat & verdelingstoetsen"
  },
  {
   "id": "h5",
   "naam": "Enkelvoudige lineaire regressie"
  },
  {
   "id": "h6",
   "naam": "Correlatie & ANOVA"
  }
 ],
 "vragen": [
  {
   "h": "h1",
   "q": "Een significantietoets volgens de vier stappen begint met een eerste stap. Wat gebeurt er in die eerste stap?",
   "o": [
    "Het formuleren van de conclusie in APA-stijl",
    "Het berekenen van de toetsingsgrootheid z uit het steekproefgemiddelde",
    "Het bepalen van de overschrijdingskans p voor de data",
    "Het formuleren van de nulhypothese H0 en de alternatieve hypothese Ha"
   ],
   "a": 3,
   "u": "De vier stappen zijn: 1) formuleer H0 en Ha, 2) bereken de toetsingsgrootheid, 3) bereken p, 4) formuleer de conclusie. De hypothesen opstellen komt eerst."
  },
  {
   "h": "h1",
   "q": "Bij een z-toets luidt de nulhypothese H0: µ = µ0. Wat is de correcte betekenis hiervan?",
   "o": [
    "Het steekproefgemiddelde is precies gelijk aan µ0",
    "Het populatiegemiddelde is gelijk aan de veronderstelde waarde µ0",
    "De standaardafwijking van de populatie is onbekend",
    "Het populatiegemiddelde wijkt significant af van de veronderstelde waarde"
   ],
   "a": 1,
   "u": "Bij de z-toets stelt H0 dat het populatiegemiddelde gelijk is aan de veronderstelde waarde µ0. De alternatieve hypothese Ha kan µ kleiner, groter of ongelijk aan µ0 stellen."
  },
  {
   "h": "h1",
   "q": "In een studie worden dezelfde proefpersonen twee keer gemeten, bijvoorbeeld voor en na een interventie. Om welk type steekproeven gaat het dan?",
   "o": [
    "Gepaarde steekproeven (paired samples)",
    "Ongepaarde steekproeven (unpaired samples)",
    "Onafhankelijke steekproeven",
    "Aselecte steekproeven"
   ],
   "a": 0,
   "u": "Twee herhaalde metingen bij dezelfde eenheden leveren gepaarde steekproeven (paired samples) op. Ongepaarde steekproeven bestaan uit verschillende, losstaande groepen."
  },
  {
   "h": "h1",
   "q": "Na het berekenen van de overschrijdingskans p volgt de beslissing. Wanneer wordt de nulhypothese verworpen?",
   "o": [
    "Wanneer het steekproefgemiddelde gelijk is aan µ0",
    "Wanneer p kleiner is dan of gelijk aan het significantieniveau alfa",
    "Wanneer de toetsingsgrootheid z in absolute waarde kleiner is dan 1.96",
    "Wanneer p groter is dan het significantieniveau alfa"
   ],
   "a": 1,
   "u": "Als p kleiner dan of gelijk aan alfa is, verwerpen we H0 omdat er voldoende bewijs tegen H0 is. Is p groter dan alfa, dan aanvaarden we H0."
  },
  {
   "h": "h1",
   "q": "Bij het onderscheidingsvermogen van een toets houdt men rekening met twee soorten fouten. Wat is de fout van de eerste soort (alfa)?",
   "o": [
    "De kans dat H0 aanvaard wordt terwijl Ha eigenlijk correct is",
    "De kans dat H0 verworpen wordt terwijl Ha ook echt correct is",
    "De kans dat de steekproef niet normaal verdeeld is",
    "De kans dat H0 verworpen wordt terwijl H0 eigenlijk correct is"
   ],
   "a": 3,
   "u": "De fout van de eerste soort (alfa) is de kans dat de nulhypothese verworpen wordt terwijl ze eigenlijk correct is, genoteerd als P[H0 verwerpen / H0 correct]."
  },
  {
   "h": "h1",
   "q": "Het onderscheidingsvermogen (power) van een toets wordt gedefinieerd als 1 min bèta. Wat drukt de power precies uit?",
   "o": [
    "De kans dat H0 aanvaard wordt terwijl de alternatieve hypothese correct is",
    "De kans dat H0 verworpen wordt terwijl de nulhypothese eigenlijk correct is",
    "De kans dat H0 verworpen wordt terwijl de alternatieve hypothese ook echt correct is",
    "De kans op een fout van de tweede soort"
   ],
   "a": 2,
   "u": "Power (1 min bèta) is de kans dat H0 verworpen wordt wanneer de alternatieve hypothese ook echt correct is, dus P[H0 verwerpen / Ha correct]. Het meet hoe gevoelig de toets is om een verschil te detecteren."
  },
  {
   "h": "h1",
   "q": "Een z-toets levert een significant resultaat op waarbij H0 verworpen wordt. Wat mag men op basis daarvan concluderen?",
   "o": [
    "De nulhypothese is door de data definitief weerlegd, zodat verder onderzoek naar dit effect niet meer nodig is",
    "Het is zeker bewezen dat de alternatieve hypothese waar is, zonder enig risico",
    "Het steekproefgemiddelde is zonder twijfel gelijk aan het populatiegemiddelde",
    "Er is voldoende bewijs voor Ha, maar er blijft een risico dat toevallig een uitzonderlijke steekproef werd getrokken"
   ],
   "a": 3,
   "u": "Een significant resultaat geeft voldoende bewijs voor Ha, maar het blijft mogelijk dat toevallig een uitzonderlijke steekproef getrokken werd. Bij het verwerpen neemt men een risico gelijk aan alfa om een verkeerde beslissing te nemen."
  },
  {
   "h": "h2",
   "q": "Een onderzoeker heeft 1 steekproef en wil het gemiddelde vergelijken met een bekende referentiewaarde. De populatiestandaardafwijking sigma is onbekend. Welke toets is aangewezen?",
   "o": [
    "gepaarde t-test",
    "z-test",
    "one sample t-test",
    "ongepaarde t-test"
   ],
   "a": 2,
   "u": "Bij 1 steekproef waarvan het gemiddelde met een vaste waarde vergeleken wordt en sigma onbekend is, gebruik je de one sample t-test met s als schatter voor sigma."
  },
  {
   "h": "h2",
   "q": "Wat is het cruciale verschil tussen de z-test en de t-test wat betreft de veronderstelde kennis over de populatie?",
   "o": [
    "De z-test werkt enkel met ratiodata en de t-test met ordinale data",
    "De z-test heeft vrijheidsgraden en de t-test niet",
    "Bij de z-test is mu bekend en bij de t-test niet",
    "Bij de z-test is sigma bekend en bij de t-test onbekend"
   ],
   "a": 3,
   "u": "Bij de z-test is sigma bekend, bij de t-test is sigma onbekend en wordt geschat met s. In beide gevallen is mu onbekend en wordt geschat met het steekproefgemiddelde."
  },
  {
   "h": "h2",
   "q": "Bij de one sample t-test hoort een specifieke t-verdeling. Waarvan hangt het aantal vrijheidsgraden af?",
   "o": [
    "Van het gekozen significantieniveau alfa",
    "Van de steekproefgrootte, namelijk n minus 1",
    "Van het aantal behandelingen in het design",
    "Van de bekende waarde van sigma"
   ],
   "a": 1,
   "u": "De t-toetsingsgrootheid heeft n minus 1 vrijheidsgraden, dus voor elke n bestaat er een andere t-verdeling."
  },
  {
   "h": "h2",
   "q": "In een design met gepaarde data wil je het verschil in responsen op twee behandelingen nagaan. Hoe pakt de gepaarde t-test dit conceptueel aan?",
   "o": [
    "Ze gebruikt de grootste van de twee steekproeven als referentie",
    "Ze telt de scores van beide metingen per persoon op en toetst die somscores tegen een verwacht totaal",
    "Ze berekent per paar het verschil en past daarop een 1-steekproef t-procedure toe",
    "Ze vergelijkt de twee groepsgemiddelden rechtstreeks met elkaar"
   ],
   "a": 2,
   "u": "Bij gepaarde data wordt per paar i het verschil x_i1 min x_i2 berekend, en op die verschilscores wordt een 1-steekproef t-procedure toegepast."
  },
  {
   "h": "h2",
   "q": "Een klas van 30 kinderen legt eerst een toets af en na een extra les nogmaals dezelfde toets. Je wil weten of de score verbeterde. Welke toets is aangewezen?",
   "o": [
    "Gepaarde t-test",
    "one sample t-test",
    "z-test",
    "Ongepaarde t-test"
   ],
   "a": 0,
   "u": "Dezelfde steekproef wordt twee keer gemeten (voor en na), dus de metingen zijn gepaard. Daarom is de gepaarde t-test de aangewezen toets."
  },
  {
   "h": "h2",
   "q": "Twee assistenten begeleiden elk hun eigen, onafhankelijke groep studenten. Je wil nagaan of de ene assistent gemiddeld meer studenten begeleidt. Welke toets past hier?",
   "o": [
    "z-test",
    "one sample t-test",
    "Gepaarde t-test",
    "Ongepaarde t-test"
   ],
   "a": 3,
   "u": "Het gaat om twee onafhankelijke (ongepaarde) steekproeven waarvan de gemiddelden vergeleken worden, dus de ongepaarde t-test is aangewezen."
  },
  {
   "h": "h2",
   "q": "Wat is de nulhypothese bij een one sample t-test?",
   "o": [
    "sigma is gelijk aan s",
    "mu is groter dan mu0",
    "mu is gelijk aan mu0",
    "mu is verschillend van mu0"
   ],
   "a": 2,
   "u": "De nulhypothese stelt dat het populatiegemiddelde gelijk is aan de referentiewaarde: H0: mu = mu0. De alternatieve hypothese kan dan groter dan, kleiner dan of verschillend van zijn."
  },
  {
   "h": "h2",
   "q": "Welke voorwaarde moet vervuld zijn opdat een one sample t-test toepasbaar is?",
   "o": [
    "Er moeten precies twee onafhankelijke steekproeven zijn",
    "n moet minstens 30 zijn of de data moet normaal verdeeld zijn",
    "De data moet minstens ordinaal zijn en de groepen gepaard",
    "Sigma moet bekend zijn"
   ],
   "a": 1,
   "u": "De t-test vereist dat n groter of gelijk aan 30 is, of dat de data normaal verdeeld is, zodat de toetsingsgrootheid een t-verdeling volgt."
  },
  {
   "h": "h2",
   "q": "Aan welke voorwaarde over normaliteit moet voldaan zijn bij een gepaarde t-test wanneer n kleiner is dan 30?",
   "o": [
    "De verschilscores moeten normaal verdeeld zijn",
    "Enkel de eerste meting moet normaal verdeeld zijn",
    "Beide oorspronkelijke metingen moeten apart normaal verdeeld zijn",
    "Er is geen enkele normaliteitsvoorwaarde nodig"
   ],
   "a": 0,
   "u": "Bij de gepaarde t-test geldt dat n groter of gelijk aan 30 moet zijn of dat de verschilscores normaal verdeeld zijn, want de toets werkt op die verschilscores."
  },
  {
   "h": "h2",
   "q": "Waarin verschilt de normaliteitsvoorwaarde van de ongepaarde t-test van die van de gepaarde t-test wanneer de steekproeven klein zijn?",
   "o": [
    "Bij de ongepaarde t-test moeten enkel de verschilscores normaal zijn",
    "Bij de ongepaarde t-test moeten beide steekproeven elk uit een normaal verdeelde populatie komen",
    "Bij de ongepaarde t-test volstaat het dat een van beide steekproeven normaal is",
    "Bij de ongepaarde t-test is normaliteit niet vereist, omdat het verschil tussen twee gemiddelden altijd normaal verdeeld is"
   ],
   "a": 1,
   "u": "De ongepaarde t-test vereist dat n1 en n2 elk minstens 30 zijn, of dat zowel steekproef 1 als steekproef 2 uit een normaal verdeelde populatie komt."
  },
  {
   "h": "h2",
   "q": "Je vergelijkt de geobserveerde overschrijdingskans p met het significantieniveau alfa. Wanneer verwerp je de nulhypothese?",
   "o": [
    "Wanneer p kleiner is dan alfa",
    "Wanneer p groter is dan 0.25",
    "Wanneer p groter is dan alfa",
    "Wanneer p gelijk is aan alfa"
   ],
   "a": 0,
   "u": "Als p kleiner is dan alfa, is er voldoende bewijs tegen H0 en wordt H0 verworpen. Is p groter dan alfa, dan wordt H0 aanvaard."
  },
  {
   "h": "h3",
   "q": "Een onderzoeker heeft 1 steekproef van 500 aardappelen en registreert per aardappel of die gekneusd is of niet. De vraag is of de proportie gekneusde aardappelen groter is dan 8%. Welke toets is hier het meest aangewezen?",
   "o": [
    "One sample t-test",
    "One sample proportietest",
    "Wilcoxon rangsomtest",
    "Two samples proportietest"
   ],
   "a": 1,
   "u": "Er is 1 steekproef en de variabele is nominaal (gekneusd of niet). Dat wijst op de one sample proportietest."
  },
  {
   "h": "h3",
   "q": "Wat is de voorwaarde die vervuld moet zijn om een one sample proportietest te mogen gebruiken?",
   "o": [
    "Het aantal successen #p is minstens 10 en het aantal mislukkingen #q is minstens 10",
    "De data moeten op ordinaal niveau gemeten zijn",
    "De steekproef moet minstens 30 observaties bevatten",
    "De verschilscores tussen de twee metingen moeten bij benadering normaal verdeeld zijn"
   ],
   "a": 0,
   "u": "De one sample proportietest vereist dat #p groter of gelijk is aan 10 en #q groter of gelijk is aan 10, zodat de normale benadering geldig is."
  },
  {
   "h": "h3",
   "q": "Onderzoekers vergelijken twee lagere scholen op het aantal kinderen dat zonder ontbijt naar school komt. Het gaat om 2 ongepaarde steekproeven en de variabele is nominaal (ontbeten of niet). Welke toets past hierbij?",
   "o": [
    "Wilcoxon rangtekentest",
    "Two samples proportietest",
    "One sample proportietest",
    "Gepaarde t-test"
   ],
   "a": 1,
   "u": "Twee ongepaarde steekproeven met een nominale variabele leiden tot de two samples proportietest."
  },
  {
   "h": "h3",
   "q": "Bij een significantietoets over een proportie geldt: de p-waarde is 0.1251 en het significantieniveau is alfa = 0.02. Wat is de correcte beslissing?",
   "o": [
    "De nulhypothese verwerpen omdat p groter is dan alfa",
    "Geen beslissing mogelijk zonder de z-waarde",
    "De nulhypothese aanvaarden omdat p groter is dan alfa",
    "De nulhypothese verwerpen omdat p kleiner is dan alfa"
   ],
   "a": 2,
   "u": "Wanneer de p-waarde groter is dan alfa, is er onvoldoende bewijs tegen H0 en wordt de nulhypothese aanvaard."
  },
  {
   "h": "h3",
   "q": "In welke situatie is de Wilcoxon rangsomtest de aangewezen toets?",
   "o": [
    "Bij 2 gepaarde steekproeven op ordinaal niveau",
    "Bij 1 steekproef met een nominale variabele",
    "Bij 2 gepaarde steekproeven op interval niveau die aan de t-test voorwaarden voldoen",
    "Bij 2 ongepaarde steekproeven op ordinaal niveau"
   ],
   "a": 3,
   "u": "De Wilcoxon rangsomtest wordt gebruikt bij 2 ongepaarde steekproeven op ordinaal niveau, of bij interval- of ratiodata die niet aan de voorwaarden van de ongepaarde t-test voldoen."
  },
  {
   "h": "h3",
   "q": "Een onderzoeker heeft 2 gepaarde steekproeven op ratio niveau (hartslag voor en na een filmpje), maar de verschilscores zijn niet normaal verdeeld en n is kleiner dan 30. Welke toets is dan het meest aangewezen?",
   "o": [
    "Wilcoxon rangtekentest",
    "Two samples proportietest",
    "Wilcoxon rangsomtest",
    "Gepaarde t-test"
   ],
   "a": 0,
   "u": "Bij 2 gepaarde steekproeven waarvan de verschilscores niet normaal verdeeld zijn en n klein is, wijkt men van de gepaarde t-test af naar de Wilcoxon rangtekentest."
  },
  {
   "h": "h3",
   "q": "Hoe verschillen de Wilcoxon rangsomtest en de Wilcoxon rangtekentest van elkaar qua onderzoeksdesign?",
   "o": [
    "De rangsomtest is voor nominale data, de rangtekentest voor ordinale data",
    "De rangsomtest is voor gepaarde steekproeven, de rangtekentest voor ongepaarde steekproeven",
    "De rangsomtest is voor ongepaarde steekproeven, de rangtekentest voor gepaarde steekproeven",
    "De rangsomtest gebruikt 1 steekproef, de rangtekentest 2 steekproeven"
   ],
   "a": 2,
   "u": "De Wilcoxon rangsomtest hoort bij 2 ongepaarde steekproeven, terwijl de Wilcoxon rangtekentest bij 2 gepaarde steekproeven (tweemaal gemeten) hoort."
  },
  {
   "h": "h3",
   "q": "Bij de Wilcoxon rangtekentest wordt de toetsingsgrootheid V bepaald als het minimum van de som van de positieve en de som van de negatieve rangen. Hoe worden paren met een verschilscore D = 0 behandeld?",
   "o": [
    "Ze worden niet gebruikt, waardoor n daalt",
    "Ze krijgen automatisch de laagste rang",
    "Ze bepalen de mediaan van de verschilscores",
    "Ze worden dubbel geteld"
   ],
   "a": 0,
   "u": "Paren met D = 0 worden niet meegenomen in de toets, zodat de effectieve steekproefgrootte n daalt (bijvoorbeeld van 16 naar 15)."
  },
  {
   "h": "h3",
   "q": "Bij een tweezijdige proportietoets met een betrouwbaarheidsinterval van 95% controleert men of de hypothesewaarde p0 = 0 binnen het interval ligt. Wat betekent het als p0 binnen het BI valt?",
   "o": [
    "De steekproef is te klein",
    "De nulhypothese wordt verworpen",
    "De nulhypothese wordt aanvaard",
    "De toets is niet significant op het 90% niveau"
   ],
   "a": 2,
   "u": "Als de veronderstelde waarde p0 binnen het betrouwbaarheidsinterval ligt, is er onvoldoende bewijs tegen H0 en wordt de nulhypothese aanvaard."
  },
  {
   "h": "h3",
   "q": "Waarmee komt een tweezijdig betrouwbaarheidsinterval van 95% overeen wat betreft het significantieniveau?",
   "o": [
    "Met een tweezijdige alfa van 2.5%",
    "Met een tweezijdige alfa van 10%",
    "Met een eenzijdige alfa van 5%, dus samen 10% verdeeld over beide staarten",
    "Met een tweezijdige alfa van 5% of een eenzijdige alfa van 2.5%"
   ],
   "a": 3,
   "u": "Een tweezijdig BI van 95% komt overeen met een tweezijdige alfa van 5% of, equivalent, met een eenzijdige alfa van 2.5%."
  },
  {
   "h": "h4",
   "q": "Een onderzoeker wil nagaan of er een significant verband bestaat tussen twee variabelen, waarvan er minstens een op nominaal niveau gemeten wordt. Welke toets is hiervoor het meest aangewezen?",
   "o": [
    "Chi-kwadraat afhankelijkheidstoets",
    "Chi-kwadraat toets voor een normale verdeling",
    "Chi-kwadraat verdelingstoets",
    "Kolmogorov-Smirnov test"
   ],
   "a": 0,
   "u": "De chi-kwadraat afhankelijkheidstoets gaat na of er een significant verband bestaat tussen twee variabelen waarbij minstens een variabele op nominaal niveau gemeten wordt."
  },
  {
   "h": "h4",
   "q": "Men wil nagaan of de waargenomen kleurverdeling van rozen, gemeten op nominaal niveau, significant afwijkt van een op voorhand vooropgestelde verdeling van 60% rood, 25% wit en 15% roze. Welke toets past hier?",
   "o": [
    "Chi-kwadraat afhankelijkheidstoets met continuiteitscorrectie",
    "Kolmogorov-Smirnov test",
    "Chi-kwadraat verdelingstoets",
    "Chi-kwadraat afhankelijkheidstoets"
   ],
   "a": 2,
   "u": "De chi-kwadraat verdelingstoets gaat na of de verdeling van een op nominaal niveau gemeten variabele significant afwijkt van een theoretische verdeling, zoals hier de opgegeven percentages."
  },
  {
   "h": "h4",
   "q": "Bij een chi-kwadraat afhankelijkheidstoets luidt de nulhypothese dat de twee variabelen stochastisch onafhankelijk zijn. Wat stelt de alternatieve hypothese dan?",
   "o": [
    "De twee variabelen zijn normaal verdeeld",
    "De twee variabelen zijn stochastisch afhankelijk",
    "De verwachte frequenties zijn allemaal groter dan 5",
    "De verdeling wijkt niet af van de referentieverdeling"
   ],
   "a": 1,
   "u": "Bij de chi-kwadraat afhankelijkheidstoets stelt H0 dat de variabelen stochastisch onafhankelijk zijn en HA dat ze stochastisch afhankelijk zijn."
  },
  {
   "h": "h4",
   "q": "Welke voorwaarde geldt voor de verwachte frequenties bij een chi-kwadraat toets met meer dan 1 vrijheidsgraad?",
   "o": [
    "Niet meer dan 20% van de verwachte frequenties mag kleiner zijn dan 5",
    "Alle waargenomen frequenties moeten normaal verdeeld zijn",
    "De steekproefomvang moet minstens 35 waarnemingen per cel van de tabel bedragen",
    "Elke verwachte frequentie moet groter of gelijk zijn aan 5"
   ],
   "a": 0,
   "u": "Bij df groter dan 1 mag niet meer dan 20% van de verwachte frequenties kleiner zijn dan 5. Enkel wanneer df gelijk is aan 1 moet elke verwachte celfrequentie groter of gelijk aan 5 zijn."
  },
  {
   "h": "h4",
   "q": "Bij een chi-kwadraat toets met df gelijk aan 1 geldt een strengere eis dan bij meer vrijheidsgraden. Welke?",
   "o": [
    "Er mogen geen waargenomen frequenties gelijk zijn aan nul",
    "Elke verwachte celfrequentie moet groter of gelijk zijn aan 5",
    "De steekproef moet minstens 35 waarnemingen bevatten",
    "Niet meer dan 20% van de verwachte frequenties mag kleiner zijn dan 5"
   ],
   "a": 1,
   "u": "Wanneer df gelijk is aan 1 volstaat de 20%-regel niet: dan moet elke verwachte celfrequentie groter of gelijk aan 5 zijn."
  },
  {
   "h": "h4",
   "q": "Naast de eis over frequenties kleiner dan 5, geldt er bij zowel de chi-kwadraat afhankelijkheidstoets als de verdelingstoets nog een tweede voorwaarde over de verwachte frequenties. Welke?",
   "o": [
    "Elke verwachte frequentie moet gelijk zijn aan de waargenomen frequentie",
    "De verwachte frequenties moeten uniform verdeeld zijn",
    "De som van de verwachte frequenties moet kleiner zijn dan N",
    "Geen enkele verwachte frequentie mag gelijk zijn aan nul"
   ],
   "a": 3,
   "u": "Een tweede voorwaarde bij beide chi-kwadraat toetsen is dat geen enkele verwachte frequentie gelijk mag zijn aan nul."
  },
  {
   "h": "h4",
   "q": "Men wil nagaan of de verdeling van een variabele die minstens op ordinaal niveau gemeten wordt significant afwijkt van een theoretische verdeling, bijvoorbeeld of dobbelsteenworpen uit een uniforme verdeling komen. Welke toets is hier aangewezen?",
   "o": [
    "Chi-kwadraat verdelingstoets",
    "Chi-kwadraat toets zonder continuiteitscorrectie",
    "Chi-kwadraat afhankelijkheidstoets",
    "Kolmogorov-Smirnov test"
   ],
   "a": 3,
   "u": "De Kolmogorov-Smirnov test gaat na of de verdeling van een minstens ordinaal gemeten variabele significant afwijkt van een theoretische verdeling, zoals een uniforme of normale verdeling."
  },
  {
   "h": "h4",
   "q": "Bij de Kolmogorov-Smirnov test besluit men op basis van het maximale absolute verschil tussen de cumulatieve verdelingen. In een analyse van dobbelsteenworpen blijkt de kritieke waarde groter dan dit maximale verschil, zodat H0 aanvaard wordt. Hoe interpreteer je dit resultaat?",
   "o": [
    "De voorwaarde n groter of gelijk aan 35 is niet voldaan",
    "Er is onvoldoende bewijs om te stellen dat de dobbelsteen niet zuiver is",
    "De waarnemingen wijken significant af van de uniforme verdeling",
    "Er is voldoende bewijs dat de dobbelsteen niet zuiver is"
   ],
   "a": 1,
   "u": "Wanneer H0 aanvaard wordt, is er onvoldoende bewijs om te stellen dat de dobbelsteen niet zuiver is; de waargenomen verdeling wijkt niet meer af dan verwacht bij random steekproeven uit de referentieverdeling."
  },
  {
   "h": "h4",
   "q": "Welke voorwaarde qua steekproefomvang wordt in de bron vermeld bij het toepassen van de Kolmogorov-Smirnov test?",
   "o": [
    "De steekproef moet minstens 35 waarnemingen bevatten",
    "Elke verwachte celfrequentie moet groter of gelijk aan 5 zijn",
    "Er zijn minstens twee variabelen op nominaal niveau nodig",
    "Niet meer dan 20% van de verwachte frequenties mag kleiner zijn dan 5"
   ],
   "a": 0,
   "u": "Bij de Kolmogorov-Smirnov test geldt als voorwaarde dat de steekproefomvang minstens 35 bedraagt (n groter of gelijk aan 35)."
  },
  {
   "h": "h4",
   "q": "Op welk meetniveau moet de variabele minstens gemeten zijn om een chi-kwadraat verdelingstoets zinvol toe te passen?",
   "o": [
    "Normaal verdeeld op continue schaal",
    "Nominaal niveau",
    "Ordinaal niveau",
    "Interval- of rationiveau"
   ],
   "a": 1,
   "u": "De chi-kwadraat verdelingstoets gaat na of de verdeling van een op nominaal niveau gemeten variabele significant afwijkt van een theoretische verdeling."
  },
  {
   "h": "h5",
   "q": "In de context van regressie-analyse (inferentie) wordt de regressielijn die je uit een steekproef berekent gebruikt als:",
   "o": [
    "een louter beschrijvende samenvatting van precies die steekproefpunten, zonder betekenis daarbuiten",
    "een schatter van de 'werkelijke' regressielijn voor de populatie",
    "een exacte weergave die identiek is aan de populatieregressielijn",
    "een toets die enkel het meetniveau van de variabelen controleert"
   ],
   "a": 1,
   "u": "Bij regressie-analyse (inferentie) gebruik je een steekproef om populatiewaarden te schatten. De berekende regressielijn dient als schatter van de werkelijke regressielijn voor de populatie."
  },
  {
   "h": "h5",
   "q": "Wat is het onderscheid tussen 'regressie als beschrijving' en 'regressie-analyse'?",
   "o": [
    "Regressie als beschrijving is inferentieel, regressie-analyse is louter beschrijvend",
    "Regressie-analyse vereist geen steekproef, beschrijvende regressie wel",
    "Beide benaderingen leveren dezelfde besluiten op, omdat de helling in de steekproef zonder verdere toetsing als de populatiehelling mag gelden",
    "Bij regressie als beschrijving geldt steekproef gelijk aan populatie, terwijl regressie-analyse via inferentie populatiewaarden schat"
   ],
   "a": 3,
   "u": "De regressierechte als beschrijving vat een waargenomen lineair verband samen waarbij steekproef gelijk is aan populatie. Regressie-analyse is inferentieel: een steekproef wordt gebruikt om populatiewaarden te schatten."
  },
  {
   "h": "h5",
   "q": "Bij de toets over de helling in enkelvoudige lineaire regressie luidt de nulhypothese doorgaans:",
   "o": [
    "de helling β1 is verschillend van 0",
    "de determinatiecoëfficiënt r² is gelijk aan 1",
    "de helling β1 is gelijk aan 0",
    "het intercept β0 is gelijk aan 0"
   ],
   "a": 2,
   "u": "In de brontekst wordt de toets gesteld als H0: β1 = 0 tegenover HA: β1 ≠ 0. De nulhypothese stelt dus dat er geen lineair verband (helling nul) is in de populatie."
  },
  {
   "h": "h5",
   "q": "Wat drukt de determinatiecoëfficiënt (r²) uit in een regressiemodel?",
   "o": [
    "het aantal uitschieters dat je moet verwijderen voordat de regressielijn betrouwbaar wordt",
    "de steilheid van de regressielijn in oorspronkelijke eenheden",
    "de kans dat de nulhypothese over de helling waar is",
    "de proportie waarmee de voorspellingsfouten van y verminderen wanneer x gekend is"
   ],
   "a": 3,
   "u": "Volgens de brontekst is r² de proportie minder fouten bij de voorspelling van y indien x gekend is. Het geeft dus aan hoeveel de voorspelling verbetert door x mee te nemen."
  },
  {
   "h": "h5",
   "q": "Wat is volgens de brontekst een reden waarom een regressie-analyse ongeldig kan worden?",
   "o": [
    "een determinatiecoëfficiënt hoger dan 0",
    "uitschieters en invloedrijke waarnemingen",
    "een te groot aantal waarnemingen in de steekproef",
    "het gebruik van een steekproef in plaats van de volledige populatie"
   ],
   "a": 1,
   "u": "De opmerking in de brontekst stelt uitdrukkelijk dat uitschieters en invloedrijke waarnemingen de regressie ongeldig kunnen maken."
  },
  {
   "h": "h5",
   "q": "Welk verband bestaat er tussen de F-toets en de t-toets bij enkelvoudige lineaire regressie?",
   "o": [
    "F is gelijk aan t², zodat beide tot dezelfde conclusie leiden",
    "de t-waarde is gelijk aan het kwadraat van de F-waarde",
    "F en t toetsen volledig verschillende hypothesen die niets met elkaar te maken hebben",
    "de F-toets kan enkel gebruikt worden als r² gelijk is aan 0"
   ],
   "a": 0,
   "u": "De brontekst vermeldt bij de F-toets het weetje F = t². Bij enkelvoudige lineaire regressie leiden de F-toets en de t-toets over de helling daardoor tot dezelfde conclusie."
  },
  {
   "h": "h6",
   "q": "Je onderzoekt het verband tussen twee variabelen die beide op ratio-niveau gemeten zijn en waarvan de voorwaarden voldaan zijn. Welke toets is het meest aangewezen?",
   "o": [
    "Pearson's correlatietest",
    "Spearman's rangcorrelatietest",
    "ANOVA",
    "Kendall's tau"
   ],
   "a": 0,
   "u": "Bij een verband tussen twee variabelen op ratio-niveau (of interval) is Pearson's correlatiecoefficient de aangewezen toets. In het voorbeeld waren zowel het aantal GSM-masten als het aantal kankerpatienten op ratio-niveau gemeten."
  },
  {
   "h": "h6",
   "q": "Onder welke voorwaarde mag je Pearson's correlatietest toepassen?",
   "o": [
    "De data zijn bivariaat normaal verdeeld of n is groter dan 25",
    "Beide variabelen moeten ordinaal gemeten zijn",
    "De twee groepen moeten gepaard zijn en even veel waarnemingen bevatten",
    "De steekproefomvang moet minstens 10 bedragen"
   ],
   "a": 0,
   "u": "De voorwaarde voor Pearson is dat de variabelen bivariaat normaal verdeeld zijn, of dat n groter is dan 25. De voorwaarde n groter of gelijk aan 10 hoort daarentegen bij de rangcorrelatietesten."
  },
  {
   "h": "h6",
   "q": "Twee variabelen zijn beide op ordinale schaal gemeten en je wil hun samenhang toetsen. Welke toets past hierbij?",
   "o": [
    "Een ANOVA op de gemiddelde rangscores van beide variabelen",
    "Pearson's correlatietest",
    "Een rangcorrelatietest zoals Spearman of Kendall",
    "Een gepaarde t-toets"
   ],
   "a": 2,
   "u": "Bij ordinaal gemeten variabelen gebruik je een rangcorrelatiecoefficient, namelijk Spearman of Kendall. Pearson vereist minstens interval- of ratio-niveau."
  },
  {
   "h": "h6",
   "q": "Wat is de nulhypothese bij Pearson's correlatietest?",
   "o": [
    "tau is gelijk aan 0",
    "alle groepsgemiddelden zijn gelijk",
    "r is verschillend van 0",
    "r is gelijk aan 0"
   ],
   "a": 3,
   "u": "Bij Pearson luidt de nulhypothese H0: r = 0, wat betekent dat er geen lineair verband is. De alternatieve hypothese is HA: r is verschillend van 0."
  },
  {
   "h": "h6",
   "q": "Welke voorwaarde geldt voor de rangcorrelatietesten Spearman en Kendall?",
   "o": [
    "De data zijn bivariaat normaal verdeeld",
    "n is groter dan 25",
    "De variabelen moeten op ratio-niveau gemeten zijn",
    "n is groter of gelijk aan 10"
   ],
   "a": 3,
   "u": "Zowel Spearman als Kendall vereisen een steekproefomvang van minstens 10 (n groter of gelijk aan 10). In de voorbeeldoefeningen was n gelijk aan 10, dus de voorwaarde was voldaan."
  },
  {
   "h": "h6",
   "q": "Bij welk onderzoeksdesign is ANOVA de aangewezen toets?",
   "o": [
    "Bij het toetsen van een lineair verband tussen twee ratio-variabelen",
    "Bij het vergelijken van twee gepaarde metingen bij dezelfde proefpersonen op een ratio-variabele",
    "Bij het vergelijken van drie of meer ongepaarde steekproeven op een ratio-variabele",
    "Bij een verband tussen twee ordinale variabelen"
   ],
   "a": 2,
   "u": "ANOVA gebruik je bij drie of meer ongepaarde steekproeven, oftewel een categorische variabele met meerdere groepen, terwijl de uitkomstvariabele op ratio-niveau gemeten is. In het voorbeeld waren er 3 ongepaarde groepen (onderwijsvormen)."
  },
  {
   "h": "h6",
   "q": "Hoe luidt de nulhypothese bij een ANOVA?",
   "o": [
    "Er is geen verschil tussen de gemiddelden van de groepen",
    "Er is minstens 1 gemiddelde dat verschilt van de andere gemiddelden",
    "tau is gelijk aan 0",
    "De correlatie tussen de groepen is 0"
   ],
   "a": 0,
   "u": "Bij ANOVA stelt H0 dat er geen verschil is tussen de groepsgemiddelden. De alternatieve hypothese HA stelt dat er minstens 1 gemiddelde is dat verschilt van de andere."
  },
  {
   "h": "h6",
   "q": "Een Spearman-toets levert een significante, hoge positieve rangcorrelatie op (p kleiner dan alfa). Hoe interpreteer je dit resultaat?",
   "o": [
    "Er is geen verband tussen de twee variabelen",
    "De groepsgemiddelden verschillen significant",
    "Er is een significant sterk positief verband tussen de twee variabelen",
    "De data zijn niet normaal verdeeld, wat het gevonden verband onbetrouwbaar maakt"
   ],
   "a": 2,
   "u": "Een significante, hoge positieve rs betekent dat er voldoende bewijs is voor een sterk positief verband tussen de twee ordinale variabelen. In de bron werd dit in APA-stijl zo geformuleerd."
  },
  {
   "h": "h6",
   "q": "Bij de ANOVA-conclusie blijkt de kritieke F-waarde groter dan de geobserveerde F-waarde. Wat is de gepaste beslissing?",
   "o": [
    "De toets is ongeldig omdat de vrijheidsgraden niet kloppen",
    "H0 aanvaarden: onvoldoende bewijs voor een verschil tussen de gemiddelden",
    "H0 verwerpen: er is een significant verschil tussen de gemiddelden",
    "Er is een sterk positief verband tussen de variabelen"
   ],
   "a": 1,
   "u": "Wanneer de kritieke waarde groter is dan de geobserveerde F-waarde, wordt H0 aanvaard. Er is dan onvoldoende bewijs voor een significant verschil tussen de groepsgemiddelden."
  },
  {
   "h": "h6",
   "q": "Volgens de beslissingsregel: wanneer verwerp je de nulhypothese op basis van de p-waarde bij een significantieniveau alfa van 5 procent?",
   "o": [
    "Wanneer de correlatie precies 0 is",
    "Wanneer de toetsingsgrootheid gelijk is aan 0",
    "Wanneer de p-waarde kleiner is dan 0.05",
    "Wanneer de p-waarde groter is dan 0.05"
   ],
   "a": 2,
   "u": "Je verwerpt H0 wanneer de p-waarde kleiner is dan alfa (0.05). In de voorbeelden leidde bijvoorbeeld p kleiner dan 0.04 en p kleiner dan 0.001 telkens tot het verwerpen van H0."
  }
 ],
 "hacks": [
  {
   "h": "algemeen",
   "kop": "Alfa, bèta, power onthouden",
   "t": "Alfa is de fout bij een correcte H0 (je verwerpt ten onrechte), bèta is de fout bij een correcte Ha (je aanvaardt ten onrechte). Power is wat overblijft van bèta: 1 min bèta, dus de kans dat je terecht H0 verwerpt wanneer Ha waar is."
  },
  {
   "h": "algemeen",
   "kop": "Zelfde of anders? Kies je toets",
   "t": "Vraag je eerst af: is er 1 groep vergeleken met een vaste waarde (one sample), dezelfde groep twee keer gemeten (gepaard) of twee losse groepen (ongepaard)? Zo weet je meteen welke t-toets past."
  },
  {
   "h": "algemeen",
   "kop": "Gepaard of niet, dat kies je eerst",
   "t": "Kies eerst het meetniveau: nominaal (categorie ja of nee) wijst op een proportietest, ordinaal wijst op een Wilcoxontoets. Kijk daarna of de steekproeven gepaard (tweemaal dezelfde eenheden, dus rangtekentest) of ongepaard (twee losse groepen, dus rangsomtest) zijn."
  },
  {
   "h": "algemeen",
   "kop": "Afhankelijk versus verdeling",
   "t": "Twee variabelen samen die je vergelijkt, dat is de Afhankelijkheidstoets (hangen ze samen?). Een variabele die je vergelijkt met vaste percentages, dat is de Verdelingstoets. Meet je minstens ordinaal en toets je tegen een hele theoretische verdeling zoals normaal of uniform, denk dan aan Kolmogorov-Smirnov."
  },
  {
   "h": "algemeen",
   "kop": "Nul betekent geen verband",
   "t": "Onthoud dat H0: β1 = 0 altijd 'geen helling, dus geen lineair verband' betekent. Verwerp je H0, dan besluit je dat x en y wel lineair samenhangen in de populatie."
  },
  {
   "h": "algemeen",
   "kop": "Meetniveau kiest je toets",
   "t": "Laat het meetniveau je toets bepalen: ratio of interval met een verband geeft Pearson, ordinaal met een verband geeft Spearman of Kendall, en drie of meer ongepaarde groepen op een ratio-uitkomst geeft ANOVA. Onthoud ook: p kleiner dan alfa betekent H0 verwerpen."
  }
 ],
 "theorie": [
  {
   "h": "h1",
   "kop": "Kernpunten",
   "items": [
    "Significantietoets in 4 stappen: formuleer H0 en Ha, bereken de toetsingsgrootheid, bereken p, formuleer de conclusie in APA-stijl.",
    "z-toets: toets voor het populatiegemiddelde wanneer de populatiestandaardafwijking gekend is.",
    "Nulhypothese H0: stelt dat het populatiegemiddelde gelijk is aan de veronderstelde waarde µ0.",
    "Alternatieve hypothese Ha: kan µ kleiner dan, groter dan of ongelijk aan µ0 stellen (eenzijdig of tweezijdig).",
    "Overschrijdingskans p: de kans op de gevonden data of extremer, verondersteld dat H0 waar is.",
    "Beslissingsregel: is p kleiner dan of gelijk aan alfa dan H0 verwerpen, is p groter dan alfa dan H0 aanvaarden.",
    "Gepaarde steekproeven (paired samples): twee herhaalde metingen bij dezelfde eenheden, bijvoorbeeld voor en na.",
    "Ongepaarde steekproeven (unpaired samples): metingen bij verschillende, losstaande groepen.",
    "Fout van de eerste soort (alfa): de kans dat H0 verworpen wordt terwijl H0 eigenlijk correct is.",
    "Fout van de tweede soort (bèta): de kans dat H0 aanvaard wordt terwijl Ha eigenlijk correct is.",
    "Power of onderscheidingsvermogen (1 min bèta): de kans dat H0 verworpen wordt terwijl Ha ook echt correct is.",
    "Onderscheidingsvermogen meet hoe gevoelig de toets is om een verschil, daling of stijging te detecteren.",
    "Betrouwbaarheidsinterval: kan gebruikt worden om H0 te aanvaarden of te verwerpen op basis van de gevonden marge.",
    "Conclusie in APA-stijl: rapporteer de beslissing samen met de toetsingsgrootheid z en de overschrijdingskans p."
   ]
  },
  {
   "h": "h2",
   "kop": "Kernpunten",
   "items": [
    "z-test: toets voor 1 steekproefgemiddelde wanneer sigma bekend is.",
    "t-test: toets voor 1 steekproefgemiddelde wanneer sigma onbekend is en geschat wordt met s.",
    "one sample t-test: vergelijkt het gemiddelde van 1 steekproef met een vaste referentiewaarde mu0.",
    "Gepaarde t-test: past een 1-steekproef t-procedure toe op de verschilscores van twee metingen bij dezelfde eenheden.",
    "Ongepaarde t-test: vergelijkt de gemiddelden van twee onafhankelijke steekproeven.",
    "Vrijheidsgraden: bij de t-test gelijk aan n min 1, waardoor er voor elke n een andere t-verdeling is.",
    "Nulhypothese H0: stelt dat het gemiddelde gelijk is aan mu0 (of dat het verschil nul is).",
    "Alternatieve hypothese HA: kan eenzijdig (groter dan of kleiner dan) of tweezijdig (verschillend van) zijn.",
    "Overschrijdingskans p: de kans op de geobserveerde of extremere data onder H0, vergeleken met alfa.",
    "Beslisregel: p kleiner dan alfa betekent H0 verwerpen, p groter dan alfa betekent H0 aanvaarden.",
    "Voorwaarde t-test: n groter of gelijk aan 30 of de (verschil)data is normaal verdeeld.",
    "Voorwaarde ongepaarde t-test: n1 en n2 elk minstens 30, of beide steekproeven komen uit een normaal verdeelde populatie.",
    "Betrouwbaarheidsinterval: als de getoetste waarde niet in het BI ligt, wordt H0 verworpen.",
    "Onderscheidingsvermogen (power): de kans om een reeel effect als significant te detecteren."
   ]
  },
  {
   "h": "h3",
   "kop": "Kernpunten",
   "items": [
    "One sample proportietest: toets voor 1 steekproef met een nominale variabele om een proportie te vergelijken met een verwachte waarde p0.",
    "Two samples proportietest: toets voor 2 ongepaarde steekproeven met een nominale variabele om twee proporties met elkaar te vergelijken.",
    "Voorwaarde proportietest: het aantal successen #p en het aantal mislukkingen #q moeten elk minstens 10 zijn.",
    "Nulhypothese proportietest: bij een steekproef stelt H0 dat p gelijk is aan p0, bij twee steekproeven dat p1 min p2 gelijk is aan 0.",
    "Wilcoxon rangsomtest: niet-parametrische toets voor 2 ongepaarde steekproeven op ordinaal niveau, of interval/ratio data die niet aan de ongepaarde t-test voorwaarden voldoen.",
    "Wilcoxon rangtekentest: niet-parametrische toets voor 2 gepaarde steekproeven op ordinaal niveau, of interval/ratio data die niet aan de gepaarde t-test voorwaarden voldoen.",
    "Voorwaarde Wilcoxon rangsomtest: beide steekproeven moeten minstens 10 observaties bevatten.",
    "Voorwaarde Wilcoxon rangtekentest: de steekproef moet minstens 10 observaties bevatten en paren met verschilscore 0 tellen niet mee.",
    "Ongepaarde steekproeven: twee losse groepen die onafhankelijk van elkaar gemeten zijn, zoals kinderen uit twee verschillende scholen.",
    "Gepaarde steekproeven: dezelfde eenheden die tweemaal gemeten worden, zoals hartslag voor en na een filmpje.",
    "Beslisregel: als de p-waarde groter is dan het significantieniveau alfa wordt H0 aanvaard, is de p-waarde kleiner dan alfa dan wordt H0 verworpen.",
    "Betrouwbaarheidsinterval en beslissing: ligt de hypothesewaarde binnen het BI dan wordt H0 aanvaard, ligt ze erbuiten dan wordt H0 verworpen.",
    "Verband BI en alfa: een tweezijdig BI van bijvoorbeeld 95% komt overeen met een tweezijdige alfa van 5% of een eenzijdige alfa van 2.5%."
   ]
  },
  {
   "h": "h4",
   "kop": "Kernpunten",
   "items": [
    "Chi-kwadraat afhankelijkheidstoets: gaat na of er een significant verband bestaat tussen twee variabelen waarbij minstens een variabele op nominaal niveau gemeten wordt.",
    "Chi-kwadraat verdelingstoets: gaat na of de verdeling van een op nominaal niveau gemeten variabele significant afwijkt van een theoretische verdeling.",
    "Nulhypothese afhankelijkheidstoets: de twee variabelen zijn stochastisch onafhankelijk; de alternatieve hypothese stelt dat ze stochastisch afhankelijk zijn.",
    "Nulhypothese verdelingstoets: de waargenomen verdeling komt overeen met de opgegeven theoretische verdeling of percentages.",
    "Verwachte frequentie: de frequentie die je onder de nulhypothese verwacht, bij de verdelingstoets berekend als proportie maal steekproefomvang n.",
    "Voorwaarde 20%-regel: bij df groter dan 1 mag niet meer dan 20% van de verwachte frequenties kleiner zijn dan 5.",
    "Strenge eis bij df gelijk aan 1: dan moet elke verwachte celfrequentie groter of gelijk aan 5 zijn.",
    "Tweede voorwaarde chi-kwadraat: geen enkele verwachte frequentie mag gelijk zijn aan nul.",
    "Vrijheidsgraden afhankelijkheidstoets: df is (r min 1) maal (k min 1), met r rijen en k kolommen.",
    "Vrijheidsgraden verdelingstoets: df is (k min 1), met k het aantal klassen of categorieen.",
    "Kolmogorov-Smirnov test: gaat na of de verdeling van een minstens ordinaal gemeten variabele significant afwijkt van een theoretische verdeling.",
    "KS-nulhypothese: de waargenomen verdeling wijkt niet meer af van de referentieverdeling dan men kan verwachten bij random steekproeven uit die verdeling.",
    "KS-werkwijze: een twee-aan-twee vergelijking tussen waargenomen en verwachte cumulatieve frequenties, waarbij het maximale absolute verschil beslissend is.",
    "Voorwaarde Kolmogorov-Smirnov: de steekproefomvang moet minstens 35 bedragen (n groter of gelijk aan 35)."
   ]
  },
  {
   "h": "h5",
   "kop": "Kernpunten",
   "items": [
    "Regressierechte (beschrijvend): beschrijving van een waargenomen lineair verband waarbij steekproef gelijk is aan populatie.",
    "Regressie-analyse (inferentie): een steekproef gebruiken om populatiewaarden te schatten.",
    "Populatieregressielijn: het werkelijke verband μy = β0 + β1x dat je met de steekproef wil schatten.",
    "Regressielijn als schatter: de berekende lijn schat de werkelijke regressielijn voor de populatie.",
    "β0 (intercept): het snijpunt van de populatieregressielijn met de y-as, geschat door b0.",
    "β1 (helling): de richtingscoëfficiënt van de populatieregressielijn, geschat door b1.",
    "b0 en b1: de schatters die op basis van de steekproef de populatieparameters β0 en β1 benaderen.",
    "Nulhypothese (H0: β1 = 0): stelt dat er geen lineair verband is tussen x en y in de populatie.",
    "Alternatieve hypothese (HA: β1 ≠ 0): stelt dat er wel een lineair verband bestaat.",
    "Determinatiecoëfficiënt (r²): de proportie minder voorspellingsfouten van y wanneer x gekend is.",
    "Uitschieters en invloedrijke waarnemingen: waarnemingen die de regressie ongeldig kunnen maken.",
    "F-toets bij regressie: toetst het model, met de relatie F = t² ten opzichte van de t-toets over de helling."
   ]
  },
  {
   "h": "h6",
   "kop": "Kernpunten",
   "items": [
    "Pearson's correlatietest: toets voor een lineair verband tussen twee variabelen op interval- of ratio-niveau.",
    "Voorwaarde Pearson: de data zijn bivariaat normaal verdeeld of de steekproefomvang n is groter dan 25.",
    "Rangcorrelatietesten: Spearman en Kendall, gebruikt wanneer beide variabelen op ordinale schaal gemeten zijn.",
    "Voorwaarde rangcorrelatie: de steekproefomvang n is minstens 10.",
    "Spearman (rs): rangcorrelatiecoefficient met nulhypothese rs gelijk aan 0.",
    "Kendall (tau): rangcorrelatiecoefficient gebaseerd op concordante en discordante paren, met nulhypothese tau gelijk aan 0.",
    "Nulhypothese correlatie: er is geen verband (r, rs of tau gelijk aan 0); de alternatieve hypothese stelt een verband.",
    "ANOVA: toets om drie of meer ongepaarde groepsgemiddelden te vergelijken op een ratio-variabele.",
    "Design ANOVA: een categorische variabele met meerdere groepen (ongepaarde steekproeven) en een uitkomst op ratio-niveau.",
    "Nulhypothese ANOVA: er is geen verschil tussen de groepsgemiddelden; HA stelt dat minstens 1 gemiddelde verschilt.",
    "F-toets: de toetsingsgrootheid van ANOVA, met vrijheidsgraden (aantal groepen min 1) en (totale n min aantal groepen).",
    "Beslissingsregel p-waarde: verwerp H0 wanneer de p-waarde kleiner is dan alfa (bijvoorbeeld 0.05).",
    "Beslissingsregel kritieke waarde: verwerp H0 wanneer de absolute geobserveerde toetsingsgrootheid groter is dan de kritieke waarde."
   ]
  }
 ],
 "hardVragen": [
  {
   "h": "h1",
   "q": "Welke stellingen over significantietoetsen en het onderscheidingsvermogen zijn FOUT? Duid alle foute stellingen aan.",
   "o": [
    "De overschrijdingskans p is de kans dat H0 waar is, gegeven de gevonden data",
    "Alfa is de kans dat H0 verworpen wordt terwijl H0 eigenlijk correct is",
    "De power (1 min bèta) is de kans dat H0 verworpen wordt terwijl Ha echt correct is",
    "Bèta is de kans dat H0 verworpen wordt terwijl Ha eigenlijk correct is",
    "Een z-toets toetst een populatiegemiddelde wanneer de populatiestandaardafwijking gekend is"
   ],
   "a": [
    0,
    3
   ],
   "kies": "fout",
   "u": "Fout zijn de stelling over p en de stelling over bèta. p is de kans op de gevonden data of extremer, verondersteld dat H0 waar is, en dus niet de kans dat H0 waar is. Bèta is de kans dat H0 aanvaard wordt terwijl Ha correct is; H0 verwerpen terwijl Ha correct is, is net de power (1 min bèta)."
  },
  {
   "h": "h2",
   "q": "Bij 20 personen wordt de reactietijd gemeten voor en na het drinken van koffie. De reactietijden van elke meting apart zijn niet normaal verdeeld, maar de verschilscores wel. Wat is de correcte beslissing over de toets?",
   "o": [
    "De gepaarde t-test mag niet, want bij kleine n moeten beide metingen apart normaal verdeeld zijn",
    "De ongepaarde t-test is aangewezen, want de twee metingen zijn elk apart niet normaal verdeeld",
    "De gepaarde t-test mag, want bij kleine n geldt de normaliteitseis enkel voor de verschilscores",
    "Enkel de z-test kan, want bij n kleiner dan 30 moet sigma van de populatie gekend zijn"
   ],
   "a": 2,
   "u": "Dezelfde personen worden twee keer gemeten, dus het design is gepaard. De gepaarde t-test past een 1-steekproef t-procedure toe op de verschilscores, en daarom volstaat het bij n kleiner dan 30 dat die verschilscores normaal verdeeld zijn."
  },
  {
   "h": "h2",
   "q": "Een onderzoeker toetst tweezijdig met alfa gelijk aan 5% of het gemiddelde van een populatie verschilt van mu0 = 100. Sigma is onbekend en het 95% betrouwbaarheidsinterval voor mu loopt van 101.5 tot 108.0. Welke combinatie van toets en beslissing is correct?",
   "o": [
    "One sample t-test; H0 aanvaarden, want de ondergrens van het interval ligt heel dicht bij 100",
    "z-test; H0 verwerpen, want de waarde 100 ligt niet in het betrouwbaarheidsinterval",
    "One sample t-test; zonder de p-waarde is er over H0 nog geen enkele beslissing mogelijk",
    "One sample t-test; H0 verwerpen, want de waarde 100 ligt niet in het betrouwbaarheidsinterval"
   ],
   "a": 3,
   "u": "Omdat sigma onbekend is en 1 gemiddelde met een vaste referentiewaarde vergeleken wordt, is de one sample t-test aangewezen. Een tweezijdig 95% BI hoort bij een tweezijdige alfa van 5%, en omdat de getoetste waarde 100 niet in het BI ligt, wordt H0 verworpen."
  },
  {
   "h": "h3",
   "q": "Veertig patiënten scoren hun pijn voor en na een therapie op een ordinale schaal (geen, licht, matig, hevig). Bij 12 patiënten is de score na de therapie identiek aan die ervoor. Welke toets en welke effectieve steekproefgrootte zijn correct?",
   "o": [
    "Wilcoxon rangsomtest, met n gelijk aan 40",
    "Wilcoxon rangtekentest, met n gelijk aan 28",
    "Wilcoxon rangtekentest, met n gelijk aan 40",
    "Wilcoxon rangsomtest, met n gelijk aan 28"
   ],
   "a": 1,
   "u": "Dezelfde patiënten worden tweemaal gemeten op ordinaal niveau, dus het gaat om gepaarde steekproeven en de Wilcoxon rangtekentest. Paren met verschilscore 0 tellen niet mee, zodat n daalt van 40 naar 28, wat nog steeds voldoet aan de voorwaarde van minstens 10 observaties."
  },
  {
   "h": "h3",
   "q": "Een onderzoeker wil met een one sample proportietest nagaan of meer dan 5% van de leerlingen zonder ontbijt naar school komt. In zijn steekproef van 80 leerlingen komen er 7 zonder ontbijt. Wat is de correcte vaststelling?",
   "o": [
    "De toets mag, want het aantal mislukkingen #q ligt ruim boven de 10",
    "De toets mag, want de steekproef bevat ruim meer dan 30 leerlingen",
    "De toets mag niet, want het aantal successen #p ligt onder de 10",
    "De toets mag niet, want een nominale variabele vraagt een Wilcoxontoets"
   ],
   "a": 2,
   "u": "De proportietest vereist dat zowel het aantal successen #p als het aantal mislukkingen #q minstens 10 is. Hier is #p gelijk aan 7, dus de voorwaarde is niet voldaan, ook al is #q gelijk aan 73."
  },
  {
   "h": "h4",
   "q": "Een onderzoeker voert een chi-kwadraat afhankelijkheidstoets uit op een kruistabel met 3 rijen en 4 kolommen. Twee van de twaalf verwachte frequenties zijn kleiner dan 5 en geen enkele is gelijk aan nul. Welke uitspraak is correct?",
   "o": [
    "df is 6 en de voorwaarden zijn voldaan, want minder dan 20% van de verwachte frequenties is kleiner dan 5",
    "df is 6 maar de voorwaarden zijn niet voldaan, want elke verwachte frequentie moet minstens 5 bedragen",
    "df is 12 en de voorwaarden zijn niet voldaan, want meer dan 20% van de verwachte frequenties is kleiner dan 5",
    "df is 11 en de voorwaarden zijn voldaan, want geen enkele verwachte frequentie is gelijk aan nul"
   ],
   "a": 0,
   "u": "df is (r min 1) maal (k min 1), dus 2 maal 3, wat 6 geeft. Omdat df groter is dan 1 geldt de 20%-regel: 2 op 12 (ongeveer 17%) is minder dan 20%, en geen enkele verwachte frequentie is nul, dus de voorwaarden zijn voldaan."
  },
  {
   "h": "h4",
   "q": "Welke stelling over de chi-kwadraat verdelingstoets en de Kolmogorov-Smirnov test is FOUT?",
   "o": [
    "De verdelingstoets gebruikt een nominale variabele, de KS-test een variabele van minstens ordinaal niveau",
    "De KS-test vergelijkt waargenomen en verwachte cumulatieve frequenties, het maximale absolute verschil beslist",
    "Bij de verdelingstoets is df gelijk aan (r min 1) maal (k min 1), met r rijen en k kolommen",
    "Als voorwaarde voor de KS-test moet de steekproef minstens 35 waarnemingen bevatten"
   ],
   "a": 2,
   "u": "De formule (r min 1) maal (k min 1) hoort bij de afhankelijkheidstoets met een kruistabel. Bij de verdelingstoets is df gelijk aan k min 1, met k het aantal klassen; de andere stellingen kloppen met de stof."
  },
  {
   "h": "h5",
   "q": "Bij een enkelvoudige lineaire regressie levert de t-toets over de helling t gelijk aan 3 op, en H0: β1 = 0 wordt verworpen. Welke uitspraak over de F-toets van het model is correct?",
   "o": [
    "F is gelijk aan 9, maar de F-toets kan tot een andere beslissing over het model leiden",
    "F is gelijk aan de wortel uit 3, en de F-toets besluit dat er geen lineair verband is",
    "F is gelijk aan 3, en de F-toets besluit enkel dat het intercept β0 verschilt van 0",
    "F is gelijk aan 9, en ook de F-toets besluit dat x en y lineair samenhangen in de populatie"
   ],
   "a": 3,
   "u": "Bij enkelvoudige lineaire regressie geldt F = t², dus F is 9, en beide toetsen leiden tot dezelfde conclusie. Het verwerpen van H0: β1 = 0 betekent dat x en y in de populatie wel lineair samenhangen."
  },
  {
   "h": "h6",
   "q": "Een onderzoeker vergelijkt de gemiddelde reactietijd (ratio-niveau) van vier onafhankelijke groepen van elk 15 proefpersonen. Welke combinatie van toets en vrijheidsgraden is correct?",
   "o": [
    "ANOVA, met een F-toets met 4 en 60 vrijheidsgraden",
    "ANOVA, met een F-toets met 3 en 56 vrijheidsgraden",
    "ANOVA, met een F-toets met 3 en 59 vrijheidsgraden",
    "Ongepaarde t-test, met 14 vrijheidsgraden per groep"
   ],
   "a": 1,
   "u": "Drie of meer ongepaarde groepen op een ratio-uitkomst vragen een ANOVA. De vrijheidsgraden van de F-toets zijn aantal groepen min 1 (4 min 1 is 3) en totale n min aantal groepen (60 min 4 is 56)."
  },
  {
   "h": "h6",
   "q": "Bij 20 studenten wordt het verband onderzocht tussen twee variabelen die beide op ordinale schaal gemeten zijn. Welke combinatie van toets en voorwaarde is correct?",
   "o": [
    "Spearman of Kendall, en de voorwaarde n minstens 10 is hier voldaan",
    "Pearson's correlatietest, maar de voorwaarde n groter dan 25 is niet voldaan",
    "Spearman of Kendall, maar de voorwaarde n groter dan 25 is niet voldaan",
    "ANOVA, want elke ordinale variabele bestaat uit meerdere categorieën"
   ],
   "a": 0,
   "u": "Bij twee ordinaal gemeten variabelen gebruik je een rangcorrelatietest zoals Spearman of Kendall. De voorwaarde daarvoor is n minstens 10, wat met 20 studenten voldaan is; de eis n groter dan 25 hoort bij Pearson."
  }
 ]
};
