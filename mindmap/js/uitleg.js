(function () {
  'use strict';
  var BM = window.BM = window.BM || {};

  // Uitleg-motor (rondleiding): een box met korte tekst, met een schuine lijn verbonden
  // aan het onderdeel dat wordt uitgelegd. Eén stap per klik.
  //
  // ===================== CONTRACT =====================
  //
  // BM.uitleg.start(stappen, opties)   start de uitleg. opties.klaar(reden) wordt een keer aangeroepen
  //                                    met 'klaar' (laatste stap gehad), 'overgeslagen' of 'gestopt'.
  // BM.uitleg.volgende()               volgende stap (na de laatste stap: klaar)
  // BM.uitleg.vorige()                 vorige stap
  // BM.uitleg.overslaan()              stopt en meldt 'overgeslagen'
  // BM.uitleg.stop()                   stopt en meldt 'gestopt'
  // BM.uitleg.actief()                 true zolang de uitleg loopt
  // Bus: 'uitleg:start' {aantal}, 'uitleg:stap' {index, aantal}, 'uitleg:klaar' {reden}
  //
  // Een stap (zie js/uitleg-stappen.js, BM.uitlegStappen):
  //   {
  //     titel: 'Korte kop',
  //     tekst: 'Een of twee korte zinnen.',
  //     doel:  functie die teruggeeft: een schermpunt {x, y} (pixels in het venster),
  //            een DOM-element, of null (dan staat de box in het midden, zonder lijn).
  //            Wordt elke frame opnieuw gevraagd, dus een punt dat beweegt wordt gevolgd.
  //            Weglaten of null = midden.
  //     plek:  'auto' (standaard) | 'rechtsboven' | 'linksboven' | 'rechtsonder' | 'linksonder'
  //            waar de box staat ten opzichte van het punt. Past de voorkeur niet, dan kiest de motor zelf.
  //     anker: alleen bij een DOM-element: 'midden' (standaard) | 'boven' | 'onder' | 'links' | 'rechts'
  //            op welke plek van het element het punt staat.
  //     voor:  functie die loopt vlak voor de stap (bv. de pop-up openen). Optioneel.
  //     na:    functie die loopt bij het verlaten van de stap (bv. de pop-up sluiten). Optioneel.
  //     wacht: ms wachten na voor() voordat de box verschijnt (standaard 280 met voor, anders 0).
  //     knop:  tekst van de knop rechtsonder in de box (standaard 'Volgende', laatste stap 'Beginnen').
  //   }
  //
  // Hulpjes voor doelen (geven een functie of waarde terug die in "doel" past):
  //   BM.uitleg.doelen.hoofdpunt        functie: het middelpunt van het huidige project op het scherm
  //   BM.uitleg.doelen.eersteTak        functie: de eerste tak van het hoofdpunt (of null)
  //   BM.uitleg.doelen.punt(nodeId)     maakt een functie voor een bepaald punt
  //   BM.uitleg.doelen.el(selector)     maakt een functie die het eerste ZICHTBARE element geeft (of null)
  // Hulpjes voor voor/na:
  //   BM.uitleg.acties.openPopup        opent de pop-up van het hoofdpunt
  //   BM.uitleg.acties.sluitPopup       sluit de pop-up
  //   BM.uitleg.acties.sluitAlles       sluit pop-up, notitiepaneel, Afstand-paneel en projectmenu
  //
  // DOM (alles wordt hier gemaakt; de stijl staat in css/uitleg.css):
  //   div.bm-uitleg                      laag over het hele scherm (klik = volgende)
  //     .is-zichtbaar                    ingefade
  //     .is-wissel                       tussen twee stappen: lijn en box zijn even onzichtbaar
  //     .bm-uitleg--midden               stap zonder doel: geen punt, lijn of kader
  //     [data-stap="3"] [data-aantal="7"]
  //     svg.bm-uitleg__svg               over het hele scherm
  //       line.bm-uitleg__lijn           van het punt naar de hoek van de box
  //       circle.bm-uitleg__ring         ring om het punt (voor een pulse)
  //       circle.bm-uitleg__punt         het punt op het doel
  //     div.bm-uitleg__kader             randje om een DOM-element als doel ([hidden] bij een schermpunt)
  //     div.bm-uitleg__box               de box; left/top komen inline van de motor (gebruik geen transform
  //                                      voor de plek; een transform voor een animatie mag op een kind)
  //       [data-plek]                    'rechtsboven' | 'linksboven' | 'rechtsonder' | 'linksonder' | 'boven' | 'onder' | 'midden'
  //       div.bm-uitleg__stap            "Stap 2 van 7"
  //       h2.bm-uitleg__titel
  //       p.bm-uitleg__tekst
  //       div.bm-uitleg__voet
  //         button.bm-uitleg__overslaan  "Overslaan"
  //         button.bm-uitleg__volgende   "Volgende" / "Beginnen"
  //
  // De motor zet alleen: left/top (box), left/top/width/height (kader), x1/y1/x2/y2 (lijn), cx/cy (punt, ring).
  // Maten van de box (breedte, padding) bepaalt de CSS; de motor meet de box en past de plek aan.
  // ====================================================

  var NS = 'http://www.w3.org/2000/svg';
  var RAND = 12;          // minimale afstand van de box tot de schermrand
  var SCHUIN_X = 56;      // de lijn loopt zoveel opzij ...
  var SCHUIN_Y = 46;      // ... en zoveel omhoog of omlaag
  var WISSEL_MS = 170;    // duur van het uitfaden tussen twee stappen (gelijk aan de CSS)

  var ui = null;          // {root, svg, lijn, ring, punt, kader, box, stap, titel, tekst, overslaan, volgende}
  var stappen = [];
  var index = -1;
  var opties = null;
  var loopt = false;
  var wisselt = false;    // er loopt een overgang naar een andere stap
  var wisselTimer = 0;
  var raf = 0;
  var vorigeFocus = null;
  var laatste = '';       // laatst getekende stand (om onnodig tekenen te vermijden)

  function el(tag, cls, tekst) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (tekst != null) e.textContent = tekst;
    return e;
  }

  function svgEl(tag, cls) {
    var e = document.createElementNS(NS, tag);
    e.setAttribute('class', cls);
    return e;
  }

  function veilig(fn, terugval) {
    try { return fn(); } catch (e) { return terugval; }
  }

  function minderBeweging() {
    return veilig(function () {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, false);
  }

  function klem(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // ---------- doelen ----------

  function hoofdId() {
    return veilig(function () {
      var p = BM.store.getProject(BM.store.currentId());
      return (p && p.rootId) || null;
    }, null);
  }

  function puntOpScherm(nodeId) {
    return veilig(function () {
      var p = BM.store.getProject(BM.store.currentId());
      var n = p && p.nodes && p.nodes[nodeId];
      if (!n) return null;
      var s = BM.camera.worldToScreen(n.x, n.y);
      if (!s || typeof s.x !== 'number' || typeof s.y !== 'number') return null;
      return { x: s.x, y: s.y };
    }, null);
  }

  function zichtbaar(e) {
    if (!e || !e.getBoundingClientRect) return false;
    var r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  var doelen = {
    hoofdpunt: function () {
      var id = hoofdId();
      return id ? puntOpScherm(id) : null;
    },
    eersteTak: function () {
      return veilig(function () {
        var p = BM.store.getProject(BM.store.currentId());
        var root = p && p.nodes[p.rootId];
        var kind = root && root.children && root.children[0];
        return kind ? puntOpScherm(kind) : null;
      }, null);
    },
    punt: function (nodeId) {
      return function () { return puntOpScherm(nodeId); };
    },
    el: function (selector) {
      return function () {
        var lijst = veilig(function () { return document.querySelectorAll(selector); }, []);
        for (var i = 0; i < lijst.length; i++) {
          if (zichtbaar(lijst[i])) return lijst[i];
        }
        return null;
      };
    }
  };

  var acties = {
    openPopup: function () {
      var id = hoofdId();
      if (id && BM.bus) BM.bus.emit('ui:open-popup', { nodeId: id });
    },
    sluitPopup: function () {
      veilig(function () { if (BM.popup && BM.popup.isOpen()) BM.popup.close(); }, null);
    },
    sluitAlles: function () {
      veilig(function () { if (BM.popup && BM.popup.isOpen()) BM.popup.close(); }, null);
      veilig(function () { if (BM.editor && BM.editor.isOpen()) BM.editor.close(); }, null);
      veilig(function () { if (BM.view && BM.view.isOpen()) BM.view.close(); }, null);
      veilig(function () { if (BM.projects && BM.projects.close) BM.projects.close(); }, null);
    }
  };

  // ---------- opbouw ----------

  function bouw() {
    if (ui) return;
    var root = el('div', 'bm-uitleg');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Uitleg');

    var svg = svgEl('svg', 'bm-uitleg__svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var lijn = svgEl('line', 'bm-uitleg__lijn');
    var ring = svgEl('circle', 'bm-uitleg__ring');
    ring.setAttribute('r', '11');
    var punt = svgEl('circle', 'bm-uitleg__punt');
    punt.setAttribute('r', '4');
    svg.appendChild(lijn);
    svg.appendChild(ring);
    svg.appendChild(punt);

    var kader = el('div', 'bm-uitleg__kader');
    kader.hidden = true;

    var box = el('div', 'bm-uitleg__box');
    box.tabIndex = -1;
    box.setAttribute('aria-live', 'polite');
    var stap = el('div', 'bm-uitleg__stap');
    var titel = el('h2', 'bm-uitleg__titel');
    var tekst = el('p', 'bm-uitleg__tekst');
    var voet = el('div', 'bm-uitleg__voet');
    var over = el('button', 'bm-uitleg__overslaan', 'Overslaan');
    over.type = 'button';
    var volg = el('button', 'bm-uitleg__volgende', 'Volgende');
    volg.type = 'button';
    voet.appendChild(over);
    voet.appendChild(volg);
    box.appendChild(stap);
    box.appendChild(titel);
    box.appendChild(tekst);
    box.appendChild(voet);

    root.appendChild(svg);
    root.appendChild(kader);
    root.appendChild(box);

    // Klik ergens = volgende. De knoppen regelen hun eigen klik.
    root.addEventListener('click', function () { volgende(); });
    over.addEventListener('click', function (e) {
      e.stopPropagation();
      overslaan();
    });
    volg.addEventListener('click', function (e) {
      e.stopPropagation();
      volgende();
    });

    ui = {
      root: root, svg: svg, lijn: lijn, ring: ring, punt: punt, kader: kader, box: box,
      stap: stap, titel: titel, tekst: tekst, overslaan: over, volgende: volg
    };
  }

  // ---------- plek uitrekenen ----------

  // Geeft {punt: {x, y} | null, rect: DOMRect | null} voor de huidige stap.
  function leesDoel(s) {
    var d = null;
    if (s && typeof s.doel === 'function') d = veilig(s.doel, null);
    else if (s && s.doel && typeof s.doel === 'object') d = s.doel;
    if (!d) return { punt: null, rect: null };
    if (typeof d.getBoundingClientRect === 'function') {
      if (!zichtbaar(d)) return { punt: null, rect: null };
      var r = d.getBoundingClientRect();
      var p = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      if (s.anker === 'boven') p.y = r.top;
      else if (s.anker === 'onder') p.y = r.bottom;
      else if (s.anker === 'links') p.x = r.left;
      else if (s.anker === 'rechts') p.x = r.right;
      return { punt: p, rect: r };
    }
    if (typeof d.x === 'number' && typeof d.y === 'number' && isFinite(d.x) && isFinite(d.y)) {
      return { punt: { x: d.x, y: d.y }, rect: null };
    }
    return { punt: null, rect: null };
  }

  var PLEKKEN = {
    rechtsboven: { sx: 1, sy: -1 },
    linksboven: { sx: -1, sy: -1 },
    rechtsonder: { sx: 1, sy: 1 },
    linksonder: { sx: -1, sy: 1 }
  };
  var VOLGORDE = ['rechtsboven', 'linksboven', 'rechtsonder', 'linksonder'];

  // Rekent de plek van de box en het eind van de lijn uit.
  function rekenPlek(p, bw, bh, voorkeur) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    if (!p) {
      return { plek: 'midden', left: Math.round((vw - bw) / 2), top: Math.round((vh - bh) / 2), ax: 0, ay: 0 };
    }
    var px = klem(p.x, 0, vw);
    var py = klem(p.y, 0, vh);
    var namen = VOLGORDE.slice();
    if (voorkeur && PLEKKEN[voorkeur]) {
      namen.splice(namen.indexOf(voorkeur), 1);
      namen.unshift(voorkeur);
    }
    for (var i = 0; i < namen.length; i++) {
      var k = PLEKKEN[namen[i]];
      var ax = px + k.sx * SCHUIN_X;
      var ay = py + k.sy * SCHUIN_Y;
      var left = k.sx > 0 ? ax : ax - bw;
      var top = k.sy > 0 ? ay : ay - bh;
      if (left >= RAND && top >= RAND && left + bw <= vw - RAND && top + bh <= vh - RAND) {
        return { plek: namen[i], left: Math.round(left), top: Math.round(top), ax: ax, ay: ay };
      }
    }
    // Past nergens schuin (smal scherm): box boven of onder het punt, binnen het scherm.
    // Liefst erboven (onder een punt staat zijn naam); past dat niet, dan eronder.
    var boven = py - SCHUIN_Y - bh >= RAND;
    var t = boven ? Math.max(RAND, py - SCHUIN_Y - bh) : Math.min(vh - RAND - bh, py + SCHUIN_Y);
    var l = klem(px - bw / 2, RAND, Math.max(RAND, vw - RAND - bw));
    var opzij = px < vw / 2 ? 30 : -30;
    return {
      plek: boven ? 'boven' : 'onder',
      left: Math.round(l),
      top: Math.round(t),
      ax: klem(px + opzij, l + 18, l + bw - 18),
      ay: boven ? t + bh : t
    };
  }

  function teken() {
    if (!loopt || !ui || index < 0) return;
    var s = stappen[index];
    var d = leesDoel(s);
    var bw = ui.box.offsetWidth;
    var bh = ui.box.offsetHeight;
    var r = rekenPlek(d.punt, bw, bh, s.plek);
    var sleutel = [r.plek, r.left, r.top, Math.round(r.ax), Math.round(r.ay),
      d.punt ? Math.round(d.punt.x) : '', d.punt ? Math.round(d.punt.y) : '',
      d.rect ? Math.round(d.rect.width) + 'x' + Math.round(d.rect.height) : '',
      window.innerWidth, window.innerHeight].join('|');
    if (sleutel === laatste) return;
    laatste = sleutel;

    ui.root.classList.toggle('bm-uitleg--midden', !d.punt);
    ui.box.setAttribute('data-plek', r.plek);
    ui.box.style.left = r.left + 'px';
    ui.box.style.top = r.top + 'px';

    if (d.punt) {
      ui.lijn.setAttribute('x1', d.punt.x);
      ui.lijn.setAttribute('y1', d.punt.y);
      ui.lijn.setAttribute('x2', r.ax);
      ui.lijn.setAttribute('y2', r.ay);
      ui.punt.setAttribute('cx', d.punt.x);
      ui.punt.setAttribute('cy', d.punt.y);
      ui.ring.setAttribute('cx', d.punt.x);
      ui.ring.setAttribute('cy', d.punt.y);
    }
    if (d.rect) {
      ui.kader.hidden = false;
      ui.kader.style.left = Math.round(d.rect.left - 4) + 'px';
      ui.kader.style.top = Math.round(d.rect.top - 4) + 'px';
      ui.kader.style.width = Math.round(d.rect.width + 8) + 'px';
      ui.kader.style.height = Math.round(d.rect.height + 8) + 'px';
    } else {
      ui.kader.hidden = true;
    }
  }

  function lus() {
    raf = 0;
    if (!loopt) return;
    if (!wisselt) veilig(teken, null);
    raf = window.requestAnimationFrame(lus);
  }

  // ---------- stappen ----------

  function vulStap() {
    var s = stappen[index];
    var n = stappen.length;
    ui.root.setAttribute('data-stap', String(index + 1));
    ui.root.setAttribute('data-aantal', String(n));
    ui.stap.textContent = n > 1 ? 'Stap ' + (index + 1) + ' van ' + n : '';
    ui.titel.textContent = s.titel || '';
    ui.titel.hidden = !s.titel;
    ui.tekst.textContent = s.tekst || '';
    ui.volgende.textContent = s.knop || (index === n - 1 ? 'Beginnen' : 'Volgende');
    ui.overslaan.hidden = index === n - 1;
    laatste = '';
  }

  function naarStap(nieuw) {
    if (!loopt || wisselt) return;
    if (nieuw < 0) return;
    if (nieuw >= stappen.length) { eindig('klaar'); return; }
    var oud = stappen[index];
    wisselt = true;
    ui.root.classList.add('is-wissel');
    var uitfade = (index < 0 || minderBeweging()) ? 0 : WISSEL_MS;
    clearTimeout(wisselTimer);
    wisselTimer = setTimeout(function () {
      if (!loopt) return;
      if (oud && typeof oud.na === 'function') veilig(oud.na, null);
      index = nieuw;
      var s = stappen[index];
      var wacht = 0;
      if (typeof s.voor === 'function') {
        veilig(s.voor, null);
        wacht = typeof s.wacht === 'number' ? s.wacht : 280;
      } else if (typeof s.wacht === 'number') {
        wacht = s.wacht;
      }
      wisselTimer = setTimeout(function () {
        if (!loopt) return;
        vulStap();
        wisselt = false;
        veilig(teken, null);
        ui.root.classList.remove('is-wissel');
        // voor() kan de focus naar de app hebben gezet (pop-up, notitieveld): terug naar de box.
        if (!ui.box.contains(document.activeElement)) {
          veilig(function () { ui.box.focus({ preventScroll: true }); }, null);
        }
        if (BM.bus) BM.bus.emit('uitleg:stap', { index: index, aantal: stappen.length });
      }, Math.max(0, wacht));
    }, uitfade);
  }

  function volgende() {
    if (!loopt) return;
    naarStap(index + 1);
  }

  function vorige() {
    if (!loopt || index <= 0) return;
    naarStap(index - 1);
  }

  // ---------- invoer tijdens de uitleg ----------

  // Vangt de toetsen af voordat de app ze ziet (window, capture-fase).
  function onToets(e) {
    if (!loopt) return;
    var k = e.key;
    var opKnop = e.target && e.target.tagName === 'BUTTON' && ui.box.contains(e.target);
    e.stopPropagation();
    if (k === 'Escape') {
      e.preventDefault();
      overslaan();
    } else if (k === 'ArrowRight') {
      e.preventDefault();
      volgende();
    } else if (k === 'ArrowLeft') {
      e.preventDefault();
      vorige();
    } else if (k === 'Enter' || k === ' ' || k === 'Spacebar') {
      // Op een knop in de box doet de knop zelf zijn werk.
      if (opKnop) return;
      e.preventDefault();
      volgende();
    } else if (k === 'Tab') {
      // Focus blijft in de box.
      var knoppen = [ui.overslaan, ui.volgende].filter(function (b) { return !b.hidden; });
      var hier = knoppen.indexOf(document.activeElement);
      var naar = e.shiftKey ? hier - 1 : hier + 1;
      if (naar < 0) naar = knoppen.length - 1;
      if (naar >= knoppen.length) naar = 0;
      e.preventDefault();
      knoppen[naar].focus();
    } else if (!ui.box.contains(e.target) &&
        (k === 'Backspace' || k === 'Delete' || (k && k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey))) {
      // Niet per ongeluk typen in een veld van de app onder de uitleg (bv. het notitieveld).
      e.preventDefault();
    }
  }

  // De pop-up van de app sluit bij een druk ernaast (document, capture). Tijdens de uitleg
  // mag dat niet, dus de druk stopt hier al (window, capture). De klik zelf komt wel door.
  function onDruk(e) {
    if (!loopt) return;
    e.stopPropagation();
  }

  var BLOK = ['pointerdown', 'mousedown', 'touchstart', 'wheel', 'keyup', 'keypress', 'contextmenu', 'dblclick'];

  function luister(aan) {
    var fn = aan ? 'addEventListener' : 'removeEventListener';
    window[fn]('keydown', onToets, true);
    BLOK.forEach(function (soort) { window[fn](soort, onDruk, true); });
  }

  // ---------- start en einde ----------

  function start(lijst, opts) {
    if (loopt) stop();
    var bruikbaar = (Array.isArray(lijst) ? lijst : []).filter(function (s) {
      return s && typeof s === 'object' && (s.titel || s.tekst);
    });
    if (!bruikbaar.length || !document.body) return false;
    bouw();
    stappen = bruikbaar;
    opties = opts || {};
    index = -1;
    loopt = true;
    wisselt = false;
    laatste = '';
    vorigeFocus = document.activeElement;
    ui.root.classList.remove('is-zichtbaar', 'is-weg');
    ui.root.classList.add('is-wissel');
    document.body.appendChild(ui.root);
    luister(true);
    // Een tel later, zodat de CSS de overgang oppakt (een timer loopt ook in een tabblad op de achtergrond).
    setTimeout(function () {
      if (!loopt) return;
      ui.root.classList.add('is-zichtbaar');
      veilig(function () { ui.box.focus({ preventScroll: true }); }, null);
    }, 30);
    if (BM.bus) BM.bus.emit('uitleg:start', { aantal: stappen.length });
    naarStap(0);
    if (!raf) raf = window.requestAnimationFrame(lus);
    return true;
  }

  function eindig(reden) {
    if (!loopt) return;
    var s = stappen[index];
    loopt = false;
    wisselt = false;
    clearTimeout(wisselTimer);
    if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    luister(false);
    if (s && typeof s.na === 'function') veilig(s.na, null);
    var root = ui.root;
    root.classList.remove('is-zichtbaar');
    root.classList.add('is-weg');
    setTimeout(function () {
      // Alleen weghalen als er intussen geen nieuwe uitleg is gestart.
      if (!loopt && root.parentNode) root.parentNode.removeChild(root);
    }, minderBeweging() ? 0 : 260);
    var terug = vorigeFocus;
    vorigeFocus = null;
    veilig(function () { if (terug && terug.focus && document.contains(terug)) terug.focus({ preventScroll: true }); }, null);
    var klaar = opties && opties.klaar;
    opties = null;
    index = -1;
    stappen = [];
    if (BM.bus) BM.bus.emit('uitleg:klaar', { reden: reden });
    if (typeof klaar === 'function') veilig(function () { klaar(reden); }, null);
  }

  function overslaan() { eindig('overgeslagen'); }

  function stop() { eindig('gestopt'); }

  BM.uitleg = {
    start: start,
    volgende: volgende,
    vorige: vorige,
    overslaan: overslaan,
    stop: stop,
    actief: function () { return loopt; },
    doelen: doelen,
    acties: acties
  };
})();
