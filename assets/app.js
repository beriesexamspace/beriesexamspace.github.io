(() => {
  'use strict';

  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const needsPageFade = !('CSSViewTransitionRule' in window) || window.location.protocol === 'file:';

  const hoverInput = window.matchMedia('(any-hover: hover)');
  root.classList.toggle('has-hover', hoverInput.matches);
  const updateInput = event => root.classList.toggle('has-hover', event.pointerType === 'mouse');
  document.addEventListener('pointermove', updateInput, { passive: true });
  document.addEventListener('pointerdown', updateInput, { passive: true });
  hoverInput.addEventListener('change', event => root.classList.toggle('has-hover', event.matches));

  if (needsPageFade && !motion.matches) root.classList.add('page-fade');

  // Zonder account toont de navigatiebalk alleen Insturen (zie style.css). Eerst een snelle gok uit de opslag,
  // zodat de balk meteen goed staat; auth.js zet het daarna zeker zodra het account bekend is.
  let heeftSessie = false;
  try {
    heeftSessie = Object.keys(window.localStorage).some(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
  } catch {}
  root.classList.toggle('zonder-account', !heeftSessie);

  // Elke pagina begint bovenaan, ook na herladen of terug-gaan: de browser zet de oude scrollplek niet meer terug.
  // Zet iets anders de pagina vlak na het openen toch lager (zoals de omgeving van een voorbeeld), dan gaat ze terug naar boven,
  // zolang je zelf nog niets deed. Alleen een link naar een plek op de pagina (#...) begint daar.
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  let zelfBewogen = false;
  let bewaakTot = performance.now() + 3000;
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(soort => {
    window.addEventListener(soort, () => { zelfBewogen = true; }, { capture: true, passive: true });
  });
  const naarBoven = () => {
    if (zelfBewogen || window.scrollY === 0 || performance.now() > bewaakTot) return;
    let doel = null;
    try { doel = window.location.hash.length > 1 && document.getElementById(decodeURIComponent(window.location.hash.slice(1))); } catch {}
    if (doel) return;
    const gedrag = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = gedrag;
  };
  window.addEventListener('scroll', naarBoven, { passive: true });
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      zelfBewogen = false;
      bewaakTot = performance.now() + 3000;
    }
    naarBoven();
  });

  window.naamOpslaan = naam => {
    try {
      window.localStorage.setItem('bes_naam', naam);
      return true;
    } catch {
      return false;
    }
  };

  window.naamOphalen = () => {
    try {
      return window.localStorage.getItem('bes_naam');
    } catch {
      return null;
    }
  };

  window.jaarOpslaan = jaar => {
    try {
      window.localStorage.setItem('bes_jaar', jaar);
      return true;
    } catch {
      return false;
    }
  };

  window.jaarOphalen = () => {
    try {
      return window.localStorage.getItem('bes_jaar');
    } catch {
      return null;
    }
  };

  window.BES = Object.assign(window.BES || {}, {
    naamOpslaan: window.naamOpslaan,
    naamOphalen: window.naamOphalen,
    jaarOpslaan: window.jaarOpslaan,
    jaarOphalen: window.jaarOphalen
  });

  // Er is geen abonnement meer (Berat, 04-11-2026): alles staat open voor iedereen. Oude aanroepen van
  // BES.kiesPlan (of een link met data-kies-plan) gaan naar de uitleg op abonnement.html; de Plus-reclame op de hub is weg.
  const abonnementUrl = (() => {
    try { return new URL('../abonnement.html', document.currentScript.src).href; } catch { return 'abonnement.html'; }
  })();
  window.BES.kiesPlan = () => { window.location.href = abonnementUrl; };
  window.BES.planReclame = async () => {};
  // Pop-up "Er is geen abonnement meer" (Berat, 04-11-2026): voor iedereen, één keer per toestel. hub.html roept dit aan.
  // Staat er al een ander venster open (zoals Comit die zich voorstelt), dan wacht hij tot dat dicht is.
  window.BES.geenAboMelding = (pogingen = 10) => {
    const sleutel = 'bes_geen_abo_gezien';
    try { if (window.localStorage.getItem(sleutel)) return; } catch { return; }
    if (typeof HTMLDialogElement !== 'function') return;
    if (document.querySelector('dialog[open]')) {
      if (pogingen > 0) window.setTimeout(() => window.BES.geenAboMelding(pogingen - 1), 3000);
      return;
    }
    try { window.localStorage.setItem(sleutel, '1'); } catch {}
    const maak = (tag, klasse, tekst) => {
      const el = document.createElement(tag);
      if (klasse) el.className = klasse;
      if (tekst) el.textContent = tekst;
      return el;
    };
    const venster = maak('dialog', 'kies-plan geen-abo');
    venster.setAttribute('aria-labelledby', 'geen-abo-kop');
    const kop = maak('h2', '', 'Er is geen abonnement meer');
    kop.id = 'geen-abo-kop';
    const voet = maak('div', 'kies-plan-voet');
    const waarom = maak('a', 'kies-plan-later', 'Lees waarom');
    waarom.href = abonnementUrl;
    const verder = maak('button', 'knop', 'Top, verder oefenen');
    verder.type = 'button';
    verder.addEventListener('click', () => window.BES.sluitDialoog(venster));
    voet.append(waarom, verder);
    venster.append(
      kop,
      maak('p', 'kies-plan-reden', "Bij Berie's Exam Space zit je nooit meer vast aan een maandbedrag. Alles staat nu open voor iedereen, ook onbeperkt simulaties en alle hulp van Comit."),
      maak('p', 'kies-plan-reden', 'Er komt iets beters in de plaats. Daar hoor je snel meer over.'),
      voet
    );
    venster.addEventListener('click', event => {
      if (event.target !== venster) return;
      const r = venster.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) window.BES.sluitDialoog(venster);
    });
    venster.addEventListener('cancel', event => { event.preventDefault(); window.BES.sluitDialoog(venster); });
    venster.addEventListener('close', () => venster.remove());
    document.body.append(venster);
    venster.showModal();
    verder.focus({ preventScroll: true });
  };

  // Gedeelde beweging voor pagina's (zie style.css): een venster sluiten, en een blok rustig tonen of verbergen,
  // zodat de inhoud eronder meeschuift in plaats van te springen. Bij "minder beweging" gaat alles direct.
  const zachtVerloop = element => getComputedStyle(element).getPropertyValue('--ease').trim() || 'ease-out';
  window.BES.sluitDialoog = dialoog => {
    if (!dialoog || !dialoog.open || dialoog.classList.contains('is-sluitend')) return;
    if (motion.matches) { dialoog.close(); return; }
    dialoog.classList.add('is-sluitend');
    window.setTimeout(() => { dialoog.classList.remove('is-sluitend'); if (dialoog.open) dialoog.close(); }, 200);
  };
  const lopend = new WeakMap();
  // Schuift een blok in hoogte en opacity van 'open' naar 'dicht' of andersom. Loopt er al een schuif,
  // dan begint de nieuwe vanaf waar het blok nu is, zodat het niet eerst terugspringt.
  const hoogteAnimatie = (element, van, naar, klaar) => {
    const bezig = lopend.get(element);
    let nu = null;
    if (bezig) {
      const st = getComputedStyle(element);
      nu = { height: element.getBoundingClientRect().height + 'px', marginTop: st.marginTop, marginBottom: st.marginBottom, paddingTop: st.paddingTop, paddingBottom: st.paddingBottom, opacity: st.opacity };
      bezig.cancel();
    }
    const stijl = getComputedStyle(element);
    const marges = { marginTop: stijl.marginTop, marginBottom: stijl.marginBottom, paddingTop: stijl.paddingTop, paddingBottom: stijl.paddingBottom };
    const dicht = { height: '0px', marginTop: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 };
    const open = { height: element.getBoundingClientRect().height + 'px', ...marges, opacity: 1 };
    element.style.overflow = 'hidden';
    const animatie = element.animate([nu || (van === 'dicht' ? dicht : open), naar === 'dicht' ? dicht : open], { duration: 220, easing: zachtVerloop(element) });
    animatie.sluit = naar === 'dicht';
    lopend.set(element, animatie);
    const opruimen = () => { if (lopend.get(element) !== animatie) return; lopend.delete(element); element.style.overflow = ''; klaar?.(); };
    animatie.addEventListener('finish', opruimen);
    return animatie;
  };
  // Toon een verborgen blok (hidden weg) en laat het in hoogte openschuiven.
  window.BES.toon = element => {
    if (!element) return;
    const sluit = lopend.get(element)?.sluit;
    const wasVerborgen = sluit || element.hidden || !element.getClientRects().length;
    element.hidden = false;
    if (!wasVerborgen || motion.matches || !element.animate || !element.getClientRects().length) {
      if (sluit) { lopend.get(element).cancel(); lopend.delete(element); element.style.overflow = ''; }
      return;
    }
    hoogteAnimatie(element, 'dicht', 'open');
  };
  // Verberg een blok: eerst dichtschuiven en uitfaden, daarna hidden. klaar() draait na afloop (ook zonder beweging).
  window.BES.verberg = (element, klaar) => {
    if (!element) return;
    if (element.hidden || motion.matches || !element.animate || !element.getClientRects().length) { element.hidden = true; klaar?.(); return; }
    if (lopend.get(element)?.sluit) return;
    hoogteAnimatie(element, 'open', 'dicht', () => { element.hidden = true; klaar?.(); });
  };
  // Wissel de inhoud van een blok rustig: kort uitfaden, verander() terwijl niets zichtbaar is, en weer infaden.
  // Zo springt een kop of formulier dat van hoogte wisselt niet zichtbaar. Geeft een promise terug.
  window.BES.wissel = async (element, verander) => {
    if (!element || motion.matches || !element.animate) { verander(); return; }
    const verloop = zachtVerloop(element);
    // Nooit langer wachten dan 300ms: in een verborgen tab staan animaties stil.
    const wacht = animatie => Promise.race([animatie.finished.catch(() => {}), new Promise(klaar => window.setTimeout(klaar, 300))]);
    const uit = element.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(4px)' }], { duration: 120, easing: verloop, fill: 'forwards' });
    await wacht(uit);
    verander();
    const terug = element.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: verloop });
    uit.cancel();
    await wacht(terug);
  };

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const validTheme = value => value === 'licht' || value === 'donker';
  const storedTheme = () => {
    try { return window.localStorage.getItem('bes_thema'); } catch { return null; }
  };
  let themeUser;
  let accountTheme = null;
  let themeChosenHere = false;
  let themeRevision = 0;
  let themeSave = Promise.resolve();

  const applyTheme = (value, remember = false) => {
    if (!validTheme(value)) return;
    const dark = value === 'donker';
    root.dataset.theme = dark ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0B0B0C' : '#FFFFFF';
    document.querySelectorAll('.thema-knop').forEach(button => {
      button.setAttribute('aria-label', 'Donkere modus');
      button.setAttribute('aria-pressed', String(dark));
    });
    if (remember) {
      try { window.localStorage.setItem('bes_thema', value); } catch {}
    }
  };
  window.BES.themaToepassen = value => applyTheme(value, true);

  window.addEventListener('bes:auth', event => {
    const user = event.detail?.user;
    const id = user?.id || null;
    if (themeUser !== undefined && themeUser !== id) {
      themeChosenHere = false;
      themeRevision++;
    }
    themeUser = id;
    accountTheme = validTheme(user?.user_metadata?.thema) ? user.user_metadata.thema : null;
    if (!themeChosenHere && validTheme(user?.user_metadata?.thema)) {
      applyTheme(user.user_metadata.thema, true);
    }
  });
  systemTheme.addEventListener('change', () => {
    if (!themeChosenHere && !accountTheme && !validTheme(storedTheme())) applyTheme(systemTheme.matches ? 'donker' : 'licht');
  });

  const setupTheme = () => {
    const navigation = document.querySelector('nav.navigation, nav.nav-vol');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thema-knop';
    button.innerHTML = '<svg class="thema-zon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4L19 5"/></svg><svg class="thema-maan" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.5 14A8.6 8.6 0 0 1 10 3.5 8.7 8.7 0 1 0 20.5 14Z"/></svg>';
    if (navigation) {
      navigation.insertBefore(button, navigation.querySelector('.account-controls, .login-button'));
    } else {
      button.classList.add('is-los');
      document.body.prepend(button);
    }
    const saved = storedTheme();
    const initial = root.dataset.theme === 'dark' ? 'donker' : root.dataset.theme === 'light' ? 'licht' : validTheme(saved) ? saved : systemTheme.matches ? 'donker' : 'licht';
    applyTheme(initial);
    button.addEventListener('click', () => {
      const value = root.dataset.theme === 'dark' ? 'licht' : 'donker';
      const owner = themeUser;
      themeChosenHere = true;
      const revision = ++themeRevision;
      applyTheme(value, true);
      themeSave = themeSave.catch(() => {}).then(async () => {
        const auth = window.BES.auth;
        if (!owner || !auth?.profielBijwerken || revision !== themeRevision) return;
        const user = await auth.gebruiker();
        if (user?.id !== owner || revision !== themeRevision) return;
        await auth.profielBijwerken({ thema: value });
      }).catch(() => {});
    });
  };

  const revealPage = () => root.classList.add('page-ready');

  const setupNavigation = () => {
    const navigation = document.querySelector('nav.navigation, nav.nav-vol');
    if (!navigation) return;

    const menuButton = navigation.querySelector('.menu-toggle');
    const menu = navigation.querySelector('.navigation-links');
    const mobile = window.matchMedia('(max-width: 767px)');
    const fixed = document.body.dataset.nav === 'vast';
    let scrollFrame = 0;

    const updateScroll = () => {
      navigation.classList.toggle('is-zwevend', !fixed && window.scrollY > 24);
      scrollFrame = 0;
    };

    if (!fixed) {
      window.addEventListener('scroll', () => {
        if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
      }, { passive: true });
    }
    window.addEventListener('pageshow', updateScroll);
    updateScroll();

    if (!menuButton || !menu) return;

    // Sluiten beweegt ook: is-sluitend speelt 180 ms de sluitanimatie (style.css), daarna gaat menu-open weg.
    let sluitTimer = 0;
    const closeMenu = (restoreFocus = false) => {
      const wasOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', 'false');
      window.clearTimeout(sluitTimer);
      if (wasOpen && mobile.matches && !motion.matches && navigation.classList.contains('menu-open')) {
        navigation.classList.add('is-sluitend');
        sluitTimer = window.setTimeout(() => navigation.classList.remove('menu-open', 'is-sluitend'), 180);
      } else {
        navigation.classList.remove('menu-open', 'is-sluitend');
      }
      if (wasOpen && restoreFocus && mobile.matches) menuButton.focus();
    };

    menuButton.addEventListener('click', () => {
      if (!mobile.matches) return;
      if (menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); return; }
      window.clearTimeout(sluitTimer);
      navigation.classList.remove('is-sluitend');
      navigation.classList.add('menu-open');
      menuButton.setAttribute('aria-expanded', 'true');
    });

    menu.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu(menu.contains(document.activeElement));
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navigation.classList.contains('menu-open')) {
        event.preventDefault();
        closeMenu(true);
      }
    });

    document.addEventListener('click', event => {
      if (!navigation.contains(event.target)) closeMenu(menu.contains(document.activeElement));
      // Het profielmenu en het navigatiemenu staan nooit tegelijk open.
      else if (event.target.closest && event.target.closest('.profiel-knop')) closeMenu();
    });

    document.addEventListener('focusin', event => {
      if (!navigation.contains(event.target)) closeMenu();
    });

    mobile.addEventListener('change', () => {
      const focusedLink = menu.contains(document.activeElement);
      const focusedToggle = document.activeElement === menuButton;
      closeMenu();
      if (mobile.matches && focusedLink) menuButton.focus();
      if (!mobile.matches && focusedToggle) navigation.querySelector('.brand')?.focus();
    });

    window.addEventListener('pageshow', () => closeMenu());
    closeMenu();
  };

  const setupLinks = () => {
    const wrapBackArrow = link => {
      if (link.querySelector('.terug-pijl')) return;
      const text = Array.from(link.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (!text || !/^\s*\u2190/.test(text.textContent)) return;
      const arrow = document.createElement('span');
      arrow.className = 'terug-pijl';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '\u2190';
      const arrowText = text.splitText(text.textContent.indexOf('\u2190'));
      arrowText.splitText(1);
      arrowText.replaceWith(arrow);
    };

    const wrapBackLinks = element => {
      if (element.matches('a.terug')) wrapBackArrow(element);
      element.querySelectorAll('a.terug').forEach(wrapBackArrow);
    };

    // Terug naar de hub kan alleen met een account, want de hub zit achter de deur.
    // Kom je van Insturen (?van=insturen), dan brengt Terug je daar terug, bij het verhaal.
    // Op een open pagina zonder sessie gaat Terug naar de startpagina in plaats van naar het inlogscherm.
    const terugDoel = doel => {
      if (!/(^|\/)hub\.html$/.test(doel)) return doel;
      const map = doel.slice(0, -'hub.html'.length);
      let van = null;
      try { van = new URLSearchParams(window.location.search).get('van'); } catch {}
      if (van === 'insturen') return map + 'insturen/#verhaal';
      if (window.BES_DEUR) return doel;
      return heeftSessie ? doel : map + 'index.html';
    };

    document.querySelectorAll('[data-terug]').forEach(element => {
      const link = element.tagName === 'A' ? element : document.createElement('a');
      if (link !== element) {
        Array.from(element.attributes).forEach(attribute => {
          if (!['type', 'role', 'disabled'].includes(attribute.name)) {
            link.setAttribute(attribute.name, attribute.value);
          }
        });
      }
      link.href = terugDoel(element.dataset.terug);
      link.classList.add('terug');
      link.textContent = `\u2190 ${element.dataset.terugTekst || 'Terug'}`;
      wrapBackArrow(link);
      if (link !== element) element.replaceWith(link);
    });

    // Insturen is een afgesloten route, ook voor wie de QR-code scant zonder account. Op Insturen onthouden we waar je was.
    // Op de pagina's die je van daaruit opent (privacy, voorwaarden, Over mij, WhatsApp, inloggen, aanmelden) brengt Terug
    // je daar terug. Zonder account gaan daar en op Insturen ook alle andere links naar de leersite (startpagina, hub, vakken)
    // terug naar Insturen. Op elke andere pagina vervalt de route.
    const insturenSleutel = 'bes_insturen_terug';
    const pad = window.location.pathname;
    const opInsturen = /\/insturen\/(index\.html|formulier\.html)?$/.test(pad);
    const vanuitInsturen = /\/(privacy|voorwaarden|over-mij|whatsapp|inloggen|aanmelden|wachtwoord)\.html$/.test(pad);
    let insturenTerug = null;
    try {
      if (opInsturen) window.sessionStorage.setItem(insturenSleutel, pad + window.location.search);
      else if (vanuitInsturen) insturenTerug = window.sessionStorage.getItem(insturenSleutel);
      else window.sessionStorage.removeItem(insturenSleutel);
    } catch {}
    if (insturenTerug && !/^\/insturen\/[^/]*$/.test(insturenTerug.split('?')[0])) insturenTerug = null;
    if (insturenTerug) {
      // Kwam je met ?van=insturen van het verhaal op Insturen (Lees meer over mij), dan landt Terug weer bij het verhaal.
      const naarVerhaal = /[?&]van=insturen(&|$)/.test(window.location.search) && /^\/insturen\/(index\.html)?$/.test(insturenTerug.split('?')[0]);
      document.querySelectorAll('a.terug').forEach(link => { link.href = insturenTerug + (naarVerhaal ? '#verhaal' : ''); });
    }
    // Met data-terug-vorige (de voorwaarden, die je opent vanaf het abonnement, aanmelden of de privacy) brengt Terug je naar
    // de pagina van de site waar je vandaan kwam. Open je de pagina rechtstreeks of van buiten de site, dan geldt data-terug.
    if (!insturenTerug) {
      let vorige = null;
      try {
        const van = new URL(document.referrer);
        if (van.origin === window.location.origin && van.pathname !== pad) vorige = van.href;
      } catch {}
      if (vorige) document.querySelectorAll('a.terug[data-terug-vorige]').forEach(link => { link.href = vorige; });
    }
    if (!heeftSessie && (opInsturen || insturenTerug)) {
      const naar = insturenTerug || pad.replace(/[^/]*$/, '') + window.location.search;
      const toegestaan = /\/(insturen\/[^/]*|privacy\.html|voorwaarden\.html|over-mij\.html|whatsapp\.html|inloggen\.html|aanmelden\.html|wachtwoord\.html)$/;
      document.querySelectorAll('a[href]').forEach(link => {
        let doel;
        try { doel = new URL(link.getAttribute('href'), window.location.href); } catch { return; }
        if (doel.origin !== window.location.origin || doel.pathname === pad || toegestaan.test(doel.pathname)) return;
        link.href = naar;
      });
    }

    wrapBackLinks(document.body);
    new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        const link = mutation.target instanceof Element ? mutation.target.closest('a.terug') : null;
        if (link) wrapBackArrow(link);
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element) wrapBackLinks(node);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });

    document.querySelectorAll('a[href][target="_blank"]').forEach(link => {
      try {
        const target = new URL(link.getAttribute('href'), document.baseURI);
        const internal = window.location.protocol === 'file:'
          ? target.protocol === 'file:'
          : target.origin === window.location.origin;
        if (internal) link.removeAttribute('target');
      } catch {
        return;
      }
    });
  };

  const setupSignature = () => {
    const paths = Array.from(document.querySelectorAll('.signature path'));
    if (!paths.length) return;

    const animations = [];
    const cancelAnimations = () => animations.splice(0).forEach(animation => animation.cancel());
    const showSignature = () => {
      cancelAnimations();
      paths.forEach(path => {
        path.style.strokeDasharray = 'none';
        path.style.strokeDashoffset = '0';
      });
    };

    const lengths = paths.map(path => path.getTotalLength());
    const totalLength = lengths.reduce((sum, length) => sum + length, 0);
    const updateSignature = () => {
      if (motion.matches || !Element.prototype.animate || !totalLength) {
        showSignature();
        return;
      }

      cancelAnimations();
      const writeDuration = 4000;
      const holdDuration = 2000;
      const eraseDuration = 3000;
      const emptyDuration = 1000;
      const eraseStart = writeDuration + holdDuration;
      const cycleDuration = eraseStart + eraseDuration + emptyDuration;
      let completedLength = 0;

      paths.forEach((path, index) => {
        path.removeAttribute('pathLength');
        path.style.strokeDasharray = `${lengths[index]} ${lengths[index]}`;
        path.style.strokeDashoffset = String(lengths[index]);
      });

      const startTime = document.timeline.currentTime;
      paths.forEach((path, index) => {
        const length = lengths[index];
        const start = completedLength / totalLength;
        completedLength += length;
        const end = completedLength / totalLength;
        const animation = path.animate([
          { offset: 0, strokeDashoffset: String(length) },
          { offset: start * writeDuration / cycleDuration, strokeDashoffset: String(length) },
          { offset: end * writeDuration / cycleDuration, strokeDashoffset: '0' },
          { offset: (eraseStart + (1 - end) * eraseDuration) / cycleDuration, strokeDashoffset: '0' },
          { offset: (eraseStart + (1 - start) * eraseDuration) / cycleDuration, strokeDashoffset: String(length) },
          { offset: 1, strokeDashoffset: String(length) }
        ], { duration: cycleDuration, iterations: Infinity, easing: 'linear', fill: 'both' });
        if (startTime !== null) animation.startTime = startTime;
        animations.push(animation);
      });
    };

    updateSignature();
    motion.addEventListener('change', updateSignature);
  };

  // Getekende muisaanwijzer, overgenomen uit Helder (app.js). Alleen bij een echte muis; touch toont niets.
  const setupCursor = () => {
    if (document.querySelector('.cursor-dot')) return;
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    dot.setAttribute('popover', 'manual');
    if (typeof dot.showPopover !== 'function') return;
    document.body.append(dot);
    let currentDialog = null;
    let releaseTimer;
    let pointerPosition = null;
    let refreshFrame = 0;
    // De bol houdt één kleur per thema (--cursor-tone in style.css): zwart in licht, wit in donker.
    const clear = () => {
      clearTimeout(releaseTimer);
      cancelAnimationFrame(refreshFrame);
      refreshFrame = 0;
      pointerPosition = null;
      dot.classList.remove('is-pressed', 'is-releasing', 'over-control');
      document.documentElement.classList.remove('ball-cursor');
      if (dot.matches(':popover-open')) dot.hidePopover();
      currentDialog = null;
    };
    const updatePointer = event => {
      if (event.pointerType !== 'mouse') { clear(); return; }
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('input, textarea, [contenteditable="true"], select')) { clear(); return; }
      pointerPosition = { clientX: event.clientX, clientY: event.clientY };
      const dialog = document.querySelector('dialog[open]');
      // Reinsert above a newly opened modal in the browser's top layer.
      if (dialog !== currentDialog && dot.matches(':popover-open')) dot.hidePopover();
      currentDialog = dialog;
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      const control = target.closest('button, a[href], summary, [role="button"], [role="tab"], [role="checkbox"], [role="radio"], .optie');
      dot.classList.toggle('over-control', !!control && !control.matches(':disabled, [aria-disabled="true"]'));
      try {
        if (!dot.matches(':popover-open')) dot.showPopover();
        document.documentElement.classList.add('ball-cursor');
      } catch { clear(); }
    };
    const refreshPointer = () => {
      if (!pointerPosition || refreshFrame) return;
      refreshFrame = requestAnimationFrame(() => {
        refreshFrame = 0;
        if (!pointerPosition || !dot.matches(':popover-open')) return;
        const target = document.elementFromPoint(pointerPosition.clientX, pointerPosition.clientY);
        updatePointer({ ...pointerPosition, pointerType: 'mouse', target });
      });
    };
    document.addEventListener('scroll', refreshPointer, { capture: true, passive: true });
    window.addEventListener('resize', refreshPointer, { passive: true });
    new MutationObserver(refreshPointer).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    document.addEventListener('pointermove', updatePointer, { passive: true });
    document.addEventListener('pointerout', event => { if (!event.relatedTarget) clear(); });
    document.addEventListener('pointerdown', event => {
      updatePointer(event);
      if (event.pointerType !== 'mouse' || event.button !== 0 || !dot.matches(':popover-open')) return;
      clearTimeout(releaseTimer);
      dot.classList.remove('is-releasing');
      dot.classList.add('is-pressed');
    }, { passive: true });
    document.addEventListener('pointerup', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || !dot.classList.contains('is-pressed')) return;
      dot.classList.remove('is-pressed');
      dot.classList.add('is-releasing');
      releaseTimer = setTimeout(() => dot.classList.remove('is-releasing'), 300);
      refreshPointer();
    }, { passive: true });
    document.addEventListener('pointercancel', clear);
    document.addEventListener('keydown', clear);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
    window.addEventListener('blur', clear);
  };

  // Alleen na bediening: nieuwe rijen, teruggekeerde stappen en bijgewerkte meldingen openen.
  // CSS kan een tekstvervanging of een opnieuw getoonde eerste stap niet zelf herkennen.
  const setupOpeningMotion = () => {
    const main = document.querySelector('main');
    if (!main) return;
    const status = '[role="status"], [role="alert"], .kalender-daginfo';
    const opening = '#stap-1, .info-kaart, .crow';
    const running = new Map();
    const leeg = new WeakMap();
    const start = () => {
      // Onthoud welke meldingen nu leeg of verborgen zijn, zodat een melding die verschijnt ook in hoogte kan openen.
      document.querySelectorAll(status).forEach(el => leeg.set(el, el.hidden || !el.textContent.trim()));
      document.removeEventListener('click', start, true);
      document.removeEventListener('input', start, true);
      new MutationObserver(records => {
        if (motion.matches) return;
        const targets = new Set();
        const verschenen = new Set();
        records.forEach(record => {
          const element = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
          if (!element) return;
          const message = element.closest(status);
          if (message) {
            targets.add(message);
            const wasLeeg = leeg.has(message) ? leeg.get(message) : (record.type === 'attributes' && record.oldValue !== null);
            if (wasLeeg) verschenen.add(message);
          }
          if (record.type === 'attributes' && element.matches(opening)) targets.add(element);
          record.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE && node.matches('.crow')) targets.add(node); });
        });
        targets.forEach(element => {
          const zichtbaar = element.isConnected && !element.hidden && element.textContent.trim() && element.getClientRects().length;
          leeg.set(element, !zichtbaar);
          // BES.toon en BES.verberg animeren dit blok al zelf.
          if (!zichtbaar || !element.animate || lopend.has(element)) return;
          // Een melding die net verschijnt, schuift open in hoogte; een tekstwissel in een al zichtbare melding alleen fade.
          if (verschenen.has(element) && getComputedStyle(element).position !== 'absolute' && getComputedStyle(element).display !== 'inline') {
            running.get(element)?.cancel();
            const r = element.getBoundingClientRect(); const st = getComputedStyle(element);
            const animation = element.animate([
              { opacity: 0, height: '0px', marginTop: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px', overflow: 'hidden' },
              { opacity: 1, height: r.height + 'px', marginTop: st.marginTop, marginBottom: st.marginBottom, paddingTop: st.paddingTop, paddingBottom: st.paddingBottom, overflow: 'hidden' }
            ], { duration: 220, easing: st.getPropertyValue('--ease').trim() });
            running.set(element, animation);
            animation.finished.catch(() => {}).finally(() => { if (running.get(element) === animation) running.delete(element); });
            return;
          }
          running.get(element)?.cancel();
          const shift = element.matches(opening) ? 'translateY(-4px)' : 'none';
          const animation = element.animate([{ opacity: 0, transform: shift }, { opacity: 1, transform: 'none' }], {
            duration: 200, easing: getComputedStyle(element).getPropertyValue('--ease').trim()
          });
          running.set(element, animation);
          animation.finished.catch(() => {}).finally(() => { if (running.get(element) === animation) running.delete(element); });
        });
      }).observe(main, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['hidden'], attributeOldValue: true });
    };
    document.addEventListener('click', start, true);
    document.addEventListener('input', start, true);
    motion.addEventListener('change', () => { if (motion.matches) { running.forEach(animation => animation.cancel()); running.clear(); } });
  };

  const initialize = () => {
    try {
      setupTheme();
      setupNavigation();
      setupLinks();
      setupSignature();
      setupCursor();
      setupOpeningMotion();
    } finally {
      revealPage();
    }
  };

  motion.addEventListener('change', () => {
    if (motion.matches) root.classList.remove('page-fade');
  });
  window.addEventListener('pageshow', revealPage);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
