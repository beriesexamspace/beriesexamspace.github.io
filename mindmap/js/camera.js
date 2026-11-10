(function(){
  var BM = window.BM = window.BM || {};

  // Camera: wereld <-> scherm. Scherm = CSS-pixels.
  // worldToScreen(x,y) = (x * zoom + panX, y * zoom + panY)

  var MIN_ZOOM = 0.15;
  var MAX_ZOOM = 4;
  var DEFAULT_FOCUS_MS = 480;
  var DEFAULT_FIT_MS = 620;
  var FIT_PADDING = 90;       // schermpixels rondom de boom
  var FIT_MAX_ZOOM = 1.6;     // een kleine boom niet onnodig ver inzoomen

  var state = {
    panX: 0,
    panY: 0,
    zoom: 1
  };

  var view = { w: 0, h: 0 };

  var anim = null;   // { start, dur, from, target } of null
  var rafId = 0;

  // ---------- hulpfuncties ----------

  function nowMs() {
    try {
      if (window.performance && performance.now) return performance.now();
    } catch (e) { /* negeren */ }
    return Date.now();
  }

  function raf(fn) {
    try {
      if (window.requestAnimationFrame) return window.requestAnimationFrame(fn);
    } catch (e) { /* negeren */ }
    return setTimeout(function(){ fn(nowMs()); }, 16);
  }

  function cancelRaf(id) {
    try {
      if (window.cancelAnimationFrame) { window.cancelAnimationFrame(id); return; }
    } catch (e) { /* negeren */ }
    clearTimeout(id);
  }

  function reduceMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      return false;
    }
  }

  function easeOutCubic(t) {
    var p = 1 - t;
    return 1 - p * p * p;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clampZoom(z) {
    if (typeof z !== 'number' || !isFinite(z)) z = 1;
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
  }

  function vw() {
    return view.w || window.innerWidth || 800;
  }

  function vh() {
    return view.h || window.innerHeight || 600;
  }

  function getNodeSafe(nodeId) {
    try {
      return (BM.store && BM.store.getNode) ? BM.store.getNode(nodeId) : null;
    } catch (e) {
      return null;
    }
  }

  function getProjectSafe(projectId) {
    try {
      return (BM.store && BM.store.getProject) ? BM.store.getProject(projectId) : null;
    } catch (e) {
      return null;
    }
  }

  function currentProjectId() {
    try {
      return (BM.store && BM.store.currentId) ? BM.store.currentId() : null;
    } catch (e) {
      return null;
    }
  }

  // ---------- viewport ----------

  // Render roept dit aan bij start en bij resize. Het midden van het beeld
  // blijft op dezelfde wereldpositie staan.
  function setViewport(w, h) {
    w = Number(w) || 0;
    h = Number(h) || 0;
    if (view.w && view.h) {
      state.panX += (w - view.w) / 2;
      state.panY += (h - view.h) / 2;
    }
    view.w = w;
    view.h = h;
  }

  function getViewport() {
    return { w: vw(), h: vh() };
  }

  // ---------- coordinaten ----------

  function worldToScreen(x, y) {
    return {
      x: x * state.zoom + state.panX,
      y: y * state.zoom + state.panY
    };
  }

  function screenToWorld(sx, sy) {
    return {
      x: (sx - state.panX) / state.zoom,
      y: (sy - state.panY) / state.zoom
    };
  }

  function get() {
    return { panX: state.panX, panY: state.panY, zoom: state.zoom };
  }

  // Zet direct (zonder animatie). Stopt een lopende animatie.
  function set(panX, panY, zoom) {
    stop();
    if (typeof panX === 'number' && isFinite(panX)) state.panX = panX;
    if (typeof panY === 'number' && isFinite(panY)) state.panY = panY;
    if (typeof zoom === 'number') state.zoom = clampZoom(zoom);
  }

  // ---------- handmatige besturing (pan / zoom) ----------

  // Slepen van de achtergrond. dx, dy in schermpixels.
  function pan(dx, dy) {
    stop();
    state.panX += Number(dx) || 0;
    state.panY += Number(dy) || 0;
  }

  // Zoomt rond een schermpunt (bijv. de muiscursor). Het punt onder de
  // cursor blijft op dezelfde plek. factor > 1 = inzoomen.
  // Geeft het nieuwe zoomniveau terug.
  function zoomAt(sx, sy, factor) {
    stop();
    var z0 = state.zoom;
    var z1 = clampZoom(z0 * (Number(factor) || 1));
    if (z1 === z0) return z1;
    var k = z1 / z0;
    state.panX = sx - (sx - state.panX) * k;
    state.panY = sy - (sy - state.panY) * k;
    state.zoom = z1;
    return z1;
  }

  // ---------- animatie ----------

  function stop() {
    if (rafId) cancelRaf(rafId);
    rafId = 0;
    anim = null;
  }

  function isAnimating() {
    return !!anim;
  }

  // targetFn() geeft elke frame het gewenste doel {panX, panY, zoom} of null.
  // Zo kan het doel meebewegen met een punt dat de layout nog verschuift.
  // follow: na de animatie het doel blijven volgen zolang de layout nog beweegt
  // (max FOLLOW_MS). Pannen of zoomen door de gebruiker stopt het volgen (via stop()).
  var FOLLOW_MS = 6000;

  function layoutMoving() {
    try {
      var pid = currentProjectId();
      return !!(BM.layout && BM.layout.isActive && BM.layout.isActive(pid));
    } catch (e) {
      return false;
    }
  }

  function animateTo(targetFn, ms, follow) {
    stop();
    var goal = targetFn();
    if (!goal) return false;

    if (!(ms > 0) || reduceMotion()) {
      state.panX = goal.panX;
      state.panY = goal.panY;
      state.zoom = clampZoom(goal.zoom);
      if (!follow) return true;
      ms = 1;
    }

    anim = {
      start: nowMs(),
      dur: ms,
      follow: !!follow,
      from: { panX: state.panX, panY: state.panY, zoom: state.zoom },
      target: targetFn
    };
    rafId = raf(step);
    return true;
  }

  function step() {
    rafId = 0;
    var a = anim;
    if (!a) return;

    var t = (nowMs() - a.start) / a.dur;
    if (t > 1) t = 1;
    var e = easeOutCubic(t);

    var goal = a.target();
    if (!goal) { stop(); return; }

    if (t >= 1) {
      state.panX = goal.panX;
      state.panY = goal.panY;
      state.zoom = clampZoom(goal.zoom);
      if (a.follow && nowMs() - a.start < a.dur + FOLLOW_MS && layoutMoving()) {
        rafId = raf(step);
        return;
      }
      stop();
      return;
    }

    state.panX = lerp(a.from.panX, goal.panX, e);
    state.panY = lerp(a.from.panY, goal.panY, e);
    state.zoom = clampZoom(lerp(a.from.zoom, goal.zoom, e));
    rafId = raf(step);
  }

  // ---------- focus op een punt ----------

  // Centreert een punt in beeld met een zachte animatie. Het punt wordt
  // elke frame opnieuw opgezocht, dus het volgt de layout.
  // opts: { zoom, ms }. Zonder zoom: bij te ver uitgezoomd naar 1, anders
  // het huidige niveau behouden.
  function focusOn(nodeId, opts) {
    opts = opts || {};
    var node = getNodeSafe(nodeId);
    if (!node) return false;

    var zt;
    if (typeof opts.zoom === 'number') {
      zt = clampZoom(opts.zoom);
    } else {
      zt = state.zoom < 0.9 ? 1 : state.zoom;
      zt = clampZoom(zt);
    }

    var ms = (typeof opts.ms === 'number') ? opts.ms : DEFAULT_FOCUS_MS;

    // Optioneel schermpunt waar het punt moet komen (bijv. naast een open pop-up).
    var hasAt = typeof opts.screenX === 'number' && typeof opts.screenY === 'number' &&
      isFinite(opts.screenX) && isFinite(opts.screenY);

    var targetFn = function() {
      var n = getNodeSafe(nodeId);
      if (!n) return null;
      var cx = hasAt ? opts.screenX : vw() / 2;
      var cy = hasAt ? opts.screenY : vh() / 2;
      return {
        panX: cx - n.x * zt,
        panY: cy - n.y * zt,
        zoom: zt
      };
    };

    return animateTo(targetFn, ms, true);
  }

  // Berekent het doel om de hele boom van een project in beeld te krijgen.
  function fitTarget(projectId, opts) {
    var padding = (typeof opts.padding === 'number') ? opts.padding : FIT_PADDING;
    var maxZoom = (typeof opts.maxZoom === 'number') ? opts.maxZoom : FIT_MAX_ZOOM;

    return function() {
      var p = getProjectSafe(projectId);
      if (!p || !p.nodes) return null;

      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      var count = 0;
      var ids = Object.keys(p.nodes);
      for (var i = 0; i < ids.length; i++) {
        var n = p.nodes[ids[i]];
        if (!n || typeof n.x !== 'number' || typeof n.y !== 'number') continue;
        if (n.x < minX) minX = n.x;
        if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
        count++;
      }
      if (!count) return null;

      var bw = Math.max(maxX - minX, 1);
      var bh = Math.max(maxY - minY, 1);
      var availW = Math.max(vw() - padding * 2, 50);
      var availH = Math.max(vh() - padding * 2, 50);

      var zoom = clampZoom(Math.min(availW / bw, availH / bh, maxZoom));
      var cx = (minX + maxX) / 2;
      var cy = (minY + maxY) / 2;

      return {
        panX: vw() / 2 - cx * zoom,
        panY: vh() / 2 - cy * zoom,
        zoom: zoom
      };
    };
  }

  // Zet de hele boom in beeld. opts: { projectId, padding, maxZoom, ms }.
  // Zonder projectId wordt het huidige project gebruikt.
  function fit(opts) {
    opts = opts || {};
    var pid = opts.projectId || currentProjectId();
    if (!pid) return false;
    var ms = (typeof opts.ms === 'number') ? opts.ms : DEFAULT_FIT_MS;
    return animateTo(fitTarget(pid, opts), ms);
  }

  // ---------- koppeling met de bus ----------

  // Overzicht (of een ander paneel) vraagt 'node:focus': we centreren het punt.
  if (BM.bus && BM.bus.on) {
    BM.bus.on('node:focus', function(data) {
      if (data && data.nodeId) {
        focusOn(data.nodeId, { screenX: data.screenX, screenY: data.screenY });
      }
    });
  }

  BM.camera = {
    MIN_ZOOM: MIN_ZOOM,
    MAX_ZOOM: MAX_ZOOM,
    setViewport: setViewport,
    getViewport: getViewport,
    get: get,
    set: set,
    worldToScreen: worldToScreen,
    screenToWorld: screenToWorld,
    pan: pan,
    zoomAt: zoomAt,
    focusOn: focusOn,
    fit: fit,
    stop: stop,
    isAnimating: isAnimating
  };
})();
