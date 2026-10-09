// Vak "Statistiek IV: multivariate data-analyse" (3ba), automatisch omgezet vanaf de oude site op 2026-09-14.
// Formaat: zie README, kop "Vakpagina". Aanpassen kan hier; de pagina (index.html) hoeft niet te veranderen.
window.BES_VAK = {
 "id": "stat4",
 "jaar": "3ba",
 "naam": "Statistiek IV: multivariate data-analyse",
 "hoofdstukken": [
  {
   "id": "h1",
   "naam": "Inleiding, data verkennen & enkelvoudige regressie"
  },
  {
   "id": "h2",
   "naam": "Meervoudige & logistische regressie"
  },
  {
   "id": "h3",
   "naam": "Variantie-analyse (ANOVA/MANOVA)"
  },
  {
   "id": "h4",
   "naam": "Factoranalyse"
  },
  {
   "id": "h5",
   "naam": "Clusteranalyse"
  },
  {
   "id": "h6",
   "naam": "SEM & netwerkanalyses"
  }
 ],
 "vragen": [
  {
   "h": "h1",
   "q": "Een onderzoeker wil een continue afhankelijke variabele voorspellen op basis van een andere continue variabele en nagaan hoe y varieert bij veranderingen in x. Welke techniek past het best?",
   "o": [
    "Enkelvoudige variantieanalyse (ANOVA)",
    "Clusteranalyse",
    "Enkelvoudige regressieanalyse",
    "Logistische regressie"
   ],
   "a": 2,
   "u": "Regressieanalyse gebruik je wanneer men een continue variabele wil voorspellen aan de hand van een andere continue variabele en wil weten hoe y varieert bij veranderingen in x."
  },
  {
   "h": "h1",
   "q": "Waarom rapporteert men bij meervoudige regressie vaak de aangepaste R2 in plaats van de gewone R2?",
   "o": [
    "Omdat de aangepaste R2 rekening houdt met het aantal predictoren en niet vanzelf stijgt bij het toevoegen van variabelen",
    "Omdat de aangepaste R2 altijd hoger uitvalt en zo het model beter doet lijken",
    "Omdat de gewone R2 enkel geldig is bij één predictor en bij meerdere predictoren systematisch onder de werkelijke verklaarde variantie ligt",
    "Omdat de aangepaste R2 de collineariteit tussen predictoren corrigeert"
   ],
   "a": 0,
   "u": "Bij meervoudige regressie gebruikt men een aangepaste R2 in plaats van R2 omdat die corrigeert voor het aantal predictoren en dus niet automatisch toeneemt wanneer je variabelen toevoegt."
  },
  {
   "h": "h1",
   "q": "Op welk verschijnsel moet je specifiek controleren wanneer je in een meervoudig regressiemodel meerdere onderling samenhangende predictoren hebt?",
   "o": [
    "Interpolatie",
    "Collineariteit",
    "Non-random missingness",
    "Heteroscedasticiteit"
   ],
   "a": 1,
   "u": "Bij meervoudige regressie hoort men te controleren op collineariteit, dat wil zeggen onderlinge samenhang tussen de predictoren."
  },
  {
   "h": "h1",
   "q": "Wat beschrijft de centrale limietstelling?",
   "o": [
    "Dat de empirische frequentieverdeling van een steekproef altijd normaal verdeeld is",
    "Dat de steekproefgemiddelden bij een voldoende grote n exact samenvallen met het populatiegemiddelde, waardoor de standaardfout tot nul herleid wordt",
    "Dat bij herhaald trekken van toevallige steekproeven met voldoende grote n de steekproevenverdeling van het gemiddelde een normaalverdeling benadert",
    "Dat de variantie gelijk blijft over de range van de onafhankelijke variabele"
   ],
   "a": 2,
   "u": "De centrale limietstelling stelt dat wanneer men herhaaldelijk toevallige steekproeven met grootte n trekt uit een willekeurig verdeelde populatie en n voldoende groot is (vuistregel n groter dan 30), de steekproevenverdeling van het steekproefgemiddelde een normaalverdeling benadert."
  },
  {
   "h": "h1",
   "q": "Bij het controleren van de assumptie van homoscedasticiteit geeft Levene's test aan dat er heteroscedasticiteit is. Wat betekent heteroscedasticiteit inhoudelijk?",
   "o": [
    "De afhankelijke variabelen vertonen overal vergelijkbare niveaus van variantie",
    "De residuen zijn niet normaal verdeeld, waardoor de gemiddelden van de groepen onvergelijkbaar worden",
    "Predicties zijn beter voor sommige waarden van de onafhankelijke variabele dan voor andere",
    "Er is een sterke onderlinge correlatie tussen de predictoren"
   ],
   "a": 2,
   "u": "Heteroscedasticiteit betekent dat predicties beter zijn voor sommige waarden van de onafhankelijke variabele dan voor andere, in tegenstelling tot homoscedasticiteit waarbij de variantie vergelijkbaar is over de hele range."
  },
  {
   "h": "h1",
   "q": "Een onderzoeker constateert dat de gegevens van bepaalde subjecten systematisch ontbreken doordat een procedure niet correct verliep. Hoe typeer je dit soort missing data?",
   "o": [
    "Missing Completely At Random (MCAR)",
    "Verwaarloosbare missing data (random missingness)",
    "Multipele imputatie op basis van de gemiddelden van de overige subjecten",
    "Gekende niet-verwaarloosbare missing data (non-random missingness)"
   ],
   "a": 3,
   "u": "Gekende niet-verwaarloosbare missing data of non-random missingness slaat op systematisch missende gegevens die te wijten zijn aan procedurele factoren."
  },
  {
   "h": "h1",
   "q": "Wat is het verschil tussen standaard listwise deletion en pairwise deletion bij het omgaan met ontbrekende gegevens?",
   "o": [
    "Listwise houdt bij elke analyse enkel de volledige variabelen over, terwijl pairwise ontbrekende waarden vervangt door het gemiddelde van die variabele",
    "Listwise schat de ontbrekende waarde en voegt ze toe, pairwise verwijdert het hele subject",
    "Listwise past een logaritmische transformatie toe, pairwise centreert de waarnemingen",
    "Listwise verwijdert alle gegevens van een subject zodra er iets ontbreekt, pairwise verwijdert enkel het ontbrekende gegeven en gebruikt de rest nog"
   ],
   "a": 3,
   "u": "Bij standaard listwise deletion verwijder je alle gegevens van een subject zodra er data ontbreekt, terwijl je bij pairwise deletion enkel het ontbrekende gegeven verwijdert en de overige beschikbare gegevens toch nog gebruikt."
  },
  {
   "h": "h1",
   "q": "Welke techniek gebruik je om extreme waarden (outliers) te detecteren?",
   "o": [
    "Mahalanobis",
    "Cronbach's alfa",
    "Ipsatizing",
    "P-P plot"
   ],
   "a": 0,
   "u": "Mahalanobis is de techniek waarmee je extreme waarden (outliers) kunt detecteren."
  },
  {
   "h": "h1",
   "q": "Er blijkt een link te bestaan tussen een variabele en het ontbreken van data, maar de oorzaak van dat ontbreken is niet die variabele zelf. Welk type missing data is dit?",
   "o": [
    "Missing Completely At Random (MCAR)",
    "Missing At Random (MAR)",
    "Verwaarloosbare missing data",
    "Non-random missingness"
   ],
   "a": 1,
   "u": "Bij Missing At Random (MAR) is er wel een link tussen de variabele en de missing data, maar ligt de oorzaak van het ontbreken niet aan de variabele zelf. Bij MCAR ligt de oorzaak niet aan de test."
  },
  {
   "h": "h1",
   "q": "Je hebt een niet-metrische onafhankelijke variabele met verschillende categorieën die je in een regressiemodel wilt opnemen. Welk begrip beschrijft de dichotome variabele met waarde 0 of 1 die telkens één categorie representeert?",
   "o": [
    "Sensitiviteitsanalyse",
    "Interpolatie",
    "Dummy variabele",
    "Ipsatizing"
   ],
   "a": 2,
   "u": "Een dummy variabele is een dichotome variabele die één categorie van een niet-metrische onafhankelijke variabele representeert en de waarde 0 of 1 aanneemt."
  },
  {
   "h": "h2",
   "q": "Een onderzoeker wil een continue, interval-geschaalde afhankelijke variabele voorspellen uit meerdere onafhankelijke variabelen. Welke techniek past hier het best?",
   "o": [
    "Meervoudige (lineaire) regressie",
    "Multinomiale logistische regressie",
    "Chi-square test",
    "Binaire logistische regressie"
   ],
   "a": 0,
   "u": "Bij lineaire regressie is de verklaarde variabele (AV) continu en op interval-niveau. Meerdere OV samen leiden tot meervoudige regressie."
  },
  {
   "h": "h2",
   "q": "De afhankelijke variabele in een studie is dichotoom (geslaagd of niet geslaagd). Welke techniek is het meest aangewezen?",
   "o": [
    "Binaire logistische regressie",
    "Aangepaste R2",
    "Meervoudige lineaire regressie",
    "Kolmogorov-Smirnov test"
   ],
   "a": 0,
   "u": "Logistische regressie herleidt de AV naar een nominale of ordinale schaal. Met twee categorieen is dit binaire logistische regressie."
  },
  {
   "h": "h2",
   "q": "Waarom rapporteer je bij een meervoudige regressie bij voorkeur de aangepaste (adjusted) R2 in plaats van de gewone R2?",
   "o": [
    "Omdat ze rekening houdt met het aantal OV in verhouding tot de steekproefgrootte",
    "Omdat ze de multicollineariteit tussen de OV uit het model filtert voordat de fit wordt geschat",
    "Omdat ze de odds naar een continue schaal transformeert",
    "Omdat ze de normaliteit van de AV-verdeling toetst"
   ],
   "a": 0,
   "u": "De aangepaste R2 verlaagt de R2 naarmate er minder waarnemingen per variabele zijn en is daarom geschikt om modellen met verschillende aantallen variabelen en waarnemingen te vergelijken."
  },
  {
   "h": "h2",
   "q": "Wat beschrijft het begrip multicollineariteit in een meervoudige regressie?",
   "o": [
    "De onderlinge verbanden tussen de onafhankelijke variabelen",
    "De verdeling van het aantal successen bij herhaalde experimenten",
    "Het percentage variantie van de AV dat het model verklaart",
    "De kans op succes ten opzichte van de kans op mislukking"
   ],
   "a": 0,
   "u": "Multicollineariteit verwijst naar de onderlinge verbanden tussen de OV. Het vergroot de errors, de betrouwbaarheidsintervallen en de p-waarden."
  },
  {
   "h": "h2",
   "q": "In de SPSS-output van een meervoudige regressie vind je een lage tolerantie voor een variabele. Wat wijst dit aan?",
   "o": [
    "Dat de residuen netjes normaal verdeeld zijn rond nul",
    "Dat er een probleem met multicollineariteit kan zijn",
    "Dat het model een goede goodness of fit heeft",
    "Dat de effectgrootte klinisch relevant is"
   ],
   "a": 1,
   "u": "Tolerantie is een maat voor multicollineariteit, namelijk het percentage variantie van een OV dat niet door de andere OV verklaard wordt. Het moet minstens 50% zijn, dus een lage waarde signaleert een probleem."
  },
  {
   "h": "h2",
   "q": "Hoe interpreteer je een gestandaardiseerde coefficient (beta) in de SPSS-output van een meervoudige regressie?",
   "o": [
    "Als de OV met een eenheid stijgt, verdubbelt de odds op succes",
    "Als de OV met een eenheid stijgt, neemt de AV met beta ruwe meeteenheden toe, ongeacht de spreiding",
    "Het is het percentage van de variantie dat niet verklaard wordt",
    "Als de OV met een standaardafwijking stijgt, neemt de AV met beta standaardafwijkingen toe"
   ],
   "a": 3,
   "u": "De gestandaardiseerde beta drukt uit hoeveel standaardafwijkingen de AV verandert wanneer de OV met een standaardafwijking stijgt."
  },
  {
   "h": "h2",
   "q": "Bij een logistische regressie wil je nagaan of het volledige model goed past bij de data. Welke maten of test gebruik je daarvoor?",
   "o": [
    "De Variance Inflation Factor (VIF)",
    "De gestandaardiseerde beta-coefficient",
    "Pseudo R2 maten zoals Cox & Snell en Nagelkerke, en de Hosmer test",
    "De aangepaste R2 en de tolerantiewaarden uit de Model Summary tabel"
   ],
   "a": 2,
   "u": "Bij dichotome variabelen geven pseudo R2 maten zoals Cox & Snell en Nagelkerke de model of fit aan. De Hosmer test is een goodness of fit test voor logistische regressiemodellen."
  },
  {
   "h": "h2",
   "q": "Welk begrip staat voor het principe om de afhankelijke variabele zo goed mogelijk te voorspellen met zo weinig mogelijk onafhankelijke variabelen?",
   "o": [
    "Redundantie",
    "Substitutie",
    "Paneldata",
    "Parsimonie"
   ],
   "a": 3,
   "u": "Parsimonie staat voor het zo goed mogelijk voorspellen van de AV met zo min mogelijk OV. Redundantie gaat over overlap tussen voorspellers en paneldata over herhaald gemeten subjecten."
  },
  {
   "h": "h2",
   "q": "Wat is het verschil tussen statistische en klinische significantie?",
   "o": [
    "Statistische significantie toetst de normaliteit, klinische significantie de multicollineariteit",
    "Statistische significantie wordt bepaald door de effectgrootte, klinische significantie door de p-waarde die de behandelende arts in de klinische praktijk hanteert",
    "Statistische significantie betekent p groter dan 0,05, klinische significantie een kleine effectgrootte",
    "Statistische significantie geldt bij p kleiner dan 0,05, klinische significantie wanneer de interventie klinisch relevant is met een grote effectgrootte"
   ],
   "a": 3,
   "u": "Statistische significantie treedt op wanneer de p-waarde kleiner is dan 0,05. Klinische significantie gaat over een klinisch relevante interventie, in statistische termen een grote effectgrootte."
  },
  {
   "h": "h2",
   "q": "Wanneer gebruik je bij het toetsen van de normaliteit van een verdeling eerder de Shapiro-Wilcoxon test dan de Kolmogorov-Smirnov test?",
   "o": [
    "Bij grote steekproeven",
    "Wanneer de AV dichotoom is",
    "Wanneer er multicollineariteit optreedt",
    "Bij kleine n"
   ],
   "a": 0,
   "u": "De Shapiro-Wilcoxon test wordt gebruikt om de normaliteit na te gaan bij grote steekproeven, terwijl Kolmogorov-Smirnov bedoeld is voor kleine n. Bij beide geldt: normaal verdeeld indien p groter dan 0,05."
  },
  {
   "h": "h3",
   "q": "Een onderzoeker wil nagaan of het gemiddelde van een continue uitkomstvariabele verschilt tussen drie of meer groepen (categorische indeling). Welke techniek is hiervoor de aangewezen keuze?",
   "o": [
    "ANOVA",
    "Logistische regressie",
    "Bootstrapping",
    "Factoranalyse"
   ],
   "a": 0,
   "u": "ANOVA is de techniek waarmee men de verhoudingen tussen verschillende categorische groepen ontdekt aan de hand van een continue variabele."
  },
  {
   "h": "h3",
   "q": "Waarom voert men na een significante ANOVA niet zomaar heel veel losse t-tests uit tussen alle groepen?",
   "o": [
    "Omdat elke losse t-test de gepoolde variantie van alle groepen negeert en zo de power verlaagt",
    "Omdat het totale risico op een Type I fout dan sterk toeneemt (capitalizing by chance)",
    "Omdat de continue variabele dan categorisch wordt",
    "Omdat de omnibustest daardoor conservatiever wordt"
   ],
   "a": 1,
   "u": "Door veel testen uit te voeren stijgt de kans op toevallige significante resultaten, waardoor het totale risico op een Type I fout zeer groot wordt (kanskapitalisatie)."
  },
  {
   "h": "h3",
   "q": "Wat is het belangrijkste nadeel van de Bonferroni correctie tegenover haar voordeel?",
   "o": [
    "Ze verstrengt de kans op een Type I fout, maar vergroot daardoor de kans op een Type II fout",
    "Ze deelt de p-waarden door het aantal toetsen, waardoor de gevonden effectgroottes systematisch kleiner worden",
    "Ze maakt de test permissiever en dus liberaler",
    "Ze vergroot zowel de kans op een Type I als een Type II fout"
   ],
   "a": 0,
   "u": "De Bonferroni correctie is conservatief: ze verkleint de kans op een Type I fout, maar vergroot daardoor de kans op een Type II fout."
  },
  {
   "h": "h3",
   "q": "Welke test gebruikt men om na te gaan of aan de assumptie van homoscedasticiteit is voldaan bij een ANOVA?",
   "o": [
    "Kruskal-Wallis test",
    "Levene's test",
    "Mauchly's W",
    "Tukey's HSD test"
   ],
   "a": 1,
   "u": "Levene's test toetst de homoscedasticiteit bij ANOVA: bij p<0,05 is er heteroscedasticiteit, bij p>0,05 is er homoscedasticiteit."
  },
  {
   "h": "h3",
   "q": "Een onderzoeker stelt vast dat de invloed van één onafhankelijke variabele op de afhankelijke variabele verschilt naargelang het niveau van een andere onafhankelijke variabele. Hoe noemt men dit fenomeen?",
   "o": [
    "Een hoofdeffect",
    "Een mediërende variabele",
    "Een confounder",
    "Een interactie-effect"
   ],
   "a": 3,
   "u": "Een interactie-effect treedt op wanneer de invloed van een OV op een AV verschilt bij een andere OV. Een factoriële ANOVA legt zulke interactie-effecten bloot."
  },
  {
   "h": "h3",
   "q": "Wanneer is een repeated measures (herhaalde meting) ANOVA de aangewezen techniek in plaats van een gewone ANOVA?",
   "o": [
    "Wanneer de grootste sd gedeeld door de kleinste sd groter dan twee is",
    "Wanneer de groepen in de OV niet onafhankelijk van elkaar zijn",
    "Wanneer er meer dan één continue afhankelijke variabele is",
    "Wanneer men enkel de globale model fit wil nagaan"
   ],
   "a": 1,
   "u": "Een repeated measures ANOVA wordt gebruikt indien de groepen in de OV niet onafhankelijk zijn van elkaar, bijvoorbeeld bij herhaalde metingen bij dezelfde proefpersonen."
  },
  {
   "h": "h3",
   "q": "Wat toetst men met Mauchly's W bij een mixed model ANOVA, en wat doe je bij een significant resultaat?",
   "o": [
    "De effectgrootte; bij p<0,05 rapporteer je partiële eta-kwadraat",
    "De homoscedasticiteit; bij p<0,05 voer je een post-hoc test uit",
    "De sfericiteit (bolvormigheid); bij p<0,05 pas je een sfericiteitscorrectie toe",
    "De normaliteit van de residuen; bij p<0,05 transformeer je de scores naar rangen"
   ],
   "a": 2,
   "u": "Mauchly's W toetst de bolvormigheid (sfericiteit). Is de test significant (p<0,05), dan is er geen bolvormigheid en moet men een sfericiteitscorrectie toepassen."
  },
  {
   "h": "h3",
   "q": "Welke sfericiteitscorrectie is aangewezen wanneer de epsilon-schatting kleiner is dan 0,75?",
   "o": [
    "Lower-bound correctie",
    "Greenhouse-Geisser",
    "Huynh-Feldt",
    "Bonferroni-Holm"
   ],
   "a": 1,
   "u": "De Greenhouse-Geisser correctie wordt toegepast wanneer niet voldaan is aan de bolvormigheidsvuistregel, dat wil zeggen bij een epsilon-schatting kleiner dan 0,75. Boven 0,75 is Huynh-Feldt aangewezen."
  },
  {
   "h": "h3",
   "q": "Een variabele versterkt de correlatie tussen twee andere variabelen zonder ze te veroorzaken. Hoe noemt men zo'n variabele?",
   "o": [
    "Een covariaat",
    "Een confounder",
    "Een mediator",
    "Een moderator"
   ],
   "a": 3,
   "u": "Een moderator versterkt de correlatie tussen twee variabelen. Een mediator verklaart die correlatie beter, terwijl een confounder een gemeenschappelijke achterliggende oorzaak is."
  },
  {
   "h": "h3",
   "q": "Wat is het kenmerkende verschil tussen een factoriële ANOVA en een enkelvoudige (one-way) ANOVA?",
   "o": [
    "Een factoriële ANOVA werkt altijd met afhankelijke (niet-onafhankelijke) groepen",
    "Een factoriële ANOVA gebruikt meer dan één categorische onafhankelijke variabele",
    "Een factoriële ANOVA gebruikt een continue in plaats van een categorische uitkomst",
    "Een factoriële ANOVA vervangt de F-waarde door rangen"
   ],
   "a": 1,
   "u": "Een factoriële ANOVA gebruikt meer dan één categorische onafhankelijke variabele (bijvoorbeeld een two-way ANOVA) en legt zo interactie-effecten bloot."
  },
  {
   "h": "h4",
   "q": "Een onderzoeker wil geen a-priori structuur toetsen maar puur op zoek gaan naar onderliggende dimensies in een grote set variabelen om die te reduceren. Welke aanpak past hierbij?",
   "o": [
    "Split file-analyse",
    "Exploratieve factoranalyse",
    "Repeated measures ANOVA",
    "Confirmatorische factoranalyse"
   ],
   "a": 1,
   "u": "Exploratieve factoranalyse is een zoektocht naar structuur in een set variabelen en dient voor data-reductie. Confirmatorische factoranalyse toetst juist een vooraf op theorie gebaseerde samenhang."
  },
  {
   "h": "h4",
   "q": "Wat drukt een factorlading uit in de output van een factoranalyse?",
   "o": [
    "De som van alle unieke varianties",
    "Een schatting van de factorwaarde voor een individu",
    "De hoeveelheid variantie die een hele factor verklaart",
    "De correlatie van elke variabele met de factor"
   ],
   "a": 3,
   "u": "Een factorlading is de correlatie van elke variabele met de factor, oftewel de coefficient die de samenhang tussen de oorspronkelijke variabele en de factor meet."
  },
  {
   "h": "h4",
   "q": "Een variabele laadt significant op meer dan een factor tegelijk. Hoe noemt men zulke variabelen?",
   "o": [
    "Kruisladingen (bridge)",
    "Eigenvectoren",
    "Geroteerde factorscores",
    "Communaliteiten"
   ],
   "a": 0,
   "u": "Variabelen die significant laden op meer dan een factor of component worden kruisladingen of bridge-variabelen genoemd."
  },
  {
   "h": "h4",
   "q": "Wat is het onderscheidende kenmerk van Principal Component Analysis (PCA) tegenover Principal Factor Analysis (PFA)?",
   "o": [
    "PCA werkt alleen met genormaliseerde eigenvectoren, PFA niet",
    "PCA schat eerst de communaliteiten en PFA zet die op één, waardoor PFA meer factoren behoudt",
    "PCA vertrekt vanuit de totale variantie, PFA enkel vanuit de gemeenschappelijke variantie",
    "PCA gebruikt enkel gemeenschappelijke variantie, PFA de totale variantie"
   ],
   "a": 2,
   "u": "PCA gaat uit van de totale variantie en vat zoveel mogelijk oorspronkelijke variantie samen in weinig factoren, terwijl PFA enkel uitgaat van de gemeenschappelijke variantie."
  },
  {
   "h": "h4",
   "q": "Bij welk soort rotatie blijven de componenten volledig onafhankelijk van elkaar, waardoor het assenstelsel rechthoekig gedraaid wordt?",
   "o": [
    "Kaiser-normalisatie",
    "Functionele componentenanalyse",
    "Scheve (oblique) rotatie via Direct Oblimin",
    "Orthogonale rotatie via Varimax"
   ],
   "a": 3,
   "u": "Bij orthogonale (factoriele) rotatie zijn de componenten volledig onafhankelijk en wordt het assenstelsel rechthoekig gedraaid; in SPSS gebeurt dit via Varimax. Bij scheve of oblique rotatie mogen componenten wel gerelateerd zijn."
  },
  {
   "h": "h4",
   "q": "Wat geeft de eigenwaarde van een dimensie aan in een factoranalyse?",
   "o": [
    "De hoeveelheid variantie die door die dimensie wordt verklaard",
    "De individuele factorscore van een respondent",
    "Het aandeel unieke variantie van een enkele variabele",
    "De correlatie tussen een variabele en de dimensie waarop ze laadt"
   ],
   "a": 0,
   "u": "De eigenwaarde geeft de hoeveelheid variantie aan die door elke dimensie wordt verklaard; hoe hoger de eigenwaarde, hoe meer variantie de dimensie verklaart."
  },
  {
   "h": "h4",
   "q": "Een onderzoeker zet de eigenwaardes uit in een grafiek en zoekt naar de knik om te beslissen hoeveel factoren te behouden. Welke techniek en welk criterium worden hier gecombineerd?",
   "o": [
    "KMO-maat met Bartlett-toets",
    "Scree plot met het Kattell- of elbowcriterium",
    "Componentenmatrix met het Kaiser-eigenwaardecriterium",
    "Spaghetti plot met de hoogtefactor"
   ],
   "a": 1,
   "u": "In een scree plot worden de eigenwaardes uitgezet en het Kattell- of elbowcriterium kijkt waar de knik zit om te beslissen hoeveel factoren te behouden. Het Kaisercriterium behoudt daarnaast enkel factoren met een eigenwaarde groter dan 1."
  },
  {
   "h": "h4",
   "q": "Wat vertelt de communaliteit van een oorspronkelijke variabele je?",
   "o": [
    "Hoeveel variantie de factor in totaal verklaart",
    "Welk deel van de variantie van die variabele door alle dimensies samen wordt verklaard",
    "Hoeveel van de variantie van die variabele uniek is en dus door geen enkele dimensie gedeeld wordt",
    "De weging om individuele factorscores te berekenen"
   ],
   "a": 1,
   "u": "De communaliteit geeft aan welk deel van de variantie in een oorspronkelijke variabele wordt verklaard door alle dimensies samen, berekend als de som van de gekwadrateerde ladingen voor die variabele over de factoren."
  },
  {
   "h": "h4",
   "q": "Waarvoor dient de KMO-maat (Kaiser-Meyer-Olkin) bij een factoranalyse?",
   "o": [
    "Ze bepaalt hoeveel factoren je moet behouden op basis van de knik",
    "Ze geeft het percentage unieke variantie van een variabele weer",
    "Ze beoordeelt de kwaliteit van de intercorrelaties en moet groter dan 0,5 zijn",
    "Ze toetst of de correlatiematrix significant verschilt van een identiteitsmatrix"
   ],
   "a": 2,
   "u": "De KMO-maat (Kaiser-Meyer-Olkin) is een maat voor de kwaliteit van de intercorrelaties, moet groter zijn dan 0,5 en wordt zeker gerapporteerd."
  },
  {
   "h": "h4",
   "q": "Wat toetst de Bartlett's test of sphericity in een factoranalyse?",
   "o": [
    "Of elke variabele perfect voorspeld kan worden door de andere",
    "Of de componenten na rotatie onafhankelijk blijven",
    "Of de steekproef groot genoeg is om de intercorrelaties betrouwbaar te schatten, met 0,5 als ondergrens",
    "Of de correlatiematrix een significant aantal correlaties tussen de variabelen bevat"
   ],
   "a": 3,
   "u": "De Bartlett's test of sphericity toetst of de correlatiematrix een significant aantal correlaties tussen de variabelen bevat; als de toets significant is, wordt de matrix bolvormig genoemd."
  },
  {
   "h": "h5",
   "q": "Een onderzoeker wil objecten stapsgewijs groeperen op basis van hun onderlinge gelijkenis, waarbij het eindresultaat de hiërarchische relaties tussen de objecten visueel moet weergeven. Welke output hoort typisch bij deze aanpak?",
   "o": [
    "Een scatterplot van eigenwaarden",
    "Een correlatiematrix",
    "Een dendrogram",
    "Een scree plot"
   ],
   "a": 2,
   "u": "Bij hiërarchische clustering worden objecten stapsgewijs geclusterd op basis van gelijkenis of afstand. Het resultaat is een dendrogram dat de hiërarchische relaties tussen de objecten weergeeft."
  },
  {
   "h": "h5",
   "q": "Bij welke clusteringmethode moet je vooraf zelf bepalen hoeveel clusters je in de oplossing wil hebben?",
   "o": [
    "Single linkage",
    "Agglomeratieve clustering",
    "Ward's methode",
    "K-means clustering"
   ],
   "a": 3,
   "u": "K-means clustering is een clusteringmethode waarbij je zelf bepaalt hoeveel clusters je wil. In SPSS vind je dit onder Analyze, Classify, K-means cluster."
  },
  {
   "h": "h5",
   "q": "Agglomeratieve clustering wordt omschreven als een bottom-up benadering. Wat is kenmerkend voor het startpunt van deze benadering?",
   "o": [
    "De objecten worden willekeurig aan een vast aantal centra toegewezen",
    "Alle objecten zitten aanvankelijk in één grote cluster die stapsgewijs wordt opgesplitst",
    "Het aantal clusters wordt vooraf vastgelegd op basis van een scree plot",
    "Elk object vormt aanvankelijk een afzonderlijke cluster die daarna iteratief wordt samengevoegd"
   ],
   "a": 3,
   "u": "Agglomeratieve clustering is een bottom-up benadering waarbij men begint met elk object als een afzonderlijke cluster en vervolgens iteratief de meest vergelijkbare clusters samenvoegt tot alle objecten in één cluster zitten."
  },
  {
   "h": "h5",
   "q": "Twee afstandsmaten vallen onder de Minkowski metriek. Wat is het onderscheid tussen de city block (Manhattan) afstand en de Euclidische afstand?",
   "o": [
    "City block is de vogelvlucht (rechte lijn), Euclidisch volgt de baan rond de blokken",
    "City block kan enkel bij K-means, Euclidisch enkel bij hiërarchische clustering",
    "City block neemt de som van de absolute verschillen, Euclidisch kwadrateert de verschillen en benadrukt de kortste rechte lijn",
    "City block telt het aantal variabelen waarop twee objecten verschillen, terwijl Euclidisch die verschillen deelt door het aantal dimensies"
   ],
   "a": 2,
   "u": "Bij p=1 (city block/Manhattan) neem je de som van de absolute verschillen zonder te kwadrateren, de baan rond de blok. Bij p=2 (Euclidisch) kwadrateer je de verschillen en benadruk je de kortste rechte lijn, de vogelvlucht, vergelijkbaar met de stelling van Pythagoras."
  },
  {
   "h": "h5",
   "q": "Bij een samenvoegingsmethode wordt de afstand tussen twee clusters bepaald door de minimale afstand tussen een paar punten uit de afzonderlijke clusters. Hoe heet deze methode, ook wel nearest neighbour in SPSS?",
   "o": [
    "Average linkage",
    "Ward's methode",
    "Single linkage",
    "Complete linkage"
   ],
   "a": 2,
   "u": "Single linkage (enkelvoudige samenvoeging, in SPSS nearest neighbour) bepaalt de afstand tussen twee clusters op basis van de minimale afstand tussen een paar punten uit afzonderlijke clusters."
  },
  {
   "h": "h5",
   "q": "Een onderzoeker wil clusters vormen die zo homogeen mogelijk zijn door de variantie binnen elke cluster te minimaliseren bij het samenvoegen. Welke methode past hierbij, en welke afstandsmaat is daarvoor vereist?",
   "o": [
    "Average linkage, met Minkowski afstand p=1",
    "Ward's methode, met squared Euclidische afstand",
    "Single linkage, met city block afstand",
    "K-means clustering, zonder afstandsmaat"
   ],
   "a": 1,
   "u": "Ward's methode is een agglomeratieve methode die de variantie binnen elke cluster minimaliseert om zo homogeen mogelijke clusters te vormen. Voor Ward moet je de squared Euclidische afstand nemen."
  },
  {
   "h": "h6",
   "q": "Wat is de kern van Structural Equation Modeling (SEM)?",
   "o": [
    "Een confirmatorische benadering die latente factoren schat op basis van geobserveerde indicatoren en meetfouten in rekening brengt",
    "Een techniek die uitsluitend geschikt is voor 1 onafhankelijke en 1 afhankelijke variabele",
    "Een methode die causaliteit met zekerheid aantoont tussen geobserveerde variabelen",
    "Een uitbreiding van de meervoudige regressie waarbij alle variabelen rechtstreeks geobserveerd worden en de meetfout verwaarloosbaar wordt verondersteld"
   ],
   "a": 0,
   "u": "SEM is een confirmatorische benadering die latente factoren schat op basis van geobserveerde indicatoren, meetfouten in rekening brengt en complexe modellen met meerdere OV en AV in kaart brengt."
  },
  {
   "h": "h6",
   "q": "Een onderzoeker beweert dat SEM causaliteit tussen constructen bewijst. Wat is de correcte nuance volgens de brontekst?",
   "o": [
    "SEM toont causaliteit volledig aan zodra de fit goed is",
    "SEM gaat causaliteit na, maar toont het niet aan",
    "SEM kan geen enkele uitspraak over causale effecten doen",
    "SEM vervangt elk experimenteel design om causaliteit te bewijzen"
   ],
   "a": 1,
   "u": "Volgens de brontekst gaat SEM causaliteit na, maar toont het die niet aan. Het model kan causale effecten specificeren zonder ze te bewijzen."
  },
  {
   "h": "h6",
   "q": "Wat is het doel van een confirmatorische factoranalyse binnen SEM?",
   "o": [
    "Het testen en valideren van hypothesen over de structuur van een set meetbare variabelen",
    "Het samennemen van indicatoren tot item parcels om de steekproef te verkleinen",
    "Het verminderen van de invloed van outliers bij niet normaal verdeelde gegevens",
    "Het vrij laten opduiken van onbekende factoren zonder vooraf gestelde hypothesen"
   ],
   "a": 0,
   "u": "Confirmatorische factoranalyse test en valideert hypothesen over de structuur van een set meetbare variabelen en onderzoekt de relaties tussen observeerbare variabelen en hun onderliggende latente constructen."
  },
  {
   "h": "h6",
   "q": "Wat kenmerkt een just-identified model?",
   "o": [
    "Het bevat alle mogelijke relaties tussen geobserveerde variabelen",
    "Het heeft 0 vrijheidsgraden, waardoor de fit niet beoordeeld kan worden",
    "Het heeft altijd een uitstekende fit-index dankzij veel vrijheidsgraden",
    "Het bevat geen enkele relatie tussen de geobserveerde variabelen"
   ],
   "a": 1,
   "u": "Een just-identified model heeft 0 vrijheidsgraden en daardoor kan de fit ervan niet beoordeeld worden."
  },
  {
   "h": "h6",
   "q": "Een onderzoeker wil weten hoeveel misfit er per vrijheidsgraad is, als indicatie van absolute fit. Welke maat past hierbij?",
   "o": [
    "Goodness of Fit Index (GFI) als incrementele fit-index",
    "Standardised Root Mean Square Residual (RMSR)",
    "Modification index",
    "Root Mean Square Error of Approximation (RMSEA)"
   ],
   "a": 3,
   "u": "RMSEA is een indicatie van absolute fit en geeft de hoeveelheid misfit per vrijheidsgraad weer; lagere waarden zijn beter."
  },
  {
   "h": "h6",
   "q": "Waarom is het gevaarlijk om te veel modification indices te gebruiken bij het aanpassen van een SEM-model?",
   "o": [
    "Je model wordt te specifiek en niet meer veralgemeenbaar, met een shift van confirmatief naar exploratief",
    "Elke toegevoegde index verhoogt de chi-kwadraatwaarde, waardoor het model per definitie slechter gaat passen op de data",
    "De vrijheidsgraden worden automatisch nul, waardoor de fit perfect wordt",
    "Robuuste foutberekening wordt onmogelijk bij niet normaal verdeelde data"
   ],
   "a": 0,
   "u": "Te veel modification indices maken het model te specifiek en niet meer veralgemeenbaar, waardoor je verschuift van een confirmatieve naar een exploratieve aanpak."
  },
  {
   "h": "h6",
   "q": "Wat is het onderscheidende kenmerk van padanalyse ten opzichte van een volledig SEM-model?",
   "o": [
    "Padanalyse voegt extra latente variabelen toe om de fit te verbeteren",
    "Padanalyse toetst enkel bivariate correlaties tussen variabelenparen en kan geen indirecte of gemedieerde effecten binnen het model in kaart brengen",
    "Padanalyse schat causale effecten rechtstreeks tussen geobserveerde variabelen en skipt het measurement model en de latente variabelen",
    "Padanalyse schat enkel de meetfouten en negeert alle causale effecten"
   ],
   "a": 2,
   "u": "Bij padanalyse worden causale effecten rechtstreeks tussen geobserveerde variabelen geschat, waarbij het measurement model en dus ook de latente variabelen worden overgeslagen."
  },
  {
   "h": "h6",
   "q": "In een netwerkanalyse (Pairwise Markov Random Field) stelt een edge (boog) tussen twee nodes iets specifieks voor. Wat?",
   "o": [
    "Een gemiddelde van de gekwadrateerde residuen tussen de twee variabelen",
    "De ruwe bivariate correlatie tussen twee symptomen, zonder dat er voor de overige variabelen in het netwerk gecontroleerd wordt",
    "De voorwaardelijke afhankelijkheid tussen twee variabelen wanneer je controleert voor alle andere variabelen",
    "De mate waarin een node met alle andere nodes in het netwerk verbonden is"
   ],
   "a": 2,
   "u": "Een edge is de link tussen twee variabelen als je controleert voor alle andere; in een PMRF stelt een edge de voorwaardelijke afhankelijkheid tussen twee nodes voor. De centraliteit, niet de edge, gaat over hoe verbonden een node in het netwerk is."
  },
  {
   "h": "h6",
   "q": "Wat meet bridge centraliteit in een netwerkanalyse?",
   "o": [
    "De mate waarin een node uitsluitend met nodes van dezelfde cluster verbonden is",
    "Het totale aantal verbindingen dat een node binnen het netwerk heeft, ongeacht tot welke cluster de verbonden nodes behoren of hoe sterk ze zijn",
    "Hoe nodes van een bepaalde cluster met nodes van andere clusters verbonden zijn, vergelijkbaar met kruisladingen in factoranalyse",
    "De hoeveelheid misfit die een node in het gehele netwerkmodel introduceert"
   ],
   "a": 2,
   "u": "Bridge centraliteit lijkt op normale centraliteitsmaten maar kijkt naar hoe nodes van een bepaalde cluster met nodes van andere clusters verbonden zijn; dit is te vergelijken met de kruisladingen van factoranalyse."
  },
  {
   "h": "h6",
   "q": "Wat is de functie van robust error calculation in een SEM-analyse?",
   "o": [
    "Het toevoegen van latente variabelen om de meetfout te elimineren",
    "Het corrigeren van de vrijheidsgraden zodat de chi-kwadraattoets ook bij kleine steekproeven significant blijft",
    "Het samennemen van indicatoren van dezelfde latente variabele tot item parcels",
    "Het verminderen van de invloed van outliers bij niet normaal verdeelde of heteroscedastische gegevens"
   ],
   "a": 3,
   "u": "Robust error calculation is een techniek die de effecten van outliers of afwijkende waarnemingen op de schattingen vermindert bij niet normaal verdeelde of heteroscedastische gegevens."
  }
 ],
 "hacks": [
  {
   "h": "algemeen",
   "kop": "Listwise = Lijst weg",
   "t": "Bij Listwise deletion gooi je de hele Lijst (het volledige subject) weg zodra er iets ontbreekt. Pairwise houdt de rest van het Paar aan gegevens wel, en schrapt enkel het ene ontbrekende punt."
  },
  {
   "h": "algemeen",
   "kop": "Continu of hokjes?",
   "t": "Kies de techniek op basis van de AV. Is de AV een continue meetwaarde, dan lineaire of meervoudige regressie. Valt de AV in hokjes (categorieen), dan logistische regressie, binair bij twee hokjes en multinomiaal bij meer."
  },
  {
   "h": "algemeen",
   "kop": "Levene voor de start, Mauchly voor de herhaling",
   "t": "Levene's test check je vooraf bij een gewone ANOVA (gelijke varianties tussen groepen). Mauchly's W hoort bij herhaalde metingen en toetst de bolvormigheid tussen condities. Zo verwar je de twee assumptietoetsen niet."
  },
  {
   "h": "algemeen",
   "kop": "PCA versus PFA: Totaal versus Gedeeld",
   "t": "PCA begint met een P van Plaatje-van-alles: het gebruikt de totale variantie. PFA staat voor de Focus op wat variabelen gemeen hebben, dus enkel de gemeenschappelijke variantie."
  },
  {
   "h": "algemeen",
   "kop": "Single = Minimum, Complete = Maximum",
   "t": "Onthoud de linkage-methoden via het uiteinde van het woord: Single linkage kijkt naar de kleinste (minimale) afstand tussen twee punten, Complete linkage naar de grootste (maximale) afstand, en Average zit er letterlijk gemiddeld tussenin."
  },
  {
   "h": "algemeen",
   "kop": "Confirmatief blijven",
   "t": "SEM en confirmatorische factoranalyse zijn CONFIRMATIEF: je test een vooraf bedacht model. Zodra je te veel modification indices toevoegt, verschuif je naar exploratief en verlies je de veralgemeenbaarheid. Onthoud: modificeren mag, maar overdrijven verandert je speurtocht in gokwerk."
  }
 ],
 "theorie": [
  {
   "h": "h1",
   "kop": "Kernpunten",
   "items": [
    "Regressieanalyse: techniek om een continue variabele te voorspellen aan de hand van een andere continue variabele, waarbij je nagaat hoe y varieert bij veranderingen in x.",
    "Aangepaste R2: variant van R2 die corrigeert voor het aantal predictoren, zodat de waarde niet vanzelf stijgt bij het toevoegen van variabelen.",
    "Collineariteit: onderlinge samenhang tussen predictoren in een meervoudig regressiemodel, waarop je hoort te controleren.",
    "Steekproefverdeling (sample distribution): empirische, gekende frequentieverdeling van de uitkomsten van de steekproef.",
    "Steekproevenverdeling (sampling distribution): theoretische, benaderde kansverdeling van alle mogelijke waarden die een steekproefgrootheid kan aannemen.",
    "Centrale limietstelling: bij herhaald trekken van toevallige steekproeven met voldoende grote n (vuistregel n groter dan 30) benadert de steekproevenverdeling van het gemiddelde een normaalverdeling.",
    "Homoscedasticiteit: de afhankelijke variabelen vertonen vergelijkbare niveaus van variantie over de hele range van de onafhankelijke variabelen.",
    "Heteroscedasticiteit: predicties zijn beter voor sommige waarden van de onafhankelijke variabele dan voor andere.",
    "MCAR (Missing Completely At Random): de oorzaak van het ontbreken van data ligt niet aan de test.",
    "MAR (Missing At Random): er is een link tussen de variabele en de missing data, maar de oorzaak is niet de variabele zelf.",
    "Non-random missingness: systematisch missende gegevens die te wijten zijn aan procedurele factoren.",
    "Listwise deletion: alle gegevens van een subject verwijderen zodra er bij die persoon data ontbreekt.",
    "Pairwise deletion: enkel het ontbrekende gegeven van een subject verwijderen en de overige beschikbare gegevens nog gebruiken.",
    "Dummy variabele: dichotome variabele (waarde 0 of 1) die één categorie van een niet-metrische onafhankelijke variabele representeert.",
    "Mahalanobis: techniek waarmee je extreme waarden (outliers) kunt detecteren.",
    "Fit: de voorspelde waarden van de afhankelijke variabele, berekend door de regressievergelijking toe te passen op de onafhankelijke variabele(n) en de geschatte regressiecoëfficiënt(en)."
   ]
  },
  {
   "h": "h2",
   "kop": "Kernpunten",
   "items": [
    "Meervoudige regressie: voorspelt een continue AV uit meerdere OV, ook bruikbaar wanneer OV categorisch, binair of nominaal zijn via dummy's.",
    "Aangepaste (adjusted) R2: verlaagt de R2 naarmate er minder waarnemingen per variabele zijn, geschikt om modellen met verschillende aantallen variabelen te vergelijken.",
    "Gestandaardiseerde beta: geeft aan met hoeveel standaardafwijkingen de AV toeneemt als de OV met een standaardafwijking stijgt.",
    "Multicollineariteit: de onderlinge verbanden tussen OV, wat de errors, betrouwbaarheidsintervallen en p-waarden vergroot.",
    "Tolerantie: maat voor multicollineariteit, het percentage variantie van een OV dat niet door de andere OV verklaard wordt, moet minstens 50% zijn.",
    "Variance Inflation Factor (VIF): een andere manier om tolerantie uit te drukken via 1 gedeeld door de tolerantie.",
    "Logistische regressie: herleidt de AV naar een nominale of ordinale schaal, binair bij twee categorieen en multinomiaal bij meer dan twee.",
    "Odds: de kans op succes ten opzichte van de kans op mislukking, lopend van 0 tot plus oneindig.",
    "Logit (log odd unit): de odds herleid naar een eindeloze schaal zodat dichotome variabelen op een continue wijze voorspeld kunnen worden.",
    "Pseudo R2 maten: geven de model of fit aan bij dichotome variabelen, met Cox & Snell en Nagelkerke als voorbeelden.",
    "Hosmer test: een goodness of fit test voor logistische regressiemodellen.",
    "Parsimonie: de AV zo goed mogelijk voorspellen met zo min mogelijk OV.",
    "Statistische versus klinische significantie: statistisch bij p kleiner dan 0,05, klinisch wanneer het effect klinisch relevant is met een grote effectgrootte.",
    "Normaliteitstoetsen: Kolmogorov-Smirnov bij kleine n en Shapiro-Wilcoxon bij grote steekproeven, normaal verdeeld indien p groter dan 0,05."
   ]
  },
  {
   "h": "h3",
   "kop": "Kernpunten",
   "items": [
    "ANOVA: techniek om verschillen in een continue variabele tussen categorische groepen te ontdekken.",
    "Omnibustest: vergelijkt de verklaarde met de niet-verklaarde variantie om de globale model fit na te gaan.",
    "Capitalizing by chance: door veel testen uit te voeren stijgt het totale risico op een Type I fout (permissief).",
    "Bonferroni correctie: deelt de p-waarde door het aantal gevallen; conservatief, dus meer kans op Type II fout.",
    "Levene's test: toetst homoscedasticiteit bij ANOVA (p<0,05 betekent heteroscedasticiteit).",
    "Post-hoc testing: testen die men uitvoert nadat een significante ANOVA is vastgesteld, zoals paarsgewijze t-tests.",
    "Contrast: post-hoc test die kanskapitalisatie tegengaat en meer power heeft dan de F-waarde van ANOVA.",
    "Partiele eta-kwadraat: maat voor de effectgrootte bij ANOVA.",
    "Factoriele ANOVA: ANOVA met meer dan één categorische OV die interactie-effecten bloot legt.",
    "Interactie-effect: de invloed van een OV op de AV verschilt naargelang een andere OV.",
    "Repeated measures ANOVA: gebruikt wanneer de groepen in de OV niet onafhankelijk van elkaar zijn.",
    "Sfericiteit: de variantie van de verschillen tussen metingen is constant over alle combinaties; getoetst met Mauchly's W.",
    "Mixed model ANOVA: combineert between- en within-subjects om hoofd- en interactie-effecten te onderzoeken.",
    "Moderator versus mediator: een moderator versterkt de correlatie, een mediator verklaart ze beter."
   ]
  },
  {
   "h": "h4",
   "kop": "Kernpunten",
   "items": [
    "Factoranalyse: techniek om data te reduceren en samen te vatten door onderliggende dimensies te vinden.",
    "Exploratieve factoranalyse: zoektocht naar structuur in een set variabelen zonder vooraf bepaalde theorie.",
    "Confirmatorische factoranalyse: toetsen van een a-priori samenhang tussen variabelen op basis van theorie of eerder onderzoek.",
    "Factor: een groepje variabelen dat sterk correleert of samen oplaadt op een onderliggend construct.",
    "Factorlading: de correlatie van elke oorspronkelijke variabele met de factor.",
    "KMO (Kaiser-Meyer-Olkin): maat voor de kwaliteit van de intercorrelaties, moet groter zijn dan 0,5 en wordt zeker gerapporteerd.",
    "Bartlett's test of sphericity: toetst of de correlatiematrix een significant aantal correlaties bevat; significant betekent bolvormig.",
    "Communaliteit: het deel van de variantie van een variabele dat door alle dimensies samen wordt verklaard, als som van de gekwadrateerde ladingen.",
    "Eigenwaarde: de hoeveelheid variantie die door een dimensie wordt verklaard; hoger betekent meer verklaarde variantie.",
    "PCA (Principal Component Analysis): vertrekt vanuit de totale variantie en vat zoveel mogelijk oorspronkelijke variantie samen.",
    "PFA (Principal Factor Analysis): vertrekt enkel vanuit de gemeenschappelijke variantie, in SPSS Principal Axis Factoring.",
    "Orthogonale rotatie: componenten blijven onafhankelijk, assenstelsel wordt rechthoekig gedraaid, in SPSS Varimax.",
    "Scheve (oblique) rotatie: componenten mogen aan elkaar gerelateerd zijn, in SPSS Direct Oblimin.",
    "Scree plot: grafiek van eigenwaardes waarbij het Kattell-criterium naar de knik kijkt en het Kaisercriterium factoren met eigenwaarde onder 1 weglaat."
   ]
  },
  {
   "h": "h5",
   "kop": "Kernpunten",
   "items": [
    "K-means clustering: clusteringmethode waarbij je zelf vooraf bepaalt hoeveel clusters je wil (SPSS: Analyze, Classify, K-means cluster).",
    "Hiërarchische clustering: objecten worden stapsgewijs geclusterd op basis van gelijkenis of afstand, met een dendrogram als resultaat.",
    "Dendrogram: boomdiagram dat de hiërarchische relaties tussen de geclusterde objecten weergeeft.",
    "Agglomeratieve clustering: bottom-up benadering die start met elk object als eigen cluster en telkens de meest vergelijkbare clusters samenvoegt tot één cluster.",
    "Iteratie: herhaling van een stap in het clusteringproces.",
    "Minkowski metriek: overkoepelende afstandsmaat om de afstand tussen punten in een meerdimensionale ruimte te meten.",
    "City block / Manhattan afstand (p=1): som van de absolute verschillen tussen de coördinaten, zonder te kwadrateren, de baan rond de blok.",
    "Euclidische afstand (p=2): kortste rechte lijn tussen twee punten (vogelvlucht), waarbij de verschillen gekwadrateerd worden, vergelijkbaar met Pythagoras.",
    "Single linkage (nearest neighbour): afstand tussen clusters is de minimale afstand tussen een paar punten uit afzonderlijke clusters.",
    "Complete linkage: afstand tussen clusters is de maximale afstand tussen een paar punten uit afzonderlijke clusters.",
    "Average linkage: afstand tussen clusters is de gemiddelde afstand tussen twee afzonderlijke clusters.",
    "Cluster membership: de toewijzing van individuele waarnemingen aan specifieke clusters in de analyse.",
    "Ward's methode: agglomeratieve methode die de variantie binnen elke cluster minimaliseert voor zo homogeen mogelijke clusters, met squared Euclidische afstand.",
    "ESS (error sum of squares): de coëfficiënten die je verkrijgt via Ward's methode."
   ]
  },
  {
   "h": "h6",
   "kop": "Kernpunten",
   "items": [
    "SEM: confirmatorische benadering die latente factoren schat uit geobserveerde indicatoren, meetfouten in rekening brengt en meerdere OV en AV modelleert; gaat causaliteit na maar toont die niet aan.",
    "Confirmatorische factoranalyse: techniek om hypothesen over de structuur van meetbare variabelen te testen en de relaties met onderliggende latente constructen te onderzoeken.",
    "Latent construct: iets dat niet rechtstreeks observeerbaar is en met een meetinstrument (via indicatoren) gemeten moet worden.",
    "Just-identified model: model met 0 vrijheidsgraden, waarvan de fit niet beoordeeld kan worden.",
    "Baseline model: model zonder relaties tussen de geobserveerde variabelen.",
    "Saturated of unconstrained model: model met alle mogelijke relaties tussen de geobserveerde variabelen.",
    "RMSEA: indicatie van absolute fit die de hoeveelheid misfit per vrijheidsgraad aangeeft; lagere waarden zijn beter.",
    "Incremental fit indices: fit-maten die het model vergelijken met het baseline model.",
    "Modification index: het toevoegen of verwijderen van specifieke parameters; te veel gebruik maakt het model te specifiek en niet meer veralgemeenbaar (shift van confirmatief naar exploratief).",
    "Padanalyse: schat causale effecten rechtstreeks tussen geobserveerde variabelen en slaat het measurement model en de latente variabelen over.",
    "Robust error calculation: techniek om de invloed van outliers te verminderen bij niet normaal verdeelde of heteroscedastische gegevens.",
    "Netwerkanalyse: maakt visuele relaties tussen symptomen mogelijk; een undirected netwerk kan gebruikt worden voor niet-oorzakelijke verbanden.",
    "Edge en node: een edge is de link tussen twee variabelen als je voor alle andere controleert, een node is de knoop die een specifieke componentvariabele voorstelt.",
    "Centraliteit en bridge centraliteit: centraliteit is de mate waarin een variabele met andere variabelen verbonden is, bridge centraliteit kijkt hoe nodes van een cluster met nodes van andere clusters verbonden zijn, vergelijkbaar met kruisladingen in factoranalyse.",
    "Pairwise Markov Random Fields (PMRF): undirected netwerk met edges die de voorwaardelijke afhankelijkheid tussen twee nodes voorstellen."
   ]
  }
 ],
 "hardVragen": [
  {
   "h": "h1",
   "q": "In een vragenlijststudie ontbreken systematisch de scores van de deelnemers uit één testsessie, omdat de afname daar procedureel fout verliep. De onderzoeker wil de overige gegevens van die deelnemers toch nog gebruiken. Welke combinatie van typering en aanpak klopt?",
   "o": [
    "Missing At Random (MAR), opgevangen met pairwise deletion",
    "Non-random missingness, opgevangen met listwise deletion",
    "Missing Completely At Random (MCAR), opgevangen met listwise deletion",
    "Non-random missingness, opgevangen met pairwise deletion"
   ],
   "a": 3,
   "u": "Systematisch ontbrekende gegevens door procedurele factoren heten non-random missingness. Wie de overige gegevens van een subject wil behouden, gebruikt pairwise deletion: enkel het ontbrekende gegeven valt weg, terwijl listwise deletion alle gegevens van dat subject schrapt."
  },
  {
   "h": "h1",
   "q": "Een onderzoeker trekt herhaaldelijk toevallige steekproeven van n = 50 uit een populatie die niet normaal verdeeld is. Welke uitspraak is correct?",
   "o": [
    "De centrale limietstelling is hier niet van toepassing, omdat de populatie zelf niet normaal verdeeld is",
    "De steekproevenverdeling van het gemiddelde benadert een normaalverdeling, want n ligt boven de vuistregel van 30",
    "De steekproefverdeling van elke getrokken steekproef wordt normaal, want n ligt boven de vuistregel van 30",
    "De steekproevenverdeling is de empirische, gekende frequentieverdeling van de scores binnen één steekproef"
   ],
   "a": 1,
   "u": "Volgens de centrale limietstelling benadert de steekproevenverdeling (de theoretische verdeling van alle mogelijke steekproefgemiddelden) bij voldoende grote n, vuistregel n groter dan 30, een normaalverdeling. De stelling stelt enkel een voorwaarde aan de steekproefgrootte, niet aan de verdeling van de populatie. De steekproefverdeling is de empirische verdeling binnen één steekproef, en daarover doet de stelling geen uitspraak."
  },
  {
   "h": "h2",
   "q": "In de SPSS-output van een meervoudige regressie heeft een OV een tolerantie van 0,25. Welke interpretatie is correct?",
   "o": [
    "VIF = 0,75; 75% van de variantie van die OV is niet door de andere OV verklaard, dus geen probleem",
    "VIF = 4; slechts 25% van de variantie van die OV wordt door de andere OV verklaard, dus geen probleem",
    "VIF = 4; slechts 25% van de variantie van die OV is niet door de andere OV verklaard, dus multicollineariteit",
    "VIF = 0,25; de tolerantie ligt onder 50%, wat wijst op heteroscedasticiteit van de residuen"
   ],
   "a": 2,
   "u": "De VIF is 1 gedeeld door de tolerantie, hier 1/0,25 = 4. Tolerantie is het percentage variantie van een OV dat niet door de andere OV verklaard wordt en moet minstens 50% zijn, dus 25% wijst op een probleem met multicollineariteit."
  },
  {
   "h": "h3",
   "q": "In een mixed model ANOVA worden twee onafhankelijke behandelgroepen telkens op drie tijdstippen gemeten. Mauchly's W is significant (p = 0,01) en de epsilon-schatting bedraagt 0,68. Welke besluitvorming is correct?",
   "o": [
    "Sfericiteit is geschonden, dus je past de Greenhouse-Geisser correctie toe op de herhaalde metingen",
    "Sfericiteit is voldaan, dus de F-toets van de herhaalde metingen mag zonder correctie gelezen worden",
    "Sfericiteit is geschonden, dus je past de Huynh-Feldt correctie toe op de herhaalde metingen",
    "Homoscedasticiteit is geschonden, dus je past een Bonferroni correctie toe op de herhaalde metingen"
   ],
   "a": 0,
   "u": "Mauchly's W toetst de sfericiteit (bolvormigheid); een significant resultaat (p<0,05) betekent dat die geschonden is en dat een sfericiteitscorrectie nodig is. Bij een epsilon-schatting kleiner dan 0,75 is Greenhouse-Geisser aangewezen, Huynh-Feldt pas boven 0,75."
  },
  {
   "h": "h3",
   "q": "Welke twee stellingen over meervoudig toetsen en assumpties bij ANOVA zijn FOUT?",
   "o": [
    "Hoe meer losse toetsen je uitvoert, hoe groter het totale risico op een Type I fout wordt",
    "De Bonferroni correctie is permissief en verkleint daardoor vooral de kans op een Type II fout",
    "Een contrast gaat kanskapitalisatie tegen en heeft meer power dan de F-waarde van de ANOVA",
    "Een significante Levene's test (p<0,05) toont aan dat de varianties tussen de groepen gelijk zijn"
   ],
   "a": [
    1,
    3
   ],
   "kies": "fout",
   "u": "De Bonferroni correctie is net conservatief: ze deelt de p-waarde door het aantal gevallen en vergroot zo de kans op een Type II fout. Een significante Levene's test wijst op heteroscedasticiteit, niet op gelijke varianties; de andere twee stellingen beschrijven kanskapitalisatie en contrasten correct."
  },
  {
   "h": "h4",
   "q": "Een onderzoeker wil in SPSS enkel de gemeenschappelijke variantie van zijn items analyseren en verwacht dat de onderliggende factoren met elkaar samenhangen. Welke combinatie van extractie en rotatie past hierbij?",
   "o": [
    "Principal Component Analysis met een orthogonale Varimax rotatie",
    "Principal Axis Factoring met een orthogonale Varimax rotatie",
    "Principal Component Analysis met een scheve Direct Oblimin rotatie",
    "Principal Axis Factoring met een scheve Direct Oblimin rotatie"
   ],
   "a": 3,
   "u": "Wie enkel de gemeenschappelijke variantie gebruikt, kiest PFA, in SPSS Principal Axis Factoring; PCA vertrekt van de totale variantie. Mogen de factoren aan elkaar gerelateerd zijn, dan is een scheve (oblique) rotatie nodig, in SPSS Direct Oblimin, terwijl Varimax de componenten onafhankelijk houdt."
  },
  {
   "h": "h4",
   "q": "In een oplossing met twee factoren laadt een variabele 0,6 op factor 1 en 0,5 op factor 2. Wat is de communaliteit van die variabele en wat betekent ze?",
   "o": [
    "1,10; de som van de ladingen geeft aan hoeveel variantie van de variabele verklaard wordt",
    "0,61; dit is de eigenwaarde, dus de variantie die de eerste factor in totaal verklaart",
    "0,61; 61% van de variantie van die variabele wordt door beide factoren samen verklaard",
    "0,39; dit is het deel van de variantie van die variabele dat door de factoren verklaard wordt"
   ],
   "a": 2,
   "u": "De communaliteit is de som van de gekwadrateerde ladingen van een variabele: 0,6 x 0,6 + 0,5 x 0,5 = 0,36 + 0,25 = 0,61. Ze geeft aan welk deel van de variantie van die variabele door alle dimensies samen verklaard wordt, terwijl de eigenwaarde de variantie is die één dimensie verklaart."
  },
  {
   "h": "h5",
   "q": "Op één variabele bevat cluster A objecten met de scores 1 en 2 en cluster B objecten met de scores 5 en 9. Hoe groot is de afstand tussen A en B volgens single linkage en volgens complete linkage?",
   "o": [
    "Single linkage 8, complete linkage 3",
    "Single linkage 3, complete linkage 8",
    "Single linkage 3, complete linkage 5,5",
    "Single linkage 5,5, complete linkage 8"
   ],
   "a": 1,
   "u": "Single linkage neemt de minimale afstand tussen een paar punten uit de afzonderlijke clusters (5 min 2 = 3), complete linkage de maximale afstand (9 min 1 = 8). De vier afstanden tussen de paren (4, 8, 3 en 7) hebben een gemiddelde van 5,5; die waarde hoort dus bij average linkage."
  },
  {
   "h": "h6",
   "q": "Een onderzoeker beoordeelt de fit van zijn SEM-model door het af te zetten tegen een model zonder relaties tussen de geobserveerde variabelen. Welke combinatie van fit-maat en vergelijkingsmodel beschrijft dit correct?",
   "o": [
    "Een incrementele fit-index, met het saturated model als vergelijkingspunt",
    "De RMSEA als absolute fit-maat, met het baseline model als vergelijkingspunt",
    "Een incrementele fit-index, met het baseline model als vergelijkingspunt",
    "Een modification index, met het just-identified model als vergelijkingspunt"
   ],
   "a": 2,
   "u": "Incremental fit indices vergelijken het model met het baseline model, dat geen relaties tussen de geobserveerde variabelen bevat. Het saturated model bevat net alle mogelijke relaties, en de RMSEA is een absolute fit-maat die de misfit per vrijheidsgraad weergeeft."
  },
  {
   "h": "h6",
   "q": "Welke stelling over netwerkanalyse is FOUT?",
   "o": [
    "Bridge centraliteit kijkt hoe nodes binnen eenzelfde cluster onderling verbonden zijn, zoals communaliteiten",
    "Een undirected netwerk kan gebruikt worden om niet-oorzakelijke verbanden tussen symptomen weer te geven",
    "Een edge in een Pairwise Markov Random Field stelt de voorwaardelijke afhankelijkheid tussen twee nodes voor",
    "Centraliteit is de mate waarin een variabele met de andere variabelen in het netwerk verbonden is"
   ],
   "a": 0,
   "u": "Bridge centraliteit kijkt net hoe nodes van een cluster met nodes van andere clusters verbonden zijn, vergelijkbaar met kruisladingen in factoranalyse. De overige stellingen geven correct weer wat een undirected netwerk, een edge in een PMRF en centraliteit zijn."
  }
 ]
};
