/* Duel: podiumscherm (status einde).
   Plaats 1, 2 en 3 op een podium, de rest eronder. Gelijke stand = zelfde plaats (1, 1, 3).
   De maker start met "Nog een keer" een nieuwe ronde met nieuwe vragen uit dezelfde hoofdstukken;
   de andere spelers wachten en gaan via volgende_code vanzelf mee naar de nieuwe wachtkamer. */
(() => {
  'use strict';
  const BES = window.BES = window.BES || {};
  BES.duelScherm = BES.duelScherm || {};

  const SCRIPT = (document.currentScript && document.currentScript.src) || '';
  // Paden ten opzichte van de sitemap (dit script staat in assets/).
  const vanSite = pad => {
    try { return new URL('../' + pad, SCRIPT || window.location.href).href; } catch { return pad; }
  };

  // De stijl hoort bij dit scherm: laad hem zelf als de pagina hem nog niet heeft.
  if (!document.querySelector('link[href*="duel-podium.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = vanSite('assets/duel-podium.css?v=1');
    document.head.append(link);
  }

  const CODE = /^[A-Z0-9]{4,12}$/i;
  const ONDERWEG = 'Op naar de nieuwe wachtkamer…';
  const AANTALLEN = [5, 10, 20, 30, 50];
  // Nog een keer houdt hetzelfde aantal, ook 15 van een kamer van voor 05-11-2026 (de database staat dat toe).
  const ZELFDE_MAG = [5, 10, 15, 20, 30, 50];
  // Teksten uit plannen/duel-teksten.md (podium en foutcodes).
  const FOUTEN = {
    niet_ingelogd: 'Log eerst in om mee te doen.',
    verlopen: 'Deze code is verlopen. Een duel blijft 24 uur open.',
    geen_deelnemer: 'Je doet niet mee aan dit duel.',
    verkeerde_stand: 'Het spel ging net verder.',
    ongeldig: 'Er klopt iets niet. Probeer het opnieuw.',
    geen_verbinding: 'Geen verbinding. Probeer het opnieuw.'
  };
  const FOUT_ANDERS = 'Nog een keer lukte niet. Probeer het opnieuw.';
  const TE_WEINIG = 'Er zijn te weinig vragen voor een nieuwe ronde. Kies andere hoofdstukken op de vakpagina.';
  const GEEN_VAK = 'De vragen van dit vak zijn niet gevonden. Start een nieuw duel op de vakpagina.';

  const rustig = () => Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const testModus = () => new URLSearchParams(window.location.search).get('test') === 'duel';
  const maakEl = (tag, klasse, tekst) => {
    const el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (tekst !== undefined && tekst !== null) el.textContent = tekst;
    return el;
  };
  const naamVan = d => (d && typeof d.naam === 'string' && d.naam.trim()) ? d.naam.trim().slice(0, 40) : 'Speler';
  const letter = naam => (Array.from(String(naam).trim())[0] || '?').toLocaleUpperCase('nl');
  const puntenTekst = p => (p === 1 ? '1 punt' : `${p} punten`);
  const rang = n => `${n}e`;
  const opsomming = namen => (namen.length < 2 ? namen.join('') : `${namen.slice(0, -1).join(', ')} en ${namen[namen.length - 1]}`);

  // Rangschikking: meeste punten eerst; bij gelijke punten dezelfde plaats (1, 1, 3).
  function rangschik(deelnemers) {
    const lijst = (Array.isArray(deelnemers) ? deelnemers : [])
      .filter(d => d && d.speler)
      .map(d => ({ ...d, punten: Math.max(0, Number(d.punten) || 0) }));
    lijst.sort((a, b) => b.punten - a.punten
      || naamVan(a).localeCompare(naamVan(b), 'nl', { sensitivity: 'base' })
      || String(a.speler).localeCompare(String(b.speler)));
    lijst.forEach((d, i) => { d.plaats = i && d.punten === lijst[i - 1].punten ? lijst[i - 1].plaats : i + 1; });
    return lijst;
  }

  function kopTekst(lijst, ik) {
    if (!lijst.length) return { titel: 'Het duel is voorbij', sub: '' };
    if (lijst.every(d => d.punten === 0)) return { titel: 'Niemand scoorde', sub: 'Volgende keer beter!' };
    const eersten = lijst.filter(d => d.plaats === 1);
    const mij = lijst.find(d => d.speler === ik);
    const ikBovenaan = Boolean(mij && mij.plaats === 1);
    if (eersten.length === 1) {
      if (ikBovenaan) return { titel: 'Jij wint!', sub: `Met ${puntenTekst(mij.punten)}. Sterk gespeeld!` };
      const sub = `Met ${puntenTekst(eersten[0].punten)}.` + (mij ? ` Jij: ${rang(mij.plaats)} plaats met ${puntenTekst(mij.punten)}.` : '');
      return { titel: `${naamVan(eersten[0])} wint!`, sub };
    }
    // Gelijk op de eerste plaats
    let sub;
    if (eersten.length === 2) {
      const namen = eersten.map(d => (d.speler === ik ? 'Jij' : naamVan(d)));
      if (namen[1] === 'Jij') namen.reverse();
      sub = `${namen[0]} en ${namen[1]} delen de eerste plaats.`;
    } else {
      sub = `${eersten.length} spelers delen de eerste plaats${ikBovenaan ? ', jij ook' : ''}.`;
    }
    if (mij && !ikBovenaan) sub += ` Jij: ${rang(mij.plaats)} plaats met ${puntenTekst(mij.punten)}.`;
    return { titel: 'Gelijkspel!', sub };
  }

  function schud(rij) {
    const a = rij.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Zet een vraag om naar de vorm van duel_maak/duel_opnieuw. Werkt met de vorm uit data.js ({ h, q, o, a, u })
  // en met de duelvorm ({ vraag, opties, juist, hoofdstuk, uitleg }). Opties worden geschud, juist schuift mee.
  // Zelfde regel als duel-start.js: geen "kies de foute"-vragen (kies), wel a als getal of als lijst met één getal.
  function naarDuelVraag(v) {
    if (!v || v.plaatshouder || v.kies !== undefined) return null;
    const vakVorm = Array.isArray(v.o);
    const vraag = vakVorm ? v.q : v.vraag;
    const opties = vakVorm ? v.o : v.opties;
    let juist = vakVorm ? v.a : v.juist;
    if (Array.isArray(juist)) juist = juist.length === 1 ? juist[0] : NaN;
    if (typeof vraag !== 'string' || !vraag.trim() || !Array.isArray(opties) || opties.length < 2 || opties.length > 6) return null;
    if (opties.some(o => typeof o !== 'string' || !o.trim()) || !Number.isInteger(juist) || juist < 0 || juist >= opties.length) return null;
    const uitleg = vakVorm ? v.u : v.uitleg;
    const volgorde = schud(opties.map((tekst, i) => ({ tekst, i })));
    return {
      vraag,
      opties: volgorde.map(o => o.tekst),
      juist: volgorde.findIndex(o => o.i === juist),
      hoofdstuk: String((vakVorm ? v.h : v.hoofdstuk) ?? ''),
      uitleg: typeof uitleg === 'string' ? uitleg : ''
    };
  }

  // Kies `aantal` vragen uit de gekozen hoofdstukken, zonder dubbele. Vragen die net gespeeld zijn, komen pas als er te weinig nieuwe zijn.
  function kiesVragen(bron, hoofdstukken, aantal, gespeeld, losVanHoofdstuk) {
    const gekozen = new Set(Array.isArray(hoofdstukken) ? hoofdstukken.map(String) : []);
    const gezien = new Set();
    const pool = [];
    for (const v of bron) {
      const h = v && (Array.isArray(v.o) ? v.h : v.hoofdstuk);
      if (!losVanHoofdstuk && gekozen.size && !gekozen.has(String(h))) continue;
      const omgezet = naarDuelVraag(v);
      if (!omgezet) continue;
      const sleutel = omgezet.vraag.trim();
      if (gezien.has(sleutel)) continue;
      gezien.add(sleutel);
      pool.push(omgezet);
    }
    const nieuw = schud(pool.filter(v => !gespeeld.has(v.vraag.trim())));
    const oud = schud(pool.filter(v => gespeeld.has(v.vraag.trim())));
    const alles = nieuw.concat(oud);
    if (alles.length >= aantal) return alles.slice(0, aantal);
    // Te weinig voor hetzelfde aantal: het grootste toegestane aantal dat wel kan (minstens 5).
    const kan = AANTALLEN.filter(n => n <= alles.length).pop();
    return kan ? alles.slice(0, kan) : [];
  }

  // De vragen van het vak: window.BES_VAK als die van dit vak is, anders data.js van het vak laden.
  // Laadt de pagina dat bestand al (duel.html doet dat voor de maker), dan eerst daarop wachten.
  const vakVan = vak => {
    const data = window.BES_VAK;
    return data && Array.isArray(data.vragen) && (!vak || data.id === vak) ? data.vragen : null;
  };
  const wachtOpScript = (script, ms) => new Promise(klaar => {
    const stop = setTimeout(klaar, ms);
    const af = () => { clearTimeout(stop); klaar(); };
    script.addEventListener('load', af, { once: true });
    script.addEventListener('error', af, { once: true });
  });
  async function vakVragen(vak) {
    if (vakVan(vak)) return vakVan(vak);
    if (typeof vak !== 'string' || !/^[a-z0-9_-]+$/i.test(vak)) return null;
    const pad = `vak/${vak}/data.js`;
    const bestaand = Array.from(document.scripts).find(s => (s.getAttribute('src') || '').split('?')[0].endsWith(pad));
    if (bestaand) {
      await wachtOpScript(bestaand, 4000);
      if (vakVan(vak)) return vakVan(vak);
    }
    const script = document.createElement('script');
    script.src = vanSite(pad);
    const klaar = wachtOpScript(script, 10000);
    document.head.append(script);
    await klaar;
    return vakVan(vak);
  }

  // Testmodus: de voorbeeldvragen van de nep-database (functie of lijst).
  async function nepVragen() {
    const nep = BES.duelNep && BES.duelNep.voorbeeldVragen;
    if (!nep) return null;
    try {
      const uit = typeof nep === 'function' ? await nep(1000) : nep;
      return Array.isArray(uit) ? uit : null;
    } catch { return null; }
  }

  async function nieuweVragen(staat) {
    const kamer = staat.kamer;
    const aantal = ZELFDE_MAG.includes(Number(kamer.aantal)) ? Number(kamer.aantal) : 10;
    const gespeeld = new Set(Object.values(staat.vragen || {}).map(v => String((v && v.vraag) || '').trim()).filter(Boolean));
    let vragen = [];
    if (testModus()) {
      const nep = await nepVragen();
      if (nep && nep.length) {
        vragen = kiesVragen(nep, kamer.hoofdstukken, aantal, gespeeld);
        // Voorbeeldvragen horen soms bij andere hoofdstuk-id's: dan maakt het hoofdstuk in de test niet uit.
        if (vragen.length < Math.min(aantal, 5)) vragen = kiesVragen(nep, kamer.hoofdstukken, aantal, gespeeld, true);
      }
    }
    if (!vragen.length) {
      const bron = await vakVragen(kamer.vak);
      if (!bron || !bron.length) throw { melding: GEEN_VAK };
      vragen = kiesVragen(bron, kamer.hoofdstukken, aantal, gespeeld);
    }
    if (!vragen.length) throw { melding: TE_WEINIG };
    return vragen;
  }

  const SVG = 'http://www.w3.org/2000/svg';
  function svg(viewBox, paden, klasse) {
    const s = document.createElementNS(SVG, 'svg');
    s.setAttribute('viewBox', viewBox);
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    if (klasse) s.setAttribute('class', klasse);
    paden.forEach(d => { const p = document.createElementNS(SVG, 'path'); p.setAttribute('d', d); s.append(p); });
    return s;
  }
  const kroon = () => svg('0 0 26 18', ['M2.2 15.6 3.6 4.4l5.7 5.1L13 1.6l3.7 7.9 5.7-5.1 1.4 11.2Z'], 'dp-kroon');
  const opnieuwIcoon = () => svg('0 0 24 24', ['M20 11a8 8 0 1 0-2.3 5.7', 'M20 4v7h-7']);
  const huisIcoon = () => svg('0 0 24 24', ['M3 10.5 12 3l9 7.5M5 9v12h5v-7h4v7h5V9']);

  function vonken() {
    const feest = maakEl('span', 'dp-feest');
    feest.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 14; i++) {
      const v = document.createElement('i');
      v.style.setProperty('--hoek', `${i * (360 / 14) + (i % 2 ? 9 : -6)}deg`);
      v.style.setProperty('--afstand', `${[46, 60, 52, 66][i % 4]}px`);
      v.style.setProperty('--extra', `${(i % 3) * 50}ms`);
      feest.append(v);
    }
    return feest;
  }

  function maak(root, acties) {
    acties = acties || {};
    let staat = null;
    let lijst = [];
    let handtekening = '';
    let sectie = null;
    let gevolgd = false;
    let bezig = false;
    let gestopt = false;
    const timers = new Set();
    const el = {};

    const later = (fn, ms) => {
      const t = setTimeout(() => { timers.delete(t); if (!gestopt) fn(); }, ms);
      timers.add(t);
      return t;
    };

    function telOp(getal, doel, wachtMs) {
      if (doel <= 1 || rustig()) { getal.textContent = String(doel); return; }
      getal.textContent = '0';
      later(() => {
        const duur = 650;
        const start = performance.now();
        const stap = nu => {
          if (gestopt) return;
          const t = Math.min(1, (nu - start) / duur);
          getal.textContent = String(Math.round(doel * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(stap);
        };
        requestAnimationFrame(stap);
        // Vangnet als het tabblad op de achtergrond staat (dan wacht requestAnimationFrame).
        later(() => { getal.textContent = String(doel); }, duur + 200);
      }, wachtMs);
    }

    const benIk = d => Boolean(staat && d.speler === staat.ik);

    function naamEl(d, klasse) {
      const naam = maakEl('span', klasse, naamVan(d));
      if (benIk(d)) naam.append(maakEl('span', 'dp-sr', ' (jij)'));
      return naam;
    }

    // Jouw eigen plek krijgt een labeltje "jij" onder de letter, los van de naam, zodat het nooit wegvalt bij een lange naam.
    function avatar(d) {
      const a = maakEl('span', 'dp-avatar', letter(naamVan(d)));
      a.setAttribute('aria-hidden', 'true');
      if (benIk(d)) {
        a.classList.add('is-ik');
        a.append(maakEl('span', 'dp-jij', 'jij'));
      }
      return a;
    }

    function uitklap(klasse, rol) {
      const buiten = maakEl('div', 'dp-uitklap');
      buiten.setAttribute('aria-hidden', 'true');
      const binnen = document.createElement('div');
      const p = maakEl('p', klasse);
      if (rol) p.setAttribute('role', rol);
      binnen.append(p);
      buiten.append(binnen);
      buiten.tekst = p;
      return buiten;
    }

    function klap(blok, open, tekst) {
      if (!blok) return;
      if (open && tekst !== undefined) blok.tekst.textContent = tekst;
      if (blok.classList.contains('is-open') === open) return;
      blok.classList.toggle('is-open', open);
      blok.setAttribute('aria-hidden', open ? 'false' : 'true');
      // Tekst pas weghalen als het blok dicht is, zodat hij niet halverwege verdwijnt.
      if (!open && tekst !== undefined) later(() => { if (!blok.classList.contains('is-open')) blok.tekst.textContent = ''; }, 300);
    }

    // Tekst in de wachtpil wisselen: tekst vervaagt, de breedte loopt vloeiend mee.
    function wisselWacht(tekst) {
      const pil = el.wacht;
      const span = el.wachtTekst;
      if (!pil || span.textContent === tekst) return;
      if (rustig() || pil.hidden) { span.textContent = tekst; return; }
      pil.classList.add('is-wissel');
      later(() => {
        const van = pil.getBoundingClientRect().width;
        span.textContent = tekst;
        pil.style.width = '';
        const naar = pil.getBoundingClientRect().width;
        pil.style.width = `${van}px`;
        void pil.offsetWidth;
        pil.style.transition = 'width 240ms var(--ease)';
        pil.style.width = `${naar}px`;
        pil.classList.remove('is-wissel');
        later(() => { pil.style.width = ''; pil.style.transition = ''; }, 280);
      }, 200);
    }

    function wisselTekst(p, tekst) {
      if (!p || p.textContent === tekst) return;
      if (rustig()) { p.textContent = tekst; return; }
      p.classList.add('is-wissel');
      later(() => { p.textContent = tekst; p.classList.remove('is-wissel'); }, 180);
    }

    function zetKnop(tekst, bezigNu) {
      if (!el.nog) return;
      el.nogTekst.textContent = tekst;
      el.nog.disabled = Boolean(bezigNu);
      if (bezigNu) el.nog.setAttribute('aria-busy', 'true');
      else el.nog.removeAttribute('aria-busy');
    }

    function bouw(stil) {
      const ik = staat.ik;
      const kamer = staat.kamer;
      const nieuw = maakEl('section', stil ? 'dp is-stil' : 'dp');
      nieuw.setAttribute('aria-labelledby', 'dp-kop');

      // Kop
      const kop = maakEl('header', 'dp-kop-blok');
      const aantal = Number(kamer.aantal) || Object.keys(staat.vragen || {}).length;
      kop.append(maakEl('p', 'eyebrow dp-eyebrow', aantal ? `Uitslag · ${aantal} vragen` : 'Uitslag'));
      const tekst = kopTekst(lijst, ik);
      const titel = maakEl('h1', 'dp-titel', tekst.titel);
      titel.id = 'dp-kop';
      titel.tabIndex = -1;
      kop.append(titel);
      if (tekst.sub) kop.append(maakEl('p', 'dp-sub', tekst.sub));
      nieuw.append(kop);

      // Podium: in de code plaats 1 eerst, op het scherm 2, 1, 3. De blokken groeien na elkaar: eerst 3, dan 2, dan 1.
      const podium = maakEl('ol', 'dp-podium');
      podium.setAttribute('aria-label', 'Podium');
      const top = lijst.slice(0, 3);
      top.forEach((d, pos) => {
        const wacht = 160 + (top.length - 1 - pos) * 190;
        const plek = maakEl('li', 'dp-plek');
        plek.dataset.pos = String(pos);
        plek.dataset.plaats = String(Math.min(d.plaats, 3));
        plek.style.setProperty('--dp-wacht', `${wacht}ms`);
        const feest = d.plaats === 1 && d.punten > 0;
        if (feest) plek.classList.add('is-winnaar');

        const speler = maakEl('div', 'dp-speler');
        if (feest) speler.append(kroon());
        const letterVak = avatar(d);
        if (feest) letterVak.append(vonken());
        speler.append(letterVak);
        speler.append(naamEl(d, 'dp-naam'));
        const punten = maakEl('span', 'dp-punten');
        const getal = maakEl('b', 'dp-getal', String(d.punten));
        punten.append(getal, document.createTextNode(d.punten === 1 ? ' punt' : ' punten'));
        speler.append(punten);
        if (!stil) telOp(getal, d.punten, wacht + 560);

        const blok = maakEl('div', 'dp-blok');
        const nr = maakEl('span', 'dp-nr', String(d.plaats));
        nr.setAttribute('aria-hidden', 'true');
        blok.append(nr);

        plek.append(maakEl('span', 'dp-sr', `${rang(d.plaats)} plaats: `), speler, blok);
        podium.append(plek);
      });
      nieuw.append(podium, maakEl('div', 'dp-voet'));

      // De rest van de groep
      const rest = lijst.slice(3);
      if (rest.length) {
        const ol = maakEl('ol', 'dp-rest');
        ol.setAttribute('aria-label', 'De andere spelers');
        ol.style.setProperty('--dp-wacht', '980ms');
        rest.forEach((d, i) => {
          const rij = maakEl('li', benIk(d) ? 'dp-rij is-ik' : 'dp-rij');
          rij.style.setProperty('--dp-wacht', `${1100 + i * 70}ms`);
          const plaats = maakEl('span', 'dp-rij-plaats');
          plaats.append(document.createTextNode(String(d.plaats)), maakEl('span', 'dp-sr', 'e plaats'));
          rij.append(plaats, avatar(d), naamEl(d, 'dp-rij-naam'), maakEl('span', 'dp-rij-punten', puntenTekst(d.punten)));
          ol.append(rij);
        });
        nieuw.append(ol);
      }

      // Acties
      const blokActies = maakEl('div', 'dp-acties');
      blokActies.style.setProperty('--dp-wacht', `${1180 + Math.min(rest.length, 7) * 70}ms`);

      el.wacht = maakEl('p', 'dp-wacht');
      el.wacht.setAttribute('role', 'status');
      const stippen = maakEl('span', 'dp-stippen');
      stippen.setAttribute('aria-hidden', 'true');
      stippen.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
      el.wachtTekst = maakEl('span', 'dp-wacht-tekst', 'Wachten op de maker…');
      el.wacht.append(stippen, el.wachtTekst);

      const knoppen = maakEl('div', 'dp-knoppen');
      el.nog = maakEl('button', 'knop dp-nog');
      el.nog.type = 'button';
      el.nogTekst = maakEl('span', '', 'Nog een keer');
      el.nog.append(opnieuwIcoon(), el.nogTekst);
      el.nog.addEventListener('click', nogEenKeer);
      const terug = maakEl('a', 'knop-secundair dp-terug');
      terug.href = vanSite('hub.html');
      terug.append(huisIcoon(), document.createTextNode('Naar de startpagina'));
      knoppen.append(el.nog, terug);

      el.hint = uitklap('dp-hint');
      el.hint.tekst.textContent = 'Nieuwe vragen uit dezelfde hoofdstukken. De groep gaat vanzelf mee.';
      el.makerWeg = uitklap('dp-hint');
      el.makerWeg.tekst.textContent = 'De maker is even niet online. Je kunt ook zelf een duel maken vanaf een vakpagina.';
      el.melding = uitklap('dp-melding', 'alert');

      blokActies.append(el.wacht, knoppen, el.hint, el.makerWeg, el.melding);
      nieuw.append(blokActies);

      const focus = !sectie && (!document.activeElement || document.activeElement === document.body || !document.contains(document.activeElement));
      if (sectie && sectie.parentNode) sectie.replaceWith(nieuw);
      else root.append(nieuw);
      sectie = nieuw;
      if (focus) { try { titel.focus({ preventScroll: true }); } catch {} }
    }

    function werkActiesBij() {
      if (!sectie || !staat) return;
      const kamer = staat.kamer;
      const benMaker = kamer.maker === staat.ik;
      el.nog.hidden = !benMaker;
      el.wacht.hidden = benMaker;
      if (!gevolgd) klap(el.hint, benMaker);
      const maker = (staat.deelnemers || []).find(d => d && d.speler === kamer.maker);
      klap(el.makerWeg, !benMaker && !gevolgd && (!maker || maker.online === false));
      if (gevolgd) {
        // De knop houdt zijn tekst (geen breedtesprong); de regel eronder of de wachtpil zegt waar het heen gaat.
        if (benMaker) {
          zetKnop('Nieuw duel maken…', true);
          wisselTekst(el.hint.tekst, ONDERWEG);
          klap(el.hint, true);
        } else wisselWacht(ONDERWEG);
        el.wacht.classList.add('is-onderweg');
      } else if (bezig) zetKnop('Nieuw duel maken…', true);
      else zetKnop('Nog een keer', false);
    }

    function toonMelding(tekst) {
      klap(el.melding, Boolean(tekst), tekst || '');
    }

    function volg(code) {
      if (gevolgd || !CODE.test(String(code || ''))) return;
      gevolgd = true;
      toonMelding('');
      werkActiesBij();
      later(() => {
        if (typeof acties.naar === 'function') acties.naar(code);
        else {
          const url = new URL(window.location.href);
          url.searchParams.set('c', code);
          window.location.href = url.href;
        }
      }, rustig() ? 0 : 450);
    }

    async function nogEenKeer() {
      if (bezig || gevolgd || !staat || staat.kamer.maker !== staat.ik) return;
      const code = staat.kamer.code || new URLSearchParams(window.location.search).get('c');
      bezig = true;
      toonMelding('');
      werkActiesBij();
      try {
        const vragen = await nieuweVragen(staat);
        if (gestopt || gevolgd) return;
        if (typeof acties.opnieuw !== 'function') throw { melding: FOUT_ANDERS };
        const antwoord = await acties.opnieuw(code, vragen);
        if (gestopt || gevolgd) return;
        if (antwoord && antwoord.ok && CODE.test(String(antwoord.code || ''))) { volg(antwoord.code); return; }
        toonMelding(FOUTEN[antwoord && antwoord.fout] || FOUT_ANDERS);
      } catch (fout) {
        if (!gestopt) toonMelding((fout && fout.melding) || FOUT_ANDERS);
      } finally {
        if (!gestopt) {
          bezig = false;
          werkActiesBij();
        }
      }
    }

    function toon(nieuweStaat) {
      if (gestopt || !nieuweStaat || !nieuweStaat.kamer) return;
      staat = nieuweStaat;
      const kamer = staat.kamer;
      const nieuweLijst = rangschik(staat.deelnemers);
      // Alleen opnieuw opbouwen als de uitslag zelf verandert; online-stippen en versies veranderen niets aan het podium.
      const sleutel = JSON.stringify([staat.ik, kamer.maker, kamer.aantal, nieuweLijst.map(d => [d.speler, d.punten, naamVan(d)])]);
      if (sleutel !== handtekening) {
        const eerste = !sectie;
        handtekening = sleutel;
        lijst = nieuweLijst;
        bouw(!eerste || rustig());
      }
      werkActiesBij();
      if (kamer.volgende_code) volg(kamer.volgende_code);
    }

    function weg() {
      gestopt = true;
      timers.forEach(clearTimeout);
      timers.clear();
      if (sectie) sectie.remove();
      sectie = null;
    }

    return { toon, weg };
  }

  BES.duelScherm.podium = { maak };
  // Voor tests: dezelfde rangschikking en vraagkeuze, zonder scherm.
  BES.duelScherm.podium.hulp = { rangschik, kopTekst, kiesVragen, naarDuelVraag };
})();
