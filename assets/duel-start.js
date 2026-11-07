// Duel starten vanaf de vakpagina (contract deel 5): een derde kaartje "Duel met vrienden" naast Examensimulatie.
// Het kaartje is geen modus: het opent meteen een venster met twee tabbladen.
//   Duel maken: hoofdstukken en aantal vragen kiezen, dan de kamer maken met BES.duel.maak en door naar duel.html?c=CODE.
//   Meedoen met code: een code van 6 tekens (of een geplakte link) en door naar duel.html?c=CODE, waar duel-laden.js het overneemt.
// vak.js laadt dit bestand en geeft via BES.vakKeuze() het vak en de hoofdstukken die op de pagina gekozen staan (het begin van de keuze).
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
  // Zelfde tekens als de codes van duel_maak (geen I, L, O, 0 of 1).
  const TEKENS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const CODE_LENGTE = 6;
  const KEUZE_SLEUTEL = 'bes_duel_keuze';

  const maak = (tag, klasse, tekst) => {
    const el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (tekst !== undefined) el.textContent = tekst;
    return el;
  };
  const vragenTekst = n => `${n} ${n === 1 ? 'vraag' : 'vragen'}`;
  const minderBeweging = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
/* Alleen Training en Simulatie vormen de radiogroep; het Duel-kaartje staat ernaast. Voor het rooster telt dit vak niet mee. */
.modus-radios { display: contents; }
@media (min-width: 768px) and (max-width: 899px) { #modus-keuzes.met-duel { grid-template-columns: minmax(0, 1fr); } }
@media (min-width: 900px) { #modus-keuzes.met-duel { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
/* Het kaartje opent een venster: een pijl in plaats van een vinkje. */
.modus.duel-kaart .modus-boven { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.modus.duel-kaart .pijl { width: 30px; height: 30px; font-size: 1rem; }
.modus.duel-kaart:active { transform: scale(.98); }
.modus.duel-kaart:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

.duel-venster-icoon svg { flex-shrink: 0; fill: none; stroke: var(--accent); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

.duel-venster.kies-plan { --duel-pad: clamp(20px, 4vw, 32px); width: min(640px, calc(100% - 32px)); padding: var(--duel-pad); }
.duel-venster-top { display: flex; align-items: center; gap: 14px; margin: 0 0 12px; }
.duel-venster-top > div { min-width: 0; }
.duel-venster.kies-plan h2 { margin: 0; font-size: 1.375rem; line-height: 1.25; }
.duel-venster-icoon { display: inline-grid; place-items: center; flex: 0 0 48px; width: 48px; height: 48px; border-radius: 15px; background: var(--accent-zacht); }
.duel-venster-icoon svg { width: 24px; height: 24px; }
.duel-venster[open] .duel-venster-icoon svg { animation: duel-icoon-in 420ms var(--ease) 120ms both; }
@keyframes duel-icoon-in { from { opacity: 0; transform: scale(.6) rotate(-14deg); } to { opacity: 1; transform: none; } }
.duel-venster-label { margin: 0 0 2px; color: var(--accent); font-size: .8125rem; font-weight: 600; letter-spacing: .01em; }
.duel-venster .kies-plan-reden { margin: 0 0 18px; font-size: .9375rem; }

/* Tabbladen Duel maken / Meedoen met code en de keuze van het aantal: een schuivende pil. */
.duel-tabs, .duel-segment { position: relative; display: grid; gap: 4px; padding: 4px; border: 1px solid var(--line); border-radius: var(--radius-pill); background: var(--surface); }
.duel-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0 0 20px; --t: 0; }
.duel-segment { grid-template-columns: repeat(5, minmax(0, 1fr)); --i: 1; }
.duel-schuif, .duel-tabs-schuif { position: absolute; top: 4px; bottom: 4px; left: 4px; border: 1px solid var(--line); border-radius: var(--radius-pill); background: var(--card); box-shadow: var(--shadow-soft); transition: transform 280ms var(--ease); pointer-events: none; }
.duel-schuif { width: calc((100% - 24px) / 5); transform: translateX(calc(var(--i) * (100% + 4px))); }
.duel-tabs-schuif { width: calc((100% - 12px) / 2); transform: translateX(calc(var(--t) * (100% + 4px))); }
.duel-tabs button, .duel-segment button { position: relative; z-index: 1; min-height: 44px; padding: 8px 4px; border: 0; border-radius: var(--radius-pill); background: var(--transparent); color: var(--ink-soft); font: inherit; font-weight: 600; cursor: pointer; touch-action: manipulation; transition: color 180ms var(--ease), transform 150ms var(--ease), opacity 180ms var(--ease); }
.duel-tabs button { font-size: .9375rem; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.duel-tab-kort { display: none; }
.duel-segment button { font-size: 1rem; font-variant-numeric: tabular-nums; }
.duel-segment button[aria-checked="true"], .duel-tabs button[aria-selected="true"] { color: var(--ink); }
:where(html.has-hover) :is(.duel-segment, .duel-tabs) button:not(:disabled):not([aria-checked="true"]):not([aria-selected="true"]):hover { color: var(--ink); }
:is(.duel-segment, .duel-tabs) button:not(:disabled):active { transform: scale(.95); }
:is(.duel-segment, .duel-tabs) button:disabled { opacity: .4; cursor: default; }
:is(.duel-segment, .duel-tabs) button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.duel-panelen { position: relative; }
.duel-paneel[hidden] { display: none; }
.duel-kop-rij { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 32px; margin: 0 0 8px; }
.duel-kop { margin: 0; color: var(--ink); font-size: .9375rem; font-weight: 600; }
.duel-kop-extra { color: var(--ink-soft); font-size: .8125rem; font-weight: 500; font-variant-numeric: tabular-nums; }
.duel-acties { display: flex; gap: 16px; }
.duel-tekstknop { min-height: 32px; padding: 4px 2px; white-space: nowrap; border: 0; border-radius: 8px; background: none; color: var(--accent); font: inherit; font-size: .875rem; font-weight: 500; cursor: pointer; transition: color 150ms var(--ease), opacity 150ms var(--ease), transform 150ms var(--ease); }
:where(html.has-hover) .duel-tekstknop:not(:disabled):hover { color: var(--ink); }
.duel-tekstknop:not(:disabled):active { transform: scale(.96); }
.duel-tekstknop:disabled { color: var(--ink-soft); opacity: .5; cursor: default; }
.duel-tekstknop:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* Hoofdstukken: een korte lijst die zelf scrolt, zodat Start altijd dichtbij blijft.
   Op een laag scherm scrolt alleen het venster (geen scrollvak in een scrollvak) en blijft de voet met Start staan. */
.duel-hs-lijst { display: grid; gap: 8px; max-height: min(300px, 30dvh); margin: 0 -4px 20px; padding: 4px; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; }
@media (min-width: 600px) { .duel-hs-lijst { max-height: min(440px, 42dvh); } }
.duel-hs { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 48px; padding: 10px 14px; border: 1px solid var(--line); border-radius: 14px; background: var(--card); color: var(--ink); font: inherit; text-align: left; cursor: pointer; touch-action: manipulation; transition: background-color 160ms var(--ease), border-color 160ms var(--ease), transform 150ms var(--ease); }
.duel-hs[aria-checked="true"] { border-color: var(--accent); background: var(--accent-zacht); }
:where(html.has-hover) .duel-hs:not(:disabled):not([aria-checked="true"]):hover { border-color: var(--ink-soft); }
.duel-hs:not(:disabled):active { transform: scale(.985); }
.duel-hs:disabled { opacity: .5; cursor: default; }
.duel-hs:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.duel-hs-vink { display: inline-grid; place-items: center; flex: 0 0 22px; width: 22px; height: 22px; border: 1px solid var(--line); border-radius: 50%; background: var(--surface); color: var(--transparent); font-size: .8125rem; line-height: 1; transition: color 160ms var(--ease), background-color 160ms var(--ease), border-color 160ms var(--ease); }
.duel-hs[aria-checked="true"] .duel-hs-vink { border-color: var(--accent); background: var(--accent); color: var(--white); }
.duel-hs-naam { flex: 1; min-width: 0; font-size: .9375rem; font-weight: 600; line-height: 1.35; overflow-wrap: break-word; -webkit-hyphens: auto; hyphens: auto; }
.duel-hs-aantal { flex: 0 0 auto; color: var(--ink-soft); font-size: .8125rem; font-variant-numeric: tabular-nums; }

.duel-aantal { min-width: 0; margin: 0; }

/* Meedoen met code: één groot veld met ruimte tussen de tekens. */
.duel-code-label { display: block; margin: 0 0 8px; color: var(--ink); font-size: .9375rem; font-weight: 600; }
.duel-code { display: block; width: 100%; min-height: 64px; margin: 0; padding: 10px 12px 10px calc(12px + .4em); border: 1px solid var(--line); border-radius: 16px; background: var(--surface); color: var(--ink); font: 600 1.75rem/1.2 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: .4em; text-align: center; text-transform: uppercase; caret-color: var(--accent); transition: border-color 160ms var(--ease), box-shadow 160ms var(--ease), background-color 160ms var(--ease); }
.duel-code::placeholder { color: var(--ink-soft); opacity: .45; }
.duel-code:focus { outline: none; border-color: var(--accent); background: var(--card); box-shadow: 0 0 0 4px var(--accent-zacht); }
.duel-code.is-compleet { border-color: var(--accent); }
.duel-code-hulp { margin: 10px 0 0; color: var(--ink-soft); font-size: .875rem; line-height: 1.5; }

.duel-info, .duel-fout { margin: 0; padding-top: 14px; font-size: .875rem; line-height: 1.5; }
.duel-info { color: var(--ink-soft); }
.duel-fout { color: var(--fout); font-weight: 500; }
.duel-venster .kies-plan-voet { position: sticky; bottom: calc(-1 * var(--duel-pad)); z-index: 2; flex-wrap: nowrap; gap: 12px; margin: 12px calc(-1 * var(--duel-pad)) calc(-1 * var(--duel-pad)); padding: 12px var(--duel-pad) var(--duel-pad); background: var(--card); }
.duel-venster .kies-plan-voet::before { content: ""; position: absolute; left: 0; right: 0; bottom: 100%; height: 12px; background: linear-gradient(to bottom, transparent, var(--card)); pointer-events: none; }
@media (max-height: 760px) { .duel-hs-lijst { max-height: none; overflow: visible; } }
.duel-venster .kies-plan-later { border-radius: 12px; transition: color 150ms var(--ease), transform 150ms var(--ease); }
.duel-venster .kies-plan-later:active { transform: scale(.96); }
.duel-venster .kies-plan-later:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.duel-voet-knop { display: flex; justify-content: flex-end; min-width: 0; }
.duel-voet-knop .knop { width: auto; min-width: 160px; max-width: none; margin: 0; justify-content: center; }
@media (max-width: 480px) {
  .duel-venster.kies-plan { --duel-pad: 20px; }
  .duel-venster-icoon { flex-basis: 44px; width: 44px; height: 44px; border-radius: 14px; }
  .duel-voet-knop { flex: 1; }
  .duel-voet-knop .knop { width: 100%; min-width: 0; }
  .duel-tabs button { font-size: .875rem; }
}
@media (max-width: 379px) {
  .duel-tab-lang { display: none; }
  .duel-tab-kort { display: inline; }
}
@media (max-width: 400px) {
  .duel-kop-rij { gap: 8px; }
  .duel-acties { gap: 12px; }
  .duel-hs { display: grid; grid-template-columns: 22px minmax(0, 1fr); column-gap: 12px; row-gap: 2px; }
  .duel-hs-vink { grid-row: span 2; }
  .duel-hs-aantal { grid-column: 2; }
}
@media (prefers-reduced-motion: reduce) {
  .duel-schuif, .duel-tabs-schuif, .duel-tabs button, .duel-segment button, .duel-hs, .duel-tekstknop, .duel-code, .duel-venster .kies-plan-later { transition: none !important; }
  .duel-venster .duel-venster-icoon svg { animation: none !important; }
  :is(.duel-segment, .duel-tabs) button:active, .duel-hs:active, .duel-tekstknop:active, .modus.duel-kaart:active, .duel-venster .kies-plan-later:active { transform: none !important; }
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

  // De hoofdstukken van dit vak die bruikbare duelvragen hebben, met hun aantal.
  function beschikbareHoofdstukken() {
    const vak = window.BES_VAK;
    if (!vak || !Array.isArray(vak.hoofdstukken)) return [];
    return vak.hoofdstukken
      .map(hoofdstuk => ({ id: hoofdstuk.id, naam: hoofdstuk.naam, aantal: vragenUit([hoofdstuk.id]).length }))
      .filter(hoofdstuk => hoofdstuk.aantal > 0);
  }

  // Een code uit wat iemand typte of plakte: hoofdletters, alleen geldige tekens, ook uit een hele link (…?c=CODE)
  // of uit een stukje tekst ("Code: ABC234": dan het laatste woord van 6 geldige tekens).
  // fout: er stonden letters of cijfers in die nooit in een code zitten (I, L, O, 0, 1), of een link zonder code.
  function leesCode(tekst) {
    let ruw = String(tekst || '');
    const uitLink = ruw.match(/[?&#]c=([^&#\s]*)/i);
    if (uitLink) { try { ruw = decodeURIComponent(uitLink[1]); } catch { ruw = uitLink[1]; } }
    else if (/https?:|\/\/|\.html/i.test(ruw)) return { code: '', fout: true };
    else {
      const woorden = ruw.toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
      if (woorden.length > 1) {
        const woord = woorden.filter(w => w.length === CODE_LENGTE && [...w].every(teken => TEKENS.includes(teken))).pop();
        if (woord) return { code: woord, fout: false };
      }
    }
    let code = '';
    let fout = false;
    for (const teken of ruw.toUpperCase()) {
      if (TEKENS.includes(teken)) code += teken;
      else if (/[A-Z0-9]/.test(teken)) fout = true;
    }
    return { code: code.slice(0, CODE_LENGTE), fout };
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

  // Niet ingelogd: naar inloggen.html, daarna terug naar deze vakpagina met het venster weer open
  // (hetzelfde aantal via ?duel=, dezelfde hoofdstukken via sessionStorage).
  function naarInloggen(aantal, vak, hoofdstukken) {
    const thuis = new URL('../', bron).href;
    const hier = new URL(window.location.href);
    hier.hash = '';
    hier.searchParams.set('duel', String(aantal));
    const terug = hier.href.startsWith(thuis) ? hier.href.slice(thuis.length) : '';
    try {
      if (terug) window.sessionStorage.setItem('bes_terug', terug);
      window.sessionStorage.setItem(KEUZE_SLEUTEL, JSON.stringify({ vak, hoofdstukken }));
    } catch {}
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

  // Het kaartje Duel met vrienden, in dezelfde vorm als Examen Training en Examensimulatie.
  // Het is geen keuze (geen data-modus) maar een knop die het venster opent, en staat daarom buiten de radiogroep.
  function maakKaart() {
    const kaart = maak('button', 'kaart modus duel-kaart');
    kaart.type = 'button';
    kaart.dataset.actie = 'duel';
    kaart.setAttribute('aria-haspopup', 'dialog');
    const boven = maak('span', 'modus-boven');
    boven.setAttribute('aria-hidden', 'true');
    const plaatje = maak('span', 'modus-icoon');
    plaatje.append(icoon(24));
    boven.append(plaatje, maak('span', 'pijl', '→'));
    kaart.append(boven,
      maak('span', 'kaart-titel', 'Duel met vrienden'),
      maak('span', 'kaart-sub', 'Speel live tegen je vrienden. Wie het eerst drukt, mag antwoorden.'),
      maak('span', 'modus-detail', '2 tot 10 spelers'));
    return kaart;
  }

  // De radiogroep gaat naar een eigen vak rond Training en Simulatie (display: contents, het rooster blijft gelijk),
  // zodat er geen gewone knop in een radiogroep staat.
  function scheidRadiogroep(groep) {
    if (groep.getAttribute('role') !== 'radiogroup') return;
    const radios = maak('div', 'modus-radios');
    radios.setAttribute('role', 'radiogroup');
    ['aria-labelledby', 'aria-label'].forEach(naam => {
      if (groep.hasAttribute(naam)) radios.setAttribute(naam, groep.getAttribute(naam));
      groep.removeAttribute(naam);
    });
    groep.removeAttribute('role');
    const focus = document.activeElement;
    radios.append(...groep.querySelectorAll(':scope > [data-modus]'));
    groep.prepend(radios);
    if (focus && radios.contains(focus) && document.activeElement !== focus) focus.focus({ preventScroll: true });
  }

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
    if (!start || !groep || groep.querySelector('[data-actie="duel"]') || typeof BES.vakKeuze !== 'function') return;
    stijl();
    const kaart = maakKaart();
    scheidRadiogroep(groep);
    plaatsKaart(groep, kaart);

    const hoofdstukken = beschikbareHoofdstukken();
    const vakId = BES.vakKeuze()?.vak || window.BES_VAK?.id || '';

    // Het venster
    const venster = maak('dialog', 'kies-plan duel-venster');
    venster.setAttribute('aria-labelledby', 'duel-venster-kop');
    venster.setAttribute('aria-describedby', 'duel-venster-uitleg');
    const top = maak('div', 'duel-venster-top');
    const badge = maak('span', 'duel-venster-icoon');
    badge.append(icoon());
    const titels = maak('div');
    const kop = maak('h2', '', 'Duel met vrienden');
    kop.id = 'duel-venster-kop';
    titels.append(maak('p', 'duel-venster-label', 'Live met vrienden'), kop);
    top.append(badge, titels);
    const uitleg = maak('p', 'kies-plan-reden', 'Speel live met 2 tot 10 spelers. Wie het eerst drukt, mag antwoorden.');
    uitleg.id = 'duel-venster-uitleg';

    // Tabbladen
    const tabs = maak('div', 'duel-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Wat wil je doen?');
    const tabSchuif = maak('span', 'duel-tabs-schuif');
    tabSchuif.setAttribute('aria-hidden', 'true');
    tabs.append(tabSchuif);
    const panelen = maak('div', 'duel-panelen');
    // Op een smal scherm (onder 380 pixels) heet het tweede tabblad kort Met code, zodat het op één regel past.
    const tabKnoppen = [['maak', 'Duel maken'], ['mee', 'Meedoen met code', 'Met code']].map(([naam, tekst, kort]) => {
      const tab = maak('button', '', kort ? undefined : tekst);
      if (kort) tab.append(maak('span', 'duel-tab-lang', tekst), maak('span', 'duel-tab-kort', kort));
      tab.type = 'button';
      tab.id = `duel-tab-${naam}`;
      tab.dataset.tab = naam;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `duel-paneel-${naam}`);
      tabs.append(tab);
      return tab;
    });
    const maakPaneel = naam => {
      const paneel = maak('div', 'duel-paneel');
      paneel.id = `duel-paneel-${naam}`;
      paneel.dataset.paneel = naam;
      paneel.setAttribute('role', 'tabpanel');
      paneel.setAttribute('aria-labelledby', `duel-tab-${naam}`);
      return paneel;
    };
    const paneelMaak = maakPaneel('maak');
    const paneelMee = maakPaneel('mee');
    paneelMee.hidden = true;

    // Duel maken: hoofdstukken
    const hsRij = maak('div', 'duel-kop-rij');
    const hsKop = maak('p', 'duel-kop', 'Hoofdstukken');
    hsKop.id = 'duel-hs-kop';
    const acties = maak('div', 'duel-acties');
    const allesKnop = maak('button', 'duel-tekstknop', 'Alles kiezen');
    allesKnop.type = 'button';
    allesKnop.id = 'duel-hs-alles';
    const nietsKnop = maak('button', 'duel-tekstknop', 'Niets');
    nietsKnop.type = 'button';
    nietsKnop.id = 'duel-hs-niets';
    acties.append(allesKnop, nietsKnop);
    hsRij.append(hsKop, acties);
    const hsLijst = maak('div', 'duel-hs-lijst');
    hsLijst.setAttribute('role', 'group');
    hsLijst.setAttribute('aria-labelledby', 'duel-hs-kop');
    const hsKnoppen = hoofdstukken.map(hoofdstuk => {
      const rij = maak('button', 'duel-hs');
      rij.type = 'button';
      rij.dataset.hoofdstuk = hoofdstuk.id;
      rij.setAttribute('role', 'checkbox');
      rij.setAttribute('aria-checked', 'false');
      const vink = maak('span', 'duel-hs-vink', '✓');
      vink.setAttribute('aria-hidden', 'true');
      rij.append(vink, maak('span', 'duel-hs-naam', hoofdstuk.naam), maak('span', 'duel-hs-aantal', vragenTekst(hoofdstuk.aantal)));
      hsLijst.append(rij);
      return rij;
    });

    // Duel maken: aantal vragen
    const aantalVak = maak('div', 'duel-aantal');
    const aantalRij = maak('div', 'duel-kop-rij');
    const aantalKop = maak('p', 'duel-kop', 'Aantal vragen');
    aantalKop.id = 'duel-aantal-kop';
    const beschikbaarTekst = maak('span', 'duel-kop-extra');
    beschikbaarTekst.id = 'duel-beschikbaar';
    aantalRij.append(aantalKop, beschikbaarTekst);
    const segment = maak('div', 'duel-segment');
    segment.setAttribute('role', 'radiogroup');
    segment.setAttribute('aria-labelledby', 'duel-aantal-kop');
    segment.setAttribute('aria-describedby', 'duel-beschikbaar');
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
    aantalVak.append(aantalRij, segment);
    const info = maak('p', 'duel-info');
    info.setAttribute('role', 'status');
    info.hidden = true;
    paneelMaak.append(hsRij, hsLijst, aantalVak, info);

    // Meedoen met code
    const codeLabel = maak('label', 'duel-code-label', 'Code van het duel');
    codeLabel.htmlFor = 'duel-code';
    const codeVeld = maak('input', 'duel-code');
    codeVeld.id = 'duel-code';
    codeVeld.type = 'text';
    codeVeld.placeholder = '······';
    codeVeld.autocomplete = 'off';
    codeVeld.spellcheck = false;
    codeVeld.setAttribute('autocapitalize', 'characters');
    codeVeld.setAttribute('autocorrect', 'off');
    codeVeld.setAttribute('enterkeyhint', 'go');
    codeVeld.setAttribute('aria-describedby', 'duel-code-hulp');
    const codeHulp = maak('p', 'duel-code-hulp', 'Vraag de code aan wie het duel maakte.');
    codeHulp.id = 'duel-code-hulp';
    codeHulp.setAttribute('aria-live', 'polite');
    paneelMee.append(codeLabel, codeVeld, codeHulp);
    panelen.append(paneelMaak, paneelMee);

    const fout = maak('p', 'duel-fout');
    fout.setAttribute('role', 'alert');
    fout.hidden = true;

    const voet = maak('div', 'kies-plan-voet');
    const annuleer = maak('button', 'kies-plan-later', 'Annuleren');
    annuleer.type = 'button';
    const voetKnop = maak('div', 'duel-voet-knop');
    const maakKnop = maak('button', 'knop', 'Start');
    maakKnop.type = 'button';
    maakKnop.id = 'duel-maak';
    const meeKnop = maak('button', 'knop', 'Meedoen');
    meeKnop.type = 'button';
    meeKnop.id = 'duel-meedoen';
    meeKnop.disabled = true;
    meeKnop.hidden = true;
    voetKnop.append(maakKnop, meeKnop);
    voet.append(annuleer, voetKnop);
    venster.append(top, uitleg, tabs, panelen, fout, voet);
    document.body.append(venster);

    // voorkeur: wat de maker koos; gekozen: wat nu kan met de vragen van zijn hoofdstukken.
    let voorkeur = STANDAARD;
    let gekozen = STANDAARD;
    let stand = null; // { lijst, max }
    let kies = null; // Set met de gekozen hoofdstukken; null tot het venster de eerste keer opengaat.
    let tab = 'maak';
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

    // Het begin van de keuze: wat op de pagina gekozen staat (alleen hoofdstukken met duelvragen), anders alles.
    function beginKeuze(lijst) {
      const ids = new Set(hoofdstukken.map(hoofdstuk => hoofdstuk.id));
      const uit = (Array.isArray(lijst) ? lijst : []).filter(id => ids.has(id));
      return new Set(uit.length ? uit : ids);
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
      if (!kies.size) delen.push('Kies minstens één hoofdstuk.');
      else if (n < MINIMUM) delen.push(`Deze hoofdstukken hebben ${vragenTekst(n)}. Een duel heeft er minstens ${MINIMUM} nodig, dus kies meer hoofdstukken.`);
      else if (stand.max < AANTALLEN[AANTALLEN.length - 1]) delen.push(kies.size >= hoofdstukken.length
        ? `Dit vak heeft ${vragenTekst(n)} voor een duel.`
        : `Deze hoofdstukken hebben ${vragenTekst(n)}. Kies meer hoofdstukken voor een langer duel.`);
      if (ingelogd === null) delen.push('Je logt eerst in, daarna kom je hier terug.');
      return delen.join(' ');
    }

    function werkVensterBij() {
      const lijst = vragenUit([...kies]);
      const max = AANTALLEN.filter(aantal => aantal <= lijst.length).pop() || 0;
      stand = { lijst, max };
      hsKnoppen.forEach(rij => {
        const aan = kies.has(rij.dataset.hoofdstuk);
        rij.setAttribute('aria-checked', String(aan));
        rij.disabled = bezig;
      });
      allesKnop.disabled = bezig || kies.size >= hoofdstukken.length;
      nietsKnop.disabled = bezig || !kies.size;
      keuzeKnoppen.forEach(optie => { optie.disabled = bezig || Number(optie.dataset.aantal) > lijst.length; });
      if (max) kiesAantal(Math.min(voorkeur, max));
      else {
        keuzeKnoppen.forEach(optie => { optie.setAttribute('aria-checked', 'false'); optie.tabIndex = -1; });
        segment.style.setProperty('--i', '0');
      }
      schuif.hidden = !max;
      beschikbaarTekst.textContent = `${lijst.length} beschikbaar`;
      maakKnop.disabled = !max || bezig;
      zetTekst(info, infoTekst());
    }

    function zetBezig(aan) {
      bezig = aan;
      maakKnop.textContent = aan ? 'Duel maken…' : 'Start';
      tabKnoppen.forEach(knop => { knop.disabled = aan; });
      werkVensterBij();
      if (aan) venster.setAttribute('aria-busy', 'true');
      else venster.removeAttribute('aria-busy');
    }

    // Meedoen kan pas met een volledige code. Stond er iets in dat geen code kan zijn, dan staat de uitleg eronder.
    function werkCodeBij(fout = false, code = codeVeld.value) {
      const compleet = code.length === CODE_LENGTE;
      meeKnop.disabled = !compleet;
      codeVeld.classList.toggle('is-compleet', compleet);
      codeVeld.setAttribute('aria-invalid', String(fout));
      const tekst = fout ? 'Een code heeft 6 tekens, zonder I, L, O, 0 of 1.' : 'Vraag de code aan wie het duel maakte.';
      if (codeHulp.textContent !== tekst) {
        if (BES.wissel && venster.open) BES.wissel(codeHulp, () => { codeHulp.textContent = tekst; });
        else codeHulp.textContent = tekst;
      }
    }

    // Wisselen tussen de tabbladen: het oude paneel faadt weg, de hoogte schuift rustig mee en het nieuwe komt erin.
    let paneelAnimaties = [];
    function kiesTab(naam, { focus = false, beweeg = true } = {}) {
      const index = naam === 'mee' ? 1 : 0;
      tabKnoppen.forEach((knop, i) => {
        knop.setAttribute('aria-selected', String(i === index));
        knop.tabIndex = i === index ? 0 : -1;
      });
      tabs.style.setProperty('--t', String(index));
      if (focus) tabKnoppen[index].focus();
      if (naam === tab) return;
      // Een melding van het andere tabblad (bijvoorbeeld een mislukt duel) hoort hier niet.
      zetTekst(fout, '');
      const richting = index === 1 ? 1 : -1;
      tab = naam;
      const nieuw = naam === 'mee' ? paneelMee : paneelMaak;
      const oud = naam === 'mee' ? paneelMaak : paneelMee;
      // Eerst de hoogte van nu (ook midden in een vorige wissel), dan pas de vorige wissel stoppen.
      const van = panelen.getBoundingClientRect().height;
      paneelAnimaties.forEach(animatie => animatie.cancel());
      paneelAnimaties = [];
      [paneelMaak, paneelMee].forEach(paneel => { paneel.style.cssText = ''; paneel.removeAttribute('inert'); });
      panelen.style.overflow = '';
      const animeer = beweeg && venster.open && typeof panelen.animate === 'function' && !minderBeweging();
      const verloop = getComputedStyle(venster).getPropertyValue('--ease').trim() || 'ease-out';
      nieuw.hidden = false;
      if (!animeer) {
        oud.hidden = true;
        maakKnop.hidden = naam !== 'maak';
        meeKnop.hidden = naam !== 'mee';
        return;
      }
      // Het oude paneel staat even los bovenop, zodat alleen het nieuwe de hoogte bepaalt.
      Object.assign(oud.style, { position: 'absolute', top: '0', left: '0', right: '0', pointerEvents: 'none' });
      oud.setAttribute('inert', '');
      const naar = panelen.getBoundingClientRect().height;
      panelen.style.overflow = 'hidden';
      const hoogte = panelen.animate([{ height: `${van}px` }, { height: `${naar}px` }], { duration: 280, easing: verloop });
      const weg = oud.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-16 * richting}px)` }], { duration: 160, easing: verloop, fill: 'forwards' });
      const erin = nieuw.animate([{ opacity: 0, transform: `translateX(${16 * richting}px)` }, { opacity: 1, transform: 'none' }], { duration: 240, delay: 80, easing: verloop, fill: 'backwards' });
      const lopend = paneelAnimaties = [hoogte, weg, erin];
      if (BES.wissel) BES.wissel(voetKnop, () => { maakKnop.hidden = tab !== 'maak'; meeKnop.hidden = tab !== 'mee'; });
      else { maakKnop.hidden = naam !== 'maak'; meeKnop.hidden = naam !== 'mee'; }
      Promise.all(lopend.map(animatie => animatie.finished)).catch(() => {}).then(() => {
        if (paneelAnimaties !== lopend) return;
        oud.hidden = true;
        oud.style.cssText = '';
        oud.removeAttribute('inert');
        panelen.style.overflow = '';
        lopend.forEach(animatie => animatie.cancel());
        paneelAnimaties = [];
      });
    }

    function open(naam = 'maak') {
      if (venster.open) return;
      if (!kies) kies = beginKeuze(BES.vakKeuze()?.hoofdstukken);
      fout.hidden = true;
      fout.textContent = '';
      info.hidden = true;
      info.textContent = '';
      // Het venster is nog dicht: het juiste tabblad en de schuif staan meteen goed, zonder te bewegen.
      kiesTab(naam, { beweeg: false });
      paneelMaak.hidden = naam !== 'maak';
      paneelMee.hidden = naam !== 'mee';
      [paneelMaak, paneelMee].forEach(paneel => { paneel.style.cssText = ''; paneel.removeAttribute('inert'); });
      maakKnop.hidden = naam !== 'maak';
      meeKnop.hidden = naam !== 'mee';
      werkVensterBij();
      werkCodeBij();
      venster.showModal();
      (naam === 'mee' ? codeVeld : tabKnoppen[0]).focus({ preventScroll: true });
      // Alvast laden, zodat Start meteen werkt.
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
      const gekozenHoofdstukken = hoofdstukken.map(hoofdstuk => hoofdstuk.id).filter(id => kies.has(id));
      zetBezig(true);
      zetTekst(fout, '');
      try {
        if (!testDuel) {
          const gebruiker = await metTijd(BES.auth?.gebruiker?.(), 6000);
          if (gebruiker === null) { naarInloggen(aantal, vakId, gekozenHoofdstukken); return; }
          if (gebruiker) ingelogd = true;
        }
        let duel;
        try {
          duel = await laadDuel();
        } catch {
          throw Object.assign(new Error('laden'), { tekst: 'Het duel kon niet laden. Controleer je internet en probeer het opnieuw.' });
        }
        const vragen = maakVragen(stand.lijst, aantal);
        const antwoord = await duel.maak({ vak: vakId, hoofdstukken: gekozenHoofdstukken, vragen });
        if (antwoord?.ok && typeof antwoord.code === 'string' && /^[A-Za-z0-9]{4,12}$/.test(antwoord.code)) {
          window.location.assign(duelAdres(antwoord.code.toUpperCase()));
          return;
        }
        if (antwoord?.fout === 'niet_ingelogd' && !testDuel) { naarInloggen(aantal, vakId, gekozenHoofdstukken); return; }
        throw Object.assign(new Error('maak'), { tekst: foutTekst(antwoord?.fout) });
      } catch (probleem) {
        zetBezig(false);
        const tekst = probleem?.tekst || (window.navigator.onLine === false
          ? 'Je bent niet verbonden. Controleer je internet en probeer het opnieuw.'
          : 'Het duel maken lukte niet. Probeer het zo opnieuw.');
        zetTekst(fout, tekst);
      }
    }

    // Meedoen: naar duel.html?c=CODE; daar regelt duel-laden.js inloggen, een verkeerde code of een vol duel.
    function meedoen() {
      const { code } = leesCode(codeVeld.value);
      if (code.length !== CODE_LENGTE || bezig) return;
      bezig = true;
      meeKnop.disabled = true;
      venster.setAttribute('aria-busy', 'true');
      window.location.assign(duelAdres(code));
    }

    kaart.addEventListener('click', () => open());
    annuleer.addEventListener('click', sluit);
    maakKnop.addEventListener('click', maakDuel);
    meeKnop.addEventListener('click', meedoen);

    tabKnoppen.forEach(knop => knop.addEventListener('click', () => { if (!knop.disabled) kiesTab(knop.dataset.tab); }));
    tabs.addEventListener('keydown', event => {
      const nu = tabKnoppen.indexOf(document.activeElement);
      if (nu < 0 || bezig || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const doel = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : (nu + 1) % 2;
      kiesTab(tabKnoppen[doel].dataset.tab, { focus: true });
    });

    hsKnoppen.forEach(rij => rij.addEventListener('click', () => {
      if (rij.disabled) return;
      const id = rij.dataset.hoofdstuk;
      if (kies.has(id)) kies.delete(id);
      else kies.add(id);
      werkVensterBij();
    }));
    allesKnop.addEventListener('click', () => {
      hoofdstukken.forEach(hoofdstuk => kies.add(hoofdstuk.id));
      werkVensterBij();
      // De knop staat nu uit: de focus naar de buurknop, zodat hij niet verloren gaat.
      nietsKnop.focus({ preventScroll: true });
    });
    nietsKnop.addEventListener('click', () => {
      kies.clear();
      werkVensterBij();
      allesKnop.focus({ preventScroll: true });
    });

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

    // De code: hoofdletters, alleen geldige tekens, en een geplakte link wordt de code uit die link.
    // Toetsenborden op Android typen in een "compositie": dan de tekst nog niet aanpassen (anders loopt het typen mis),
    // maar Meedoen wel al bijwerken. Is het woord klaar (compositionend), dan wordt de tekst alsnog de code.
    const schoonCode = event => {
      const { code, fout: verkeerd } = leesCode(codeVeld.value);
      if (!event?.isComposing && codeVeld.value !== code) codeVeld.value = code;
      werkCodeBij(verkeerd, code);
    };
    codeVeld.addEventListener('input', schoonCode);
    codeVeld.addEventListener('compositionend', () => schoonCode());
    codeVeld.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      meedoen();
    });

    venster.addEventListener('cancel', event => { event.preventDefault(); sluit(); });
    venster.addEventListener('click', event => {
      if (event.target !== venster) return;
      const r = venster.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) sluit();
    });
    // Dicht: de focus terug op het kaartje. De pagina zelf veranderde niet (Training of Simulatie blijft gekozen).
    venster.addEventListener('close', () => {
      if (kaart.isConnected && kaart.getClientRects().length) kaart.focus({ preventScroll: true });
    });

    // Terug van inloggen (?duel=10): het venster weer open met hetzelfde aantal en dezelfde hoofdstukken.
    if (params.has('duel')) {
      const terugAantal = Number(params.get('duel'));
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('duel');
        window.history.replaceState(window.history.state, '', url);
      } catch {}
      let bewaard = null;
      try {
        bewaard = JSON.parse(window.sessionStorage.getItem(KEUZE_SLEUTEL) || 'null');
        window.sessionStorage.removeItem(KEUZE_SLEUTEL);
      } catch {}
      if (bewaard && bewaard.vak === vakId && Array.isArray(bewaard.hoofdstukken)) kies = beginKeuze(bewaard.hoofdstukken);
      if (AANTALLEN.includes(terugAantal)) {
        voorkeur = terugAantal;
        Promise.resolve(BES.auth?.gereed).then(() => BES.auth?.gebruiker?.()).then(gebruiker => {
          if (!gebruiker) return;
          ingelogd = true;
          open();
        }).catch(() => {});
      }
    }

    // Terug met de knop Vorige (pagina uit het geheugen van de browser): niet meer bezig, venster dicht.
    window.addEventListener('pageshow', event => {
      if (!event.persisted) return;
      if (bezig) zetBezig(false);
      werkCodeBij();
      if (venster.open) venster.close();
    });

    BES.duelStart = {
      open, vragenUit, maakVragen, leesCode,
      keuze: () => (kies ? { vak: vakId, hoofdstukken: hoofdstukken.map(hoofdstuk => hoofdstuk.id).filter(id => kies.has(id)) } : null)
    };
  }

  // Het kaartje komt er alleen voor accounts die het duel mogen zien (duel-toegang.js). Laadde dat bestand niet: geen kaartje.
  const beginAlsHetMag = async () => {
    const mag = BES.duelToegang ? await BES.duelToegang() : false;
    if (mag === true) begin();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', beginAlsHetMag, { once: true });
  else beginAlsHetMag();
})();
