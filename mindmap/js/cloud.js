(function () {
  'use strict';
  var BM = window.BM = window.BM || {};

  // Cloud-opslag van de mindmap per account (Supabase).
  // Bij laden is de cloud leidend: de lokale kopie is alleen een cache.
  // Wijzigingen worden gebundeld (1500 ms) en via de RPC bewaar_mindmap opgeslagen.
  // Er loopt nooit meer dan een opslagactie tegelijk. Bij een conflict stopt het
  // opslaan en wordt de gebruiker gewaarschuwd; niets wordt stil overschreven.
  // Wijzigingen die nog niet in de cloud staan krijgen de vlag "-niet-gepusht" in
  // localStorage. Zolang die vlag staat, wordt de lokale kopie nooit stil overschreven.

  var BASIS_KEY = 'berie-mindmap-v1';            // de sleutel zonder account (voor "meenemen")
  var VLAG_ACHTERVOEGSEL = '-niet-gepusht';      // vlag: er staan wijzigingen die nog niet in de cloud zijn
  var DEBOUNCE_MS = 1500;
  var TIMEOUT_MS = 20000;                         // een verzoek langer dan dit telt als netwerkfout
  var OPSLAAN_WACHT_MS = [5000, 15000, 30000];    // herhaalpogingen; daarna blijft het 30 s
  var LAAD_WACHT_MS = [5000, 15000, 30000];

  var client = null;
  var userKey = '';
  var userEmail = '';
  var versie = 0;
  var begonnen = false;
  var gestopt = false;
  var nieuwAccount = false;
  var conflict = false;          // de cloud heeft een nieuwere versie: niet meer opslaan
  var sessieVerlopen = false;    // sessie niet (meer) geverifieerd: niet meer opslaan
  var blokkade = false;          // lokale opslag werkt niet: niets naar de cloud sturen
  var dirty = false;             // er zijn wijzigingen die nog niet bevestigd zijn opgeslagen
  var pushing = false;           // er loopt nu een verzoek naar de cloud
  var pushPromise = null;
  var mislukt = false;           // de laatste opslagpoging is niet gelukt
  var opnieuwGepland = false;    // er staat een herhaalpoging klaar
  var herhaalIdx = 0;
  var laatsteVerzonden = null;   // canonieke tekst van de laatst verzonden snapshot
  var timer = 0;
  var laadTimer = 0;
  var laadMelding = null;        // melding "Kan je mindmap nu niet laden"
  var laadBalk = null;           // {el, tekst} statusregel tijdens het laden
  var offs = [];                 // uitschrijf-functies voor BM.bus
  var vensterListeners = [];     // {doel, type, fn} voor window/document
  var ui = null;                 // {wrap, knop, menu, status}

  // ---------- hulpfuncties ----------

  function warn(msg, err) {
    try { console.warn('[BM.cloud] ' + msg, err || ''); } catch (e) { /* console kan ontbreken */ }
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function toast(text, opts) {
    try {
      if (typeof BM.toast === 'function') return BM.toast(text, opts);
    } catch (e) { warn('melding tonen mislukt', e); }
    return null;
  }

  function herlaad() {
    try { window.location.reload(); } catch (e) { /* negeren */ }
  }

  function uitlogSafe() {
    try {
      if (BM.auth && typeof BM.auth.uitloggen === 'function') BM.auth.uitloggen();
    } catch (e) { warn('uitloggen mislukt', e); }
  }

  function setTimer(fn, wacht) {
    clearTimer();
    timer = setTimeout(function () {
      timer = 0;
      fn();
    }, wacht);
  }

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = 0;
    }
  }

  function voegVensterToe(doel, type, fn) {
    doel.addEventListener(type, fn);
    vensterListeners.push({ doel: doel, type: type, fn: fn });
  }

  // Een verzoek dat na TIMEOUT_MS nog niet klaar is, telt als netwerkfout.
  function metTimeout(p) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error('timeout')); }, TIMEOUT_MS);
      Promise.resolve(p).then(function (v) {
        clearTimeout(t);
        resolve(v);
      }, function (e) {
        clearTimeout(t);
        reject(e);
      });
    });
  }

  // Doet een RPC-aanroep. Geeft altijd {fout, data} terug, en gooit nooit.
  function vraag(naam, args) {
    var p;
    try {
      p = (args === undefined) ? client.rpc(naam) : client.rpc(naam, args);
    } catch (e) {
      return Promise.resolve({ fout: e, data: null });
    }
    return metTimeout(p).then(function (res) {
      return { fout: (res && res.error) ? res.error : null, data: res ? res.data : null };
    }, function (err) {
      return { fout: err || new Error('netwerk'), data: null };
    });
  }

  function tekstVan(err) {
    if (!err) return '';
    return String(err.message || err.msg || err);
  }

  function isNietGeverifieerd(err) {
    return !!err && (err.code === '42501' || /niet_geverifieerd/.test(tekstVan(err)));
  }

  // Fouten die een herhaling niet oplossen (ongeldige of te grote data).
  function isBlijvendeFout(err) {
    return !!err && (err.code === '22023' || err.code === '23514' || /ongeldige_data/.test(tekstVan(err)));
  }

  function isStale() {
    try { return !!(BM.store.isStale && BM.store.isStale()); } catch (e) { return false; }
  }

  function isReadOnly() {
    try { return !!(BM.store.isReadOnly && BM.store.isReadOnly()); } catch (e) { return false; }
  }

  // Lokale opslag: schrijven en meteen terug lezen. Geeft false als dat niet lukt.
  function schrijfLokaal(key, tekst) {
    try {
      window.localStorage.setItem(key, tekst);
      return window.localStorage.getItem(key) === tekst;
    } catch (e) {
      return false;
    }
  }

  // Een mindmap uit localStorage als object, alleen als die projecten bevat. Anders null.
  function leesLokaal(key) {
    try {
      var t = window.localStorage.getItem(key);
      if (!t) return null;
      var d = JSON.parse(t);
      if (d && d.projects && typeof d.projects === 'object' && Object.keys(d.projects).length) return d;
    } catch (e) { /* ongeldig of geblokkeerd: negeren */ }
    return null;
  }

  // Canonieke tekst: sleutels gesorteerd, zodat twee gelijke mindmaps dezelfde tekst geven.
  function canon(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
    return '{' + Object.keys(v).sort().map(function (k) {
      return JSON.stringify(k) + ':' + canon(v[k]);
    }).join(',') + '}';
  }

  // Vlag "niet gepusht" voor deze gebruiker. Zonder gebruikerssleutel is er geen vlag.
  function isVlag() {
    if (!userKey) return false;
    try { return window.localStorage.getItem(userKey + VLAG_ACHTERVOEGSEL) === '1'; } catch (e) { return false; }
  }

  function zetVlag(aan) {
    if (!userKey) return;
    try {
      if (aan) window.localStorage.setItem(userKey + VLAG_ACHTERVOEGSEL, '1');
      else window.localStorage.removeItem(userKey + VLAG_ACHTERVOEGSEL);
    } catch (e) {
      warn('vlag opslaan mislukt', e);
    }
  }

  // De mindmap van deze computer (zonder account), alleen als die projecten bevat.
  function leesOudeLokaal() {
    try {
      var t = window.localStorage.getItem(BASIS_KEY);
      if (!t) return null;
      var d = JSON.parse(t);
      if (d && d.projects && typeof d.projects === 'object' && Object.keys(d.projects).length) return t;
    } catch (e) { /* ongeldig: negeren */ }
    return null;
  }

  // ---------- status in het accountmenu ----------

  function zetStatus() {
    if (!ui) return;
    var tekst;
    var soort;
    if (mislukt) {
      soort = 'fout';
      tekst = opnieuwGepland ? 'Niet opgeslagen, opnieuw proberen...' : 'Niet opgeslagen';
    } else if (dirty || pushing) {
      soort = 'bezig';
      tekst = 'Opslaan...';
    } else {
      soort = 'ok';
      tekst = 'Opgeslagen';
    }
    ui.status.textContent = tekst;
    ui.status.setAttribute('data-state', soort);
  }

  function zetMenu(open) {
    if (!ui) return;
    ui.menu.hidden = !open;
    ui.knop.setAttribute('aria-expanded', open ? 'true' : 'false');
    ui.knop.classList.toggle('bm-account--open', open);
  }

  function menuOpen() {
    return !!(ui && !ui.menu.hidden);
  }

  // ---------- statusregel tijdens het laden ----------

  // Kleine statusregel met Uitloggen, zodat de gebruiker ook zonder app uit kan.
  function toonLaadBalk() {
    if (laadBalk || !document.body) return;
    var kader = el('div', 'bm-laad');
    kader.setAttribute('role', 'status');
    var tekst = el('span', 'bm-laad__tekst', 'Je mindmap wordt geladen...');
    var uit = el('button', 'bm-knop bm-knop--tekst bm-laad__uit', 'Uitloggen');
    uit.type = 'button';
    uit.addEventListener('click', function () {
      // Met wijzigingen die nog niet in de cloud staan wordt er niet uitgelogd.
      if (isVlag()) {
        toast('Je wijzigingen staan nog op deze computer. Herlaad de pagina om ze te bewaren. Daarna kun je uitloggen.', {
          error: true,
          ms: 0,
          action: 'Herladen',
          onAction: herlaad
        });
        return;
      }
      uitlogSafe();
    });
    kader.appendChild(tekst);
    kader.appendChild(uit);
    document.body.appendChild(kader);
    laadBalk = { el: kader, tekst: tekst };
  }

  function zetLaadTekst(t) {
    if (laadBalk) laadBalk.tekst.textContent = t;
  }

  function verbergLaadBalk() {
    if (!laadBalk) return;
    if (laadBalk.el.parentNode) laadBalk.el.parentNode.removeChild(laadBalk.el);
    laadBalk = null;
  }

  // ---------- dialogen ----------

  // Algemene dialoog. knoppen: [{tekst, waarde, primair, sluit, esc, actie}].
  // Een knop met sluit sluit de dialoog en geeft zijn waarde terug. esc: de knop bij Escape.
  function toonDialoog(titel, tekst, knoppen) {
    return new Promise(function (resolve) {
      var overlay = el('div', 'bm-dialog');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'bm-dialog-titel');

      var kaart = el('div', 'bm-dialog__kaart');
      var kop = el('h2', 'bm-dialog__titel', titel);
      kop.id = 'bm-dialog-titel';
      var rij = el('div', 'bm-dialog__knoppen');
      var focus = null;
      var escKnop = null;

      function onKey(e) {
        if (e.key === 'Escape' && escKnop) {
          e.preventDefault();
          sluit(escKnop.waarde);
        }
      }

      function sluit(waarde) {
        document.removeEventListener('keydown', onKey, true);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        resolve(waarde);
      }

      knoppen.forEach(function (k) {
        var b = el('button', 'bm-knop' + (k.primair ? ' bm-knop--primair' : ''), k.tekst);
        b.type = 'button';
        if (k.esc) escKnop = k;
        if (k.primair) focus = b;
        b.addEventListener('click', function () {
          if (k.actie) k.actie();
          if (k.sluit) sluit(k.waarde);
        });
        rij.appendChild(b);
      });

      kaart.appendChild(kop);
      kaart.appendChild(el('p', 'bm-dialog__tekst', tekst));
      kaart.appendChild(rij);
      overlay.appendChild(kaart);
      document.addEventListener('keydown', onKey, true);
      document.body.appendChild(overlay);
      (focus || rij.firstChild).focus();
    });
  }

  // Dialog: niet gepushte wijzigingen op deze computer. true bij Meenemen, false bij Cloud gebruiken.
  function vraagLokaalOfCloud() {
    return toonDialoog('Niet opgeslagen wijzigingen',
      'Je hebt wijzigingen op deze computer die nog niet in je account staan. Wil je die meenemen, of de versie uit je account gebruiken?',
      [
        { tekst: 'Cloud gebruiken', waarde: false, sluit: true },
        { tekst: 'Meenemen', waarde: true, primair: true, sluit: true }
      ]);
  }

  // Dialog bij een conflict: de mindmap is op een ander apparaat gewijzigd.
  function toonConflictDialoog() {
    toonDialoog('Mindmap op een ander apparaat gewijzigd',
      'Je mindmap is op een ander apparaat gewijzigd. Je wijzigingen staan nog op deze computer. Exporteer ze als je ze wilt bewaren, en herlaad daarna om de nieuwste versie te zien.',
      [
        {
          tekst: 'Exporteren',
          sluit: false,
          actie: function () {
            if (BM.projects && typeof BM.projects.exportAll === 'function') BM.projects.exportAll();
          }
        },
        { tekst: 'Herladen', primair: true, sluit: true, actie: herlaad }
      ]);
  }

  // ---------- opslaan ----------

  // Stuurt de huidige mindmap naar de cloud. Nooit twee tegelijk.
  function push() {
    if (pushing) return pushPromise;
    clearTimer();
    if (gestopt || conflict || sessieVerlopen || blokkade || !client) return Promise.resolve(false);
    if (!dirty) return Promise.resolve(true);
    if (isStale() || isReadOnly()) {
      // Een ander tabblad of kapotte lokale data: niets naar de cloud sturen.
      mislukt = true;
      opnieuwGepland = false;
      zetStatus();
      return Promise.resolve(false);
    }

    // Eerst de lopende notitietekst naar het model, zodat die ook meegaat.
    try { if (BM.app && BM.app.saveNow) BM.app.saveNow(); } catch (e) { warn('notitie opslaan mislukt', e); }

    dirty = false;
    var snap;
    try {
      snap = BM.store.snapshot();
      laatsteVerzonden = canon(snap);
    } catch (e) {
      warn('snapshot maken mislukt', e);
      dirty = true;
      mislukt = true;
      opnieuwGepland = false;
      zetStatus();
      return Promise.resolve(false);
    }

    pushing = true;
    zetStatus();
    pushPromise = vraag('bewaar_mindmap', { p_data: snap, p_versie: versie }).then(verwerk);
    return pushPromise;
  }

  // Forceert een opslag (ook zonder wijzigingen) en wacht op een lopende opslag.
  function forceerPush() {
    dirty = true;
    return flush();
  }

  // Opslaan afmaken: wacht op een lopend verzoek en stuurt daarna wat er nog staat.
  function flush() {
    if (pushing && pushPromise) {
      return pushPromise.then(function () { return dirty ? push() : true; });
    }
    return dirty ? push() : Promise.resolve(true);
  }

  function verwerk(r) {
    pushing = false;
    if (r.fout) return verwerkFout(r.fout);
    var d = r.data;
    if (d && d.ok === true) {
      versie = Number(d.versie) || versie;
      mislukt = false;
      opnieuwGepland = false;
      herhaalIdx = 0;
      // Alles staat in de cloud: de vlag mag weg.
      if (!dirty) zetVlag(false);
      zetStatus();
      // Er kwamen wijzigingen binnen tijdens het opslaan: nog één keer opslaan.
      if (dirty) setTimer(push, DEBOUNCE_MS);
      return true;
    }
    if (d && d.conflict === true) return verwerkConflict();
    return verwerkFout(new Error('onverwacht antwoord'));
  }

  // Een conflict kan ook komen door een eigen opslag die na een time-out toch is gelukt.
  // Daarom eerst de cloud lezen: is die gelijk aan de laatst verzonden snapshot, dan gaan we stil door.
  function verwerkConflict() {
    conflict = true;
    pushing = true;      // blijft even bezet tijdens de controle, zodat er geen tweede push start
    clearTimer();
    zetStatus();
    return vraag('lees_mindmap').then(function (r) {
      pushing = false;
      var d = r.data;
      var eigen = !r.fout && !!d && typeof d === 'object' && laatsteVerzonden !== null &&
        canon(d.data) === laatsteVerzonden;
      if (eigen) {
        conflict = false;
        versie = Number(d.versie) || versie;
        mislukt = false;
        opnieuwGepland = false;
        herhaalIdx = 0;
        dirty = true;    // nog één keer opslaan met de nieuwe versie (wijzigingen na de snapshot)
        zetStatus();
        setTimer(push, DEBOUNCE_MS);
        return false;
      }
      mislukt = true;
      opnieuwGepland = false;
      dirty = true;
      clearTimer();
      zetStatus();
      toonConflictDialoog();
      return false;
    });
  }

  function verwerkFout(err) {
    mislukt = true;
    if (isNietGeverifieerd(err)) {
      sessieVerlopen = true;
      opnieuwGepland = false;
      dirty = true;
      clearTimer();
      zetStatus();
      toast('Je sessie is verlopen. Herlaad de pagina om opnieuw in te loggen.', {
        error: true,
        ms: 0,
        action: 'Herladen',
        onAction: herlaad
      });
      return false;
    }
    if (isBlijvendeFout(err)) {
      // Herhalen helpt niet. Een volgende wijziging probeert het opnieuw.
      dirty = true;
      opnieuwGepland = false;
      zetStatus();
      warn('opslaan in de cloud geweigerd', err);
      toast('Opslaan in de cloud lukt niet. Exporteer je mindmap om niets kwijt te raken.', {
        error: true,
        ms: 0,
        action: 'Exporteren',
        onAction: function () {
          if (BM.projects && typeof BM.projects.exportAll === 'function') BM.projects.exportAll();
        }
      });
      return false;
    }
    // Netwerk of tijdelijke fout: opnieuw proberen na 5, 15, 30 s (daarna elke 30 s).
    dirty = true;
    opnieuwGepland = true;
    var wacht = OPSLAAN_WACHT_MS[Math.min(herhaalIdx, OPSLAAN_WACHT_MS.length - 1)];
    herhaalIdx++;
    zetStatus();
    setTimer(push, wacht);
    return false;
  }

  // Wijziging in de mindmap: markeren en over 1500 ms opslaan.
  function onWijziging() {
    if (gestopt) return;
    dirty = true;
    zetVlag(true);
    zetStatus();
    setTimer(push, DEBOUNCE_MS);
  }

  // Bij verlaten van de pagina: best effort opslaan.
  function onVerlaten() {
    if (gestopt || !dirty) return;
    flush();
  }

  // ---------- laden ----------

  // Leest de mindmap uit de cloud. Bij een fout opnieuw, met een melding.
  function leesCloud(poging) {
    if (gestopt) return;
    if (poging === 0) toonLaadBalk();
    vraag('lees_mindmap').then(function (r) {
      if (gestopt) return;
      var d = r.data;
      if (r.fout || !d || typeof d !== 'object') {
        if (isNietGeverifieerd(r.fout)) {
          // Met wijzigingen die nog niet in de cloud staan, wordt de lokale kopie niet gewist.
          if (isVlag()) {
            sessieVerlopen = true;
            zetLaadTekst('Je sessie is verlopen.');
            toast('Je sessie is verlopen. Herlaad de pagina om opnieuw in te loggen. Je wijzigingen staan nog op deze computer.', {
              error: true,
              ms: 0,
              action: 'Herladen',
              onAction: herlaad
            });
            return;
          }
          uitlogSafe();
          return;
        }
        if (!laadMelding) {
          laadMelding = toast('Kan je mindmap nu niet laden. Opnieuw proberen...', { error: true, ms: 0 });
        }
        var wacht = LAAD_WACHT_MS[Math.min(poging, LAAD_WACHT_MS.length - 1)];
        laadTimer = setTimeout(function () {
          laadTimer = 0;
          leesCloud(poging + 1);
        }, wacht);
        return;
      }
      if (laadMelding) {
        try { laadMelding.close(); } catch (e) { /* al weg */ }
        laadMelding = null;
      }
      klaarMetLaden(d);
    });
  }

  function klaarMetLaden(d) {
    versie = Number(d.versie) || 0;
    var inhoud = (d.data && typeof d.data === 'object') ? d.data : null;
    var lokaal = leesLokaal(userKey);

    // Wijzigingen op deze computer die nog niet in de cloud staan: de gebruiker kiest.
    if (isVlag() && lokaal && (!inhoud || canon(lokaal) !== canon(inhoud))) {
      vraagLokaalOfCloud().then(function (mee) {
        if (gestopt) return;
        if (mee) {
          // Lokale versie houden; na het starten gaat die naar de cloud.
          dirty = true;
          start();
          return;
        }
        // Cloud gebruiken: de niet-opgeslagen wijzigingen vervallen.
        zetVlag(false);
        if (inhoud) {
          var tekstCloud = null;
          try { tekstCloud = JSON.stringify(inhoud); } catch (e) { tekstCloud = null; }
          if (!tekstCloud || !schrijfLokaal(userKey, tekstCloud)) {
            blokkeer();
            return;
          }
          start();
          return;
        }
        try { window.localStorage.removeItem(userKey); } catch (e) { /* negeren */ }
        nieuwAccountStart();
      });
      return;
    }

    // Geen losse wijzigingen meer: de vlag is niet nodig.
    zetVlag(false);

    if (inhoud) {
      // De cloud is leidend: de lokale kopie wordt overschreven.
      var tekst = null;
      try { tekst = JSON.stringify(inhoud); } catch (e) { tekst = null; }
      if (!tekst || !schrijfLokaal(userKey, tekst)) {
        blokkeer();
        return;
      }
      start();
      return;
    }

    nieuwAccountStart();
  }

  // Nieuw account: de mindmap van deze computer meenemen, als die er is.
  function nieuwAccountStart() {
    nieuwAccount = true;
    var oud = leesOudeLokaal();
    if (!oud) {
      start();
      return;
    }
    vraagMeenemen().then(function (mee) {
      if (gestopt) return;
      if (mee && !schrijfLokaal(userKey, oud)) {
        blokkeer();
        return;
      }
      start();
    });
  }

  // Lokale opslag werkt niet: de app niet starten, zodat niets kan overschrijven.
  function blokkeer() {
    blokkade = true;
    zetLaadTekst('Je mindmap kon niet worden geladen.');
    toast('Je mindmap kan niet worden geladen omdat deze browser geen opslag toestaat. Sta opslag toe en herlaad de pagina.', {
      error: true,
      ms: 0,
      action: 'Herladen',
      onAction: herlaad
    });
  }

  // Dialog: "Mindmap meenemen?". Geeft true bij Meenemen, false bij Leeg beginnen.
  function vraagMeenemen() {
    return new Promise(function (resolve) {
      var overlay = el('div', 'bm-dialog');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'bm-dialog-titel');

      var kaart = el('div', 'bm-dialog__kaart');
      var titel = el('h2', 'bm-dialog__titel', 'Mindmap meenemen?');
      titel.id = 'bm-dialog-titel';
      var tekst = el('p', 'bm-dialog__tekst',
        'Je hebt al een mindmap op deze computer. Wil je die meenemen naar je account?');
      var knoppen = el('div', 'bm-dialog__knoppen');

      var leeg = el('button', 'bm-knop', 'Leeg beginnen');
      leeg.type = 'button';
      var mee = el('button', 'bm-knop bm-knop--primair', 'Meenemen');
      mee.type = 'button';

      function onKey(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          kies(false);
        }
      }

      function kies(ja) {
        document.removeEventListener('keydown', onKey, true);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        resolve(ja);
      }

      mee.addEventListener('click', function () { kies(true); });
      leeg.addEventListener('click', function () { kies(false); });
      document.addEventListener('keydown', onKey, true);

      knoppen.appendChild(leeg);
      knoppen.appendChild(mee);
      kaart.appendChild(titel);
      kaart.appendChild(tekst);
      kaart.appendChild(knoppen);
      overlay.appendChild(kaart);
      document.body.appendChild(overlay);
      mee.focus();
    });
  }

  // Start de app en zet de opslag aan.
  function start() {
    if (gestopt) return;
    verbergLaadBalk();
    try {
      BM.app.start();
    } catch (e) {
      warn('app starten mislukt', e);
      toast('Kan je mindmap niet tonen. Herlaad de pagina.', { error: true, ms: 0, action: 'Herladen', onAction: herlaad });
      return;
    }
    bouwKnop();
    ['store:changed', 'store:save-ok', 'palette:changed', 'project:spacing', 'project:switched']
      .forEach(function (ev) {
        offs.push(BM.bus.on(ev, onWijziging));
      });
    voegVensterToe(window, 'beforeunload', onVerlaten);
    voegVensterToe(window, 'pagehide', onVerlaten);
    voegVensterToe(document, 'visibilitychange', function () {
      if (document.visibilityState === 'hidden') onVerlaten();
    });
    // Een nieuw account krijgt meteen een eerste opslag in de cloud.
    if (nieuwAccount) dirty = true;
    if (dirty) zetVlag(true);
    zetStatus();
    if (dirty) setTimer(push, DEBOUNCE_MS);
  }

  // ---------- accountknop en menu ----------

  function bouwKnop() {
    if (ui || !document.body) return;
    var mail = userEmail;

    // Container #bm-account: knop en menu zitten erin, zodat position:absolute van het menu klopt.
    var wrap = el('div');
    wrap.id = 'bm-account';

    var knop = el('button');
    knop.type = 'button';
    knop.textContent = (mail.charAt(0) || '?').toUpperCase();
    knop.title = mail;
    knop.setAttribute('aria-label', 'Account: ' + mail);
    knop.setAttribute('aria-haspopup', 'true');
    knop.setAttribute('aria-expanded', 'false');

    var menu = el('div', 'bm-account__menu');
    menu.hidden = true;
    menu.appendChild(el('div', 'bm-account__mail', mail));
    var status = el('div', 'bm-account__status', 'Opgeslagen');
    status.setAttribute('data-state', 'ok');
    menu.appendChild(status);
    var uit = el('button', 'bm-account__uit', 'Uitloggen');
    uit.type = 'button';
    menu.appendChild(uit);

    wrap.appendChild(knop);
    wrap.appendChild(menu);
    document.body.appendChild(wrap);

    // Klik op de container (ook op de knop, die bubbelt hierheen) opent of sluit het menu.
    wrap.addEventListener('click', function (e) {
      if (menu.contains(e.target)) return;
      e.stopPropagation();
      zetMenu(!menuOpen());
    });

    uit.addEventListener('click', function () {
      uit.disabled = true;
      flush().then(function () {
        uit.disabled = false;
        // Niets uitloggen zolang er wijzigingen niet veilig in de cloud staan:
        // de lokale kopie wordt bij uitloggen verwijderd.
        if (dirty || mislukt || conflict) {
          if (conflict || sessieVerlopen) {
            // Opnieuw proberen helpt hier niet: de nieuwste versie moet eerst in beeld komen.
            toast('Herlaad de pagina om je mindmap veilig op te slaan. Daarna kun je uitloggen.', {
              error: true,
              ms: 0,
              action: 'Herladen',
              onAction: herlaad
            });
          } else {
            toast('Niet alles is opgeslagen. Probeer het opnieuw voordat je uitlogt.', { error: true });
          }
          zetStatus();
          return;
        }
        uitlogSafe();
      });
    });

    // Klik buiten het menu of Escape sluit het.
    voegVensterToe(document, 'pointerdown', function (e) {
      if (!menuOpen()) return;
      if (wrap.contains(e.target)) return;
      zetMenu(false);
    });
    voegVensterToe(document, 'keydown', function (e) {
      if (e.key === 'Escape' && menuOpen()) zetMenu(false);
    });

    ui = { wrap: wrap, knop: knop, menu: menu, status: status };
  }

  // ---------- publieke API ----------

  // Start de cloud voor een ingelogde gebruiker (na de code). Laadt de mindmap en start de app.
  function begin(gebruiker) {
    if (begonnen || !gebruiker) return;
    begonnen = true;
    var id = String(gebruiker.id || '');
    if (!id) return;
    userEmail = String(gebruiker.email || '');
    client = (BM.auth && typeof BM.auth.client === 'function') ? BM.auth.client() : null;
    if (!client) {
      toast('Kan geen verbinding maken. Herlaad de pagina.', {
        error: true,
        ms: 0,
        action: 'Herladen',
        onAction: herlaad
      });
      return;
    }
    userKey = BASIS_KEY + ':' + id;
    BM.store.setKey(userKey);
    leesCloud(0);
  }

  // Stopt alle timers en listeners en haalt de knop weg. Laat lokale data staan.
  function stop() {
    gestopt = true;
    clearTimer();
    if (laadTimer) {
      clearTimeout(laadTimer);
      laadTimer = 0;
    }
    if (laadMelding) {
      try { laadMelding.close(); } catch (e) { /* al weg */ }
      laadMelding = null;
    }
    verbergLaadBalk();
    offs.forEach(function (off) {
      try { off(); } catch (e) { /* negeren */ }
    });
    offs = [];
    vensterListeners.forEach(function (l) {
      l.doel.removeEventListener(l.type, l.fn);
    });
    vensterListeners = [];
    if (ui) {
      if (ui.wrap.parentNode) ui.wrap.parentNode.removeChild(ui.wrap);
      ui = null;
    }
  }

  BM.cloud = {
    begin: begin,
    push: forceerPush,
    stop: stop
  };
})();
