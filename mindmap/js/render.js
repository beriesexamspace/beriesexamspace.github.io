(function(){
  var BM = window.BM = window.BM || {};

  // Canvas-weergave van de mindmap. Leest de wereld uit BM.store, de posities
  // uit BM.layout (die ze zelf bijwerkt), het beeld uit BM.camera en de
  // schiet/gloed/fade-effecten uit BM.anim.

  var canvas = null;
  var ctx = null;
  var glowSprite = null;
  var dpr = 1;
  var W = 0;
  var H = 0;
  var running = false;
  var rafId = 0;
  var lastT = 0;
  var wired = false;
  var wasMoving = false;  // simulatie bewoog in de vorige frame

  var pointer = null;     // { cx, cy } in client-coordinaten, of null
  var hoverId = null;     // id onder de muis (of null)
  var lastHover = null;   // laatste hover, zodat de dim-overgang netjes uitloopt
  var hoverMix = 0;       // 0..1, loopt zacht mee met hover
  var selId = null;       // punt waarvan de pop-up open staat (blijft gemarkeerd, zie ui:popup-opened)

  // Kennisboom-stijl: in rust grijze puntjes; hover op een tak laat die hele tak
  // wit oplichten (rest dimt), hover op het midden laat alles oplichten.
  var lit = Object.create(null);   // id -> 0..1 (hoe wit/oplichtend)
  var fade = Object.create(null);  // id -> 0..1 (1 = normaal, lager = gedimd)
  var frameDt = 1 / 60;
  var easing = false;              // nog een overgang bezig
  var GREY = [230, 138, 74];       // kern-grijs voor root, eerste ring, dieper
  var LABEL_GREY = ['230,230,230', '168,168,168', '143,143,143'];
  function phaseOf(id){
    var h = 0, s = String(id);
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return (h % 628) / 100;
  }

  var DIM = 0.12;               // basis-alpha van lijnen
  var LABEL_Z0 = 0.6;           // vanaf dit zoomniveau beginnen labels te verschijnen
  var LABEL_Z1 = 1.1;           // hier zijn labels volledig zichtbaar
  var LABEL_MAX = 28;           // labels langer dan dit worden ingekort

  function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }

  function easeOut(t){
    if (BM.anim && BM.anim.ease && typeof BM.anim.ease.easeOutCubic === 'function') {
      return BM.anim.ease.easeOutCubic(t);
    }
    var u = 1 - t;
    return 1 - u * u * u;
  }

  // "Minder beweging": een keer opvragen en bijhouden via een change-listener.
  var reduceMQ = null;
  var reduceFlag = false;
  try {
    if (window.matchMedia) {
      reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
      reduceFlag = !!reduceMQ.matches;
      var onReduce = function(){ reduceFlag = !!reduceMQ.matches; };
      if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', onReduce);
      else if (reduceMQ.addListener) reduceMQ.addListener(onReduce);
    }
  } catch (e) { reduceFlag = false; }

  function reduceMotion(){ return reduceFlag; }

  // ---- alleen tekenen als er iets veranderd is ----
  var dirty = true;          // volgende frame moet getekend worden
  var lastCam = null;        // camera-state van de vorige getekende frame
  var pointerMoved = false;  // muis bewogen sinds de vorige hover-berekening
  var rectLeft = 0;          // canvas-positie, gecachet in resize()
  var rectTop = 0;

  function markDirty(){ dirty = true; }

  // ---- namen aan/uit (oogje bij Afstand) ----
  var namenAan = true;       // doel: namen zichtbaar of niet
  var namenF = 1;            // huidige zichtbaarheid 0..1, glijdt naar het doel
  function zetNamen(aan){ namenAan = !!aan; if (reduceFlag) namenF = namenAan ? 1 : 0; dirty = true; }

  function cameraChanged(){
    var cam = BM.camera;
    if (!cam) return false;
    if (typeof cam.isAnimating === 'function' && cam.isAnimating()) return true;
    if (typeof cam.get !== 'function') return true;
    var c = cam.get();
    if (!lastCam || c.panX !== lastCam.panX || c.panY !== lastCam.panY || c.zoom !== lastCam.zoom) {
      lastCam = c;
      return true;
    }
    return false;
  }

  function isNum(v){ return typeof v === 'number' && isFinite(v); }

  // Bolletje met zachte gloed: een keer tekenen, daarna met drawImage schalen (snel bij veel punten).
  function makeSprite(rgb){
    var c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    var g = c.getContext('2d');
    var k = rgb ? rgb[0] + ',' + rgb[1] + ',' + rgb[2] : '255,255,255';
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(' + k + ',0.9)');
    grd.addColorStop(0.22, 'rgba(' + k + ',0.32)');
    grd.addColorStop(0.55, 'rgba(' + k + ',0.07)');
    grd.addColorStop(1, 'rgba(' + k + ',0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return c;
  }

  // Gekleurde gloed: per kleur een sprite, afgerond zodat er tijdens een golf
  // niet voor elke tussenkleur een nieuwe gemaakt wordt.
  var tintSprites = Object.create(null);
  var tintCount = 0;
  function spriteFor(rgb){
    if (!rgb || (rgb[0] === 255 && rgb[1] === 255 && rgb[2] === 255)) return glowSprite;
    var q = [rgb[0] & 0xF8, rgb[1] & 0xF8, rgb[2] & 0xF8];
    var key = q[0] + ',' + q[1] + ',' + q[2];
    var s = tintSprites[key];
    if (s) return s;
    if (tintCount > 96) { tintSprites = Object.create(null); tintCount = 0; }
    s = tintSprites[key] = makeSprite(q);
    tintCount++;
    return s;
  }

  var COLOR_LINE_A = 0.5;       // lijnen met een kleur zijn beter zichtbaar dan de grijze
  var COLOR_HALO_A = 0.13;      // gloed om een gekleurd punt

  function rgbKey(rgb){ return rgb[0] + ',' + rgb[1] + ',' + rgb[2]; }
  function isWhite(rgb){ return !rgb || (rgb[0] === 255 && rgb[1] === 255 && rgb[2] === 255); }

  // Wereld -> scherm via BM.camera (CSS-pixels op het canvas).
  function toScreen(x, y){
    var cam = BM.camera;
    if (cam && typeof cam.worldToScreen === 'function') {
      var p = cam.worldToScreen(x, y);
      if (p && isNum(p.x) && isNum(p.y)) return p;
    }
    return { x: W / 2 + x, y: H / 2 + y };
  }

  // Huidige zoomfactor, afgeleid uit de camera (zonder de camera-interne state te kennen).
  function zoomLevel(){
    var a = toScreen(0, 0);
    var b = toScreen(100, 0);
    var z = (b.x - a.x) / 100;
    return isNum(z) && z > 0 ? z : 1;
  }

  // Straal in schermpixels. Root is dikker; groeit licht met het aantal kinderen.
  function radiusFor(kids, root, zoom){
    var base = root ? 8.5 : 3.2;
    var grow = Math.min(2.4, Math.sqrt(kids || 0) * 0.6);
    var z = clamp(zoom, 0.7, 1.6);
    return (base + grow) * (0.85 + 0.15 * z);
  }

  function labelText(n){
    var t = String(n.title == null ? '' : n.title).replace(/\s+/g, ' ').trim();
    if (!t) t = '(zonder naam)';
    if (t.length > LABEL_MAX) t = t.slice(0, LABEL_MAX - 1) + '...';
    return t;
  }

  function currentProject(){
    var st = BM.store;
    if (!st || typeof st.currentId !== 'function' || typeof st.getProject !== 'function') return null;
    var id = st.currentId();
    if (!id) return null;
    return st.getProject(id) || null;
  }

  // Zorgt dat elk punt een positie heeft (bijv. na import of een gemiste spawn).
  function ensurePositions(proj){
    var nodes = proj.nodes;
    for (var id in nodes) {
      if (!Object.prototype.hasOwnProperty.call(nodes, id)) continue;
      var n = nodes[id];
      if (isNum(n.x) && isNum(n.y)) continue;
      if (n.parentId == null) {
        n.x = 0; n.y = 0; n.vx = 0; n.vy = 0;
        continue;
      }
      var parent = nodes[n.parentId] || null;
      var p = null;
      if (BM.layout && typeof BM.layout.spawnPosition === 'function') {
        try { p = BM.layout.spawnPosition(parent, proj); } catch (e) { p = null; }
      }
      if (p && isNum(p.x) && isNum(p.y)) {
        n.x = p.x; n.y = p.y;
        n.vx = isNum(p.vx) ? p.vx : 0;
        n.vy = isNum(p.vy) ? p.vy : 0;
      } else {
        n.x = (parent && isNum(parent.x) ? parent.x : 0) + (Math.random() - 0.5) * 40;
        n.y = (parent && isNum(parent.y) ? parent.y : 0) + (Math.random() - 0.5) * 40;
        n.vx = 0; n.vy = 0;
      }
    }
  }

  // Treffer-test in schermcoordinaten (client-coordinaten; het canvas zit op 0,0).
  function hitIn(proj, cx, cy){
    if (!proj || !canvas || !isNum(cx) || !isNum(cy)) return null;
    var x = cx - rectLeft;
    var y = cy - rectTop;
    var zoom = zoomLevel();
    var best = null;
    var bestD = Infinity;
    var nodes = proj.nodes;
    for (var id in nodes) {
      if (!Object.prototype.hasOwnProperty.call(nodes, id)) continue;
      var n = nodes[id];
      if (!isNum(n.x) || !isNum(n.y)) continue;
      if (BM.anim && typeof BM.anim.alphaOf === 'function' && BM.anim.alphaOf(id) < 0.05) continue;
      var s = toScreen(n.x, n.y);
      var kids = n.children ? n.children.length : 0;
      var r = radiusFor(kids, n.parentId == null, zoom) + 6;
      var dx = s.x - x;
      var dy = s.y - y;
      var d = dx * dx + dy * dy;
      if (d <= r * r && d < bestD) {
        bestD = d;
        best = id;
      }
    }
    return best;
  }

  function hitTest(sx, sy){
    return hitIn(currentProject(), sx, sy);
  }

  // Hover: bepaal wat er onder de muis staat en laat de dim-overgang lopen.
  // recalc: alleen opnieuw zoeken als muis, camera of punten bewogen hebben.
  // Geeft true als er iets aan de hover-weergave verandert (dan moet er getekend worden).
  function updateHover(proj, dt, recalc){
    var changed = false;
    if (recalc || (hoverId && proj && !proj.nodes[hoverId])) {
      var id = (proj && pointer) ? hitIn(proj, pointer.cx, pointer.cy) : null;
      if (id !== hoverId) {
        hoverId = id;
        if (id) lastHover = id;
        if (canvas) canvas.style.cursor = id ? 'pointer' : '';
        changed = true;
      }
    }
    var target = hoverId ? 1 : 0;
    if (hoverMix !== target) {
      hoverMix += (target - hoverMix) * Math.min(1, dt * 12);
      if (Math.abs(target - hoverMix) < 0.002) hoverMix = target;
      if (!hoverId && hoverMix === 0) lastHover = null;
      changed = true;
    }
    return changed;
  }

  // Tekenen van de hele scene.
  function draw(proj){
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (!proj) return;

    var nodes = proj.nodes;
    var zoom = zoomLevel();
    var labelZ = clamp((zoom - LABEL_Z0) / (LABEL_Z1 - LABEL_Z0), 0, 1);
    var ids = Object.keys(nodes);

    // Diepte en tak (het punt in de eerste ring) per punt.
    var depthOf = {}, branchOf = {};
    function walk(id){
      if (depthOf[id] != null) return;
      var nn = nodes[id], dd = 0, b = id, cur = nn, guard = 0;
      while (cur && cur.parentId != null && nodes[cur.parentId] && guard++ < 200) {
        dd++;
        if (nodes[cur.parentId].parentId != null) b = cur.parentId;
        cur = nodes[cur.parentId];
      }
      depthOf[id] = dd;
      branchOf[id] = dd === 0 ? null : b;
    }
    for (var w0 = 0; w0 < ids.length; w0++) walk(ids[w0]);

    // Doel per punt: alles (hover op midden), een tak (hover op een tak) of rust.
    // Zonder muis op een punt blijft het punt van de open pop-up gemarkeerd.
    var focusId = hoverId || selId;
    var hovLive = focusId && nodes[focusId] ? focusId : null;
    var modeAll = hovLive && depthOf[hovLive] === 0;
    var focusB = hovLive && !modeAll ? branchOf[hovLive] : null;
    var rate = Math.min(1, frameDt * 7);
    easing = false;
    for (var w1 = 0; w1 < ids.length; w1++) {
      var wid = ids[w1];
      var inB = focusB && (branchOf[wid] === focusB || depthOf[wid] === 0);
      var tl = modeAll ? 0.6 : (inB ? 1 : 0);
      var tf = focusB && !inB ? 0.25 : 1;
      var cl = lit[wid] == null ? tl : lit[wid];
      var cf = fade[wid] == null ? tf : fade[wid];
      cl += (tl - cl) * rate; cf += (tf - cf) * rate;
      if (Math.abs(tl - cl) < 0.004) cl = tl; else easing = true;
      if (Math.abs(tf - cf) < 0.004) cf = tf; else easing = true;
      lit[wid] = cl; fade[wid] = cf;
    }
    var drift = !reduceFlag;

    // Kleuren: per punt de (geërfde) kleur, en eventueel een lopende kleurgolf.
    var COL = BM.colors || null;
    var eff = COL ? COL.effective(proj) : null;
    var tNow = performance.now();

    // Schermposities per punt, met schaal (schiet-effect) en alpha (fade bij verwijderen).
    var sp = {};
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var n = nodes[id];
      if (!isNum(n.x) || !isNum(n.y)) continue;
      var s = toScreen(n.x, n.y);
      var kids = n.children ? n.children.length : 0;
      var root = n.parentId == null;
      var k = BM.anim && typeof BM.anim.scaleOf === 'function' ? BM.anim.scaleOf(id) : 1;
      var a = BM.anim && typeof BM.anim.alphaOf === 'function' ? BM.anim.alphaOf(id) : 1;
      if (!isNum(k)) k = 1;
      if (!isNum(a)) a = 1;
      var dimA = fade[id] == null ? 1 : fade[id];
      var look = COL ? COL.nodeLook(id, eff[id] || null, tNow) : null;
      var flash = look ? look.flash : 0;
      var ox = 0, oy = 0;
      if (drift) {
        var ph = phaseOf(id);
        ox = Math.sin(tNow * 0.0006 + ph) * 2.2;
        oy = Math.cos(tNow * 0.0005 + ph * 1.3) * 2.2;
      }
      sp[id] = {
        x: s.x + ox,
        y: s.y + oy,
        d: depthOf[id] || 0,
        lit: lit[id] || 0,
        r: radiusFor(kids, root, zoom) * clamp(0.2 + 0.8 * k, 0, 1.3) * (1 + 0.45 * flash),
        k: clamp(k, 0, 1.3),
        a: clamp(a, 0, 1) * dimA,
        root: root,
        glow: BM.anim && typeof BM.anim.glowOf === 'function' ? (BM.anim.glowOf(id) || 0) : 0,
        rgb: look ? look.rgb : null,
        flash: flash
      };
    }

    // Nieuw punt: tekenen tussen ouder en eindplek, zodat het uit de ouder schiet
    // en de lijn meegroeit.
    if (BM.anim && typeof BM.anim.travelOf === 'function') {
      for (i = 0; i < ids.length; i++) {
        var tid = ids[i];
        var tn = nodes[tid];
        var ts = sp[tid];
        if (!ts || tn.parentId == null) continue;
        var tr = BM.anim.travelOf(tid);
        if (!isNum(tr) || tr >= 1) continue;
        var tp = sp[tn.parentId];
        if (!tp) continue;
        ts.x = tp.x + (ts.x - tp.x) * tr;
        ts.y = tp.y + (ts.y - tp.y) * tr;
      }
    }

    // Alleen tekenen wat (bijna) in beeld is. M = ruimte voor gloed en label.
    var M = 160;
    for (i = 0; i < ids.length; i++) {
      var vo = sp[ids[i]];
      if (vo) vo.vis = vo.x > -M && vo.x < W + M && vo.y > -M && vo.y < H + M;
    }
    function offSameSide(a, b){
      return (a.x < -M && b.x < -M) || (a.x > W + M && b.x > W + M) ||
        (a.y < -M && b.y < -M) || (a.y > H + M && b.y > H + M);
    }

    // Lijnen: in rust zwak; lijnen in een oplichtende tak worden helderder.
    // Een lijn heeft de kleur van het kind waar hij naartoe loopt.
    var tips = [];   // voorkant van de lont: klein lichtpuntje
    function edge(rgb, l, a, x1, y1, x2, y2){
      var al = isWhite(rgb) ? (DIM + (0.7 - DIM) * l) * a : (0.32 + 0.6 * l) * a;
      if (al < 0.004) return;
      ctx.strokeStyle = isWhite(rgb)
        ? 'rgba(255,255,255,' + al.toFixed(3) + ')'
        : 'rgba(' + rgbKey(rgb) + ',' + al.toFixed(3) + ')';
      ctx.lineWidth = (isWhite(rgb) ? 1 : 1.25) + 0.3 * l;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    for (i = 0; i < ids.length; i++) {
      var cid = ids[i];
      var cn = nodes[cid];
      if (cn.parentId == null) continue;
      var p = sp[cn.parentId];
      var c = sp[cid];
      if (!p || !c) continue;
      if (!p.vis && !c.vis && offSameSide(p, c)) continue;
      var el0 = Math.min(p.lit, c.lit);
      var ea0 = Math.min(fade[cn.parentId] == null ? 1 : fade[cn.parentId], fade[cid] == null ? 1 : fade[cid]);
      var el = COL ? COL.edgeLook(cid, tNow) : null;
      if (!el) {
        edge(COL ? COL.rgb(eff[cid] || null) : null, el0, ea0, p.x, p.y, c.x, c.y);
        continue;
      }
      // Kleurgolf over deze lijn: het gevulde stuk heeft de nieuwe kleur.
      var f = el.f;
      var ax = el.rev ? c.x : p.x, ay = el.rev ? c.y : p.y;   // waar de lont begint
      var bx = el.rev ? p.x : c.x, by = el.rev ? p.y : c.y;
      var mxp = ax + (bx - ax) * f, myp = ay + (by - ay) * f;
      if (f > 0) edge(el.to, el0, ea0, ax, ay, mxp, myp);
      if (f < 1) edge(el.from, el0, ea0, mxp, myp, bx, by);
      if (f > 0 && f < 1) tips.push({ x: mxp, y: myp, rgb: el.to, k: Math.sin(Math.PI * f), a: ea0 });
    }
    ctx.lineWidth = 1;

    // Voorkant van de lont: een zacht lichtje dat over de lijn loopt.
    for (var ti = 0; ti < tips.length; ti++) {
      var tp0 = tips[ti];
      var tsz = 16 + 10 * tp0.k;
      ctx.globalAlpha = clamp((0.85 * tp0.k + 0.15) * tp0.a, 0, 1);
      ctx.drawImage(spriteFor(tp0.rgb), tp0.x - tsz / 2, tp0.y - tsz / 2, tsz, tsz);
    }
    ctx.globalAlpha = 1;

    // Gloed: alleen bij oplichtende punten (zoals de kennisboom), plus de bestaande
    // effecten (nieuw punt, kleurgolf). Gekleurde punten houden een zachte eigen gloed.
    for (i = 0; i < ids.length; i++) {
      var gid = ids[i];
      var g = sp[gid];
      if (!g || !g.vis) continue;
      var tinted = !isWhite(g.rgb);
      var ring = g.d === 0 ? 1 : (g.d === 1 ? 0.8 : 0.45);
      var haloA = 0.3 * g.lit * ring + (tinted ? COLOR_HALO_A * 0.6 : 0) + g.glow * 0.55 + g.flash * 0.6;
      haloA *= g.a;
      if (haloA > 0.005) {
        var size = g.r * (g.root ? 9 : 7) + g.glow * g.r * 6 + g.flash * g.r * 8;
        ctx.globalAlpha = clamp(haloA, 0, 1);
        ctx.drawImage(tinted ? spriteFor(g.rgb) : glowSprite, g.x - size / 2, g.y - size / 2, size, size);
      }
    }

    // Punten: in rust grijs (midden licht, verder donkerder), oplichtend wit.
    // Een punt met een eigen kleur houdt die kleur en wordt feller als hij oplicht.
    for (i = 0; i < ids.length; i++) {
      var did = ids[i];
      var d = sp[did];
      if (!d || !d.vis) continue;
      var fill;
      if (isWhite(d.rgb)) {
        var gr = GREY[Math.min(d.d, 2)];
        var v = Math.round(gr + (255 - gr) * clamp(d.lit + d.glow, 0, 1));
        fill = 'rgb(' + v + ',' + v + ',' + v + ')';
      } else {
        var cm = 0.7 + 0.3 * d.lit;
        fill = 'rgb(' + Math.round(d.rgb[0] * cm) + ',' + Math.round(d.rgb[1] * cm) + ',' + Math.round(d.rgb[2] * cm) + ')';
      }
      ctx.fillStyle = fill;
      ctx.globalAlpha = clamp(d.a * (0.45 + 0.55 * clamp(d.k, 0, 1)), 0, 1);
      ctx.beginPath();
      ctx.arc(d.x, d.y, Math.max(0.6, d.r), 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels: midden en eerste ring altijd, dieper bij inzoomen of als de tak oplicht.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(14, 14, 16, 0.9)';
    var lastFont = '';
    // Namen glijden zacht weg of terug (ongeveer 200 ms).
    var namenDoel = namenAan ? 1 : 0;
    if (namenF !== namenDoel) {
      namenF += (namenDoel - namenF) * Math.min(1, frameDt * 14);
      if (Math.abs(namenDoel - namenF) < 0.01) namenF = namenDoel;
      dirty = true;
    }
    for (i = 0; i < ids.length; i++) {
      var lid = ids[i];
      var ln = nodes[lid];
      var l = sp[lid];
      if (!l || !l.vis) continue;
      var lv = Math.min(l.d, 2);
      var lab = lv === 0 ? 0.95 : (lv === 1 ? Math.max(0.85, labelZ) : labelZ * 0.85);
      // Namen uit: alleen het puntje onder de muis (of oplichtend) houdt zijn naam.
      lab = Math.max(lab * namenF, l.lit, l.glow);
      lab *= l.a;
      if (lab < 0.02) continue;
      var font = lv === 0 ? '800 14px' : (lv === 1 ? '600 13px' : '500 12px');
      font += ' Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
      if (font !== lastFont) { ctx.font = font; lastFont = font; }
      var lg = LABEL_GREY[lv].split(',');
      var lc = Math.round(+lg[0] + (255 - +lg[0]) * clamp(l.lit, 0, 1));
      ctx.fillStyle = 'rgb(' + lc + ',' + lc + ',' + lc + ')';
      var text = labelText(ln);
      ctx.globalAlpha = clamp(lab, 0, 1);
      var ty = l.y + l.r + 8;
      ctx.strokeText(text, l.x, ty);
      ctx.fillText(text, l.x, ty);
    }

    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
  }

  function saveQuiet(){
    try {
      if (BM.store && typeof BM.store.save === 'function') BM.store.save();
    } catch (e) { /* opslaan is best-effort */ }
  }

  function frame(){
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    var now = performance.now();
    var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 1 / 60;
    lastT = now;
    frameDt = dt;

    var proj = currentProject();
    var moving = false;
    var settledNow = false;
    if (proj !== lastProj) { lastProj = proj; dirty = true; }
    if (proj) {
      ensurePositions(proj);
      if (BM.layout && typeof BM.layout.step === 'function') {
        var dragging = !!(BM.input && typeof BM.input.isDragging === 'function' && BM.input.isDragging());
        if (reduceFlag && !dragging && typeof BM.layout.isActive === 'function' && BM.layout.isActive(proj.id)) {
          // Minder beweging: de simulatie in een paar frames naar de eindstand rekenen
          // in plaats van seconden te laten glijden.
          var t0 = performance.now();
          while (BM.layout.step(proj, 1 / 60)) {
            if (performance.now() - t0 > 8) break;
          }
          moving = BM.layout.isActive(proj.id);
        } else {
          moving = !!BM.layout.step(proj, dt);
        }
        // Komt de simulatie tot rust, dan de posities één keer wegschrijven.
        if (wasMoving && !moving) { saveQuiet(); settledNow = true; }
        wasMoving = moving;
      }
    }

    var camMoved = cameraChanged();
    var animOn = !!(BM.anim && typeof BM.anim.isActive === 'function' && BM.anim.isActive()) ||
      !!(BM.colors && typeof BM.colors.isActive === 'function' && BM.colors.isActive());
    var hoverChanged = updateHover(proj, dt, pointerMoved || camMoved || moving || settledNow);
    pointerMoved = false;

    // Niets veranderd: deze frame overslaan (geen clearRect, geen tekenwerk).
    if (dirty || moving || settledNow || camMoved || animOn || animWasOn || hoverChanged || easing || (!reduceFlag && proj)) {
      dirty = false;
      draw(proj);
    }
    animWasOn = animOn;
  }

  var lastProj = null;
  var animWasOn = false;

  // Venster naar een scherm met een andere pixeldichtheid: geen resize-event, dus luisteren.
  var dprMQ = null;
  function watchDpr(){
    try {
      if (dprMQ && dprMQ.removeEventListener) dprMQ.removeEventListener('change', onDprChange);
      if (!window.matchMedia) return;
      dprMQ = window.matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)');
      if (dprMQ.addEventListener) dprMQ.addEventListener('change', onDprChange);
    } catch (e) { dprMQ = null; }
  }
  function onDprChange(){ resize(); }

  function resize(){
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    if (BM.camera && typeof BM.camera.setViewport === 'function') {
      try { BM.camera.setViewport(W, H); } catch (e) { /* camera-fout mag de render niet stoppen */ }
    }
    try {
      var rect = canvas.getBoundingClientRect();
      rectLeft = rect.left;
      rectTop = rect.top;
    } catch (e) { rectLeft = 0; rectTop = 0; }
    dirty = true;
    pointerMoved = true;
    watchDpr();
  }

  function onMove(e){
    pointer = { cx: e.clientX, cy: e.clientY };
    pointerMoved = true;
  }

  function onLeave(){
    pointer = null;
    pointerMoved = true;
  }

  // Nieuw punt: schiet-effect via BM.anim.shoot. Gebeurt hier, zodat elke
  // toevoeging (ook vanuit de popup) dezelfde animatie krijgt.
  function onAdded(data){
    if (!data || !BM.anim || typeof BM.anim.shoot !== 'function') return;
    var st = BM.store;
    var node = st && typeof st.getNode === 'function' ? st.getNode(data.nodeId) : null;
    if (!node) return;
    try {
      BM.anim.shoot(node, {});
    } catch (e) { /* animatie is decoratief */ }
  }

  function init(){
    if (running) return;
    canvas = document.getElementById('bm-canvas') || document.querySelector('canvas.bm-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'bm-canvas';
      document.body.insertBefore(canvas, document.body.firstChild);
    }
    canvas.classList.add('bm-canvas');
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    glowSprite = makeSprite();
    resize();

    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    if (!wired && BM.bus && typeof BM.bus.on === 'function') {
      wired = true;
      BM.bus.on('node:added', onAdded);
      BM.bus.on('ui:popup-opened', function(d){
        selId = d && d.nodeId ? d.nodeId : null;
        markDirty();
      });
      BM.bus.on('ui:popup-closed', function(){ selId = null; markDirty(); });
      BM.bus.on('node:focus', function(d){
        if (d && d.nodeId && BM.anim && typeof BM.anim.pulse === 'function') BM.anim.pulse(d.nodeId);
        markDirty();
      });
      ['store:changed', 'node:added', 'node:removed', 'node:renamed', 'node:text', 'node:color',
        'project:switched', 'project:spacing']
        .forEach(function(ev){
          BM.bus.on(ev, function(){ markDirty(); pointerMoved = true; });
        });
    }

    BM.render.canvas = canvas;
    running = true;
    lastT = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop(){
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  BM.render = {
    canvas: canvas,
    init: init,
    stop: stop,
    hitTest: hitTest,
    invalidate: markDirty,
    namen: zetNamen,
    namenAan: function(){ return namenAan; },
    getHoverId: function(){ return hoverId; }
  };
})();
