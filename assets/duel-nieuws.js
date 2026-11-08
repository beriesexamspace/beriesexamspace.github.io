// Pop-up Nieuwe feature: Duel (alleen op de hub, één keer per toestel, alleen ingelogd).
// Drie schermen in één venster: uitleg -> kies je jaar -> kies je vak. Een vak kiezen gaat naar vak/<id>/?duel=10:
// daar opent duel-start.js meteen het kiesscherm met hoofdstukken en aantal vragen. Daarna is alles zoals altijd.
(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  if (BES.duelNieuws) return;

  const SLEUTEL = 'bes_duel_nieuws_gezien';
  // Welke jaren bij een richting horen (zelfde lijst als profiel.html). Onbekend = Psychologie.
  const JAREN = { 'vub-psychologie': ['1ba', '2ba', '3ba'], 'vub-criminologie': ['crim1', 'crim2', 'crim3'], 'um-rechtsgeleerdheid': ['um1', 'um2', 'um3'] };
  const JAARNAAM = ['1ste bachelor', '2de bachelor', '3de bachelor'];

  const maak = (tag, klasse, tekst) => {
    const el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (tekst) el.textContent = tekst;
    return el;
  };
  const knop = (tekst, klasse, klik) => {
    const b = maak('button', klasse, tekst);
    b.type = 'button';
    b.addEventListener('click', klik);
    return b;
  };

  const stijl = () => {
    if (document.getElementById('duel-nieuws-stijl')) return;
    const s = maak('style');
    s.id = 'duel-nieuws-stijl';
    s.textContent = [
      '.duel-nieuws { width: min(420px, calc(100% - 32px)); }',
      '.duel-nieuws-intro { display: flex; flex-direction: column; align-items: center; text-align: center; }',
      '.duel-nieuws-label { display: block; margin: 0 0 14px; color: var(--accent); font-size: .6875rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }',
      '.duel-nieuws-buzzer { position: relative; display: grid; place-items: center; width: 96px; height: 96px; margin: 8px 0 22px; padding: 0; border: 0; border-radius: 50%; background: var(--accent); color: #fff; cursor: pointer; box-shadow: 0 6px 0 color-mix(in srgb, var(--accent) 55%, #000), 0 14px 30px color-mix(in srgb, var(--accent) 35%, transparent); transition: transform 120ms var(--ease, ease-out), box-shadow 120ms var(--ease, ease-out); animation: duel-nieuws-pop 520ms var(--ease, ease-out) 120ms both; }',
      '.duel-nieuws-buzzer svg { width: 44px; height: 44px; fill: currentColor; animation: duel-nieuws-flits 2.4s var(--ease, ease-out) 700ms infinite; }',
      '.duel-nieuws-buzzer::before, .duel-nieuws-buzzer::after { content: ""; position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--accent); opacity: 0; animation: duel-nieuws-ring 2.4s var(--ease, ease-out) 700ms infinite; pointer-events: none; }',
      '.duel-nieuws-buzzer::after { animation-delay: 1.1s; }',
      '.has-hover .duel-nieuws-buzzer:hover { transform: translateY(-2px); }',
      '.duel-nieuws-buzzer:active, .duel-nieuws-buzzer.is-gedrukt { transform: translateY(5px); box-shadow: 0 1px 0 color-mix(in srgb, var(--accent) 55%, #000), 0 6px 14px color-mix(in srgb, var(--accent) 30%, transparent); }',
      '.duel-nieuws-intro h2 { margin: 0 0 6px; font-size: 1.75rem; }',
      '.duel-nieuws-zin { margin: 0 0 16px; color: var(--ink-soft); line-height: 1.45; text-wrap: balance; }',
      '.duel-nieuws-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 0 0 22px; padding: 0; list-style: none; }',
      '.duel-nieuws-chips li { padding: 6px 12px; border-radius: var(--pill, 999px); background: var(--surface); color: var(--ink); font-size: .8125rem; font-weight: 600; }',
      '.duel-nieuws-intro .knop { justify-content: center; width: 100%; min-height: 48px; }',
      '.duel-nieuws-intro .kies-plan-later { margin-top: 4px; }',
      '@keyframes duel-nieuws-pop { from { opacity: 0; transform: scale(.6); } 70% { opacity: 1; transform: scale(1.06); } to { opacity: 1; transform: none; } }',
      '@keyframes duel-nieuws-ring { 0% { opacity: .55; transform: scale(1); } 70%, 100% { opacity: 0; transform: scale(1.55); } }',
      '@keyframes duel-nieuws-flits { 0%, 86%, 100% { transform: none; } 90% { transform: rotate(-8deg) scale(1.1); } 94% { transform: rotate(6deg) scale(1.05); } }',
      '@media (prefers-reduced-motion: reduce) { .duel-nieuws-buzzer, .duel-nieuws-buzzer svg, .duel-nieuws-buzzer::before, .duel-nieuws-buzzer::after { animation: none; } }',
      '.duel-nieuws .kies-plan-voet { margin-top: 4px; }',
      '#duel-nieuws-kop { margin-bottom: 14px; }',
      '.duel-nieuws-intro #duel-nieuws-kop { margin-bottom: 6px; }',
      '.duel-nieuws-lijst { display: flex; flex-direction: column; gap: 8px; margin: 0 0 4px; }',
      '.duel-nieuws-lijst button { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 52px; padding: 12px 16px; border: 1px solid var(--line); border-radius: 14px; background: var(--card); color: var(--ink); font: inherit; font-size: .9375rem; font-weight: 600; text-align: left; overflow-wrap: anywhere; cursor: pointer; transition: border-color 160ms var(--ease, ease-out), transform 160ms var(--ease, ease-out); }',
      '.duel-nieuws-lijst button:active { transform: scale(.99); }',
      '.has-hover .duel-nieuws-lijst button:hover { border-color: var(--accent); }',
      '.duel-nieuws-extra { flex: none; color: var(--ink-soft); font-size: .875rem; font-weight: 400; }',
      '@media (max-width: 480px) { .duel-nieuws .kies-plan-voet { flex-direction: column-reverse; align-items: stretch; gap: 4px; } .duel-nieuws .kies-plan-voet .knop, .duel-nieuws .kies-plan-later { justify-content: center; } }'
    ].join('\n');
    document.head.append(s);
  };

  const richtingVan = async () => {
    let richting = null;
    try { richting = window.localStorage.getItem('bes_richting'); } catch {}
    try { richting = (await BES.auth?.richting?.()) || richting; } catch {}
    return JAREN[richting] ? richting : 'vub-psychologie';
  };

  BES.duelNieuws = async (pogingen = 10) => {
    try { if (window.localStorage.getItem(SLEUTEL)) return; } catch { return; }
    if (typeof HTMLDialogElement !== 'function') return;
    // Het duel kan alleen met een account.
    let gebruiker = null;
    try { await BES.auth?.gereed; gebruiker = await BES.auth?.gebruiker?.(); } catch {}
    if (!gebruiker) return;
    // Staat er al een venster open (zoals Er is geen abonnement meer): later nog eens proberen.
    if (document.querySelector('dialog[open]')) {
      if (pogingen > 0) window.setTimeout(() => BES.duelNieuws(pogingen - 1), 3000);
      return;
    }
    try { if (window.localStorage.getItem(SLEUTEL)) return; window.localStorage.setItem(SLEUTEL, '1'); } catch { return; }

    const jaren = JAREN[await richtingVan()];
    const vakken = (window.BES_VAKKEN || []).filter(v => jaren.includes(v.jaar));
    stijl();

    const venster = maak('dialog', 'kies-plan duel-nieuws');
    venster.setAttribute('aria-labelledby', 'duel-nieuws-kop');
    const inhoud = maak('div');
    venster.append(inhoud);
    const sluit = () => BES.sluitDialoog ? BES.sluitDialoog(venster) : venster.close();

    // Wissel rustig van scherm (BES.wissel uit app.js), daarna de focus op de kop van het nieuwe scherm.
    const toon = async (bouw, eerste) => {
      const zet = () => { inhoud.replaceChildren(...bouw()); };
      if (eerste || !BES.wissel) zet(); else await BES.wissel(inhoud, zet);
      const kop = inhoud.querySelector('h2');
      if (kop && !eerste) { kop.tabIndex = -1; kop.focus({ preventScroll: true }); }
    };

    const kopje = tekst => { const h = maak('h2', '', tekst); h.id = 'duel-nieuws-kop'; return h; };

    // De bliksem van het duel (zelfde vorm als in duel-start.js).
    const bliksem = () => {
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      const pad = document.createElementNS(ns, 'path');
      pad.setAttribute('d', 'M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z');
      svg.append(pad);
      return svg;
    };

    // Eerste scherm: kort en speels. De buzzer zelf is ook een knop: indrukken en door.
    const verder = buzzer => {
      if (buzzer) buzzer.classList.add('is-gedrukt');
      window.setTimeout(() => toon(kiesJaar), buzzer ? 140 : 0);
    };
    const uitleg = () => {
      const blok = maak('div', 'duel-nieuws-intro');
      const buzzer = maak('button', 'duel-nieuws-buzzer');
      buzzer.type = 'button';
      buzzer.setAttribute('aria-label', 'Druk op de buzzer en probeer een duel');
      buzzer.append(bliksem());
      buzzer.addEventListener('click', () => verder(buzzer));
      const chips = maak('ul', 'duel-nieuws-chips');
      ['2 tot 10 spelers', 'Jouw vak', 'Live'].forEach(tekst => chips.append(maak('li', '', tekst)));
      blok.append(
        maak('span', 'duel-nieuws-label', "Nieuwe feature op Berie's Exam Space"),
        buzzer,
        kopje('Duel'),
        maak('p', 'duel-nieuws-zin', 'Wie van je vrienden heeft het best geleerd? Maak een duel en bewijs wie je bent.'),
        chips,
        knop('Probeer een duel', 'knop', () => verder(null)),
        knop('Later', 'kies-plan-later', sluit)
      );
      return [blok];
    };

    const kiesJaar = () => {
      const lijst = maak('div', 'duel-nieuws-lijst');
      jaren.forEach((jaar, i) => {
        const n = vakken.filter(v => v.jaar === jaar).length;
        if (!n) return;
        const b = knop(JAARNAAM[i], '', () => toon(() => kiesVak(jaar, JAARNAAM[i])));
        b.append(maak('span', 'duel-nieuws-extra', n + (n === 1 ? ' vak' : ' vakken')));
        lijst.append(b);
      });
      const voet = maak('div', 'kies-plan-voet');
      voet.append(knop('Terug', 'kies-plan-later', () => toon(uitleg)), knop('Later', 'kies-plan-later', sluit));
      return [kopje('In welk jaar zit je?'), lijst, voet];
    };

    const kiesVak = (jaar, naam) => {
      const lijst = maak('div', 'duel-nieuws-lijst');
      vakken.filter(v => v.jaar === jaar).forEach(v => {
        lijst.append(knop(v.naam, '', () => {
          window.location.assign('vak/' + encodeURIComponent(v.id) + '/?duel=10');
        }));
      });
      const voet = maak('div', 'kies-plan-voet');
      voet.append(knop('Terug', 'kies-plan-later', () => toon(kiesJaar)), knop('Later', 'kies-plan-later', sluit));
      return [kopje('Kies je vak'), maak('p', 'kies-plan-reden', naam + '. Daarna kies je hoofdstukken en aantal vragen.'), lijst, voet];
    };

    toon(uitleg, true);
    venster.addEventListener('click', event => {
      if (event.target !== venster) return;
      const r = venster.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) sluit();
    });
    venster.addEventListener('cancel', event => { event.preventDefault(); sluit(); });
    venster.addEventListener('close', () => venster.remove());
    document.body.append(venster);
    venster.showModal();
    venster.querySelector('.duel-nieuws-intro .knop')?.focus({ preventScroll: true });
  };
})();
