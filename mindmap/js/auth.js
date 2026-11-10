(function () {
  'use strict';
  var BM = window.BM = window.BM || {};

  // Tegen inbedden in een iframe op een andere site (clickjacking).
  // frame-ancestors kan niet in een meta-tag, dus dit is een frame-buster.
  if (window.top !== window.self) {
    try {
      window.top.location = window.self.location;
    } catch (e) {
      // De browser weigert het: verberg de pagina in plaats van hem te tonen.
      document.documentElement.style.display = 'none';
    }
  }

  // Inloggen voor Berie's mindmap: e-mail + wachtwoord, daarna altijd een 6-cijferige code uit de mail.
  // Het overlay #bm-auth wordt met createElement en textContent gebouwd (nooit innerHTML met variabelen).
  // Zonder ingevulde config (js/config.js) doet dit bestand niets: de app werkt dan lokaal zonder login.
  // Afhankelijk van: BM.config, BM.store (getKey), BM.cloud (begin, stop), BM.app (start, als terugval).

  var LAAD_MAX = 10000;     // ms: supabase-js moet binnen deze tijd geladen zijn
  var WACHT_MAX = 15000;    // ms: langer wachten dan dit geeft een melding
  var CODE_WACHT = 30;      // seconden tussen twee codes
  var MIN_WW = 10;          // minimale lengte van een wachtwoord
  var LIMIET = {};          // unieke waarde: de wachttijd is om
  var MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var TE_LANG = 'Dit duurt te lang. Controleer je internet en probeer het opnieuw.';
  var GEEN_VERBINDING = 'Kan geen verbinding maken. Controleer je internet.';
  var VERBINDING_OP = 'Kan geen verbinding maken. Herlaad de pagina.';

  var client = null;        // supabase-client
  var overlay = null;       // het overlay #bm-auth
  var schermen = {};        // naam -> scherm-object
  var huidig = '';          // naam van het zichtbare scherm
  var gebruiker = null;     // {id, email} na een geslaagde code
  var wachtend = null;      // {id, email} tussen wachtwoord en code in
  var laatsteMail = '';     // e-mail die bij het wisselen van scherm meegaat
  // Gewisseld vanuit het accountmenu: dat mailadres staat al klaar in het inlogscherm.
  try {
    var wisselMail = sessionStorage.getItem('bm-wissel-mail');
    if (wisselMail !== null) {
      sessionStorage.removeItem('bm-wissel-mail');
      if (/^[^\s@]+@[^\s@]+$/.test(wisselMail)) laatsteMail = wisselMail;
    }
  } catch (e) { /* opslag kan geblokkeerd zijn */ }
  var herstel = false;      // bezoek via de herstel-link uit de mail
  var initKlaar = false;
  var aangemeld = false;
  var codeTimer = 0;
  var codeAftel = 0;
  var verifieerBezig = false;
  var veldTeller = 0;

  // ---------- hulpjes ----------

  function el(tag, cls, tekst) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (tekst !== undefined && tekst !== null) e.textContent = tekst;
    return e;
  }

  function normMail(v) { return String(v || '').trim().toLowerCase(); }

  function geldigMail(v) { return v.length > 0 && v.length <= 254 && MAIL_RE.test(v); }

  function configCompleet() {
    var c = BM.config || {};
    return !!(c.supabaseUrl && c.supabaseAnonKey);
  }

  // Cloud is verplicht zodra de config is ingevuld. Alleen de config telt hier: ontbreekt
  // supabase-js (CDN geblokkeerd), dan geeft wachtOpSupabase na 10 s een melding en start de app niet.
  function vereist() { return configCompleet(); }

  if (BM.config) BM.config.cloud = configCompleet();

  function knop(tekst, soort, type) {
    var b = el('button', soort, tekst);
    b.type = type || 'button';
    return b;
  }

  function linkKnop(tekst, fn) {
    var b = knop(tekst, 'bm-knop bm-knop--tekst', 'button');
    b.addEventListener('click', fn);
    return b;
  }

  // Zet een knop op "wachten" (disabled, "Even geduld...") of herstelt hem.
  function zetBezig(e, aan) {
    if (!e) return;
    e.classList.toggle('is-bezig', !!aan);
    if (e.tagName !== 'BUTTON') return;
    if (aan) {
      if (!e._tekst) e._tekst = e.textContent;
      e.textContent = 'Even geduld...';
      e.disabled = true;
    } else {
      if (e._tekst) e.textContent = e._tekst;
      e._tekst = '';
      e.disabled = false;
    }
  }

  function meldFout(s, tekst) {
    if (!s) return;
    s.fout.textContent = tekst || '';
    if (tekst) s.melding.textContent = '';
  }

  function meldOk(s, tekst) {
    if (!s) return;
    s.melding.textContent = tekst || '';
    s.fout.textContent = '';
  }

  function bezigAl(s) { return !!(s.knop && s.knop.disabled); }

  // Voert een aanroep uit met de wachttijd van 15 s. Geeft het resultaat, of null bij de wachttijd
  // (de melding staat dan al in het scherm). Een onverwachte fout komt terug als {error: fout}.
  async function aanroep(s, knopEl, werk) {
    var res;
    try {
      res = await metLimiet(knopEl, werk, s);
    } catch (err) {
      return { error: err };
    }
    return res === LIMIET ? null : res;
  }

  function metLimiet(knopEl, werk, s) {
    var timer = 0;
    zetBezig(knopEl, true);
    var limiet = new Promise(function (resolve) {
      timer = setTimeout(function () { resolve(LIMIET); }, WACHT_MAX);
    });
    return Promise.race([Promise.resolve().then(werk), limiet]).then(function (res) {
      clearTimeout(timer);
      zetBezig(knopEl, false);
      if (res === LIMIET) {
        meldFout(s, TE_LANG);
        return LIMIET;
      }
      return res;
    }, function (err) {
      clearTimeout(timer);
      zetBezig(knopEl, false);
      throw err;
    });
  }

  // Leest de foutcode uit een edge function (HTTP-fout: JSON-body met fout, wacht, over).
  async function leesFout(err) {
    var uit = { fout: 'onbekend', wacht: 0, over: -1, status: 0 };  // over -1 = onbekend
    try {
      if (err && err.name === 'FunctionsFetchError') uit.fout = 'geen_verbinding';
      var ctx = err && err.context;
      if (ctx) {
        uit.status = ctx.status || 0;
        if (typeof ctx.json === 'function') {
          var body = await ctx.json();
          if (body && typeof body.fout === 'string') uit.fout = body.fout;
          if (body && typeof body.wacht === 'number') uit.wacht = body.wacht;
          if (body && typeof body.over === 'number') uit.over = body.over;
        }
      }
    } catch (e) {
      // Geen JSON-body: de standaardwaarden blijven staan.
    }
    // Een verlopen sessie wordt door de gateway met 401 afgewezen, zonder fout-veld in de body.
    if (uit.status === 401 && uit.fout === 'onbekend') uit.fout = 'niet_ingelogd';
    return uit;
  }

  var CODE_TEKST = {
    verlopen: 'Deze code is verlopen. Vraag een nieuwe aan.',
    geblokkeerd: 'Te veel pogingen. Vraag een nieuwe code aan.',
    te_veel: 'Te veel codes aangevraagd. Probeer het over 15 minuten opnieuw.',
    mail_mislukt: 'De mail kon niet worden verstuurd. Probeer het zo opnieuw.',
    geen_code: 'Vraag eerst een nieuwe code aan.',
    ongeldig: 'Vul alle 6 cijfers in.',
    geen_verbinding: GEEN_VERBINDING
  };

  function codeTekst(u) {
    if (u.fout === 'fout') {
      if (u.over === 0) return 'Verkeerde code. Dit was je laatste poging.';
      if (u.over === 1) return 'Verkeerde code. Nog 1 poging.';
      if (u.over > 1) return 'Verkeerde code. Nog ' + u.over + ' pogingen.';
      // Geen pogingen meer: de code is geblokkeerd, dus de gebruiker moet een nieuwe aanvragen
      return 'Verkeerde code. Vraag een nieuwe code aan.';
    }
    if (u.fout === 'even_wachten') return 'Wacht nog ' + (u.wacht || CODE_WACHT) + ' seconden.';
    // Alleen eigen sleutels: 'constructor' of 'toString' mogen geen functie als tekst geven.
    if (Object.prototype.hasOwnProperty.call(CODE_TEKST, u.fout)) return CODE_TEKST[u.fout];
    return u.status ? 'Er ging iets mis. Probeer het opnieuw.' : GEEN_VERBINDING;
  }

  // Foutmelding van de accountfuncties van Supabase (inloggen, aanmaken, wachtwoord).
  function authTekst(err) {
    var msg = String((err && err.message) || '').toLowerCase();
    if (err && err.name === 'AuthRetryableFetchError') return GEEN_VERBINDING;
    if (err && err.status === 429) return 'Te veel pogingen. Probeer het later opnieuw.';
    if (msg.indexOf('invalid login') !== -1) return 'E-mail of wachtwoord klopt niet.';
    if (msg.indexOf('already') !== -1 || msg.indexOf('registered') !== -1) {
      return 'Er bestaat al een account met dit mailadres. Log in.';
    }
    if (msg.indexOf('password') !== -1) return 'Kies een ander wachtwoord, van minstens 10 tekens.';
    return 'Dat lukt nu niet. Probeer het opnieuw.';
  }

  // ---------- schermen bouwen ----------

  // Oogje als SVG (geen tekst): een streep erdoor zodra het wachtwoord zichtbaar is.
  function oogIcoon() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var pad = document.createElementNS(ns, 'path');
    pad.setAttribute('d', 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z');
    var pupil = document.createElementNS(ns, 'circle');
    pupil.setAttribute('cx', '12');
    pupil.setAttribute('cy', '12');
    pupil.setAttribute('r', '3');
    var streep = document.createElementNS(ns, 'path');
    streep.setAttribute('d', 'M3 3l18 18');
    streep.setAttribute('visibility', 'hidden');
    svg.appendChild(pad);
    svg.appendChild(pupil);
    svg.appendChild(streep);
    return { svg: svg, streep: streep };
  }

  function veld(naam, label, type, opts) {
    opts = opts || {};
    veldTeller += 1;
    var id = 'bm-auth-' + naam + '-' + veldTeller;
    var wrap = el('div', 'bm-veld');
    var lab = el('label', 'bm-veld__label', label);
    lab.setAttribute('for', id);
    var input = el(type === 'textarea' ? 'textarea' : 'input', 'bm-veld__invoer');
    input.id = id;
    input.name = naam;
    if (type === 'textarea') {
      input.rows = 3;
    } else {
      input.type = type;
    }
    input.setAttribute('autocomplete', opts.auto || 'off');
    input.setAttribute('autocapitalize', 'none');
    input.spellcheck = false;
    if (opts.mode) input.inputMode = opts.mode;
    if (opts.max) input.maxLength = opts.max;
    wrap.appendChild(lab);
    wrap.appendChild(input);
    if (opts.mail) {
      input.setAttribute('data-mail', '1');
      input.addEventListener('input', function () { laatsteMail = input.value.trim(); });
    }
    if (type === 'password') {
      input.setAttribute('data-ww', '1');
      var oog = knop('', 'bm-veld__oog', 'button');
      zetOogIcoon(oog, false);
      oog.setAttribute('aria-label', 'Wachtwoord tonen');
      oog.addEventListener('click', function () {
        var verborgen = input.type === 'password';
        input.type = verborgen ? 'text' : 'password';
        zetOogIcoon(oog, verborgen);
        oog.setAttribute('aria-label', verborgen ? 'Wachtwoord verbergen' : 'Wachtwoord tonen');
      });
      wrap.appendChild(oog);
    }
    if (opts.geenKopie) blokkeerKopie(input, lab);
    return { naam: naam, wrap: wrap, input: input };
  }

  // Nieuw wachtwoord: niet kopieren, knippen, plakken of slepen, zodat je het
  // echt twee keer typt. Een korte melding naast het label legt uit waarom.
  function blokkeerKopie(input, lab) {
    var hint = el('span', 'bm-veld__hint', 'Typ het zelf, kopiëren en plakken kan hier niet');
    hint.setAttribute('aria-live', 'polite');
    input.parentNode.appendChild(hint);
    var tijd = null;
    function weiger(e) {
      e.preventDefault();
      hint.classList.add('is-zichtbaar');
      clearTimeout(tijd);
      tijd = setTimeout(function () { hint.classList.remove('is-zichtbaar'); }, 2200);
    }
    ['copy', 'cut', 'paste', 'drop', 'dragstart'].forEach(function (soort) {
      input.addEventListener(soort, weiger);
    });
  }

  // Zet een oogje-svg in de knop. zichtbaar = het wachtwoord staat nu in de leesbare stand
  // (dan toont het icoon een doorgestreept oog: klik om te verbergen).
  function zetOogIcoon(btn, zichtbaar) {
    var ns = 'http://www.w3.org/2000/svg';
    while (btn.firstChild) btn.removeChild(btn.firstChild);
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var delen = zichtbaar
      ? [
        ['path', 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'],
        ['line', null, { x1: '1', y1: '1', x2: '23', y2: '23' }]
      ]
      : [
        ['path', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'],
        ['circle', null, { cx: '12', cy: '12', r: '3' }]
      ];
    delen.forEach(function (deel) {
      var onderdeel = document.createElementNS(ns, deel[0]);
      if (deel[1]) onderdeel.setAttribute('d', deel[1]);
      if (deel[2]) Object.keys(deel[2]).forEach(function (k) { onderdeel.setAttribute(k, deel[2][k]); });
      svg.appendChild(onderdeel);
    });
    btn.appendChild(svg);
  }

  // Basis van elk scherm: titel, tekst, formulier, melding en links.
  function scherm(naam, titel, tekst) {
    var root = el('section', 'bm-auth__scherm');
    root.setAttribute('data-scherm', naam);
    var s = {
      naam: naam,
      root: root,
      titel: el('h1', 'bm-auth__titel', titel),
      tekst: el('p', 'bm-auth__tekst', tekst || ''),
      form: el('form', 'bm-auth__form'),
      fout: el('p', 'bm-auth__fout'),
      melding: el('p', 'bm-auth__melding'),
      links: el('div', 'bm-auth__links'),
      velden: {},
      knop: null
    };
    s.form.setAttribute('novalidate', '');
    s.fout.setAttribute('role', 'alert');
    s.melding.setAttribute('role', 'status');
    root.appendChild(s.titel);
    root.appendChild(s.tekst);
    root.appendChild(s.form);
    root.appendChild(s.melding);
    root.appendChild(s.links);
    return s;
  }

  // Velden, foutregel en hoofdknop in het formulier (in die volgorde).
  function vulForm(s, velden, knopTekst) {
    velden.forEach(function (v) {
      s.velden[v.naam] = v;
      s.form.appendChild(v.wrap);
    });
    s.form.appendChild(s.fout);
    s.knop = knop(knopTekst, 'bm-knop bm-knop--primair', 'submit');
    s.form.appendChild(s.knop);
  }

  // Het formulier verstuurt via de handler; een tweede verzending terwijl het wacht, wordt genegeerd.
  function koppel(s, fn) {
    s.form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!bezigAl(s)) fn(s);
    });
  }

  function bouwLaden() {
    var s = scherm('laden', 'Even geduld...', '');
    s.herlaad = linkKnop('Herlaad de pagina', function () { location.reload(); });
    s.herlaad.hidden = true;
    s.links.appendChild(s.herlaad);
    return s;
  }

  function bouwInloggen() {
    var s = scherm('inloggen', 'Inloggen', 'Log in met je e-mail en wachtwoord. Daarna vragen we een code uit je mail.');
    vulForm(s, [
      veld('email', 'E-mailadres', 'email', { auto: 'email', mail: true, max: 254, mode: 'email' }),
      veld('ww', 'Wachtwoord', 'password', { auto: 'current-password', max: 200 })
    ], 'Inloggen');
    koppel(s, doeInloggen);
    s.links.appendChild(linkKnop('Account maken', function () { toon('aanmaken'); }));
    s.links.appendChild(linkKnop('Wachtwoord vergeten', function () { toon('vergeten'); }));
    return s;
  }

  function bouwAanmaken() {
    var s = scherm('aanmaken', 'Account maken', 'Maak een account met je mailadres en een wachtwoord.');
    vulForm(s, [
      veld('email', 'E-mailadres', 'email', { auto: 'email', mail: true, max: 254, mode: 'email' }),
      veld('ww', 'Wachtwoord (minstens 10 tekens)', 'password', { auto: 'new-password', max: 200, geenKopie: true }),
      veld('ww2', 'Wachtwoord herhalen', 'password', { auto: 'new-password', max: 200, geenKopie: true })
    ], 'Account maken');
    koppel(s, doeAanmaken);
    s.links.appendChild(linkKnop('Ik heb al een account', function () { toon('inloggen'); }));
    return s;
  }

  function bouwCode() {
    var s = scherm('code', 'Controleer je mail', 'We sturen een code naar je mail.');
    s.box = el('div', 'bm-code');
    s.box.setAttribute('role', 'group');
    s.box.setAttribute('aria-label', 'Zes cijfers van je inlogcode');
    s.vakjes = [];
    for (var i = 0; i < 6; i++) {
      var vak = el('input', 'bm-code__vak');
      vak.type = 'text';
      vak.inputMode = 'numeric';
      vak.setAttribute('autocomplete', i === 0 ? 'one-time-code' : 'off');
      vak.setAttribute('aria-label', 'Cijfer ' + (i + 1));
      s.box.appendChild(vak);
      s.vakjes.push(vak);
      koppelVak(s, vak, i);
    }
    s.form.appendChild(s.box);
    s.form.appendChild(s.fout);
    s.nieuwe = knop('Nieuwe code sturen', 'bm-knop', 'button');
    s.nieuwe.addEventListener('click', function () { stuurCode(s.nieuwe); });
    s.form.appendChild(s.nieuwe);
    s.aftel = el('p', 'bm-auth__aftel');
    s.form.appendChild(s.aftel);
    s.form.addEventListener('submit', function (e) { e.preventDefault(); });
    s.links.appendChild(linkKnop('Andere account', function () { uitloggen(); }));
    return s;
  }

  // Kleine regel met het mailadres van de ingelogde gebruiker (onder de uitleg).
  function mailRegel(s) {
    s.mail = el('p', 'bm-auth__mail');
    s.root.insertBefore(s.mail, s.form);
  }

  // Teksten van de wachtkamer staan in BM.welkomTeksten (js/welkom.js); zonder dat bestand de oude tekst.
  function wachtTeksten() {
    var w = (BM.welkomTeksten && BM.welkomTeksten.wachtkamer) || null;
    return {
      titel: (w && w.titel) || 'Wacht op goedkeuring',
      tekst: (w && w.tekst) || 'Berie moet je account eerst goedkeuren. Dit hoeft maar één keer.',
      extra: (w && w.extra) || '',
      sleutelLink: (w && w.sleutelLink) || 'Ik heb een sleutel'
    };
  }

  function bouwWacht() {
    var wt = wachtTeksten();
    var s = scherm('wacht', wt.titel, wt.tekst);
    if (BM.welkomTeksten) s.root.classList.add('bm-auth__scherm--wachtkamer');
    if (wt.extra) {
      s.extra = el('p', 'bm-auth__extra', wt.extra);
      s.root.insertBefore(s.extra, s.form);
    }
    mailRegel(s);
    vulForm(s, [], 'Opnieuw controleren');
    // Alleen zichtbaar voor een leerkracht (zie naarWacht): school kiezen en sleutel invullen.
    s.sleutelLink = linkKnop(wt.sleutelLink, function () { doeSleutelLink(); });
    s.sleutelLink.hidden = true;
    s.links.appendChild(s.sleutelLink);
    s.uit = knop('Uitloggen', 'bm-knop', 'button');
    s.uit.addEventListener('click', function () {
      if (s.uit.disabled) return;
      zetBezig(s.uit, true);
      uitloggen();
    });
    s.form.appendChild(s.uit);
    s.stand = el('p', 'bm-auth__aftel');
    s.form.appendChild(s.stand);
    koppel(s, doeOpnieuw);
    return s;
  }

  function bouwAfgewezen() {
    var s = scherm('afgewezen', 'Niet goedgekeurd', 'Berie heeft je aanvraag niet goedgekeurd.');
    mailRegel(s);
    vulForm(s, [], 'Uitloggen');
    koppel(s, function () {
      zetBezig(s.knop, true);
      uitloggen();
    });
    return s;
  }

  function bouwVergeten() {
    var s = scherm('vergeten', 'Wachtwoord vergeten', 'Vul je e-mailadres in. Dan sturen we een link om een nieuw wachtwoord te kiezen.');
    vulForm(s, [
      veld('email', 'E-mailadres', 'email', { auto: 'email', mail: true, max: 254, mode: 'email' })
    ], 'Stuur link');
    koppel(s, doeVergeten);
    s.links.appendChild(linkKnop('Terug naar inloggen', function () { toon('inloggen'); }));
    return s;
  }

  function bouwNieuw() {
    var s = scherm('nieuw', 'Nieuw wachtwoord', 'Kies een nieuw wachtwoord van minstens 10 tekens.');
    vulForm(s, [
      veld('ww', 'Nieuw wachtwoord', 'password', { auto: 'new-password', max: 200, geenKopie: true }),
      veld('ww2', 'Nieuw wachtwoord herhalen', 'password', { auto: 'new-password', max: 200, geenKopie: true })
    ], 'Wachtwoord opslaan');
    koppel(s, doeNieuw);
    return s;
  }

  function bouwOverlay() {
    overlay = el('div', 'bm-auth');
    overlay.id = 'bm-auth';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', "Inloggen bij Berie's mindmap");
    var kaart = el('div', 'bm-auth__kaart');
    kaart.appendChild(el('div', 'bm-auth__logo', "Berie's mindmap"));
    schermen.laden = bouwLaden();
    schermen.inloggen = bouwInloggen();
    schermen.aanmaken = bouwAanmaken();
    schermen.code = bouwCode();
    schermen.wacht = bouwWacht();
    schermen.afgewezen = bouwAfgewezen();
    schermen.vergeten = bouwVergeten();
    schermen.nieuw = bouwNieuw();
    Object.keys(schermen).forEach(function (naam) {
      kaart.appendChild(schermen[naam].root);
    });
    overlay.appendChild(kaart);
    document.body.appendChild(overlay);
  }

  // Wisselt het zichtbare scherm. De CSS zorgt voor de fade en de verschuiving.
  function toon(naam) {
    var s = schermen[naam];
    if (!s) return;
    if (huidig && schermen[huidig]) schermen[huidig].root.classList.remove('is-actief');
    // Het vanzelf controleren loopt alleen zolang het wachtscherm zichtbaar is.
    if (naam !== 'wacht') stopWachtTimer();
    huidig = naam;
    s.root.classList.add('is-actief');
    s.fout.textContent = '';
    s.melding.textContent = '';
    s.form.hidden = false;
    // Wachtwoorden nooit meeverhuizen naar een ander scherm.
    Array.prototype.forEach.call(s.root.querySelectorAll('[data-ww]'), function (inp) { inp.value = ''; });
    // Het mailadres gaat mee naar het volgende scherm, als het daar nog leeg is.
    if (laatsteMail) {
      Array.prototype.forEach.call(s.root.querySelectorAll('[data-mail]'), function (inp) {
        if (!inp.value) inp.value = laatsteMail;
      });
    }
    var eerste = naam === 'code' ? s.vakjes[0] : s.root.querySelector('input, textarea');
    if (eerste && !eerste.disabled) {
      try { eerste.focus({ preventScroll: true }); } catch (e) { /* focus kan mislukken */ }
    }
  }

  function naarInloggen(tekst) {
    toon('inloggen');
    if (tekst) meldFout(schermen.inloggen, tekst);
  }

  // Start de app niet, maar toon een melding op het laadscherm.
  function laadFout(tekst) {
    var s = schermen.laden;
    if (!s) return;
    s.titel.textContent = 'Geen verbinding';
    s.tekst.textContent = tekst;
    s.herlaad.hidden = false;
    toon('laden');
  }

  // ---------- inloggen, aanmaken en wachtwoorden ----------

  async function doeInloggen(s) {
    var mail = normMail(s.velden.email.input.value);
    var ww = s.velden.ww.input.value;
    meldFout(s, '');
    if (!geldigMail(mail)) { meldFout(s, 'Vul een geldig e-mailadres in.'); return; }
    if (!ww) { meldFout(s, 'Vul je wachtwoord in.'); return; }
    laatsteMail = mail;
    var res = await aanroep(s, s.knop, function () {
      return client.auth.signInWithPassword({ email: mail, password: ww });
    });
    if (!res) return;
    s.velden.ww.input.value = '';
    if (res.error) { meldFout(s, authTekst(res.error)); return; }
    if (!res.data || !res.data.user) { meldFout(s, 'Dat lukt nu niet. Probeer het opnieuw.'); return; }
    // Na elk inloggen hoort de code uit de mail; de sessie telt pas als die klopt.
    naarCode(res.data.user);
  }

  async function doeAanmaken(s) {
    var mail = normMail(s.velden.email.input.value);
    var ww = s.velden.ww.input.value;
    var ww2 = s.velden.ww2.input.value;
    meldFout(s, '');
    if (!geldigMail(mail)) { meldFout(s, 'Vul een geldig e-mailadres in.'); return; }
    if (ww.length < MIN_WW) { meldFout(s, 'Het wachtwoord moet minstens 10 tekens zijn.'); return; }
    if (ww !== ww2) { meldFout(s, 'De wachtwoorden zijn niet gelijk.'); return; }
    laatsteMail = mail;
    var res = await aanroep(s, s.knop, function () {
      return client.auth.signUp({ email: mail, password: ww });
    });
    if (!res) return;
    if (res.error) { meldFout(s, authTekst(res.error)); return; }
    var user = res.data && res.data.user;
    if (!res.data || !res.data.session) {
      // Zonder sessie (mailbevestiging staat aan): meteen inloggen met dezelfde gegevens.
      var inl = await aanroep(s, s.knop, function () {
        return client.auth.signInWithPassword({ email: mail, password: ww });
      });
      if (!inl) return;
      if (inl.error || !inl.data || !inl.data.user) {
        naarInloggen('Account aangemaakt. Log nu in.');
        return;
      }
      user = inl.data.user;
    }
    if (!user) { naarInloggen('Account aangemaakt. Log nu in.'); return; }
    s.velden.ww.input.value = '';
    s.velden.ww2.input.value = '';
    naarCode(user);
  }

  async function doeVergeten(s) {
    var mail = normMail(s.velden.email.input.value);
    meldFout(s, '');
    if (!geldigMail(mail)) { meldFout(s, 'Vul een geldig e-mailadres in.'); return; }
    laatsteMail = mail;
    var res = await aanroep(s, s.knop, function () {
      return client.auth.resetPasswordForEmail(mail, { redirectTo: location.origin + location.pathname });
    });
    if (!res) return;
    if (res.error && res.error.name === 'AuthRetryableFetchError') { meldFout(s, GEEN_VERBINDING); return; }
    if (res.error && res.error.status === 429) {
      meldFout(s, 'Je hebt dit te vaak gevraagd. Probeer het later opnieuw.');
      return;
    }
    // Altijd dezelfde melding, ook als het mailadres onbekend is.
    s.form.hidden = true;
    meldOk(s, 'Als dit mailadres een account heeft, krijg je een mail.');
  }

  async function doeNieuw(s) {
    var ww = s.velden.ww.input.value;
    var ww2 = s.velden.ww2.input.value;
    meldFout(s, '');
    if (ww.length < MIN_WW) { meldFout(s, 'Het wachtwoord moet minstens 10 tekens zijn.'); return; }
    if (ww !== ww2) { meldFout(s, 'De wachtwoorden zijn niet gelijk.'); return; }
    var res = await aanroep(s, s.knop, function () {
      return client.auth.updateUser({ password: ww });
    });
    if (!res) return;
    s.velden.ww.input.value = '';
    s.velden.ww2.input.value = '';
    if (res.error) { meldFout(s, authTekst(res.error)); return; }
    herstel = false;
    // Oude sessies op andere apparaten moeten eruit; deze sessie blijft staan.
    try {
      await Promise.race([
        client.auth.signOut({ scope: 'others' }),
        new Promise(function (resolve) { setTimeout(resolve, 5000); })
      ]);
    } catch (e) { /* andere sessies blijven dan staan; het wachtwoord is wel gewijzigd */ }
    var user = res.data && res.data.user;
    if (!user) { naarInloggen('Dat lukt nu niet. Vraag een nieuwe link aan.'); return; }
    // De herstel-sessie is niet geverifieerd: daarna gewoon de code uit de mail.
    naarCode(user);
  }

  // ---------- de code ----------

  function vakjesWaarde(s) {
    return s.vakjes.map(function (v) { return v.value; }).join('');
  }

  // Zet een vakje op een cijfer (of leeg) en onthoudt de waarde voor de invoer-controle.
  function zetVakWaarde(v, c) {
    v.value = c;
    v._oud = c;
  }

  function vakjesLeeg(s) {
    s.vakjes.forEach(function (v) { zetVakWaarde(v, ''); });
    s.box.classList.remove('is-fout');
  }

  function zetVakjesAan(s, aan) {
    s.vakjes.forEach(function (v) { v.disabled = !aan; });
  }

  // Zet de cijfers vanaf vakje "start" neer en springt naar het volgende lege vakje.
  function vulVakjes(s, start, cijfers) {
    var v = s.vakjes;
    for (var k = 0; k < cijfers.length && start + k < v.length; k++) {
      zetVakWaarde(v[start + k], cijfers.charAt(k));
    }
    var volgende = Math.min(start + cijfers.length, v.length - 1);
    v[volgende].focus();
  }

  function koppelVak(s, vak, i) {
    vak.addEventListener('input', function () {
      s.box.classList.remove('is-fout');
      var cijfers = vak.value.replace(/\D/g, '');
      // In een gevuld vakje telt alleen het nieuwe (laatste) cijfer. Een bulk-invoer
      // (bijv. automatisch invullen) in een leeg vakje blijft volledig.
      if (vak._oud && cijfers.length > 1) cijfers = cijfers.charAt(cijfers.length - 1);
      if (!cijfers) { zetVakWaarde(vak, ''); return; }
      vulVakjes(s, i, cijfers);
      if (vakjesWaarde(s).length === 6) verifieer(s);
    });
    vak.addEventListener('keydown', function (e) {
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') s.box.classList.remove('is-fout');
      if (e.key === 'Backspace' && !vak.value && i > 0) {
        e.preventDefault();
        zetVakWaarde(s.vakjes[i - 1], '');
        s.vakjes[i - 1].focus();
      } else if (e.key === 'ArrowLeft' && i > 0) {
        e.preventDefault();
        s.vakjes[i - 1].focus();
      } else if (e.key === 'ArrowRight' && i < 5) {
        e.preventDefault();
        s.vakjes[i + 1].focus();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        verifieer(s);
      }
    });
    vak.addEventListener('paste', function (e) {
      s.box.classList.remove('is-fout');
      var tekst = (e.clipboardData && e.clipboardData.getData('text')) || '';
      var cijfers = tekst.replace(/\D/g, '');
      e.preventDefault();
      if (!cijfers) return;
      vulVakjes(s, i, cijfers);
      if (vakjesWaarde(s).length === 6) verifieer(s);
    });
  }

  function naarCode(user) {
    wachtend = { id: user.id, email: user.email || '' };
    var s = schermen.code;
    vakjesLeeg(s);
    zetVakjesAan(s, true);
    s.fout.textContent = '';
    s.tekst.textContent = 'We sturen een code naar ' + wachtend.email + '.';
    toon('code');
    stuurCode(null);
  }

  function mailVan() { return wachtend ? wachtend.email : ''; }

  // Vraagt een (nieuwe) code aan. Zonder knop (knopEl = null) gaat het bij het inloggen automatisch.
  async function stuurCode(knopEl) {
    var s = schermen.code;
    var res = await aanroep(s, knopEl, function () {
      return client.functions.invoke('stuur-code', { body: {} });
    });
    if (!res) { zetAftel(); return; }
    if (res.error) {
      var u = await leesFout(res.error);
      if (u.fout === 'niet_ingelogd') {
        naarInloggen('Je sessie is verlopen. Log opnieuw in.');
        return;
      }
      if (u.fout === 'even_wachten') {
        // De code is al eerder verstuurd: de aftelling loopt door.
        s.tekst.textContent = 'We hebben een code gestuurd naar ' + mailVan() + '.';
        meldFout(s, codeTekst(u));
        aftelStart(u.wacht || CODE_WACHT);
        return;
      }
      meldFout(s, codeTekst(u));
      zetAftel();
      return;
    }
    if (!res.data || !res.data.ok) {
      meldFout(s, 'Er ging iets mis. Probeer het opnieuw.');
      zetAftel();
      return;
    }
    s.tekst.textContent = 'We hebben een code gestuurd naar ' + mailVan() + '. Vul hem hieronder in.';
    if (knopEl) meldOk(s, 'Nieuwe code verstuurd.');
    vakjesLeeg(s);
    zetVakjesAan(s, true);
    aftelStart(CODE_WACHT);
  }

  function zetAftel() {
    var s = schermen.code;
    if (!s || !s.nieuwe) return;
    if (codeAftel > 0) {
      s.aftel.textContent = 'Een nieuwe code kan over ' + codeAftel + ' seconden.';
      s.nieuwe.disabled = true;
    } else {
      s.aftel.textContent = '';
      s.nieuwe.disabled = s.nieuwe.classList.contains('is-bezig');
    }
  }

  function aftelStart(sec) {
    clearInterval(codeTimer);
    codeTimer = 0;
    codeAftel = Math.max(0, Math.floor(Number(sec)) || 0);
    zetAftel();
    if (codeAftel > 0) {
      codeTimer = setInterval(function () {
        codeAftel -= 1;
        zetAftel();
        if (codeAftel <= 0) {
          clearInterval(codeTimer);
          codeTimer = 0;
        }
      }, 1000);
    }
  }

  function zetCodeBezig(s, aan) {
    s.box.classList.toggle('is-bezig', !!aan);
    zetVakjesAan(s, !aan);
  }

  // Foutmelding van de code-controle; sommige fouten sluiten het invoeren af tot een nieuwe code.
  function codeFout(s, u) {
    if (u.fout === 'niet_ingelogd') {
      naarInloggen('Je sessie is verlopen. Log opnieuw in.');
      return;
    }
    meldFout(s, codeTekst(u));
    vakjesLeeg(s);
    if (u.fout === 'fout') s.box.classList.add('is-fout');  // schudt; verdwijnt bij de volgende invoer
    // Na de laatste poging (over 0) is de code op: het invoeren stopt tot een nieuwe code
    var stop = ['geblokkeerd', 'verlopen', 'geen_code'].indexOf(u.fout) !== -1 ||
      (u.fout === 'fout' && u.over === 0);
    zetVakjesAan(s, !stop);
    if (!stop) s.vakjes[0].focus();
  }

  async function verifieer(s) {
    if (verifieerBezig) return;
    var code = vakjesWaarde(s);
    if (!/^\d{6}$/.test(code)) { meldFout(s, 'Vul alle 6 cijfers in.'); return; }
    verifieerBezig = true;
    meldFout(s, '');
    zetCodeBezig(s, true);
    var res = await aanroep(s, null, function () {
      return client.functions.invoke('check-code', { body: { code: code } });
    });
    verifieerBezig = false;
    s.box.classList.remove('is-bezig');
    if (!res) { zetVakjesAan(s, true); return; }
    if (res.error) {
      codeFout(s, await leesFout(res.error));
      return;
    }
    if (res.data && res.data.ok) {
      if (wachtend) await naCode(s, wachtend);
      return;
    }
    codeFout(s, { fout: 'onbekend', status: 500 });
  }

  // ---------- goedkeuring: mag deze gebruiker de app in? ----------

  var STATUSSEN = ['toegang', 'geen', 'wacht', 'afgewezen', 'niet_geverifieerd'];
  var WACHT_ELKE = 20000;   // ms: zo vaak kijkt het wachtscherm vanzelf opnieuw
  var STAND_TEKST = 'We kijken elke 20 seconden vanzelf opnieuw.';
  var NIET_VERSTUURD = 'Je aanvraag is nog niet verstuurd. Klik op Opnieuw controleren.';
  var wachtTimer = 0;
  var autoBezig = false;
  var aanvraagGedaan = false;  // hooguit een aanvraag per bezoek
  var aanvraagBezig = false;   // er loopt nu een aanvraag
  var opgegeven = false;       // opstarten duurde te lang: late antwoorden doen niets meer

  // Vraagt de database of deze gebruiker de app in mag. Een onbekend antwoord geldt als fout.
  async function haalStatus() {
    var r = await client.rpc('mijn_status');
    if (r.error) throw r.error;
    if (typeof r.data !== 'string' || STATUSSEN.indexOf(r.data) === -1) {
      throw new Error('onbekende status');
    }
    return r.data;
  }

  // Na een goede code: eerst de status, alleen bij 'toegang' start de app.
  async function naCode(s, user) {
    zetCodeBezig(s, true);
    var res = await aanroep(s, null, haalStatus);
    if (typeof res !== 'string') {
      s.box.classList.remove('is-bezig');
      // De code is al gebruikt: na herladen volgt dezelfde controle met de bestaande sessie.
      laadFout(res ? VERBINDING_OP : TE_LANG);
      return;
    }
    // Bezig blijft zichtbaar tot ook een eventuele aanvraag (vraag-toegang) klaar is.
    await volgStatus(user, res);
    s.box.classList.remove('is-bezig');
  }

  var welkomKlaar = false;     // de welkomstflow is in dit bezoek al doorlopen
  var welkomBezig = false;     // de welkomstflow staat nu op het scherm

  // Verbergt het zichtbare scherm, zodat js/welkom.js zijn eigen scherm in de kaart kan tonen.
  function verbergSchermen() {
    if (huidig && schermen[huidig]) schermen[huidig].root.classList.remove('is-actief');
    stopWachtTimer();
    huidig = '';
  }

  // Draait een stuk van de welkomstflow (ingang = BM.welkom.voorToegang of sleutelVanafWacht).
  // Geeft de status terug waarmee het verder moet, of null als er al een ander scherm staat.
  async function doeWelkom(user, status, ingang) {
    welkomBezig = true;
    var uit = null;
    try {
      uit = await ingang({
        client: client,
        user: { id: user.id, email: user.email || '' },
        status: status,
        kaart: overlay ? overlay.querySelector('.bm-auth__kaart') : null,
        verbergSchermen: verbergSchermen,
        uitloggen: uitloggen
      });
    } catch (err) {
      uit = null;
      try { console.error('[BM.auth] welkom mislukt:', err); } catch (e) { /* console kan ontbreken */ }
    }
    welkomBezig = false;
    if (uit && uit.soort === 'verlopen') {
      naarInloggen('Je sessie is verlopen. Log opnieuw in.');
      return null;
    }
    if (uit && uit.soort === 'opnieuw') {
      // Alleen de database bepaalt of er nu toegang is.
      toon('laden');
      var nieuw = '';
      try {
        nieuw = await Promise.race([haalStatus(), wachtLimiet()]);
      } catch (e) { nieuw = ''; }
      if (typeof nieuw !== 'string' || !nieuw) {
        laadFout(nieuw === LIMIET ? TE_LANG : VERBINDING_OP);
        return null;
      }
      return nieuw;
    }
    return status;
  }

  // Link "Ik heb een sleutel" in de wachtkamer.
  async function doeSleutelLink() {
    if (!wachtend || welkomBezig || aangemeld) return;
    if (!BM.welkom || typeof BM.welkom.sleutelVanafWacht !== 'function') return;
    var user = wachtend;
    var status = await doeWelkom(user, 'wacht', BM.welkom.sleutelVanafWacht);
    if (status === null || aangemeld) return;
    await volgStatus(user, status);
  }

  // Gaat verder volgens de status: app starten, code vragen, aanvraag sturen, wachten of afgewezen.
  async function volgStatus(user, status) {
    if (aangemeld) return;
    if (status === 'niet_geverifieerd') { naarCode(user); return; }
    // Eerste keer na de code: wie ben je (js/welkom.js). Die flow geeft zelf geen toegang;
    // na een gebruikte sleutel vraagt deze functie de status opnieuw aan de database.
    if (!welkomKlaar && BM.welkom && typeof BM.welkom.voorToegang === 'function') {
      if (welkomBezig) return;
      status = await doeWelkom(user, status, BM.welkom.voorToegang);
      if (status === null || aangemeld) return;
      welkomKlaar = true;
      if (status === 'niet_geverifieerd') { naarCode(user); return; }
    }
    if (status === 'toegang') { afronden(user); return; }
    if (status === 'afgewezen') { naarAfgewezen(user); return; }
    var foutTekst = '';
    if (status === 'geen') {
      var u = await vraagToegang();
      if (u.status === 'toegang') { afronden(user); return; }
      if (u.status === 'afgewezen') { naarAfgewezen(user); return; }
      if (u.status === 'niet_ingelogd') {
        naarInloggen('Je sessie is verlopen. Log opnieuw in.');
        return;
      }
      foutTekst = u.tekst || '';
    }
    naarWacht(user, foutTekst);
  }

  // Naam uit het profiel (js/welkom.js) voor de aanvraagmail; zonder profiel een lege body.
  function aanvraagBody() {
    var naam = '';
    try {
      if (BM.welkom && typeof BM.welkom.aanvraagNaam === 'function') naam = BM.welkom.aanvraagNaam() || '';
    } catch (e) { naam = ''; }
    return naam ? { naam: naam } : {};
  }

  // Stuurt de aanvraag naar Berie. Het mailadres bepaalt de server zelf (uit de sessie).
  async function vraagToegang() {
    if (aanvraagGedaan || aanvraagBezig) return { status: 'wacht' };
    aanvraagBezig = true;
    // De knop "Opnieuw controleren" staat uit zolang de aanvraag loopt: geen tweede aanvraag tegelijk.
    var res;
    try {
      res = await aanroep(schermen.wacht, schermen.wacht.knop, function () {
        return client.functions.invoke('vraag-toegang', { body: aanvraagBody() });
      });
    } finally {
      aanvraagBezig = false;
    }
    if (!res) return { status: 'geen', tekst: TE_LANG };
    if (res.error) {
      var u = await leesFout(res.error);
      if (u.fout === 'niet_ingelogd') return { status: 'niet_ingelogd' };
      if (u.fout === 'te_veel') {
        return { status: 'geen', tekst: 'Er zijn nu te veel aanvragen. Probeer het later opnieuw.' };
      }
      return { status: 'geen', tekst: u.status ? NIET_VERSTUURD : GEEN_VERBINDING };
    }
    var d = res.data || {};
    if (!d.ok) return { status: 'geen', tekst: NIET_VERSTUURD };
    aanvraagGedaan = true;
    return { status: (d.status === 'toegang' || d.status === 'afgewezen') ? d.status : 'wacht' };
  }

  function zetMailRegel(s, user) {
    if (s && s.mail) s.mail.textContent = (user && user.email) ? 'Ingelogd als ' + user.email : '';
  }

  function naarWacht(user, foutTekst) {
    wachtend = { id: user.id, email: user.email || '' };
    var s = schermen.wacht;
    zetMailRegel(s, wachtend);
    s.stand.textContent = STAND_TEKST;
    var magSleutel = false;
    try {
      magSleutel = !!(BM.welkom && typeof BM.welkom.kanSleutel === 'function' && BM.welkom.kanSleutel());
    } catch (e) { magSleutel = false; }
    s.sleutelLink.hidden = !magSleutel;
    toon('wacht');
    if (foutTekst) meldFout(s, foutTekst);
    startWachtTimer();
  }

  function naarAfgewezen(user) {
    wachtend = { id: user.id, email: user.email || '' };
    zetMailRegel(schermen.afgewezen, wachtend);
    toon('afgewezen');
  }

  function startWachtTimer() {
    stopWachtTimer();
    wachtTimer = setInterval(autoControle, WACHT_ELKE);
  }

  function stopWachtTimer() {
    if (wachtTimer) clearInterval(wachtTimer);
    wachtTimer = 0;
  }

  // Stil op de achtergrond: alleen bij een andere uitkomst dan 'wacht' verandert het scherm.
  async function autoControle() {
    var s = schermen.wacht;
    if (huidig !== 'wacht' || aangemeld) { stopWachtTimer(); return; }
    if (autoBezig || bezigAl(s) || !wachtend) return;
    autoBezig = true;
    var st = '';
    try { st = await haalStatus(); } catch (e) { st = ''; }
    autoBezig = false;
    if (huidig !== 'wacht' || !wachtend || bezigAl(s)) return;
    // 'geen' (aanvraag mislukt) laat het scherm staan: de knop probeert het opnieuw.
    if (st && st !== 'wacht' && st !== 'geen') await volgStatus(wachtend, st);
  }

  // Knop "Opnieuw controleren".
  async function doeOpnieuw(s) {
    if (!wachtend) { naarInloggen(); return; }
    var user = wachtend;
    meldFout(s, '');
    var res = await aanroep(s, s.knop, haalStatus);
    if (!res) return;
    if (typeof res !== 'string') { meldFout(s, GEEN_VERBINDING); return; }
    if (huidig !== 'wacht') return;
    if (res === 'wacht') {
      s.stand.textContent = 'Nog niet goedgekeurd. ' + STAND_TEKST;
      return;
    }
    await volgStatus(user, res);
  }

  // ---------- klaar: overlay weg, cloud starten ----------

  function afronden(user) {
    if (aangemeld || !user) return;
    // Zonder cloud-module start de app niet: geen lokale fallback als cloud verplicht is.
    if (!BM.cloud || typeof BM.cloud.begin !== 'function') {
      laadFout('Kan geen verbinding maken. Herlaad de pagina en start de app niet.');
      return;
    }
    aangemeld = true;
    gebruiker = { id: user.id, email: user.email || '' };
    wachtend = null;
    herstel = false;
    stopWachtTimer();
    clearInterval(codeTimer);
    codeTimer = 0;
    if (overlay) {
      var o = overlay;
      overlay = null;
      o.classList.add('is-weg');
      setTimeout(function () {
        if (o.parentNode) o.parentNode.removeChild(o);
      }, 320);
    }
    // Begroeting en uitleg (js/welkom.js) komen over de mindmap heen, de eerste keer.
    try {
      if (BM.welkom && typeof BM.welkom.naToegang === 'function') BM.welkom.naToegang();
    } catch (err) {
      try { console.error('[BM.auth] begroeting mislukt:', err); } catch (e) { /* console kan ontbreken */ }
    }
    try {
      BM.cloud.begin({ id: gebruiker.id, email: gebruiker.email });
    } catch (err) {
      try { console.error('[BM.auth] starten mislukt:', err); } catch (e) { /* console kan ontbreken */ }
    }
  }

  async function uitloggen() {
    try {
      if (BM.cloud && typeof BM.cloud.stop === 'function') BM.cloud.stop();
    } catch (e) { /* cloud kan al gestopt zijn */ }
    // Alleen de sleutel van deze gebruiker (met een ":" in de naam) wissen, nooit de oude lokale mindmap.
    try {
      var sleutel = (BM.store && typeof BM.store.getKey === 'function') ? BM.store.getKey() : '';
      // Staan er wijzigingen die nog niet in de cloud zijn, dan blijft de lokale kopie staan.
      var nietGepusht = !!sleutel && localStorage.getItem(sleutel + '-niet-gepusht') === '1';
      if (sleutel && sleutel.indexOf(':') !== -1 && !nietGepusht) {
        [sleutel, sleutel + '-kapot', sleutel + '-niet-geladen', sleutel + '-niet-gepusht'].forEach(function (k) {
          localStorage.removeItem(k);
        });
      }
    } catch (e) { /* opslag kan geblokkeerd zijn */ }
    try {
      if (client) {
        await Promise.race([
          client.auth.signOut({ scope: 'local' }),
          new Promise(function (resolve) { setTimeout(resolve, 5000); })
        ]);
      }
    } catch (e) { /* ook zonder afmelden herladen we de pagina */ }
    location.reload();
  }

  // ---------- opstarten ----------

  // supabase-js komt van het CDN: wacht tot het er is, of geef op na LAAD_MAX.
  function wachtOpSupabase() {
    return new Promise(function (resolve, reject) {
      var t0 = Date.now();
      (function kijk() {
        if (window.supabase && typeof window.supabase.createClient === 'function') return resolve();
        if (Date.now() - t0 > LAAD_MAX) return reject(new Error('supabase-js niet geladen'));
        setTimeout(kijk, 150);
      })();
    });
  }

  function maakClient() {
    client = window.supabase.createClient(BM.config.supabaseUrl, BM.config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'bm-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    // Alleen het herstel-event hier: de rest gebeurt in initSessie.
    client.auth.onAuthStateChange(function (event) {
      if (event !== 'PASSWORD_RECOVERY') return;
      herstel = true;
      if (initKlaar) naarNieuw();
    });
  }

  function naarNieuw() {
    toon('nieuw');
  }

  // Haalt de herstel-tokens uit de adresbalk, zodat ze niet blijven staan.
  function schoonHash() {
    var h = location.hash || '';
    if (h.indexOf('access_token') !== -1 || h.indexOf('type=') !== -1) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* geen geschiedenis */ }
    }
  }

  async function initSessie() {
    if (/type=recovery/.test(location.hash || '')) herstel = true;
    var sess = await client.auth.getSession();
    var session = sess && sess.data && sess.data.session;
    schoonHash();
    if (opgegeven) return null;
    if (herstel) {
      if (!session) {
        herstel = false;
        naarInloggen('Deze link is verlopen. Vraag een nieuwe aan.');
        return;
      }
      naarNieuw();
      return;
    }
    if (!session || !session.user) { naarInloggen(); return; }
    // Zelfde controle als na de code: alleen met goedkeuring start de app.
    // volgStatus (met een eventuele aanvraag) loopt pas na de wachtlimiet, in start().
    var status = await haalStatus();
    return { user: session.user, status: status };
  }

  function wachtLimiet() {
    return new Promise(function (resolve) {
      setTimeout(function () { resolve(LIMIET); }, WACHT_MAX);
    });
  }

  function start() {
    bouwOverlay();
    toon('laden');
    wachtOpSupabase().then(function () {
      maakClient();
      return Promise.race([initSessie(), wachtLimiet()]);
    }).then(function (res) {
      initKlaar = true;
      if (res === LIMIET) { opgegeven = true; laadFout(TE_LANG); return; }
      if (res && res.user) return volgStatus(res.user, res.status);
      if (herstel && !aangemeld && huidig !== 'nieuw') naarNieuw();
    }, function () {
      initKlaar = true;
      opgegeven = true;
      laadFout(VERBINDING_OP);
    });
  }

  BM.auth = {
    vereist: vereist,
    client: function () { return client; },
    gebruiker: function () { return gebruiker ? { id: gebruiker.id, email: gebruiker.email } : null; },
    uitloggen: uitloggen
  };

  if (vereist()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  }
})();
