/*
  Nep-database voor Duel. Alleen voor tests: duel.html laadt dit bestand met ?test=duel in plaats van assets/duel.js.
  Zelfde window.BES.duel als duel.js (contract deel 3), maar zonder Supabase:
  - de volledige stand staat in localStorage (sleutel bes_duel_nep);
  - tabbladen horen elkaar via BroadcastChannel('bes-duel') (en de storage-melding als reserve);
  - wijzigingen lopen strikt na elkaar via een IndexedDB-transactie (zie "opslag"), zodat bij gelijk drukken er precies een wint.

  Zo probeer je het in 2 tabbladen (zelfde adres en poort):
    Tabblad A: duel.html?test=duel&speler=1
      Zonder ?c= maakt de pagina een kamer met BES.duelNep.voorbeeldKamer(10).
    Tabblad B: duel.html?test=duel&speler=2&c=CODE
    Met &snel=1 gaan alle tijden door 15 (30 s wordt 2 s, 15 s wordt 1 s, 3 s wordt 0,2 s).

  Of rechtstreeks in de console:
    A (speler=1): const { code } = await BES.duel.maak(BES.duelNep.voorbeeldKamer(5));
                  BES.duel.volg(code, s => console.log(s.kamer && s.kamer.status, s));
    B (speler=2): await BES.duel.doeMee(code); BES.duel.volg(code, s => console.log(s));
    A:            await BES.duel.start(code);  daarna druk(code, 1) en antwoord(code, 1, keuze).

  Extra parameters: ?speler=0 is niet ingelogd, ?vertraging=0 haalt de nep-netwerktijd weg.
  Hulp voor tests (async): await BES.duelNep.juist(code, nr), .stand(code), .laatsteKamer(), .pasAan(code, k => ...), .wis().
  BES.duelNep.offline(true/false) doet alsof het internet wegvalt (staat.verbonden wordt false).
*/
(() => {
  'use strict';

  const SLEUTEL = 'bes_duel_nep';
  const KANAAL = 'bes-duel';
  const SLOT = 'bes-duel-nep';
  const TEKENS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const CODE_VORM = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;
  const MAX_SPELERS = 10;
  const AANTALLEN = [5, 10, 15, 20]; // zoals duel_intern_vragen_ok in duel-live.sql

  const zoek = new URLSearchParams(window.location.search);
  const spelerRuw = zoek.get('speler');
  const SPELER_NR = spelerRuw === '0' ? 0 : Math.min(4, Math.max(1, parseInt(spelerRuw, 10) || 1));
  const IK = SPELER_NR ? 'nep-' + SPELER_NR : null;
  const NAAM = SPELER_NR ? 'Speler ' + SPELER_NR : null;
  const SNEL = zoek.get('snel') === '1';
  const DEEL = SNEL ? 15 : 1;
  const T = Object.freeze({
    open: 30000 / DEEL,        // zolang mag je drukken
    antwoord: 15000 / DEEL,    // zolang heeft de drukker
    onthulling: 3000 / DEEL,   // zolang blijft goed of iedereen_fout staan
    maker: 60000 / DEEL,       // maker zo lang niet gezien (wachtkamer): iedereen mag starten
    hier: 10000 / DEEL,        // zo vaak laatst_gezien bijwerken
    online: 20000 / DEEL,      // online = laatst_gezien korter geleden dan dit
    speling: 1000 / DEEL,      // antwoord mag nog tot deadline + speling
    marge: 300 / DEEL,         // verder() iets na het moment zelf
    verloopt: 24 * 3600 * 1000
  });
  const VASTE_VERTRAGING = zoek.has('vertraging') ? Math.max(0, Number(zoek.get('vertraging')) || 0) : null;

  const slaap = ms => new Promise(ok => window.setTimeout(ok, ms));
  const vertraging = () => (VASTE_VERTRAGING !== null ? VASTE_VERTRAGING : 10 + Math.random() * 30);
  const iso = ms => new Date(ms).toISOString();
  const tijdVan = tekst => (tekst ? Date.parse(tekst) : NaN);
  const kopie = waarde => (waarde === undefined ? undefined : JSON.parse(JSON.stringify(waarde)));
  const willekeurig = max => {
    try {
      const getal = new Uint32Array(1);
      window.crypto.getRandomValues(getal);
      return getal[0] % max;
    } catch {
      return Math.floor(Math.random() * max);
    }
  };
  const schud = lijst => {
    const uit = lijst.slice();
    for (let i = uit.length - 1; i > 0; i--) {
      const j = willekeurig(i + 1);
      [uit[i], uit[j]] = [uit[j], uit[i]];
    }
    return uit;
  };

  // ---------- opslag ----------
  // localStorage (bes_duel_nep) houdt na elke wijziging de volledige stand bij.
  // Het schrijven zelf gebeurt in IndexedDB: de browser voert die transacties strikt na elkaar uit, ook tussen tabbladen.
  // Met alleen localStorage kan een ander tabblad een paar ms een oude stand lezen, en dan gaat een wijziging verloren
  // (twee winnaars bij gelijk drukken, een speler die verdwijnt). Zonder IndexedDB valt hij terug op localStorage + navigator.locks.

  const opslag = (() => {
    try {
      const proef = SLEUTEL + '_proef';
      window.localStorage.setItem(proef, '1');
      window.localStorage.removeItem(proef);
      return window.localStorage;
    } catch {
      return null;
    }
  })();
  let geheugen = null;
  const leeg = () => ({ rev: 0, laatste: null, kamers: {} });
  const ruweStand = () => {
    try { return opslag ? opslag.getItem(SLEUTEL) : geheugen; } catch { return geheugen; }
  };
  const lees = () => {
    try {
      const ruw = ruweStand();
      const stand = ruw ? JSON.parse(ruw) : null;
      if (stand && stand.kamers && typeof stand.kamers === 'object') return stand;
    } catch {}
    return leeg();
  };
  const schrijf = stand => {
    const ruw = JSON.stringify({ rev: stand.rev || 0, laatste: stand.laatste || null, kamers: stand.kamers });
    if (opslag) {
      try { opslag.setItem(SLEUTEL, ruw); return; } catch {}
    }
    geheugen = ruw;
  };
  // Kopie in localStorage, maar nooit een oudere over een nieuwere heen.
  const spiegel = stand => {
    const oud = /^\{"rev":(\d+)/.exec(ruweStand() || '');
    if (oud && Number(oud[1]) > (stand.rev || 0)) return;
    schrijf(stand);
  };

  const DB_NAAM = 'bes-duel-nep';
  let dbBelofte = null;
  const db = () => {
    if (dbBelofte) return dbBelofte;
    dbBelofte = new Promise(ok => {
      let verzoek;
      try { verzoek = window.indexedDB.open(DB_NAAM, 1); } catch { ok(null); return; }
      verzoek.onupgradeneeded = () => {
        const d = verzoek.result;
        if (!d.objectStoreNames.contains('kamers')) d.createObjectStore('kamers');
        if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta');
      };
      verzoek.onerror = () => ok(null);
      verzoek.onsuccess = () => {
        const d = verzoek.result;
        // De eerste keer: neem een stand over die al in localStorage stond.
        try {
          const tx = d.transaction(['kamers', 'meta'], 'readwrite');
          const metaVerzoek = tx.objectStore('meta').get('meta');
          metaVerzoek.onsuccess = () => {
            if (metaVerzoek.result) return;
            const oud = lees();
            Object.keys(oud.kamers).forEach(code => tx.objectStore('kamers').put(oud.kamers[code], code));
            tx.objectStore('meta').put({ rev: oud.rev || 0, laatste: oud.laatste || null }, 'meta');
          };
          tx.oncomplete = () => ok(d);
          tx.onabort = () => ok(d);
        } catch {
          ok(d);
        }
      };
    });
    return dbBelofte;
  };

  const leesKamer = code => db().then(d => {
    if (!d) return lees().kamers[code] || null;
    return new Promise((ok, nee) => {
      const tx = d.transaction('kamers', 'readonly');
      const verzoek = tx.objectStore('kamers').get(code);
      tx.oncomplete = () => ok(verzoek.result || null);
      tx.onabort = () => nee(tx.error);
    });
  });

  const leesAlles = () => db().then(d => {
    if (!d) return lees();
    return new Promise((ok, nee) => {
      const tx = d.transaction(['kamers', 'meta'], 'readonly');
      const sleutels = tx.objectStore('kamers').getAllKeys();
      const alle = tx.objectStore('kamers').getAll();
      const meta = tx.objectStore('meta').get('meta');
      tx.oncomplete = () => {
        const m = meta.result || {};
        const stand = { rev: m.rev || 0, laatste: m.laatste || null, kamers: {} };
        sleutels.result.forEach((code, i) => { stand.kamers[code] = alle.result[i]; });
        ok(stand);
      };
      tx.onabort = () => nee(tx.error);
    });
  });

  // ---------- meldingen tussen tabbladen ----------

  const volgers = new Set();
  let kanaal = null;
  let hoogsteRev = 0; // hoogste rev die een ander tabblad meldde (voor de reserve zonder IndexedDB)
  try { kanaal = new BroadcastChannel(KANAAL); } catch {}
  const controleerVolgers = code => volgers.forEach(volger => { if (!code || volger.code === code) volger.check(); });
  if (kanaal) {
    kanaal.addEventListener('message', event => {
      const bericht = event.data || {};
      if (bericht.soort !== 'wijziging') return;
      if (bericht.gewist) hoogsteRev = 0;
      else if (Number.isFinite(bericht.rev)) hoogsteRev = Math.max(hoogsteRev, bericht.rev);
      controleerVolgers(bericht.code || null);
    });
  }
  window.addEventListener('storage', event => {
    if (event.key === SLEUTEL || event.key === null) controleerVolgers(null);
  });
  const meld = (code, rev, gewist = false) => {
    try { if (kanaal) kanaal.postMessage({ soort: 'wijziging', code: code || null, rev: rev || 0, gewist }); } catch {}
    window.setTimeout(() => controleerVolgers(code || null), vertraging());
  };

  // ---------- verbinding (nep) ----------

  let handmatigOffline = false;
  const offline = () => handmatigOffline || navigator.onLine === false;
  window.addEventListener('online', () => controleerVolgers(null));
  window.addEventListener('offline', () => controleerVolgers(null));

  // ---------- schrijven: een voor een, ook over tabbladen heen ----------
  // werk(stand, tijd) is synchroon en geeft { antwoord, codes }: codes = kamers die veranderd zijn (leeg = niets schrijven).

  // Een readwrite-transactie over beide tabellen: de browser laat er nooit twee tegelijk lopen.
  const wijzigIdb = (d, werk) => new Promise((ok, nee) => {
    let uitkomst = null;
    let stand = null;
    const tx = d.transaction(['kamers', 'meta'], 'readwrite');
    const kamers = tx.objectStore('kamers');
    const meta = tx.objectStore('meta');
    const sleutels = kamers.getAllKeys();
    const alle = kamers.getAll();
    const metaVerzoek = meta.get('meta');
    metaVerzoek.onsuccess = () => {
      const m = metaVerzoek.result || {};
      stand = { rev: m.rev || 0, laatste: m.laatste || null, kamers: {} };
      sleutels.result.forEach((code, i) => { stand.kamers[code] = alle.result[i]; });
      const voor = Object.keys(stand.kamers);
      uitkomst = werk(stand, Date.now());
      if (!uitkomst.codes.length) return;
      stand.rev += 1;
      uitkomst.codes.forEach(code => { if (stand.kamers[code]) kamers.put(stand.kamers[code], code); });
      voor.forEach(code => { if (!stand.kamers[code]) kamers.delete(code); });
      meta.put({ rev: stand.rev, laatste: stand.laatste }, 'meta');
    };
    tx.oncomplete = () => {
      if (uitkomst && uitkomst.codes.length) {
        spiegel(stand);
        uitkomst.codes.forEach(code => meld(code, stand.rev));
      }
      ok(uitkomst ? uitkomst.antwoord : { ok: false, fout: 'al_bezet' });
    };
    tx.onabort = () => nee(tx.error || new Error('transactie afgebroken'));
  });

  // Reserve zonder IndexedDB: navigator.locks voor de volgorde, rev om een botsing op te merken.
  // localStorage loopt tussen tabbladen een paar ms achter, dus: wacht tot je de laatst gemelde rev ziet,
  // en houd het slot na het schrijven nog even vast zodat de anderen bij zijn.
  const metSlot = werk => (navigator.locks && typeof navigator.locks.request === 'function'
    ? navigator.locks.request(SLOT, { mode: 'exclusive' }, werk)
    : Promise.resolve().then(werk));
  const wijzigLokaal = werk => metSlot(async () => {
    for (let wacht = 0; wacht < 20 && (lees().rev || 0) < hoogsteRev; wacht++) await slaap(10);
    for (let poging = 0; poging < 25; poging++) {
      const stand = lees();
      const rev = stand.rev || 0;
      const uitkomst = werk(stand, Date.now());
      if (!uitkomst.codes.length) return uitkomst.antwoord;
      if ((lees().rev || 0) !== rev) {
        await slaap(3 + Math.random() * 15);
        continue;
      }
      stand.rev = rev + 1;
      schrijf(stand);
      uitkomst.codes.forEach(code => meld(code, stand.rev));
      await slaap(40);
      return uitkomst.antwoord;
    }
    return { ok: false, fout: 'al_bezet' };
  });

  const wijzig = werk => db().then(d => (d ? wijzigIdb(d, werk) : wijzigLokaal(werk)));

  const rpc = async doe => {
    await slaap(vertraging());
    if (offline()) return { ok: false, fout: 'geen_verbinding' };
    const antwoord = await doe();
    await slaap(vertraging() / 2);
    return kopie(antwoord);
  };

  const fout = code => ({ antwoord: { ok: false, fout: code }, codes: [] });
  const klaar = (antwoord, codes = []) => ({ antwoord, codes });

  const normCode = code => {
    const schoon = String(code == null ? '' : code).trim().toUpperCase();
    return CODE_VORM.test(schoon) ? schoon : null;
  };
  const normNr = nr => {
    const getal = Number(nr);
    return Number.isInteger(getal) && getal >= 1 ? getal : null;
  };

  // Zoekt de kamer en jou erin, met de vaste controles van elke functie.
  const pak = (stand, code, tijd, deelnemerNodig = true) => {
    if (!IK) return { fout: 'niet_ingelogd' };
    const c = normCode(code);
    const k = c ? stand.kamers[c] : null;
    if (!k) return { fout: 'bestaat_niet' };
    if (tijdVan(k.kamer.verloopt) <= tijd) return { fout: 'verlopen' };
    const ik = k.deelnemers.find(d => d.speler === IK) || null;
    if (deelnemerNodig && !ik) return { fout: 'geen_deelnemer' };
    return { c, k, ik };
  };

  const schoonVragen = vragen => {
    if (!Array.isArray(vragen) || !AANTALLEN.includes(vragen.length)) return null;
    const uit = [];
    for (const v of vragen) {
      if (!v || typeof v.vraag !== 'string' || !v.vraag.trim()) return null;
      if (!Array.isArray(v.opties) || v.opties.length < 2 || v.opties.length > 6) return null;
      const opties = v.opties.map(optie => String(optie == null ? '' : optie));
      if (opties.some(optie => !optie.trim())) return null;
      const juist = Number(v.juist);
      if (!Number.isInteger(juist) || juist < 0 || juist >= opties.length) return null;
      uit.push({
        vraag: v.vraag,
        opties,
        juist,
        hoofdstuk: v.hoofdstuk == null ? '' : String(v.hoofdstuk),
        uitleg: v.uitleg == null || v.uitleg === '' ? null : String(v.uitleg)
      });
    }
    return uit;
  };

  const nieuweCode = stand => {
    for (;;) {
      let code = '';
      for (let i = 0; i < 6; i++) code += TEKENS[willekeurig(TEKENS.length)];
      if (!stand.kamers[code]) return code;
    }
  };

  const nieuweKamer = (code, vak, hoofdstukken, vragen, tijd) => ({
    kamer: {
      code,
      vak,
      hoofdstukken,
      aantal: vragen.length,
      maker: IK,
      status: 'wachtkamer',
      vraag_nr: 0,
      open_sinds: null,
      drukker: null,
      deadline: null,
      uitkomst: null,
      juist: null,
      onthuld_op: null,
      volgende_code: null,
      versie: 1,
      aangemaakt: iso(tijd),
      verloopt: iso(tijd + T.verloopt)
    },
    deelnemers: [{ kamer: code, speler: IK, naam: NAAM, punten: 0, binnen: iso(tijd), laatst_gezien: iso(tijd) }],
    vragen: vragen.map((v, i) => ({ kamer: code, nr: i + 1, vraag: v.vraag, opties: v.opties, hoofdstuk: v.hoofdstuk, uitleg: v.uitleg })),
    geheim: vragen.map((v, i) => ({ kamer: code, nr: i + 1, juist: v.juist, uitleg: v.uitleg })),
    pogingen: []
  });

  // Oude kamers weg, zodat de opslag klein blijft. Nooit een kamer uit `bewaar` of waar iemand net nog was.
  const opruimen = (stand, tijd, bewaar = []) => {
    Object.keys(stand.kamers).forEach(code => {
      if (!bewaar.includes(code) && tijdVan(stand.kamers[code].kamer.verloopt) < tijd - T.verloopt) delete stand.kamers[code];
    });
    const codes = Object.keys(stand.kamers);
    if (codes.length <= 40) return;
    const inGebruik = code => stand.kamers[code].deelnemers.some(d => tijd - tijdVan(d.laatst_gezien) < 120000);
    codes
      .filter(code => !bewaar.includes(code) && !inGebruik(code))
      .sort((a, b) => tijdVan(stand.kamers[a].kamer.aangemaakt) - tijdVan(stand.kamers[b].kamer.aangemaakt))
      .slice(0, codes.length - 40)
      .forEach(code => { delete stand.kamers[code]; });
  };

  const verhoog = k => { k.kamer.versie += 1; };

  // Volgende vraag: vraag_nr + 1, status open, klok opnieuw, drukker/deadline/uitkomst/juist leeg. Na de laatste: einde.
  const naarVraag = (k, nr, tijd) => {
    const kamer = k.kamer;
    kamer.drukker = null;
    kamer.deadline = null;
    kamer.uitkomst = null;
    kamer.juist = null;
    kamer.onthuld_op = null;
    if (nr > kamer.aantal) {
      kamer.status = 'einde';
      kamer.open_sinds = null;
    } else {
      kamer.status = 'open';
      kamer.vraag_nr = nr;
      kamer.open_sinds = iso(tijd);
    }
    verhoog(k);
  };

  const onthul = (k, uitkomst, tijd) => {
    const kamer = k.kamer;
    const geheim = k.geheim.find(g => g.nr === kamer.vraag_nr);
    kamer.status = 'onthulling';
    kamer.uitkomst = uitkomst;
    kamer.juist = geheim ? geheim.juist : null;
    kamer.onthuld_op = iso(tijd);
    kamer.deadline = null;
  };

  // Schrijft de poging van de drukker (keuze null = tijd op) en volgt de regels uit deel 1.
  const verwerkPoging = (k, nr, speler, keuze, tijd) => {
    const kamer = k.kamer;
    const geheim = k.geheim.find(g => g.nr === nr);
    const goed = keuze !== null && !!geheim && keuze === geheim.juist;
    if (!k.pogingen.some(p => p.nr === nr && p.speler === speler)) {
      k.pogingen.push({ kamer: kamer.code, nr, speler, keuze, goed, op: iso(tijd) });
    }
    if (goed) {
      const wie = k.deelnemers.find(d => d.speler === speler);
      if (wie) wie.punten += 1;
      onthul(k, 'goed', tijd);
    } else {
      // Iedereen fout = iedereen die online is heeft een poging (zoals duel_intern_na_fout). Wie weg is, telt niet mee.
      const geprobeerd = new Set(k.pogingen.filter(p => p.nr === nr).map(p => p.speler));
      const mee = k.deelnemers.filter(d => d.speler === speler || tijd - tijdVan(d.laatst_gezien) < T.online);
      if (mee.every(d => geprobeerd.has(d.speler))) {
        onthul(k, 'iedereen_fout', tijd);
      } else {
        kamer.status = 'open';
        kamer.open_sinds = iso(tijd);
        kamer.drukker = null;
        kamer.deadline = null;
      }
    }
    verhoog(k);
    return goed;
  };

  // ---------- de functies (zelfde namen en antwoorden als duel.js) ----------

  const maak = invoer => rpc(() => wijzig((stand, tijd) => {
    if (!IK) return fout('niet_ingelogd');
    const { vak, hoofdstukken, vragen } = invoer || {};
    const schoon = schoonVragen(vragen);
    if (typeof vak !== 'string' || !vak.trim() || !Array.isArray(hoofdstukken) || !schoon) return fout('ongeldig');
    opruimen(stand, tijd);
    const code = nieuweCode(stand);
    stand.kamers[code] = nieuweKamer(code, vak.trim(), hoofdstukken.map(String), schoon, tijd);
    stand.laatste = code;
    return klaar({ ok: true, code }, [code]);
  }));

  const doeMee = code => rpc(() => wijzig((stand, tijd) => {
    const p = pak(stand, code, tijd, false);
    if (p.fout) return fout(p.fout);
    if (p.ik) {
      p.ik.laatst_gezien = iso(tijd);
      return klaar({ ok: true }, [p.c]);
    }
    if (p.k.kamer.status !== 'wachtkamer') return fout('al_begonnen');
    if (p.k.deelnemers.length >= MAX_SPELERS) return fout('vol');
    p.k.deelnemers.push({ kamer: p.c, speler: IK, naam: NAAM, punten: 0, binnen: iso(tijd), laatst_gezien: iso(tijd) });
    verhoog(p.k);
    return klaar({ ok: true }, [p.c]);
  }));

  const start = code => rpc(() => wijzig((stand, tijd) => {
    const p = pak(stand, code, tijd);
    if (p.fout) return fout(p.fout);
    const kamer = p.k.kamer;
    if (kamer.status !== 'wachtkamer') return fout('al_begonnen');
    if (p.k.deelnemers.length < 2) return fout('te_weinig_spelers');
    if (kamer.maker !== IK) {
      const maker = p.k.deelnemers.find(d => d.speler === kamer.maker);
      if (maker && tijd - tijdVan(maker.laatst_gezien) <= T.maker) return fout('niet_jouw_beurt');
    }
    naarVraag(p.k, 1, tijd);
    return klaar({ ok: true }, [p.c]);
  }));

  const druk = (code, nr) => rpc(() => wijzig((stand, tijd) => {
    const p = pak(stand, code, tijd);
    if (p.fout) return fout(p.fout);
    const n = normNr(nr);
    if (n === null) return fout('ongeldig');
    if (p.k.pogingen.some(x => x.nr === n && x.speler === IK)) return fout('al_geprobeerd');
    const kamer = p.k.kamer;
    // Twee keer getikt: je bent al de drukker (zoals duel_druk).
    if (kamer.status === 'antwoord' && kamer.vraag_nr === n && kamer.drukker === IK) return klaar({ ok: true, gelukt: true });
    // Een stap, onder het slot: wie hier als eerste binnenkomt, wint. De rest krijgt gelukt: false.
    if (kamer.status !== 'open' || kamer.vraag_nr !== n || tijd > tijdVan(kamer.open_sinds) + T.open) {
      return klaar({ ok: true, gelukt: false });
    }
    kamer.status = 'antwoord';
    kamer.drukker = IK;
    kamer.deadline = iso(tijd + T.antwoord);
    verhoog(p.k);
    return klaar({ ok: true, gelukt: true }, [p.c]);
  }));

  const antwoord = (code, nr, keuze) => rpc(() => wijzig((stand, tijd) => {
    const p = pak(stand, code, tijd);
    if (p.fout) return fout(p.fout);
    const n = normNr(nr);
    if (n === null) return fout('ongeldig');
    const kamer = p.k.kamer;
    if (kamer.status !== 'antwoord' || kamer.vraag_nr !== n) {
      // Je tijd was al op en een ander toestel heeft dat al verwerkt (zoals duel_antwoord).
      if (p.k.pogingen.some(x => x.nr === n && x.speler === IK && x.keuze === null)) return fout('te_laat');
      return fout('verkeerde_stand');
    }
    if (kamer.drukker !== IK) return fout('niet_jouw_beurt');
    if (tijd > tijdVan(kamer.deadline) + T.speling) {
      // Te laat: telt als fout (keuze null), precies zoals verder() het ook zou doen.
      verwerkPoging(p.k, n, IK, null, tijd);
      return klaar({ ok: false, fout: 'te_laat' }, [p.c]);
    }
    const vraag = p.k.vragen.find(v => v.nr === n);
    const k = Number(keuze);
    if (keuze === null || keuze === '' || !Number.isInteger(k) || !vraag || k < 0 || k >= vraag.opties.length) return fout('ongeldig');
    const goed = verwerkPoging(p.k, n, IK, k, tijd);
    return klaar({ ok: true, goed }, [p.c]);
  }));

  // Kijkt alleen naar de klok. Twee keer aanroepen doet niets extra.
  const verder = code => rpc(() => wijzig((stand, tijd) => {
    const p = pak(stand, code, tijd);
    if (p.fout) return fout(p.fout);
    const kamer = p.k.kamer;
    let veranderd = false;
    // Zelfde speling als antwoord(): een antwoord dat net na de deadline binnenkomt, telt nog.
    if (kamer.status === 'antwoord' && tijd > tijdVan(kamer.deadline) + T.speling) {
      verwerkPoging(p.k, kamer.vraag_nr, kamer.drukker, null, tijd);
      veranderd = true;
    } else if (kamer.status === 'open' && tijd > tijdVan(kamer.open_sinds) + T.open) {
      kamer.drukker = null;
      onthul(p.k, 'niemand', tijd);
      verhoog(p.k);
      veranderd = true;
    } else if (kamer.status === 'onthulling' && (kamer.uitkomst === 'goed' || kamer.uitkomst === 'iedereen_fout')
      && tijd > tijdVan(kamer.onthuld_op) + T.onthulling) {
      naarVraag(p.k, kamer.vraag_nr + 1, tijd);
      veranderd = true;
    }
    return klaar({ ok: true, versie: kamer.versie }, veranderd ? [p.c] : []);
  }));

  const volgende = (code, nr) => rpc(() => wijzig((stand, tijd) => {
    const p = pak(stand, code, tijd);
    if (p.fout) return fout(p.fout);
    const n = normNr(nr);
    if (n === null) return fout('ongeldig');
    const kamer = p.k.kamer;
    if (kamer.status !== 'onthulling' || kamer.uitkomst !== 'niemand' || kamer.vraag_nr !== n) return fout('verkeerde_stand');
    naarVraag(p.k, n + 1, tijd);
    return klaar({ ok: true, versie: kamer.versie }, [p.c]);
  }));

  const uitleg = (code, nr) => rpc(async () => {
    const c = normCode(code);
    const k = c ? await leesKamer(c) : null;
    const p = pak({ kamers: k ? { [c]: k } : {} }, code, Date.now());
    if (p.fout) return { ok: false, fout: p.fout };
    const n = normNr(nr);
    const geheim = n === null ? null : p.k.geheim.find(g => g.nr === n);
    if (!geheim) return { ok: false, fout: 'ongeldig' };
    const kamer = p.k.kamer;
    const onthuld = kamer.status === 'einde' || n < kamer.vraag_nr || (n === kamer.vraag_nr && kamer.status === 'onthulling');
    if (!onthuld) return { ok: false, fout: 'verkeerde_stand' };
    return { ok: true, uitleg: geheim.uitleg == null ? null : geheim.uitleg };
  });

  const opnieuw = (code, vragen) => rpc(() => wijzig((stand, tijd) => {
    const p = pak(stand, code, tijd);
    if (p.fout) return fout(p.fout);
    const kamer = p.k.kamer;
    if (kamer.maker !== IK) return fout('niet_jouw_beurt');
    if (kamer.status !== 'einde') return fout('verkeerde_stand');
    // Twee keer klikken maakt geen tweede kamer.
    if (kamer.volgende_code && stand.kamers[kamer.volgende_code]) return klaar({ ok: true, code: kamer.volgende_code });
    const schoon = schoonVragen(vragen);
    if (!schoon) return fout('ongeldig');
    opruimen(stand, tijd, [p.c]);
    const nieuw = nieuweCode(stand);
    stand.kamers[nieuw] = nieuweKamer(nieuw, kamer.vak, kamer.hoofdstukken.slice(), schoon, tijd);
    kamer.volgende_code = nieuw;
    verhoog(p.k);
    stand.laatste = nieuw;
    return klaar({ ok: true, code: nieuw }, [p.c, nieuw]);
  }));

  // duel_hier: niet in de lijst van BES.duel, volg() roept het zelf aan.
  const hier = code => rpc(() => wijzig((stand, tijd) => {
    const p = pak(stand, code, tijd);
    if (p.fout) return fout(p.fout);
    p.ik.laatst_gezien = iso(tijd);
    return klaar({ ok: true }, [p.c]);
  }));

  // De nep-server draait in dezelfde browser: het klokverschil is 0.
  const nu = () => Date.now();

  // ---------- volgen ----------

  const leegStaat = verbonden => ({ kamer: null, deelnemers: [], vragen: {}, pogingen: [], ik: IK, verbonden });

  // Volledige stand zoals een deelnemer hem mag zien. Geen deelnemer of geen kamer: kamer null (zoals RLS).
  const bouwStaat = k => {
    if (!k || !IK || !k.deelnemers.some(d => d.speler === IK)) return leegStaat(true);
    const tijd = Date.now();
    const vragen = {};
    k.vragen.forEach(v => { vragen[v.nr] = { vraag: v.vraag, opties: v.opties.slice(), hoofdstuk: v.hoofdstuk }; });
    return {
      kamer: kopie(k.kamer),
      deelnemers: k.deelnemers
        .slice()
        .sort((a, b) => tijdVan(a.binnen) - tijdVan(b.binnen))
        .map(d => ({
          speler: d.speler,
          naam: d.naam,
          punten: d.punten,
          online: tijd - tijdVan(d.laatst_gezien) < T.online,
          lang_weg: tijd - tijdVan(d.laatst_gezien) > T.maker
        })),
      vragen,
      pogingen: k.pogingen
        .slice()
        .sort((a, b) => tijdVan(a.op) - tijdVan(b.op))
        .map(x => ({ nr: x.nr, speler: x.speler, keuze: x.keuze, goed: x.goed })),
      ik: IK,
      verbonden: true
    };
  };

  // Moment waarop verder() zinvol is, + marge. null = geen klok nodig.
  const klokMoment = kamer => {
    if (!kamer) return null;
    let moment = null;
    if (kamer.status === 'antwoord') moment = tijdVan(kamer.deadline) + T.speling;
    else if (kamer.status === 'open') moment = tijdVan(kamer.open_sinds) + T.open;
    else if (kamer.status === 'onthulling' && kamer.uitkomst !== 'niemand') moment = tijdVan(kamer.onthuld_op) + T.onthulling;
    return Number.isFinite(moment) ? moment + T.marge : null;
  };

  const volg = (code, bijWijziging) => {
    const c = normCode(code) || String(code == null ? '' : code).trim().toUpperCase();
    let actief = true;
    let vorige = '';
    let laatsteVerbonden = null;
    let klok = 0;
    let klokSleutel = null;
    let geprobeerd = null;

    const stopKlok = () => {
      window.clearTimeout(klok);
      klok = 0;
      klokSleutel = null;
    };

    const plan = kamer => {
      const moment = klokMoment(kamer);
      const sleutel = moment === null ? null : kamer.versie + ':' + moment;
      if (sleutel === klokSleutel) return;
      window.clearTimeout(klok);
      klokSleutel = sleutel;
      if (sleutel === null) return;
      // Deed verder() bij dit moment al niets, probeer dan rustig opnieuw in plaats van in een lus.
      const wacht = Math.max(moment - Date.now(), geprobeerd === sleutel ? 250 : 0);
      klok = window.setTimeout(async () => {
        if (!actief || offline()) return;
        geprobeerd = sleutel;
        const uit = await verder(c);
        if (!actief) return;
        if (uit && uit.ok) {
          klokSleutel = null;
          volger.check();
        }
      }, wacht);
    };

    // Elke check leest opnieuw; een trager antwoord van een oudere check mag een nieuwere nooit overschrijven.
    let checkNr = 0;
    let toegepast = 0;
    const volger = {
      code: c,
      async check() {
        if (!actief) return;
        const mijnNr = ++checkNr;
        let staat;
        if (offline()) {
          staat = laatsteVerbonden ? Object.assign(kopie(laatsteVerbonden), { verbonden: false }) : leegStaat(false);
        } else {
          let k = null;
          try {
            k = normCode(c) ? await leesKamer(c) : null;
          } catch {
            return;
          }
          if (!actief || mijnNr <= toegepast || offline()) return;
          staat = bouwStaat(k);
          laatsteVerbonden = staat;
        }
        toegepast = mijnNr;
        const tekst = JSON.stringify(staat);
        if (tekst !== vorige) {
          vorige = tekst;
          try {
            bijWijziging(JSON.parse(tekst));
          } catch (fout) {
            console.error(fout);
          }
        }
        if (!actief) return;
        if (staat.verbonden) plan(staat.kamer);
        else stopKlok();
      }
    };

    const hierNu = () => {
      if (actief && !offline()) hier(c).catch(() => {});
    };
    volgers.add(volger);
    hierNu();
    const hierKlok = window.setInterval(hierNu, T.hier);
    // online hangt af van de tijd, dus ook zonder melding af en toe kijken.
    const kijkKlok = window.setInterval(() => volger.check(), SNEL ? 200 : 1000);
    const terug = () => { hierNu(); volger.check(); };
    window.addEventListener('online', terug);
    window.setTimeout(() => volger.check(), vertraging());

    const stop = () => {
      if (!actief) return;
      actief = false;
      stopKlok();
      window.clearInterval(hierKlok);
      window.clearInterval(kijkKlok);
      window.removeEventListener('online', terug);
      volgers.delete(volger);
    };
    stop.stop = stop;
    return stop;
  };

  // ---------- voorbeeldvragen (testmodus zonder vakpagina) ----------

  const voorbeeldHoofdstukken = [
    { id: 'h1', naam: 'Rekenen' },
    { id: 'h2', naam: 'Natuur' },
    { id: 'h3', naam: 'Aardrijkskunde' },
    { id: 'h4', naam: 'Taal en studie' }
  ];

  const VOORBEELD = [
    ['h1', 'Hoeveel is 7 x 8?', ['54', '56', '58', '64'], 1, '7 x 8 = 56. Ezelsbrug: 5, 6, 7, 8 staan op een rij in 56 = 7 x 8.'],
    ['h1', 'Wat is 25% van 80?', ['15', '20', '25', '40'], 1, '25% is een kwart, en een kwart van 80 is 20.'],
    ['h1', 'Hoeveel minuten zitten er in 3,5 uur?', ['180', '195', '210', '240'], 2, '3 uur is 180 minuten, plus een half uur is 210 minuten.'],
    ['h1', 'Welk getal is een priemgetal?', ['21', '27', '29', '33'], 2, '29 kan je alleen delen door 1 en door zichzelf.'],
    ['h1', 'Wat is de wortel van 144?', ['11', '12', '13', '14'], 1, '12 x 12 = 144.'],
    ['h1', 'Wat is het gemiddelde van 4, 6 en 11?', ['5', '6', '7', '8'], 2, '4 + 6 + 11 = 21, en 21 gedeeld door 3 is 7.'],
    ['h2', 'Bij welke temperatuur kookt water op zeeniveau?', ['90 °C', '100 °C', '110 °C', '120 °C'], 1, 'Op zeeniveau kookt water bij 100 °C. Hoog in de bergen gaat dat lager.'],
    ['h2', 'Welke planeet staat het dichtst bij de zon?', ['Venus', 'Aarde', 'Mercurius', 'Mars'], 2, 'Mercurius is de eerste planeet vanaf de zon.'],
    ['h2', 'Welk gas nemen planten op voor fotosynthese?', ['Zuurstof', 'Stikstof', 'Koolstofdioxide', 'Helium'], 2, 'Planten nemen koolstofdioxide op en geven zuurstof af.'],
    ['h2', 'Hoeveel poten heeft een spin?', ['6', '8', '10', '12'], 1, 'Spinnen hebben 8 poten, insecten hebben er 6.'],
    ['h2', 'Wat is het grootste orgaan van het lichaam?', ['De lever', 'De huid', 'De longen', 'De hersenen'], 1, 'De huid is het grootste orgaan van het lichaam.'],
    ['h2', 'Welke kleur krijg je als je blauw en geel mengt?', ['Groen', 'Paars', 'Oranje', 'Bruin'], 0, 'Blauw en geel samen geven groen.'],
    ['h3', 'Wat is de hoofdstad van België?', ['Antwerpen', 'Gent', 'Brussel', 'Luik'], 2, 'Brussel is de hoofdstad van België.'],
    ['h3', 'Welke rivier stroomt door Maastricht?', ['De Schelde', 'De Maas', 'De Rijn', 'De IJssel'], 1, 'Maastricht ligt aan de Maas, daar komt de naam ook vandaan.'],
    ['h3', 'Op welk continent ligt Egypte?', ['Azië', 'Afrika', 'Europa', 'Zuid-Amerika'], 1, 'Egypte ligt in het noordoosten van Afrika.'],
    ['h3', 'Welke oceaan is de grootste?', ['De Atlantische Oceaan', 'De Indische Oceaan', 'De Noordelijke IJszee', 'De Stille Oceaan'], 3, 'De Stille Oceaan is de grootste en diepste oceaan.'],
    ['h3', 'Hoeveel provincies telt Nederland?', ['10', '11', '12', '13'], 2, 'Nederland heeft 12 provincies.'],
    ['h3', 'Wat is de hoofdstad van Spanje?', ['Barcelona', 'Madrid', 'Sevilla', 'Valencia'], 1, 'Madrid is de hoofdstad van Spanje.'],
    ['h4', 'Welke zin is goed geschreven?', ['Hij vind het leuk.', 'Hij vindt het leuk.', 'Hij vint het leuk.', 'Hij vindd het leuk.'], 1, 'Bij hij komt er een t achter de stam: vind + t = vindt.'],
    ['h4', 'Welk woord is een bijvoeglijk naamwoord?', ['groen', 'lopen', 'tafel', 'onder'], 0, 'Een bijvoeglijk naamwoord zegt iets over een zelfstandig naamwoord, zoals een groen blad.'],
    ['h4', 'Wat is een synoniem van beginnen?', ['eindigen', 'starten', 'wachten', 'stoppen'], 1, 'Beginnen en starten betekenen hetzelfde.'],
    ['h4', 'Hoeveel studiepunten telt een voltijds studiejaar meestal?', ['30', '45', '60', '90'], 2, 'Een voltijds studiejaar telt meestal 60 studiepunten.'],
    ['h4', 'Wat helpt het best om iets lang te onthouden?', ['Alles in een nacht leren', 'Gespreid herhalen', 'Alleen markeren', 'Alleen herlezen'], 1, 'Gespreid herhalen over meerdere dagen zorgt dat je het langer onthoudt.'],
    ['h4', 'Wat is een deliberatie aan de universiteit?', ['Een herexamen', 'Een overleg over je resultaten', 'Een inschrijving', 'Een vrijstelling'], 1, 'Bij een deliberatie overlegt de examencommissie over je resultaten.']
  ];

  // Geeft `aantal` verschillende neppe vragen in het formaat van maak(): { vraag, opties, juist, hoofdstuk, uitleg }.
  // De opties worden geschud en juist schuift mee. Met { schud: false } krijg je ze vast in volgorde.
  const voorbeeldVragen = (aantal = 10, keuzes = {}) => {
    const n = Math.max(1, Math.min(VOORBEELD.length, parseInt(aantal, 10) || 10));
    const vast = keuzes && keuzes.schud === false;
    const gekozen = (vast ? VOORBEELD : schud(VOORBEELD)).slice(0, n);
    return gekozen.map(([hoofdstuk, vraag, opties, juist, uitleg]) => {
      const volgorde = vast ? opties.map((_, i) => i) : schud(opties.map((_, i) => i));
      return {
        vraag,
        opties: volgorde.map(i => opties[i]),
        juist: volgorde.indexOf(juist),
        hoofdstuk,
        uitleg
      };
    });
  };

  const voorbeeldKamer = (aantal = 10, keuzes = {}) => ({
    vak: 'voorbeeld',
    hoofdstukken: voorbeeldHoofdstukken.map(h => h.id),
    vragen: voorbeeldVragen(aantal, keuzes)
  });

  // ---------- naar buiten ----------

  window.BES = window.BES || {};
  window.BES.duel = { maak, doeMee, start, druk, antwoord, verder, volgende, uitleg, opnieuw, volg, nu };

  window.BES.duelNep = {
    ik: IK,
    naam: NAAM,
    snel: SNEL,
    tijden: T,
    voorbeeldHoofdstukken: kopie(voorbeeldHoofdstukken),
    voorbeeldVragen,
    voorbeeldKamer,
    // Hulp voor tests (allemaal async). juist geeft het antwoord dat de echte database geheim houdt.
    juist: async (code, nr) => {
      const c = normCode(code);
      const k = c ? await leesKamer(c) : null;
      const geheim = k ? k.geheim.find(g => g.nr === Number(nr)) : null;
      return geheim ? geheim.juist : null;
    },
    stand: async code => {
      if (code === undefined) return leesAlles();
      const c = normCode(code);
      return c ? leesKamer(c) : null;
    },
    laatsteKamer: async () => (await leesAlles()).laatste || null,
    // Past een kamer rechtstreeks aan (bv. verloopt in het verleden zetten), in dezelfde volgorde als de rest.
    pasAan: (code, aanpassing) => wijzig(stand => {
      const c = normCode(code);
      const k = c ? stand.kamers[c] : null;
      if (!k) return fout('bestaat_niet');
      aanpassing(k);
      return klaar({ ok: true }, [c]);
    }),
    wis: async () => {
      const d = await db();
      if (d) {
        await new Promise(ok => {
          const tx = d.transaction(['kamers', 'meta'], 'readwrite');
          tx.objectStore('kamers').clear();
          tx.objectStore('meta').put({ rev: 0, laatste: null }, 'meta');
          tx.oncomplete = ok;
          tx.onabort = ok;
        });
      }
      schrijf(leeg());
      hoogsteRev = 0;
      meld(null, 0, true);
      return true;
    },
    offline: aan => {
      handmatigOffline = !!aan;
      controleerVolgers(null);
      return handmatigOffline;
    }
  };
})();
