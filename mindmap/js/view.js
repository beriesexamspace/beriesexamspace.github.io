(function(){
  var BM = window.BM = window.BM || {};

  // Weergave-paneel linksonder: hier stel je de afstand tussen de punten in.
  // De afstand geldt per project en wordt meteen (vloeiend) toegepast.

  var STEP = 5;          // schuif in stappen van 5%
  var DEFAULT = 100;

  var root = null, trigger = null, panel = null, range = null, output = null, resetBtn = null;
  var badge = null;
  var FIT_WAIT_MAX = 1600; // na een afstandswissel hooguit zo lang wachten op stilstand
  var isOpen = false;
  var inited = false;

  var ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function pid() {
    try { return BM.store.currentId(); } catch (e) { return null; }
  }

  function percentNow() {
    var v = 1;
    try { v = BM.store.getSpacing(pid()); } catch (e) { v = 1; }
    return Math.round(v * 100);
  }

  function minPct() { return Math.round(((BM.store && BM.store.SPACING_MIN) || 0.5) * 100); }
  function maxPct() { return Math.round(((BM.store && BM.store.SPACING_MAX) || 3) * 100); }

  function describe(p) {
    if (p < 80) return 'Dichtbij';
    if (p <= 120) return 'Normaal';
    if (p <= 180) return 'Ruim';
    return 'Heel ruim';
  }

  // Schuif, getal en de gevulde kleur van de schuif bijwerken.
  function sync(p) {
    if (!range) return;
    if (p == null) p = percentNow();
    if (String(range.value) !== String(p)) range.value = String(p);
    output.textContent = p + '%';
    output.title = describe(p);
    var lo = minPct(), hi = maxPct();
    var fill = hi > lo ? (p - lo) / (hi - lo) * 100 : 0;
    range.style.setProperty('--fill', fill.toFixed(2) + '%');
    range.setAttribute('aria-valuetext', p + ' procent, ' + describe(p).toLowerCase());
    resetBtn.disabled = p === DEFAULT;
    syncTrigger(p);
    syncModus();
  }

  // Knop: "Afstand", met het percentage als klein label als het niet 100% is.
  function syncTrigger(p) {
    if (!trigger) return;
    var off = p !== DEFAULT;
    badge.textContent = p + '%';
    badge.hidden = !off;
    var t = 'Afstand tussen punten' + (off ? ': ' + p + '%' : '');
    trigger.title = t;
    trigger.setAttribute('aria-label', t);
  }

  // ---------- meeschuivende camera ----------
  // Stond alles in beeld voor je de afstand veranderde, en valt er daarna iets
  // buiten beeld, dan schuift de camera vanzelf mee (zodra de punten stilstaan).
  var fitWatch = null;

  function allInView(margin) {
    try {
      var p = BM.store.getProject(pid());
      var vp = BM.camera.getViewport();
      if (!p || !p.nodes || !vp) return true;
      for (var id in p.nodes) {
        var n = p.nodes[id];
        if (!n || typeof n.x !== 'number') continue;
        var s = BM.camera.worldToScreen(n.x, n.y);
        if (s.x < margin || s.y < margin || s.x > vp.w - margin || s.y > vp.h - margin) return false;
      }
    } catch (e) { return true; }
    return true;
  }

  function camKey() {
    try { var c = BM.camera.get(); return c.panX.toFixed(1) + ',' + c.panY.toFixed(1) + ',' + c.zoom.toFixed(4); }
    catch (e) { return ''; }
  }

  function onSpacingChanged() {
    var id = pid();
    if (!id || !BM.camera || !BM.layout) return;
    var t = Date.now();
    if (!fitWatch || fitWatch.pid !== id) {
      if (fitWatch) clearInterval(fitWatch.timer);
      fitWatch = { pid: id, wasInView: allInView(0), cam: camKey(), last: t, timer: 0 };
      fitWatch.timer = setInterval(checkFit, 200);
    }
    fitWatch.last = t;
  }

  function checkFit() {
    var w = fitWatch;
    if (!w) return;
    var stopWatch = function () { clearInterval(w.timer); if (fitWatch === w) fitWatch = null; };
    if (w.pid !== pid() || camKey() !== w.cam) { stopWatch(); return; } // zelf bewogen: niet ingrijpen
    var waited = Date.now() - w.last;
    var moving = false;
    try { moving = BM.layout.isActive(w.pid); } catch (e) { moving = false; }
    if (waited < 250 || (moving && waited < FIT_WAIT_MAX)) return;
    stopWatch();
    if (w.wasInView && !allInView(4)) {
      try { BM.camera.fit({ ms: 600 }); } catch (e) { /* best effort */ }
    }
  }

  function apply(p) {
    var id = pid();
    if (!id || !BM.store || !BM.store.setSpacing) return;
    BM.store.setSpacing(id, p / 100);
    sync(p);
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    sync();
    root.classList.add('bm-view--open');
    trigger.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    panel.inert = false;
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove('bm-view--open');
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    try { if (BM.store && BM.store.save) BM.store.save(); } catch (e) { /* best effort */ }
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  function build() {
    root = el('div', 'bm-view');

    panel = el('div', 'bm-view__panel');
    panel.id = 'bm-view-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Weergave');
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;

    panel.appendChild(el('div', 'bm-view__head', 'Weergave'));

    var field = el('div', 'bm-view__field');
    var labelRow = el('div', 'bm-view__labelrow');
    var label = el('label', 'bm-view__label', 'Afstand tussen punten');
    label.setAttribute('for', 'bm-spacing');
    output = el('output', 'bm-view__value', '100%');
    output.setAttribute('for', 'bm-spacing');
    labelRow.appendChild(label);
    labelRow.appendChild(output);

    range = el('input', 'bm-range');
    range.type = 'range';
    range.id = 'bm-spacing';
    range.min = String(minPct());
    range.max = String(maxPct());
    range.step = String(STEP);
    range.value = String(DEFAULT);

    var scale = el('div', 'bm-view__scale');
    scale.appendChild(el('span', '', 'Dichtbij'));
    scale.appendChild(el('span', '', 'Ver uit elkaar'));

    field.appendChild(labelRow);
    field.appendChild(range);
    field.appendChild(scale);
    panel.appendChild(field);

    var actions = el('div', 'bm-view__actions');
    resetBtn = el('button', 'bm-btn bm-btn--small', 'Standaard');
    resetBtn.type = 'button';
    resetBtn.title = 'Terug naar 100%';
    var fitBtn = el('button', 'bm-btn bm-btn--small', 'Alles in beeld');
    fitBtn.type = 'button';
    fitBtn.title = 'Alles in beeld zetten (F)';
    actions.appendChild(resetBtn);
    actions.appendChild(fitBtn);
    panel.appendChild(actions);

    panel.appendChild(el('p', 'bm-hint bm-view__hint',
      'Geldt voor dit project. Punten met veel branches krijgen vanzelf meer ruimte.'));

    trigger = el('button', 'bm-btn bm-view__trigger');
    trigger.type = 'button';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'bm-view-panel');
    trigger.title = 'Afstand tussen punten';
    trigger.setAttribute('aria-label', 'Afstand tussen punten');
    trigger.innerHTML = ICON;
    trigger.appendChild(el('span', 'bm-btn__label', 'Afstand'));
    badge = el('span', 'bm-view__badge', '100%');
    badge.setAttribute('aria-hidden', 'true');
    badge.hidden = true;
    trigger.appendChild(badge);

    root.appendChild(panel);
    var rij = el('div', 'bm-view__rij');
    rij.appendChild(trigger);
    rij.appendChild(maakOog());
    if (BM.modus) rij.appendChild(maakModus()); // zonder modus.js geen segmentknop
    if (BM.modus) rij.appendChild(maakRichting());
    root.appendChild(rij);
    document.body.appendChild(root);

    // Events
    trigger.addEventListener('click', toggle);
    range.addEventListener('input', function () { apply(+range.value); });
    range.addEventListener('change', function () {
      try { if (BM.store && BM.store.save) BM.store.save(); } catch (e) { /* best effort */ }
    });
    resetBtn.addEventListener('click', function () { apply(DEFAULT); });
    fitBtn.addEventListener('click', function () {
      if (BM.camera && typeof BM.camera.fit === 'function') BM.camera.fit();
    });

    // Klikken, wiel en toetsen in het paneel niet doorgeven aan het canvas en de sneltoetsen.
    ['pointerdown', 'mousedown', 'touchstart', 'wheel', 'dblclick'].forEach(function (name) {
      root.addEventListener(name, function (e) { e.stopPropagation(); }, name === 'wheel' || name === 'touchstart' ? { passive: true } : false);
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
        trigger.focus({ preventScroll: true });
      }
      e.stopPropagation();
    });
    document.addEventListener('pointerdown', function (e) {
      if (isOpen && !root.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  // ---- Oogje: alle namen weg of terug (zoals F1 in een game) ----
  var OOG_AAN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var OOG_UIT = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M2 12s3.6-7 10-7c1.6 0 3 .4 4.3 1M22 12s-3.6 7-10 7c-1.6 0-3-.4-4.3-1"/>' +
    '<path d="M9.9 14.1a3 3 0 0 1 4.2-4.2"/><path d="M3 3l18 18"/></svg>';
  var oog = null;
  var namenZichtbaar = true;

  function leesNamen() {
    try { return localStorage.getItem('bm-namen') !== 'uit'; } catch (e) { return true; }
  }
  function bewaarNamen(aan) {
    try { localStorage.setItem('bm-namen', aan ? 'aan' : 'uit'); } catch (e) { /* niet erg */ }
  }
  function toonNamen(aan, bewaar) {
    namenZichtbaar = !!aan;
    if (BM.render && typeof BM.render.namen === 'function') BM.render.namen(namenZichtbaar);
    if (oog) {
      oog.innerHTML = namenZichtbaar ? OOG_AAN : OOG_UIT;
      var t = namenZichtbaar ? 'Namen verbergen (F1)' : 'Namen tonen (F1)';
      oog.title = t;
      oog.setAttribute('aria-label', t);
      oog.setAttribute('aria-pressed', namenZichtbaar ? 'false' : 'true');
      oog.classList.toggle('bm-view__oog--uit', !namenZichtbaar);
    }
    if (bewaar) bewaarNamen(namenZichtbaar);
  }
  function maakOog() {
    oog = el('button', 'bm-btn bm-view__oog');
    oog.type = 'button';
    oog.addEventListener('click', function () {
      toonNamen(!namenZichtbaar, true);
      oog.classList.remove('bm-view__oog--tik');
      void oog.offsetWidth;
      oog.classList.add('bm-view__oog--tik');
    });
    toonNamen(leesNamen(), false);
    return oog;
  }
  function typt(t) {
    return !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'F1' || e.ctrlKey || e.metaKey || e.altKey || typt(e.target)) return;
    if (!oog || !document.body.contains(oog)) return;
    e.preventDefault();
    oog.click();
  });

  // ---- Weergave-segment: Follow / Diagram (rechts naast het oogje) ----
  var MODI = [
    { m: 'follow', label: 'Follow', title: 'Follow: punten volgen elkaar',
      icon: '<circle cx="5" cy="12" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="19" cy="18" r="2.2"/>' +
        '<path d="M7 11l10-4M7 13l10 4"/>' },
    { m: 'diagram', label: 'Diagram', title: 'Diagram: alles in rechte lijnen',
      icon: '<rect x="2.5" y="9.5" width="4.5" height="5" rx="1"/><rect x="15" y="3.5" width="6.5" height="5" rx="1"/>' +
        '<rect x="15" y="15.5" width="6.5" height="5" rx="1"/><path d="M7 12h2.5M9.5 6v12M9.5 6H15M9.5 18H15"/>' }
  ];
  var MODUS_CSS = [
    '.bm-modus{position:relative;display:inline-flex;align-items:stretch;box-sizing:border-box;min-height:38px;padding:3px;',
    'border-radius:var(--bm-radius);background:var(--bm-panel);backdrop-filter:blur(16px) saturate(140%);',
    '-webkit-backdrop-filter:blur(16px) saturate(140%);box-shadow:var(--bm-shadow-soft);}',
    '.bm-modus__thumb{position:absolute;top:3px;bottom:3px;left:0;width:0;z-index:0;pointer-events:none;',
    'border-radius:9px;background:rgba(var(--bm-accent-rgb),0.22);box-shadow:inset 0 0 0 1px rgba(var(--bm-accent-rgb),0.45);',
    'transition:left 260ms var(--bm-ease),width 260ms var(--bm-ease);}',
    '.bm-modus__opt{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;',
    'min-height:32px;margin:0;padding:0 10px;border:0;border-radius:9px;background:transparent;color:var(--bm-text-dim);',
    'font:inherit;font-size:12px;line-height:1;white-space:nowrap;cursor:pointer;-webkit-tap-highlight-color:transparent;',
    'transition:color 200ms var(--bm-ease),transform 160ms var(--bm-ease);}',
    '.bm-modus__opt:hover{color:var(--bm-text);}',
    '.bm-modus__opt:active{transform:scale(0.94);}',
    '.bm-modus__opt[aria-checked="true"]{color:var(--bm-text);}',
    '.bm-modus__opt:focus-visible{outline:2px solid rgba(var(--bm-accent-rgb),0.7);outline-offset:1px;}',
    '.bm-modus__opt svg{flex:none;}',
    '.bm-modus__opt--tik svg{animation:bm-modus-tik 260ms var(--bm-ease);}',
    '@keyframes bm-modus-tik{0%{transform:scale(0.7);opacity:0.4;}100%{transform:scale(1);opacity:1;}}',
    '@media (max-width:640px){.bm-modus__label{display:none;}.bm-modus__opt{padding:0 9px;}}',
    '@media (prefers-reduced-motion:reduce){.bm-modus__thumb{transition:none;}',
    '.bm-modus__opt,.bm-modus__opt:active{transition:none;transform:none;}.bm-modus__opt--tik svg{animation:none;}}'
  ].join('');

  var modusEl = null, modusThumb = null, modusOpts = [], thumbKlaar = false;

  function stijlModus() {
    try {
      if (document.getElementById('bm-modus-stijl')) return;
      var s = document.createElement('style');
      s.id = 'bm-modus-stijl';
      s.textContent = MODUS_CSS;
      document.head.appendChild(s);
    } catch (e) { /* zonder stijl blijft de knop werken */ }
  }

  // Knop om de diagram-modus horizontaal of verticaal te zetten. Alleen zichtbaar in diagram.
  var richtingEl = null;
  var VOLGENDE_RICHTING = { horizontaal: 'verticaal', verticaal: 'plat', plat: 'horizontaal' };
  var RICHTING_NAAM = { horizontaal: 'Horizontaal', verticaal: 'Verticaal', plat: 'Plat' };
  var richtingBtn = null;

  function maakRichting() {
    richtingEl = el('div', 'bm-modus bm-richting');
    richtingEl.style.display = 'none';
    richtingBtn = el('button', 'bm-modus__opt');
    richtingBtn.type = 'button';
    richtingBtn.addEventListener('click', function () {
      var pid = null;
      try { pid = BM.store.currentId(); } catch (e) { pid = null; }
      if (!pid || !BM.store.getRichting) return;
      var nu = BM.store.getRichting(pid);
      BM.store.setRichting(pid, VOLGENDE_RICHTING[nu] || 'verticaal');
      syncRichting();
    });
    richtingEl.appendChild(richtingBtn);
    return richtingEl;
  }

  function syncRichting() {
    if (!richtingEl || !richtingBtn) return;
    var pid = null;
    try { pid = BM.store.currentId(); } catch (e) { pid = null; }
    var diagram = modusHuidig() === 'diagram';
    richtingEl.style.display = diagram ? '' : 'none';
    if (!diagram || !pid || !BM.store.getRichting) return;
    var nu = BM.store.getRichting(pid);
    var volgende = RICHTING_NAAM[VOLGENDE_RICHTING[nu]] || 'Verticaal';
    richtingBtn.textContent = volgende;
    richtingBtn.title = 'Zet de diagram-weergave ' + volgende.toLowerCase();
    richtingBtn.setAttribute('aria-label', 'Diagram ' + volgende.toLowerCase());
  }

  function modusHuidig() {
    try { return BM.modus.get() || 'follow'; } catch (e) { return 'follow'; }
  }

  function modusIndex(m) {
    for (var i = 0; i < MODI.length; i++) if (MODI[i].m === m) return i;
    return 0;
  }

  // Schuivend blokje onder de actieve optie. Zonder animatie als het de eerste keer is of bij resize.
  function plaatsThumb(zonderAnimatie) {
    if (!modusThumb || !modusOpts.length) return;
    var actief = modusOpts[modusIndex(modusHuidig())];
    if (!actief) return;
    var zonder = zonderAnimatie || !thumbKlaar;
    if (zonder) modusThumb.style.transition = 'none';
    modusThumb.style.left = actief.offsetLeft + 'px';
    modusThumb.style.width = actief.offsetWidth + 'px';
    if (zonder) {
      void modusThumb.offsetWidth;
      modusThumb.style.transition = '';
    }
    if (actief.offsetWidth) thumbKlaar = true;
  }

  // Aria-checked, tabindex en blokje bijwerken naar de modus van het huidige project.
  function syncModus() {
    if (!modusEl) return;
    var m = modusHuidig();
    for (var i = 0; i < modusOpts.length; i++) {
      var aan = MODI[i].m === m;
      modusOpts[i].setAttribute('aria-checked', aan ? 'true' : 'false');
      modusOpts[i].tabIndex = aan ? 0 : -1;
    }
    plaatsThumb(false);
    syncRichting();
  }

  function tikKnop(btn) {
    btn.classList.remove('bm-modus__opt--tik');
    void btn.offsetWidth;
    btn.classList.add('bm-modus__opt--tik');
  }

  function kiesModus(m) {
    try { if (BM.modus && BM.modus.set) BM.modus.set(m); } catch (e) { /* best effort */ }
    syncModus();
  }

  function maakModus() {
    // Stijl staat in css/app.css (bm-modus).
    modusEl = el('div', 'bm-modus');
    modusEl.setAttribute('role', 'radiogroup');
    modusEl.setAttribute('aria-label', 'Weergave');

    modusThumb = el('span', 'bm-modus__thumb');
    modusThumb.setAttribute('aria-hidden', 'true');
    modusEl.appendChild(modusThumb);

    modusOpts = [];
    for (var i = 0; i < MODI.length; i++) {
      (function (info) {
        var b = el('button', 'bm-modus__opt');
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('data-modus', info.m);
        b.setAttribute('aria-checked', 'false');
        b.setAttribute('aria-label', info.label);
        b.title = info.title;
        b.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" ' +
          'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + info.icon + '</svg>';
        b.appendChild(el('span', 'bm-modus__label', info.label));
        b.addEventListener('click', function () {
          tikKnop(b);
          kiesModus(info.m);
        });
        modusEl.appendChild(b);
        modusOpts.push(b);
      })(MODI[i]);
    }

    // Pijltjes (links/rechts, omhoog/omlaag) verplaatsen de keuze; Home en End gaan naar het begin en eind.
    modusEl.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k !== 'ArrowLeft' && k !== 'ArrowRight' && k !== 'ArrowUp' && k !== 'ArrowDown' && k !== 'Home' && k !== 'End') return;
      e.preventDefault();
      var huidig = modusOpts.indexOf(e.target);
      if (huidig < 0) huidig = modusIndex(modusHuidig());
      var n = huidig;
      var aantal = MODI.length;
      if (k === 'ArrowLeft' || k === 'ArrowUp') n = (huidig - 1 + aantal) % aantal;
      else if (k === 'ArrowRight' || k === 'ArrowDown') n = (huidig + 1) % aantal;
      else if (k === 'Home') n = 0;
      else n = aantal - 1;
      kiesModus(MODI[n].m);
      modusOpts[n].focus({ preventScroll: true });
      tikKnop(modusOpts[n]);
    });

    syncModus();
    return modusEl;
  }

  function init() {
    if (inited) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    inited = true;
    build();
    if (BM.bus) {
      BM.bus.on('project:switched', function () { sync(); });
      BM.bus.on('project:spacing', function (d) {
        if (!d || d.projectId === pid()) { sync(); onSpacingChanged(); }
      });
      BM.bus.on('store:changed', function () { if (isOpen) sync(); syncModus(); });
      BM.bus.on('project:modus', function () { syncModus(); });
      BM.bus.on('project:richting', function () { syncRichting(); });
      BM.bus.on('project:switched', function () { syncModus(); });
    }
    window.addEventListener('resize', function () { plaatsThumb(true); });
    window.addEventListener('load', function () { plaatsThumb(true); });
    try {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { plaatsThumb(true); });
    } catch (e) { /* best effort */ }
    sync();
  }

  BM.view = {
    init: init,
    open: open,
    close: close,
    toggle: toggle,
    isOpen: function () { return isOpen; }
  };
})();
