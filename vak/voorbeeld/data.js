// Voorbeeldvak om het sjabloon te testen; echte vakken krijgen elk hun eigen data.js in dit formaat.
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
      q: 'Welk studiedoel beschrijft een concrete taak waarvan je kunt controleren of die af is?',
      o: ['Meer tijd aan het vak besteden.', 'Vijf oefenvragen beantwoorden en nakijken.', 'Het hoofdstuk beter kennen.', 'Deze week gemotiveerder studeren.'],
      a: 1,
      u: 'Bij vijf beantwoorde en nagekeken vragen kun je vaststellen of de taak af is. De andere doelen noemen geen duidelijk eindpunt.'
    },
    {
      h: 'h1',
      q: 'Je verdeelt een opdracht over drie taken van 30 minuten. Hoeveel werktijd plan je, zonder pauzes?',
      o: ['30 minuten.', '60 minuten.', '120 minuten.', '90 minuten.'],
      a: 3,
      u: 'Drie taken van 30 minuten kosten samen 90 minuten. Pauzes en eventuele extra tijd komen daar nog bij.'
    },
    {
      h: 'h1',
      q: 'Waarom is het nuttig om wat ruimte over te laten in een studieplanning?',
      o: ['Dan kun je een uitgelopen taak opvangen.', 'Dan hebben taken geen deadline meer nodig.', 'Dan hoef je de duur van taken niet te schatten.', 'Dan kun je alle herhaling overslaan.'],
      a: 0,
      u: 'Een taak kan meer tijd vragen dan verwacht. Extra ruimte maakt het mogelijk om de planning daarop aan te passen.'
    },
    {
      h: 'h1',
      q: 'Wat betekent terugplannen vanaf een deadline?',
      o: ['Pas op de deadline bepalen wat je gaat doen.', 'Alle taken op de laatste dag zetten.', 'Vanaf de einddatum bepalen wanneer de tussenstappen moeten gebeuren.', 'Na afloop opschrijven hoeveel tijd de opdracht kostte.'],
      a: 2,
      u: 'Je begint bij het moment waarop het werk klaar moet zijn. Daarna plan je de benodigde stappen op eerdere momenten.'
    },
    {
      h: 'h2',
      q: 'Welke handeling is een voorbeeld van actief ophalen uit je geheugen?',
      o: ['Een definitie overschrijven terwijl je die leest.', 'Een antwoord markeren in je cursus.', 'Een uitleg opnieuw bekijken.', 'Een begrip uitleggen zonder in je notities te kijken.'],
      a: 3,
      u: 'Bij actief ophalen probeer je informatie uit je geheugen te halen. Je bekijkt het antwoord pas daarna om jezelf te controleren.'
    },
    {
      h: 'h2',
      q: 'Wat is gespreid oefenen?',
      o: ['Alle herhalingen direct achter elkaar doen.', 'Dezelfde leerstof op verschillende momenten herhalen.', 'Elke oefensessie een ander lettertype gebruiken.', 'De antwoorden verspreid over een blad schrijven.'],
      a: 1,
      u: 'Gespreid oefenen verdeelt herhaling over meerdere momenten. Je komt later opnieuw terug op dezelfde leerstof.'
    },
    {
      h: 'h2',
      q: 'Hoe gebruik je een vraagkaartje om jezelf te toetsen?',
      o: ['Lees de vraag, bedenk je antwoord en draai het kaartje daarna om.', 'Bekijk eerst het antwoord en lees daarna de vraag.', 'Lees vraag en antwoord tegelijk hardop.', 'Sorteer de kaartjes zonder de vragen te beantwoorden.'],
      a: 0,
      u: 'Eerst zelf antwoorden oefent het ophalen. Door daarna te vergelijken met de achterkant ontdek je wat klopt en wat nog ontbreekt.'
    },
    {
      h: 'h2',
      q: 'Je antwoord op een oefenvraag is onjuist. Wat helpt om de fout te begrijpen?',
      o: ['Alleen de letter van het juiste antwoord onthouden.', 'De vraag voortaan overslaan.', 'Je redenering vergelijken met de uitleg van het juiste antwoord.', 'De score wissen zonder naar de uitleg te kijken.'],
      a: 2,
      u: 'Door je redenering naast de uitleg te leggen, kun je zien welk begrip of welke stap je moet verbeteren.'
    },
    {
      h: 'h3',
      q: 'Waar kijk je vóór een examen na welke hulpmiddelen je mag gebruiken?',
      o: ['Bij de officiële instructies voor dat examen.', 'Bij de regels van een ander vak.', 'Bij wat toevallig op je bureau ligt.', 'Bij de hulpmiddelen van een medestudent.'],
      a: 0,
      u: 'De officiële exameninstructies bepalen welke hulpmiddelen toegestaan zijn. Regels van andere vakken kunnen verschillen.'
    },
    {
      h: 'h3',
      q: 'Een open vraag vraagt om twee verschillen tussen begrippen. Welk antwoord sluit aan bij die opdracht?',
      o: ['Alleen de naam van elk begrip.', 'Een lijst met overeenkomsten.', 'Een algemene inleiding zonder vergelijking.', 'Twee verschillen, met uitleg per verschil.'],
      a: 3,
      u: 'Lees precies wat de vraag vraagt. In dit geval bestaat een passend antwoord uit twee toegelichte verschillen.'
    },
    {
      h: 'h3',
      q: 'Een oefenreeks bevat 12 vragen en je beantwoordt er 9 goed. Hoeveel vragen zijn onjuist beantwoord?',
      o: ['2 vragen.', '3 vragen.', '4 vragen.', '9 vragen.'],
      a: 1,
      u: 'Van de 12 vragen zijn er 9 goed: 12 min 9 is 3. Deze oefenscore voorspelt je resultaat op het echte examen niet.'
    },
    {
      h: 'h3',
      q: 'Je mag vóór het inleveren terug naar eerdere vragen. Waarvoor kun je controletijd gebruiken?',
      o: ['Om de instructies voortaan over te slaan.', 'Om elk antwoord automatisch te veranderen.', 'Om na te gaan of je alle gevraagde onderdelen hebt beantwoord.', 'Om alleen het aantal pagina’s te tellen.'],
      a: 2,
      u: 'Controleer of je antwoord volledig aansluit bij de opdracht en of je niets hebt overgeslagen. Verander een antwoord alleen met een inhoudelijke reden.'
    },
    {
      h: 'h2',
      q: 'Welke twee handelingen zijn voorbeelden van actief ophalen uit je geheugen?',
      o: ['Een antwoord lezen terwijl het voor je ligt.', 'Een begrip uitleggen zonder in je notities te kijken.', 'Een definitie letterlijk overschrijven uit je cursus.', 'Een vraagkaartje beantwoorden voordat je de achterkant bekijkt.'],
      a: [1, 3],
      u: 'Zonder notities uitleggen en eerst zelf een vraagkaartje beantwoorden vragen beide om informatie uit je geheugen op te halen. Lezen en overschrijven laten het antwoord al zien.'
    },
    {
      h: 'h3',
      q: 'Welke twee uitspraken over studieplanning zijn onjuist?',
      o: [
        'Een concrete taak heeft een duidelijk eindpunt.',
        'Terugplannen betekent dat je pas op de deadline beslist wat je gaat doen.',
        'Je kunt een grote opdracht verdelen in kleinere taken.',
        'Een deadline geeft aan wanneer het werk af moet zijn.',
        'Je kunt vooraf schatten hoeveel tijd een taak vraagt.',
        'Extra ruimte kan helpen als een taak uitloopt.',
        'Een pauze neemt ook tijd in je dagplanning in.',
        'Je kunt een planning aanpassen als de omstandigheden veranderen.',
        'Drie taken van 30 minuten vragen samen 60 minuten werktijd.',
        'Bij terugplannen plan je tussenstappen vóór de einddatum.'
      ],
      a: [1, 8],
      kies: 'fout',
      u: 'Bij terugplannen bepaal je vóór de deadline wanneer de tussenstappen plaatsvinden. Drie taken van 30 minuten kosten samen 90 minuten, niet 60. De andere acht uitspraken zijn juist.'
    }
  ],
  hacks: [
    { h: 'h1', t: 'Maak van een groot hoofdstuk kleine taken met een duidelijk eindpunt.' },
    { h: 'h1', t: 'Noteer deadlines eerst. Verdeel daarna de tussenstappen en laat wat ruimte over.' },
    { h: 'h2', t: 'Dek je notities af, probeer het zelf en controleer daarna.' },
    { h: 'h2', t: 'Plan een volgend oefenmoment, zodat dezelfde leerstof later terugkomt.' },
    { h: 'h3', t: 'Let op het werkwoord in een vraag: benoemen, uitleggen of vergelijken vraagt om een ander antwoord.' },
    { h: 'h3', t: 'Reserveer controletijd als je tijdens het examen naar eerdere antwoorden mag terugkeren.' }
  ],
  theorie: [
    {
      h: 'h1',
      kop: 'Van doel naar planning',
      items: [
        'Een concrete taak maakt zichtbaar wat je gaat doen en wanneer die af is.',
        'Schat de tijd per taak en plan tussenstappen vóór de deadline.',
        'Een planning mag veranderen als taken langer duren dan verwacht.'
      ]
    },
    {
      h: 'h2',
      kop: 'Ophalen, controleren en herhalen',
      items: [
        'Actief ophalen betekent dat je informatie probeert te herinneren zonder het antwoord te bekijken.',
        'Feedback helpt om je antwoord te controleren en fouten te begrijpen.',
        'Bij gespreid oefenen herhaal je dezelfde leerstof op verschillende momenten.'
      ]
    },
    {
      h: 'h3',
      kop: 'De vraag zorgvuldig beantwoorden',
      items: [
        'Controleer vooraf de officiële instructies en toegestane hulpmiddelen.',
        'Lees welk type antwoord en hoeveel onderdelen gevraagd worden.',
        'Oefenresultaten laten zien hoe deze vragen gingen. Ze garanderen geen resultaat op een ander examen.'
      ]
    }
  ]
};
