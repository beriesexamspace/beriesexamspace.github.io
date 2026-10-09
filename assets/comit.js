(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  const ns = 'http://www.w3.org/2000/svg';
  let logoNummer = 0;

  BES.comitLogo = (grootte = 24) => {
    const maat = Number.isFinite(Number(grootte)) && Number(grootte) > 0 ? Number(grootte) : 24;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 96 96');
    svg.setAttribute('width', maat);
    svg.setAttribute('height', maat);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.display = 'block';
    const defs = document.createElementNS(ns, 'defs');
    const verloop = document.createElementNS(ns, 'linearGradient');
    const id = `comit-verloop-${++logoNummer}`;
    verloop.id = id;
    verloop.setAttribute('x1', '0%');
    verloop.setAttribute('y1', '0%');
    verloop.setAttribute('x2', '100%');
    verloop.setAttribute('y2', '100%');
    ['--teal', '--accent'].forEach((kleur, index) => {
      const stop = document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', `${index * 100}%`);
      stop.style.stopColor = `var(${kleur})`;
      verloop.append(stop);
    });
    defs.append(verloop);
    svg.append(defs);
    const pad = document.createElementNS(ns, 'path');
    pad.setAttribute('d', 'M48 6C51 31 65 45 90 48C65 51 51 65 48 90C45 65 31 51 6 48C31 45 45 31 48 6Z');
    pad.setAttribute('fill', `url(#${id})`);
    svg.append(pad);
    return svg;
  };

  async function initialize() {
    document.querySelectorAll('.comit-gezicht').forEach(plek => plek.replaceChildren(BES.comitLogo(24)));
    const pagina = document.querySelector('.comit-pagina');
    if (!pagina) return;
    let user;
    try {
      await BES.auth.gereed;
      user = await BES.auth.gebruiker();
    } catch {
      window.BES_DEUR?.naarInloggen();
      return;
    }
    if (!user) {
      window.BES_DEUR?.naarInloggen();
      return;
    }

    const byId = id => document.getElementById(id);
    const minderBeweging = window.matchMedia('(prefers-reduced-motion: reduce)');
    const welkom = byId('comit-welkom');
    const gesprek = byId('comit-gesprek');
    const scroller = byId('comit-scroll');
    const formulier = byId('comit-form');
    const invoer = byId('comit-tekst');
    const verstuur = byId('comit-verstuur');
    const begroeting = byId('comit-begroeting');
    const geschiedenisKnop = byId('comit-geschiedenis-knop');
    const geschiedenis = byId('comit-geschiedenis');
    const client = BES.auth.client;
    // Elk bezoek is één gesprek; zo haalt Geschiedenis het lopende gesprek niet dubbel op.
    const gesprekId = window.crypto?.randomUUID ? window.crypto.randomUUID() : (() => {
      const b = window.crypto.getRandomValues(new Uint8Array(16));
      b[6] = (b[6] & 15) | 64;
      b[8] = (b[8] & 63) | 128;
      const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    })();
    const naam =BES.auth.naamGegevens(user).aanspreeknaam.trim();
    const tekst = naam ? `Hallo, ${naam}.` : 'Hallo.';
    begroeting.setAttribute('aria-label', tekst);
    const begroetingsWoorden = tekst.split(/\s+/);
    const begroetingEinde = 950 + Math.min(200, (begroetingsWoorden.length - 1) * 100);
    pagina.style.setProperty('--comit-intro-vervolg', `${begroetingEinde}ms`);
    begroeting.style.setProperty('--comit-woord-interval', `${Math.min(100, 200 / Math.max(1, begroetingsWoorden.length - 1))}ms`);
    begroetingsWoorden.forEach((woord, index) => {
      const span = document.createElement('span');
      span.className = 'comit-woord';
      span.textContent = woord;
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--woord-index', index);
      if (index) begroeting.append(' ');
      begroeting.append(span);
    });
    pagina.querySelectorAll('[data-comit-logo]').forEach(plek => plek.append(BES.comitLogo(plek.dataset.comitLogo)));

    let openingTimer;
    const openingKlaar = () => {
      window.clearTimeout(openingTimer);
      pagina.dataset.opening = 'klaar';
    };
    minderBeweging.addEventListener('change', event => { if (event.matches) openingKlaar(); });

    const pasHoogteAan = () => {
      const viewport = window.visualViewport;
      if (viewport && viewport.scale !== 1) return;
      pagina.style.setProperty('--comit-viewport-hoogte', `${viewport?.height || window.innerHeight}px`);
      pagina.style.setProperty('--comit-viewport-top', `${viewport?.offsetTop || 0}px`);
      document.body.style.setProperty('--comit-viewport-bodem', `${Math.max(0, window.innerHeight - (viewport?.height || window.innerHeight) - (viewport?.offsetTop || 0))}px`);
    };
    pasHoogteAan();
    window.addEventListener('resize', pasHoogteAan);
    window.visualViewport?.addEventListener('resize', pasHoogteAan);
    window.visualViewport?.addEventListener('scroll', pasHoogteAan);

    const pasInvoerAan = () => {
      const stijl = window.getComputedStyle(invoer);
      const rand = parseFloat(stijl.borderTopWidth) + parseFloat(stijl.borderBottomWidth);
      const ruimte = parseFloat(stijl.paddingTop) + parseFloat(stijl.paddingBottom) + rand;
      const maximum = parseFloat(stijl.lineHeight) * 4 + ruimte;
      invoer.style.height = 'auto';
      invoer.style.height = `${Math.min(invoer.scrollHeight + rand, maximum)}px`;
      invoer.style.overflowY = invoer.scrollHeight + rand > maximum ? 'auto' : 'hidden';
    };
    let bezig = false;
    const werkKnopBij = () => { verstuur.disabled = bezig || !invoer.value.trim(); };
    const onderaan = () => scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop <= 32;
    let volgGesprek = onderaan();
    let laatsteScrollTop = scroller.scrollTop;
    let scrollFrame;
    const stopMeescrollen = () => {
      volgGesprek = false;
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = null;
    };
    scroller.addEventListener('scroll', () => {
      if (scroller.scrollTop < laatsteScrollTop - 1) stopMeescrollen();
      else if (scroller.scrollTop > laatsteScrollTop && scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop <= 1) volgGesprek = true;
      laatsteScrollTop = scroller.scrollTop;
    }, { passive: true });
    scroller.addEventListener('wheel', event => { if (event.deltaY < 0) stopMeescrollen(); }, { passive: true });
    scroller.addEventListener('keydown', event => {
      if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) stopMeescrollen();
    });
    let touchY;
    scroller.addEventListener('touchstart', event => { touchY = event.touches[0]?.clientY; }, { passive: true });
    scroller.addEventListener('touchmove', event => {
      const y = event.touches[0]?.clientY;
      if (y > touchY) stopMeescrollen();
      touchY = y;
    }, { passive: true });
    const naarLaatsteBericht = () => {
      if (!volgGesprek) return;
      if (minderBeweging.matches) {
        scroller.scrollTop = scroller.scrollHeight;
        return;
      }
      if (scrollFrame != null) return;
      const begin = performance.now();
      const stap = nu => {
        const doel = scroller.scrollHeight - scroller.clientHeight;
        const deel = Math.min(1, (nu - begin) / 220);
        scroller.scrollTop += (doel - scroller.scrollTop) * (1 - (1 - deel) ** 3);
        laatsteScrollTop = scroller.scrollTop;
        scrollFrame = deel < 1 ? window.requestAnimationFrame(stap) : null;
      };
      scrollFrame = window.requestAnimationFrame(stap);
    };
    minderBeweging.addEventListener('change', event => {
      if (!event.matches) return;
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = null;
      naarLaatsteBericht();
    });

    const verbergWelkom = () => new Promise(resolve => {
      if (welkom.hidden) { resolve(); return; }
      let timer;
      const klaar = () => {
        window.clearTimeout(timer);
        minderBeweging.removeEventListener('change', minder);
        welkom.hidden = true;
        laatsteScrollTop = scroller.scrollTop;
        resolve();
      };
      const minder = event => { if (event.matches) klaar(); };
      welkom.inert = true;
      if (minderBeweging.matches) { klaar(); return; }
      welkom.classList.add('is-vertrekkend');
      minderBeweging.addEventListener('change', minder);
      timer = window.setTimeout(klaar, 220);
    });

    const toonAntwoord = (plek, tekst) => new Promise(resolve => {
      const delen = tekst.match(/\s+|\S+/gu) || [];
      const aantal = delen.filter(deel => /\S/u.test(deel)).length;
      if (minderBeweging.matches || document.hidden || !aantal) {
        plek.textContent = tekst;
        resolve();
        return;
      }
      // Reserveer ook de laatste fade en een frame binnen de limiet van 1,5 s.
      const interval = aantal > 1 ? Math.min(25, 1320 / (aantal - 1)) : 0;
      const begin = performance.now();
      let index = 0;
      let woorden = 0;
      let frame;
      let timer;
      let laatsteWoordOp = begin;
      const klaar = () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(timer);
        minderBeweging.removeEventListener('change', minder);
        document.removeEventListener('visibilitychange', zichtbaarheid);
        plek.textContent = tekst;
        naarLaatsteBericht();
        resolve();
      };
      const minder = event => { if (event.matches) klaar(); };
      const zichtbaarheid = () => { if (document.hidden) klaar(); };
      const stap = nu => {
        const fragment = document.createDocumentFragment();
        while (index < delen.length) {
          const deel = delen[index];
          if (/\S/u.test(deel)) {
            if (nu - begin < woorden * interval) break;
            const woord = document.createElement('span');
            woord.className = 'comit-antwoord-woord';
            woord.textContent = deel;
            fragment.append(woord);
            woorden += 1;
            laatsteWoordOp = nu;
          } else fragment.append(document.createTextNode(deel));
          index += 1;
        }
        if (fragment.childNodes.length) {
          plek.append(fragment);
          naarLaatsteBericht();
        }
        if (index === delen.length && nu - laatsteWoordOp >= 150) klaar();
        else frame = window.requestAnimationFrame(stap);
      };
      minderBeweging.addEventListener('change', minder);
      document.addEventListener('visibilitychange', zichtbaarheid);
      timer = window.setTimeout(klaar, 1500);
      frame = window.requestAnimationFrame(stap);
    });

    // Alleen knoppen naar een pagina van deze site, ook als ze uit de geschiedenis komen.
    const veiligeKnoppen = lijst => (Array.isArray(lijst) ? lijst : []).filter(knop => {
      if (!knop || typeof knop.label !== 'string' || typeof knop.href !== 'string' || !knop.href.trim()) return false;
      try {
        const url = new URL(knop.href, window.location.href);
        return ['http:', 'https:'].includes(url.protocol) && url.origin === window.location.origin;
      } catch { return false; }
    }).map(knop => ({ label: knop.label, href: knop.href }));

    const knoppenBlok = lijst => {
      const knoppen = document.createElement('span');
      knoppen.className = 'comit-antwoord-knoppen';
      lijst.forEach(knop => {
        const link = document.createElement('a');
        link.className = 'knop-secundair comit-antwoord-knop';
        link.href = knop.href;
        link.textContent = knop.label;
        knoppen.append(link);
      });
      return knoppen;
    };

    // Geschiedenis: elk bericht gaat naar comit_berichten; alleen de student zelf kan het lezen of wissen.
    const bewaar = (rol, inhoud, knoppen = []) => {
      const tekst = String(inhoud || '').trim().slice(0, 4000);
      if (!client || !tekst) return;
      client.from('comit_berichten')
        .insert({ gesprek: gesprekId, rol, tekst, knoppen: knoppen.length ? knoppen.slice(0, 8) : null })
        .then(() => {}, () => {});
    };

    const bericht = (inhoud, assistent = false) => {
      const rij = document.createElement('div');
      rij.className = `comit-bericht comit-bericht-${assistent ? 'assistent' : 'gebruiker'}`;
      if (assistent) {
        rij.classList.add('is-denkend');
        const logo = document.createElement('span');
        logo.className = 'comit-bericht-logo';
        logo.append(BES.comitLogo(24));
        rij.append(logo);
      }
      const wolk = document.createElement('p');
      wolk.className = 'comit-wolk';
      if (assistent) wolk.setAttribute('aria-busy', 'true');
      const label = document.createElement('span');
      label.className = 'comit-sr-only';
      label.textContent = assistent ? 'Comit denkt na.' : 'Jij: ';
      if (assistent) label.setAttribute('aria-atomic', 'true');
      wolk.append(label, document.createTextNode(inhoud));
      rij.append(wolk);
      gesprek.append(rij);
      return wolk;
    };

    const verstuurVraag = async vraag => {
      const inhoud = vraag.trim();
      if (!inhoud || bezig) return;
      bezig = true;
      openingKlaar();
      volgGesprek = true;
      invoer.value = '';
      pasInvoerAan();
      werkKnopBij();
      invoer.focus({ preventScroll: true });
      await verbergWelkom();
      gesprek.tabIndex = 0;
      bericht(inhoud);
      bewaar('student', inhoud);
      const wolk = bericht('', true);
      wolk.classList.add('comit-denkt');
      const denkTekst = document.createElement('span');
      denkTekst.className = 'comit-denk-tekst';
      denkTekst.setAttribute('aria-hidden', 'true');
      const denkBegin = performance.now();
      const werkDenkTekstBij = () => {
        denkTekst.textContent = minderBeweging.matches ? 'Comit denkt na.' :
          performance.now() - denkBegin >= 3000 ? 'Nog even denken' : 'Comit denkt na';
      };
      werkDenkTekstBij();
      const denkTimer = window.setTimeout(werkDenkTekstBij, 3000);
      minderBeweging.addEventListener('change', werkDenkTekstBij);
      wolk.append(denkTekst);
      naarLaatsteBericht();
      const minimumDenktijd = new Promise(resolve => window.setTimeout(resolve, 600));
      let antwoord = null;
      try {
        antwoord = await BES.comitAntwoord(inhoud, { client: BES.auth.client, user });
      } catch {}
      if (antwoord == null && typeof BES.comitVrij === 'function') {
        try {
          antwoord = await BES.comitVrij(inhoud, { client: BES.auth.client, user });
        } catch { antwoord = null; }
      }
      if (!antwoord || typeof antwoord.tekst !== 'string') {
        antwoord = {
          tekst: 'Dat kan ik nog niet. Wil je het als feedback sturen?',
          knoppen: [{ label: 'Stuur als feedback →', href: 'feedback.html' }]
        };
      }
      await minimumDenktijd;
      window.clearTimeout(denkTimer);
      minderBeweging.removeEventListener('change', werkDenkTekstBij);
      wolk.classList.remove('comit-denkt');
      wolk.parentElement.classList.remove('is-denkend');
      denkTekst.remove();
      // Het bestaande aria-live-gesprek krijgt één volledige tekst, geen losse woorden.
      wolk.firstChild.textContent = `Comit: ${antwoord.tekst}`;
      const antwoordTekst = document.createElement('span');
      antwoordTekst.className = 'comit-antwoord-tekst';
      antwoordTekst.setAttribute('aria-hidden', 'true');
      wolk.append(antwoordTekst);
      wolk.setAttribute('aria-busy', 'false');
      const geldig = veiligeKnoppen(antwoord.knoppen);
      const knoppen = knoppenBlok(geldig);
      knoppen.hidden = true;
      if (geldig.length) wolk.append(knoppen);
      bewaar('comit', antwoord.tekst, geldig);
      await toonAntwoord(antwoordTekst, antwoord.tekst);
      knoppen.hidden = false;
      knoppen.classList.add('is-zichtbaar');
      bezig = false;
      werkKnopBij();
      naarLaatsteBericht();
    };

    // Geschiedenis: eerdere gesprekken (de laatste 200 berichten), per gesprek met datum, en alles wissen.
    const datumTekst = moment => {
      const dag = new Date(moment);
      const vandaag = new Date();
      const gisteren = new Date();
      gisteren.setDate(vandaag.getDate() - 1);
      const tijd = dag.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
      if (dag.toDateString() === vandaag.toDateString()) return `Vandaag, ${tijd}`;
      if (dag.toDateString() === gisteren.toDateString()) return `Gisteren, ${tijd}`;
      const datum = dag.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', ...(dag.getFullYear() !== vandaag.getFullYear() ? { year: 'numeric' } : {}) });
      return `${datum.charAt(0).toUpperCase()}${datum.slice(1)}, ${tijd}`;
    };

    const maak = (tag, klasse, tekst) => {
      const el = document.createElement(tag);
      if (klasse) el.className = klasse;
      if (tekst) el.textContent = tekst;
      if (tag === 'button') el.type = 'button';
      return el;
    };

    const vastBericht = (plek, rij) => {
      const assistent = rij.rol === 'comit';
      const regel = maak('div', `comit-bericht comit-bericht-${assistent ? 'assistent' : 'gebruiker'}`);
      if (assistent) {
        const logo = maak('span', 'comit-bericht-logo');
        logo.append(BES.comitLogo(24));
        regel.append(logo);
      }
      const wolk = maak('p', 'comit-wolk');
      wolk.append(maak('span', 'comit-sr-only', assistent ? 'Comit: ' : 'Jij: '), document.createTextNode(rij.tekst));
      const knoppen = assistent ? veiligeKnoppen(rij.knoppen) : [];
      if (knoppen.length) wolk.append(knoppenBlok(knoppen));
      regel.append(wolk);
      plek.append(regel);
    };

    const zetKnop = open => {
      geschiedenisKnop.setAttribute('aria-expanded', String(open));
      geschiedenisKnop.querySelector('span').textContent = open ? 'Verberg geschiedenis' : 'Geschiedenis';
    };

    const wisBlok = kop => {
      const wis = maak('button', 'comit-wis-knop', 'Wis alle gesprekken');
      const zeker = maak('div', 'comit-wis-zeker');
      zeker.hidden = true;
      const vraag = maak('p', '', 'Alles wat je tot nu toe met Comit besprak, wordt gewist. Dit kan niet ongedaan gemaakt worden.');
      const ja = maak('button', 'knop-secundair', 'Ja, wis alles');
      const nee = maak('button', 'tekstlink', 'Nee, toch niet');
      zeker.append(vraag, ja, nee);
      wis.addEventListener('click', () => { zeker.hidden = false; wis.hidden = true; ja.focus(); });
      nee.addEventListener('click', () => { zeker.hidden = true; wis.hidden = false; wis.focus(); });
      ja.addEventListener('click', async () => {
        ja.disabled = true;
        let gelukt = false;
        try {
          const { error } = await client.from('comit_berichten').delete().eq('user_id', user.id);
          gelukt = !error;
        } catch {}
        if (!gelukt) {
          vraag.textContent = 'Wissen lukt nu niet. Probeer het zo opnieuw.';
          ja.disabled = false;
          return;
        }
        geschiedenis.querySelectorAll('.comit-geschiedenis-gesprek, .comit-geschiedenis-melding').forEach(el => el.remove());
        zeker.remove();
        wis.remove();
        const klaar = maak('p', 'comit-geschiedenis-melding', 'Al je gesprekken met Comit zijn gewist.');
        klaar.setAttribute('role', 'status');
        geschiedenis.append(klaar);
        geschiedenisKnop.focus();
      });
      kop.append(wis);
      return zeker;
    };

    const toonGeschiedenis = async () => {
      geschiedenisKnop.disabled = true;
      openingKlaar();
      await verbergWelkom();
      let rijen = null;
      try {
        const { data, error } = await client.from('comit_berichten')
          .select('gesprek,rol,tekst,knoppen,gemaakt')
          .neq('gesprek', gesprekId)
          .order('gemaakt', { ascending: false })
          .limit(200);
        if (!error) rijen = (data || []).reverse();
      } catch {}
      geschiedenisKnop.disabled = false;
      const kop = maak('div', 'comit-geschiedenis-kop');
      kop.append(maak('h2', '', 'Eerdere gesprekken'));
      geschiedenis.replaceChildren(kop);
      if (!rijen) {
        geschiedenis.append(maak('p', 'comit-geschiedenis-melding', 'Je eerdere gesprekken laden lukt nu niet. Probeer het zo opnieuw.'));
      } else if (!rijen.length) {
        geschiedenis.append(maak('p', 'comit-geschiedenis-melding', 'Nog geen eerdere gesprekken. Wat je vanaf nu met Comit bespreekt, vind je hier terug.'));
      } else {
        geschiedenis.append(wisBlok(kop));
        if (rijen.length === 200) geschiedenis.append(maak('p', 'comit-geschiedenis-melding', 'Je ziet de laatste 200 berichten.'));
        let groep = null;
        let huidig = null;
        rijen.forEach(rij => {
          if (rij.gesprek !== huidig) {
            huidig = rij.gesprek;
            groep = maak('section', 'comit-geschiedenis-gesprek');
            groep.append(maak('h3', 'comit-geschiedenis-datum', datumTekst(rij.gemaakt)));
            geschiedenis.append(groep);
          }
          vastBericht(groep, rij);
        });
      }
      geschiedenis.hidden = false;
      zetKnop(true);
      const laatste = geschiedenis.querySelector('.comit-geschiedenis-gesprek:last-of-type') || geschiedenis;
      scroller.scrollTop += laatste.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12;
      laatsteScrollTop = scroller.scrollTop;
      volgGesprek = onderaan();
    };

    if (client) {
      geschiedenisKnop.hidden = false;
      geschiedenisKnop.addEventListener('click', () => {
        if (geschiedenisKnop.disabled) return;
        if (geschiedenis.hidden) { toonGeschiedenis(); return; }
        geschiedenis.hidden = true;
        geschiedenis.replaceChildren();
        zetKnop(false);
        if (!gesprek.childElementCount) {
          welkom.classList.remove('is-vertrekkend');
          welkom.inert = false;
          welkom.hidden = false;
        }
        laatsteScrollTop = scroller.scrollTop;
        volgGesprek = onderaan();
      });
    }

    formulier.addEventListener('submit', event => {
      event.preventDefault();
      verstuurVraag(invoer.value);
    });
    invoer.addEventListener('input', () => { pasInvoerAan(); werkKnopBij(); });
    invoer.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        formulier.requestSubmit();
      }
    });
    pagina.querySelectorAll('.comit-voorstel').forEach(knop => knop.addEventListener('click', () => verstuurVraag(knop.textContent)));
    await document.fonts?.ready;
    pagina.hidden = false;
    pasInvoerAan();
    document.body.style.setProperty('--comit-invoer-hoogte', `${formulier.getBoundingClientRect().height}px`);
    const logo = pagina.querySelector('.comit-hero-logo').getBoundingClientRect();
    const midden = (window.visualViewport?.offsetTop || 0) + (window.visualViewport?.height || window.innerHeight) / 2;
    pagina.style.setProperty('--comit-logo-start-y', `${midden - logo.top - logo.height / 2}px`);
    // De volledige opening speelt elke keer dat je Comit opent (op verzoek van Berat, 27-09-2026).
    pagina.dataset.opening = minderBeweging.matches ? 'klaar' : 'eerste';
    new ResizeObserver(() => {
      document.body.style.setProperty('--comit-invoer-hoogte', `${formulier.getBoundingClientRect().height}px`);
    }).observe(formulier);
    werkKnopBij();
    if (!minderBeweging.matches) openingTimer = window.setTimeout(openingKlaar, begroetingEinde + 900);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
