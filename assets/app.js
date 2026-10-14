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

  // Kies je plan: pop-up met de Plus-kaart, zodra iemand iets kiest dat niet in Free zit.
  // BES.kiesPlan({ reden }) opent hem; een link met data-kies-plan (en data-reden) ook, ook een oude met data-kies-plan="pro".
  // De knop gaat naar Abonnement, want daar staat het vinkje "Laat mijn plan meteen starten".
  const abonnementUrl = (() => {
    try { return new URL('../abonnement.html', document.currentScript.src).href; } catch { return 'abonnement.html'; }
  })();
  const PLANNEN = [
    { id: 'plus', naam: 'Plus', prijs: '2,99 euro per maand', punten: ['Onbeperkt simulaties', '60 vragen per dag aan Comit', 'Comit legt uit waarom jouw antwoord fout is', 'Ezelsbruggetjes voor je zwakke hoofdstukken', 'Nieuwe onderdelen een week eerder'] }
  ];
  // Rijen: onderdeel, Free, Plus (true = inbegrepen, false = niet, tekst = hoeveel). Gelijk houden met abonnement.html.
  const VERGELIJKING = [
    ['Alle vakken, training en uitleg bij elke vraag', true, true],
    ['Theorie, studie-hacks en handige tools', true, true],
    ['Simulaties per vak', '5 per dag', 'Onbeperkt'],
    ['Tijdklok bij simulaties', true, true],
    ['Hard mode', true, true],
    ['Foutenlijst en fouten opnieuw oefenen', true, true],
    ['Hack bij een fout', true, true],
    ['Je voortgang en studiekalender', true, true],
    ['Weekoverzicht', true, true],
    ['Geavanceerd overzicht per vak en hoofdstuk', true, true],
    ['Klaar-meter', true, true],
    ['Vooruitgang na een simulatie', true, true],
    ['Vragen aan Comit per dag', '10', '60'],
    ['Comit legt uit waarom jouw antwoord fout is', false, true],
    ['Ezelsbruggetjes van Comit', false, true],
    ['Examenplan in je agenda', true, true],
    ['Hacks voor je zwakste hoofdstukken', true, true],
    ['Nieuwe onderdelen een week eerder', false, true]
  ];
  let kiesPlanVenster = null;
  const maak = (tag, klasse, tekst) => {
    const el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (tekst) el.textContent = tekst;
    return el;
  };
  const bouwKiesPlan = () => {
    const venster = maak('dialog', 'kies-plan');
    venster.setAttribute('aria-labelledby', 'kies-plan-kop');
    const kop = maak('h2', '', 'Probeer Plus');
    kop.id = 'kies-plan-kop';
    const reden = maak('p', 'kies-plan-reden');
    const keuzes = maak('div', 'kies-plan-keuzes');
    PLANNEN.forEach(plan => {
      const kaart = maak('section', 'kies-plan-kaart is-' + plan.id);
      kaart.setAttribute('aria-labelledby', 'kies-plan-' + plan.id);
      const naam = maak('h3', 'kies-plan-naam', plan.naam);
      naam.id = 'kies-plan-' + plan.id;
      const lijst = maak('ul', 'kies-plan-lijst');
      plan.punten.forEach(punt => lijst.append(maak('li', '', punt)));
      const knop = maak('a', 'knop', 'Kies ' + plan.naam);
      knop.href = abonnementUrl + '#plan-' + plan.id;
      kaart.append(naam, maak('p', 'kies-plan-prijs', plan.prijs), lijst, knop);
      keuzes.append(kaart);
    });
    // Vergelijking Free en Plus onder de kaart; alleen zichtbaar bij de pop-up op de hub (vergelijking: true).
    const vergelijking = maak('div', 'kies-plan-vergelijking');
    vergelijking.hidden = true;
    const tabel = maak('table');
    const kopRij = maak('tr');
    kopRij.append(maak('th', 'kies-plan-sr', 'Onderdeel'), ...['Free', 'Plus'].map(naam => { const th = maak('th', '', naam); th.scope = 'col'; return th; }));
    const thead = maak('thead');
    thead.append(kopRij);
    const tbody = maak('tbody');
    VERGELIJKING.forEach(([onderdeel, ...waarden]) => {
      const rij = maak('tr');
      const th = maak('th', '', onderdeel);
      th.scope = 'row';
      rij.append(th, ...waarden.map(waarde => {
        const td = maak('td', waarde === true ? 'is-ja' : waarde === false ? 'is-nee' : '', typeof waarde === 'string' ? waarde : '');
        if (typeof waarde === 'boolean') td.setAttribute('aria-label', waarde ? 'Inbegrepen' : 'Niet inbegrepen');
        return td;
      }));
      tbody.append(rij);
    });
    tabel.append(thead, tbody);
    vergelijking.append(maak('h3', 'kies-plan-vergelijking-kop', 'Vergelijk de plannen'), tabel);
    const voet = maak('div', 'kies-plan-voet');
    const later = maak('button', 'kies-plan-later', 'Misschien later');
    later.type = 'button';
    later.addEventListener('click', () => venster.close());
    voet.append(maak('p', 'kies-plan-proef', 'Plus probeer je eerst een maand.'), later);
    venster.append(kop, reden, keuzes, vergelijking, voet);
    // Klik naast het venster sluit het.
    venster.addEventListener('click', event => { if (event.target === venster) venster.close(); });
    document.body.append(venster);
    return venster;
  };
  // Er is alleen nog Plus, dus wat er nodig is ('plus' of een oude 'pro') verandert niets aan de pop-up.
  window.BES.kiesPlan = ({ reden = '', titel = '', vergelijking = false } = {}) => {
    if (typeof HTMLDialogElement !== 'function') { window.location.href = abonnementUrl; return; }
    if (!kiesPlanVenster) kiesPlanVenster = bouwKiesPlan();
    if (kiesPlanVenster.open) return;
    kiesPlanVenster.querySelector('#kies-plan-kop').textContent = titel || 'Probeer Plus';
    kiesPlanVenster.querySelector('.kies-plan-vergelijking').hidden = !vergelijking;
    kiesPlanVenster.querySelector('.kies-plan-reden').textContent = reden || 'Dit zit niet in Free, wel in Plus.';
    // Eén proefmaand per account: wie die al gebruikte (ook een oude van Pro), krijgt geen proefmaand meer beloofd.
    const proef = kiesPlanVenster.querySelector('.kies-plan-proef');
    proef.textContent = 'Plus probeer je eerst een maand.';
    if (typeof window.BES.plan === 'function') window.BES.plan().then(plan => { if (plan && plan.proef_plus) proef.textContent = 'Je proefmaand heb je al gebruikt.'; }, () => {});
    kiesPlanVenster.showModal();
    kiesPlanVenster.querySelector('.kies-plan-kaart a').focus({ preventScroll: true });
  };
  // Op de hub: Free-accounts krijgen de pop-up met vergelijking vanzelf, hoogstens eens per drie dagen per toestel,
  // en alleen als betalen aanstaat. hub.html roept dit aan.
  window.BES.planReclame = async () => {
    const sleutel = 'bes_plan_reclame';
    let laatst = 0;
    try { laatst = Number(window.localStorage.getItem(sleutel)) || 0; } catch {}
    if (Date.now() - laatst < 3 * 864e5) return;
    let proefGebruikt = false;
    try {
      if (!window.BES.plan || (window.BES.betalen && !(await window.BES.betalen()))) return;
      const plan = await window.BES.plan();
      if (!plan || !plan.ingelogd || plan.plan !== 'free' || document.querySelector('dialog[open]')) return;
      proefGebruikt = Boolean(plan.proef_plus);
    } catch { return; }
    try { window.localStorage.setItem(sleutel, String(Date.now())); } catch {}
    const reden = proefGebruikt
      ? 'Haal meer uit je studietijd met onbeperkt simulaties en extra hulp van Comit.'
      : 'Haal meer uit je studietijd. Probeer Plus een maand en kijk wat het je oplevert.';
    window.BES.kiesPlan({ titel: 'Probeer Plus', reden, vergelijking: true });
  };
  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('a[data-kies-plan]');
    if (!link || typeof HTMLDialogElement !== 'function') return;
    event.preventDefault();
    window.BES.kiesPlan({ reden: link.dataset.reden });
  });

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
      button.setAttribute('aria-label', dark ? 'Lichte modus aan' : 'Donkere modus aan');
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

    const closeMenu = (restoreFocus = false) => {
      const wasOpen = navigation.classList.contains('menu-open');
      navigation.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      if (wasOpen && restoreFocus && mobile.matches) menuButton.focus();
    };

    menuButton.addEventListener('click', () => {
      if (!mobile.matches) return;
      const open = !navigation.classList.contains('menu-open');
      navigation.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
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

    document.querySelectorAll('[data-terug]').forEach(element => {
      const link = element.tagName === 'A' ? element : document.createElement('a');
      if (link !== element) {
        Array.from(element.attributes).forEach(attribute => {
          if (!['type', 'role', 'disabled'].includes(attribute.name)) {
            link.setAttribute(attribute.name, attribute.value);
          }
        });
      }
      link.href = element.dataset.terug;
      link.classList.add('terug');
      link.textContent = `\u2190 ${element.dataset.terugTekst || 'Terug'}`;
      wrapBackArrow(link);
      if (link !== element) element.replaceWith(link);
    });

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
    const start = () => {
      document.removeEventListener('click', start, true);
      document.removeEventListener('input', start, true);
      new MutationObserver(records => {
        if (motion.matches) return;
        const targets = new Set();
        records.forEach(record => {
          const element = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
          if (!element) return;
          const message = element.closest(status);
          if (message) targets.add(message);
          if (record.type === 'attributes' && element.matches(opening)) targets.add(element);
          record.addedNodes.forEach(node => { if (node.nodeType === Node.ELEMENT_NODE && node.matches('.crow')) targets.add(node); });
        });
        targets.forEach(element => {
          if (!element.isConnected || !element.textContent.trim() || !element.getClientRects().length || !element.animate) return;
          running.get(element)?.cancel();
          const shift = element.matches(opening) ? 'translateY(-4px)' : 'none';
          const animation = element.animate([{ opacity: 0, transform: shift }, { opacity: 1, transform: 'none' }], {
            duration: 200, easing: getComputedStyle(element).getPropertyValue('--ease').trim()
          });
          running.set(element, animation);
          animation.finished.catch(() => {}).finally(() => { if (running.get(element) === animation) running.delete(element); });
        });
      }).observe(main, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
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
