// Duel starten vanaf de vakpagina (contract deel 5): een knop onder Start, een venster met het aantal vragen,
// dan de kamer maken met BES.duel.maak en door naar duel.html?c=CODE.
// vak.js laadt dit bestand en geeft het vak en de gekozen hoofdstukken via BES.vakKeuze().
(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  if (BES.duelStart) return;

  const bron = document.currentScript?.src || new URL('../../assets/duel-start.js', window.location.href).href;
  const params = new URLSearchParams(window.location.search);
  // Met ?test=duel speelt alles op de nep-database (duel-nep.js), zonder account.
  const testDuel = params.get('test') === 'duel';
  const AANTALLEN = [5, 10, 15, 20];
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

  const icoon = () => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
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
.duel-knoppen { display: flex; flex-direction: column; align-items: stretch; min-width: 0; }
.duel-knop-blok { margin-top: 12px; }
.vak-pagina .duel-knop.knop-secundair { display: inline-flex; width: 100%; max-width: none; min-width: 0; margin: 0; gap: 10px; padding: 10px 24px; font-size: 1rem; line-height: 1.3; white-space: normal; text-align: center; }
.duel-knop svg, .duel-venster-icoon svg { flex-shrink: 0; fill: none; stroke: var(--accent); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.duel-knop svg { width: 20px; height: 20px; transition: transform 220ms var(--ease); }
:where(html.has-hover) .duel-knop:not(:disabled):hover svg { transform: rotate(-10deg) scale(1.1); }
.duel-knop:not(:disabled):active svg { transform: scale(.9); }
.duel-knop[aria-expanded="true"] svg { transform: rotate(-10deg) scale(1.1); }

.duel-venster.kies-plan { width: min(480px, calc(100% - 32px)); }
.duel-venster-top { display: flex; align-items: center; gap: 12px; margin: 0 0 16px; }
.duel-venster-icoon { display: inline-grid; place-items: center; flex: 0 0 44px; width: 44px; height: 44px; border-radius: 14px; background: var(--accent-zacht); }
.duel-venster-icoon svg { width: 22px; height: 22px; }
.duel-venster[open] .duel-venster-icoon svg { animation: duel-icoon-in 420ms var(--ease) 120ms both; }
@keyframes duel-icoon-in { from { opacity: 0; transform: scale(.6) rotate(-14deg); } to { opacity: 1; transform: none; } }
.duel-venster-label { margin: 0; color: var(--accent); font-size: .875rem; font-weight: 600; letter-spacing: .01em; }
.duel-aantal { min-width: 0; margin: 0 0 16px; padding: 0; border: 0; }
.duel-aantal-kop { margin: 0 0 10px; color: var(--ink); font-size: .9375rem; font-weight: 600; }
.duel-segment { position: relative; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; padding: 4px; border: 1px solid var(--line); border-radius: var(--radius-pill); background: var(--surface); --i: 1; }
.duel-schuif { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc((100% - 20px) / 4); border: 1px solid var(--line); border-radius: var(--radius-pill); background: var(--card); box-shadow: var(--shadow-soft); transform: translateX(calc(var(--i) * (100% + 4px))); transition: transform 280ms var(--ease); pointer-events: none; }
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
  .duel-schuif, .duel-segment button, .duel-knop svg { transition: none !important; }
  .duel-venster .duel-venster-icoon svg { animation: none !important; }
  .duel-segment button:active, .duel-knop svg { transform: none !important; }
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

  // Wat de maker nu gekozen heeft. Bij Examensimulatie doen alle hoofdstukken mee, net als op de pagina.
  function keuze() {
    const vak = window.BES_VAK;
    const gekozen = typeof BES.vakKeuze === 'function' ? BES.vakKeuze() : null;
    if (!vak || !gekozen || !Array.isArray(vak.hoofdstukken)) return null;
    const metVragen = new Set((vak.vragen || []).filter(bruikbaar).map(vraag => vraag.h));
    const beschikbaar = vak.hoofdstukken.filter(hoofdstuk => metVragen.has(hoofdstuk.id));
    const simulatie = document.querySelector('#modus-keuzes [data-modus="simulatie"]')?.getAttribute('aria-checked') === 'true';
    const set = new Set(gekozen.hoofdstukken);
    const hoofdstukken = beschikbaar.filter(hoofdstuk => simulatie || set.has(hoofdstuk.id));
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
      script.src = new URL(testDuel ? 'duel-nep.js?v=1' : 'duel.js?v=1', bron).href;
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

  function begin() {
    const start = document.getElementById('start-oefening');
    if (!start || document.getElementById('duel-start') || typeof BES.vakKeuze !== 'function') return;
    stijl();

    // De Start-knop en de duel-knop staan samen in één kolom; de afstand zit in het blok dat openschuift.
    const groep = maak('div', 'duel-knoppen');
    start.before(groep);
    groep.append(start);
    const blok = maak('div', 'duel-knop-blok');
    const knop = maak('button', 'knop-secundair duel-knop');
    knop.type = 'button';
    knop.id = 'duel-start';
    knop.setAttribute('aria-haspopup', 'dialog');
    knop.setAttribute('aria-expanded', 'false');
    knop.append(icoon(), maak('span', '', 'Speel een duel met vrienden'));
    blok.append(knop);
    // Staat de pagina al in beeld, dan schuift de knop rustig open; anders (deur nog dicht, tabblad op de achtergrond) staat hij er meteen.
    const inBeeld = document.visibilityState === 'visible' && !document.documentElement.classList.contains('deur-check') && start.getClientRects().length > 0;
    blok.hidden = inBeeld;
    groep.append(blok);
    if (inBeeld) toon(blok);

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
      else if (stand.max < AANTALLEN[AANTALLEN.length - 1]) delen.push(`Je hoofdstukken hebben ${vragenTekst(n)}. Kies meer hoofdstukken voor een langer duel.`);
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

    function werkKnopBij() {
      const k = keuze();
      knop.disabled = !k || !k.hoofdstukken.length;
    }

    function zetBezig(aan) {
      bezig = aan;
      maakKnop.disabled = aan || !stand?.max;
      maakKnop.textContent = aan ? 'Duel maken…' : 'Maak duel';
      keuzeKnoppen.forEach(optie => { optie.disabled = aan || Number(optie.dataset.aantal) > (stand?.lijst.length || 0); });
      if (aan) venster.setAttribute('aria-busy', 'true');
      else venster.removeAttribute('aria-busy');
    }

    function open() {
      if (venster.open || knop.disabled) return;
      fout.hidden = true;
      fout.textContent = '';
      info.hidden = true;
      info.textContent = '';
      werkVensterBij();
      // Het venster is nog dicht: de schuif staat meteen goed, zonder te bewegen.
      venster.showModal();
      knop.setAttribute('aria-expanded', 'true');
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

    knop.addEventListener('click', open);
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
    venster.addEventListener('close', () => {
      knop.setAttribute('aria-expanded', 'false');
      if (knop.isConnected && knop.getClientRects().length) knop.focus({ preventScroll: true });
    });

    // De knop volgt de keuzes op de pagina: zonder hoofdstukken staat hij uit, net als Start.
    const instellingen = document.getElementById('vak-instellingen');
    if (instellingen && 'MutationObserver' in window) {
      new MutationObserver(werkKnopBij).observe(instellingen, { subtree: true, attributes: true, attributeFilter: ['aria-checked'] });
    }
    werkKnopBij();

    // Terug van inloggen (?duel=10): het venster gaat weer open met hetzelfde aantal.
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
          werkKnopBij();
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', begin, { once: true });
  else begin();
})();
