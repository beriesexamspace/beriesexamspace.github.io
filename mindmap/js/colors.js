(function(){
  var BM = window.BM = window.BM || {};

  // Kleuren van de mindmap.
  // - Vaste kleuren (PRESETS) plus eigen kleuren uit het palet (BM.store.palette()).
  // - effective(project): per punt de kleur die het toont (eigen kleur of geërfd).
  // - De kleurgolf: kies je een kleur, dan loopt die vanaf het punt naar buiten door
  //   de tak. Eerst het punt zelf, dan vullen de lijnen zich als een lont richting de
  //   kinderen, dan de kleinkinderen, enzovoort. Elk punt licht kort op als de kleur
  //   aankomt. Bij "Geen kleur" loopt dezelfde golf terug naar wit.

  // De vaste kleuren staan in store.js (daar worden ze ook uit de eigen kleuren gefilterd).
  var PRESETS = (BM.store && BM.store.PRESET_COLORS) || [
    { hex: '#8b7cf6', name: 'Paars' },
    { hex: '#5b9cff', name: 'Blauw' },
    { hex: '#3fc1c9', name: 'Turquoise' },
    { hex: '#5fd38d', name: 'Groen' },
    { hex: '#f2c14e', name: 'Geel' },
    { hex: '#f28c5b', name: 'Oranje' },
    { hex: '#f0646e', name: 'Rood' },
    { hex: '#e879c6', name: 'Roze' }
  ];

  var WHITE = [255, 255, 255];
  var LEVEL_MAX = 340;    // ms per niveau (lont van ouder naar kind)
  var LEVEL_MIN = 30;     // zo blijft ook een heel diepe tak rond WAVE_TOTAL
  var WAVE_TOTAL = 3000;  // diepe takken: de hele golf duurt ongeveer zo lang
  var BLEND_MS = 260;     // punt kleurt om zodra de lont aankomt
  var FLASH_MS = 560;     // punt licht kort op

  function now(){
    return (window.performance && performance.now) ? performance.now() : Date.now();
  }

  function reduced(){
    try {
      if (BM.anim && typeof BM.anim.reducedMotion === 'function') return BM.anim.reducedMotion();
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  }

  function normalize(v){
    if (BM.store && typeof BM.store.normalizeColor === 'function') return BM.store.normalizeColor(v);
    return null;
  }

  var rgbCache = Object.create(null);
  // '#rrggbb' -> [r, g, b]; null (geen kleur) -> wit.
  function rgb(hex){
    if (!hex) return WHITE;
    var c = rgbCache[hex];
    if (c) return c;
    var h = normalize(hex);
    if (!h) return WHITE;
    c = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    rgbCache[hex] = c;
    return c;
  }

  function mix(a, b, t){
    if (t <= 0) return a;
    if (t >= 1) return b;
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }

  function easeOut(t){ var u = 1 - t; return 1 - u * u * u; }
  function easeInOut(t){ return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp01(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }

  // ---------- geërfde kleuren ----------

  // Kaart nodeId -> hex of null, voor het hele project. Gecachet tot er iets verandert.
  var effCache = { pid: null, map: null, dirty: true };

  function computeEffective(project){
    var map = Object.create(null);
    if (!project || !project.nodes || !project.rootId) return map;
    var nodes = project.nodes;
    var root = nodes[project.rootId];
    if (!root) return map;
    var stack = [project.rootId], cols = [root.color || null];
    var guard = 0;
    while (stack.length && guard++ < 1000000) {
      var id = stack.pop();
      var inherited = cols.pop();
      var n = nodes[id];
      if (!n || map[id] !== undefined) continue;
      var c = n.color || inherited || null;
      map[id] = c;
      var kids = n.children || [];
      for (var i = 0; i < kids.length; i++) {
        stack.push(kids[i]);
        cols.push(c);
      }
    }
    return map;
  }

  function effective(project){
    if (!project) return Object.create(null);
    if (effCache.dirty || effCache.pid !== project.id || !effCache.map) {
      effCache.map = computeEffective(project);
      effCache.pid = project.id;
      effCache.dirty = false;
    }
    return effCache.map;
  }

  function invalidate(){ effCache.dirty = true; }

  // ---------- de golf ----------

  // recs[nodeId] = { from:[rgb], to:[rgb], at, level, rev, end }
  //   at    = moment waarop de kleur bij het punt aankomt
  //   level = duur van de lont over de lijn naar dit punt
  //   rev   = true voor het startpunt: zijn eigen lijn (naar de ouder) vult vanaf het
  //           punt terug richting de ouder
  var recs = Object.create(null);
  var recCount = 0;
  var waveEnd = 0;        // moment waarop de laatst gestarte golf helemaal klaar is

  function setRec(id, r){
    if (!recs[id]) recCount++;
    recs[id] = r;
  }

  function dropRec(id){
    if (recs[id]) { delete recs[id]; recCount--; }
  }

  // De kleur die een punt op dit moment laat zien (ook midden in een golf).
  function shownRgb(id, effHex, t){
    var r = recs[id];
    if (!r) return rgb(effHex);
    if (t < r.at) return r.from;
    return mix(r.from, r.to, easeOut(clamp01((t - r.at) / BLEND_MS)));
  }

  // Start de golf voor een kleurwissel op originId.
  function startWave(projectId, originId, prevOwn, nextOwn){
    invalidate();
    var project = BM.store && BM.store.getProject ? BM.store.getProject(projectId) : null;
    if (!project || !project.nodes || !project.nodes[originId]) return 0;
    if (reduced()) {
      // Minder beweging: meteen de nieuwe kleur, geen golf.
      var ids0 = BM.store.subtree(originId);
      for (var z = 0; z < ids0.length; z++) dropRec(ids0[z]);
      return 0;
    }
    var nodes = project.nodes;
    var origin = nodes[originId];
    var parentEff = origin.parentId != null && BM.store.effectiveColor
      ? BM.store.effectiveColor(origin.parentId) : null;

    // Diepte-voor-diepte (breedte-eerst) door de tak; voor elk punt de oude en de
    // nieuwe kleur. Alleen punten waarvan de kleur echt verandert doen mee.
    var t = now();
    var changed = [];
    var maxDepth = 0;
    var queue = [{ id: originId, d: 0, before: prevOwn || parentEff || null, after: nextOwn || parentEff || null }];
    for (var qi = 0; qi < queue.length; qi++) {
      var it = queue[qi];
      var n = nodes[it.id];
      if (!n) continue;
      if (it.before === it.after) continue; // eigen kleur dieper in de tak: daar stopt de golf
      changed.push(it);
      if (it.d > maxDepth) maxDepth = it.d;
      var kids = n.children || [];
      for (var k = 0; k < kids.length; k++) {
        var cn = nodes[kids[k]];
        if (!cn) continue;
        var own = cn.color || null;
        queue.push({
          id: kids[k],
          d: it.d + 1,
          before: own || it.before,
          after: own || it.after
        });
      }
    }
    if (!changed.length) return 0;

    var level = maxDepth > 0 ? WAVE_TOTAL / (maxDepth + 1) : LEVEL_MAX;
    if (level > LEVEL_MAX) level = LEVEL_MAX;
    if (level < LEVEL_MIN) level = LEVEL_MIN;

    var lastEnd = t;
    for (var c = 0; c < changed.length; c++) {
      var ch = changed[c];
      // Vertrekkleur = wat het punt nu laat zien (ook als er nog een vorige golf liep).
      var from = recs[ch.id] ? shownRgb(ch.id, null, t) : rgb(ch.before);
      var at = t + ch.d * level;
      setRec(ch.id, {
        from: from,
        to: rgb(ch.after),
        fromHex: ch.before,
        toHex: ch.after,
        at: at,
        level: level,
        rev: ch.d === 0,
        end: at + Math.max(BLEND_MS, FLASH_MS) + (ch.d === 0 ? level : 0)
      });
      if (recs[ch.id].end > lastEnd) lastEnd = recs[ch.id].end;
    }
    if (lastEnd > waveEnd) waveEnd = lastEnd;
    if (BM.render && typeof BM.render.invalidate === 'function') BM.render.invalidate();
    // Totale duur van deze golf (ms): ongeveer maxDepth * level + nagloei.
    return lastEnd - t;
  }

  // Hoe lang (ms) de lopende golf nog duurt; 0 als er niets loopt.
  function waveRemaining(){
    var r = waveEnd - now();
    return r > 0 ? r : 0;
  }

  // Info voor het tekenen van een punt: { rgb, flash (0..1) }.
  // effHex: de (nieuwe) kleur uit effective(). t: tijd van deze frame.
  function nodeLook(id, effHex, t){
    var r = recs[id];
    if (!r) return { rgb: rgb(effHex), flash: 0, hex: effHex };
    if (t >= r.end) {
      dropRec(id);
      return { rgb: rgb(effHex), flash: 0, hex: effHex };
    }
    var flash = 0;
    if (t >= r.at && t < r.at + FLASH_MS) flash = Math.sin(Math.PI * ((t - r.at) / FLASH_MS));
    var col = t < r.at ? r.from : mix(r.from, r.to, easeOut(clamp01((t - r.at) / BLEND_MS)));
    return { rgb: col, flash: flash, hex: null };
  }

  // Info voor de lijn ouder -> kind (childId): null als er geen golf over deze lijn loopt,
  // anders { from, to, f (0..1, hoeveel al de nieuwe kleur heeft), rev, fromHex, toHex }.
  function edgeLook(childId, t){
    var r = recs[childId];
    if (!r) return null;
    var start = r.rev ? r.at : r.at - r.level;
    var f = clamp01((t - start) / r.level);
    // Licht versnellen en afremmen per lijn, maar de lont loopt overal door.
    f = 0.25 * easeInOut(f) + 0.75 * f;
    return { from: r.from, to: r.to, f: f, rev: r.rev, fromHex: r.fromHex, toHex: r.toHex };
  }

  function isActive(){
    if (!recCount) return false;
    var t = now();
    for (var id in recs) {
      if (recs[id].end > t) return true;
    }
    // alles is klaar: opruimen
    recs = Object.create(null);
    recCount = 0;
    return false;
  }

  function clear(){
    recs = Object.create(null);
    recCount = 0;
    waveEnd = 0;
    invalidate();
  }

  // Alle kleuren in het palet: vaste kleuren en daarna de eigen kleuren.
  function palette(){
    var out = PRESETS.map(function(p){ return { hex: p.hex, name: p.name, custom: false }; });
    var own = [];
    try { own = (BM.store && BM.store.palette) ? BM.store.palette() : []; } catch (e) { own = []; }
    own.forEach(function(hex){
      var dup = false;
      for (var i = 0; i < out.length; i++) if (out[i].hex === hex) { dup = true; break; }
      if (!dup) out.push({ hex: hex, name: 'Eigen kleur ' + hex, custom: true });
    });
    return out;
  }

  function isPreset(hex){
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].hex === hex) return true;
    return false;
  }

  if (BM.bus && typeof BM.bus.on === 'function') {
    ['store:changed', 'node:added', 'node:removed', 'project:switched'].forEach(function(ev){
      BM.bus.on(ev, invalidate);
    });
    BM.bus.on('node:color', function(d){
      if (!d) return;
      startWave(d.projectId, d.nodeId, d.prev, d.color);
    });
    BM.bus.on('node:removed', function(d){
      if (!d || !d.nodeIds) return;
      for (var i = 0; i < d.nodeIds.length; i++) dropRec(d.nodeIds[i]);
    });
    BM.bus.on('project:switched', clear);
  }

  BM.colors = {
    PRESETS: PRESETS,
    palette: palette,
    isPreset: isPreset,
    rgb: rgb,
    mix: mix,
    effective: effective,
    invalidate: invalidate,
    nodeLook: nodeLook,
    edgeLook: edgeLook,
    isActive: isActive,
    startWave: startWave,
    waveRemaining: waveRemaining,
    clear: clear
  };
})();
