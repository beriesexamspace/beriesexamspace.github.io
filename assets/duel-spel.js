/*
  Duel: het spelscherm (contract deel 4). Vraag, opties, de grote knop "Ik weet het!", de ring van 30 en 15 seconden,
  het slot voor wie niet mag, de onthulling en de stand.
  Registreert zich als BES.duelScherm.spel. duel.html roept toon(staat) aan bij elke wijziging; dit scherm vergelijkt
  zelf met de vorige stand en beweegt alleen wat veranderd is. De database beslist alles, dit scherm toont het alleen.
*/
(() => {
  'use strict';

  const BES = (window.BES = window.BES || {});
  BES.duelScherm = BES.duelScherm || {};

  const SCRIPT = (document.currentScript && document.currentScript.src) || '';
  const LETTERS = 'ABCDEF';
  const NS = 'http://www.w3.org/2000/svg';
  const STRAAL = 56;
  const OMTREK = 2 * Math.PI * STRAAL;

  const ICOON = {
    slot: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7"/></svg>',
    vink: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    kruis: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 7l10 10M17 7L7 17"/></svg>',
    pijl: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  const FOUTEN = {
    netwerk: 'Geen verbinding. Probeer het opnieuw.',
    geen_verbinding: 'Geen verbinding. Probeer het opnieuw.',
    al_geprobeerd: 'Je mag bij deze vraag niet meer.',
    al_bezet: 'Net te laat, iemand was eerst.',
    te_laat: 'Te laat, de tijd is om.',
    niet_jouw_beurt: 'Het is nu niet jouw beurt.',
    verkeerde_stand: 'Even geduld, het spel loopt al verder.',
    geen_deelnemer: 'Je doet niet mee in dit duel.',
    niet_ingelogd: 'Log opnieuw in om verder te spelen.',
    verlopen: 'Dit duel is verlopen.',
    bestaat_niet: 'Dit duel bestaat niet meer.',
    ongeldig: 'Dat lukte niet. Probeer het opnieuw.'
  };
  const foutTekst = fout => FOUTEN[fout] || 'Er ging iets mis. Probeer het opnieuw.';

  // Wat de knop toont en voorleest, per stand.
  const KNOP_LABEL = {
    druk: 'Ik weet het!',
    wacht: 'Even kijken',
    tijd: 'Kies je antwoord',
    slot: 'Op slot',
    goed: 'Goed beantwoord',
    fout: 'Fout beantwoord'
  };

  const minderBeweging = () => {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
  };

  // Tijden uit de database zijn ISO-tekst; de nep-database kan ook getallen geven.
  const tijdVan = waarde => {
    if (waarde == null || waarde === '') return null;
    if (typeof waarde === 'number') return Number.isFinite(waarde) ? waarde : null;
    const getal = Number(waarde);
    if (Number.isFinite(getal)) return getal;
    const datum = Date.parse(waarde);
    return Number.isFinite(datum) ? datum : null;
  };

  const maakEl = (tag, klasse, tekst) => {
    const el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (tekst != null) el.textContent = tekst;
    return el;
  };

  const zetTekst = (el, tekst) => { if (el.textContent !== tekst) el.textContent = tekst; };

  const herstart = (el, klasse) => {
    el.classList.remove(klasse);
    void el.offsetWidth;
    el.classList.add(klasse);
  };

  const trillen = patroon => {
    try { if (typeof navigator.vibrate === 'function') navigator.vibrate(patroon); } catch {}
  };

  // Laadt de stijl zelf als de pagina dat nog niet deed.
  const zorgVoorStijl = () => {
    if (document.querySelector('link[href*="duel-spel.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = SCRIPT ? new URL('duel-spel.css?v=1', SCRIPT).href : 'assets/duel-spel.css?v=1';
    document.head.appendChild(link);
  };

  // De tijden volgen de database: met ?test=duel&snel=1 deelt de nep-database alles door 15.
  const tijden = () => {
    const nep = BES.duelNep && BES.duelNep.tijden;
    if (nep && nep.open && nep.antwoord && nep.onthulling) return { open: nep.open, antwoord: nep.antwoord, onthulling: nep.onthulling };
    const zoek = new URLSearchParams(window.location.search);
    const deel = zoek.get('test') === 'duel' && zoek.get('snel') === '1' ? 15 : 1;
    return { open: 30000 / deel, antwoord: 15000 / deel, onthulling: 3000 / deel };
  };

  function maak(root, acties) {
    zorgVoorStijl();
    acties = acties || BES.duel || {};
    const DUUR = tijden();
    const DRINGEND = Math.min(5000, DUUR.antwoord / 3);
    const id = 'ds' + Math.random().toString(36).slice(2, 8);

    const nu = () => {
      try {
        const t = typeof acties.nu === 'function' ? Number(acties.nu()) : NaN;
        return Number.isFinite(t) ? t : Date.now();
      } catch {
        return Date.now();
      }
    };

    let levend = true;
    let staat = null;
    let af = null;
    let vraagSleutel = '';
    let optieKnoppen = [];
    let optiesEl = null;
    let uitlegBlok = null;
    let lus = 0;
    let laatsteSec = null;
    let wisselTimer = 0;
    let hoogteTimer = 0;
    let meldingTimer = 0;
    let drukTimer = 0;
    let laatstePointer = 0;

    // Wat dit toestel zelf bijhoudt per vraag.
    let gekozen = null;         // { nr, i }: mijn keuze, tot de database antwoordt
    let drukBezig = false;      // knop ingedrukt, wacht op de database
    let gelukteDrukNr = null;   // bij deze vraag won ik het drukken al
    let teLaatNr = null;        // bij deze vraag was iemand me net voor
    let volgendeBezig = false;
    let uitlegNr = null;
    let melding = null;         // { tekst, tot }

    const timers = new Set();
    const later = (doe, ms) => {
      const t = window.setTimeout(() => { timers.delete(t); if (levend) doe(); }, ms);
      timers.add(t);
      return t;
    };
    const wisTimer = t => { if (t) { window.clearTimeout(t); timers.delete(t); } };

    // ---------- opbouw ----------

    const scherm = maakEl('div', 'ds');

    const kop = maakEl('div', 'ds-kop');
    const teller = maakEl('p', 'ds-teller');
    const tellerTekst = maakEl('span', 'ds-teller-tekst');
    const tellerNr = maakEl('b', null, '1');
    const tellerVan = maakEl('span', 'ds-van', 'van 1');
    tellerTekst.append('Vraag ', tellerNr, ' ', tellerVan);
    teller.append(tellerTekst);
    const mijn = maakEl('p', 'ds-mijn');
    const mijnRol = maakRol(0);
    mijn.append(maakEl('span', null, 'Jouw punten'), mijnRol);
    const balk = maakEl('div', 'ds-balk');
    balk.setAttribute('aria-hidden', 'true');
    const balkVul = maakEl('span');
    balk.append(balkVul);
    kop.append(teller, mijn, balk);

    const lijf = maakEl('div', 'ds-lijf');
    const veld = maakEl('div', 'ds-veld');
    const vraagvak = maakEl('div', 'ds-vraagvak');
    let vraagblok = maakEl('div', 'ds-vraagblok');
    vraagvak.append(vraagblok);

    const dok = maakEl('div', 'ds-dok');
    const status = maakEl('div', 'ds-status');
    const statusTitel = maakEl('p', 'ds-status-titel');
    const statusSub = maakEl('p', 'ds-status-sub');
    status.append(statusTitel, statusSub);

    const knopvak = maakEl('div', 'ds-knopvak');
    const ring = document.createElementNS(NS, 'svg');
    ring.setAttribute('class', 'ds-ring');
    ring.setAttribute('viewBox', '0 0 120 120');
    ring.setAttribute('aria-hidden', 'true');
    ring.setAttribute('focusable', 'false');
    const spoor = document.createElementNS(NS, 'circle');
    const boog = document.createElementNS(NS, 'circle');
    [spoor, boog].forEach(c => { c.setAttribute('cx', '60'); c.setAttribute('cy', '60'); c.setAttribute('r', String(STRAAL)); });
    spoor.setAttribute('class', 'ds-ring-spoor');
    boog.setAttribute('class', 'ds-ring-boog');
    boog.setAttribute('stroke-dasharray', OMTREK.toFixed(2));
    boog.style.strokeDashoffset = '0';
    ring.append(spoor, boog);

    const buzzer = maakEl('button', 'ds-buzzer');
    buzzer.type = 'button';
    buzzer.dataset.g = 'wacht';
    buzzer.setAttribute('aria-disabled', 'true');
    buzzer.setAttribute('aria-label', KNOP_LABEL.wacht);
    buzzer.setAttribute('aria-keyshortcuts', 'Space');
    const gezicht = naam => { const g = maakEl('span', 'ds-gezicht ds-g-' + naam); g.dataset.gezicht = naam; g.setAttribute('aria-hidden', 'true'); return g; };
    const gDruk = gezicht('druk');
    gDruk.textContent = 'Ik weet het!';
    const gWacht = gezicht('wacht');
    gWacht.innerHTML = '<span class="ds-puntjes"><i></i><i></i><i></i></span>';
    const gTijd = gezicht('tijd');
    const tijdGetal = maakEl('b', null, '15');
    gTijd.append(tijdGetal, maakEl('small', null, 'Kies!'));
    const gSlot = gezicht('slot');
    gSlot.innerHTML = ICOON.slot;
    gSlot.append(maakEl('small', null, 'Op slot'));
    const gGoed = gezicht('goed');
    gGoed.innerHTML = ICOON.vink;
    const gFout = gezicht('fout');
    gFout.innerHTML = ICOON.kruis;
    buzzer.append(gDruk, gWacht, gTijd, gSlot, gGoed, gFout);

    const volgendeKnop = maakEl('button', 'ds-volgende');
    volgendeKnop.type = 'button';
    const volgendeTekst = maakEl('span', 'ds-volgende-tekst', 'Volgende vraag');
    const volgendePijl = maakEl('span', 'ds-volgende-pijl');
    volgendePijl.innerHTML = ICOON.pijl;
    volgendeKnop.append(volgendeTekst, volgendePijl);

    knopvak.append(ring, buzzer, volgendeKnop);
    dok.append(status, knopvak);
    veld.append(vraagvak, dok);

    const stand = maakEl('aside', 'ds-stand');
    stand.setAttribute('aria-labelledby', id + '-stand');
    const standKop = maakEl('h2', 'ds-stand-kop');
    standKop.id = id + '-stand';
    const standTeller = maakEl('span', null, '');
    standKop.append(maakEl('span', 'ds-stand-titel', 'Stand'), standTeller);
    const standLijst = maakEl('ol', 'ds-stand-lijst');
    stand.append(standKop, standLijst);
    lijf.append(veld, stand);

    // Voorlezen: rustig bij een nieuwe vraag, meteen bij drukken en bij de uitkomst.
    const meldRustig = maakEl('p', 'ds-sr');
    meldRustig.setAttribute('role', 'status');
    meldRustig.setAttribute('aria-live', 'polite');
    const meldMeteen = maakEl('p', 'ds-sr');
    meldMeteen.setAttribute('aria-live', 'assertive');
    meldMeteen.setAttribute('aria-atomic', 'true');

    scherm.append(kop, lijf, meldRustig, meldMeteen);
    root.append(scherm);

    // ---------- kleine hulpjes ----------

    // Getal dat omhoog rolt als het verandert (punten).
    function maakRol(start) {
      const rol = maakEl('span', 'ds-rol');
      rol.append(maakEl('span', null, String(start)));
      rol.dataset.waarde = String(start);
      return rol;
    }
    function zetRol(rol, waarde) {
      if (rol.dataset.waarde === String(waarde)) return;
      rol.dataset.waarde = String(waarde);
      if (minderBeweging()) { rol.replaceChildren(maakEl('span', null, String(waarde))); return; }
      [...rol.children].forEach(oud => {
        if (oud.classList.contains('is-uit')) return;
        oud.className = 'is-uit';
        oud.setAttribute('aria-hidden', 'true');
        later(() => oud.remove(), 420);
      });
      rol.append(maakEl('span', 'is-in', String(waarde)));
    }

    // Hoogte vloeiend laten meegroeien of krimpen bij een wijziging binnen een blok.
    function animeerHoogte(doos, wijzig) {
      if (minderBeweging() || wisselTimer) { wijzig(); return; }
      const van = doos.getBoundingClientRect().height;
      wijzig();
      doos.style.height = '';
      const naar = doos.getBoundingClientRect().height;
      if (Math.abs(naar - van) < 1) return;
      doos.classList.add('is-wissel');
      doos.style.height = van + 'px';
      void doos.offsetHeight;
      doos.style.height = naar + 'px';
      wisTimer(hoogteTimer);
      hoogteTimer = later(() => { hoogteTimer = 0; doos.style.height = ''; doos.classList.remove('is-wissel'); }, 340);
    }

    function zeg(regio, tekst) {
      regio.textContent = '';
      later(() => { regio.textContent = tekst; }, 80);
    }

    function toonMelding(tekst) {
      melding = { tekst, tot: Date.now() + 3500 };
      wisTimer(meldingTimer);
      meldingTimer = later(() => { meldingTimer = 0; melding = null; teken(); }, 3600);
      teken();
    }

    // ---------- de stand begrijpen ----------

    function afleiden(s) {
      const k = s.kamer || {};
      const ik = s.ik;
      const nr = Number(k.vraag_nr) || 0;
      const aantal = Number(k.aantal) || 0;
      const namen = new Map((s.deelnemers || []).map(d => [d.speler, d.naam || 'Speler']));
      const pogingen = (s.pogingen || []).filter(p => Number(p.nr) === nr);
      const geprobeerd = pogingen.some(p => p.speler === ik);
      let st = 'leeg';
      if (k.status === 'open') st = geprobeerd ? 'open-slot' : 'open';
      else if (k.status === 'antwoord') st = k.drukker === ik ? 'antwoord-ik' : 'antwoord-ander';
      else if (k.status === 'onthulling') st = k.uitkomst === 'goed' ? 'goed' : k.uitkomst === 'iedereen_fout' ? 'iedereen-fout' : 'niemand';
      const vragen = s.vragen || {};
      const vraag = vragen[nr] || vragen[String(nr)] || null;
      const winnaar = (pogingen.find(p => p.goed) || {}).speler || k.drukker || null;
      const juist = k.juist == null || k.juist === '' ? null : Number(k.juist);
      return {
        st, nr, aantal, ik, namen, pogingen, geprobeerd, vraag, winnaar,
        code: k.code,
        drukker: k.drukker || null,
        juist: Number.isInteger(juist) ? juist : null,
        openSinds: tijdVan(k.open_sinds),
        deadline: tijdVan(k.deadline),
        onthuldOp: tijdVan(k.onthuld_op),
        laatste: aantal > 0 && nr >= aantal
      };
    }

    const naamVan = (a, speler) => (speler === a.ik ? 'Jij' : a.namen.get(speler) || 'Iemand');
    const onthuld = a => a.st === 'goed' || a.st === 'iedereen-fout' || a.st === 'niemand';

    function klokVan(a) {
      if (a.st === 'open' || a.st === 'open-slot') return a.openSinds == null ? null : { eind: a.openSinds + DUUR.open, duur: DUUR.open, soort: 'open' };
      if (a.st === 'antwoord-ik' || a.st === 'antwoord-ander') return a.deadline == null ? null : { eind: a.deadline, duur: DUUR.antwoord, soort: 'antwoord' };
      if (a.st === 'goed' || a.st === 'iedereen-fout') return a.onthuldOp == null ? null : { eind: a.onthuldOp + DUUR.onthulling, duur: DUUR.onthulling, soort: 'onthulling' };
      return null;
    }

    // ---------- de vraag ----------

    function bouwVraag(a) {
      const blok = maakEl('div', 'ds-vraagblok');
      optieKnoppen = [];
      optiesEl = null;
      uitlegBlok = null;
      if (!a.vraag) {
        const laden = maakEl('h2', 'ds-vraag is-laden', 'Vraag laden…');
        blok.append(laden);
        return blok;
      }
      const titel = maakEl('h2', 'ds-vraag', String(a.vraag.vraag || ''));
      titel.id = id + '-vraag-' + a.nr;
      const opties = maakEl('div', 'ds-opties');
      opties.setAttribute('role', 'group');
      opties.setAttribute('aria-labelledby', titel.id);
      const lijst = Array.isArray(a.vraag.opties) ? a.vraag.opties.slice(0, LETTERS.length) : [];
      if (lijst.length % 2 === 0 && lijst.every(o => String(o).length <= 60)) opties.classList.add('is-raster');
      optieKnoppen = lijst.map((tekst, i) => {
        const knop = maakEl('button', 'ds-optie');
        knop.type = 'button';
        knop.disabled = true;
        knop.style.setProperty('--i', String(i));
        knop.setAttribute('aria-keyshortcuts', LETTERS[i]);
        const letter = maakEl('span', 'ds-letter');
        letter.setAttribute('aria-hidden', 'true');
        letter.append(maakEl('span', 'ds-letter-a', LETTERS[i]));
        letter.insertAdjacentHTML('beforeend', ICOON.vink.replace('<svg ', '<svg class="ds-letter-goed" ') + ICOON.kruis.replace('<svg ', '<svg class="ds-letter-fout" '));
        const optieTekst = maakEl('span', 'ds-optie-tekst', String(tekst));
        const wie = maakEl('span', 'ds-optie-wie');
        knop.append(letter, maakEl('span', 'ds-sr', LETTERS[i] + '. '), optieTekst, maakEl('span', 'ds-sr ds-optie-sr'), wie);
        knop.addEventListener('click', () => kiezen(i));
        return knop;
      });
      opties.append(...optieKnoppen);
      optiesEl = opties;
      const uitleg = maakEl('div', 'ds-uitleg');
      uitleg.hidden = true;
      uitleg.append(maakEl('h3', null, 'Uitleg'), maakEl('p'));
      uitlegBlok = uitleg;
      blok.append(titel, opties, uitleg);
      return blok;
    }

    // Oude vraag vervaagt, het vak schuift in hoogte mee, de nieuwe komt rustig op.
    function wisselNaar(nieuw) {
      wisTimer(wisselTimer);
      wisselTimer = 0;
      wisTimer(hoogteTimer);
      hoogteTimer = 0;
      const oud = vraagblok;
      vraagblok = nieuw;
      if (minderBeweging() || !oud || !oud.isConnected || !scherm.isConnected) {
        vraagvak.style.height = '';
        vraagvak.classList.remove('is-wissel');
        vraagvak.replaceChildren(nieuw);
        return;
      }
      const van = vraagvak.getBoundingClientRect().height;
      vraagvak.style.height = van + 'px';
      vraagvak.classList.add('is-wissel');
      oud.classList.remove('is-in');
      oud.classList.add('is-uit');
      wisselTimer = later(() => {
        vraagvak.replaceChildren(nieuw);
        vraagvak.style.height = '';
        const naar = vraagvak.getBoundingClientRect().height;
        vraagvak.style.height = van + 'px';
        void vraagvak.offsetHeight;
        vraagvak.style.height = naar + 'px';
        nieuw.classList.add('is-in');
        wisselTimer = later(() => {
          wisselTimer = 0;
          vraagvak.style.height = '';
          vraagvak.classList.remove('is-wissel');
        }, 360);
      }, 180);
    }

    function tekenVraag(a) {
      const sleutel = a.nr + '|' + (a.vraag ? 'v' : '-');
      if (sleutel === vraagSleutel) return;
      const eerste = !vraagSleutel;
      vraagSleutel = sleutel;
      const nieuw = bouwVraag(a);
      if (eerste) {
        vraagvak.replaceChildren(nieuw);
        vraagblok = nieuw;
        return;
      }
      wisselNaar(nieuw);
    }

    function tekenOpties(a) {
      const juist = onthuld(a) ? a.juist : null;
      const fout = new Map();
      const goed = new Map();
      a.pogingen.forEach(p => {
        if (p.keuze == null) return;
        const i = Number(p.keuze);
        const lijst = p.goed ? goed : fout;
        if (!lijst.has(i)) lijst.set(i, []);
        lijst.get(i).push(p.speler === a.ik ? 'jij' : a.namen.get(p.speler) || 'iemand');
      });
      const mijnBeurt = a.st === 'antwoord-ik' && !gekozen;
      optieKnoppen.forEach((knop, i) => {
        knop.disabled = !mijnBeurt;
        knop.classList.toggle('is-klikbaar', mijnBeurt);
        knop.classList.toggle('is-gekozen', !!gekozen && gekozen.i === i && juist == null && !fout.has(i));
        knop.classList.toggle('is-goed', juist === i || goed.has(i));
        knop.classList.toggle('is-fout', fout.has(i) && juist !== i);
        const wie = knop.querySelector('.ds-optie-wie');
        const wieTekst = fout.has(i) ? 'Fout: ' + fout.get(i).join(', ') : goed.has(i) ? 'Goed: ' + goed.get(i).join(', ') : '';
        if (wie.textContent !== wieTekst) {
          wie.textContent = wieTekst;
          if (wieTekst) herstart(wie, 'is-nieuw');
        }
        wie.classList.toggle('is-goed', !fout.has(i) && goed.has(i));
        zetTekst(knop.querySelector('.ds-optie-sr'), juist === i ? ', juist antwoord' : fout.has(i) ? ', fout' : '');
      });
      if (optiesEl) optiesEl.classList.toggle('is-beurt', mijnBeurt);
    }

    // Uitleg alleen als het scherm blijft staan (niemand drukte), anders is hij weg voor je hem kunt lezen.
    function haalUitleg(a) {
      if (a.st !== 'niemand' || uitlegNr === a.nr || typeof acties.uitleg !== 'function' || !uitlegBlok) return;
      uitlegNr = a.nr;
      const nr = a.nr;
      const blok = uitlegBlok;
      Promise.resolve()
        .then(() => acties.uitleg(a.code, nr))
        .then(antwoord => {
          if (!levend || !af || af.nr !== nr || af.st !== 'niemand' || blok !== uitlegBlok) return;
          const tekst = antwoord && antwoord.ok && antwoord.uitleg ? String(antwoord.uitleg).trim() : '';
          if (!tekst) return;
          animeerHoogte(vraagvak, () => {
            blok.querySelector('p').textContent = tekst;
            blok.hidden = false;
          });
        })
        .catch(() => {});
    }

    // ---------- kop ----------

    function tekenKop(a, vorige) {
      if (!vorige || vorige.nr !== a.nr || vorige.aantal !== a.aantal) {
        zetTekst(tellerNr, String(a.nr || 1));
        zetTekst(tellerVan, 'van ' + (a.aantal || a.nr || 1));
        if (vorige && vorige.nr !== a.nr) herstart(tellerTekst, 'is-nieuw');
        balkVul.style.width = a.aantal ? Math.min(100, Math.max(0, (a.nr / a.aantal) * 100)) + '%' : '0%';
      }
      const ikZelf = (staat.deelnemers || []).find(d => d.speler === a.ik);
      zetRol(mijnRol, ikZelf ? Number(ikZelf.punten) || 0 : 0);
    }

    // ---------- de knop en de tekst ernaast ----------

    function titelVan(a) {
      switch (a.st) {
        case 'open': return drukBezig ? 'Even kijken…' : 'Weet jij het?';
        case 'open-slot': return 'Je mag bij deze vraag niet meer';
        case 'antwoord-ik': return 'Kies je antwoord';
        case 'antwoord-ander': return naamVan(a, a.drukker) + ' antwoordt…';
        case 'goed': return a.winnaar === a.ik ? 'Goed zo, jij had het!' : naamVan(a, a.winnaar) + ' had het goed';
        case 'iedereen-fout': return 'Niemand had het goed';
        // Drukte er wel iemand (fout of tijd op) en bleef de rest weg, dan klopt "niemand drukte" niet.
        case 'niemand': return a.pogingen.length ? 'Tijd om. Niemand had het goed.' : 'Tijd om. Niemand drukte.';
        default: return 'Even geduld…';
      }
    }

    function subVan(a, sec, rest) {
      if (melding && melding.tot > Date.now()) return { tekst: melding.tekst, sleutel: 'melding:' + melding.tekst, melding: true };
      const klaar = rest <= 0;
      switch (a.st) {
        case 'open':
          if (drukBezig) return { tekst: 'Wie was het eerst?', sleutel: 'open-druk' };
          return klaar ? { tekst: 'De tijd is om.', sleutel: 'open-0' } : { tekst: `Druk op de knop. Nog\u00a0${sec}\u00a0s.`, sleutel: 'open', dringend: rest <= DRINGEND };
        case 'open-slot':
          return klaar ? { tekst: 'De tijd is om.', sleutel: 'slot-0' } : { tekst: `De anderen hebben nog\u00a0${sec}\u00a0s.`, sleutel: 'slot' };
        case 'antwoord-ik':
          return klaar ? { tekst: 'De tijd is om.', sleutel: 'ik-0' } : { tekst: `Nog\u00a0${sec}\u00a0s. Tik op een antwoord.`, sleutel: 'ik', dringend: rest <= DRINGEND };
        case 'antwoord-ander':
          if (teLaatNr === a.nr) return { tekst: `Net te laat, ${naamVan(a, a.drukker)} was eerst.`, sleutel: 'te-laat' };
          if (a.geprobeerd) return { tekst: 'Je mag bij deze vraag niet meer.', sleutel: 'ander-slot' };
          return klaar ? { tekst: 'De tijd is om.', sleutel: 'ander-0' } : { tekst: `Nog\u00a0${sec}\u00a0s om te kiezen.`, sleutel: 'ander' };
        case 'goed':
          return { tekst: a.laatste ? 'De uitslag komt eraan.' : 'De volgende vraag komt eraan.', sleutel: 'goed' };
        case 'iedereen-fout':
          return { tekst: 'Het juiste antwoord staat in het groen.', sleutel: 'iedereen-fout' };
        case 'niemand':
          return { tekst: 'Het juiste antwoord staat in het groen.', sleutel: 'niemand' };
        default:
          return { tekst: '', sleutel: 'leeg' };
      }
    }

    function schrijfTitel(tekst) {
      if (statusTitel.textContent === tekst) return;
      statusTitel.textContent = tekst;
      herstart(statusTitel, 'is-nieuw');
    }

    function schrijfSub(a, sec, rest) {
      const sub = subVan(a, sec, rest);
      const oudeSleutel = statusSub.dataset.sleutel;
      zetTekst(statusSub, sub.tekst);
      statusSub.classList.toggle('is-dringend', !!sub.dringend);
      statusSub.classList.toggle('is-melding', !!sub.melding);
      if (oudeSleutel !== sub.sleutel) {
        statusSub.dataset.sleutel = sub.sleutel;
        if (oudeSleutel !== undefined) herstart(statusSub, 'is-nieuw');
      }
      zetTekst(tijdGetal, String(Math.max(0, sec)));
    }

    function tekenDok(a) {
      veld.dataset.stand = a.st;
      veld.classList.toggle('is-rood', a.st === 'niemand');
      knopvak.classList.toggle('is-volgende', a.st === 'niemand');

      let g = 'wacht';
      if (a.st === 'open') g = drukBezig ? 'wacht' : 'druk';
      else if (a.st === 'open-slot' || a.st === 'antwoord-ander') g = 'slot';
      else if (a.st === 'antwoord-ik') g = 'tijd';
      else if (a.st === 'goed') g = 'goed';
      else if (a.st === 'iedereen-fout' || a.st === 'niemand') g = 'fout';
      if (buzzer.dataset.g !== g) {
        buzzer.dataset.g = g;
        buzzer.setAttribute('aria-label', KNOP_LABEL[g]);
      }
      buzzer.setAttribute('aria-disabled', g === 'druk' ? 'false' : 'true');
      buzzer.title = g === 'druk' ? 'Ik weet het! (spatiebalk)' : '';
      buzzer.inert = a.st === 'niemand';
      volgendeKnop.inert = a.st !== 'niemand';

      ring.classList.toggle('is-goed', a.st === 'goed');
      ring.classList.toggle('is-fout', a.st === 'iedereen-fout');
      ring.classList.toggle('is-slot', a.st === 'open-slot' || a.st === 'antwoord-ander');
      ring.classList.toggle('is-uit', a.st === 'niemand' || a.st === 'leeg');

      volgendeKnop.setAttribute('aria-disabled', volgendeBezig ? 'true' : 'false');
      zetTekst(volgendeTekst, volgendeBezig ? 'Even geduld…' : a.laatste ? 'Naar de uitslag' : 'Volgende vraag');

      schrijfTitel(titelVan(a));
      const kl = klokVan(a);
      const rest = kl ? Math.max(0, kl.eind - nu()) : 0;
      laatsteSec = Math.ceil(rest / 1000);
      schrijfSub(a, laatsteSec, rest);
    }

    // ---------- de ring ----------

    function startLus() {
      if (!lus && levend) lus = window.requestAnimationFrame(tik);
    }

    function tik() {
      lus = 0;
      if (!levend || !af) return;
      const kl = klokVan(af);
      let rest = 0;
      let deel = 0;
      if (kl) {
        rest = Math.max(0, kl.eind - nu());
        deel = Math.min(1, rest / kl.duur);
        // Minder beweging: de ring loopt per seconde, niet vloeiend.
        if (minderBeweging()) deel = Math.min(1, (Math.ceil(rest / 1000) * 1000) / kl.duur);
      }
      boog.style.strokeDashoffset = (OMTREK * (1 - deel)).toFixed(2);
      ring.classList.toggle('is-leeg', deel <= 0.002);
      ring.classList.toggle('is-dringend', !!kl && kl.soort !== 'onthulling' && rest > 0 && rest <= DRINGEND);
      const sec = Math.ceil(rest / 1000);
      if (sec !== laatsteSec) {
        laatsteSec = sec;
        schrijfSub(af, sec, rest);
      }
      if (kl && rest > 0) lus = window.requestAnimationFrame(tik);
    }

    // ---------- stand ----------

    const rijen = new Map();

    function maakRij(d) {
      const li = maakEl('li', 'ds-speler');
      const srPlek = maakEl('span', 'ds-sr');
      const plek = maakEl('span', 'ds-plek');
      plek.setAttribute('aria-hidden', 'true');
      const stip = maakEl('span', 'ds-stip');
      stip.setAttribute('aria-hidden', 'true');
      const naam = maakEl('span', 'ds-naam');
      const online = maakEl('span', 'ds-sr');
      const chip = maakEl('span', 'ds-chip');
      const punten = maakEl('span', 'ds-punten');
      const rol = maakRol(Number(d.punten) || 0);
      punten.append(rol, maakEl('span', 'ds-sr', ' punten'));
      li.append(srPlek, plek, stip, naam, online, chip, punten);
      return { li, srPlek, plek, naam, online, chip, rol, waarde: Number(d.punten) || 0, naamSleutel: '' };
    }

    function plusje(rij, n) {
      const plus = maakEl('span', 'ds-plus', '+' + n);
      plus.setAttribute('aria-hidden', 'true');
      rij.li.append(plus);
      later(() => plus.remove(), 1300);
    }

    function tekenStand(a) {
      const lijst = (staat.deelnemers || []).slice().sort((x, y) =>
        (Number(y.punten) || 0) - (Number(x.punten) || 0) || String(x.naam || '').localeCompare(String(y.naam || ''), 'nl'));
      const beweeg = !minderBeweging() && rijen.size > 0 && scherm.isConnected;
      const voor = new Map();
      if (beweeg) rijen.forEach((rij, speler) => voor.set(speler, rij.li.getBoundingClientRect().top));
      const gezien = new Set();
      let plek = 0;
      let vorigePunten = null;
      lijst.forEach((d, i) => {
        const punten = Number(d.punten) || 0;
        if (punten !== vorigePunten) { plek = i + 1; vorigePunten = punten; }
        let rij = rijen.get(d.speler);
        if (!rij) { rij = maakRij(d); rijen.set(d.speler, rij); }
        gezien.add(d.speler);
        zetTekst(rij.plek, String(plek));
        zetTekst(rij.srPlek, `Plek ${plek}: `);
        const ik = d.speler === a.ik;
        const naamSleutel = (d.naam || 'Speler') + (ik ? '|ik' : '');
        if (rij.naamSleutel !== naamSleutel) {
          rij.naamSleutel = naamSleutel;
          rij.naam.textContent = d.naam || 'Speler';
          if (ik) rij.naam.append(maakEl('small', null, ' (jij)'));
        }
        rij.li.classList.toggle('is-ik', ik);
        rij.li.classList.toggle('is-online', !!d.online);
        zetTekst(rij.online, d.online ? ', online' : ', even weg');

        const poging = a.pogingen.find(p => p.speler === d.speler);
        let chip = '';
        let soort = '';
        if ((a.st === 'antwoord-ik' || a.st === 'antwoord-ander') && a.drukker === d.speler) { chip = 'drukt'; soort = 'is-drukt'; }
        else if (poging && poging.goed) { chip = 'goed'; soort = 'is-goed'; }
        else if (poging) { chip = poging.keuze == null ? 'tijd op' : 'fout'; soort = 'is-fout'; }
        if (rij.chip.textContent !== chip) {
          rij.chip.textContent = chip;
          rij.chip.className = 'ds-chip ' + soort;
          if (chip) herstart(rij.chip, 'is-nieuw');
        }
        rij.li.classList.toggle('is-drukker', chip === 'drukt');

        if (punten !== rij.waarde) {
          const erbij = punten - rij.waarde;
          rij.waarde = punten;
          zetRol(rij.rol, punten);
          if (erbij > 0 && !minderBeweging()) { plusje(rij, erbij); herstart(rij.li, 'is-flits'); }
        }
        if (standLijst.children[i] !== rij.li) standLijst.insertBefore(rij.li, standLijst.children[i] || null);
      });
      rijen.forEach((rij, speler) => { if (!gezien.has(speler)) { rij.li.remove(); rijen.delete(speler); } });
      // Wie stijgt of zakt, schuift vloeiend naar zijn nieuwe plek.
      if (beweeg) {
        rijen.forEach((rij, speler) => {
          const top = voor.get(speler);
          if (top == null) return;
          const dy = top - rij.li.getBoundingClientRect().top;
          if (Math.abs(dy) < 1) return;
          // Wie stijgt, schuift boven de anderen langs (anders verdwijnt hij even achter de rij die zakt).
          rij.li.style.zIndex = dy > 0 ? '1' : '';
          if (dy > 0) later(() => { rij.li.style.zIndex = ''; }, 460);
          rij.li.style.transition = 'none';
          rij.li.style.transform = `translateY(${dy}px)`;
          void rij.li.offsetWidth;
          rij.li.style.transition = '';
          rij.li.style.transform = '';
        });
      }
      zetTekst(standTeller, lijst.length === 1 ? '1 speler' : `${lijst.length} spelers`);
    }

    // ---------- voorlezen ----------

    function juistZin(a) {
      if (a.juist == null || !a.vraag || !Array.isArray(a.vraag.opties)) return '';
      const optie = a.vraag.opties[a.juist];
      return optie == null ? '' : ` Het juiste antwoord is ${LETTERS[a.juist]}: ${optie}.`;
    }

    function aankondigen(a, vorige) {
      if (!vorige || vorige.nr !== a.nr) {
        zeg(meldRustig, `Vraag ${a.nr} van ${a.aantal}.`);
        meldMeteen.textContent = '';
      }
      if (vorige && vorige.nr === a.nr && vorige.st === a.st) return;
      let tekst = '';
      switch (a.st) {
        case 'antwoord-ik':
          tekst = `Jij mag antwoorden. Je hebt ${Math.round(DUUR.antwoord / 1000)} seconden. Kies met de letters A tot ${LETTERS[Math.max(0, optieKnoppen.length - 1)] || 'D'}.`;
          break;
        case 'antwoord-ander':
          tekst = (teLaatNr === a.nr ? 'Net te laat. ' : '') + `${naamVan(a, a.drukker)} antwoordt.`;
          break;
        case 'open':
        case 'open-slot':
          if (vorige && vorige.nr === a.nr && (vorige.st === 'antwoord-ik' || vorige.st === 'antwoord-ander')) {
            const poging = a.pogingen.find(p => p.speler === vorige.drukker);
            const tijdOp = poging && poging.keuze == null;
            if (vorige.drukker === a.ik) tekst = tijdOp ? 'Je tijd is om.' : 'Fout.';
            else tekst = tijdOp ? `De tijd van ${naamVan(a, vorige.drukker)} is om.` : `${naamVan(a, vorige.drukker)} had het fout.`;
            tekst +=
              (a.st === 'open' ? ' De knop is weer open.' : ' Je mag bij deze vraag niet meer.');
          }
          break;
        case 'goed':
          tekst = `${naamVan(a, a.winnaar)} had het goed en krijgt een punt.` + juistZin(a);
          break;
        case 'iedereen-fout':
          tekst = 'Niemand had het goed.' + juistZin(a);
          break;
        case 'niemand':
          tekst = (a.pogingen.length ? 'Tijd om, niemand had het goed.' : 'Tijd om, niemand drukte.') + juistZin(a) + (a.laatste ? ' Kies Naar de uitslag om verder te gaan.' : ' Kies Volgende vraag om verder te gaan.');
          break;
        default:
          break;
      }
      if (tekst) zeg(meldMeteen, tekst);
    }

    // Toetsenbord: wie met de knop werkt, landt na het drukken op de eerste optie en daarna weer op de knop.
    function focusBeheer(a, vorige, actief) {
      if (a.st === 'antwoord-ik' && (!vorige || vorige.st !== 'antwoord-ik')) {
        if (actief === buzzer && optieKnoppen[0]) optieKnoppen[0].focus({ preventScroll: true });
      } else if (a.st === 'niemand' && actief === buzzer) {
        volgendeKnop.focus({ preventScroll: true });
      } else if (a.st !== 'niemand' && actief === volgendeKnop) {
        buzzer.focus({ preventScroll: true });
      }
    }

    // ---------- alles tekenen ----------

    function teken() {
      if (!levend || !staat || !staat.kamer) return;
      const vorige = af;
      const a = afleiden(staat);
      const actief = document.activeElement;
      af = a;

      if (!vorige || vorige.nr !== a.nr) {
        gekozen = null;
        drukBezig = false;
        gelukteDrukNr = null;
        teLaatNr = null;
        volgendeBezig = false;
        uitlegNr = null;
        wisTimer(drukTimer);
      }
      if (vorige && vorige.st !== a.st) {
        if (a.st !== 'open') { drukBezig = false; wisTimer(drukTimer); }
        if (a.st !== 'niemand') volgendeBezig = false;
        if (a.st === 'open' || a.st === 'open-slot') teLaatNr = null;
      }
      if (a.st !== 'antwoord-ik') gekozen = null;

      tekenKop(a, vorige);
      tekenVraag(a);
      tekenOpties(a);
      tekenDok(a);
      tekenStand(a);
      aankondigen(a, vorige);
      focusBeheer(a, vorige, actief);
      haalUitleg(a);
      startLus();
    }

    // ---------- drukken, kiezen, verder ----------

    async function drukken() {
      if (!af || af.st !== 'open' || drukBezig || gelukteDrukNr === af.nr) return;
      const nr = af.nr;
      const code = af.code;
      drukBezig = true;
      herstart(knopvak, 'is-gedrukt');
      trillen(30);
      // Vangnet: blijft de nieuwe stand uit, dan komt de knop na 4 seconden terug.
      wisTimer(drukTimer);
      drukTimer = later(() => { drukTimer = 0; if (drukBezig) { drukBezig = false; teken(); } }, 4000);
      teken();
      let antwoord;
      try { antwoord = await acties.druk(code, nr); } catch { antwoord = { ok: false, fout: 'netwerk' }; }
      if (!levend || !af || af.nr !== nr) return;
      if (antwoord && antwoord.ok && antwoord.gelukt) {
        gelukteDrukNr = nr;
        trillen([40, 40, 60]);
      } else {
        drukBezig = false;
        wisTimer(drukTimer);
        if ((antwoord && antwoord.ok && antwoord.gelukt === false) || (antwoord && antwoord.fout === 'al_bezet')) teLaatNr = nr;
        else if (antwoord && antwoord.fout === 'verkeerde_stand' && af.st !== 'open') { /* het spel liep al verder */ }
        else toonMelding(foutTekst(antwoord && antwoord.fout));
      }
      teken();
    }

    async function kiezen(i) {
      if (!af || af.st !== 'antwoord-ik' || gekozen || !optieKnoppen[i]) return;
      const nr = af.nr;
      const code = af.code;
      const hadFocus = document.activeElement && document.activeElement.classList && document.activeElement.classList.contains('ds-optie');
      gekozen = { nr, i };
      trillen(20);
      teken();
      if (hadFocus) buzzer.focus({ preventScroll: true });
      let antwoord;
      try { antwoord = await acties.antwoord(code, nr, i); } catch { antwoord = { ok: false, fout: 'netwerk' }; }
      if (!levend || !af || af.nr !== nr) return;
      if (!antwoord || !antwoord.ok) {
        // Bij een netwerkfout mag je opnieuw kiezen zolang de tijd loopt.
        if (af.st === 'antwoord-ik' && (!antwoord || ['netwerk', 'geen_verbinding', 'ongeldig'].includes(antwoord.fout))) gekozen = null;
        toonMelding(foutTekst(antwoord && antwoord.fout));
      }
    }

    async function volgende() {
      if (!af || af.st !== 'niemand' || volgendeBezig) return;
      const nr = af.nr;
      volgendeBezig = true;
      teken();
      let antwoord;
      try { antwoord = await acties.volgende(af.code, nr); } catch { antwoord = { ok: false, fout: 'netwerk' }; }
      if (!levend || !af || af.nr !== nr || af.st !== 'niemand') return;
      if (!antwoord || (!antwoord.ok && antwoord.fout !== 'verkeerde_stand')) {
        volgendeBezig = false;
        toonMelding(foutTekst(antwoord && antwoord.fout));
      }
    }

    // De knop reageert al bij het neerdrukken: bij een gameshow telt elke honderdste.
    const loslaten = () => buzzer.classList.remove('is-ingedrukt');
    buzzer.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (buzzer.dataset.g !== 'druk') return;
      laatstePointer = performance.now();
      buzzer.classList.add('is-ingedrukt');
      drukken();
    });
    buzzer.addEventListener('pointerup', loslaten);
    buzzer.addEventListener('pointercancel', loslaten);
    buzzer.addEventListener('pointerleave', loslaten);
    buzzer.addEventListener('click', () => {
      if (performance.now() - laatstePointer < 800) return;
      if (buzzer.dataset.g !== 'druk') return;
      buzzer.classList.add('is-ingedrukt');
      later(loslaten, 140);
      drukken();
    });
    buzzer.addEventListener('contextmenu', e => e.preventDefault());
    volgendeKnop.addEventListener('click', () => volgende());

    // Spatiebalk drukt, letters A tot F (of 1 tot 6) kiezen als jij mag antwoorden.
    function toets(e) {
      if (!levend || !af || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      if (!scherm.isConnected || scherm.closest('[inert]')) return;
      const doel = e.target;
      if (doel && doel.closest && doel.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], dialog')) return;
      if (af.st === 'antwoord-ik') {
        const toetsNaam = String(e.key || '').toLowerCase();
        let i = 'abcdef'.indexOf(toetsNaam);
        if (i < 0) i = '123456'.indexOf(toetsNaam);
        if (toetsNaam.length === 1 && i >= 0 && i < optieKnoppen.length) { e.preventDefault(); kiezen(i); }
        return;
      }
      if ((e.key === ' ' || e.code === 'Space') && af.st === 'open') {
        if (doel === buzzer) return;
        if (doel && doel !== document.body && doel.closest && doel.closest('button, a[href], summary, [role="button"]')) return;
        e.preventDefault();
        buzzer.classList.add('is-ingedrukt');
        later(loslaten, 140);
        drukken();
      }
    }
    document.addEventListener('keydown', toets);

    return {
      toon(nieuweStaat) {
        if (!levend || !nieuweStaat || !nieuweStaat.kamer) return;
        staat = nieuweStaat;
        teken();
      },
      weg() {
        if (!levend) return;
        levend = false;
        if (lus) window.cancelAnimationFrame(lus);
        lus = 0;
        timers.forEach(t => window.clearTimeout(t));
        timers.clear();
        document.removeEventListener('keydown', toets);
        scherm.remove();
      }
    };
  }

  BES.duelScherm.spel = { maak };
})();
