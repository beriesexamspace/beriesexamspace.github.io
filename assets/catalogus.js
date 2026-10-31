// Alle scholen en richtingen van Berie's Exam Space. Openbaar, geen persoonsgegevens.
// Basis voor het Insturen-formulier, later ook voor de kaart en Beheer.
// school.id en richting.id blijven altijd hetzelfde: ze worden in de database bewaard.
// Coördinaten zijn de hoofdlocatie (ongeveer), alleen voor een punt op de kaart.
// Richting-status: live (er zijn nagekeken vakken), binnenkort (er is echt materiaal in de maak), leeg.
(() => {
  'use strict';

  const JAREN = {
    vl: ['1BA', '2BA', '3BA'],
    fr: ['BAC1', 'BAC2', 'BAC3'],
    nl: ['Jaar 1', 'Jaar 2', 'Jaar 3']
  };

  const scholen = [
    // België, Nederlandstalig
    { id: 'kuleuven', naam: 'KU Leuven', kort: ['KUL', 'KU Leuven'], land: 'BE', stad: 'Leuven', type: 'universiteit', jaren: JAREN.vl, lat: 50.8777, lng: 4.7003 },
    { id: 'ugent', naam: 'Universiteit Gent', kort: ['UGent'], land: 'BE', stad: 'Gent', type: 'universiteit', jaren: JAREN.vl, lat: 51.0464, lng: 3.7275 },
    { id: 'uantwerpen', naam: 'Universiteit Antwerpen', kort: ['UA', 'UAntwerpen'], land: 'BE', stad: 'Antwerpen', type: 'universiteit', jaren: JAREN.vl, lat: 51.2230, lng: 4.4100 },
    { id: 'vub', naam: 'Vrije Universiteit Brussel', kort: ['VUB'], land: 'BE', stad: 'Brussel', type: 'universiteit', jaren: JAREN.vl, lat: 50.8222, lng: 4.3957 },
    { id: 'uhasselt', naam: 'Universiteit Hasselt', kort: ['UHasselt'], land: 'BE', stad: 'Hasselt en Diepenbeek', type: 'universiteit', jaren: JAREN.vl, lat: 50.9296, lng: 5.3936 },
    // België, Franstalig
    { id: 'uclouvain', naam: 'UCLouvain', kort: ['UCL', 'Université catholique de Louvain'], land: 'BE', stad: 'Louvain-la-Neuve', type: 'universiteit', jaren: JAREN.fr, lat: 50.6683, lng: 4.6118 },
    { id: 'ulb', naam: 'Université libre de Bruxelles', kort: ['ULB'], land: 'BE', stad: 'Brussel', type: 'universiteit', jaren: JAREN.fr, lat: 50.8126, lng: 4.3817 },
    { id: 'uliege', naam: 'Université de Liège', kort: ['ULiège', 'ULg'], land: 'BE', stad: 'Luik', type: 'universiteit', jaren: JAREN.fr, lat: 50.5833, lng: 5.5667 },
    { id: 'umons', naam: 'Université de Mons', kort: ['UMONS'], land: 'BE', stad: 'Bergen', type: 'universiteit', jaren: JAREN.fr, lat: 50.4589, lng: 3.9522 },
    { id: 'unamur', naam: 'Université de Namur', kort: ['UNamur'], land: 'BE', stad: 'Namen', type: 'universiteit', jaren: JAREN.fr, lat: 50.4660, lng: 4.8600 },
    // Nederland
    { id: 'leiden', naam: 'Universiteit Leiden', kort: ['UL', 'Leiden University'], land: 'NL', stad: 'Leiden', type: 'universiteit', jaren: JAREN.nl, lat: 52.1574, lng: 4.4851 },
    { id: 'rug', naam: 'Rijksuniversiteit Groningen', kort: ['RUG'], land: 'NL', stad: 'Groningen', type: 'universiteit', jaren: JAREN.nl, lat: 53.2194, lng: 6.5629 },
    { id: 'uva', naam: 'Universiteit van Amsterdam', kort: ['UvA'], land: 'NL', stad: 'Amsterdam', type: 'universiteit', jaren: JAREN.nl, lat: 52.3560, lng: 4.9550 },
    { id: 'uu', naam: 'Universiteit Utrecht', kort: ['UU'], land: 'NL', stad: 'Utrecht', type: 'universiteit', jaren: JAREN.nl, lat: 52.0857, lng: 5.1774 },
    { id: 'tudelft', naam: 'Technische Universiteit Delft', kort: ['TU Delft', 'TUD'], land: 'NL', stad: 'Delft', type: 'universiteit', jaren: JAREN.nl, lat: 51.9990, lng: 4.3735 },
    { id: 'vu', naam: 'Vrije Universiteit Amsterdam', kort: ['VU'], land: 'NL', stad: 'Amsterdam', type: 'universiteit', jaren: JAREN.nl, lat: 52.3341, lng: 4.8659 },
    { id: 'eur', naam: 'Erasmus Universiteit Rotterdam', kort: ['EUR', 'Erasmus'], land: 'NL', stad: 'Rotterdam', type: 'universiteit', jaren: JAREN.nl, lat: 51.9179, lng: 4.5256 },
    { id: 'wur', naam: 'Wageningen University', kort: ['WUR'], land: 'NL', stad: 'Wageningen', type: 'universiteit', jaren: JAREN.nl, lat: 51.9851, lng: 5.6634 },
    { id: 'ru', naam: 'Radboud Universiteit', kort: ['RU', 'Radboud'], land: 'NL', stad: 'Nijmegen', type: 'universiteit', jaren: JAREN.nl, lat: 51.8193, lng: 5.8571 },
    { id: 'tiu', naam: 'Tilburg University', kort: ['TiU'], land: 'NL', stad: 'Tilburg', type: 'universiteit', jaren: JAREN.nl, lat: 51.5625, lng: 5.0425 },
    { id: 'tue', naam: 'Technische Universiteit Eindhoven', kort: ['TU/e', 'TUe'], land: 'NL', stad: 'Eindhoven', type: 'universiteit', jaren: JAREN.nl, lat: 51.4486, lng: 5.4907 },
    { id: 'utwente', naam: 'Universiteit Twente', kort: ['UT'], land: 'NL', stad: 'Enschede', type: 'universiteit', jaren: JAREN.nl, lat: 52.2389, lng: 6.8553 },
    { id: 'um', naam: 'Maastricht University', kort: ['UM', 'Universiteit Maastricht'], land: 'NL', stad: 'Maastricht', type: 'universiteit', jaren: JAREN.nl, lat: 50.8476, lng: 5.6880 },
    { id: 'ou', naam: 'Open Universiteit', kort: ['OU'], land: 'NL', stad: 'Heerlen', type: 'universiteit', jaren: JAREN.nl, lat: 50.8800, lng: 5.9580 },
    { id: 'uvh', naam: 'Universiteit voor Humanistiek', kort: ['UvH'], land: 'NL', stad: 'Utrecht', type: 'universiteit', jaren: JAREN.nl, lat: 52.0905, lng: 5.1214 },
    { id: 'pthu', naam: 'Protestantse Theologische Universiteit', kort: ['PThU'], land: 'NL', stad: 'Utrecht', type: 'universiteit', jaren: JAREN.nl, lat: 52.0859, lng: 5.1717 },
    { id: 'tuu', naam: 'Theologische Universiteit Utrecht', kort: ['TUU'], land: 'NL', stad: 'Utrecht', type: 'universiteit', jaren: JAREN.nl, lat: 52.0907, lng: 5.1230 },
    { id: 'tua', naam: 'Theologische Universiteit Apeldoorn', kort: ['TUA'], land: 'NL', stad: 'Apeldoorn', type: 'universiteit', jaren: JAREN.nl, lat: 52.2165, lng: 5.9632 },
    { id: 'nyenrode', naam: 'Nyenrode Business Universiteit', kort: ['Nyenrode'], land: 'NL', stad: 'Breukelen', type: 'universiteit', jaren: JAREN.nl, lat: 52.1702, lng: 4.9945 },
    // Bijzondere instellingen
    { id: 'tul', naam: 'transnationale Universiteit Limburg', kort: ['tUL'], land: 'BE', stad: 'Hasselt/Diepenbeek en Maastricht', type: 'bijzonder', jaren: JAREN.vl, lat: null, lng: null, partners: ['uhasselt', 'um'] },
    { id: 'kms', naam: 'Koninklijke Militaire School', kort: ['KMS', 'ERM'], land: 'BE', stad: 'Brussel', type: 'bijzonder', jaren: JAREN.vl, lat: 50.8393, lng: 4.3926 },
    { id: 'tias', naam: 'TIAS School for Business and Society', kort: ['TIAS'], land: 'NL', stad: 'Tilburg en Utrecht', type: 'bijzonder', jaren: JAREN.nl, lat: 51.5626, lng: 5.0430 }
  ];

  // Richtingen: VUB volledig (de 32 bachelors uit de studiegids), andere scholen alleen waar er materiaal is.
  const r = (school, id, naam, status) => ({ id: school + '-' + id, school, naam, status: status || 'leeg' });
  const richtingen = [
    // VUB, Psychologie en Educatiewetenschappen
    r('vub', 'psychologie', 'Psychologie', 'live'),
    r('vub', 'agogische', 'Agogische Wetenschappen'),
    // VUB, Recht en Criminologie
    r('vub', 'rechten', 'Rechten'),
    r('vub', 'criminologie', 'Criminologische Wetenschappen', 'binnenkort'),
    // VUB, Lichamelijke Opvoeding en Kinesitherapie
    r('vub', 'lobw', 'Lichamelijke Opvoeding en Bewegingswetenschappen'),
    r('vub', 'revaki', 'Revalidatiewetenschappen en Kinesitherapie'),
    // VUB, Geneeskunde en Farmacie
    r('vub', 'geneeskunde', 'Geneeskunde'),
    r('vub', 'biomedische', 'Biomedische Wetenschappen'),
    r('vub', 'farmacie', 'Farmaceutische Wetenschappen'),
    // VUB, Letteren en Wijsbegeerte
    r('vub', 'geschiedenis', 'Geschiedenis'),
    r('vub', 'wijsbegeerte', 'Wijsbegeerte en Moraalwetenschappen'),
    r('vub', 'taal-letterkunde', 'Taal- en Letterkunde'),
    r('vub', 'kunstwetenschappen', 'Kunstwetenschappen en Archeologie'),
    r('vub', 'toegepaste-taalkunde', 'Toegepaste Taalkunde'),
    r('vub', 'linguistics', 'Linguistics and Literary Studies'),
    // VUB, Sociale Wetenschappen en Solvay Business School
    r('vub', 'sociologie', 'Sociologie'),
    r('vub', 'politieke', 'Politieke Wetenschappen'),
    r('vub', 'communicatie', 'Communicatiewetenschappen'),
    r('vub', 'tew', 'Toegepaste Economische Wetenschappen'),
    r('vub', 'handelsingenieur', 'Handelsingenieur'),
    r('vub', 'social-sciences', 'Social Sciences'),
    r('vub', 'business-economics', 'Business Economics'),
    // VUB, Ingenieurswetenschappen
    r('vub', 'burgerlijk-ingenieur', 'Ingenieurswetenschappen (burgerlijk ingenieur)'),
    r('vub', 'industrieel-ingenieur', 'Industriële Wetenschappen (industrieel ingenieur)'),
    // VUB, Wetenschappen en Bio-ingenieurswetenschappen
    r('vub', 'computerwetenschappen', 'Computerwetenschappen'),
    r('vub', 'ai', 'Artificiële Intelligentie'),
    r('vub', 'biologie', 'Biologie'),
    r('vub', 'chemie', 'Chemie'),
    r('vub', 'fysica', 'Fysica en Sterrenkunde'),
    r('vub', 'geografie', 'Geografie'),
    r('vub', 'wiskunde', 'Wiskunde en Data Science'),
    r('vub', 'bio-ingenieur', 'Bio-ingenieurswetenschappen'),
    // Maastricht University
    r('um', 'rechtsgeleerdheid', 'Rechtsgeleerdheid', 'binnenkort')
  ];

  // Zoeken zonder hoofdletters en accenten: "liege" vindt Université de Liège.
  const plat = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const STATUS_VOLGORDE = { live: 0, binnenkort: 1, leeg: 2 };

  window.BES_CATALOGUS = {
    scholen,
    richtingen,
    school: (id) => scholen.find((s) => s.id === id) || null,
    richting: (id) => richtingen.find((x) => x.id === id) || null,
    // Richtingen van een school: eerst live, dan binnenkort, dan alfabetisch.
    richtingenVan: (schoolId) => richtingen
      .filter((x) => x.school === schoolId)
      .sort((a, b) => (STATUS_VOLGORDE[a.status] - STATUS_VOLGORDE[b.status]) || a.naam.localeCompare(b.naam, 'nl')),
    // Zoekt op naam, afkorting en stad.
    zoekScholen: (tekst) => {
      const q = plat(tekst).trim();
      if (!q) return scholen.slice();
      return scholen.filter((s) => [s.naam, s.stad, ...s.kort].some((v) => plat(v).includes(q)));
    },
    // Herkent school en richting in vrije tekst, zoals "Psychologie aan de VUB" uit Over jezelf.
    // Alleen een eenduidige school telt; de richting alleen als er binnen die school precies één past.
    herken: (tekst) => {
      const ruw = String(tekst || '');
      const woorden = (t) => plat(t).replace(/[^a-z0-9/]+/g, ' ').trim();
      const zin = ' ' + woorden(ruw) + ' ';
      const heeftWoord = (w) => zin.includes(' ' + woorden(w) + ' ');
      // Korte afkortingen (UA, VU, UM) alleen in hoofdletters en als los woord, anders vindt "vu" ook "vub".
      const heeftKort = (k) => (k.length <= 2 ? new RegExp('(^|[^A-Za-z])' + k + '([^A-Za-z]|$)').test(ruw) : heeftWoord(k));
      const gevonden = scholen.filter((s) => heeftWoord(s.naam) || s.kort.some(heeftKort));
      if (gevonden.length !== 1) return null;
      const school = gevonden[0];
      const vlak = plat(ruw);
      // Eerst de volledige naam ("Toegepaste Economische Wetenschappen"), anders het begin van het eerste woord ("criminol").
      const stam = (naam) => plat(naam).split(/[\s(]/)[0].slice(0, 8);
      const vanSchool = richtingen.filter((x) => x.school === school.id);
      const volledig = vanSchool.filter((x) => vlak.includes(plat(x.naam)));
      const passend = volledig.length ? volledig : vanSchool.filter((x) => vlak.includes(stam(x.naam)));
      return { school, richting: passend.length === 1 ? passend[0] : null };
    }
  };
})();
