// Alle vakken van Berie's Exam Space, per jaar. Eén regel per vak.
// id    = de map van het vak: vak/<id>/ in v2, en <id>/ op de huidige site.
// v2    = true zodra het vak in v2 is omgezet (dan linkt de jaarpagina naar vak/<id>/).
// Zolang v2 false is, linkt de jaarpagina naar de bestaande tool op de huidige site.
(() => {
  'use strict';

  window.BES_LIVE = 'https://beriesexamspace.com/';

  window.BES_JAREN = [
    { id: '1ba', naam: '1ste bachelor', kort: '1BA' },
    { id: '2ba', naam: '2de bachelor', kort: '2BA' },
    { id: '3ba', naam: '3de bachelor', kort: '3BA' }
  ];

  window.BES_VAKKEN = [
    // 1ste bachelor
    { id: 'inlped', jaar: '1ba', naam: 'Inleiding tot de pedagogische wetenschappen', tekst: '145 vragen, waarvan 50 uit echte examens.', v2: true },
    { id: 'stat2', jaar: '1ba', naam: 'Statistiek II: kansrekening en inductieve statistiek', tekst: '155 oefenvragen over 9 hoofdstukken, met uitleg.', v2: true },
    { id: 'stat1', jaar: '1ba', naam: 'Statistiek I: meetschalen en beschrijvende statistiek', tekst: '90 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'ontwikkeling', jaar: '1ba', naam: 'Ontwikkelingspsychologie', tekst: '84 oefenvragen over de levensloop, met uitleg.', v2: true },
    { id: 'philsci', jaar: '1ba', naam: 'Philosophy of Science', tekst: '82 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'logica', jaar: '1ba', naam: 'Logica & Wetenschapsfilosofie', tekst: '50 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'mbg', jaar: '1ba', naam: 'Menselijke biologie en genetica', tekst: '1.296 meerkeuzevragen met uitleg, plus een samenvatting per hoofdstuk.', v2: true },
    { id: 'sociologie', jaar: '1ba', naam: 'Sociologie I', tekst: '153 vragen, waarvan 41 uit echte examens, met uitleg.', v2: true },
    { id: 'omt1', jaar: '1ba', naam: 'Onderzoeksmethoden en -technieken I: psychometrie', tekst: '42 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'socpsy', jaar: '1ba', naam: 'Sociale psychologie I: sociale cognitie', tekst: '70 oefenvragen, hoofdstuk 1 tot 7, met uitleg.', v2: true },
    { id: 'algpsy', jaar: '1ba', naam: 'Algemene psychologie', tekst: '82 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'biopsy1', jaar: '1ba', naam: 'Biologische psychologie I: inleiding', tekst: '151 vragen, waarvan 60 op examenniveau, ingestuurd door een student.', v2: true },

    // 2de bachelor
    { id: 'pers', jaar: '2ba', naam: 'Persoonlijkheidspsychologie', tekst: '73 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'thg', jaar: '2ba', naam: 'Theoretische en historische grondslagen van de psychologie', tekst: '37 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'cross', jaar: '2ba', naam: 'Cross-cultural psychology', tekst: '35 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'stat3', jaar: '2ba', naam: 'Statistiek III: univariate data-analyse', tekst: '54 conceptvragen: welke toets wanneer, met uitleg.', v2: true },
    { id: 'ao', jaar: '2ba', naam: 'Arbeids- en organisatiepsychologie', tekst: '45 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'ortho', jaar: '2ba', naam: 'Inleiding tot de orthopedagogiek', tekst: '122 examenvragen, met antwoorden.', v2: true },
    { id: 'biologische2', jaar: '2ba', naam: 'Biologische psychologie II: functies', tekst: '80 oefenvragen met uitleg, per hoofdstuk.', v2: true },
    { id: 'cogpsy', jaar: '2ba', naam: 'Cognitieve psychologie', tekst: '86 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'kpsy', jaar: '2ba', naam: 'Klinische psychiatrie', tekst: '92 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'rmt2', jaar: '2ba', naam: 'Research Methods and Techniques II: Quantitative Methods', tekst: '71 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'socpsy2', jaar: '2ba', naam: 'Social psychology II: Relations', tekst: '73 oefenvragen per hoofdstuk, met uitleg.', v2: true },

    // 3de bachelor
    { id: 'onderwijspsy', jaar: '3ba', naam: 'Onderwijspsychologie en leerstoornissen', tekst: '114 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'stat4', jaar: '3ba', naam: 'Statistiek IV: multivariate data-analyse', tekst: '56 conceptvragen over multivariate analyse, met uitleg.', v2: true },
    { id: 'diffpsy', jaar: '3ba', naam: 'Differentiële psychologie', tekst: '98 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'pg', jaar: '3ba', naam: 'Psychologische gespreksvoering met urban engaged praktijk', tekst: '72 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'gezpsy', jaar: '3ba', naam: 'Gezondheidspsychologie', tekst: '72 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'ebkh', jaar: '3ba', naam: 'Evidence-based kritisch handelen', tekst: '79 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'omt3', jaar: '3ba', naam: 'Onderzoeksmethoden en -technieken III: kwalitatieve methoden', tekst: '102 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'ppka', jaar: '3ba', naam: 'Psychopathologie van kinderen en adolescenten', tekst: '93 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'hrm', jaar: '3ba', naam: 'Principles of Human Resources Management', tekst: '98 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'ohv', jaar: '3ba', naam: 'Organisatie van de hulpverlening', tekst: '66 oefenvragen per hoofdstuk, met uitleg.', v2: true },
    { id: 'forensische', jaar: '3ba', naam: 'Forensische Psychiatrie', tekst: '47 oefenvragen over 6 hoofdstukken, met uitleg.', v2: true }
  ];

  // Link naar een vak: in v2 zodra het is omgezet, anders de bestaande tool.
  // 'basis' is het pad van de huidige pagina naar de map van v2 ('' op de jaarpagina's, '../../' vanuit vak/<id>/).
  window.BES_VAKLINK = (vak, basis) => vak.v2 ? (basis || '') + 'vak/' + vak.id + '/' : window.BES_LIVE + vak.id + '/';

  window.BES = Object.assign(window.BES || {}, {
    vakken: window.BES_VAKKEN,
    jaren: window.BES_JAREN,
    vakLink: window.BES_VAKLINK,
    vakkenVanJaar: jaar => window.BES_VAKKEN.filter(vak => vak.jaar === jaar),
    jaarNaam: jaar => (window.BES_JAREN.find(j => j.id === jaar) || {}).naam || ''
  });
})();
