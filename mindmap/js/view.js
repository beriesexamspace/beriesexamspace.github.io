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
      BM.bus.on('store:changed', function () { if (isOpen) sync(); });
    }
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
