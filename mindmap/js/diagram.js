/*
 * diagram.js
 * Tidy-tree layout voor de diagram-modus: alles in rechte lijnen,
 * vanuit het hoofdpunt naar rechts en naar links. Hoofdpunt staat op (0, 0), elk niveau is een kolom,
 * bladeren staan onder elkaar, een ouder staat in het midden van zijn kinderen.
 * Iteratief (geen recursie), zodat diepe bomen geen stack overflow geven.
 */
(function () {
  var BM = window.BM = window.BM || {};

  // Basisafmetingen (wereldunits), vermenigvuldigd met de spacing-factor
  var COL_BASE = 220;
  var ROW_BASE = 46;

  // Collator voor natuurlijke sortering van titels (Nederlands, cijfers in getallen)
  var collator = null;
  try {
    collator = new Intl.Collator('nl', { numeric: true, sensitivity: 'base' });
  } catch (e) {
    collator = null;
  }

  // Vergelijk twee titels; met fallback als Intl niet beschikbaar is
  function compareTitles(a, b) {
    if (collator) return collator.compare(a, b);
    var la = a.toLowerCase();
    var lb = b.toLowerCase();
    if (la < lb) return -1;
    if (la > lb) return 1;
    return 0;
  }

  // Sorteer kinderen op titel, bij gelijke titel op created, daarna op id (deterministisch)
  function makeComparator(nodes) {
    return function (idA, idB) {
      var a = nodes[idA] || {};
      var b = nodes[idB] || {};
      var ta = String(a.title == null ? '' : a.title);
      var tb = String(b.title == null ? '' : b.title);
      var r = compareTitles(ta, tb);
      if (r !== 0) return r;
      var ca = typeof a.created === 'number' ? a.created : 0;
      var cb = typeof b.created === 'number' ? b.created : 0;
      if (ca !== cb) return ca - cb;
      return idA < idB ? -1 : (idA > idB ? 1 : 0);
    };
  }

  // Bouw een kinder-map uit parentId (de bron van waarheid voor de boomstructuur)
  function buildChildMap(nodes) {
    var kids = {};
    var id;
    for (id in nodes) {
      if (!Object.prototype.hasOwnProperty.call(nodes, id)) continue;
      var n = nodes[id];
      if (!n || n.parentId == null) continue;
      var pid = String(n.parentId);
      if (pid === id || !nodes[pid]) continue;
      if (!kids[pid]) kids[pid] = [];
      kids[pid].push(id);
    }
    var cmp = makeComparator(nodes);
    for (id in kids) {
      if (Object.prototype.hasOwnProperty.call(kids, id)) kids[id].sort(cmp);
    }
    return kids;
  }

  // Afronden op 2 decimalen, voorkomt floating-point ruis
  function round2(v) {
    return Math.round(v * 100) / 100;
  }

  /*
   * layout(project, spacing) -> { nodeId: { x, y } }
   * spacing: factor (1 = standaard). Ontbreekt of ongeldig: 1.
   */
  function layout(project, spacing) {
    var result = {};
    if (!project || !project.nodes || typeof project.nodes !== 'object') return result;

    var nodes = project.nodes;
    var rootId = project.rootId == null ? null : String(project.rootId);
    if (rootId === null || !nodes[rootId]) return result;

    var sp = (typeof spacing === 'number' && spacing > 0 && isFinite(spacing)) ? spacing : 1;
    var COL = COL_BASE * sp;
    var ROW = ROW_BASE * sp;

    var kids = buildChildMap(nodes);

    // Stap 1: preorder-volgorde en diepte, iteratief met een stack
    // Kinderen worden in omgekeerde volgorde op de stack gezet, zodat het eerste kind eerst komt
    var order = [];
    var depth = {};
    var visited = {};
    var stack = [{ id: rootId, d: 0 }];
    visited[rootId] = true;

    while (stack.length) {
      var item = stack.pop();
      order.push(item.id);
      depth[item.id] = item.d;
      var list = kids[item.id] || [];
      for (var i = list.length - 1; i >= 0; i--) {
        var cid = list[i];
        if (visited[cid]) continue;
        visited[cid] = true;
        stack.push({ id: cid, d: item.d + 1 });
      }
    }

    // Stap 2: twee kanten. De takken van het hoofdpunt worden verdeeld over rechts
    // en links (op volgorde, zo dat beide kanten ongeveer even veel bladeren hebben).
    var leaves = {};
    var k;
    for (k = order.length - 1; k >= 0; k--) {
      var lid = order[k];
      var lk = kids[lid];
      if (!lk || !lk.length) { leaves[lid] = 1; continue; }
      var som = 0;
      for (var q = 0; q < lk.length; q++) som += leaves[lk[q]] || 0;
      leaves[lid] = som;
    }
    var side = {};
    side[rootId] = 1;
    var top = kids[rootId] || [];
    var totaal = 0;
    for (k = 0; k < top.length; k++) totaal += leaves[top[k]] || 1;
    var rechts = 0;
    for (k = 0; k < top.length; k++) {
      var tid = top[k];
      // Rechts vullen tot de helft; de rest gaat naar links. Eén tak: altijd rechts.
      var naarRechts = top.length < 2 || k === 0 || rechts + (leaves[tid] || 1) / 2 <= totaal / 2;
      side[tid] = naarRechts ? 1 : -1;
      if (naarRechts) rechts += leaves[tid] || 1;
    }
    for (k = 0; k < order.length; k++) {
      var sid = order[k];
      if (side[sid] == null) side[sid] = side[nodes[sid] ? String(nodes[sid].parentId) : rootId] || 1;
    }

    // Stap 3: bladeren krijgen per kant opeenvolgende rijen (preorder = van boven naar beneden).
    var rowOf = {};
    var nextRow = { '1': 0, '-1': 0 };
    for (k = 0; k < order.length; k++) {
      var id = order[k];
      if (id === rootId) continue;
      var kl = kids[id];
      if (!kl || kl.length === 0) {
        rowOf[id] = nextRow[side[id]];
        nextRow[side[id]]++;
      }
    }

    // Stap 4: ouders in omgekeerde preorder in het midden van eerste en laatste kind.
    for (k = order.length - 1; k >= 0; k--) {
      var pid = order[k];
      if (pid === rootId) continue;
      var ch = kids[pid];
      if (ch && ch.length > 0) {
        rowOf[pid] = (rowOf[ch[0]] + rowOf[ch[ch.length - 1]]) / 2;
      }
    }

    // Stap 5: wereldcoordinaten. Elke kant staat verticaal gecentreerd rond het hoofdpunt;
    // rechts x = diepte * kolom, links x = -diepte * kolom.
    var midden = { '1': (nextRow['1'] - 1) / 2, '-1': (nextRow['-1'] - 1) / 2 };
    result[rootId] = { x: 0, y: 0 };
    for (k = 0; k < order.length; k++) {
      var nid = order[k];
      if (nid === rootId) continue;
      var s = side[nid];
      result[nid] = {
        x: round2(s * depth[nid] * COL),
        y: round2((rowOf[nid] - midden[s]) * ROW)
      };
    }

    return result;
  }

  BM.diagram = {
    layout: layout,
    COL_BASE: COL_BASE,
    ROW_BASE: ROW_BASE
  };
})();
