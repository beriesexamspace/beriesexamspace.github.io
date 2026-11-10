// Beslispagina: Berat opent deze via de link in de aanvraagmail.
// De gegevens (id, token, ja/nee) staan achter # in de link en gaan alleen naar de functie beslis.
// Openen alleen verandert niets; pas de klik op de knop voert de beslissing uit.
//
// Beheer-blok (onder de kaart): "Berie kent jou" en school-toestemming. Die werken alleen
// met een ingelogde beheerder (public.beheerders, bevestigde code). De sessie komt uit dezelfde
// browseropslag als de mindmap (storageKey 'bm-auth'), dus eerst inloggen op de mindmap.
(function () {
  'use strict';

  var titel = document.getElementById('titel');
  var uitleg = document.getElementById('uitleg');
  var knop = document.getElementById('knop');

  var beheerStatus = document.getElementById('beheer-status');
  var beheerInloggen = document.getElementById('beheer-inloggen');
  var beheerWerk = document.getElementById('beheer-werk');
  var bekendMail = document.getElementById('bekend-mail');
  var bekendSchakel = document.getElementById('bekend-schakel');
  var schoolZoek = document.getElementById('school-zoek');
  var schoolInfo = document.getElementById('school-info');
  var schoolLijst = document.getElementById('school-lijst');
  var melding = document.getElementById('beheer-melding');

  function toon(kop, tekst) {
    titel.textContent = kop;
    uitleg.textContent = tekst || '';
  }

  function ongeldig() {
    knop.hidden = true;
    toon('Deze link is niet (meer) geldig.', 'Deze aanvraag is misschien al behandeld.');
  }

  function fout() {
    knop.hidden = true;
    toon('Er ging iets mis.', 'Probeer de link later opnieuw.');
  }

  var cfg = (window.BM && window.BM.config) || {};

  // ---------------------------------------------------------------
  // Beheer: Supabase-sessie, bekend-schakelaar en school-toestemming
  // ---------------------------------------------------------------

  var client = null;
  var zoekTimer = null;
  var zoekNr = 0;

  function zetMelding(tekst, soort) {
    melding.textContent = tekst || '';
    melding.className = 'bm-beheer__melding' + (soort === 'ok' ? ' is-ok' : (soort === 'fout' ? ' is-fout' : ''));
  }

  function zetStatus(tekst) {
    beheerStatus.textContent = tekst || '';
  }

  function geldigMail(m) {
    return m.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m);
  }

  function zetSchakel(el, aan) {
    el.setAttribute('aria-checked', aan ? 'true' : 'false');
  }

  function foutTekst(err) {
    var bericht = (err && err.message) || '';
    if ((err && err.code === '42501') || /geen_beheerder|niet_geverifieerd/.test(bericht)) {
      return 'Je bent niet (meer) ingelogd als beheerder. Log opnieuw in op de mindmap.';
    }
    return 'Dat lukt nu niet. Probeer het later opnieuw.';
  }

  // Maakt de Supabase-client één keer. Geeft null als de database of de bibliotheek ontbreekt.
  function maakClient() {
    if (client) return client;
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return null;
    if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
    try {
      client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: 'bm-auth',
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      });
    } catch (e) {
      client = null;
    }
    return client;
  }

  // Altijd {data, error}, ook bij een netwerkfout (dan is error gevuld)
  function rpc(naam, args) {
    return Promise.resolve(client.rpc(naam, args)).then(function (r) {
      return r || { data: null, error: { message: 'leeg' } };
    }, function (e) {
      return { data: null, error: { message: String(e && e.message ? e.message : e) } };
    });
  }

  function toonInloggen() {
    beheerInloggen.hidden = false;
  }

  function beheerKlaar() {
    zetStatus('Ingelogd als beheerder.');
    beheerInloggen.hidden = true;
    beheerWerk.hidden = false;
    bekendSchakel.disabled = false;
  }

  function initBeheer() {
    if (!maakClient()) {
      zetStatus('Beheer is nu niet beschikbaar. De pagina kan geen verbinding maken met de database.');
      return;
    }
    client.auth.getSession().then(function (res) {
      var sessie = res && res.data ? res.data.session : null;
      if (!sessie) {
        zetStatus('Je bent niet ingelogd. Log in op de mindmap als beheerder en kom daarna terug naar deze pagina.');
        toonInloggen();
        return null;
      }
      return rpc('is_beheerder').then(function (r) {
        if (r.error || r.data !== true) {
          zetStatus('Dit account is geen beheerder, of de code is nog niet bevestigd. Log in op de mindmap en vul de code in.');
          toonInloggen();
          return;
        }
        beheerKlaar();
      });
    }).catch(function () {
      zetStatus('Kan de beheerdata nu niet laden. Probeer het later opnieuw.');
    });
  }

  // Na een aanvraag: het mailadres van die persoon alvast invullen
  function vulMail(m) {
    if (!bekendMail) return;
    bekendMail.value = m || '';
    zetSchakel(bekendSchakel, false);
    zetMelding('', '');
  }

  // Een ander mailadres: de schakelaar is dan niet bekend, dus weer uit
  bekendMail.addEventListener('input', function () {
    zetSchakel(bekendSchakel, false);
    zetMelding('', '');
  });

  bekendSchakel.addEventListener('click', function () {
    if (bekendSchakel.disabled || !client) return;
    var mail = bekendMail.value.trim().toLowerCase();
    if (!geldigMail(mail)) {
      zetMelding('Vul eerst een geldig mailadres in.', 'fout');
      bekendMail.focus();
      return;
    }
    var aan = bekendSchakel.getAttribute('aria-checked') !== 'true';
    bekendSchakel.disabled = true;
    rpc('zet_bekend', { p_email: mail, p_aan: aan }).then(function (r) {
      bekendSchakel.disabled = false;
      if (r.error) {
        zetMelding(foutTekst(r.error), 'fout');
        return;
      }
      var d = r.data || {};
      if (!d.ok) {
        zetMelding(d.fout === 'onbekend_account' ? 'Er is geen account met dit mailadres.' : 'Dat lukt nu niet. Probeer het later opnieuw.', 'fout');
        return;
      }
      var staatAan = d.bekend === true;
      zetSchakel(bekendSchakel, staatAan);
      zetMelding(staatAan
        ? mail + ' staat nu op "Berie kent jou". Die persoon ziet de begroeting bij de volgende keer binnenkomen.'
        : mail + ' staat niet meer op "Berie kent jou".', 'ok');
    });
  });

  function maakSchoolRij(s) {
    var li = document.createElement('li');
    li.className = 'bm-beheer__optie';

    var tekst = document.createElement('div');
    tekst.className = 'bm-beheer__optie-tekst';

    var naam = document.createElement('span');
    naam.className = 'bm-beheer__optie-naam';
    naam.textContent = s.naam || s.id;

    var plaats = document.createElement('span');
    plaats.className = 'bm-beheer__optie-plaats';
    plaats.textContent = [s.gemeente, s.provincie].filter(Boolean).join(', ');

    tekst.appendChild(naam);
    tekst.appendChild(plaats);

    var schakel = document.createElement('button');
    schakel.type = 'button';
    schakel.className = 'bm-schakel';
    schakel.setAttribute('role', 'switch');
    schakel.setAttribute('aria-label', 'Toestemming voor ' + (s.naam || s.id));
    zetSchakel(schakel, s.toestemming === true);

    schakel.addEventListener('click', function () {
      schoolKlik(s, schakel);
    });

    li.appendChild(tekst);
    li.appendChild(schakel);
    return li;
  }

  function toonScholen(lijst) {
    while (schoolLijst.firstChild) schoolLijst.removeChild(schoolLijst.firstChild);
    if (!lijst.length) {
      schoolInfo.textContent = 'Geen scholen gevonden.';
      return;
    }
    schoolInfo.textContent = lijst.length === 1 ? '1 school gevonden.' : lijst.length + ' scholen gevonden.';
    for (var i = 0; i < lijst.length; i++) {
      schoolLijst.appendChild(maakSchoolRij(lijst[i]));
    }
  }

  function schoolKlik(s, schakel) {
    if (schakel.disabled || !client) return;
    var aan = schakel.getAttribute('aria-checked') !== 'true';
    schakel.disabled = true;
    rpc('zet_school_toestemming', { p_school_id: s.id, p_aan: aan }).then(function (r) {
      schakel.disabled = false;
      if (r.error) {
        zetMelding(foutTekst(r.error), 'fout');
        return;
      }
      var d = r.data || {};
      if (!d.ok) {
        zetMelding(d.fout === 'onbekende_school' ? 'Deze school bestaat niet (meer).' : 'Dat lukt nu niet. Probeer het later opnieuw.', 'fout');
        return;
      }
      var staatAan = d.toestemming === true;
      s.toestemming = staatAan;
      zetSchakel(schakel, staatAan);
      zetMelding(staatAan
        ? (s.naam || s.id) + ' heeft nu toestemming.'
        : 'Toestemming voor ' + (s.naam || s.id) + ' is ingetrokken.', 'ok');
    });
  }

  function zoekScholen() {
    var term = schoolZoek.value.trim();
    var nr = ++zoekNr;
    if (!client) return;
    if (term.length < 2) {
      while (schoolLijst.firstChild) schoolLijst.removeChild(schoolLijst.firstChild);
      schoolInfo.textContent = 'Typ minstens 2 tekens.';
      return;
    }
    schoolInfo.textContent = 'Zoeken...';
    rpc('zoek_scholen', { p_zoekterm: term }).then(function (r) {
      if (nr !== zoekNr) return; // een nieuwere zoekopdracht is al onderweg
      if (r.error) {
        while (schoolLijst.firstChild) schoolLijst.removeChild(schoolLijst.firstChild);
        schoolInfo.textContent = foutTekst(r.error);
        return;
      }
      toonScholen(Array.isArray(r.data) ? r.data : []);
    });
  }

  schoolZoek.addEventListener('input', function () {
    clearTimeout(zoekTimer);
    zoekTimer = setTimeout(zoekScholen, 300);
  });

  // Eerst het beheer-blok klaarzetten: dat werkt ook als de link ongeldig is
  initBeheer();

  // ---------------------------------------------------------------
  // Aanvraag: goedkeuren of afwijzen via de link uit de mail
  // ---------------------------------------------------------------

  var params = new URLSearchParams(location.hash.slice(1));
  var id = params.get('id') || '';
  var t = params.get('t') || '';
  var a = params.get('a') || '';

  // Gegevens uit de adresbalk halen, zodat ze niet in de geschiedenis blijven staan
  try { history.replaceState(null, '', location.pathname); } catch (e) { /* niet erg */ }

  if (!cfg.supabaseUrl || !id || !t || (a !== 'ja' && a !== 'nee')) {
    ongeldig();
    return;
  }

  var url = cfg.supabaseUrl.replace(/\/$/, '') + '/functions/v1/beslis';

  function vraag(doe) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, t: t, a: a, doe: doe }),
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    }).then(function (res) {
      return res.json().catch(function () { return { ok: false, fout: 'serverfout' }; });
    });
  }

  vraag(false).then(function (r) {
    if (!r || !r.ok) {
      if (r && r.fout === 'ongeldige_link') ongeldig(); else fout();
      return;
    }
    if (a === 'ja') {
      toon('Toegang geven aan ' + r.email + '?', 'Naam: ' + r.naam);
      knop.textContent = 'Ja, geef toegang';
      knop.className = 'knop';
    } else {
      toon('Aanvraag afwijzen?', 'Aanvraag van ' + r.email + ' (' + r.naam + ')');
      knop.textContent = 'Ja, wijs af';
      knop.className = 'knop nee';
    }
    knop.hidden = false;
    vulMail(r.email);
  }).catch(fout);

  knop.addEventListener('click', function () {
    knop.disabled = true;
    knop.textContent = 'Bezig...';
    vraag(true).then(function (r) {
      if (!r || !r.ok) {
        if (r && r.fout === 'ongeldige_link') ongeldig(); else fout();
        return;
      }
      knop.hidden = true;
      if (r.besluit === 'ja') {
        toon('Gedaan.', 'Toegang gegeven aan ' + r.email + '. ' + (r.mail
          ? 'De aanvrager heeft een mail gekregen.'
          : 'De mail kon niet worden verstuurd. Stuur de aanvrager de link naar de app zelf.'));
      } else {
        toon('Gedaan.', 'De aanvraag van ' + r.email + ' is afgewezen. De aanvrager krijgt geen mail.');
      }
      vulMail(r.email);
    }).catch(fout);
  });
})();
