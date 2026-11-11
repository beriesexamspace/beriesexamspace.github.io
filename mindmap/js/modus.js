(function(){
  var BM = window.BM = window.BM || {};

  // Modus per project: 'follow' (simulatie), 'freeze' (stil, handmatige plekken)
  // en 'diagram' (boom in rechte lijnen). Wisselen gaat met een zachte tween
  // van de punten naar hun doelplek.

  var DUR = 700;               // ms per tween
  var RELAYOUT_DELAY = 30;     // ms: wijzigingen in diagram samenvoegen
  var FREEZE_DELAY = 800;      // ms: nieuw punt in freeze pas vastzetten na zijn plek

  var tween = null;            // { pid, start, items, onDone, raf } of null
  var relayoutTimer = 0;

  // ---------- hulpfuncties ----------

  function safe(fn, fallback) {
    try { return fn(); } catch (e) { return fallback; }
  }

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
    if (!id) return;
    try {
      if (window.cancelAnimationFrame) { window.cancelAnimationFrame(id); return; }
    } catch (e) { /* negeren */ }
    clearTimeout(id);
  }

  function reduceMotion() {
    return safe(function(){
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, false);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function isValid(m) {
    return m === 'follow' || m === 'diagram';
  }

  function currentId() {
    return safe(function(){ return BM.store.currentId(); }, null);
  }

  function getProject(pid) {
    return safe(function(){ return BM.store.getProject(pid); }, null);
  }

  function getNode(id) {
    return safe(function(){ return BM.store.getNode(id); }, null);
  }

  function saveStore() {
    safe(function(){
      if (BM.store && typeof BM.store.save === 'function') BM.store.save();
    });
  }

  function invalidate() {
    safe(function(){
      if (BM.render && typeof BM.render.invalidate === 'function') BM.render.invalidate();
    });
  }

  function setFz(id, x, y) {
    safe(function(){
      if (BM.store && typeof BM.store.setFreezePos === 'function') BM.store.setFreezePos(id, x, y);
    });
  }

  function fitCamera(pid) {
    safe(function(){
      if (BM.camera && typeof BM.camera.fit === 'function') BM.camera.fit({ projectId: pid, padding: 150 });
    });
  }

  function diagramMap(project) {
    if (!project) return null;
    return safe(function(){
      return BM.diagram.layout(project, BM.store.getSpacing(project.id));
    }, null);
  }

  // Loopt over alle punten van een project.
  function eachNode(project, fn) {
    if (!project || !project.nodes) return;
    Object.keys(project.nodes).forEach(function(id){
      fn(id, project.nodes[id]);
    });
  }

  // ---------- modus lezen ----------

  // Modus van dat project of van het huidige project. Standaard 'follow'.
  function get(pid) {
    var id = pid || currentId();
    var m = safe(function(){ return BM.store.getModus(id); }, null);
    return isValid(m) ? m : 'follow';
  }

  // ---------- tween ----------

  function isTweening() {
    return !!tween;
  }

  // Laat de cloud weten dat plekken of modus veranderd zijn (één keer per actie).
  function meldPosities(pid) {
    safe(function(){ BM.bus.emit('project:posities', { projectId: pid || currentId() }); return true; }, false);
  }

  // Lopende tween meteen afmaken: alle punten direct op hun doel, dan opslaan.
  function finishNow() {
    if (!tween) return;
    var tw = tween;
    stopTween();
    applyItems(getProject(tw.pid), tw.items, 1);
    invalidate();
    saveStore();
  }

  // Freeze: punten die niet op hun bewaarde plek staan (na een onderbroken tween of
  // herladen) zacht terug laten glijden.
  function herstelFreeze(pid) {
    var p = getProject(pid);
    if (!p || get(pid) !== 'freeze') return;
    var doel = {};
    eachNode(p, function(id, n){ if (n.fz) doel[id] = { x: n.fz.x, y: n.fz.y }; });
    startTween(pid, doel, null);
  }

  function stopTween() {
    if (!tween) return;
    cancelRaf(tween.raf);
    tween.raf = 0;
    tween = null;
  }

  // Zet de punten van items op stand e (0..1) tussen begin en doel.
  function applyItems(project, items, e) {
    if (!project || !project.nodes) return;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var n = project.nodes[it.id];
      if (!n) continue;
      n.x = it.fx + (it.tx - it.fx) * e;
      n.y = it.fy + (it.ty - it.fy) * e;
      n.vx = 0;
      n.vy = 0;
    }
  }

  // Bouwt de lijst van punten die echt moeten bewegen.
  function buildItems(project, targets) {
    var items = [];
    if (!project || !project.nodes || !targets) return items;
    Object.keys(targets).forEach(function(id){
      var n = project.nodes[id];
      var to = targets[id];
      if (!n || !to) return;
      if (typeof to.x !== 'number' || typeof to.y !== 'number') return;
      if (!isFinite(to.x) || !isFinite(to.y)) return;
      var fx = Number(n.x) || 0;
      var fy = Number(n.y) || 0;
      if (Math.abs(to.x - fx) < 0.01 && Math.abs(to.y - fy) < 0.01) return;
      items.push({ id: id, fx: fx, fy: fy, tx: to.x, ty: to.y });
    });
    return items;
  }

  function finishTween(onDone) {
    saveStore();
    if (typeof onDone === 'function') onDone();
  }

  function tick(tw) {
    if (tween !== tw) return;   // deze tween is al gestopt
    tw.raf = 0;
    var t = (nowMs() - tw.start) / DUR;
    if (!(t >= 0)) t = 0;
    if (t > 1) t = 1;
    applyItems(getProject(tw.pid), tw.items, easeInOutCubic(t));
    invalidate();
    if (t >= 1) {
      tween = null;
      finishTween(tw.onDone);
      return;
    }
    tw.raf = raf(function(){ tick(tw); });
  }

  // Laat de punten naar targets glijden ({ nodeId: {x, y} }). Een lopende tween
  // stopt netjes; de nieuwe begint op de plek waar de punten nu staan.
  function startTween(pid, targets, onDone) {
    stopTween();
    var project = getProject(pid);
    var items = buildItems(project, targets);

    if (!items.length) {
      // Niets te bewegen: alleen het afronden (bv. camera).
      invalidate();
      if (typeof onDone === 'function') onDone();
      return false;
    }

    if (reduceMotion()) {
      applyItems(project, items, 1);
      invalidate();
      finishTween(onDone);
      return true;
    }

    var tw = { pid: pid, start: nowMs(), items: items, onDone: onDone, raf: 0 };
    tween = tw;
    tw.raf = raf(function(){ tick(tw); });
    return true;
  }

  // ---------- diagram opnieuw uitrekenen ----------

  // Alleen in diagram: doelplekken opnieuw berekenen en ernaartoe glijden.
  function relayoutFor(pid) {
    if (!pid || get(pid) !== 'diagram') return false;
    var project = getProject(pid);
    var map = diagramMap(project);
    if (!map) return false;
    return startTween(pid, map, null);
  }

  function relayout() {
    return relayoutFor(currentId());
  }

  // Wijzigingen na elkaar worden samengevoegd tot een relayout.
  function scheduleRelayout(pid) {
    var id = pid || currentId();
    if (!id || id !== currentId()) return;   // andere project: bij wisselen gebeurt dat zelf
    clearTimeout(relayoutTimer);
    relayoutTimer = setTimeout(function(){
      relayoutTimer = 0;
      if (id !== currentId()) return;
      relayoutFor(id);
    }, RELAYOUT_DELAY);
  }

  // Klopt de huidige plek van de punten al met de diagramplekken?
  function diagramMismatch(pid) {
    var project = getProject(pid);
    var map = diagramMap(project);
    if (!project || !map) return false;
    var bad = false;
    eachNode(project, function(id, n){
      if (bad) return;
      var t = map[id];
      if (!t) { bad = true; return; }
      if (Math.abs((Number(n.x) || 0) - t.x) > 0.01 || Math.abs((Number(n.y) || 0) - t.y) > 0.01) bad = true;
    });
    return bad;
  }

  // ---------- modus wisselen ----------

  // Wisselt de modus van het huidige project met animatie.
  function set(m) {
    if (!isValid(m)) return false;
    var pid = currentId();
    var project = getProject(pid);
    if (!pid || !project || !project.nodes) return false;

    var cur = get(pid);
    if (cur === m) return false;

    // Een lopende tween laat de punten op hun huidige plek staan.
    stopTween();

    // Vanuit freeze: punten zonder vaste plek krijgen nu hun plek als fz.
    if (cur === 'freeze') {
      eachNode(project, function(id, n){
        if (!n.fz) setFz(id, n.x, n.y);
      });
    }

    var okSet = safe(function(){ return BM.store.setModus(pid, m); }, false);
    if (!okSet) return false;

    if (m === 'freeze') {
      // Punten met een vaste plek glijden ernaartoe; de rest krijgt zijn huidige plek.
      var targets = {};
      eachNode(project, function(id, n){
        if (!n.fz) setFz(id, n.x, n.y);
        var fz = n.fz || { x: n.x, y: n.y };
        targets[id] = { x: fz.x, y: fz.y };
      });
      startTween(pid, targets, null);
    } else if (m === 'diagram') {
      var map = diagramMap(project) || {};
      startTween(pid, map, function(){ fitCamera(pid); });
    }
    // 'follow': niets glijden; layout.js zet de simulatie aan via het event.

    return true;
  }

  // Door input.js aangeroepen na slepen.
  // freeze: plek van de gesleepte punten bewaren. diagram: terugglijden.
  function afterDrag(ids) {
    var list = Array.isArray(ids) ? ids : (ids ? [ids] : []);
    var pid = currentId();
    var m = get(pid);
    if (m === 'freeze') {
      finishNow();
      list.forEach(function(id){
        var n = getNode(id);
        if (n) setFz(id, n.x, n.y);
      });
      meldPosities(pid);
    } else if (m === 'diagram') {
      relayout();
    }
  }

  // ---------- bus-koppelingen ----------

  function onNodeChange(d) {
    if (!d) return;
    var pid = d.projectId || currentId();
    if (get(pid) === 'diagram') scheduleRelayout(pid);
  }

  if (BM.bus && typeof BM.bus.on === 'function') {
    BM.bus.on('node:added', function(d){
      if (!d) return;
      var pid = d.projectId || currentId();
      var m = get(pid);
      if (m === 'diagram') {
        scheduleRelayout(pid);
      } else if (m === 'freeze') {
        // Nieuw punt krijgt zijn plek in freeze pas na korte tijd; dan vastzetten.
        var nodeId = d.nodeId;
        setTimeout(function(){
          var n = getNode(nodeId);
          if (n && !n.fz && get(pid) === 'freeze') { setFz(nodeId, n.x, n.y); meldPosities(pid); }
        }, FREEZE_DELAY);
      }
    });

    BM.bus.on('node:removed', onNodeChange);
    BM.bus.on('node:renamed', onNodeChange);
    BM.bus.on('project:spacing', onNodeChange);

    BM.bus.on('project:switched', function(){
      finishNow();
      clearTimeout(relayoutTimer);
      relayoutTimer = 0;
      var pid = currentId();
      if (get(pid) === 'diagram' && diagramMismatch(pid)) relayoutFor(pid);
      else if (get(pid) === 'freeze') herstelFreeze(pid);
    });
    // Na het laden (ook vanuit de cloud) eenmalig controleren.
    ['cloud:gestart', 'store:loaded'].forEach(function(ev){
      BM.bus.on(ev, function(){
        var pid = currentId();
        if (get(pid) === 'diagram' && diagramMismatch(pid)) relayoutFor(pid);
        else if (get(pid) === 'freeze') herstelFreeze(pid);
      });
    });
  }

  // ---------- publiek ----------

  BM.modus = {
    labels: { follow: 'Follow', freeze: 'Freeze', diagram: 'Diagram' },
    get: get,
    set: set,
    isTweening: isTweening,
    relayout: relayout,
    afterDrag: afterDrag,
    finishNow: finishNow
  };
})();
