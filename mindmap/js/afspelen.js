/*
 * afspelen.js
 * Speelt de opbouw van de huidige mindmap opnieuw af: eerst alleen het hoofdpunt,
 * daarna komt elk punt er een voor een bij (met hetzelfde schiet-effect als een nieuw punt).
 * Er verandert niets aan de mindmap zelf: punten worden alleen tijdelijk niet getekend.
 *
 * BM.afspelen = { start, stop, bezig, verborgen(id) }
 */
(function () {
  'use strict';
  var BM = window.BM = window.BM || {};

  var TOTAAL_MS = 10000;   // hele opbouw ongeveer zo lang
  var MIN_STAP = 30;
  var MAX_STAP = 260;

  var verborgenSet = null;  // { id: true } zolang het afspelen loopt
  var timer = 0;
  var projectId = null;

  var collator = null;
  try { collator = new Intl.Collator('nl', { numeric: true, sensitivity: 'base' }); } catch (e) { collator = null; }
  function vergelijk(a, b) {
    var ta = String(a.title == null ? '' : a.title);
    var tb = String(b.title == null ? '' : b.title);
    if (collator) return collator.compare(ta, tb);
    return ta < tb ? -1 : (ta > tb ? 1 : 0);
  }

  function reduceMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  // Volgorde: van boven naar beneden zoals het diagram (kinderen op titel), diepte eerst.
  function volgorde(proj) {
    var nodes = proj.nodes;
    var kids = {};
    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id];
      if (!n || n.parentId == null || !nodes[n.parentId]) return;
      (kids[n.parentId] = kids[n.parentId] || []).push(n);
    });
    var uit = [];
    var stack = [String(proj.rootId)];
    var gezien = {};
    while (stack.length) {
      var id = stack.pop();
      if (gezien[id]) continue;
      gezien[id] = true;
      if (id !== String(proj.rootId)) uit.push(id);
      var lijst = (kids[id] || []).slice().sort(vergelijk);
      for (var i = lijst.length - 1; i >= 0; i--) stack.push(String(lijst[i].id));
    }
    return uit;
  }

  function teken() {
    try { if (BM.render && BM.render.invalidate) BM.render.invalidate(); } catch (e) { /* niet erg */ }
  }

  function melding(aan) {
    try { if (BM.bus && BM.bus.emit) BM.bus.emit('afspelen:status', { bezig: aan }); } catch (e) { /* niet erg */ }
  }

  function stop() {
    clearTimeout(timer);
    timer = 0;
    var was = !!verborgenSet;
    verborgenSet = null;
    projectId = null;
    teken();
    if (was) melding(false);
  }

  function start() {
    if (verborgenSet) { stop(); return false; }
    var st = BM.store;
    var pid = st && st.currentId ? st.currentId() : null;
    var proj = pid ? st.getProject(pid) : null;
    if (!proj || !proj.nodes) return false;
    var lijst = volgorde(proj);
    if (!lijst.length) return false;

    projectId = pid;
    verborgenSet = {};
    lijst.forEach(function (id) { verborgenSet[id] = true; });
    melding(true);
    teken();

    // Hele map in beeld, zodat je alles ziet groeien.
    try { if (BM.camera && BM.camera.fit) BM.camera.fit({ projectId: pid, ms: 600 }); } catch (e) { /* niet erg */ }

    var stap = reduceMotion() ? 0 : Math.max(MIN_STAP, Math.min(MAX_STAP, Math.round(TOTAAL_MS / lijst.length)));
    var i = 0;
    function volgende() {
      if (!verborgenSet || projectId !== (st.currentId ? st.currentId() : null)) { stop(); return; }
      var tot = stap ? i + 1 : lijst.length;
      for (; i < tot && i < lijst.length; i++) {
        var id = lijst[i];
        delete verborgenSet[id];
        var n = st.getNode(id);
        if (n && stap && BM.anim && BM.anim.shoot) {
          try { BM.anim.shoot(n, {}); } catch (e) { /* animatie is decoratief */ }
        }
      }
      teken();
      if (i < lijst.length) timer = setTimeout(volgende, stap);
      else stop();
    }
    timer = setTimeout(volgende, stap ? 700 : 0); // eerst even het lege hoofdpunt laten zien
    return true;
  }

  if (BM.bus && BM.bus.on) {
    BM.bus.on('project:switched', function () { if (verborgenSet) stop(); });
  }

  BM.afspelen = {
    start: start,
    stop: stop,
    bezig: function () { return !!verborgenSet; },
    verborgen: function (id) { return !!(verborgenSet && verborgenSet[id]); }
  };
})();
