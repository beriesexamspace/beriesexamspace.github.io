(function () {
  'use strict';
  var BM = window.BM = window.BM || {};

  // Welkomstflow van Berie's mindmap.
  //
  // 1. Na de mailcode (js/auth.js roept voorToegang aan): is het profiel nog leeg, dan
  //    "Wie ben je?" (voornaam, achternaam), daarna Student of Leerkracht.
  //    Leerkracht: aanspreking, school zoeken, en bij een school met toestemming de sleutel.
  //    Een goede sleutel geeft meteen toegang; anders gaat het naar de wachtkamer.
  // 2. Zodra iemand binnen is (js/auth.js roept naToegang aan): de eerste keer groot
  //    "Hallo ..." en daarna de uitleg (js/uitleg.js). Wie door Berie als bekend is
  //    gemarkeerd ziet eerst "Oei, Berie kent jou".
  //
  // De schermen staan in de kaart van het inlogscherm (#bm-auth) en gebruiken dezelfde
  // klassen (css/auth.css) plus css/welkom.css. Alles met createElement en textContent.
  // De server beslist: dit bestand geeft zelf nooit toegang (zie supabase/migratie-2026-11-11-welkom.sql).
  // Bestaat de database-functie mijn_profiel nog niet, dan slaat de app deze flow stil over.

  // ---------- alle teksten op een plek (hier aanpassen) ----------
  // {naam}, {school}, {aantal} en {minuten} worden vervangen.

  BM.welkomTeksten = {
    naam: {
      titel: 'Wie ben je?',
      tekst: 'Vul je voornaam en achternaam in. Zo weet Berie wie er binnenkomt.',
      voornaam: 'Voornaam',
      achternaam: 'Achternaam',
      knop: 'Verder',
      uitloggen: 'Andere account',
      foutLeeg: 'Vul je voornaam en je achternaam in.',
      foutOngeldig: 'Deze naam kan niet. Gebruik gewone letters, hooguit 40 tekens.'
    },
    rol: {
      titel: 'Ben je student of leerkracht?',
      tekst: 'Kies wat bij je past.',
      student: 'Student',
      studentUitleg: 'Ik volg les of studeer',
      leerkracht: 'Leerkracht',
      leerkrachtUitleg: 'Ik geef les op een school',
      terug: 'Terug'
    },
    aanspreking: {
      titel: 'Hoe mogen we je aanspreken?',
      tekst: 'Zo begroeten we je in de mindmap.',
      mevrouw: 'Mevrouw',
      meneer: 'Meneer',
      geen: 'Liever geen',
      terug: 'Terug'
    },
    school: {
      titel: 'Op welke school geef je les?',
      tekst: 'Zoek je school op naam of gemeente.',
      label: 'School zoeken',
      plaatshouder: 'Typ de naam van je school',
      begin: 'Typ minstens 2 letters om te zoeken.',
      zoeken: 'Zoeken...',
      niets: 'Geen school gevonden. Probeer een ander woord of de gemeente.',
      fout: 'Zoeken lukt nu niet. Probeer het opnieuw.',
      knop: 'Verder',
      foutKies: 'Kies eerst je school in de lijst.',
      nietInLijst: 'Mijn school staat er niet bij',
      terug: 'Terug',
      terugWacht: 'Terug naar de wachtkamer',
      goedgekeurd: 'Goedgekeurd'
    },
    sleutel: {
      titel: 'Vul je sleutel in',
      tekst: 'Je school {school} heeft toestemming. Vul de sleutel in die je van Berie kreeg.',
      label: 'Sleutel',
      plaatshouder: 'XXXX-XXXX-XXXX',
      knop: 'Naar binnen',
      foutVorm: 'Een sleutel heeft 12 tekens, bijvoorbeeld ABCD-EFGH-2345.',
      fout: 'Deze sleutel klopt niet.',
      foutOver1: 'Deze sleutel klopt niet. Nog 1 poging.',
      foutOver: 'Deze sleutel klopt niet. Nog {aantal} pogingen.',
      foutLaatste: 'Deze sleutel klopt niet. Dit was je laatste poging voor nu.',
      teVeel: 'Te veel pogingen. Probeer het over {minuten} minuten opnieuw.',
      teVeel1: 'Te veel pogingen. Probeer het over 1 minuut opnieuw.',
      andereSchool: 'Andere school',
      geenSleutel: 'Ik heb geen sleutel'
    },
    geenToestemming: {
      titel: 'Je school heeft nog geen toestemming',
      tekst: '{school} heeft nog geen toestemming voor de mindmap. Je gaat naar de wachtkamer. Berie bekijkt je aanvraag zelf.',
      tekstOnbekend: 'Je school staat nog niet in de lijst. Je gaat naar de wachtkamer. Berie bekijkt je aanvraag zelf.',
      knop: 'Naar de wachtkamer',
      andereSchool: 'Andere school kiezen'
    },
    wachtkamer: {
      titel: 'Je zit in de wachtkamer',
      tekst: 'Berie bekijkt wie je bent.',
      opheffingTitel: 'Opheffing aangevraagd',
      opheffingTekst: 'Berie overweegt of je afwijzing wordt opgeheven.',
      extra: '',
      sleutelLink: 'Ik heb een sleutel'
    },
    begroeting: {
      student: 'Hallo {naam}',
      leerkracht: 'Hallo {naam}',
      mevrouw: 'mevrouw',
      meneer: 'meneer',
      verder: 'Klik om verder te gaan'
    },
    bekend: {
      titel: 'Oei, Berie kent jou',
      verder: 'Klik om verder te gaan'
    },
    menu: {
      uitleg: 'Uitleg opnieuw bekijken'
    },
    algemeen: {
      bezig: 'Even geduld...',
      fout: 'Dat lukt nu niet. Probeer het opnieuw.',
      geenVerbinding: 'Kan geen verbinding maken. Controleer je internet.'
    }
  };

  var T = BM.welkomTeksten;

  var WACHT_MAX = 15000;     // ms: een aanroep die langer duurt telt als mislukt
  var ZOEK_WACHT = 250;      // ms: pauze na het typen voordat er gezocht wordt
  var NAAM_MAX = 40;
  var SLEUTEL_RE = /^[A-Z0-9]{12}$/;

  var ctx = null;            // {client, user, status, kaart, verbergSchermen, uitloggen} van js/auth.js
  var losMaken = null;       // resolve van de lopende flow
  var profiel = null;        // laatste antwoord van mijn_profiel (of null)
  var beschikbaar = false;   // de database kent de welkomstflow
  var schermen = null;       // naam -> scherm-object (pas gebouwd als het nodig is)
  var huidig = '';
  var vanafWacht = false;    // gestart vanuit de wachtkamer ("Ik heb een sleutel")
  var concept = { voornaam: '', achternaam: '', rol: null, aanspreking: null, school: null };
  var veldTeller = 0;
  var zoekTimer = 0;
  var zoekNr = 0;
  var appKlaar = false;      // de mindmap staat op het scherm
  var uitlegWacht = false;   // de uitleg moet starten zodra de app klaar is
  var begroetLaag = null;

  // ---------- hulpjes ----------

  function el(tag, cls, tekst) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (tekst !== undefined && tekst !== null) e.textContent = tekst;
    return e;
  }

  function vul(tekst, waarden) {
    return String(tekst || '').replace(/\{(\w+)\}/g, function (m, k) {
      return (waarden && waarden[k] !== undefined && waarden[k] !== null) ? String(waarden[k]) : '';
    });
  }

  function veilig(fn, terugval) {
    try { return fn(); } catch (e) { return terugval; }
  }

  function minderBeweging() {
    return veilig(function () {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, false);
  }

  function tekstVan(err) {
    return err ? String(err.message || err.msg || err) : '';
  }

  function isVerlopen(err) {
    return !!err && (err.code === '42501' || /niet_geverifieerd/.test(tekstVan(err)));
  }

  function isOngeldig(err) {
    return !!err && (err.code === '22023' || /ongeldige_/.test(tekstVan(err)));
  }

  // Database-functie aanroepen. Geeft altijd {fout, data}; gooit nooit. Na WACHT_MAX telt het als fout.
  function vraag(naam, args) {
    var client = ctx && ctx.client;
    if (!client) return Promise.resolve({ fout: new Error('geen client'), data: null });
    var p;
    try {
      p = (args === undefined) ? client.rpc(naam) : client.rpc(naam, args);
    } catch (e) {
      return Promise.resolve({ fout: e, data: null });
    }
    return new Promise(function (resolve) {
      var klaar = false;
      var t = setTimeout(function () {
        if (klaar) return;
        klaar = true;
        resolve({ fout: new Error('timeout'), data: null });
      }, WACHT_MAX);
      Promise.resolve(p).then(function (res) {
        if (klaar) return;
        klaar = true;
        clearTimeout(t);
        resolve({ fout: (res && res.error) ? res.error : null, data: res ? res.data : null });
      }, function (err) {
        if (klaar) return;
        klaar = true;
        clearTimeout(t);
        resolve({ fout: err || new Error('netwerk'), data: null });
      });
    });
  }

  function zetBezig(b, aan) {
    if (!b) return;
    b.classList.toggle('is-bezig', !!aan);
    // Bij een grote keuzeknop verandert alleen de kop; de regel eronder blijft staan.
    var doel = b.querySelector('.bm-welkom__keuze-kop') || b;
    if (aan) {
      if (!b._tekst) b._tekst = doel.textContent;
      doel.textContent = T.algemeen.bezig;
      b.disabled = true;
    } else {
      if (b._tekst) doel.textContent = b._tekst;
      b._tekst = '';
      b.disabled = false;
    }
  }

  function schoonNaam(v) {
    return String(v || '').replace(/\s+/g, ' ').trim();
  }

  function volleNaam(p) {
    return schoonNaam(((p && p.voornaam) || '') + ' ' + ((p && p.achternaam) || ''));
  }

  // Naam en rol ook naar het accountmenu (BM.thema bewaart dat alleen op deze computer).
  function naarThema() {
    if (!profiel || !profiel.ingevuld) return;
    veilig(function () {
      if (BM.thema && typeof BM.thema.zetProfiel === 'function') {
        BM.thema.zetProfiel({ naam: volleNaam(profiel), rol: profiel.rol });
      }
    }, null);
  }

  function schoonProfiel(d) {
    if (!d || typeof d !== 'object') return null;
    return {
      ingevuld: d.ingevuld === true,
      voornaam: typeof d.voornaam === 'string' ? d.voornaam : '',
      achternaam: typeof d.achternaam === 'string' ? d.achternaam : '',
      rol: (d.rol === 'student' || d.rol === 'leerkracht') ? d.rol : null,
      aanspreking: (d.aanspreking === 'mevrouw' || d.aanspreking === 'meneer' || d.aanspreking === 'geen') ? d.aanspreking : null,
      school_id: typeof d.school_id === 'string' ? d.school_id : null,
      school_naam: typeof d.school_naam === 'string' ? d.school_naam : null,
      school_toestemming: d.school_toestemming === true,
      bekend: d.bekend === true,
      bekend_gezien: d.bekend_gezien === true,
      uitleg_gezien: d.uitleg_gezien === true
    };
  }

  // ---------- schermen bouwen ----------

  function scherm(naam, titel, tekst) {
    var root = el('section', 'bm-auth__scherm bm-welkom__scherm');
    root.setAttribute('data-scherm', 'welkom-' + naam);
    var s = {
      naam: naam,
      root: root,
      titel: el('h1', 'bm-auth__titel', titel),
      tekst: el('p', 'bm-auth__tekst', tekst || ''),
      form: el('form', 'bm-auth__form'),
      fout: el('p', 'bm-auth__fout'),
      links: el('div', 'bm-auth__links'),
      knop: null
    };
    s.form.setAttribute('novalidate', '');
    s.fout.setAttribute('role', 'alert');
    root.appendChild(s.titel);
    root.appendChild(s.tekst);
    root.appendChild(s.form);
    root.appendChild(s.links);
    return s;
  }

  function veld(naam, label, opts) {
    opts = opts || {};
    veldTeller += 1;
    var id = 'bm-welkom-' + naam + '-' + veldTeller;
    var wrap = el('div', 'bm-veld');
    var lab = el('label', 'bm-veld__label', label);
    lab.setAttribute('for', id);
    var input = el('input', 'bm-veld__invoer');
    input.id = id;
    input.name = naam;
    input.type = 'text';
    input.setAttribute('autocomplete', opts.auto || 'off');
    input.setAttribute('autocapitalize', opts.hoofd || 'words');
    input.spellcheck = false;
    if (opts.max) input.maxLength = opts.max;
    if (opts.plaatshouder) input.placeholder = opts.plaatshouder;
    wrap.appendChild(lab);
    wrap.appendChild(input);
    return { wrap: wrap, input: input, label: lab };
  }

  function hoofdKnop(s, tekst) {
    s.form.appendChild(s.fout);
    s.knop = el('button', 'bm-knop bm-knop--primair', tekst);
    s.knop.type = 'submit';
    s.form.appendChild(s.knop);
  }

  function link(s, tekst, fn) {
    var b = el('button', 'bm-knop bm-knop--tekst', tekst);
    b.type = 'button';
    b.addEventListener('click', function () {
      if (b.disabled) return;
      fn(b);
    });
    s.links.appendChild(b);
    return b;
  }

  function koppel(s, fn) {
    s.form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (s.knop && s.knop.disabled) return;
      fn(s);
    });
  }

  // Grote keuzeknop met een kop en een korte regel eronder.
  function keuze(kop, uitleg) {
    var b = el('button', 'bm-welkom__keuze');
    b.type = 'button';
    b.appendChild(el('span', 'bm-welkom__keuze-kop', kop));
    if (uitleg) b.appendChild(el('span', 'bm-welkom__keuze-uitleg', uitleg));
    return b;
  }

  function bouwNaam() {
    var s = scherm('naam', T.naam.titel, T.naam.tekst);
    s.voornaam = veld('voornaam', T.naam.voornaam, { auto: 'given-name', max: NAAM_MAX });
    s.achternaam = veld('achternaam', T.naam.achternaam, { auto: 'family-name', max: NAAM_MAX });
    s.form.appendChild(s.voornaam.wrap);
    s.form.appendChild(s.achternaam.wrap);
    hoofdKnop(s, T.naam.knop);
    koppel(s, doeNaam);
    link(s, T.naam.uitloggen, function (b) {
      zetBezig(b, true);
      if (ctx && typeof ctx.uitloggen === 'function') ctx.uitloggen();
    });
    return s;
  }

  function bouwRol() {
    var s = scherm('rol', T.rol.titel, T.rol.tekst);
    s.keuzes = el('div', 'bm-welkom__keuzes');
    s.student = keuze(T.rol.student, T.rol.studentUitleg);
    s.leerkracht = keuze(T.rol.leerkracht, T.rol.leerkrachtUitleg);
    s.student.addEventListener('click', function () { doeRol('student'); });
    s.leerkracht.addEventListener('click', function () { doeRol('leerkracht'); });
    s.keuzes.appendChild(s.student);
    s.keuzes.appendChild(s.leerkracht);
    s.form.appendChild(s.keuzes);
    s.form.appendChild(s.fout);
    s.form.addEventListener('submit', function (e) { e.preventDefault(); });
    link(s, T.rol.terug, function () { toon('naam'); });
    return s;
  }

  function bouwAanspreking() {
    var s = scherm('aanspreking', T.aanspreking.titel, T.aanspreking.tekst);
    s.keuzes = el('div', 'bm-welkom__keuzes');
    s.knoppen = {};
    ['mevrouw', 'meneer', 'geen'].forEach(function (k) {
      var b = keuze(T.aanspreking[k], '');
      b.addEventListener('click', function () { doeAanspreking(k); });
      s.knoppen[k] = b;
      s.keuzes.appendChild(b);
    });
    s.form.appendChild(s.keuzes);
    s.form.appendChild(s.fout);
    s.form.addEventListener('submit', function (e) { e.preventDefault(); });
    link(s, T.aanspreking.terug, function () { toon('rol'); });
    return s;
  }

  // School zoeken: een eigen zoeklijst (geen standaard keuzemenu).
  function bouwSchool() {
    var s = scherm('school', T.school.titel, T.school.tekst);
    s.zoek = veld('school', T.school.label, { max: 80, hoofd: 'none', plaatshouder: T.school.plaatshouder });
    s.lijstId = 'bm-welkom-scholen';
    s.zoek.input.setAttribute('role', 'combobox');
    s.zoek.input.setAttribute('aria-autocomplete', 'list');
    s.zoek.input.setAttribute('aria-expanded', 'true');
    s.zoek.input.setAttribute('aria-controls', s.lijstId);
    s.lijst = el('ul', 'bm-welkom__lijst');
    s.lijst.id = s.lijstId;
    s.lijst.setAttribute('role', 'listbox');
    s.lijst.setAttribute('aria-label', T.school.label);
    s.leeg = el('li', 'bm-welkom__leeg', T.school.begin);
    s.leeg.setAttribute('role', 'presentation');
    s.lijst.appendChild(s.leeg);
    s.resultaten = [];
    s.opties = [];
    s.actief = -1;
    s.form.appendChild(s.zoek.wrap);
    s.form.appendChild(s.lijst);
    hoofdKnop(s, T.school.knop);
    koppel(s, doeSchool);

    s.zoek.input.addEventListener('input', function () {
      concept.school = null;
      s.fout.textContent = '';
      planZoek(s);
    });
    s.zoek.input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!s.opties.length) return;
        e.preventDefault();
        var naar = s.actief + (e.key === 'ArrowDown' ? 1 : -1);
        if (naar < 0) naar = s.opties.length - 1;
        if (naar >= s.opties.length) naar = 0;
        zetActief(s, naar, true);
      } else if (e.key === 'Enter' && s.actief >= 0 && !concept.school) {
        e.preventDefault();
        kiesSchool(s, s.actief);
      }
    });

    s.nietInLijst = link(s, T.school.nietInLijst, function (b) { doeGeenSchool(s, b); });
    s.terug = link(s, T.school.terug, function () {
      if (vanafWacht) { sluitAf({ soort: 'verder' }); return; }
      toon('aanspreking');
    });
    return s;
  }

  function bouwSleutel() {
    var s = scherm('sleutel', T.sleutel.titel, '');
    s.veld = veld('sleutel', T.sleutel.label, { max: 14, hoofd: 'characters', plaatshouder: T.sleutel.plaatshouder });
    s.veld.input.classList.add('bm-welkom__sleutel');
    s.veld.input.setAttribute('autocorrect', 'off');
    s.veld.input.addEventListener('input', function () {
      var v = sleutelSchoon(s.veld.input.value);
      var delen = v.match(/.{1,4}/g) || [];
      s.veld.input.value = delen.join('-');
      s.fout.textContent = '';
    });
    s.form.appendChild(s.veld.wrap);
    hoofdKnop(s, T.sleutel.knop);
    koppel(s, doeSleutel);
    link(s, T.sleutel.andereSchool, function () { toon('school'); });
    link(s, T.sleutel.geenSleutel, function () { sluitAf({ soort: 'verder' }); });
    return s;
  }

  function bouwGeen() {
    var s = scherm('geen', T.geenToestemming.titel, '');
    hoofdKnop(s, T.geenToestemming.knop);
    koppel(s, function () { sluitAf({ soort: 'verder' }); });
    link(s, T.geenToestemming.andereSchool, function () { toon('school'); });
    return s;
  }

  function bouw() {
    if (schermen || !ctx || !ctx.kaart) return;
    schermen = {
      naam: bouwNaam(),
      rol: bouwRol(),
      aanspreking: bouwAanspreking(),
      school: bouwSchool(),
      sleutel: bouwSleutel(),
      geen: bouwGeen()
    };
    Object.keys(schermen).forEach(function (naam) {
      ctx.kaart.appendChild(schermen[naam].root);
    });
  }

  function verbergEigen() {
    if (huidig && schermen && schermen[huidig]) schermen[huidig].root.classList.remove('is-actief');
    huidig = '';
    clearTimeout(zoekTimer);
    zoekTimer = 0;
  }

  // Wisselt naar een eigen scherm (de CSS van het inlogscherm zorgt voor de fade).
  function toon(naam) {
    bouw();
    var s = schermen && schermen[naam];
    if (!s) return;
    if (ctx && typeof ctx.verbergSchermen === 'function') ctx.verbergSchermen();
    verbergEigen();
    huidig = naam;
    s.fout.textContent = '';
    if (naam === 'naam') {
      if (!s.voornaam.input.value) s.voornaam.input.value = concept.voornaam;
      if (!s.achternaam.input.value) s.achternaam.input.value = concept.achternaam;
    } else if (naam === 'school') {
      s.terug.textContent = vanafWacht ? T.school.terugWacht : T.school.terug;
    } else if (naam === 'sleutel') {
      s.tekst.textContent = vul(T.sleutel.tekst, { school: concept.school ? concept.school.naam : '' });
      s.veld.input.value = '';
    } else if (naam === 'geen') {
      s.tekst.textContent = concept.school
        ? vul(T.geenToestemming.tekst, { school: concept.school.naam })
        : T.geenToestemming.tekstOnbekend;
    }
    s.root.classList.add('is-actief');
    var eerste = s.root.querySelector('input') || s.root.querySelector('.bm-welkom__keuze') || s.knop;
    if (eerste && !eerste.disabled) {
      veilig(function () { eerste.focus({ preventScroll: true }); }, null);
    }
  }

  // Einde van de flow: js/auth.js gaat verder met het antwoord.
  function sluitAf(resultaat) {
    verbergEigen();
    vanafWacht = false;
    var klaar = losMaken;
    losMaken = null;
    if (typeof klaar === 'function') klaar(resultaat);
  }

  // ---------- stappen ----------

  function doeNaam(s) {
    var v = schoonNaam(s.voornaam.input.value);
    var a = schoonNaam(s.achternaam.input.value);
    if (!v || !a) { s.fout.textContent = T.naam.foutLeeg; return; }
    if (v.length > NAAM_MAX || a.length > NAAM_MAX || /[<>\u0000-\u001f]/.test(v + a)) {
      s.fout.textContent = T.naam.foutOngeldig;
      return;
    }
    concept.voornaam = v;
    concept.achternaam = a;
    toon('rol');
  }

  // Bewaart het profiel op de server. Geeft true als het gelukt is; bij een fout staat de melding in het scherm.
  function bewaarProfiel(s, knop) {
    zetBezig(knop, true);
    return vraag('zet_profiel', {
      p_voornaam: concept.voornaam,
      p_achternaam: concept.achternaam,
      p_rol: concept.rol,
      p_aanspreking: concept.rol === 'leerkracht' ? concept.aanspreking : null,
      p_school_id: (concept.rol === 'leerkracht' && concept.school) ? concept.school.id : null
    }).then(function (r) {
      zetBezig(knop, false);
      if (r.fout) {
        if (isVerlopen(r.fout)) { sluitAf({ soort: 'verlopen' }); return false; }
        if (isOngeldig(r.fout)) {
          s.fout.textContent = T.naam.foutOngeldig;
          return false;
        }
        s.fout.textContent = r.fout.code ? T.algemeen.fout : T.algemeen.geenVerbinding;
        return false;
      }
      profiel = profiel || schoonProfiel({});
      profiel.ingevuld = true;
      profiel.voornaam = concept.voornaam;
      profiel.achternaam = concept.achternaam;
      profiel.rol = concept.rol;
      profiel.aanspreking = concept.rol === 'leerkracht' ? concept.aanspreking : null;
      if (concept.rol === 'leerkracht' && concept.school) {
        profiel.school_id = concept.school.id;
        profiel.school_naam = concept.school.naam;
        profiel.school_toestemming = !!concept.school.toestemming;
      } else if (concept.rol !== 'leerkracht') {
        profiel.school_id = null;
        profiel.school_naam = null;
        profiel.school_toestemming = false;
      }
      naarThema();
      return true;
    });
  }

  function doeRol(rol) {
    var s = schermen.rol;
    if (s.student.disabled || s.leerkracht.disabled) return;
    s.fout.textContent = '';
    if (rol === 'leerkracht') {
      concept.rol = 'leerkracht';
      toon('aanspreking');
      return;
    }
    concept.rol = 'student';
    concept.aanspreking = null;
    concept.school = null;
    s.leerkracht.disabled = true;
    bewaarProfiel(s, s.student).then(function (ok) {
      s.leerkracht.disabled = false;
      // Een student gaat verder met de gewone goedkeuring (wachtkamer).
      if (ok) sluitAf({ soort: 'verder' });
    });
  }

  function doeAanspreking(k) {
    var s = schermen.aanspreking;
    var knoppen = Object.keys(s.knoppen).map(function (n) { return s.knoppen[n]; });
    if (knoppen.some(function (b) { return b.disabled; })) return;
    concept.rol = 'leerkracht';
    concept.aanspreking = k;
    s.fout.textContent = '';
    // Iedere leerkracht kiest een school, ook wie al toegang heeft.
    toon('school');
  }

  // ---------- school zoeken ----------

  function zetLeeg(s, tekst) {
    while (s.lijst.firstChild) s.lijst.removeChild(s.lijst.firstChild);
    s.opties = [];
    s.resultaten = [];
    s.actief = -1;
    s.zoek.input.removeAttribute('aria-activedescendant');
    s.leeg.textContent = tekst;
    s.lijst.appendChild(s.leeg);
  }

  function zetActief(s, i, scroll) {
    s.actief = i;
    s.opties.forEach(function (o, n) { o.classList.toggle('is-actief', n === i); });
    if (i >= 0 && s.opties[i]) {
      s.zoek.input.setAttribute('aria-activedescendant', s.opties[i].id);
      if (scroll) veilig(function () { s.opties[i].scrollIntoView({ block: 'nearest' }); }, null);
    } else {
      s.zoek.input.removeAttribute('aria-activedescendant');
    }
  }

  function kiesSchool(s, i) {
    var school = s.resultaten[i];
    if (!school) return;
    concept.school = school;
    s.opties.forEach(function (o, n) { o.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
    zetActief(s, i, false);
    s.zoek.input.value = school.naam;
    s.fout.textContent = '';
    veilig(function () { s.knop.focus({ preventScroll: true }); }, null);
  }

  function toonScholen(s, lijst) {
    while (s.lijst.firstChild) s.lijst.removeChild(s.lijst.firstChild);
    s.opties = [];
    s.resultaten = lijst;
    s.actief = -1;
    lijst.forEach(function (school, i) {
      var li = el('li', 'bm-welkom__optie');
      li.id = s.lijstId + '-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.appendChild(el('span', 'bm-welkom__optie-naam', school.naam));
      var plaats = [school.gemeente, school.provincie].filter(function (x) { return !!x; }).join(', ');
      if (plaats) li.appendChild(el('span', 'bm-welkom__optie-plaats', plaats));
      if (school.toestemming) {
        li.classList.add('bm-welkom__optie--ok');
        li.appendChild(el('span', 'bm-welkom__optie-ok', T.school.goedgekeurd));
      }
      li.addEventListener('click', function () { kiesSchool(s, i); });
      s.lijst.appendChild(li);
      s.opties.push(li);
    });
    s.lijst.scrollTop = 0;
    zetActief(s, lijst.length ? 0 : -1, false);
  }

  function planZoek(s) {
    clearTimeout(zoekTimer);
    var term = s.zoek.input.value.trim();
    zoekNr += 1;
    if (term.length < 2) {
      zetLeeg(s, T.school.begin);
      return;
    }
    var nr = zoekNr;
    zoekTimer = setTimeout(function () {
      zoekTimer = 0;
      if (!s.opties.length) s.leeg.textContent = T.school.zoeken;
      vraag('zoek_scholen', { p_zoekterm: term }).then(function (r) {
        // Alleen het antwoord op de laatste zoekopdracht telt.
        if (nr !== zoekNr || huidig !== 'school') return;
        if (r.fout) {
          if (isVerlopen(r.fout)) { sluitAf({ soort: 'verlopen' }); return; }
          zetLeeg(s, T.school.fout);
          return;
        }
        var lijst = (Array.isArray(r.data) ? r.data : []).filter(function (x) {
          return x && typeof x.id === 'string' && typeof x.naam === 'string';
        }).map(function (x) {
          return {
            id: x.id,
            naam: x.naam,
            gemeente: typeof x.gemeente === 'string' ? x.gemeente : '',
            provincie: typeof x.provincie === 'string' ? x.provincie : '',
            toestemming: x.toestemming === true
          };
        });
        if (!lijst.length) { zetLeeg(s, T.school.niets); return; }
        toonScholen(s, lijst);
      });
    }, ZOEK_WACHT);
  }

  function heeftAlToegang() {
    return !!(ctx && ctx.status === 'toegang');
  }

  function doeSchool(s) {
    if (!concept.school) { s.fout.textContent = T.school.foutKies; return; }
    var school = concept.school;
    bewaarProfiel(s, s.knop).then(function (ok) {
      if (!ok) return;
      // Wie al toegang heeft, heeft geen sleutel nodig: meteen verder.
      if (heeftAlToegang()) { sluitAf({ soort: 'verder' }); return; }
      toon(school.toestemming ? 'sleutel' : 'geen');
    });
  }

  function doeGeenSchool(s, b) {
    concept.school = null;
    bewaarProfiel(s, b).then(function (ok) {
      if (!ok) return;
      if (heeftAlToegang()) { sluitAf({ soort: 'verder' }); return; }
      toon('geen');
    });
  }

  // ---------- sleutel ----------

  function sleutelSchoon(v) {
    return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  }

  function doeSleutel(s) {
    var code = sleutelSchoon(s.veld.input.value);
    if (!SLEUTEL_RE.test(code)) { s.fout.textContent = T.sleutel.foutVorm; return; }
    if (!concept.school) { toon('school'); return; }
    s.fout.textContent = '';
    zetBezig(s.knop, true);
    // De sleutel gaat alleen naar de server en wordt hier nergens bewaard.
    vraag('gebruik_sleutel', { p_school_id: concept.school.id, p_sleutel: code }).then(function (r) {
      zetBezig(s.knop, false);
      if (r.fout) {
        if (isVerlopen(r.fout)) { sluitAf({ soort: 'verlopen' }); return; }
        s.fout.textContent = r.fout.code ? T.algemeen.fout : T.algemeen.geenVerbinding;
        return;
      }
      var d = r.data || {};
      if (d.ok === true) {
        s.veld.input.value = '';
        if (profiel) profiel.rol = 'leerkracht';
        naarThema();
        // De server heeft toegang gegeven; js/auth.js vraagt de status opnieuw op.
        sluitAf({ soort: 'opnieuw' });
        return;
      }
      if (d.fout === 'geen_toestemming') { toon('geen'); return; }
      if (d.fout === 'te_veel') {
        var min = Math.max(1, Math.ceil((Number(d.wacht) || 60) / 60));
        s.fout.textContent = min === 1 ? T.sleutel.teVeel1 : vul(T.sleutel.teVeel, { minuten: min });
        return;
      }
      if (d.fout === 'fout') {
        var over = typeof d.over === 'number' ? d.over : -1;
        if (over === 0) s.fout.textContent = T.sleutel.foutLaatste;
        else if (over === 1) s.fout.textContent = T.sleutel.foutOver1;
        else if (over > 1) s.fout.textContent = vul(T.sleutel.foutOver, { aantal: over });
        else s.fout.textContent = T.sleutel.fout;
        veilig(function () { s.veld.input.select(); }, null);
        return;
      }
      s.fout.textContent = T.algemeen.fout;
    });
  }

  // ---------- ingang vanuit js/auth.js: voor de toegang ----------

  // c = {client, user, status, kaart, verbergSchermen(), uitloggen()}.
  // Geeft een belofte met {soort: 'verder'} (ga door met de status), {soort: 'opnieuw'} (vraag de
  // status opnieuw op, er is een sleutel gebruikt) of {soort: 'verlopen'} (opnieuw inloggen).
  function voorToegang(c) {
    ctx = c;
    return vraag('mijn_profiel').then(function (r) {
      if (r.fout || !r.data) {
        if (isVerlopen(r.fout)) return { soort: 'verlopen' };
        // De database kent de welkomstflow (nog) niet, of er is geen verbinding: gewoon doorgaan.
        beschikbaar = false;
        profiel = null;
        return { soort: 'verder' };
      }
      beschikbaar = true;
      profiel = schoonProfiel(r.data);
      if (profiel && profiel.ingevuld) {
        naarThema();
        return { soort: 'verder' };
      }
      concept.voornaam = (profiel && profiel.voornaam) || '';
      concept.achternaam = (profiel && profiel.achternaam) || '';
      concept.rol = null;
      concept.aanspreking = null;
      concept.school = null;
      vanafWacht = false;
      return new Promise(function (resolve) {
        losMaken = resolve;
        toon('naam');
      });
    });
  }

  // True als de wachtkamer de link "Ik heb een sleutel" mag tonen.
  function kanSleutel() {
    return !!(beschikbaar && profiel && profiel.ingevuld && profiel.rol === 'leerkracht');
  }

  // Vanuit de wachtkamer: school kiezen en sleutel invullen. Zelfde antwoord als voorToegang.
  function sleutelVanafWacht(c) {
    if (!kanSleutel()) return Promise.resolve({ soort: 'verder' });
    ctx = c;
    concept.voornaam = profiel.voornaam;
    concept.achternaam = profiel.achternaam;
    concept.rol = 'leerkracht';
    concept.aanspreking = profiel.aanspreking || 'geen';
    // De school die al gekozen was, onthouden: dan hoeft hij niet opnieuw gezocht te worden.
    concept.school = profiel.school_id
      ? { id: profiel.school_id, naam: profiel.school_naam || '', toestemming: !!profiel.school_toestemming }
      : null;
    return new Promise(function (resolve) {
      losMaken = resolve;
      vanafWacht = true;
      bouw();
      var s = schermen.school;
      s.zoek.input.value = '';
      zetLeeg(s, T.school.begin);
      if (concept.school) toon(concept.school.toestemming ? 'sleutel' : 'geen');
      else toon('school');
    });
  }

  // Naam voor de aanvraag die Berie in zijn mail ziet (hooguit 80 tekens), of '' als er geen profiel is.
  function aanvraagNaam() {
    if (!profiel || !profiel.ingevuld) return '';
    var naam = volleNaam(profiel);
    var extra = profiel.rol === 'leerkracht'
      ? ' (leerkracht' + (profiel.school_naam ? ', ' + profiel.school_naam : '') + ')'
      : ' (student)';
    return (naam + extra).slice(0, 80);
  }

  // ---------- begroeting en uitleg: na de toegang ----------

  function begroetTekst() {
    if (!profiel || !profiel.ingevuld) return '';
    if (profiel.rol === 'leerkracht') {
      var aanspr = (profiel.aanspreking === 'mevrouw' || profiel.aanspreking === 'meneer')
        ? T.begroeting[profiel.aanspreking] + ' ' + profiel.achternaam
        : volleNaam(profiel);
      return vul(T.begroeting.leerkracht, { naam: aanspr });
    }
    return vul(T.begroeting.student, { naam: profiel.voornaam });
  }

  // Zet een vlag op de server; mislukt het, dan komt het scherm een volgende keer terug.
  function meld(naam) {
    vraag(naam).then(function (r) {
      if (r.fout) veilig(function () { console.warn('[BM.welkom] ' + naam + ' mislukt', r.fout); }, null);
    });
  }

  // Grote tekst over het hele scherm, een scherm per klik. Daarna klaar().
  function toonBegroeting(regels, klaar) {
    if (begroetLaag || !document.body || !regels.length) { klaar(); return; }
    var laag = el('div', 'bm-begroet');
    laag.setAttribute('role', 'dialog');
    laag.setAttribute('aria-modal', 'true');
    laag.tabIndex = -1;
    var inhoud = el('div', 'bm-begroet__inhoud');
    // Schermlezers lezen elke nieuwe tekst voor; de dialoog heet zoals de grote titel.
    inhoud.setAttribute('aria-live', 'polite');
    var titel = el('h1', 'bm-begroet__titel');
    titel.id = 'bm-begroet-titel';
    laag.setAttribute('aria-labelledby', titel.id);
    var verder = el('p', 'bm-begroet__verder');
    inhoud.appendChild(titel);
    inhoud.appendChild(verder);
    laag.appendChild(inhoud);
    begroetLaag = laag;

    var i = -1;
    var bezig = false;
    var wissel = minderBeweging() ? 0 : 240;

    function zet() {
      var r = regels[i];
      titel.textContent = r.titel;
      verder.textContent = r.verder;
      laag.setAttribute('data-soort', r.soort);
      if (typeof r.getoond === 'function') veilig(r.getoond, null);
    }

    function sluit() {
      window.removeEventListener('keydown', onToets, true);
      laag.classList.remove('is-zichtbaar');
      laag.classList.add('is-weg');
      setTimeout(function () {
        if (laag.parentNode) laag.parentNode.removeChild(laag);
        if (begroetLaag === laag) begroetLaag = null;
        klaar();
      }, minderBeweging() ? 0 : 320);
    }

    function volgende() {
      if (bezig) return;
      if (i >= regels.length - 1) { bezig = true; sluit(); return; }
      bezig = true;
      inhoud.classList.add('is-wissel');
      setTimeout(function () {
        i += 1;
        zet();
        inhoud.classList.remove('is-wissel');
        bezig = false;
      }, wissel);
    }

    function onToets(e) {
      // De toetsen gaan niet naar de app of een dialoog eronder.
      e.stopPropagation();
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowRight' || e.key === 'Escape') {
        e.preventDefault();
        volgende();
      } else if (e.key === 'Tab') {
        e.preventDefault();
      }
    }

    laag.addEventListener('click', volgende);
    window.addEventListener('keydown', onToets, true);
    i = 0;
    zet();
    document.body.appendChild(laag);
    // Een tel later, zodat de CSS de overgang oppakt (een timer loopt ook in een tabblad op de achtergrond).
    setTimeout(function () {
      laag.classList.add('is-zichtbaar');
      veilig(function () { laag.focus({ preventScroll: true }); }, null);
    }, 30);
  }

  // Start de uitleg. auto = de eerste keer: daarna onthoudt de server dat hij gezien is.
  function startUitleg(auto) {
    if (!BM.uitleg || typeof BM.uitleg.start !== 'function' || !Array.isArray(BM.uitlegStappen)) {
      if (auto) meld('zet_uitleg_gezien');
      return false;
    }
    return BM.uitleg.start(BM.uitlegStappen, {
      klaar: function (reden) {
        // Overgeslagen midden in de uitleg: geen pop-up of notitiepaneel laten openstaan.
        if (reden === 'overgeslagen' && BM.uitleg.acties && typeof BM.uitleg.acties.sluitAlles === 'function') {
          veilig(BM.uitleg.acties.sluitAlles, null);
        }
        if (!auto || reden === 'gestopt') return;
        if (profiel) profiel.uitleg_gezien = true;
        meld('zet_uitleg_gezien');
      }
    });
  }

  function uitlegAlsKlaar() {
    if (!uitlegWacht || !appKlaar) return;
    uitlegWacht = false;
    // Even wachten tot de mindmap rustig in beeld staat.
    setTimeout(function () { startUitleg(true); }, minderBeweging() ? 0 : 450);
  }

  // js/auth.js roept dit aan zodra iemand binnen is, vlak voor de mindmap laadt.
  function naToegang() {
    if (!beschikbaar || !profiel) return;
    var regels = [];
    // Stappenplan staat voorlopig uit (11-11): wordt eerst mooier gemaakt.
    var eersteKeer = !profiel.uitleg_gezien;
    var metUitleg = BM.UITLEG_AAN === true && eersteKeer;
    if (profiel.bekend && !profiel.bekend_gezien) {
      regels.push({
        soort: 'bekend',
        titel: T.bekend.titel,
        verder: T.bekend.verder,
        getoond: function () {
          profiel.bekend_gezien = true;
          meld('zet_bekend_gezien');
        }
      });
    }
    var hallo = begroetTekst();
    if (eersteKeer && hallo) {
      regels.push({ soort: 'hallo', titel: hallo, verder: T.begroeting.verder });
    }
    if (!regels.length && !metUitleg) return;
    toonBegroeting(regels, function () {
      if (!metUitleg) {
        // Begroeting gezien: niet bij elke login opnieuw.
        if (eersteKeer) { profiel.uitleg_gezien = true; meld('zet_uitleg_gezien'); }
        return;
      }
      uitlegWacht = true;
      uitlegAlsKlaar();
    });
  }

  // Knop "Uitleg opnieuw bekijken" in het accountmenu.
  function uitlegOpnieuw() {
    return startUitleg(false);
  }

  if (BM.bus && typeof BM.bus.on === 'function') {
    BM.bus.on('cloud:gestart', function () {
      appKlaar = true;
      uitlegAlsKlaar();
    });
  }

  BM.welkom = {
    voorToegang: voorToegang,
    naToegang: naToegang,
    kanSleutel: kanSleutel,
    sleutelVanafWacht: sleutelVanafWacht,
    aanvraagNaam: aanvraagNaam,
    uitlegOpnieuw: uitlegOpnieuw,
    profiel: function () { return profiel ? JSON.parse(JSON.stringify(profiel)) : null; }
  };
})();
