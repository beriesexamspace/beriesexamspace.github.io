(function(){
  var BM = window.BM = window.BM || {};

  // ---- instellingen ----
  var DRAG_PX = 5;         // vanaf dit aantal px is het een sleep, niet een klik
  var DBL_MS = 300;        // max tijd tussen twee klikken voor een dubbelklik (Windows-standaard)
  var DBL_PX = 28;         // max afstand tussen twee klikken voor een dubbelklik
  var ZOOM_SPEED = 0.0016; // gevoeligheid van het muiswiel
  var FACTOR_MIN = 0.5;
  var FACTOR_MAX = 2;

  // ---- state ----
  var canvas = null;
  var pointers = {};       // pointerId -> {id, x, y} (canvas-lokale coords)
  var mode = 'idle';       // idle | pending | node | pan | pinch | ignore
  var primaryId = null;    // pointerId van de enkele-vinger gesture
  var downNodeId = null;   // punt onder de pointer bij pointerdown
  var dragNodeId = null;   // punt dat nu gesleept wordt
  var dragOff = { x: 0, y: 0 };
  var dragTak = [];        // alles onder het gesleepte punt
  var dragVerplaatst = false; // is het punt echt verschoven
  var dragRoot = false;    // het hoofdpunt wordt gesleept
  var lastX = 0, lastY = 0;
  var downX = 0, downY = 0;
  var pinch = null;        // {dist, mx, my}
  var lastTap = null;      // {nodeId, t, x, y}
  var hoverId = null;
  var hoverPending = null;
  var hoverRaf = 0;
  var warned = {};

  // ---- hulpfuncties ----
  function warnOnce(key, msg) {
    if (warned[key]) return;
    warned[key] = true;
    try { console.warn('[BM.input] ' + msg); } catch (e) {}
  }

  function callFirst(obj, names, args, fallback) {
    for (var i = 0; i < names.length; i++) {
      if (obj && typeof obj[names[i]] === 'function') {
        return obj[names[i]].apply(obj, args);
      }
    }
    warnOnce(names[0], 'functie ontbreekt: ' + names[0]);
    return fallback;
  }

  function toWorld(sx, sy) {
    return callFirst(BM.camera, ['screenToWorld'], [sx, sy], { x: sx, y: sy });
  }
  function pan(dx, dy) {
    if (dx || dy) callFirst(BM.camera, ['pan'], [dx, dy]);
  }
  function zoomAt(sx, sy, factor) {
    factor = Math.max(FACTOR_MIN, Math.min(FACTOR_MAX, factor));
    if (factor && factor !== 1) callFirst(BM.camera, ['zoomAt'], [sx, sy, factor]);
  }
  // sx, sy zijn client-coordinaten (e.clientX/Y); render.hitTest rekent zelf om naar het canvas.
  function hit(sx, sy) {
    try {
      if (BM.render && typeof BM.render.hitTest === 'function') {
        return BM.render.hitTest(sx, sy) || null;
      }
    } catch (e) {}
    return null;
  }
  function getNode(id) {
    try {
      return (BM.store && BM.store.getNode(id)) || null;
    } catch (e) {
      return null;
    }
  }
  function saveStore() {
    try { if (BM.store) BM.store.save(); } catch (e) {}
  }
  function dist(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function isTyping(t) {
    return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' ||
      t.tagName === 'SELECT' || t.isContentEditable === true);
  }
  function localXY(e) {
    var r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function setCursor(c) {
    if (canvas && canvas.style.cursor !== c) canvas.style.cursor = c;
  }
  // In diagram-modus staan de punten vast in de boom: niet slepen (achtergrond schuiven kan wel).
  function isDiagram() {
    try {
      return !!(BM.modus && typeof BM.modus.get === 'function' && BM.modus.get() === 'diagram');
    } catch (e) {
      return false;
    }
  }

  // ---- punt verplaatsen ----
  function startNodeDrag(id, p) {
    var n = getNode(id);
    if (!n) return false;
    // Geeft false terug: de aanroeper valt dan terug op pannen (zoals bij de achtergrond).
    if (isDiagram()) return false;
    var w = toWorld(p.x, p.y);
    // Lopende modus-overgang eerst afmaken, zodat het punt niet springt.
    try { if (BM.modus && BM.modus.finishNow) BM.modus.finishNow(); } catch (e) { /* negeren */ }
    dragNodeId = id;
    if (BM.camera && typeof BM.camera.stop === 'function') BM.camera.stop();
    dragOff.x = (n.x || 0) - w.x;
    dragOff.y = (n.y || 0) - w.y;
    // Alles wat onder dit punt hangt, schuift mee (geen uitgerekte lijnen).
    dragTak = [];
    dragRoot = !n.parentId;
    // Het hoofdpunt sleept alleen zichzelf (anders schuift de hele mindmap mee).
    var stapel = dragRoot ? [] : (n.children || []).slice();
    while (stapel.length) {
      var kid = getNode(stapel.pop());
      if (!kid) continue;
      dragTak.push(kid);
      if (kid.children) stapel.push.apply(stapel, kid.children);
    }
    mode = 'node';
    clearTap();
    callFirst(BM.layout, ['pin'], [id]);
    setCursor('grabbing');
    return true;
  }

  function moveNode(p) {
    var n = getNode(dragNodeId);
    if (!n) {
      // punt is verdwenen tijdens het slepen
      releaseDrag();
      mode = 'ignore';
      return;
    }
    var w = toWorld(p.x, p.y);
    var nx = w.x + dragOff.x;
    var ny = w.y + dragOff.y;
    var dx = nx - (n.x || 0);
    var dy = ny - (n.y || 0);
    n.x = nx;
    n.y = ny;
    n.vx = 0;
    n.vy = 0;
    if (dx || dy) dragVerplaatst = true;
    for (var i = 0; i < dragTak.length; i++) {
      var k = dragTak[i];
      k.x = (k.x || 0) + dx;
      k.y = (k.y || 0) + dy;
      k.vx = 0;
      k.vy = 0;
    }
  }

  function releaseDrag() {
    if (!dragNodeId) return;
    var id = dragNodeId;
    // Ids van punt + tak verzamelen voordat de tak leeg gaat.
    var ids = [id];
    for (var i = 0; i < dragTak.length; i++) ids.push(dragTak[i].id);
    var verplaatst = dragVerplaatst;
    dragNodeId = null;
    dragTak = [];
    dragVerplaatst = false;
    callFirst(BM.layout, ['unpin'], [id]);
    // Geen node.vast meer: de modus bepaalt wat er met de nieuwe plek gebeurt
    // (freeze bewaart hem, diagram glijdt terug naar de boom).
    if (verplaatst) {
      try {
        if (BM.modus && typeof BM.modus.afterDrag === 'function') BM.modus.afterDrag(ids);
      } catch (e) {}
    }
    saveStore();
  }

  // ---- dubbelklik detectie (muis en touch) ----
  /* Eén klik = menu (Add branch enz.), dubbelklik = lezen. De enkele klik wacht heel kort
     of er een tweede klik komt, zodat een dubbelklik niet eerst het menu opent. */
  var tapTimer = null;
  function clearTap() { lastTap = null; clearTimeout(tapTimer); tapTimer = null; }
  function registerTap(id, p, e) {
    var now = Date.now();
    if (lastTap && lastTap.nodeId === id &&
        now - lastTap.t < DBL_MS &&
        dist(p, lastTap) < DBL_PX) {
      clearTap();
      emitDbl(id, e.clientX, e.clientY);
    } else {
      clearTap();
      lastTap = { nodeId: id, t: now, x: p.x, y: p.y };
      var cx = e.clientX, cy = e.clientY;
      tapTimer = setTimeout(function () {
        tapTimer = null; lastTap = null;
        if (BM.bus) BM.bus.emit('node:click', { nodeId: id, screenX: cx, screenY: cy });
      }, DBL_MS);
    }
  }

  var lastDblT = 0;
  function emitDbl(id, cx, cy) {
    lastDblT = Date.now();
    if (BM.bus) {
      BM.bus.emit('node:dblclick', { nodeId: id, screenX: cx, screenY: cy });
    }
  }

  // Vangnet: de eigen dubbelklik-instelling van het systeem (bijv. een tragere
  // instelling dan 500 ms). Gaat niet af als de eigen detectie net al een pop-up opende.
  function onNativeDbl(e) {
    if (Date.now() - lastDblT < 800) return;
    clearTap();
    if (mode !== 'idle') return;
    var id = hit(e.clientX, e.clientY);
    if (id) emitDbl(id, e.clientX, e.clientY);
  }

  // ---- pinch ----
  function startPinch() {
    var ids = Object.keys(pointers);
    var a = pointers[ids[0]], b = pointers[ids[1]];
    pinch = {
      dist: Math.max(1, dist(a, b)),
      mx: (a.x + b.x) / 2,
      my: (a.y + b.y) / 2
    };
  }

  function updatePinch() {
    var ids = Object.keys(pointers);
    if (ids.length < 2 || !pinch) return;
    var a = pointers[ids[0]], b = pointers[ids[1]];
    var d = Math.max(1, dist(a, b));
    var mx = (a.x + b.x) / 2;
    var my = (a.y + b.y) / 2;
    zoomAt(mx, my, d / pinch.dist);
    pan(mx - pinch.mx, my - pinch.my);
    pinch = { dist: d, mx: mx, my: my };
  }

  // ---- pointer events ----
  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (isTyping(document.activeElement)) {
      try { document.activeElement.blur(); } catch (err) {}
    }
    e.preventDefault();
    var p = localXY(e);
    var count = Object.keys(pointers).length;
    if (count >= 2) return; // meer dan twee vingers negeren

    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    pointers[e.pointerId] = { id: e.pointerId, x: p.x, y: p.y };

    if (count === 0) {
      primaryId = e.pointerId;
      lastX = downX = p.x;
      lastY = downY = p.y;
      downNodeId = hit(e.clientX, e.clientY);
      if (downNodeId) {
        mode = 'pending';
        setCursor('pointer');
      } else {
        mode = 'pan';
        clearTap();
        setCursor('grabbing');
      }
    } else {
      // tweede vinger: slepen van een punt stoppen, over op pinch
      releaseDrag();
      mode = 'pinch';
      clearTap();
      startPinch();
      setCursor('grabbing');
    }
  }

  function onPointerMove(e) {
    var p = localXY(e);
    var ptr = pointers[e.pointerId];

    if (!ptr) {
      if (e.pointerType === 'mouse' && e.buttons === 0) scheduleHover({ x: e.clientX, y: e.clientY });
      return;
    }
    ptr.x = p.x;
    ptr.y = p.y;

    if (mode === 'pinch') {
      updatePinch();
      return;
    }
    if (e.pointerId !== primaryId) return;

    if (mode === 'pending') {
      if (Math.hypot(p.x - downX, p.y - downY) < DRAG_PX) return;
      if (!(downNodeId && startNodeDrag(downNodeId, { x: downX, y: downY }))) {
        mode = 'pan';
        lastX = downX;
        lastY = downY;
        setCursor('grabbing');
      }
    }

    if (mode === 'pan') {
      pan(p.x - lastX, p.y - lastY);
    } else if (mode === 'node') {
      moveNode(p);
    }
    lastX = p.x;
    lastY = p.y;
  }

  function onPointerUp(e, cancelled) {
    var ptr = pointers[e.pointerId];
    if (!ptr) return;
    var p = localXY(e);
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    delete pointers[e.pointerId];
    var rest = Object.keys(pointers);

    if (mode === 'pinch') {
      if (rest.length === 1) {
        // een vinger over: verder pannen vanaf de positie van die vinger
        var r = pointers[rest[0]];
        primaryId = r.id;
        lastX = r.x;
        lastY = r.y;
        mode = 'pan';
        setCursor('grabbing');
      } else {
        primaryId = null;
        mode = 'idle';
        setCursor('grab');
      }
      pinch = null;
      return;
    }

    if (e.pointerId !== primaryId) return;

    var wasNode = mode === 'node';
    var isTap = mode === 'pending' && !cancelled && !!downNodeId;

    if (wasNode) releaseDrag();
    if (isTap) registerTap(downNodeId, p, e);

    primaryId = null;
    downNodeId = null;
    mode = 'idle';
    setCursor('grab');
  }

  function onPointerCancel(e) { onPointerUp(e, true); }
  function onLostCapture(e) { onPointerUp(e, true); }

  function onPointerLeave() {
    if (Object.keys(pointers).length === 0) {
      hoverId = null;
    }
  }

  // ---- hover (gecoalesceerd per frame) ----
  function scheduleHover(p) {
    hoverPending = p;
    if (hoverRaf) return;
    hoverRaf = requestAnimationFrame(function () {
      hoverRaf = 0;
      var q = hoverPending;
      if (!q) return;
      // De render-lus houdt de hover al bij; geen tweede treffer-test nodig.
      hoverId = (BM.render && typeof BM.render.getHoverId === 'function')
        ? BM.render.getHoverId() : hit(q.x, q.y);
      if (mode === 'idle') setCursor(hoverId ? 'pointer' : 'grab');
    });
  }

  // ---- wiel = zoom rond de cursor ----
  function onWheel(e) {
    e.preventDefault();
    var p = localXY(e);
    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;
    else if (e.deltaMode === 2) dy *= 800;
    zoomAt(p.x, p.y, Math.exp(-dy * ZOOM_SPEED));
  }

  // ---- sneltoetsen ----
  function closeIfOpen(comp) {
    if (!comp || typeof comp.close !== 'function') return;
    try {
      if (typeof comp.isOpen === 'function' && !comp.isOpen()) return;
      comp.close();
    } catch (e) {}
  }

  function onKeyDown(e) {
    var t = e.target;
    if (e.key === 'Escape' || e.key === 'Esc') {
      // binnen de pop-up (bijv. rename-veld) regelt de pop-up Esc zelf
      if (isTyping(t) && t.closest && t.closest('.bm-popup')) return;
      closeIfOpen(BM.popup);
      closeIfOpen(BM.editor);
      return;
    }
    if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey && !isTyping(t)) {
      if (BM.camera && typeof BM.camera.fit === 'function') {
        e.preventDefault();
        BM.camera.fit();
      }
    }
  }

  // ---- gesture annuleren (bijv. bij wisselen van project) ----
  function cancelGesture() {
    releaseDrag();
    pointers = {};
    primaryId = null;
    downNodeId = null;
    pinch = null;
    clearTap();
    mode = 'idle';
    setCursor('grab');
  }

  // ---- koppelen aan het canvas ----
  function detach() {
    if (!canvas) return;
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerCancel);
    canvas.removeEventListener('lostpointercapture', onLostCapture);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('dblclick', onNativeDbl);
    cancelGesture();
    canvas = null;
  }

  function attach(el) {
    if (!el || el === canvas) return;
    detach();
    canvas = el;
    canvas.style.touchAction = 'none';
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';
    canvas.style.webkitTouchCallout = 'none';
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);
    canvas.addEventListener('lostpointercapture', onLostCapture);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('dblclick', onNativeDbl);
  }

  function findCanvas() {
    return (BM.render && BM.render.canvas) ||
      document.querySelector('canvas.bm-canvas') ||
      document.querySelector('canvas');
  }

  function autoAttach() {
    var el = findCanvas();
    if (el) attach(el);
  }

  // ---- init ----
  window.addEventListener('keydown', onKeyDown);
  if (BM.bus) BM.bus.on('project:switched', cancelGesture);
  autoAttach();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoAttach);
  }
  window.addEventListener('load', autoAttach);

  BM.input = {
    attach: attach,
    detach: detach,
    cancel: cancelGesture,
    hoverId: function () { return hoverId; },
    isDragging: function () { return mode === 'node'; }
  };
})();
