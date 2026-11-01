// Kaart op de startpagina (kaart.html). Gemaakt uit het goedgekeurde prototype met beries-werk/prototype/kaart/maak-kaartpagina.js.
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const svgNS = 'http://www.w3.org/2000/svg';
  const CAT = window.BES_CATALOGUS, KAART = window.BES_KAART;
  // De omtrek van België en Nederland en de meren (Natural Earth), uit assets/kaart-data.js.
  $('land-nl').setAttribute('d', KAART.nl); $('land-be').setAttribute('d', KAART.be); $('meren').setAttribute('d', KAART.meren);
  $('dam').setAttribute('d', KAART.dam.vlak); $('dam-rand').setAttribute('d', KAART.dam.rand);

  // Lengte- en breedtegraad naar een punt op de kaart: dezelfde projectie als de omtrek (zie maak-sitekaart.js).
  const opKaart = (lat, lon) => {
    const P = KAART.projectie, rad = Math.PI / 180, f0 = P.lat0 * rad, l0 = P.lon0 * rad, f = lat * rad, l = lon * rad;
    const k = Math.sqrt(2 / (1 + Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l - l0)));
    const x = k * Math.cos(f) * Math.sin(l - l0), y = -k * (Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l - l0));
    return [+((x - P.minX) * P.schaal + P.marge).toFixed(1), +((y - P.minY) * P.schaal + P.marge).toFixed(1)];
  };
  // Elke school met een vaste plek komt op de kaart (de tUL is een samenwerking zonder eigen plek).
  const SCHOLEN = CAT.scholen.filter(s => s.lat != null && s.lng != null).map(s => {
    const [x, y] = opKaart(s.lat, s.lng);
    return { id: s.id, naam: s.naam, afk: s.kort[0], stad: s.stad, land: s.land, x, y };
  });
  const UITLEG = { live: 'Er staan al vakken klaar', binnenkort: 'De eerste vakken worden gemaakt', leeg: 'Nog geen leerstof' };
  const LIVE_UITLEG = { 'vub-psychologie': '34 vakken, 1ste tot 3de bachelor' };
  const CHIP = { live: { klasse: 'live', tekst: 'Beschikbaar' }, binnenkort: { klasse: 'later', tekst: 'Binnenkort' }, leeg: { klasse: '', tekst: 'Nog niets' } };
  const richtingenVan = s => CAT.richtingenVan(s.id).map(r => ({ id: r.id, naam: r.naam, status: r.status, uitleg: r.status === 'live' ? (LIVE_UITLEG[r.id] || UITLEG.live) : UITLEG[r.status] }));
  const live = s => richtingenVan(s).some(r => r.status === 'live');
  const telTekst = s => {
    const r = richtingenVan(s), l = r.filter(x => x.status === 'live').length, b = r.filter(x => x.status === 'binnenkort').length;
    if (!l && !b) return 'Nog geen leerstof';
    return [l ? l + (l === 1 ? ' richting' : ' richtingen') : '', b ? b + ' binnenkort' : ''].filter(Boolean).join(', ');
  };
  const AANMELDEN = 'aanmelden.html';
  const insturenVoor = s => 'insturen/formulier.html?school=' + encodeURIComponent(s.id);
  // Mail mij als het er is: pas aan als de wachtlijst bestaat (tabel, bevestigingsmail, afmelden, privacytekst).
  const WACHTLIJST = false;
  const maak = (tag, klasse, tekst) => { const e = document.createElement(tag); if (klasse) e.className = klasse; if (tekst) e.textContent = tekst; return e; };

  // Kaart zoals Google Maps: slepen in alle richtingen, zoomen met het muiswiel of trackpad, knijpen met twee vingers.
  // Elke school heeft een eigen stip. Liggen stippen op het scherm te dicht bij elkaar, dan schuiven ze uit elkaar,
  // zodat ze nooit tegen elkaar liggen. Hoe verder je inzoomt, hoe dichter ze bij hun echte plek staan.
  const kaart = $('kaart');
  const rustig = matchMedia('(prefers-reduced-motion: reduce)');
  const tip = $('tip');
  const groepen = SCHOLEN.map(s => ({ x: s.x, y: s.y, ox: s.x, oy: s.y, s }));
  const STRAAL = { vol: 5.5, leeg: 4.2 }, HALO = 5, AFSTAND_PX = 26;

  const basis = kaart.viewBox.baseVal;
  const B = { x: basis.x, y: basis.y, w: basis.width, h: basis.height };
  const GRENS = { x0: -10, y0: -70, x1: 446, y1: 610 };
  const view = { w: B.w / 1.25, h: B.h / 1.25 };
  view.x = B.x + (B.w - view.w) / 2; view.y = B.y + (B.h - view.h) / 2;
  const MIN_W = B.w / 8, MAX_W = GRENS.x1 - GRENS.x0;
  // Op een telefoon toont de stip in het midden pas zijn naam als je minstens twee keer bent ingezoomd: de kaart is dan half zo breed als bij de start.
  const NAAM_W = view.w / 2;
  const eenheid = () => { const r = kaart.getBoundingClientRect(); return Math.max(view.w / r.width, view.h / r.height); };
  // Schermpunt naar kaartpunt (de kaart staat gecentreerd in het scherm).
  const naarKaart = (cx, cy) => {
    const r = kaart.getBoundingClientRect(), u = eenheid();
    return [view.x + (cx - r.left - (r.width - view.w / u) / 2) * u, view.y + (cy - r.top - (r.height - view.h / u) / 2) * u];
  };

  // Stippen uit elkaar duwen tot ze op het scherm minstens AFSTAND_PX uit elkaar staan.
  let laatsteU = 0;
  const spreid = () => {
    const u = eenheid(); if (Math.abs(u - laatsteU) < 1e-6) return; laatsteU = u;
    const D = AFSTAND_PX * u;
    groepen.forEach(g => { g.x = g.ox; g.y = g.oy; });
    for (let ronde = 0; ronde < 120; ronde++) {
      let geduwd = false;
      for (let a = 0; a < groepen.length; a++) for (let b = a + 1; b < groepen.length; b++) {
        const p = groepen[a], q = groepen[b];
        let vx = q.x - p.x, vy = q.y - p.y, d = Math.hypot(vx, vy);
        if (d >= D) continue;
        if (d < D * 1e-3) { const hoek = (a * 2.399 + b) % (2 * Math.PI); vx = Math.cos(hoek); vy = Math.sin(hoek); d = 1; }
        const duw = (D - d) / 2 / d; p.x -= vx * duw; p.y -= vy * duw; q.x += vx * duw; q.y += vy * duw; geduwd = true;
      }
      if (!geduwd) break;
    }
    groepen.forEach(g => {
      const straal = (live(g.s) ? STRAAL.vol : STRAAL.leeg) * u;
      [g.golf, g.halo, g.kern].filter(Boolean).forEach(c => { c.setAttribute('cx', g.x); c.setAttribute('cy', g.y); });
      g.kern.setAttribute('r', straal); g.halo.setAttribute('r', straal + HALO * u); if (g.golf) g.golf.setAttribute('r', straal);
      // Onzichtbaar tikvlak: zo groot als de afstand tussen de stippen toelaat, zodat ze elkaar niet overlappen.
      g.raak.setAttribute('cx', g.x); g.raak.setAttribute('cy', g.y); g.raak.setAttribute('r', AFSTAND_PX / 2 * u);
    });
  };
  const zet = () => {
    if (view.w > GRENS.x1 - GRENS.x0) view.x = (GRENS.x0 + GRENS.x1 - view.w) / 2; else view.x = Math.min(Math.max(view.x, GRENS.x0), GRENS.x1 - view.w);
    if (view.h > GRENS.y1 - GRENS.y0) view.y = (GRENS.y0 + GRENS.y1 - view.h) / 2; else view.y = Math.min(Math.max(view.y, GRENS.y0), GRENS.y1 - view.h);
    kaart.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
    spreid(); verbergTip(); toonMidden();
  };
  const zoomRond = (factor, cx, cy) => {
    const [px, py] = naarKaart(cx, cy);
    const nw = Math.min(MAX_W, Math.max(MIN_W, view.w / factor)), f = nw / view.w;
    view.x = px - (px - view.x) * f; view.y = py - (py - view.y) * f; view.w = nw; view.h = view.h * f; zet();
  };

  // Slepen met uitloop, en knijpen met twee vingers.
  const vingers = new Map();
  let sleep = null, knijp = null, uitloop = 0;
  kaart.addEventListener('pointerdown', e => {
    cancelAnimationFrame(uitloop); vingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (vingers.size === 2) {
      const [a, b] = [...vingers.values()]; sleep = null;
      knijp = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      return;
    }
    sleep = { id: e.pointerId, x: e.clientX, y: e.clientY, vx0: view.x, vy0: view.y, lx: e.clientX, ly: e.clientY, laatst: performance.now(), snelX: 0, snelY: 0, bewogen: false };
  });
  window.addEventListener('pointermove', e => {
    if (!vingers.has(e.pointerId)) return;
    vingers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (knijp && vingers.size === 2) {
      const [a, b] = [...vingers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const u = eenheid(); view.x -= (mx - knijp.mx) * u; view.y -= (my - knijp.my) * u;
      zoomRond(d / knijp.d, mx, my); knijp = { d, mx, my }; kaart.dataset.net = '1'; return;
    }
    if (!sleep || e.pointerId !== sleep.id) return;
    const mx = e.clientX - sleep.x, my = e.clientY - sleep.y;
    if (!sleep.bewogen && Math.hypot(mx, my) < 5) return;
    if (!sleep.bewogen) { sleep.bewogen = true; kaart.classList.add('slepen'); }
    const nu = performance.now(), dt = Math.max(1, nu - sleep.laatst);
    sleep.snelX = (e.clientX - sleep.lx) / dt; sleep.snelY = (e.clientY - sleep.ly) / dt;
    sleep.lx = e.clientX; sleep.ly = e.clientY; sleep.laatst = nu;
    const u = eenheid(); view.x = sleep.vx0 - mx * u; view.y = sleep.vy0 - my * u; zet();
  });
  const los = e => {
    vingers.delete(e.pointerId);
    if (knijp) { if (vingers.size < 2) { knijp = null; setTimeout(() => { delete kaart.dataset.net; }, 0); } return; }
    if (!sleep || e.pointerId !== sleep.id) return;
    const s = sleep; sleep = null; kaart.classList.remove('slepen');
    if (!s.bewogen) return;
    kaart.dataset.net = '1'; setTimeout(() => { delete kaart.dataset.net; }, 0);
    if (rustig.matches || performance.now() - s.laatst > 80) return;
    let vx = s.snelX, vy = s.snelY, vorige = performance.now();
    const stap = nu => {
      const dt = nu - vorige; vorige = nu; const u = eenheid();
      view.x -= vx * dt * u; view.y -= vy * dt * u; zet();
      const rem = Math.pow(0.94, dt / 16); vx *= rem; vy *= rem;
      if (Math.hypot(vx, vy) > 0.02) uitloop = requestAnimationFrame(stap);
    };
    uitloop = requestAnimationFrame(stap);
  };
  window.addEventListener('pointerup', los);
  window.addEventListener('pointercancel', los);
  // Muiswiel en trackpad zoomen rond de muis, zoals Google Maps.
  kaart.addEventListener('wheel', e => {
    e.preventDefault(); cancelAnimationFrame(uitloop);
    const sterkte = e.ctrlKey ? 0.012 : (e.deltaMode === 1 ? 0.05 : 0.0022);
    zoomRond(Math.exp(-e.deltaY * sterkte), e.clientX, e.clientY);
  }, { passive: false });

  const toonTip = g => {
    const r = g.kern.getBoundingClientRect();
    tip.style.left = (r.left + r.width / 2) + 'px'; tip.style.top = r.top + 'px';
    tip.replaceChildren(maak('b', '', g.s.naam), g.s.stad + ' · ' + telTekst(g.s));
    tip.classList.add('zichtbaar');
  };
  function verbergTip() { tip.classList.remove('zichtbaar'); }

  groepen.forEach((g, i) => {
    const s = g.s, leeg = !live(s);
    const el = document.createElementNS(svgNS, 'g');
    el.setAttribute('class', 'punt' + (leeg ? ' leeg' : ''));
    el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
    el.setAttribute('aria-label', s.naam + ', ' + telTekst(s));
    // De stippen verschijnen na de kaart, van noord naar zuid; waar al vakken zijn, pulseert een zachte golf.
    el.style.animationDelay = (450 + g.oy * 0.9 + i * 6) + 'ms';
    g.raak = document.createElementNS(svgNS, 'circle'); g.raak.setAttribute('class', 'raak');
    g.halo = document.createElementNS(svgNS, 'circle'); g.halo.setAttribute('class', 'halo');
    g.kern = document.createElementNS(svgNS, 'circle'); g.kern.setAttribute('class', 'kern');
    if (!leeg) { g.golf = document.createElementNS(svgNS, 'circle'); g.golf.setAttribute('class', 'golf'); }
    el.append(...[g.raak, g.golf, g.halo, g.kern].filter(Boolean));
    el.addEventListener('mouseenter', () => toonTip(g));
    el.addEventListener('mouseleave', verbergTip);
    // Alleen bij het toetsenbord: na het sluiten van het venster komt de focus hier terug, dan geen tooltip.
    el.addEventListener('focus', () => { if (el.matches(':focus-visible')) toonTip(g); });
    el.addEventListener('blur', verbergTip);
    const open = () => { if (kaart.dataset.net) return; verbergTip(); openSchool(s); };
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    $('punten').append(el); g.el = el;
  });

  // Telefoon: daar is geen muis, dus geen hover. De stip die ongeveer in het midden van de kaart staat, toont zelf zijn naam
  // zodra je genoeg bent ingezoomd (NAAM_W). Twee naamkaartjes om beurten: het oude faadt uit terwijl het nieuwe infaadt, zodat niets springt.
  const geenMuis = matchMedia('(hover: none)');
  const naamkaartjes = [0, 1].map(() => { const t = maak('div', 'tip midden-tip'); t.setAttribute('aria-hidden', 'true'); tip.after(t); return t; });
  let middenG = null, middenKaartje = null, midden = null;
  // Het midden van de vrije kaart: tussen de zoekbalk en de knoppen onderaan.
  const middenVanKaart = () => midden || (midden = [innerWidth / 2, ($('zoek').getBoundingClientRect().bottom + document.querySelector('.onder').getBoundingClientRect().top) / 2]);
  // Het kaartje staat boven zijn stip en blijft binnen het scherm.
  const plaatsKaartje = t => {
    const g = t.g, w = t.offsetWidth;
    t.style.left = Math.min(Math.max(g.sx, 12 + w / 2), innerWidth - 12 - w / 2) + 'px';
    t.style.top = (g.sy - (live(g.s) ? STRAAL.vol : STRAAL.leeg) * 1.18) + 'px';
  };
  function toonMidden() {
    let kies = null;
    if (geenMuis.matches && view.w <= NAAM_W && !document.documentElement.classList.contains('kaart-intro') && !$('venster').open) {
      const r = kaart.getBoundingClientRect(), u = eenheid(), [mx, my] = middenVanKaart();
      const R = Math.min(90, Math.max(48, Math.min(innerWidth, innerHeight) * .16));
      groepen.forEach(g => {
        g.sx = r.left + (r.width - view.w / u) / 2 + (g.x - view.x) / u; g.sy = r.top + (r.height - view.h / u) / 2 + (g.y - view.y) / u;
        g.d = Math.hypot(g.sx - mx, g.sy - my);
        if (!kies || g.d < kies.d) kies = g;
      });
      if (kies && kies.d > R) kies = null;
      // De stip die zijn naam al toont, houdt die tot hij uit het midden gaat of een andere stip duidelijk dichter staat.
      if (middenG && middenG !== kies && middenG.d <= R * 1.2 && (!kies || middenG.d - kies.d < 12)) kies = middenG;
    }
    if (kies !== middenG) {
      const oud = middenKaartje;
      if (middenG) middenG.el.classList.remove('midden');
      if (oud) oud.classList.remove('zichtbaar');
      middenG = kies; middenKaartje = null;
      if (kies) {
        const t = naamkaartjes[0] === oud ? naamkaartjes[1] : naamkaartjes[0];
        t.g = kies; t.replaceChildren(maak('b', '', kies.s.naam), kies.s.stad + ' · ' + telTekst(kies.s));
        kies.el.classList.add('midden'); t.classList.add('zichtbaar'); middenKaartje = t;
      }
    }
    // Ook het kaartje dat nog uitfaadt, volgt zijn stip.
    naamkaartjes.forEach(t => { if (t.g) plaatsKaartje(t); });
  }
  geenMuis.addEventListener('change', toonMidden);
  zet();
  window.addEventListener('resize', () => { laatsteU = 0; midden = null; zet(); });

  // Het venster: school kiezen in een groep, richting kiezen, account, lijst.
  const venster = $('venster'), inhoud = $('venster-inhoud');
  // Sluiten met een korte animatie (ook bij Escape en een klik naast het venster).
  const sluit = () => {
    if (!venster.open || venster.classList.contains('sluiten')) return;
    if (rustig.matches) { venster.close(); return; }
    venster.classList.add('sluiten');
    setTimeout(() => { venster.close(); venster.classList.remove('sluiten'); }, 200);
  };
  venster.addEventListener('cancel', e => { e.preventDefault(); sluit(); });
  // Met het venster open faadt het naamkaartje in het midden weg; na het sluiten komt het terug.
  venster.addEventListener('close', toonMidden);
  venster.addEventListener('click', e => { if (e.target === venster) sluit(); });
  const kop = (titel, sub) => {
    const k = maak('div', 'venster-kop'); const tekst = maak('div'); const h = maak('h2', '', titel); h.id = 'venster-titel'; tekst.append(h);
    if (sub) tekst.append(maak('p', '', sub));
    const s = maak('button', 'sluit', '×'); s.type = 'button'; s.setAttribute('aria-label', 'Sluiten'); s.addEventListener('click', sluit);
    k.append(tekst, s); return k;
  };
  // Wisselt de inhoud terwijl het venster al open is, dan groeit of krimpt het vloeiend mee: niets springt.
  const toon = (...delen) => {
    const was = venster.open && !rustig.matches ? inhoud.offsetHeight : 0;
    inhoud.replaceChildren(...delen);
    if (!venster.open) { venster.showModal(); toonMidden(); }
    const nu = inhoud.offsetHeight;
    if (was && Math.abs(nu - was) > 1) {
      inhoud.style.overflow = 'hidden';
      inhoud.animate([{ height: was + 'px' }, { height: nu + 'px' }], { duration: 320, easing: 'cubic-bezier(.2, .8, .2, 1)' }).finished
        .then(() => { inhoud.style.overflow = ''; }, () => {});
    }
    const f = inhoud.querySelector('input:not([data-niet-eerst]), .richting, .school, .kaart-knop'); if (f) f.focus({ preventScroll: true });
  };
  const schoolKnop = s => {
    const b = maak('button', 'school'); b.type = 'button';
    const tekst = maak('span'); tekst.append(maak('strong', '', s.naam), maak('small', '', s.stad));
    b.append(tekst, maak('span', 'chip' + (live(s) ? ' live' : ''), live(s) ? 'Beschikbaar' : 'Nog niets'));
    b.addEventListener('click', () => openSchool(s));
    return b;
  };

  function openGroep(g) {
    const lijst = maak('div', 'richtingen'); g.scholen.forEach(s => lijst.append(schoolKnop(s)));
    toon(kop(g.scholen[0].stad, g.scholen.length + ' scholen'), maak('p', 'vraag', 'Welke school?'), lijst);
  }

  // Schuift een blok open of dicht zonder sprong. Alleen tijdens de beweging wordt de inhoud afgesneden.
  const schuif = (blok, open) => {
    if (rustig.matches) { blok.hidden = !open; return; }
    blok.hidden = false;
    const hoog = blok.scrollHeight;
    blok.style.overflow = 'hidden';
    const van = { height: (open ? 0 : hoog) + 'px', opacity: open ? 0 : 1 }, naar = { height: (open ? hoog : 0) + 'px', opacity: open ? 1 : 0 };
    blok.animate([van, naar], { duration: 320, easing: 'cubic-bezier(.2, .8, .2, 1)' }).finished
      .then(() => { blok.style.overflow = ''; if (!open) blok.hidden = true; }, () => {});
  };
  const schuifBlok = (...delen) => { const blok = maak('div'); const stap = maak('div', 'mail-stap'); stap.append(...delen); blok.append(stap); return blok; };

  // Mail mij als het er is. Eerst alleen de vraag met een knop; na een klik schuift het e-mailveld open.
  // Alleen in gebruik als WACHTLIJST aan staat.
  const mailBlok = (id, wanneer, vraag) => {
    const vorm = maak('form', 'mailblok'); vorm.noValidate = true;
    const uitleg = maak('p', 'mail-vraag', vraag + ' Laat je e-mail achter en blijf op de hoogte.'); uitleg.id = id + '-uitleg';
    const open = maak('button', 'tekstknop', 'Laat je e-mail achter'); open.type = 'button';
    const veld = maak('input'); veld.type = 'email'; veld.id = id; veld.required = true; veld.autocomplete = 'email'; veld.placeholder = 'Je e-mailadres';
    veld.setAttribute('aria-label', 'Je e-mailadres'); veld.setAttribute('aria-describedby', uitleg.id);
    const fout = maak('p', 'noot fout'); fout.setAttribute('role', 'alert');
    const knop = maak('button', 'kaart-knop', 'Mail mij'); knop.type = 'submit';
    const noot = maak('p', 'noot', 'Je krijgt eerst een mail om je adres te bevestigen. Daarna mailen we je één keer, ' + wanneer + '. Afmelden kan altijd.');
    const knopBlok = schuifBlok(open);
    const foutBlok = schuifBlok(fout); foutBlok.className = 'fout-blok'; foutBlok.hidden = true;
    const velden = maak('div', 'mail-velden'); velden.append(veld, foutBlok, knop, noot);
    const veldBlok = schuifBlok(velden); veldBlok.hidden = true;
    const klaarBlok = schuifBlok(maak('div', 'leegmelding', 'Gelukt. Kijk in je mail en bevestig je adres.')); klaarBlok.hidden = true;
    vorm.append(uitleg, knopBlok, veldBlok, klaarBlok);
    open.addEventListener('click', () => { schuif(knopBlok, false); schuif(veldBlok, true); veld.focus({ preventScroll: true }); });
    vorm.addEventListener('submit', e => {
      e.preventDefault();
      if (!veld.value.trim() || !veld.checkValidity()) {
        fout.textContent = 'Vul een geldig e-mailadres in.';
        if (foutBlok.hidden) schuif(foutBlok, true);
        veld.focus({ preventScroll: true }); return;
      }
      schuif(veldBlok, false); schuif(klaarBlok, true);
    });
    return vorm;
  };

  function openSchool(s) {
    const r = richtingenVan(s);
    if (!r.length) {
      const insturen = maak('a', 'kaart-knop', 'Stuur je samenvatting in'); insturen.href = insturenVoor(s);
      const andere = maak('button', 'kaart-knop tweede', 'Andere school'); andere.type = 'button'; andere.addEventListener('click', sluit);
      const knoppen = maak('div', 'knoppen'); knoppen.append(insturen, andere);
      toon(kop(s.naam, s.stad), maak('div', 'leegmelding', 'Voor ' + s.afk + ' staat er nog geen leerstof op de site.'), ...(WACHTLIJST ? [mailBlok('mail-school', 'zodra er leerstof voor ' + s.afk + ' is', 'Wil je een mail zodra jouw school of vak erbij staat?')] : []), knoppen);
      return;
    }
    const zoek = maak('input'); zoek.type = 'search'; zoek.placeholder = 'Zoek je richting'; zoek.setAttribute('aria-label', 'Zoek je richting');
    const lijst = maak('ul', 'richtingen');
    const teken = () => {
      const q = zoek.value.trim().toLowerCase();
      lijst.replaceChildren(...r.filter(x => x.naam.toLowerCase().includes(q)).map(x => {
        const li = maak('li'); const b = maak('button', 'richting'); b.type = 'button';
        const tekst = maak('span'); tekst.append(maak('strong', '', x.naam), maak('small', '', x.uitleg));
        b.append(tekst, maak('span', ('chip ' + CHIP[x.status].klasse).trim(), CHIP[x.status].tekst));
        b.addEventListener('click', () => x.status === 'live' ? toonAccount(s, x) : toonNogNiet(s, x));
        li.append(b); return li;
      }));
      if (!lijst.children.length) lijst.append(maak('li', 'leegmelding', 'Geen richting gevonden. Staat jouw richting er niet bij? Stuur je samenvatting in, dan kijken we wat we kunnen doen.'));
    };
    zoek.addEventListener('input', teken); teken();
    // Korte noot onder de zoekbalk: wie al iets instuurde, ziet zijn richting of vak misschien pas later.
    const noot = maak('p', 'noot', 'Heb je al iets ingestuurd? Dan kan het even duren voor je richting of vak hier staat. Kom later gerust nog eens kijken.');
    noot.id = 'richting-noot'; zoek.setAttribute('aria-describedby', 'richting-noot');
    toon(kop(s.naam, s.stad), maak('p', 'vraag', 'Welke richting studeer jij?'), zoek, noot, lijst);
  }

  function toonNogNiet(s, x) {
    const insturen = maak('a', 'kaart-knop', 'Stuur je samenvatting in'); insturen.href = insturenVoor(s);
    const terug = maak('button', 'kaart-knop tweede', 'Terug'); terug.type = 'button'; terug.addEventListener('click', () => openSchool(s));
    const knoppen = maak('div', 'knoppen'); knoppen.append(insturen, terug);
    const tekst = x.status === 'binnenkort'
      ? x.naam + ' komt eraan. De eerste vakken worden nu gemaakt.'
      : 'Voor ' + x.naam + ' staat er nog geen leerstof op de site. Stuur je samenvatting in, dan maken we er oefenvragen van.';
    const mail = WACHTLIJST ? [mailBlok('mail-richting', 'zodra de eerste vakken van ' + x.naam + ' online staan', 'Wil je een mail zodra de eerste vakken erbij staan?')] : [];
    toon(kop(x.naam, s.naam), maak('div', 'leegmelding', tekst), ...mail, knoppen);
  }

  function toonAccount(s, x) {
    // Eén knop naar het echte aanmeldscherm van de site.
    const account = maak('a', 'kaart-knop', 'Volgende →'); account.href = AANMELDEN;
    account.addEventListener('click', () => { try { window.sessionStorage.setItem('bes_keuze', JSON.stringify({ school: s.id, richting: x.id })); } catch {} });
    const knoppen = maak('div', 'knoppen'); knoppen.append(account);
    const noot = maak('p', 'noot', 'Je maakt je account op de volgende pagina, met Google of met je e-mail. Daarna kom je op je eigen hub met de vakken van ' + x.naam + '.');
    const terug = maak('button', 'tekstknop', 'Andere richting'); terug.type = 'button'; terug.addEventListener('click', () => openSchool(s));
    toon(kop('Maak je account'), maak('div', 'keuze', s.afk + ' · ' + x.naam), knoppen, noot, terug);
  }

  // Zoeken op school, stad, afkorting of richting, zonder op hoofdletters en accenten te letten ("liege" vindt Liège).
  const past = (q, metRichting) => {
    const ids = new Set(CAT.zoekScholen(q).map(s => s.id)), vlak = CAT.plat(q).trim();
    return s => ids.has(s.id) || (metRichting && richtingenVan(s).some(r => CAT.plat(r.naam).includes(vlak)));
  };
  const zoek = $('zoek'), uit = $('zoek-uit');
  let sluitTimer = 0;
  const lijstOpen = () => !uit.hidden && !uit.classList.contains('sluiten');
  const openLijst = () => {
    clearTimeout(sluitTimer); uit.classList.remove('sluiten');
    uit.hidden = false;
  };
  // Sluiten beweegt ook: kort uitfaden en omhoog, daarna pas weg.
  const sluitLijst = () => {
    if (uit.hidden || uit.classList.contains('sluiten')) return;
    if (rustig.matches) { uit.hidden = true; return; }
    uit.classList.add('sluiten');
    sluitTimer = setTimeout(() => { uit.hidden = true; uit.classList.remove('sluiten'); }, 180);
  };
  const tekenLijst = () => {
    const q = zoek.value.trim();
    if (!q) { sluitLijst(); return; }
    const hits = SCHOLEN.filter(past(q, true)).slice(0, 8);
    const voor = lijstOpen() ? uit.getBoundingClientRect().height : 0;
    uit.replaceChildren(...hits.map(s => {
      const li = maak('li'); const b = maak('button'); b.type = 'button';
      b.append(maak('strong', '', s.naam), maak('small', '', s.stad + ' · ' + telTekst(s)));
      b.addEventListener('click', () => { sluitLijst(); zoek.value = ''; openSchool(s); });
      li.append(b); return li;
    }));
    if (!hits.length) uit.append(maak('li', 'zoek-leeg', 'Niets gevonden. Probeer een stad of afkorting.'));
    openLijst();
    // Wordt de lijst langer of korter terwijl hij open is, dan groeit of krimpt hij mee.
    const na = uit.getBoundingClientRect().height;
    if (voor && Math.abs(na - voor) > 1 && !rustig.matches && uit.animate) {
      uit.animate([{ height: voor + 'px' }, { height: na + 'px' }], { duration: 180, easing: getComputedStyle(uit).getPropertyValue('--ease').trim() || 'ease-out' });
    }
  };
  zoek.addEventListener('input', tekenLijst);
  // Terug in het veld met tekst erin: de lijst komt terug.
  const heropen = () => { if (zoek.value.trim() && !lijstOpen()) tekenLijst(); };
  zoek.addEventListener('focus', heropen);
  zoek.addEventListener('click', heropen);
  // Toetsenbord: Enter opent het eerste resultaat, pijltjes lopen door de lijst, Escape sluit.
  const knoppenInLijst = () => [...uit.querySelectorAll('button')];
  zoek.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const eerste = lijstOpen() && knoppenInLijst()[0];
      if (eerste) { e.preventDefault(); eerste.click(); }
    } else if (e.key === 'ArrowDown') {
      if (!lijstOpen() && zoek.value.trim()) tekenLijst();
      const eerste = knoppenInLijst()[0];
      if (eerste && lijstOpen()) { e.preventDefault(); eerste.focus(); }
    } else if (e.key === 'Escape' && lijstOpen()) {
      e.preventDefault(); sluitLijst();
    }
  });
  uit.addEventListener('keydown', e => {
    const knoppen = knoppenInLijst(), i = knoppen.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); (knoppen[i + 1] || knoppen[i]).focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (knoppen[i - 1] || zoek).focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); zoek.focus(); sluitLijst(); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.zoek')) sluitLijst(); });

  // Lijstweergave in het venster: alle scholen per land.
  $('lijstknop').addEventListener('click', () => {
    // Simpele zoekbalk bovenaan de lijst: filtert op naam, afkorting en stad.
    const zoekLijst = maak('input'); zoekLijst.type = 'search'; zoekLijst.placeholder = 'Zoek je school of stad'; zoekLijst.setAttribute('aria-label', 'Zoek je school of stad');
    const vak = maak('div', 'richtingen');
    const teken = () => {
      const treft = past(zoekLijst.value, false);
      const delen = [];
      ['BE', 'NL'].forEach(land => {
        const hits = SCHOLEN.filter(s => s.land === land && treft(s))
          .sort((a, b) => live(b) - live(a) || a.naam.localeCompare(b.naam));
        if (!hits.length) return;
        delen.push(maak('p', 'groep-kop', land === 'BE' ? 'België' : 'Nederland'), ...hits.map(schoolKnop));
      });
      vak.replaceChildren(...(delen.length ? delen : [maak('p', 'leegmelding', 'Geen school gevonden. Probeer een stad of afkorting.')]));
    };
    zoekLijst.addEventListener('input', teken); teken();
    toon(kop('Alle scholen', SCHOLEN.length + ' scholen'), zoekLijst, vak);
  });
  // Intro: de zoekbalk staat eerst in het midden boven een vervaagde kaart en schuift dan rustig naar zijn plek.
  // De rest (merk, knoppen, legende) komt erbij zodra de balk boven is. Bij minder beweging is er geen intro.
  const intro = async () => {
    const root = document.documentElement;
    if (!root.classList.contains('kaart-intro')) return;
    // Vangnet: wat er ook misgaat, na 4 seconden is de kaart gewoon bruikbaar.
    const vangnet = setTimeout(() => root.classList.remove('kaart-intro'), 4000);
    try {
      await introAnimatie(root);
    } finally {
      clearTimeout(vangnet);
      root.classList.remove('kaart-intro');
      // Pas nu staat de zoekbalk op zijn plek: dan het midden opnieuw bepalen en het naamkaartje tonen.
      midden = null; toonMidden();
    }
  };
  const introAnimatie = async root => {
    const zoek = document.querySelector('.zoek');
    const rest = [...document.querySelectorAll('.merk, .boven-rechts, .inlog, .onder')].filter((el, i, alle) => !alle.some(ander => ander !== el && ander.contains(el)));
    try { await Promise.race([document.fonts.ready, new Promise(klaar => setTimeout(klaar, 700))]); } catch {}
    const plek = zoek.getBoundingClientRect();
    const midden = 'translateY(' + Math.round(innerHeight / 2 - (plek.top + plek.height / 2)) + 'px) scale(1.04)';
    const zacht = 'cubic-bezier(.65, 0, .35, 1)', duur = 2600;
    const animaties = [
      zoek.animate([{ opacity: 0, transform: midden }, { opacity: 1, transform: midden, offset: .2 }, { opacity: 1, transform: midden, offset: .5, easing: zacht }, { opacity: 1, transform: 'none' }], { duration: duur, fill: 'forwards' }),
      kaart.animate([{ filter: 'blur(12px) brightness(.8)' }, { filter: 'blur(12px) brightness(.8)', offset: .5, easing: zacht }, { filter: 'blur(0px) brightness(1)' }], { duration: duur, fill: 'forwards' }),
      ...rest.map(el => el.animate([{ opacity: 0 }, { opacity: 0, offset: .62 }, { opacity: 1 }], { duration: duur, fill: 'forwards' }))
    ];
    await animaties[0].finished.catch(() => {});
    // intro-klaar houdt de gewone animatie van de boven- en onderkant uit (zie kaart.css), anders knippert alles nog één keer.
    root.classList.add('intro-klaar');
    root.classList.remove('kaart-intro');
    animaties.forEach(animatie => animatie.cancel());
  };
  intro();
  const plaatsThema = () => {
    const knop = document.querySelector('.thema-knop.is-los');
    if (!knop) return;
    knop.classList.remove('is-los');
    $('boven-rechts').prepend(knop);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', plaatsThema, { once: true }); else plaatsThema();
})();
