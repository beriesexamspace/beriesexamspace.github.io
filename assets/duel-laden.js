/* Duel, scherm "laden": meedoen via de link duel.html?c=CODE (contract deel 4).
   De stappen lopen mee met wat er echt gebeurt:
   - Account maken…  inloggen met Google (BES.auth.metGoogle), daarna terug naar dezelfde duel.html?c=;
   - Verbinden…      het account is bekend en er is internet;
   - Meedoen…        BES.duel.doeMee(code);
   - Je zit erin     gelukt. duel.html laat dit nog even staan en opent dan de wachtkamer.
   Testmodus (?test=duel): de nepspeler is altijd ingelogd, dus alleen Verbinden, Meedoen en Je zit erin.
   Fouten (vol, al begonnen, verlopen, bestaat niet) krijgen een eigen uitleg en knoppen terug.
   Registreert window.BES.duelScherm.laden = { maak(root, acties) -> { toon(staat), weg() } }. */
(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  BES.duelScherm = BES.duelScherm || {};

  const scriptSrc = document.currentScript?.src || '';
  // Pagina's van de site, gerekend vanaf dit bestand (assets/duel-laden.js), zodat het overal klopt.
  const sitePad = naam => {
    try { return new URL('../' + naam, scriptSrc || window.location.href).href; } catch { return naam; }
  };

  const minderBeweging = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stil = () => minderBeweging.matches;
  const VERLOOP = 'cubic-bezier(.2,.8,.2,1)';
  const TEKENS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const OMTREK = 2 * Math.PI * 54;
  // Elke stap blijft even in beeld, zodat je hem kunt lezen. Meedoen wacht kort voor de aanroep:
  // zodra meedoen lukt, komt "Je zit erin" meteen, want duel.html opent de wachtkamer kort daarna.
  const MIN_VERBINDEN = 750;
  const ADEM_MEEDOEN = 500;
  const SLEUTEL_GOOGLE = 'bes_duel_google';

  const KOP_UITNODIGING = 'Je bent uitgenodigd voor een duel';
  const STAPPEN = {
    account: 'Account maken…',
    verbinden: 'Verbinden…',
    meedoen: 'Meedoen…',
    binnen: 'Je zit erin'
  };
  const FOUTEN = {
    vol: ['Dit duel is vol', 'Er doen al 10 spelers mee. Vraag om een nieuwe code.'],
    al_begonnen: ['Dit duel is al begonnen', 'Je kunt er niet meer bij. Doe mee met de volgende ronde.'],
    verlopen: ['Deze code is verlopen', 'Een duel blijft 24 uur open. Vraag om een nieuwe code.'],
    bestaat_niet: ['Deze code bestaat niet', 'Kijk de code nog eens na.'],
    anders: ['Meedoen lukte niet', 'Probeer het opnieuw.']
  };
  FOUTEN.ongeldig = FOUTEN.bestaat_niet;

  const SVG_GOOGLE = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.5 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.2z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.7 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
  const SVG_VINK = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 12.5l4 4 8-8.5"/></svg>';

  const maakEl = (tag, klasse, tekst) => {
    const el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (tekst !== undefined) el.textContent = tekst;
    return el;
  };
  const opslag = {
    lees(sleutel) { try { return window.sessionStorage.getItem(sleutel); } catch { return null; } },
    zet(sleutel, waarde) { try { window.sessionStorage.setItem(sleutel, waarde); } catch {} },
    wis(sleutel) { try { window.sessionStorage.removeItem(sleutel); } catch {} }
  };
  // Snelle gok zonder te wachten, zoals deur.js: staat er een sessie van Supabase in deze browser?
  const heeftSessie = () => {
    try { return Object.keys(window.localStorage).some(sleutel => sleutel.startsWith('sb-') && sleutel.endsWith('-auth-token')); } catch { return false; }
  };
  // Zelfde regel als duel.html: hoofdletters, alleen letters en cijfers, 6 tekens uit TEKENS.
  const normaliseer = waarde => {
    const c = String(waarde || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return c.length === 6 && Array.from(c).every(teken => TEKENS.includes(teken)) ? c : '';
  };
  const metLimiet = (belofte, ms) => Promise.race([
    Promise.resolve(belofte),
    new Promise((_, nee) => window.setTimeout(() => nee(new Error('tijd')), ms))
  ]);

  function maak(root, acties) {
    acties = acties || {};
    const params = new URLSearchParams(window.location.search);
    const testmodus = params.get('test') === 'duel';
    let code = normaliseer(params.get('c'));

    let laatsteStaat = null;
    let ooitVerbonden = false;
    let getoond = false;
    let weggegaan = false;
    let fase = 'start'; // start | login | bezig | binnen | fout
    let run = 0;
    let rij = Promise.resolve();
    let bezigMetGoogle = false;
    let hoogteAnimatie = null;
    let googleKnop = null;
    let googleFout = null;
    const timers = new Set();
    const wachters = new Set();

    const later = (doe, ms) => {
      const t = window.setTimeout(() => { timers.delete(t); doe(); }, ms);
      timers.add(t);
      return t;
    };
    const slaap = ms => new Promise(klaar => later(klaar, ms));
    // Wissels van het scherm na elkaar, nooit door elkaar heen.
    const opRij = taak => (rij = rij.then(() => (weggegaan ? null : taak())).catch(fout => console.warn('Duel: laadscherm', fout)));

    // ---------- Opbouw ----------

    const sectie = maakEl('div', 'duel-laden');
    const kopId = 'dl-kop-' + Math.random().toString(36).slice(2, 8);
    sectie.setAttribute('role', 'group');
    sectie.setAttribute('aria-labelledby', kopId);
    sectie.dataset.licht = 'rust';

    // Het beeld: een knop zoals in een quizshow, met een ring die per stap vult en lampjes die rondlopen.
    const embleem = maakEl('div', 'dl-embleem');
    embleem.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 16; i++) {
      const lamp = maakEl('i', 'dl-lamp');
      lamp.style.setProperty('--i', String(i));
      embleem.append(lamp);
    }
    embleem.insertAdjacentHTML('beforeend', '<svg class="dl-ring" viewBox="0 0 120 120" focusable="false"><circle class="dl-ring-baan" cx="60" cy="60" r="54"/><circle class="dl-ring-vul" cx="60" cy="60" r="54"/></svg>');
    const golf = maakEl('span', 'dl-golf');
    const knopBeeld = maakEl('span', 'dl-knop');
    knopBeeld.innerHTML = '<svg class="dl-knop-vink" viewBox="0 0 24 24" focusable="false"><path d="M6 12.5l4 4 8-8.5"/></svg><svg class="dl-knop-let" viewBox="0 0 24 24" focusable="false"><path d="M12 6.5v7"/><path d="M12 17.5v.01"/></svg>';
    embleem.append(golf, knopBeeld);
    const ringVul = embleem.querySelector('.dl-ring-vul');

    const boven = maakEl('p', 'dl-boven', 'Duel met vrienden');
    const tekstBlok = maakEl('div', 'dl-tekst');
    const kop = maakEl('h1', 'dl-kop');
    kop.id = kopId;
    kop.tabIndex = -1;
    const sub = maakEl('p', 'dl-sub');
    tekstBlok.append(kop, sub);

    const kaart = maakEl('div', 'dl-kaart');
    const lijst = maakEl('ol', 'dl-stappen');
    lijst.setAttribute('aria-label', 'Stappen');
    const netwerk = maakEl('p', 'dl-netwerk', 'Geen verbinding. We proberen het opnieuw…');
    netwerk.hidden = true;
    kaart.append(lijst, netwerk);

    const actie = maakEl('div', 'dl-actie');
    const voorlees = maakEl('p', 'dl-voorlees');
    voorlees.setAttribute('role', 'status');
    voorlees.setAttribute('aria-live', 'polite');
    sectie.append(embleem, boven, tekstBlok, actie, kaart, voorlees);

    const zegVoor = tekst => {
      voorlees.textContent = '';
      later(() => { voorlees.textContent = tekst; }, 60);
    };

    // ---------- Beweging ----------

    // Schuift de hoogte van het scherm mee bij elke wissel, zodat niets eronder springt.
    function vloeiend(verander) {
      if (stil() || !getoond || !sectie.isConnected || typeof sectie.animate !== 'function') { verander(); return; }
      const van = sectie.getBoundingClientRect().height;
      hoogteAnimatie?.cancel();
      verander();
      const naar = sectie.getBoundingClientRect().height;
      if (Math.abs(naar - van) < 1) return;
      sectie.classList.add('is-schuivend');
      const animatie = sectie.animate([{ height: van + 'px' }, { height: naar + 'px' }], { duration: 320, easing: VERLOOP });
      hoogteAnimatie = animatie;
      const klaar = () => {
        if (hoogteAnimatie !== animatie) return;
        hoogteAnimatie = null;
        sectie.classList.remove('is-schuivend');
      };
      animatie.finished.then(klaar, klaar);
    }

    // Wissel van fase: wat weggaat vervaagt kort, dan verandert alles terwijl de hoogte meeschuift,
    // en de nieuwe tekst komt rustig op. Knoppen en meldingen die nieuw zijn, hebben de klasse dl-nieuw.
    async function wisselStand(verander, { teksten = [], uit = [], kaartIn = false } = {}) {
      if (stil() || !getoond || !sectie.isConnected || typeof sectie.animate !== 'function') {
        verander();
        zetVoortgang();
        return;
      }
      const weg = [...actie.children, ...uit, ...teksten].filter(el => el && el.isConnected && !el.hidden);
      const animaties = weg.map(el => el.animate(
        [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(4px)' }],
        { duration: 150, easing: VERLOOP, fill: 'forwards' }
      ));
      if (animaties.length) {
        // Nooit langer dan 320 ms wachten: in een verborgen tabblad staan animaties stil.
        await Promise.race([Promise.all(animaties.map(a => a.finished.catch(() => {}))), new Promise(klaar => window.setTimeout(klaar, 320))]);
      }
      if (weggegaan) return;
      vloeiend(() => { verander(); zetVoortgang(); });
      animaties.forEach(a => a.cancel());
      const nieuw = [...teksten];
      if (kaartIn && !kaart.hidden) nieuw.push(kaart);
      nieuw.forEach(el => el.animate(
        [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
        { duration: 240, delay: 40, easing: VERLOOP, fill: 'backwards' }
      ));
    }

    // De knop in het beeld veert kort in bij elke afgeronde stap.
    function veer() {
      if (stil() || !getoond || typeof knopBeeld.animate !== 'function') return;
      knopBeeld.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(.93)', offset: .4 }, { transform: 'scale(1)' }],
        { duration: 300, easing: VERLOOP }
      );
    }

    // ---------- Stappen ----------

    const stapEl = new Map();
    function maakStap(sleutel) {
      const li = maakEl('li', 'dl-stap');
      li.dataset.stap = sleutel;
      li.dataset.stand = 'wacht';
      const stip = maakEl('span', 'dl-stip');
      stip.setAttribute('aria-hidden', 'true');
      stip.innerHTML = SVG_VINK;
      li.append(stip, maakEl('span', 'dl-label', STAPPEN[sleutel]), maakEl('span', 'dl-voorlees'));
      stapEl.set(sleutel, li);
      return li;
    }
    // Houdt de stappen die er al staan, zet ontbrekende op hun plek en haalt de rest weg.
    function bouwStappen(sleutels) {
      [...stapEl.keys()].forEach(sleutel => {
        if (sleutels.includes(sleutel)) return;
        stapEl.get(sleutel).remove();
        stapEl.delete(sleutel);
      });
      sleutels.forEach((sleutel, i) => {
        let li = stapEl.get(sleutel);
        if (!li) {
          li = maakStap(sleutel);
          if (getoond) li.classList.add('dl-nieuw');
        }
        li.style.setProperty('--n', String(i));
        if (lijst.children[i] !== li) lijst.insertBefore(li, lijst.children[i] || null);
      });
    }
    function zetStap(sleutel, stand, { stilletjes = false } = {}) {
      const li = stapEl.get(sleutel);
      if (!li || li.dataset.stand === stand) return;
      li.dataset.stand = stand;
      li.querySelector('.dl-voorlees').textContent = stand === 'bezig' ? ', bezig' : stand === 'klaar' ? ', klaar' : '';
      if (!stilletjes) {
        if (stand === 'klaar') veer();
        if (stand === 'bezig') zegVoor(STAPPEN[sleutel]);
      }
      zetVoortgang();
    }
    function zetVoortgang() {
      let gedaan = 0;
      stapEl.forEach(li => { gedaan += li.dataset.stand === 'klaar' ? 1 : li.dataset.stand === 'bezig' ? .4 : 0; });
      const deel = fase === 'fout' || !stapEl.size ? 0 : Math.min(1, gedaan / stapEl.size);
      ringVul.style.strokeDashoffset = String(OMTREK * (1 - deel));
      ringVul.style.opacity = deel > 0 ? '1' : '0';
    }

    // ---------- Inhoud per fase ----------

    const codeTekst = () => maakEl('strong', 'dl-code', code);
    const zetTekst = (kopTekst, subInhoud) => {
      kop.textContent = kopTekst;
      sub.replaceChildren(...[].concat(subInhoud));
    };
    const terugPad = () => 'duel.html?c=' + encodeURIComponent(code);
    // "Andere code invullen": duel.html zonder code, met de testinstellingen erbij als die er zijn.
    const codePagina = () => {
      const p = new URLSearchParams();
      ['test', 'speler', 'snel'].forEach(sleutel => { const waarde = params.get(sleutel); if (waarde) p.set(sleutel, waarde); });
      const zoek = p.toString();
      return sitePad('duel.html' + (zoek ? '?' + zoek : ''));
    };

    function maakLogin() {
      const blok = maakEl('div', 'dl-login' + (getoond ? ' dl-nieuw' : ''));
      googleKnop = maakEl('button', 'knop-secundair knop-google dl-google');
      googleKnop.type = 'button';
      googleKnop.innerHTML = SVG_GOOGLE;
      googleKnop.append(maakEl('span', '', 'Doe mee met Google'));
      googleFout = maakEl('p', 'dl-fout');
      googleFout.id = kopId + '-fout';
      googleFout.setAttribute('role', 'alert');
      googleFout.hidden = true;
      googleKnop.setAttribute('aria-describedby', googleFout.id);
      googleKnop.addEventListener('click', metGoogle);
      const ook = maakEl('p', 'dl-ook', 'Liever met e-mail? ');
      const link = maakEl('a', 'tekstlink', 'Inloggen');
      link.href = sitePad('inloggen.html?terug=' + encodeURIComponent(terugPad()));
      link.addEventListener('click', () => opslag.zet('bes_terug', terugPad()));
      ook.append(link);
      blok.append(googleKnop, maakEl('p', 'dl-klein', 'Eén klik, geen wachtwoord nodig.'), googleFout, ook);
      return blok;
    }

    function maakFoutKnoppen(soort) {
      const blok = maakEl('div', 'dl-knoppen' + (getoond ? ' dl-nieuw' : ''));
      const andere = maakEl('a', '', 'Andere code invullen');
      andere.href = codePagina();
      if (soort === 'anders') {
        const opnieuw = maakEl('button', 'knop', 'Probeer opnieuw');
        opnieuw.type = 'button';
        opnieuw.addEventListener('click', () => { if (fase === 'fout') begin(); });
        andere.className = 'knop-secundair';
        blok.append(opnieuw, andere);
      } else {
        andere.className = 'knop';
        const zelf = maakEl('a', 'knop-secundair', 'Zelf een duel maken');
        zelf.href = sitePad('hub.html');
        blok.append(andere, zelf);
      }
      return blok;
    }

    function naarBezig() {
      const vanGoogle = !testmodus && opslag.lees(SLEUTEL_GOOGLE) === code;
      const sleutels = (vanGoogle || stapEl.has('account') ? ['account'] : []).concat(['verbinden', 'meedoen', 'binnen']);
      const vorige = fase;
      const verander = () => {
        fase = 'bezig';
        sectie.dataset.licht = 'jaag';
        zetTekst(KOP_UITNODIGING, ['Code ', codeTekst(), '. Nog even en je staat in de wachtkamer.']);
        bouwStappen(sleutels);
        // Wie hier na Google terugkomt, heeft zijn account: die stap is klaar.
        stapEl.forEach((li, sleutel) => zetStap(sleutel, sleutel === 'account' ? 'klaar' : 'wacht', { stilletjes: true }));
        netwerk.hidden = true;
        kaart.hidden = false;
        actie.replaceChildren();
      };
      if (vorige === 'start' || vorige === 'bezig') { verander(); zetVoortgang(); return null; }
      return wisselStand(verander, { teksten: vorige === 'fout' ? [tekstBlok] : [sub], kaartIn: vorige === 'fout' });
    }

    function naarLogin() {
      const vorige = fase;
      const verander = () => {
        fase = 'login';
        bezigMetGoogle = false;
        sectie.dataset.licht = 'rust';
        zetTekst(KOP_UITNODIGING, ['Code ', codeTekst(), '. Log in en je staat meteen in de wachtkamer.']);
        bouwStappen(['account', 'verbinden', 'meedoen', 'binnen']);
        stapEl.forEach((li, sleutel) => zetStap(sleutel, 'wacht', { stilletjes: true }));
        netwerk.hidden = true;
        kaart.hidden = false;
        actie.replaceChildren(maakLogin());
      };
      if (vorige === 'start') { verander(); zetVoortgang(); return null; }
      return wisselStand(verander, { teksten: vorige === 'fout' ? [tekstBlok] : [sub], kaartIn: vorige === 'fout' });
    }

    function naarFout(soort) {
      const sleutel = Object.hasOwn(FOUTEN, soort) ? soort : 'anders';
      const [kopTekst, uitleg] = FOUTEN[sleutel];
      const vorige = fase;
      const verander = () => {
        fase = 'fout';
        bezigMetGoogle = false;
        sectie.dataset.licht = 'uit';
        zetTekst(kopTekst, uitleg);
        kaart.hidden = true;
        actie.replaceChildren(maakFoutKnoppen(sleutel === 'ongeldig' ? 'bestaat_niet' : sleutel));
      };
      if (vorige === 'start') { verander(); zetVoortgang(); return null; }
      return wisselStand(verander, { teksten: [tekstBlok], uit: [kaart] }).then(() => {
        if (weggegaan) return;
        kop.focus({ preventScroll: true });
        zegVoor(kopTekst + '. ' + uitleg);
      });
    }

    function naarBinnen() {
      fase = 'binnen';
      zetStap('binnen', 'klaar');
      sectie.dataset.licht = 'feest';
      zegVoor('Je zit erin. Op naar de wachtkamer…');
      // Vangnet: gaat het na 8 seconden nog niet vanzelf verder, dan een knop om opnieuw te laden.
      later(toonNood, 8000);
      return wisselStand(() => { sub.replaceChildren('Op naar de wachtkamer…'); }, { teksten: [sub] });
    }

    function toonNood() {
      if (weggegaan || fase !== 'binnen') return;
      const regel = maakEl('p', 'dl-nood dl-nieuw', 'Gaat het niet vanzelf verder? ');
      const knop = maakEl('button', 'tekstlink dl-tekstknop', 'Laad opnieuw');
      knop.type = 'button';
      knop.addEventListener('click', () => window.location.reload());
      regel.append(knop);
      vloeiend(() => actie.replaceChildren(regel));
    }

    // ---------- Wachten op iets ----------

    // Kijkt bij elke nieuwe stand, bij online/offline en twee keer per seconde of de voorwaarde klopt.
    function wachtOp(voorwaarde, ms, levend) {
      return new Promise((ja, nee) => {
        const begin = performance.now();
        let klok = 0;
        const stop = () => { window.clearInterval(klok); wachters.delete(kijk); };
        function kijk() {
          if (!levend()) { stop(); nee(new Error('weg')); return; }
          let goed = false;
          try { goed = Boolean(voorwaarde()); } catch {}
          if (goed) { stop(); ja(true); return; }
          if (performance.now() - begin >= ms) { stop(); ja(false); }
        }
        klok = window.setInterval(kijk, 500);
        wachters.add(kijk);
        kijk();
      });
    }
    const porren = () => [...wachters].forEach(kijk => kijk());

    // Geen verbinding: de browser is offline, of de stand meldt verbonden: false nadat hij eerder verbonden was.
    // (De lege stand van duel.html heeft altijd verbonden: false; die telt niet.)
    const verbindingGoed = () => window.navigator.onLine !== false && !(ooitVerbonden && laatsteStaat && laatsteStaat.verbonden === false);
    function zetNetwerk(aan) {
      if (netwerk.hidden === !aan) return;
      if (aan) netwerk.classList.add('dl-nieuw');
      vloeiend(() => { netwerk.hidden = !aan; });
    }
    // duel.html meldt het zelf al bovenaan de pagina (#duel-verbinding): dan hier geen tweede melding.
    const paginaMeldtAl = () => { const balk = document.getElementById('duel-verbinding'); return Boolean(balk && !balk.hidden); };
    async function wachtOpVerbinding(levend) {
      if (verbindingGoed()) return;
      // Een korte hapering hoeft niemand te zien: de melding komt pas na 2,5 seconden zonder verbinding.
      const sinds = performance.now();
      await wachtOp(() => {
        const goed = verbindingGoed();
        zetNetwerk(!goed && performance.now() - sinds > 2500 && !paginaMeldtAl());
        return goed;
      }, Infinity, levend);
      zetNetwerk(false);
    }

    const isDeelnemer = () => {
      const s = laatsteStaat;
      return Boolean(s && s.ik && Array.isArray(s.deelnemers) && s.deelnemers.some(d => d && d.speler === s.ik));
    };
    // Met ?speler=0 is de nepspeler niet ingelogd (zie duel-nep.js); verder is hij dat in de testmodus altijd.
    const testIngelogd = () => !(BES.duelNep && BES.duelNep.ik === null);

    async function isIngelogd(levend) {
      if (laatsteStaat && laatsteStaat.ik) return true;
      if (testmodus) return testIngelogd();
      if (!BES.auth) { try { await wachtOp(() => BES.auth, 3000, levend); } catch { return false; } }
      const auth = BES.auth;
      if (!auth || typeof auth.gebruiker !== 'function') return false;
      try { return Boolean(await metLimiet(auth.gebruiker(), 10000)); } catch { return false; }
    }

    // ---------- Het verloop ----------

    async function begin() {
      const mijn = ++run;
      const levend = () => mijn === run && !weggegaan;
      if (!code) { await opRij(() => naarFout('bestaat_niet')); return; }
      await opRij(naarBezig);
      if (!levend()) return;

      // Verbinden: het account is bekend en er is internet.
      zetStap('verbinden', 'bezig');
      const t0 = performance.now();
      let ingelogd = false;
      try {
        ingelogd = await isIngelogd(levend);
        if (ingelogd) await wachtOpVerbinding(levend);
        const rest = MIN_VERBINDEN - (performance.now() - t0);
        if (rest > 0) await slaap(rest);
      } catch { return; }
      if (!levend()) return;
      opslag.wis(SLEUTEL_GOOGLE);
      if (!ingelogd) { await opRij(() => naarLogin()); return; }
      zetStap('verbinden', 'klaar');

      // Meedoen: één aanroep van doeMee. Fouten komen als { ok: false, fout } terug, of als een gegooide fout.
      zetStap('meedoen', 'bezig');
      let antwoord = null;
      try {
        await slaap(ADEM_MEEDOEN);
        if (!levend()) return;
        if (isDeelnemer()) antwoord = { ok: true };
        else if (typeof acties.doeMee === 'function') antwoord = await metLimiet(acties.doeMee(code), 15000);
      } catch {
        antwoord = null;
      }
      if (!levend()) return;
      if (!antwoord || antwoord.ok !== true) {
        const fout = antwoord && antwoord.fout;
        if (fout === 'niet_ingelogd' && !(testmodus && testIngelogd())) { await opRij(() => naarLogin()); return; }
        await opRij(() => naarFout(fout));
        return;
      }
      zetStap('meedoen', 'klaar');
      await opRij(naarBinnen);
    }

    // ---------- Inloggen met Google ----------

    async function metGoogle() {
      if (bezigMetGoogle || fase !== 'login' || !googleKnop) return;
      bezigMetGoogle = true;
      googleKnop.disabled = true;
      googleKnop.setAttribute('aria-busy', 'true');
      verbergGoogleFout();
      sectie.dataset.licht = 'jaag';
      zetStap('account', 'bezig');
      if (testmodus) {
        await slaap(600);
        googleTerug();
        toonGoogleFout('In de testmodus kies je een speler met ?speler=1 tot 4.');
        return;
      }
      // Na Google komt de browser terug op inloggen.html; die stuurt door naar bes_terug, dus naar dit duel.
      opslag.zet('bes_terug', terugPad());
      opslag.zet(SLEUTEL_GOOGLE, code);
      try {
        const auth = BES.auth;
        if (!auth || typeof auth.metGoogle !== 'function') throw new Error('geen login');
        await auth.metGoogle();
      } catch (fout) {
        googleTerug();
        const bekend = ['unavailable', 'google_unavailable', 'network', 'rate_limit'].includes(fout && fout.code) && fout.message;
        toonGoogleFout(bekend ? fout.message : 'Inloggen lukte niet. Probeer het opnieuw.');
      }
    }
    // Inloggen ging niet door (fout, of terug met de knop Vorige): alles weer zoals voor de klik.
    function googleTerug() {
      bezigMetGoogle = false;
      opslag.wis(SLEUTEL_GOOGLE);
      opslag.wis('bes_terug');
      if (googleKnop) { googleKnop.disabled = false; googleKnop.removeAttribute('aria-busy'); }
      if (fase === 'login') { sectie.dataset.licht = 'rust'; zetStap('account', 'wacht', { stilletjes: true }); }
    }
    function toonGoogleFout(tekst) {
      if (!googleFout || weggegaan || fase !== 'login') return;
      googleFout.textContent = tekst;
      if (!googleFout.hidden) return;
      vloeiend(() => { googleFout.hidden = false; });
      if (!stil() && typeof googleFout.animate === 'function') googleFout.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: VERLOOP });
    }
    function verbergGoogleFout() {
      if (!googleFout || googleFout.hidden) return;
      vloeiend(() => { googleFout.hidden = true; });
    }

    // ---------- Gebeurtenissen van buiten ----------

    const bijVerbinding = () => porren();
    // Ingelogd in een ander tabblad terwijl dit scherm wacht: meteen verder.
    const bijAccount = event => {
      if (fase === 'login' && !bezigMetGoogle && !testmodus && event.detail && event.detail.user) begin();
    };
    const bijTerugkeer = event => { if (event.persisted && bezigMetGoogle) googleTerug(); };
    window.addEventListener('online', bijVerbinding);
    window.addEventListener('offline', bijVerbinding);
    window.addEventListener('bes:auth', bijAccount);
    window.addEventListener('pageshow', bijTerugkeer);

    function eersteWeergave() {
      if (!code) { naarFout('bestaat_niet'); return; }
      if (testmodus ? testIngelogd() : (heeftSessie() || Boolean(laatsteStaat && laatsteStaat.ik))) { naarBezig(); return; }
      opslag.wis(SLEUTEL_GOOGLE);
      naarLogin();
    }

    // Zonder sessie-gok toch ingelogd (bijvoorbeeld net in een ander tabblad): dan meteen verder.
    async function controleerLogin() {
      const mijn = run;
      const ja = await isIngelogd(() => !weggegaan && fase === 'login').catch(() => false);
      if (ja && !weggegaan && fase === 'login' && !bezigMetGoogle && run === mijn) begin();
    }

    function toon(staat) {
      if (weggegaan) return;
      if (staat && typeof staat === 'object') {
        laatsteStaat = staat;
        if (staat.verbonden === true) ooitVerbonden = true;
      }
      if (getoond) { porren(); return; }
      if (!code) code = normaliseer(laatsteStaat && (laatsteStaat.code || (laatsteStaat.kamer && laatsteStaat.kamer.code)));
      eersteWeergave();
      if (!sectie.isConnected) root.append(sectie);
      getoond = true;
      if (!stil()) {
        sectie.classList.add('is-binnenkomst');
        later(() => sectie.classList.remove('is-binnenkomst'), 1400);
      }
      if (fase === 'bezig') begin();
      else if (fase === 'login') controleerLogin();
    }

    function weg() {
      if (weggegaan) return;
      weggegaan = true;
      run++;
      porren();
      timers.forEach(t => window.clearTimeout(t));
      timers.clear();
      hoogteAnimatie?.cancel();
      window.removeEventListener('online', bijVerbinding);
      window.removeEventListener('offline', bijVerbinding);
      window.removeEventListener('bes:auth', bijAccount);
      window.removeEventListener('pageshow', bijTerugkeer);
    }

    return { toon, weg };
  }

  BES.duelScherm.laden = { maak };
})();
