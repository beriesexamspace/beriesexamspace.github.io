// Duel starten vanaf de vakpagina (contract deel 5): een derde kaartje "Duel met vrienden" naast Examensimulatie.
// Met dat kaartje gekozen opent Maak een duel (vak.js) een venster met het aantal vragen,
// dan de kamer maken met BES.duel.maak en door naar duel.html?c=CODE.
// vak.js laadt dit bestand, regelt de stappen voor de modus 'duel' en geeft het vak en de gekozen hoofdstukken via BES.vakKeuze().
(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  if (BES.duelStart) return;

  const bron = document.currentScript?.src || new URL('../../assets/duel-start.js', window.location.href).href;
  const params = new URLSearchParams(window.location.search);
  // Met ?test=duel speelt alles op de nep-database (duel-nep.js), zonder account.
  const testDuel = params.get('test') === 'duel';
  const AANTALLEN = [5, 10, 20, 30, 50];
  const STANDAARD = 10;
  const MINIMUM = 5;

  const maak = (tag, klasse, tekst) => {
    const el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (tekst !== undefined) el.textContent = tekst;
    return el;
  };
  const vragenTekst = n => `${n} ${n === 1 ? 'vraag' : 'vragen'}`;

  function schud(lijst) {
    const uit = lijst.slice();
    for (let i = uit.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [uit[i], uit[j]] = [uit[j], uit[i]];
    }
    return uit;
  }

  // Blokken rustig open en dicht (BES.toon en BES.verberg uit app.js), zodat er niets springt.
  const toon = el => (BES.toon ? BES.toon(el) : (el.hidden = false));
  const verberg = (el, klaar) => { if (BES.verberg) BES.verberg(el, klaar); else { el.hidden = true; klaar?.(); } };

  // Een belofte met een maximale wachttijd: undefined als het te lang duurt of misgaat.
  const metTijd = (belofte, ms) => Promise.race([
    Promise.resolve(belofte).catch(() => undefined),
    new Promise(klaar => window.setTimeout(() => klaar(undefined), ms))
  ]);

  // De bliksem van het duel: in het venster en (24 bij 24, zoals de andere modi) op het kaartje.
  const icoon = maat => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    if (maat) { svg.setAttribute('width', String(maat)); svg.setAttribute('height', String(maat)); }
    const pad = document.createElementNS(ns, 'path');
    pad.setAttribute('d', 'M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z');
    svg.append(pad);
    return svg;
  };

  function stijl() {
    if (document.getElementById('duel-start-stijl')) return;
    const css = maak('style');
    css.id = 'duel-start-stijl';
    css.textContent = `
/* Drie kaartjes (Training, Simulatie, Duel): naast elkaar als er plaats is, anders onder elkaar. */
#modus-keuzes.met-duel { position: relative; }
@media (min-width: 768px) and (max-width: 899px) { #modus-keuzes.met-duel { grid-template-columns: minmax(0, 1fr); } }
@media (min-width: 900px) { #modus-keuzes.met-duel { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.duel-venster-icoon svg { flex-shrink: 0; fill: none; stroke: var(--accent); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

.duel-venster.kies-plan { width: min(480px, calc(100% - 32px)); }
.duel-venster-top { display: flex; align-items: center; gap: 12px; margin: 0 0 16px; }
.duel-venster-icoon { display: inline-grid; place-items: center; flex: 0 0 44px; width: 44px; height: 44px; border-radius: 14px; background: var(--accent-zacht); }
.duel-venster-icoon svg { width: 22px; height: 22px; }
.duel-venster[open] .duel-venster-icoon svg { animation: duel-icoon-in 420ms var(--ease) 120ms both; }
@keyframes duel-icoon-in { from { opacity: 0; transform: scale(.6) rotate(-14deg); } to { opacity: 1; transform: none; } }
.duel-venster-label { margin: 0; color: var(--accent); font-size: .875rem; font-weight: 600; letter-spacing: .01em; }
.duel-aantal { min-width: 0; margin: 0 0 16px; padding: 0; border: 0; }
.duel-aantal-kop { margin: 0 0 10px; color: var(--ink); font-size: .9375rem; font-weight: 600; }
.duel-segment { position: relative; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 4px; padding: 4px; border: 1px solid var(--line); border-radius: var(--radius-pill); background: var(--surface); --i: 1; }
.duel-schuif { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc((100% - 24px) / 5); border: 1px solid var(--line); border-radius: var(--radius-pill); background: var(--card); box-shadow: var(--shadow-soft); transform: translateX(calc(var(--i) * (100% + 4px))); transition: transform 280ms var(--ease); pointer-events: none; }
.duel-segment button { position: relative; z-index: 1; min-height: 44px; padding: 8px 4px; border: 0; border-radius: var(--radius-pill); background: var(--transparent); color: var(--ink-soft); font: inherit; font-size: 1rem; font-weight: 600; font-variant-numeric: tabular-nums; cursor: pointer; touch-action: manipulation; transition: color 180ms var(--ease), transform 150ms var(--ease), opacity 180ms var(--ease); }
.duel-segment button[aria-checked="true"] { color: var(--ink); }
:where(html.has-hover) .duel-segment button:not(:disabled):not([aria-checked="true"]):hover { color: var(--ink); }
.duel-segment button:not(:disabled):active { transform: scale(.95); }
.duel-segment button:disabled { opacity: .4; cursor: default; }
.duel-segment button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.duel-overzicht { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px 20px; margin: 0; padding: 14px 16px; border-radius: 14px; background: var(--surface); font-size: .9375rem; line-height: 1.5; overflow-wrap: anywhere; }
.duel-overzicht dt { color: var(--ink-soft); }
.duel-overzicht dd { min-width: 0; margin: 0; color: var(--ink); }
.duel-info, .duel-fout { margin: 0; padding-top: 14px; font-size: .875rem; line-height: 1.5; }
.duel-info { color: var(--ink-soft); }
.duel-fout { color: var(--fout); font-weight: 500; }
.duel-venster .kies-plan-voet { margin-top: 24px; }
.duel-venster .kies-plan-later { border-radius: 12px; }
.duel-venster .kies-plan-later:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.duel-venster .kies-plan-voet .knop { width: auto; min-width: 160px; max-width: none; margin: 0; }
@media (max-width: 480px) {
  .duel-venster .kies-plan-voet { flex-direction: column-reverse; align-items: stretch; gap: 8px; }
  .duel-venster .kies-plan-voet .knop, .duel-venster .kies-plan-later { width: 100%; justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .duel-schuif, .duel-segment button { transition: none !important; }
  .duel-venster .duel-venster-icoon svg { animation: none !important; }
  .duel-segment button:active { transform: none !important; }
}`;
    document.head.append(css);
  }

  // Het juiste antwoord als index: a is een getal, of een lijst met precies één getal (zo schrijven sommige vakken het).
  // Zelfde regel als naarDuelVraag in duel-podium.js ("Nog een keer").
  function juistVan(vraag) {
    const a = Array.isArray(vraag.a) ? (vraag.a.length === 1 ? vraag.a[0] : NaN) : vraag.a;
    return Number.isInteger(a) ? a : NaN;
  }

  // Bruikbare vragen voor een duel: één juist antwoord, 2 tot 6 opties, geen "kies de foute"-vragen.
  function bruikbaar(vraag) {
    if (!vraag || vraag.plaatshouder || vraag.kies !== undefined) return false;
    if (typeof vraag.h !== 'string' || typeof vraag.q !== 'string' || !vraag.q.trim()) return false;
    if (!Array.isArray(vraag.o) || vraag.o.length < 2 || vraag.o.length > 6) return false;
    if (!vraag.o.every(optie => typeof optie === 'string' && optie.trim())) return false;
    const juist = juistVan(vraag);
    return juist >= 0 && juist < vraag.o.length;
  }

  const sleutel = vraag => vraag.q.trim().replace(/\s+/g, ' ').toLowerCase();

  // Alle bruikbare vragen van deze hoofdstukken, elke vraagtekst maar één keer.
  function vragenUit(hoofdstukken) {
    const kies = new Set(hoofdstukken);
    const gezien = new Set();
    const lijst = [];
    (window.BES_VAK?.vragen || []).forEach(vraag => {
      if (!bruikbaar(vraag) || !kies.has(vraag.h)) return;
      const s = sleutel(vraag);
      if (gezien.has(s)) return;
      gezien.add(s);
      lijst.push(vraag);
    });
    return lijst;
  }

  // Willekeurige vragen in het formaat van duel_maak; de opties worden geschud en juist schuift mee.
  function maakVragen(lijst, aantal) {
    return schud(lijst).slice(0, aantal).map(vraag => {
      const volgorde = schud(vraag.o.map((_, index) => index));
      return {
        vraag: vraag.q.trim(),
        opties: volgorde.map(index => vraag.o[index].trim()),
        juist: volgorde.indexOf(juistVan(vraag)),
        hoofdstuk: vraag.h,
        uitleg: typeof vraag.u === 'string' ? vraag.u : ''
      };
    });
  }

  // Wat de maker nu gekozen heeft: het vak en de hoofdstukken die bij Duel met vrienden aangevinkt staan.
  function keuze() {
    const vak = window.BES_VAK;
    const gekozen = typeof BES.vakKeuze === 'function' ? BES.vakKeuze() : null;
    if (!vak || !gekozen || !Array.isArray(vak.hoofdstukken)) return null;
    const metVragen = new Set((vak.vragen || []).filter(bruikbaar).map(vraag => vraag.h));
    const beschikbaar = vak.hoofdstukken.filter(hoofdstuk => metVragen.has(hoofdstuk.id));
    const set = new Set(gekozen.hoofdstukken);
    const hoofdstukken = beschikbaar.filter(hoofdstuk => set.has(hoofdstuk.id));
    return { vak: gekozen.vak, hoofdstukken: hoofdstukken.map(hoofdstuk => hoofdstuk.id), namen: hoofdstukken.map(hoofdstuk => hoofdstuk.naam), beschikbaar: beschikbaar.length };
  }

  function hoofdstukkenTekst(k) {
    const n = k.hoofdstukken.length;
    if (!n) return 'Nog geen hoofdstukken gekozen';
    if (n === k.beschikbaar && n > 3) return `Alle ${n} hoofdstukken`;
    if (n <= 3) return k.namen.join(', ');
    return `${n} van ${k.beschikbaar} hoofdstukken`;
  }

  // duel.js (of duel-nep.js met ?test=duel) staat nog niet op de vakpagina: pas laden als het nodig is.
  let laadBelofte = null;
  function laadDuel() {
    if (typeof BES.duel?.maak === 'function') return Promise.resolve(BES.duel);
    if (laadBelofte) return laadBelofte;
    const script = document.createElement('script');
    laadBelofte = new Promise((klaar, mislukt) => {
      script.src = new URL(testDuel ? 'duel-nep.js?v=2' : 'duel.js?v=1', bron).href;
      script.onload = () => (typeof BES.duel?.maak === 'function' ? klaar(BES.duel) : mislukt(new Error('geen duel')));
      script.onerror = () => mislukt(new Error('niet geladen'));
      document.head.append(script);
    }).catch(fout => {
      laadBelofte = null;
      script.remove();
      throw fout;
    });
    return laadBelofte;
  }

  // Niet ingelogd: naar inloggen.html, daarna terug naar deze vakpagina met het venster weer open.
  function naarInloggen(aantal) {
    const thuis = new URL('../', bron).href;
    const hier = new URL(window.location.href);
    hier.hash = '';
    hier.searchParams.set('duel', String(aantal));
    const terug = hier.href.startsWith(thuis) ? hier.href.slice(thuis.length) : '';
    try { if (terug) window.sessionStorage.setItem('bes_terug', terug); } catch {}
    const doel = new URL('../inloggen.html', bron);
    if (terug) doel.searchParams.set('terug', terug);
    window.location.assign(doel.href);
  }

  function duelAdres(code) {
    const doel = new URL('../duel.html', bron);
    doel.searchParams.set('c', code);
    if (testDuel) {
      doel.searchParams.set('test', 'duel');
      ['speler', 'snel'].forEach(naam => { if (params.has(naam)) doel.searchParams.set(naam, params.get(naam)); });
    }
    return doel.href;
  }

  const foutTekst = fout => ({
    niet_ingelogd: 'Log eerst in om een duel te maken.',
    ongeldig: 'De vragen konden niet mee. Probeer het opnieuw.'
  })[fout] || 'Het duel maken lukte niet. Probeer het zo opnieuw.';

  // Het kaartje Duel met vrienden, in dezelfde vorm als Examen Training en Examensimulatie (een keuze in de radiogroep).
  function maakKaart() {
    const kaart = maak('button', 'kaart modus');
    kaart.type = 'button';
    kaart.setAttribute('role', 'radio');
    kaart.setAttribute('aria-checked', 'false');
    kaart.tabIndex = -1;
    kaart.dataset.modus = 'duel';
    const boven = maak('span', 'modus-boven');
    boven.setAttribute('aria-hidden', 'true');
    const plaatje = maak('span', 'modus-icoon');
    plaatje.append(icoon(24));
    boven.append(plaatje, maak('span', 'modus-vink'));
    kaart.append(boven,
      maak('span', 'kaart-titel', 'Duel met vrienden'),
      maak('span', 'kaart-sub', 'Speel live tegen je vrienden. Wie het eerst drukt, mag antwoorden.'),
      maak('span', 'modus-detail', '2 tot 10 spelers'));
    return kaart;
  }

  // Het kaartje komt achter Examensimulatie. Staat de pagina al in beeld, dan gaat dat rustig: de bestaande kaartjes
  // schuiven naar hun nieuwe plek en breedte (naast elkaar, of van twee kolommen naar onder elkaar), het rooster groeit
  // in hoogte en het nieuwe kaartje komt erin. Anders (deur nog dicht, tabblad op de achtergrond, minder beweging) staat het er meteen.
  function plaatsKaart(groep, kaart) {
    const oud = [...groep.querySelectorAll('[data-modus]')];
    const beweeg = document.visibilityState === 'visible' && !document.documentElement.classList.contains('deur-check')
      && groep.getClientRects().length > 0 && oud.length > 0 && typeof kaart.animate === 'function'
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const maat = el => el.getBoundingClientRect();
    const voor = beweeg ? oud.map(maat) : [];
    const hoogte = beweeg ? maat(groep).height : 0;
    groep.classList.add('met-duel');
    groep.append(kaart);
    if (!beweeg) return;
    const na = oud.map(maat);
    const plek = maat(kaart);
    const vak = maat(groep);
    const verloop = getComputedStyle(groep).getPropertyValue('--ease').trim() || 'ease-out';
    const duur = 320;
    const opties = { duration: duur, easing: verloop, fill: 'forwards' };
    // De hoogte van het rooster loopt mee, zodat de stappen eronder rustig opschuiven.
    const animaties = [groep.animate([{ height: `${hoogte}px` }, { height: `${vak.height}px` }], opties)];
    // De bestaande kaartjes gaan vanaf hun oude plek en breedte naar de nieuwe (ook als ze van rij wisselen).
    oud.forEach((el, i) => {
      if (Math.abs(voor[i].left - na[i].left) < 1 && Math.abs(voor[i].top - na[i].top) < 1 && Math.abs(voor[i].width - na[i].width) < 1) return;
      animaties.push(el.animate([
        { width: `${voor[i].width}px`, transform: `translate(${voor[i].left - na[i].left}px, ${voor[i].top - na[i].top}px)` },
        { width: `${na[i].width}px`, transform: 'none' }
      ], opties));
    });
    const naast = plek.top < na[na.length - 1].bottom;
    if (naast) {
      // Naast elkaar: het nieuwe kaartje staat even los van het rooster, zodat alleen de krimpende kaartjes de hoogte bepalen.
      Object.assign(kaart.style, { position: 'absolute', top: `${plek.top - vak.top}px`, left: `${plek.left - vak.left}px`, width: `${plek.width}px`, height: `${plek.height}px` });
      animaties.push(kaart.animate([{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }], { ...opties, duration: 260, delay: 120, fill: 'both' }));
    } else {
      // Onder elkaar: wat nog buiten het groeiende rooster valt, blijft verborgen (de schaduw van de kaartjes niet).
      const tussen = parseFloat(getComputedStyle(groep).rowGap) || 0;
      groep.style.clipPath = `inset(-40px -40px -${tussen}px -40px)`;
      animaties.push(kaart.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { ...opties, delay: 80, fill: 'both' }));
    }
    // Alles klaar: eerst de losse plek en het knippen weg, dan pas de animaties (die de eindstand vasthouden).
    // Werd een kaartje intussen hoger of lager (bijvoorbeeld doordat een lettertype later laadde), dan schuift het
    // rooster ook dat laatste stukje rustig, in plaats van in één beeld te verspringen.
    Promise.all(animaties.map(animatie => animatie.finished)).catch(() => {}).then(() => {
      kaart.style.cssText = '';
      groep.style.clipPath = '';
      animaties.forEach(animatie => animatie.cancel());
      const echt = maat(groep).height;
      if (Math.abs(echt - vak.height) > 1) groep.animate([{ height: `${vak.height}px` }, { height: `${echt}px` }], { duration: 200, easing: verloop });
    });
  }

  function begin() {
    const start = document.getElementById('start-oefening');
    const groep = document.getElementById('modus-keuzes');
    if (!start || !groep || groep.querySelector('[data-modus="duel"]') || typeof BES.vakKeuze !== 'function') return;
    stijl();
    const kaart = maakKaart();
    plaatsKaart(groep, kaart);

    // Het venster
    const venster = maak('dialog', 'kies-plan duel-venster');
    venster.setAttribute('aria-labelledby', 'duel-venster-kop');
    venster.setAttribute('aria-describedby', 'duel-venster-uitleg');
    const top = maak('div', 'duel-venster-top');
    const badge = maak('span', 'duel-venster-icoon');
    badge.append(icoon());
    top.append(badge, maak('p', 'duel-venster-label', 'Live met vrienden'));
    const kop = maak('h2', '', 'Speel een duel');
    kop.id = 'duel-venster-kop';
    const uitleg = maak('p', 'kies-plan-reden', 'Iedereen krijgt dezelfde vraag. Wie het eerst drukt, mag antwoorden. Deel de code en speel met 2 tot 10 spelers.');
    uitleg.id = 'duel-venster-uitleg';

    const aantalVak = maak('div', 'duel-aantal');
    const aantalKop = maak('p', 'duel-aantal-kop', 'Aantal vragen');
    aantalKop.id = 'duel-aantal-kop';
    const segment = maak('div', 'duel-segment');
    segment.setAttribute('role', 'radiogroup');
    segment.setAttribute('aria-labelledby', 'duel-aantal-kop');
    const schuif = maak('span', 'duel-schuif');
    schuif.setAttribute('aria-hidden', 'true');
    segment.append(schuif);
    const keuzeKnoppen = AANTALLEN.map(aantal => {
      const optie = maak('button', '', String(aantal));
      optie.type = 'button';
      optie.setAttribute('role', 'radio');
      optie.dataset.aantal = String(aantal);
      optie.setAttribute('aria-label', `${aantal} vragen`);
      segment.append(optie);
      return optie;
    });
    aantalVak.append(aantalKop, segment);

    const overzicht = maak('dl', 'duel-overzicht');
    const hoofdstukWaarde = maak('dd');
    const vragenWaarde = maak('dd');
    overzicht.append(maak('dt', '', 'Hoofdstukken'), hoofdstukWaarde, maak('dt', '', 'Vragen'), vragenWaarde);

    const info = maak('p', 'duel-info');
    info.setAttribute('role', 'status');
    info.hidden = true;
    const fout = maak('p', 'duel-fout');
    fout.setAttribute('role', 'alert');
    fout.hidden = true;

    const voet = maak('div', 'kies-plan-voet');
    const annuleer = maak('button', 'kies-plan-later', 'Annuleren');
    annuleer.type = 'button';
    const maakKnop = maak('button', 'knop', 'Maak duel');
    maakKnop.type = 'button';
    maakKnop.id = 'duel-maak';
    voet.append(annuleer, maakKnop);
    venster.append(top, kop, uitleg, aantalVak, overzicht, info, fout, voet);
    document.body.append(venster);

    // voorkeur: wat de maker koos; gekozen: wat nu kan met de vragen van zijn hoofdstukken.
    let voorkeur = STANDAARD;
    let gekozen = STANDAARD;
    let stand = null; // { keuze, lijst, max }
    let ingelogd = testDuel ? true : undefined;
    let bezig = false;

    // Een tekst rustig tonen, wisselen of weghalen.
    function zetTekst(el, tekst) {
      if (!tekst) { if (!el.hidden) verberg(el, () => { el.textContent = ''; }); return; }
      if (el.hidden || !venster.open) { el.textContent = tekst; toon(el); return; }
      if (el.textContent === tekst) { toon(el); return; }
      if (BES.wissel) BES.wissel(el, () => { el.textContent = tekst; });
      else el.textContent = tekst;
    }

    function kiesAantal(aantal, focus = false) {
      const optie = keuzeKnoppen.find(knopje => Number(knopje.dataset.aantal) === aantal);
      if (!optie || optie.disabled) return;
      gekozen = aantal;
      keuzeKnoppen.forEach(knopje => {
        const aan = knopje === optie;
        knopje.setAttribute('aria-checked', String(aan));
        knopje.tabIndex = aan ? 0 : -1;
      });
      segment.style.setProperty('--i', String(keuzeKnoppen.indexOf(optie)));
      if (focus) optie.focus();
    }

    function infoTekst() {
      if (!stand) return '';
      const delen = [];
      const n = stand.lijst.length;
      if (!stand.keuze.hoofdstukken.length) delen.push('Kies eerst minstens één hoofdstuk.');
      else if (n < MINIMUM) delen.push(`Je hoofdstukken hebben ${vragenTekst(n)}. Een duel heeft er minstens ${MINIMUM} nodig, dus kies meer hoofdstukken.`);
      else if (stand.max < AANTALLEN[AANTALLEN.length - 1]) delen.push(stand.keuze.hoofdstukken.length >= stand.keuze.beschikbaar
        ? `Dit vak heeft ${vragenTekst(n)} voor een duel.`
        : `Je hoofdstukken hebben ${vragenTekst(n)}. Kies meer hoofdstukken voor een langer duel.`);
      if (ingelogd === null) delen.push('Je logt eerst in, daarna kom je hier terug.');
      return delen.join(' ');
    }

    function werkVensterBij() {
      const k = keuze();
      const lijst = k ? vragenUit(k.hoofdstukken) : [];
      const max = AANTALLEN.filter(aantal => aantal <= lijst.length).pop() || 0;
      stand = k ? { keuze: k, lijst, max } : null;
      keuzeKnoppen.forEach(optie => { optie.disabled = Number(optie.dataset.aantal) > lijst.length; });
      if (max) kiesAantal(Math.min(voorkeur, max));
      else {
        keuzeKnoppen.forEach(optie => { optie.setAttribute('aria-checked', 'false'); optie.tabIndex = -1; });
        segment.style.setProperty('--i', '0');
      }
      schuif.hidden = !max;
      hoofdstukWaarde.textContent = k ? hoofdstukkenTekst(k) : 'Onbekend';
      vragenWaarde.textContent = `${lijst.length} beschikbaar`;
      maakKnop.disabled = !max || bezig;
      zetTekst(info, infoTekst());
    }

    function zetBezig(aan) {
      bezig = aan;
      maakKnop.disabled = aan || !stand?.max;
      maakKnop.textContent = aan ? 'Duel maken…' : 'Maak duel';
      keuzeKnoppen.forEach(optie => { optie.disabled = aan || Number(optie.dataset.aantal) > (stand?.lijst.length || 0); });
      if (aan) venster.setAttribute('aria-busy', 'true');
      else venster.removeAttribute('aria-busy');
    }

    // Zonder hoofdstukken staat Maak een duel uit (vak.js); het venster zegt het dan ook zelf.
    function open() {
      if (venster.open) return;
      fout.hidden = true;
      fout.textContent = '';
      info.hidden = true;
      info.textContent = '';
      werkVensterBij();
      // Het venster is nog dicht: de schuif staat meteen goed, zonder te bewegen.
      venster.showModal();
      (keuzeKnoppen.find(optie => optie.getAttribute('aria-checked') === 'true') || (maakKnop.disabled ? annuleer : maakKnop)).focus({ preventScroll: true });
      // Alvast laden, zodat Maak duel meteen werkt.
      laadDuel().catch(() => {});
      if (!testDuel && ingelogd === undefined) {
        metTijd(BES.auth?.gebruiker?.(), 4000).then(gebruiker => {
          if (gebruiker === undefined) return;
          ingelogd = gebruiker ? true : null;
          if (venster.open) zetTekst(info, infoTekst());
        });
      }
    }

    function sluit() {
      if (bezig) return;
      if (BES.sluitDialoog) BES.sluitDialoog(venster);
      else venster.close();
    }

    async function maakDuel() {
      if (bezig) return;
      werkVensterBij();
      if (!stand || !stand.max) return;
      const aantal = Math.min(gekozen, stand.max);
      zetBezig(true);
      zetTekst(fout, '');
      try {
        if (!testDuel) {
          const gebruiker = await metTijd(BES.auth?.gebruiker?.(), 6000);
          if (gebruiker === null) { naarInloggen(aantal); return; }
          if (gebruiker) ingelogd = true;
        }
        let duel;
        try {
          duel = await laadDuel();
        } catch {
          throw Object.assign(new Error('laden'), { tekst: 'Het duel kon niet laden. Controleer je internet en probeer het opnieuw.' });
        }
        const vragen = maakVragen(stand.lijst, aantal);
        const antwoord = await duel.maak({ vak: stand.keuze.vak, hoofdstukken: stand.keuze.hoofdstukken, vragen });
        if (antwoord?.ok && typeof antwoord.code === 'string' && /^[A-Za-z0-9]{4,12}$/.test(antwoord.code)) {
          window.location.assign(duelAdres(antwoord.code.toUpperCase()));
          return;
        }
        if (antwoord?.fout === 'niet_ingelogd' && !testDuel) { naarInloggen(aantal); return; }
        throw Object.assign(new Error('maak'), { tekst: foutTekst(antwoord?.fout) });
      } catch (probleem) {
        zetBezig(false);
        werkVensterBij();
        const tekst = probleem?.tekst || (window.navigator.onLine === false
          ? 'Je bent niet verbonden. Controleer je internet en probeer het opnieuw.'
          : 'Het duel maken lukte niet. Probeer het zo opnieuw.');
        zetTekst(fout, tekst);
      }
    }

    annuleer.addEventListener('click', sluit);
    maakKnop.addEventListener('click', maakDuel);
    keuzeKnoppen.forEach(optie => optie.addEventListener('click', () => {
      if (optie.disabled) return;
      voorkeur = Number(optie.dataset.aantal);
      kiesAantal(voorkeur);
    }));
    segment.addEventListener('keydown', event => {
      const actief = keuzeKnoppen.filter(optie => !optie.disabled);
      const nu = actief.indexOf(document.activeElement);
      if (nu < 0 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const stap = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
      const doel = event.key === 'Home' ? 0 : event.key === 'End' ? actief.length - 1 : (nu + stap + actief.length) % actief.length;
      voorkeur = Number(actief[doel].dataset.aantal);
      kiesAantal(voorkeur, true);
    });
    venster.addEventListener('cancel', event => { event.preventDefault(); sluit(); });
    venster.addEventListener('click', event => {
      if (event.target !== venster) return;
      const r = venster.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) sluit();
    });
    // Dicht: de focus terug op Maak een duel.
    venster.addEventListener('close', () => {
      if (start.isConnected && start.getClientRects().length) start.focus({ preventScroll: true });
    });

    // Terug van inloggen (?duel=10): Duel met vrienden weer gekozen en het venster open met hetzelfde aantal.
    if (params.has('duel')) {
      const terugAantal = Number(params.get('duel'));
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('duel');
        window.history.replaceState(window.history.state, '', url);
      } catch {}
      if (AANTALLEN.includes(terugAantal)) {
        voorkeur = terugAantal;
        Promise.resolve(BES.auth?.gereed).then(() => BES.auth?.gebruiker?.()).then(gebruiker => {
          if (!gebruiker) return;
          ingelogd = true;
          if (kaart.getAttribute('aria-checked') !== 'true') kaart.click();
          open();
        }).catch(() => {});
      }
    }

    // Terug met de knop Vorige (pagina uit het geheugen van de browser): niet meer bezig, venster dicht.
    window.addEventListener('pageshow', event => {
      if (!event.persisted) return;
      if (bezig) zetBezig(false);
      if (venster.open) venster.close();
    });

    BES.duelStart = { open, vragenUit, maakVragen, keuze };
  }

  // Het kaartje komt er alleen voor accounts die het duel mogen zien (duel-toegang.js). Laadde dat bestand niet: geen kaartje.
  const beginAlsHetMag = async () => {
    const mag = BES.duelToegang ? await BES.duelToegang() : false;
    if (mag === true) begin();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', beginAlsHetMag, { once: true });
  else beginAlsHetMag();
})();
