(function(){
  var BM = window.BM = window.BM || {};

  // ---- Tuning (wereld-eenheden, getuned op ~60 fps) ----
  var LINK_DIST    = 92;     // gewenste lengte van een lijn
  var LINK_K       = 0.09;   // veerkracht langs lijnen
  var REP          = 7000;   // afstoting tussen punten (kracht = REP / d^2)
  var REP_MAX      = 12;     // maximale afstotingskracht per paar (voorkomt ontploffen)
  var REP_RANGE    = 380;    // voorbij deze afstand wordt afstoting genegeerd (grid-cel)
  var CENTER_K     = 0.0012; // lichte trek naar het midden voor gewone punten
  var ROOT_CENTER_K = 0.03;  // root blijft dicht bij het midden
  var FRICTION     = 0.6;    // snelheid die per tik (bij 60 fps) behouden blijft
  var V_MAX        = 30;     // maximale snelheid per tik
  var ALPHA_START  = 1;      // energie bij nieuw/gewijzigd project
  var ALPHA_DECAY  = 0.02;   // hoe snel de energie afneemt per tik
  var ALPHA_MIN    = 0.002;  // onder deze energie staat de simulatie stil
  var PIN_ALPHA    = 0.3;    // energie-ondergrens zolang een punt vastgehouden wordt
  var SPAWN_MIN    = 84;     // afstand van nieuw punt tot ouder (min)
  var SPAWN_MAX    = 104;    // afstand van nieuw punt tot ouder (max)
  var SPAWN_TRIES  = 8;      // aantal kandidaat-richtingen voor een nieuw punt

  var HUB_FROM     = 2;      // vanaf zoveel kinderen krijgt een punt extra ruimte
  var HUB_STEP     = 0.075;  // extra lijnlengte per kind boven HUB_FROM (fractie van LINK_DIST)
  var HUB_MAX      = 1.1;    // maximaal extra lijnlengte (fractie)
  var MASS_STEP    = 0.08;   // extra afstoting per kind (punten met veel kinderen duwen harder)
  var MASS_MAX     = 2.2;
  var SPACING_EASE = 0.12;   // hoe snel een nieuwe afstand-instelling wordt gevolgd (per tik)

  var pinned = {};   // nodeId -> true, punten die de gebruiker vasthoudt
  var state  = {};   // projectId -> { alpha: number, spacing: number }

  function rnd(a, b){ return a + Math.random() * (b - a); }
  function isNum(v){ return typeof v === 'number' && isFinite(v); }

  // Gewenste afstand-instelling van het project (1 = standaard).
  function targetSpacing(project){
    var v = project && project.spacing;
    if (!isNum(v)) return 1;
    return v < 0.5 ? 0.5 : (v > 3 ? 3 : v);
  }

  // De afstand die de simulatie nu gebruikt: loopt zacht naar de instelling toe,
  // zodat een sprong in de schuif toch vloeiend beweegt.
  function currentSpacing(project){
    var s = project && state[project.id];
    var t = targetSpacing(project);
    return (s && isNum(s.spacing)) ? s.spacing : t;
  }

  // Extra ruimte voor een punt met veel kinderen (0 .. HUB_MAX).
  function hubBonus(kids){
    var k = (kids || 0) - HUB_FROM;
    if (k <= 0) return 0;
    var b = k * HUB_STEP;
    return b > HUB_MAX ? HUB_MAX : b;
  }

  // Lengte van de lijn tussen een ouder en een kind.
  function linkLength(parentKids, childKids, spacing){
    return LINK_DIST * spacing * (1 + hubBonus(parentKids) + 0.5 * hubBonus(childKids));
  }

  function massOf(kids){
    var m = 1 + (kids || 0) * MASS_STEP;
    return m > MASS_MAX ? MASS_MAX : m;
  }

  // Een project dat de layout voor het eerst ziet, begint alleen met volle energie als
  // er punten zonder eigen plek zijn. Opgeslagen posities blijven dan gewoon staan.
  function getState(pid, project){
    var s = state[pid];
    if (!s) {
      var start = (project && project.id === pid && !needsLayout(project)) ? 0 : ALPHA_START;
      if (!project) start = 0;
      s = state[pid] = { alpha: start };
    }
    return s;
  }

  function nodesOf(project){
    return (project && project.nodes) ? project.nodes : {};
  }

  // True als er punten zonder geldige positie zijn, of punten precies op elkaar
  // (zo komt data zonder posities binnen: alles op 0,0).
  function needsLayout(project){
    var nodes = nodesOf(project);
    var seen = Object.create(null);
    for (var k in nodes) {
      if (!Object.prototype.hasOwnProperty.call(nodes, k)) continue;
      var n = nodes[k];
      if (!isNum(n.x) || !isNum(n.y)) return true;
      var key = n.x + ',' + n.y;
      if (seen[key]) return true;
      seen[key] = true;
    }
    return false;
  }

  function sizeOf(projectId){
    try {
      var p = BM.store && BM.store.getProject ? BM.store.getProject(projectId) : null;
      return p && p.nodes ? Object.keys(p.nodes).length : 0;
    } catch (e) { return 0; }
  }

  // Grote projecten krijgen bij een wijziging minder energie, zodat niet de hele
  // mindmap gaat schuiven voor een punt. Het nieuwe punt heeft zijn eigen snelheid al.
  function energyFor(projectId, max){
    var n = sizeOf(projectId);
    if (n <= 0) return max;
    return Math.max(0.12, Math.min(max, 40 / n));
  }

  // Kleinste afstand (kwadraat) van een punt tot alle bestaande punten.
  function minDist2(x, y, nodes){
    var best = Infinity;
    for (var k in nodes) {
      if (!Object.prototype.hasOwnProperty.call(nodes, k)) continue;
      var n = nodes[k];
      if (!isNum(n.x) || !isNum(n.y)) continue;
      var dx = x - n.x, dy = y - n.y;
      var d2 = dx * dx + dy * dy;
      if (d2 < best) best = d2;
    }
    return best;
  }

  // Positie voor een nieuw punt onder parentNode.
  // De richtingen die al bezet zijn (broers en zussen, en de lijn naar de grootouder)
  // worden bekeken; het nieuwe punt schiet het grootste vrije gat in, met wat
  // willekeur. Zo vallen branches van hetzelfde punt niet op elkaar.
  // Van een paar kandidaten in dat gat wint de plek die het verst van andere punten ligt.
  function spawnPosition(parentNode, project){
    var nodes = nodesOf(project);
    var px = 0, py = 0, gp = null;
    if (parentNode) {
      px = isNum(parentNode.x) ? parentNode.x : 0;
      py = isNum(parentNode.y) ? parentNode.y : 0;
      if (parentNode.parentId && nodes[parentNode.parentId]) {
        gp = nodes[parentNode.parentId];
      }
    }

    // Bezette richtingen rond de ouder.
    var taken = [];
    if (gp && isNum(gp.x) && isNum(gp.y) && (gp.x !== px || gp.y !== py)) {
      taken.push(Math.atan2(gp.y - py, gp.x - px));
    }
    var kids = (parentNode && Array.isArray(parentNode.children)) ? parentNode.children : [];
    for (var i = 0; i < kids.length; i++) {
      var c = nodes[kids[i]];
      if (!c || !isNum(c.x) || !isNum(c.y)) continue;
      if (c.x === px && c.y === py) continue;
      taken.push(Math.atan2(c.y - py, c.x - px));
    }

    // Grootste vrije gat (rond de cirkel).
    var gapStart = rnd(0, Math.PI * 2), gapSize = Math.PI * 2;
    if (taken.length) {
      taken.sort(function(a, b){ return a - b; });
      gapSize = -1;
      for (var j = 0; j < taken.length; j++) {
        var a0 = taken[j];
        var a1 = (j + 1 < taken.length) ? taken[j + 1] : taken[0] + Math.PI * 2;
        if (a1 - a0 > gapSize) { gapSize = a1 - a0; gapStart = a0; }
      }
      if (!(gapSize > 0)) { gapSize = Math.PI * 2; }
    }

    var sp = currentSpacing(project);
    var siblingsAfter = kids.length + 1;
    var len = linkLength(siblingsAfter, 0, sp);
    var dMin = Math.max(SPAWN_MIN * sp, len * 0.92);
    var dMax = Math.max(SPAWN_MAX * sp, len * 1.08);

    var best = null, bestScore = -1;
    for (var t = 0; t < SPAWN_TRIES; t++) {
      var a;
      if (gapSize >= Math.PI * 2 - 1e-6) {
        a = rnd(0, Math.PI * 2);                       // nog niets bezet: echt willekeurig
      } else {
        // Midden van het gat, met willekeur tot 40% van het gat (de randen blijven vrij).
        a = gapStart + gapSize * (0.5 + (Math.random() - 0.5) * 0.4);
      }
      var dist = rnd(dMin, dMax);
      var cx = px + Math.cos(a) * dist;
      var cy = py + Math.sin(a) * dist;
      var score = minDist2(cx, cy, nodes);
      if (score > bestScore) {
        bestScore = score;
        best = { x: cx, y: cy, vx: Math.cos(a) * 0.8, vy: Math.sin(a) * 0.8 };
      }
    }
    return best || { x: px, y: py, vx: 0, vy: 0 };
  }

  function cellKey(cx, cy){
    return (cx + 1000000) * 2000003 + (cy + 1000000);
  }

  function reheat(projectId, amount){
    if (projectId === undefined || projectId === null) return;
    var st = getState(projectId);
    var target = (typeof amount === 'number') ? amount : 0.5;
    st.local = null; // globale energie: alles mag bewegen
    if (st.alpha < target) st.alpha = target;
  }

  var LOCAL_MIN = 60;            // vanaf zoveel punten: alleen de omgeving laten bewegen
  var LOCAL_RADIUS = LINK_DIST * 2.5;
  var LOCAL_ALPHA = 0.5;

  // Nieuw punt in een groot project: alleen de punten in de buurt krijgen energie,
  // zodat niet de hele mindmap gaat schuiven (en de CPU niet seconden vol draait).
  function localReheat(projectId, nodeId){
    var p = null;
    try { p = BM.store && BM.store.getProject ? BM.store.getProject(projectId) : null; } catch (e) { p = null; }
    if (!p || !p.nodes) return;
    var nodes = p.nodes;
    var count = Object.keys(nodes).length;
    if (count <= LOCAL_MIN) { reheat(projectId, 1); return; }
    var st = getState(projectId, p);
    if (st.alpha >= ALPHA_MIN && !st.local) {
      // Er loopt al een globale beweging; die neemt het nieuwe punt mee.
      var e = energyFor(projectId, 1);
      if (st.alpha < e) st.alpha = e;
      return;
    }
    var c = nodes[nodeId];
    if (!c || !isNum(c.x) || !isNum(c.y)) { reheat(projectId, energyFor(projectId, 1)); return; }
    var loc = st.local || Object.create(null);
    var rad = LOCAL_RADIUS * currentSpacing(p);
    var R2 = rad * rad;
    for (var k in nodes) {
      if (!Object.prototype.hasOwnProperty.call(nodes, k)) continue;
      var n = nodes[k];
      if (!isNum(n.x) || !isNum(n.y)) continue;
      var dx = n.x - c.x, dy = n.y - c.y;
      if (dx * dx + dy * dy <= R2) loc[k] = true;
    }
    loc[nodeId] = true;
    st.local = loc;
    if (st.alpha < LOCAL_ALPHA) st.alpha = LOCAL_ALPHA;
  }

  // Een tik van de simulatie. dt in seconden. Geeft true zolang er nog beweging is.
  function step(project, dt){
    if (!project) return false;
    var nodes = nodesOf(project);
    var ids = Object.keys(nodes);
    var n = ids.length;
    if (!n) return false;

    var st = getState(project.id, project);
    var list = new Array(n);
    var i;
    for (i = 0; i < n; i++) list[i] = nodes[ids[i]];

    // Punten zonder positie (bv. na import) krijgen een plek naast hun ouder.
    var anyPinned = false, missing = false;
    for (i = 0; i < n; i++) {
      var nd = list[i];
      if (!isNum(nd.x) || !isNum(nd.y)) {
        var sp = spawnPosition(nd.parentId ? nodes[nd.parentId] : null, project);
        nd.x = sp.x; nd.y = sp.y; nd.vx = sp.vx; nd.vy = sp.vy;
        missing = true;
      }
      if (!isNum(nd.vx)) nd.vx = 0;
      if (!isNum(nd.vy)) nd.vy = 0;
      if (pinned[nd.id]) anyPinned = true;
    }
    if (missing) st.alpha = Math.max(st.alpha, 0.6);

    // Vastgehouden punt: zorg dat de omgeving meebeweegt.
    if (anyPinned && st.alpha < PIN_ALPHA) st.alpha = PIN_ALPHA;
    if (anyPinned || missing) st.local = null;

    // Afstand-instelling: zacht naar de nieuwe waarde lopen. Zolang dat bezig is,
    // blijft er genoeg energie zodat alles vloeiend mee schuift.
    var s0 = dt * 60;
    if (!(s0 > 0)) s0 = 1;
    if (s0 > 3) s0 = 3;
    var spTarget = targetSpacing(project);
    if (!isNum(st.spacing)) st.spacing = spTarget;
    var spDiff = spTarget - st.spacing;
    if (Math.abs(spDiff) > 0.001) {
      st.spacing += spDiff * (1 - Math.pow(1 - SPACING_EASE, s0));
      if (Math.abs(spTarget - st.spacing) <= 0.001) st.spacing = spTarget;
      st.local = null;
      if (st.alpha < 0.35) st.alpha = 0.35;
    } else {
      st.spacing = spTarget;
    }
    var spacing = st.spacing;

    var alpha = st.alpha;
    if (!anyPinned && alpha < ALPHA_MIN) { st.local = null; return false; } // stil, niets te doen

    // Lokale beweging: alleen deze punten rekenen en verplaatsen; de rest staat stil.
    var local = st.local || null;

    var index = {};
    for (i = 0; i < n; i++) index[list[i].id] = i;

    var fx = new Float64Array(n), fy = new Float64Array(n);

    // 1. Veren langs lijnen (ouder - kind), elke lijn een keer.
    for (i = 0; i < n; i++) {
      var child = list[i];
      if (!child.parentId) continue;
      var pj = index[child.parentId];
      if (pj === undefined) continue;
      var par = list[pj];
      if (local && !local[child.id] && !local[par.id]) continue;
      var dx = par.x - child.x, dy = par.y - child.y;
      var d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      var want = linkLength(par.children ? par.children.length : 0,
        child.children ? child.children.length : 0, spacing);
      var diff = (d - want) * LINK_K * alpha;
      var ux = dx / d, uy = dy / d;
      fx[i] += ux * diff;  fy[i] += uy * diff;
      fx[pj] -= ux * diff; fy[pj] -= uy * diff;
    }

    // 2. Afstoting tussen alle punten, via een grid (alleen buren binnen het bereik).
    //    Grotere afstand = sterkere en verdere afstoting. Punten met veel kinderen
    //    duwen harder, zodat er rond zo'n punt vanzelf meer ruimte komt.
    // Het rekenbereik groeit maar half zo hard mee als de afstand: verre afstoting
    // draagt weinig bij (1/d^2) en zo blijft schuiven bij grote projecten vlot.
    var range = REP_RANGE * (spacing <= 1 ? spacing : 1 + (spacing - 1) * 0.5);
    var repK = REP * spacing * spacing;
    var repMax = REP_MAX * spacing;
    var mass = new Float64Array(n);
    for (i = 0; i < n; i++) mass[i] = massOf(list[i].children ? list[i].children.length : 0);
    var grid = new Map();
    var cxs = new Int32Array(n), cys = new Int32Array(n);
    for (i = 0; i < n; i++) {
      var cx = Math.floor(list[i].x / range);
      var cy = Math.floor(list[i].y / range);
      cxs[i] = cx; cys[i] = cy;
      var key = cellKey(cx, cy);
      var bucket = grid.get(key);
      if (!bucket) { bucket = []; grid.set(key, bucket); }
      bucket.push(i);
    }
    var R2 = range * range;
    for (i = 0; i < n; i++) {
      var a = list[i], ax = a.x, ay = a.y;
      var aLocal = !local || !!local[a.id];
      for (var gx = -1; gx <= 1; gx++) {
        for (var gy = -1; gy <= 1; gy++) {
          var cell = grid.get(cellKey(cxs[i] + gx, cys[i] + gy));
          if (!cell) continue;
          for (var q = 0; q < cell.length; q++) {
            var j = cell[q];
            if (j <= i) continue; // elk paar precies een keer
            var b = list[j];
            if (!aLocal && !local[b.id]) continue;
            var ddx = ax - b.x, ddy = ay - b.y;
            var d2 = ddx * ddx + ddy * ddy;
            if (d2 > R2) continue;
            if (d2 < 0.0001) {
              ddx = (Math.random() - 0.5) || 0.5;
              ddy = (Math.random() - 0.5) || 0.5;
              d2 = ddx * ddx + ddy * ddy;
            }
            var dd = Math.sqrt(d2);
            var m = mass[i] * mass[j];
            var f = repK * m / d2;
            var fMax = repMax * m;
            if (f > fMax) f = fMax;
            f *= alpha;
            var rx = ddx / dd * f, ry = ddy / dd * f;
            fx[i] += rx; fy[i] += ry;
            fx[j] -= rx; fy[j] -= ry;
          }
        }
      }
    }

    // 3. Lichte trek naar het midden (root sterker, zodat die in het midden blijft).
    for (i = 0; i < n; i++) {
      var k = list[i].parentId ? CENTER_K / spacing : ROOT_CENTER_K;
      fx[i] -= list[i].x * k * alpha;
      fy[i] -= list[i].y * k * alpha;
    }

    // 4. Integratie met demping. Vastgehouden punten bewegen niet (input zet hun positie).
    var s = dt * 60;
    if (!(s > 0)) s = 1;
    if (s > 3) s = 3;
    var friction = Math.pow(FRICTION, s);
    for (i = 0; i < n; i++) {
      var p = list[i];
      if (pinned[p.id] || p.vast || (local && !local[p.id])) { p.vx = 0; p.vy = 0; continue; }
      var vx = (p.vx + fx[i] * s) * friction;
      var vy = (p.vy + fy[i] * s) * friction;
      var sp2 = Math.sqrt(vx * vx + vy * vy);
      if (sp2 > V_MAX) { vx *= V_MAX / sp2; vy *= V_MAX / sp2; }
      p.vx = vx; p.vy = vy;
      p.x += vx * s;
      p.y += vy * s;
    }

    // Energie laten zakken: dit zorgt dat de boel rustig tot stilstand komt.
    st.alpha *= Math.pow(1 - ALPHA_DECAY, s);
    if (st.alpha < ALPHA_MIN && !anyPinned) { st.alpha = 0; st.local = null; }

    return anyPinned || st.alpha >= ALPHA_MIN;
  }

  // Direct uitrekenen (bv. na importeren) zonder animatie.
  // maxMs (optioneel): stop na zoveel milliseconden, zodat het scherm nooit lang vastloopt.
  function settle(project, maxTicks, maxMs){
    var ticks = maxTicks || 400;
    var t0 = (window.performance && performance.now) ? performance.now() : Date.now();
    for (var t = 0; t < ticks; t++) {
      if (!step(project, 1 / 60)) break;
      if (maxMs && (t & 3) === 3) {
        var now = (window.performance && performance.now) ? performance.now() : Date.now();
        if (now - t0 > maxMs) break;
      }
    }
    return project;
  }

  function pin(nodeId){
    if (nodeId !== undefined && nodeId !== null) pinned[nodeId] = true;
  }

  function unpin(nodeId){
    if (nodeId !== undefined && nodeId !== null) delete pinned[nodeId];
  }

  function isPinned(nodeId){
    return !!pinned[nodeId];
  }

  // True zolang de simulatie van dit project nog beweegt.
  function isActive(projectId){
    var s = state[projectId];
    return !!s && s.alpha >= ALPHA_MIN;
  }

  // Koppel aan de bus: bij wijzigingen gaat de simulatie weer even bewegen.
  // Alleen structurele wijzigingen laten de graph bewegen; tekst of een naam niet.
  if (BM.bus && typeof BM.bus.on === 'function') {
    BM.bus.on('node:added', function(d){
      if (d) localReheat(d.projectId, d.nodeId);
    });
    BM.bus.on('node:removed', function(d){
      if (d) reheat(d.projectId, energyFor(d.projectId, 0.7));
    });
  }

  BM.layout = {
    step: step,
    spawnPosition: spawnPosition,
    pin: pin,
    unpin: unpin,
    isPinned: isPinned,
    isActive: isActive,
    reheat: reheat,
    settle: settle,
    needsLayout: needsLayout,
    linkLength: linkLength,
    spacingOf: currentSpacing,
    LINK_DIST: LINK_DIST
  };
})();
