// Duel: het scherm "wachtkamer" (contract deel 4) en het invulscherm voor een code (duel.html zonder ?c).
// Elk scherm: BES.duelScherm.<naam>.maak(root, acties) -> { toon(staat), weg() }.
// toon() komt bij elke wijziging opnieuw; hier wordt alleen bijgewerkt wat echt veranderde.
(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  BES.duelScherm = BES.duelScherm || {};

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const TEKENS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const MAX = 10;
  const zoek = () => new URLSearchParams(window.location.search);
  const testModus = () => zoek().get('test') === 'duel';
  const verloop = () => getComputedStyle(document.documentElement).getPropertyValue('--ease').trim() || 'ease-out';
  const zacht = el => !motion.matches && typeof el.animate === 'function';
  const wachtEven = ms => new Promise(klaar => window.setTimeout(klaar, ms));
  // Nooit langer wachten dan nodig: in een verborgen tabblad staan animaties stil.
  const klaarMet = (animatie, ms) => Promise.race([animatie.finished.catch(() => {}), wachtEven(ms)]);

  const maak = (tag, klasse, tekst) => {
    const el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (tekst !== undefined) el.textContent = tekst;
    return el;
  };

  const svg = (pad, maat = 18) => {
    const el = maak('span', 'kamer-icoon');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<svg viewBox="0 0 24 24" width="${maat}" height="${maat}" focusable="false">${pad}</svg>`;
    return el;
  };
  const ICOON_KOPIE = '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6.8A2.3 2.3 0 0 0 13.2 4.5H6.8A2.3 2.3 0 0 0 4.5 6.8v6.4a2.3 2.3 0 0 0 2.3 2.3h1.7"/>';
  const ICOON_VINK = '<path d="m5.5 12.5 4 4 9-9"/>';
  const ICOON_POTLOOD = '<path d="M4.5 19.5h4l10-10a2.83 2.83 0 0 0-4-4l-10 10v4Z"/><path d="m13.5 6.5 4 4"/>';
  const ICOON_WHATSAPP = '<path class="is-vol" d="M20.52 3.48A11.87 11.87 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.95L.07 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.9a11.82 11.82 0 0 0-3.44-8.42ZM12.07 21.8a9.85 9.85 0 0 1-5.03-1.38l-.36-.22-3.74.98 1-3.64-.24-.38a9.86 9.86 0 0 1-1.52-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.81 9.81 0 0 1 2.89 6.99c0 5.46-4.43 9.9-9.88 9.9Zm5.42-7.41c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.78-1.48-1.75-1.65-2.05-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.19.05-.36-.03-.51-.07-.15-.67-1.61-.92-2.2-.24-.59-.48-.51-.67-.52H7.8c-.2 0-.52.07-.8.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.21 5.08 4.5.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.11.57-.08 1.76-.72 2.01-1.42.25-.69.25-1.29.18-1.41-.08-.13-.28-.2-.58-.35Z"/>';

  // Een knop met twee teksten op dezelfde plek: de breedte blijft gelijk als de tekst wisselt.
  const stapelKnop = (klasse, teksten, icoon) => {
    const knop = maak('button', klasse);
    knop.type = 'button';
    const stapel = maak('span', 'kamer-stapel');
    const delen = teksten.map((tekst, index) => {
      const deel = maak('span', 'kamer-stapel-deel');
      if (icoon && icoon[index]) deel.append(svg(icoon[index]));
      deel.append(maak('span', '', tekst));
      if (index) deel.setAttribute('aria-hidden', 'true');
      stapel.append(deel);
      return deel;
    });
    knop.append(stapel);
    knop.dataset.stand = '0';
    const zet = index => {
      knop.dataset.stand = String(index);
      delen.forEach((deel, i) => deel.setAttribute('aria-hidden', String(i !== index)));
    };
    return { knop, zet };
  };

  const kopieer = async tekst => {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(tekst); return true; }
    } catch {}
    try {
      const veld = maak('textarea', 'kamer-onzichtbaar');
      veld.value = tekst;
      veld.setAttribute('readonly', '');
      document.body.append(veld);
      veld.select();
      const gelukt = document.execCommand('copy');
      veld.remove();
      return gelukt;
    } catch { return false; }
  };

  // Het blok rustig wisselen: kort uitfaden, de inhoud vervangen en in hoogte meeschuiven terwijl het weer infadet.
  const zachtWissel = async (el, verander) => {
    if (!zacht(el) || !el.getClientRects().length) { verander(); return; }
    const easing = verloop();
    const van = el.getBoundingClientRect().height;
    const uit = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing, fill: 'forwards' });
    await klaarMet(uit, 220);
    verander();
    const naar = el.getBoundingClientRect().height;
    uit.cancel();
    const terug = el.animate(
      [{ height: van + 'px', opacity: 0, overflow: 'clip' }, { height: naar + 'px', opacity: 1, overflow: 'clip' }],
      { duration: 260, easing }
    );
    await klaarMet(terug, 340);
  };

  // Een rij komt vloeiend binnen: hoogte, binnenruimte en zichtbaarheid groeien samen, niets duwt er plots tegen.
  const rijIn = li => {
    if (!zacht(li)) return;
    const st = getComputedStyle(li);
    const hoogte = li.getBoundingClientRect().height;
    li.animate([
      { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0, transform: 'translateY(-6px)', overflow: 'clip' },
      { height: hoogte + 'px', paddingTop: st.paddingTop, paddingBottom: st.paddingBottom, opacity: 1, transform: 'none', overflow: 'clip' }
    ], { duration: 380, easing: verloop() });
  };

  const rijUit = (li, klaar) => {
    if (!zacht(li) || !li.getClientRects().length) { li.remove(); klaar?.(); return; }
    const st = getComputedStyle(li);
    const hoogte = li.getBoundingClientRect().height;
    li.classList.add('is-weg');
    const animatie = li.animate([
      { height: hoogte + 'px', paddingTop: st.paddingTop, paddingBottom: st.paddingBottom, opacity: 1, overflow: 'clip' },
      { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0, overflow: 'clip' }
    ], { duration: 300, easing: verloop(), fill: 'forwards' });
    klaarMet(animatie, 420).then(() => { li.remove(); klaar?.(); });
  };

  // Tekst wisselen met een korte fade, alleen als hij echt anders is.
  const zetTekst = (el, tekst) => {
    if (el.textContent === tekst) return;
    el.textContent = tekst;
    if (zacht(el) && el.getClientRects().length) el.animate([{ opacity: 0, transform: 'translateY(3px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: verloop() });
  };

  // Alleen schrijven als de tekst anders is: zo blijft de pagina rustig bij elke nieuwe stand.
  const zetStil = (el, tekst) => { if (el.textContent !== tekst) el.textContent = tekst; };

  const toon = el => { if (el.hidden) (BES.toon || (x => { x.hidden = false; }))(el); };
  const verberg = el => { if (!el.hidden) (BES.verberg || (x => { x.hidden = true; }))(el); };

  const vakNaam = id => {
    if (!id) return '';
    const vak = [...(window.BES_VAKKEN || []), ...(window.BES_VAKKEN_STIL || [])].find(item => item.id === id);
    if (vak) return vak.naam;
    return id === 'voorbeeld' || id === 'test' ? 'Testduel' : '';
  };

  const beginletter = naam => {
    const letter = Array.from(String(naam || '').trim()).find(teken => /[\p{L}\p{Nd}]/u.test(teken));
    return letter ? letter.toLocaleUpperCase('nl') : '?';
  };

  const deelLink = code => {
    const url = new URL('duel.html', window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('c', code);
    if (testModus()) {
      url.searchParams.set('test', 'duel');
      const snel = zoek().get('snel');
      if (snel) url.searchParams.set('snel', snel);
    }
    return url.href;
  };

  const FOUTEN = {
    te_weinig_spelers: 'Je hebt minstens 2 spelers nodig om te starten.',
    al_begonnen: 'Het duel is al begonnen.',
    verkeerde_stand: 'Het duel is al begonnen.',
    verlopen: 'Deze kamer is verlopen. Maak een nieuw duel.',
    bestaat_niet: 'Deze kamer bestaat niet meer.',
    geen_deelnemer: 'Je doet niet mee in deze kamer.',
    niet_ingelogd: 'Log eerst in om te starten.',
    niet_jouw_beurt: 'Alleen de maker kan nu starten.',
    geen_verbinding: 'Geen verbinding. Probeer het opnieuw.'
  };

  // ======================= Wachtkamer =======================

  BES.duelScherm.wachtkamer = {
    maak(root, acties) {
      root.classList.add('kamer');
      let gestopt = false;
      let eerste = true;
      let staat = null;
      let code = '';
      let bezig = false;
      let variant = '';
      let wisselRij = Promise.resolve();
      let kopieerTimer = 0;
      let startTimer = 0;
      const rijen = new Map();

      // --- Kop ---
      const kop = maak('header', 'kamer-kop kamer-in');
      const eyebrow = maak('p', 'kamer-eyebrow', 'Duel');
      const titel = maak('h1', 'kamer-titel', 'Wachtkamer');
      const sub = maak('p', 'kamer-sub', 'Deel de code met je vrienden.');
      const chips = maak('ul', 'kamer-chips');
      chips.setAttribute('aria-label', 'Over dit duel');
      const chipVragen = maak('li', 'label kamer-chip');
      const chipHoofdstukken = maak('li', 'label gedimd kamer-chip');
      const chipSpelers = maak('li', 'label gedimd kamer-chip', '2 tot ' + MAX + ' spelers');
      // Alleen de maker, zolang de kamer in de wachtkamer staat: hoofdstukken en aantal nog aanpassen.
      const aanpasPlek = maak('li', 'kamer-chip-knop');
      aanpasPlek.hidden = true;
      const aanpasKnop = maak('button', 'kamer-aanpas');
      aanpasKnop.type = 'button';
      aanpasKnop.setAttribute('aria-haspopup', 'dialog');
      aanpasKnop.append(svg(ICOON_POTLOOD, 15), maak('span', '', 'Aanpassen'));
      aanpasKnop.setAttribute('aria-label', 'Hoofdstukken en aantal vragen aanpassen');
      aanpasPlek.append(aanpasKnop);
      chips.append(chipVragen, chipHoofdstukken, chipSpelers, aanpasPlek);
      kop.append(eyebrow, titel, sub, chips);

      // --- Code en delen ---
      const codeKaart = maak('section', 'kamer-kaart kamer-code-kaart kamer-in');
      codeKaart.style.setProperty('--i', '1');
      codeKaart.setAttribute('aria-labelledby', 'kamer-code-kop');
      const codeKop = maak('h2', 'kamer-kaart-kop', 'Code');
      codeKop.id = 'kamer-code-kop';
      const tegels = maak('p', 'kamer-tegels');
      const codeVoorlezen = maak('span', 'kamer-onzichtbaar');
      const deel = maak('div', 'kamer-deel');
      const kopieerKnop = stapelKnop('knop-secundair kamer-kopieer', ['Kopieer link', 'Gekopieerd'], [ICOON_KOPIE, ICOON_VINK]);
      const whatsapp = maak('a', 'knop kamer-whatsapp');
      whatsapp.target = '_blank';
      whatsapp.rel = 'noopener';
      // Op een smalle telefoon staan de twee knoppen naast elkaar; dan valt "Deel in" weg (zie duel-kamer.css).
      const whatsappTekst = maak('span', 'kamer-whatsapp-tekst');
      whatsappTekst.append(maak('span', 'kamer-deel-lang', 'Deel in '), 'WhatsApp');
      whatsapp.setAttribute('aria-label', 'Deel in WhatsApp');
      whatsapp.append(svg(ICOON_WHATSAPP), whatsappTekst);
      deel.append(kopieerKnop.knop, whatsapp);
      const kopieerFout = maak('p', 'kamer-melding', '');
      kopieerFout.setAttribute('role', 'status');
      kopieerFout.hidden = true;
      codeKaart.append(codeKop, tegels, codeVoorlezen, deel, kopieerFout);

      // --- Spelers ---
      const spelersKaart = maak('section', 'kamer-kaart kamer-spelers kamer-in');
      spelersKaart.style.setProperty('--i', '2');
      spelersKaart.setAttribute('aria-labelledby', 'kamer-spelers-kop');
      const spelersKopRij = maak('div', 'kamer-kaart-rij');
      const spelersKop = maak('h2', 'kamer-kaart-kop', 'Spelers');
      spelersKop.id = 'kamer-spelers-kop';
      const teller = maak('span', 'kamer-teller');
      teller.setAttribute('aria-live', 'polite');
      spelersKopRij.append(spelersKop, teller);
      const lijst = maak('ul', 'kamer-lijst');
      const plek = maak('li', 'kamer-rij kamer-plek');
      plek.setAttribute('aria-hidden', 'true');
      const plekVlak = maak('div', 'kamer-rij-vlak');
      const plekAvatar = maak('span', 'kamer-avatar');
      const plekTekst = maak('span', 'kamer-plek-tekst', 'Wachten op meer spelers');
      const plekStippen = maak('span', 'kamer-stippen');
      plekStippen.append(maak('i'), maak('i'), maak('i'));
      plekVlak.append(plekAvatar, plekTekst, plekStippen);
      plek.append(plekVlak);
      lijst.append(plek);
      spelersKaart.append(spelersKopRij, lijst);

      // --- Starten ---
      const startBlok = maak('section', 'kamer-start kamer-in');
      startBlok.style.setProperty('--i', '3');
      startBlok.setAttribute('aria-label', 'Starten');
      const startInhoud = maak('div', 'kamer-start-inhoud');
      const startKnop = stapelKnop('knop kamer-startknop', ['Start het duel', 'Starten…']);
      const wachtRegel = maak('p', 'kamer-wacht');
      const wachtTekst = maak('span', '', '');
      const wachtStippen = maak('span', 'kamer-stippen');
      wachtStippen.setAttribute('aria-hidden', 'true');
      wachtStippen.append(maak('i'), maak('i'), maak('i'));
      wachtRegel.append(wachtTekst, wachtStippen);
      const noot = maak('p', 'kamer-noot');
      const startFout = maak('p', 'kamer-melding is-fout', '');
      startFout.setAttribute('role', 'status');
      startFout.hidden = true;
      startBlok.append(startInhoud, startFout);

      root.append(kop, codeKaart, spelersKaart, startBlok);

      // --- Gedrag ---
      kopieerKnop.knop.addEventListener('click', async () => {
        if (!code) return;
        const gelukt = await kopieer(deelLink(code));
        if (gestopt) return;
        window.clearTimeout(kopieerTimer);
        if (gelukt) {
          verberg(kopieerFout);
          kopieerKnop.zet(1);
          kopieerTimer = window.setTimeout(() => kopieerKnop.zet(0), 2200);
        } else {
          kopieerFout.textContent = 'Kopiëren lukte niet. De link is: ' + deelLink(code);
          toon(kopieerFout);
        }
      });

      const makerVan = s => (s.deelnemers || []).find(d => d.speler === s.kamer.maker);
      const magStarten = s => {
        if (s.ik === s.kamer.maker) return true;
        const maker = makerVan(s);
        // Is de maker langer dan 60 seconden niet gezien (lang_weg), dan mag elke deelnemer starten. Ruimer dan het
        // stipje (20 s): wie de link via WhatsApp deelt, is even uit beeld maar komt zo terug.
        if (!maker) return true;
        return maker.lang_weg === undefined ? maker.online === false : maker.lang_weg === true;
      };

      startKnop.knop.addEventListener('click', async () => {
        if (bezig || !staat || !code) return;
        if (!magStarten(staat) || (staat.deelnemers || []).length < 2) return;
        bezig = true;
        startKnop.zet(1);
        startKnop.knop.setAttribute('aria-disabled', 'true');
        verberg(startFout);
        let antwoord;
        try { antwoord = await acties.start(code); } catch { antwoord = { ok: false }; }
        if (gestopt) return;
        if (antwoord && antwoord.ok) {
          // Gelukt: de knop blijft op Starten… tot het spelscherm komt. Komt dat niet, dan na 6 seconden terug.
          startTimer = window.setTimeout(() => {
            if (gestopt) return;
            bezig = false;
            startKnop.zet(0);
            if (staat) werkStartBij(staat);
          }, 6000);
          return;
        }
        bezig = false;
        startKnop.zet(0);
        startFout.textContent = FOUTEN[antwoord && antwoord.fout] || 'Starten lukte niet. Probeer het opnieuw.';
        toon(startFout);
        if (staat) werkStartBij(staat);
      });

      const vulStart = s => {
        variant = magStarten(s) ? 'mag' : 'wacht';
        startInhoud.replaceChildren();
        if (variant === 'mag') startInhoud.append(startKnop.knop, noot);
        else startInhoud.append(wachtRegel, noot);
        startBlok.dataset.variant = variant;
        werkStartBij(s, true);
      };

      function werkStartBij(s, direct) {
        const aantal = (s.deelnemers || []).length;
        const tekort = Math.max(0, 2 - aantal);
        const zet = direct ? (el, tekst) => { el.textContent = tekst; } : zetTekst;
        if (variant === 'mag') {
          const uit = tekort > 0 || bezig;
          startKnop.knop.setAttribute('aria-disabled', String(uit));
          startKnop.knop.classList.toggle('is-klaar', !uit);
          let tekst;
          if (tekort > 0) tekst = tekort === 1 ? 'Nog 1 speler nodig' : 'Nog ' + tekort + ' spelers nodig';
          else if (s.ik !== s.kamer.maker) tekst = 'De maker is even weg. Jij mag nu starten.';
          else tekst = aantal >= MAX ? 'De kamer is vol. Start maar!' : 'Is iedereen er? Dan kan je starten.';
          zet(noot, tekst);
        } else {
          const maker = makerVan(s);
          zet(wachtTekst, maker && maker.naam ? 'Wachten tot ' + maker.naam + ' start' : 'Wachten tot de maker start');
          zet(noot, tekort > 0 ? (tekort === 1 ? 'Nog 1 speler nodig' : 'Nog ' + tekort + ' spelers nodig') : 'Is de maker even weg, dan mag jij starten.');
        }
      }

      const werkKopBij = s => {
        const k = s.kamer;
        const naam = vakNaam(k.vak);
        const aantal = Number(k.aantal) || Object.keys(s.vragen || {}).length;
        // Past de maker de keuze aan, dan wisselen de chips met een korte fade (eerste keer stil).
        const zetChip = eerste ? zetStil : zetTekst;
        zetChip(chipVragen, aantal ? aantal + ' vragen' : '');
        chipVragen.hidden = !aantal;
        const hoofdstukken = Array.isArray(k.hoofdstukken) ? k.hoofdstukken.length : 0;
        zetChip(chipHoofdstukken, hoofdstukken === 1 ? '1 hoofdstuk' : hoofdstukken + ' hoofdstukken');
        chipHoofdstukken.hidden = !hoofdstukken;
        zetStil(eyebrow, naam ? 'Duel · ' + naam : 'Duel');
      };

      const werkCodeBij = nieuw => {
        if (nieuw === code) return;
        code = nieuw;
        tegels.replaceChildren();
        Array.from(code).forEach((teken, index) => {
          const tegel = maak('span', 'kamer-tegel', teken);
          tegel.setAttribute('aria-hidden', 'true');
          tegel.style.setProperty('--i', String(index));
          tegels.append(tegel);
        });
        codeVoorlezen.textContent = 'Code: ' + Array.from(code).join(' ');
        const vak = vakNaam(staat && staat.kamer && staat.kamer.vak);
        const bericht = 'Doe mee met mijn duel in Berie\'s Exam Space' + (vak && vak !== 'Testduel' ? ' (' + vak + ')' : '') + '. Wie het eerst drukt en het weet, scoort. Code: ' + code + '\n' + deelLink(code);
        whatsapp.href = 'https://wa.me/?text=' + encodeURIComponent(bericht);
      };

      const maakRij = d => {
        const li = maak('li', 'kamer-rij');
        const vlak = maak('div', 'kamer-rij-vlak');
        const avatar = maak('span', 'kamer-avatar');
        avatar.setAttribute('aria-hidden', 'true');
        const tekst = maak('span', 'kamer-rij-tekst');
        const naam = maak('span', 'kamer-naam');
        const labels = maak('span', 'kamer-labels');
        const maker = maak('span', 'label kamer-label', 'Maker');
        const jij = maak('span', 'label gedimd kamer-label', 'Jij');
        labels.append(maker, jij);
        tekst.append(naam, labels);
        const status = maak('span', 'kamer-status');
        const stip = maak('span', 'kamer-stip');
        stip.setAttribute('aria-hidden', 'true');
        const statusTekst = maak('span', 'kamer-status-tekst');
        status.append(statusTekst, stip);
        vlak.append(avatar, tekst, status);
        li.append(vlak);
        return { li, avatar, naam, maker, jij, stip, statusTekst, d: null };
      };

      const werkRijBij = (rij, d, s) => {
        const naam = String(d.naam || 'Speler');
        if (rij.naam.textContent !== naam) { rij.naam.textContent = naam; rij.avatar.textContent = beginletter(naam); }
        rij.maker.hidden = d.speler !== s.kamer.maker;
        rij.jij.hidden = d.speler !== s.ik;
        const online = d.online !== false;
        rij.li.classList.toggle('is-weg-even', !online);
        rij.li.classList.toggle('is-ik', d.speler === s.ik);
        zetStil(rij.statusTekst, online ? '' : 'even weg');
        rij.stip.title = online ? 'Online' : 'Even weg';
        rij.li.setAttribute('aria-label', naam + (d.speler === s.kamer.maker ? ', maker' : '') + (d.speler === s.ik ? ', jij' : '') + (online ? ', online' : ', even weg'));
      };

      // De lege plek schuift dicht en blijft daarna verborgen (niet weg), want hij kan terugkomen.
      let plekSluit = null;
      const plekWeg = () => {
        const st = getComputedStyle(plek);
        const hoogte = plek.getBoundingClientRect().height;
        plek.classList.add('is-weg');
        const animatie = plek.animate([
          { height: hoogte + 'px', paddingTop: st.paddingTop, paddingBottom: st.paddingBottom, opacity: 1, overflow: 'clip' },
          { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0, overflow: 'clip' }
        ], { duration: 300, easing: verloop(), fill: 'forwards' });
        plekSluit = animatie;
        klaarMet(animatie, 420).then(() => {
          if (plekSluit !== animatie) return;
          plekSluit = null;
          plek.hidden = true;
          plek.classList.remove('is-weg');
          animatie.cancel();
        });
      };

      const werkSpelersBij = s => {
        const deelnemers = (s.deelnemers || []).filter(d => d && d.speler);
        const ids = new Set(deelnemers.map(d => d.speler));
        rijen.forEach((rij, id) => {
          if (ids.has(id)) return;
          rijen.delete(id);
          rijUit(rij.li);
        });
        let vorige = null;
        deelnemers.forEach((d, index) => {
          let rij = rijen.get(d.speler);
          if (!rij) {
            rij = maakRij(d);
            rijen.set(d.speler, rij);
            const na = vorige ? vorige.li.nextSibling : lijst.firstChild;
            lijst.insertBefore(rij.li, na);
            werkRijBij(rij, d, s);
            if (eerste) {
              rij.li.classList.add('kamer-in');
              rij.li.style.setProperty('--i', String(3 + Math.min(index, 6)));
            } else {
              rij.li.classList.add('is-nieuw');
              rijIn(rij.li);
            }
          } else {
            werkRijBij(rij, d, s);
          }
          vorige = rij;
        });
        const aantal = deelnemers.length;
        zetTekst(teller, aantal + ' van ' + MAX);
        // De lege plek onderaan verdwijnt vloeiend als de kamer vol is.
        const vol = aantal >= MAX;
        if (vol && !plek.hidden && !plekSluit) {
          if (eerste || !zacht(plek)) plek.hidden = true;
          else plekWeg();
        } else if (!vol && (plek.hidden || plekSluit)) {
          if (plekSluit) { plekSluit.cancel(); plekSluit = null; plek.classList.remove('is-weg'); }
          plek.hidden = false;
          if (!eerste) rijIn(plek);
        }
        zetStil(plekTekst, aantal < 2 ? 'Wachten op een tweede speler' : 'Wachten op meer spelers');
      };

      // --- Aanpassen (alleen de maker, in de wachtkamer) ---
      // De lijst met hoofdstukken komt uit duel-start.js (dezelfde als op de vakpagina) en de vragen uit window.BES_VAK,
      // die duel.html voor de maker laadt. Zolang een van de twee er niet is, blijft de knop weg.
      const kanAanpassen = s => Boolean(s && s.kamer && s.ik && s.ik === s.kamer.maker && s.kamer.status === 'wachtkamer'
        && BES.duelStart && typeof BES.duelStart.kiezer === 'function'
        && window.BES_VAK && window.BES_VAK.id === s.kamer.vak
        && BES.duelStart.beschikbareHoofdstukken().length > 0);

      const werkAanpasBij = () => {
        const mag = kanAanpassen(staat);
        if (mag === !aanpasPlek.hidden) return;
        aanpasPlek.hidden = !mag;
        if (mag && !eerste && zacht(aanpasPlek)) {
          aanpasPlek.animate([{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: verloop() });
        }
        if (!mag && venster && venster.open && !aanpasBezig) venster.close();
      };
      const bijVak = () => { if (!gestopt) werkAanpasBij(); };
      document.addEventListener('bes:vak-geladen', bijVak);

      let venster = null;
      let kiezer = null;
      let aanpasBezig = false;
      let opslaanKnop = null;
      let aanpasFout = null;

      const AANPAS_FOUTEN = {
        verkeerde_stand: 'Het duel is al begonnen.',
        niet_jouw_beurt: 'Alleen de maker kan het duel aanpassen.',
        verlopen: 'Deze kamer is verlopen. Maak een nieuw duel.',
        geen_verbinding: 'Geen verbinding. Probeer het opnieuw.'
      };

      const zetAanpasFout = tekst => {
        if (!aanpasFout) return;
        if (!tekst) { verberg(aanpasFout); return; }
        if (aanpasFout.hidden) { aanpasFout.textContent = tekst; toon(aanpasFout); return; }
        if (aanpasFout.textContent !== tekst) {
          if (BES.wissel) BES.wissel(aanpasFout, () => { aanpasFout.textContent = tekst; });
          else aanpasFout.textContent = tekst;
        }
      };

      const zetAanpasBezig = aan => {
        aanpasBezig = aan;
        opslaanKnop.textContent = aan ? 'Opslaan…' : 'Opslaan';
        kiezer.zetBezig(aan);
        if (aan) venster.setAttribute('aria-busy', 'true');
        else venster.removeAttribute('aria-busy');
      };

      const sluitVenster = () => {
        if (!venster || aanpasBezig) return;
        if (BES.sluitDialoog) BES.sluitDialoog(venster);
        else venster.close();
      };

      // Het venster: zelfde vorm als "Duel met vrienden" op de vakpagina, met Annuleren en Opslaan.
      const maakVenster = () => {
        const ds = BES.duelStart;
        ds.stijl();
        venster = maak('dialog', 'kies-plan duel-venster kamer-aanpas-venster');
        venster.setAttribute('aria-labelledby', 'kamer-aanpas-kop');
        venster.setAttribute('aria-describedby', 'kamer-aanpas-uitleg');
        const top = maak('div', 'duel-venster-top');
        const badge = maak('span', 'duel-venster-icoon');
        badge.append(ds.icoon());
        const titels = maak('div');
        const kopTekst = maak('h2', '', 'Duel aanpassen');
        kopTekst.id = 'kamer-aanpas-kop';
        titels.append(maak('p', 'duel-venster-label', 'Wachtkamer'), kopTekst);
        top.append(badge, titels);
        const uitleg = maak('p', 'kies-plan-reden', 'Kies andere hoofdstukken of een ander aantal vragen. Wie in de wachtkamer zit, ziet het meteen.');
        uitleg.id = 'kamer-aanpas-uitleg';
        kiezer = ds.kiezer({
          v: 'kamer-aanpas',
          zichtbaar: () => Boolean(venster && venster.open),
          bijStand: ({ max }) => { if (opslaanKnop) opslaanKnop.disabled = !max || aanpasBezig; }
        });
        aanpasFout = maak('p', 'duel-fout');
        aanpasFout.setAttribute('role', 'alert');
        aanpasFout.hidden = true;
        const voet = maak('div', 'kies-plan-voet');
        const annuleer = maak('button', 'kies-plan-later', 'Annuleren');
        annuleer.type = 'button';
        const voetKnop = maak('div', 'duel-voet-knop');
        opslaanKnop = maak('button', 'knop', 'Opslaan');
        opslaanKnop.type = 'button';
        opslaanKnop.id = 'kamer-aanpas-opslaan';
        voetKnop.append(opslaanKnop);
        voet.append(annuleer, voetKnop);
        venster.append(top, uitleg, ...kiezer.delen, aanpasFout, voet);
        document.body.append(venster);

        annuleer.addEventListener('click', sluitVenster);
        opslaanKnop.addEventListener('click', slaOp);
        venster.addEventListener('cancel', event => { event.preventDefault(); sluitVenster(); });
        venster.addEventListener('click', event => {
          if (event.target !== venster) return;
          const r = venster.getBoundingClientRect();
          if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) sluitVenster();
        });
        venster.addEventListener('close', () => {
          if (!gestopt && !aanpasPlek.hidden) aanpasKnop.focus({ preventScroll: true });
        });
      };

      const openVenster = () => {
        if (gestopt || !kanAanpassen(staat)) return;
        if (!venster) maakVenster();
        if (venster.open) return;
        // Voorgevuld met wat de kamer nu heeft.
        kiezer.zet(staat.kamer.hoofdstukken, Number(staat.kamer.aantal));
        kiezer.leegInfo();
        aanpasFout.hidden = true;
        aanpasFout.textContent = '';
        kiezer.werkBij();
        venster.showModal();
        kiezer.focus();
      };

      async function slaOp() {
        if (aanpasBezig || !staat || !code) return;
        const keuze = kiezer.keuze();
        if (!keuze) return;
        zetAanpasBezig(true);
        zetAanpasFout('');
        let antwoord = null;
        try {
          const vragen = BES.duelStart.maakVragen(keuze.lijst, keuze.aantal);
          antwoord = typeof acties.wijzig === 'function' ? await acties.wijzig(code, keuze.hoofdstukken, vragen) : null;
        } catch { antwoord = null; }
        if (gestopt) return;
        zetAanpasBezig(false);
        if (antwoord && antwoord.ok) {
          sluitVenster();
          return;
        }
        // Bestaat de functie nog niet in de database (SQL nog niet uitgevoerd), dan komt hier ongeldig: de kamer blijft zoals hij was.
        zetAanpasFout(AANPAS_FOUTEN[antwoord && antwoord.fout] || 'Aanpassen lukt nu niet. Probeer het later opnieuw.');
      }

      aanpasKnop.addEventListener('click', openVenster);

      return {
        toon(nieuweStaat) {
          if (gestopt || !nieuweStaat || !nieuweStaat.kamer) return;
          staat = nieuweStaat;
          const k = staat.kamer;
          if (eerste) {
            const gast = staat.ik !== k.maker;
            root.classList.toggle('is-gast', gast);
            sub.textContent = gast ? 'Je zit erin. Wacht tot het duel start.' : 'Deel de code. Wie meedoet, zie je hier.';
          }
          werkCodeBij(String(k.code || zoek().get('c') || '').toUpperCase());
          werkKopBij(staat);
          werkSpelersBij(staat);
          const gewenst = magStarten(staat) ? 'mag' : 'wacht';
          if (eerste) vulStart(staat);
          else if (gewenst !== variant) {
            // Pas de inhoud aan aan de stand die er is op het moment van wisselen.
            wisselRij = wisselRij.then(() => {
              if (gestopt || !staat) return;
              const nu = magStarten(staat) ? 'mag' : 'wacht';
              if (nu === variant) { werkStartBij(staat); return; }
              return zachtWissel(startInhoud, () => vulStart(staat));
            });
          } else werkStartBij(staat);
          werkAanpasBij();
          eerste = false;
        },
        weg() {
          gestopt = true;
          window.clearTimeout(kopieerTimer);
          window.clearTimeout(startTimer);
          document.removeEventListener('bes:vak-geladen', bijVak);
          if (venster) { if (venster.open) venster.close(); venster.remove(); }
        }
      };
    }
  };

  // ======================= Code invullen =======================

  // Voorbeeldvragen voor het testduel, alleen als de nep-database er zelf geen heeft.
  const eigenVoorbeeld = aantal => Array.from({ length: aantal }, (_, index) => ({
    vraag: 'Testvraag ' + (index + 1) + ': welk antwoord is juist?',
    opties: ['Antwoord A', 'Antwoord B', 'Antwoord C', 'Antwoord D'],
    juist: index % 4,
    hoofdstuk: 'h' + (1 + (index % 3)),
    uitleg: 'Dit is een testvraag. Antwoord ' + 'ABCD'[index % 4] + ' is juist.'
  }));

  BES.duelScherm.invoer = {
    maak(root, acties) {
      root.classList.add('invoer');
      let gestopt = false;
      let bezig = false;

      const kaart = maak('div', 'kamer-kaart invoer-kaart kamer-in');
      const merk = maak('span', 'invoer-merk');
      merk.setAttribute('aria-hidden', 'true');
      merk.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" focusable="false"><path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z"/></svg>';
      const eyebrow = maak('p', 'kamer-eyebrow', 'Duel');
      const titel = maak('h1', 'invoer-titel', 'Vul een code in');
      const sub = maak('p', 'invoer-sub', 'Kreeg je een code van een vriend? Vul hem in en doe mee.');

      const form = maak('form', 'invoer-form');
      form.noValidate = true;
      const label = maak('label', 'invoer-label', 'Code van 6 tekens');
      label.htmlFor = 'duel-code-veld';
      const veld = maak('input', 'invoer-veld');
      Object.assign(veld, { id: 'duel-code-veld', name: 'code', type: 'text', autocomplete: 'off', spellcheck: false, maxLength: 200 });
      const vakjes = maak('div', 'invoer-vakjes');
      const vakken = Array.from({ length: 6 }, () => {
        const vak = maak('span', 'invoer-vak');
        vak.setAttribute('aria-hidden', 'true');
        return vak;
      });
      vakjes.append(...vakken, veld);
      veld.setAttribute('autocapitalize', 'characters');
      veld.setAttribute('autocorrect', 'off');
      veld.setAttribute('enterkeyhint', 'go');
      veld.setAttribute('aria-describedby', 'duel-code-fout');
      const fout = maak('p', 'kamer-melding is-fout', '');
      fout.id = 'duel-code-fout';
      fout.setAttribute('role', 'status');
      fout.hidden = true;
      const knop = maak('button', 'knop invoer-knop', 'Doe mee');
      knop.type = 'submit';
      form.append(label, vakjes, fout, knop);

      kaart.append(merk, eyebrow, titel, sub, form);

      if (testModus()) {
        const test = maak('div', 'invoer-test');
        const testLabel = maak('p', 'invoer-test-label', 'Testmodus');
        const testKnop = stapelKnop('knop-secundair invoer-testknop', ['Maak testduel', 'Even geduld…']);
        const testFout = maak('p', 'kamer-melding is-fout', '');
        testFout.setAttribute('role', 'status');
        testFout.hidden = true;
        test.append(testLabel, testKnop.knop, testFout);
        kaart.append(test);
        testKnop.knop.addEventListener('click', async () => {
          if (bezig) return;
          bezig = true;
          testKnop.zet(1);
          testKnop.knop.setAttribute('aria-disabled', 'true');
          verberg(testFout);
          let antwoord = null;
          try {
            const nep = BES.duelNep && typeof BES.duelNep.voorbeeldVragen === 'function' ? BES.duelNep.voorbeeldVragen(10) : null;
            const vragen = Array.isArray(nep) && nep.length ? nep : eigenVoorbeeld(10);
            const hoofdstukken = Array.from(new Set(vragen.map(v => v.hoofdstuk).filter(Boolean)));
            antwoord = await acties.maak({ vak: 'voorbeeld', hoofdstukken, vragen });
          } catch { antwoord = null; }
          if (gestopt) return;
          bezig = false;
          testKnop.zet(0);
          testKnop.knop.setAttribute('aria-disabled', 'false');
          if (antwoord && antwoord.ok && antwoord.code) { acties.naar(antwoord.code); return; }
          testFout.textContent = 'Het testduel maken lukte niet' + (antwoord && antwoord.fout ? ' (' + antwoord.fout + ')' : '') + '.';
          toon(testFout);
        });
      }

      const hint = maak('p', 'invoer-hint kamer-in');
      hint.style.setProperty('--i', '1');
      hint.append(document.createTextNode('Zelf een duel maken? Open een vak en tik op Duel met vrienden. '));
      const naarVakken = maak('a', 'tekstlink', 'Naar je vakken →');
      naarVakken.href = 'hub.html';
      hint.append(naarVakken);

      root.append(kaart, hint);

      const schoon = waarde => {
        const link = String(waarde).match(/[?&]c=([A-Za-z0-9]{6})/);
        return (link ? link[1] : String(waarde)).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      };
      // Elk teken in zijn eigen vakje; het volgende lege vakje knippert als je typt.
      const tekenVakjes = () => {
        const tekens = veld.value.slice(0, 6);
        vakken.forEach((vak, i) => {
          const teken = tekens[i] || '';
          if (vak.textContent !== teken) {
            vak.textContent = teken;
            vak.classList.remove('is-vol');
            if (teken) { void vak.offsetWidth; vak.classList.add('is-vol'); }
          }
          vak.classList.toggle('is-actief', i === tekens.length);
        });
        vakjes.classList.toggle('is-compleet', tekens.length === 6 && veld.getAttribute('aria-invalid') !== 'true');
      };
      const zetFout = tekst => {
        if (tekst) {
          if (fout.textContent !== tekst) fout.textContent = tekst;
          veld.setAttribute('aria-invalid', 'true');
          toon(fout);
        } else {
          veld.removeAttribute('aria-invalid');
          verberg(fout);
        }
        vakjes.classList.toggle('is-fout', Boolean(tekst));
        tekenVakjes();
      };
      // Je typt altijd achteraan: klikken of pijltjes zetten de cursor terug aan het eind.
      const naarEind = () => { const n = veld.value.length; try { veld.setSelectionRange(n, n); } catch {} };
      veld.addEventListener('focus', () => { vakjes.classList.add('is-focus'); requestAnimationFrame(naarEind); });
      veld.addEventListener('blur', () => vakjes.classList.remove('is-focus'));
      veld.addEventListener('click', naarEind);
      veld.addEventListener('keyup', event => { if (/^(Arrow|Home|End)/.test(event.key)) naarEind(); });

      veld.addEventListener('input', () => {
        const nieuw = schoon(veld.value);
        if (veld.value !== nieuw) veld.value = nieuw;
        if (veld.getAttribute('aria-invalid') === 'true') zetFout('');
        else tekenVakjes();
      });

      form.addEventListener('submit', event => {
        event.preventDefault();
        const c = schoon(veld.value);
        if (c.length < 6) { zetFout(c ? 'Een code heeft 6 tekens.' : 'Vul eerst de code in.'); veld.focus(); return; }
        if (!Array.from(c).every(teken => TEKENS.includes(teken))) {
          zetFout('Deze code klopt niet. Kijk de letters en cijfers nog eens na.');
          veld.focus();
          return;
        }
        zetFout('');
        acties.naar(c);
      });

      return {
        toon(info) {
          if (gestopt || !info || info.fout !== 'ongeldig') return;
          veld.value = schoon(info.waarde || '');
          zetFout('Deze code klopt niet. Kijk de letters en cijfers nog eens na.');
        },
        weg() { gestopt = true; }
      };
    }
  };
})();
