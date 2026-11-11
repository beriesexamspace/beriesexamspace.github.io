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

  function voegVensterToe(doel, type, fn, vang) {
    doel.addEventListener(type, fn, !!vang);
    vensterListeners.push({ doel: doel, type: type, fn: fn, vang: !!vang });
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
    ['store:changed', 'store:save-ok', 'palette:changed', 'project:spacing', 'project:switched', 'project:modus', 'project:richting', 'project:posities']
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
    // De mindmap staat op het scherm: js/welkom.js start hierna de uitleg (de eerste keer).
    try { BM.bus.emit('cloud:gestart', {}); } catch (e) { warn('melding gestart mislukt', e); }
  }

  // ---------- accountknop en menu ----------

  // Naam en rol uit BM.thema (leeg als het thema-bestand ontbreekt).
  function profielNu() {
    var p = (BM.thema && typeof BM.thema.profiel === 'function') ? BM.thema.profiel() : null;
    return { naam: (p && p.naam) || '', rol: (p && p.rol) || null };
  }

  // Eerste letter van de naam, anders van het e-mailadres.
  function beginletter(naam, mail) {
    var bron = naam || mail || '';
    return (bron.charAt(0) || '?').toUpperCase();
  }

  // ---- onthouden accounts (alleen mailadressen, op dit toestel) ----
  var ACC_SLEUTEL = 'bm-accounts';
  var ACC_MAX = 5;
  function normMail(m) { return String(m || '').trim().toLowerCase(); }
  function leesAccounts() {
    try {
      var l = JSON.parse(localStorage.getItem(ACC_SLEUTEL) || '[]');
      return Array.isArray(l) ? l.filter(function (m) { return typeof m === 'string' && m.indexOf('@') > 0; }).slice(0, ACC_MAX) : [];
    } catch (e) { return []; }
  }
  function bewaarAccounts(l) {
    try { localStorage.setItem(ACC_SLEUTEL, JSON.stringify(l.slice(0, ACC_MAX))); } catch (e) { /* niet erg */ }
  }
  function onthoudAccount(m) {
    m = normMail(m);
    if (!m || m.indexOf('@') < 1) return;
    bewaarAccounts([m].concat(leesAccounts().filter(function (x) { return x !== m; })));
  }
  function vergeetAccount(m) {
    m = normMail(m);
    bewaarAccounts(leesAccounts().filter(function (x) { return x !== m; }));
  }

  function bouwKnop() {
    if (ui || !document.body) return;
    var mail = userEmail;
    var profiel = profielNu();
    var naamTimer = 0;

    // Container #bm-account: knop en menu zitten erin, zodat position:absolute van het menu klopt.
    var wrap = el('div');
    wrap.id = 'bm-account';

    var knop = el('button');
    knop.type = 'button';
    knop.textContent = beginletter(profiel.naam, mail);
    knop.title = mail;
    knop.setAttribute('aria-label', 'Account: ' + (profiel.naam || mail));
    knop.setAttribute('aria-haspopup', 'true');
    knop.setAttribute('aria-expanded', 'false');

    var menu = el('div', 'bm-account__menu');
    menu.hidden = true;

    // Bovenaan: naam (als ingevuld, vet), e-mail en status.
    var bovenkant = el('div', 'bm-account__top');
    var naamEl = el('div', 'bm-account__naam', profiel.naam);
    naamEl.hidden = !profiel.naam;
    bovenkant.appendChild(naamEl);
    bovenkant.appendChild(el('div', 'bm-account__mail', mail));
    var status = el('div', 'bm-account__status', 'Opgeslagen');
    status.setAttribute('data-state', 'ok');
    bovenkant.appendChild(status);
    menu.appendChild(bovenkant);

    // Sectie "Ik ben": drie chips en een naamveld.
    var ikBen = el('div', 'bm-account__deel');
    ikBen.appendChild(el('div', 'bm-account__kop', 'Ik ben'));
    var chips = el('div', 'bm-chips');
    chips.setAttribute('role', 'group');
    chips.setAttribute('aria-label', 'Ik ben');
    var chipKnoppen = {};
    [['student', 'Student'], ['leerkracht', 'Leerkracht'], ['anders', 'Anders']].forEach(function (r) {
      var c = el('button', 'bm-chip', r[1]);
      c.type = 'button';
      c.setAttribute('aria-pressed', 'false');
      chipKnoppen[r[0]] = c;
      chips.appendChild(c);
    });
    ikBen.appendChild(chips);

    var naamVeld = el('input', 'bm-account__naamveld');
    naamVeld.type = 'text';
    naamVeld.maxLength = 40;
    naamVeld.placeholder = 'Je naam (mag leeg)';
    naamVeld.setAttribute('aria-label', 'Je naam');
    naamVeld.setAttribute('autocomplete', 'off');
    naamVeld.value = profiel.naam;
    ikBen.appendChild(naamVeld);
    menu.appendChild(ikBen);

    // Sectie "Thema": acht kleurbolletjes.
    var themaDeel = el('div', 'bm-account__deel');
    themaDeel.appendChild(el('div', 'bm-account__kop', 'Thema'));
    var rij = el('div', 'bm-swatches');
    rij.setAttribute('role', 'group');
    rij.setAttribute('aria-label', 'Thema');
    var swatches = [];
    var kleuren = (BM.thema && typeof BM.thema.lijst === 'function') ? BM.thema.lijst() : [];
    kleuren.forEach(function (k) {
      var b = el('button', 'bm-swatch');
      b.type = 'button';
      b.title = k.naam;
      b.setAttribute('aria-label', k.naam);
      b.setAttribute('aria-pressed', 'false');
      b.style.background = k.hex;
      b.addEventListener('click', function () {
        if (BM.thema) BM.thema.kiezen(k.hex);
        zetSwatches();
      });
      swatches.push({ el: b, hex: k.hex });
      rij.appendChild(b);
    });
    themaDeel.appendChild(rij);
    menu.appendChild(themaDeel);

    // Uitleg opnieuw bekijken (alleen als de uitleg geladen is). De tekst staat in BM.welkomTeksten.
    if (BM.UITLEG_AAN === true && BM.uitleg && typeof BM.uitleg.start === 'function' && Array.isArray(BM.uitlegStappen)) {
      var uitlegDeel = el('div', 'bm-account__deel');
      var uitlegTekst = (BM.welkomTeksten && BM.welkomTeksten.menu && BM.welkomTeksten.menu.uitleg) ||
        'Uitleg opnieuw bekijken';
      var uitlegKnop = el('button', 'bm-account__actie bm-account__uitleg', uitlegTekst);
      uitlegKnop.type = 'button';
      uitlegKnop.addEventListener('click', function () {
        zetMenu(false);
        try {
          if (BM.welkom && typeof BM.welkom.uitlegOpnieuw === 'function') BM.welkom.uitlegOpnieuw();
          else BM.uitleg.start(BM.uitlegStappen);
        } catch (e) { warn('uitleg starten mislukt', e); }
      });
      uitlegDeel.appendChild(uitlegKnop);
      menu.appendChild(uitlegDeel);
    }

    // Accounts: eerder gebruikte accounts op dit toestel en "Account toevoegen".
    // Alleen het mailadres wordt onthouden. Wisselen = uitloggen en opnieuw inloggen
    // met wachtwoord en mailcode, net als altijd.
    onthoudAccount(mail);
    var accDeel = el('div', 'bm-account__deel bm-account__accounts');
    accDeel.appendChild(el('div', 'bm-account__kop', 'Accounts'));
    var accLijst = el('div', 'bm-account__acclijst');
    accDeel.appendChild(accLijst);
    var toevoegen = el('button', 'bm-account__actie bm-account__toevoegen', '+ Account toevoegen');
    toevoegen.type = 'button';
    accDeel.appendChild(toevoegen);
    menu.appendChild(accDeel);

    function tekenAccounts() {
      while (accLijst.firstChild) accLijst.removeChild(accLijst.firstChild);
      leesAccounts().filter(function (m) { return m !== normMail(mail); }).forEach(function (m) {
        var rij = el('div', 'bm-account__acc');
        var wissel = el('button', 'bm-account__actie bm-account__wissel', m);
        wissel.type = 'button';
        wissel.title = 'Wisselen naar ' + m + ' (inloggen met wachtwoord en mailcode)';
        wissel.addEventListener('click', function () { wisselNaar(m); });
        var weg = el('button', 'bm-account__accweg', '');
        weg.type = 'button';
        weg.title = m + ' uit deze lijst halen';
        weg.setAttribute('aria-label', m + ' uit deze lijst halen');
        weg.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
        weg.addEventListener('click', function () { vergeetAccount(m); tekenAccounts(); });
        rij.appendChild(wissel);
        rij.appendChild(weg);
        accLijst.appendChild(rij);
      });
      accLijst.hidden = !accLijst.firstChild;
    }
    tekenAccounts();

    function wisselNaar(m) {
      try { sessionStorage.setItem('bm-wissel-mail', m || ''); } catch (e) { /* niet erg */ }
      uit.click();
    }
    toevoegen.addEventListener('click', function () { wisselNaar(''); });

    // Uitloggen (gedrag ongewijzigd).
    var uitDeel = el('div', 'bm-account__deel');
    var uit = el('button', 'bm-account__uit', 'Uitloggen');
    uit.type = 'button';
    uitDeel.appendChild(uit);
    menu.appendChild(uitDeel);

    // Onderaan: de badge van The Berie Foundation (geen link).
    var voet = el('div', 'bm-account__deel bm-account__deel--voet');
    voet.appendChild(el('span', 'bm-account__badge', 'The Berie Foundation'));
    menu.appendChild(voet);

    function zetChips(rol) {
      Object.keys(chipKnoppen).forEach(function (k) {
        chipKnoppen[k].setAttribute('aria-pressed', k === rol ? 'true' : 'false');
      });
    }

    function zetSwatches() {
      var nu = (BM.thema && typeof BM.thema.huidige === 'function') ? BM.thema.huidige() : '';
      swatches.forEach(function (s) {
        s.el.setAttribute('aria-pressed', s.hex === nu ? 'true' : 'false');
      });
    }

    function bewaar(naam, rol) {
      if (BM.thema && typeof BM.thema.zetProfiel === 'function') BM.thema.zetProfiel({ naam: naam, rol: rol });
    }

    // Chip: nogmaals klikken zet hem uit.
    Object.keys(chipKnoppen).forEach(function (k) {
      chipKnoppen[k].addEventListener('click', function () {
        var nieuw = (profielNu().rol === k) ? null : k;
        clearTimeout(naamTimer);
        naamTimer = 0;
        bewaar(naamVeld.value, nieuw);
        zetChips(nieuw);
      });
    });

    // Naamveld: opslaan na korte pauze in het typen. Typen in het veld sluit het menu niet.
    naamVeld.addEventListener('input', function () {
      clearTimeout(naamTimer);
      naamTimer = setTimeout(function () {
        naamTimer = 0;
        bewaar(naamVeld.value, profielNu().rol);
      }, 400);
    });
    naamVeld.addEventListener('change', function () {
      clearTimeout(naamTimer);
      naamTimer = 0;
      bewaar(naamVeld.value, profielNu().rol);
    });
    zetChips(profiel.rol);
    zetSwatches();

    wrap.appendChild(knop);
    wrap.appendChild(menu);
    document.body.appendChild(wrap);

    // Naam of thema wijzigt (ook elders): knop, naam en kleurbolletjes bijwerken.
    offs.push(BM.bus.on('profiel:changed', function (p) {
      var naam = (p && p.naam) || '';
      naamEl.textContent = naam;
      naamEl.hidden = !naam;
      knop.textContent = beginletter(naam, mail);
      knop.setAttribute('aria-label', 'Account: ' + (naam || mail));
    }));
    offs.push(BM.bus.on('thema:changed', zetSwatches));

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
    // Escape met open menu sluit alleen het menu. Capture-fase: deze listener draait
    // vóór de Escape-afhandeling van de pop-up (popup.js), die anders eerst de Escape opvangt.
    // Staat de focus in het menu (ook het naamveld), dan komt hij terug op het accountknopje.
    voegVensterToe(document, 'keydown', function (e) {
      if (e.key !== 'Escape' || !menuOpen()) return;
      e.preventDefault();
      e.stopPropagation();
      var inMenu = menu.contains(document.activeElement);
      zetMenu(false);
      if (inMenu) ui.knop.focus();
    }, true);

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
      l.doel.removeEventListener(l.type, l.fn, !!l.vang);
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
