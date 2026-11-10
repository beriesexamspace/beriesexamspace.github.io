(function () {
  'use strict';
  var BM = window.BM = window.BM || {};

  // Datamodel: project = {id, name, created, rootId, nodes:{id: node}}
  // node = {id, parentId, title, text, children:[ids], x, y, vx, vy, created, color?}
  // project.spacing = afstand tussen de punten (1 = standaard), per project bewaard.
  // color = eigen kleur van een punt ('#rrggbb'); geldt ook voor alles eronder,
  // tot een dieper punt een eigen kleur heeft. Geen kleur = veld ontbreekt.
  // Alle maps zijn zonder prototype, zodat ids als "constructor" veilig zijn.

  var KEY = 'berie-mindmap-v1';
  var BACKUP_KEY = 'berie-mindmap-v1-kapot';
  var FORMAT = 'berie-mindmap';
  var VERSION = 1;
  var MAX_NAME = 80;
  var MAX_TITLE = 200;
  var MAX_TEXT = 1000000; // localStorage is de echte grens; nooit stil inkorten
  var MAX_IMPORT_CHARS = 20 * 1024 * 1024;
  var DEFAULT_NODE_TITLE = 'Nieuw punt';
  var DEFAULT_PROJECT_NAME = 'Naamloos project';
  var VALID_ID = /^[A-Za-z0-9_-]{1,80}$/;

  var ORPHAN_KEY = 'berie-mindmap-v1-niet-geladen';
  var SPACING_MIN = 0.5;
  var SPACING_MAX = 3;
  var PALETTE_MAX = 24;   // eigen kleuren in het palet
  var palette = [];       // eigen kleuren ('#rrggbb'), globaal (alle projecten)
  // Vaste kleuren van het palet (colors.js toont ze). Die horen nooit in de eigen
  // kleuren: een dubbele zou onzichtbaar een plek bezetten.
  var PRESET_COLORS = [
    { hex: '#8b7cf6', name: 'Paars' },
    { hex: '#5b9cff', name: 'Blauw' },
    { hex: '#3fc1c9', name: 'Turquoise' },
    { hex: '#5fd38d', name: 'Groen' },
    { hex: '#f2c14e', name: 'Geel' },
    { hex: '#f28c5b', name: 'Oranje' },
    { hex: '#f0646e', name: 'Rood' },
    { hex: '#e879c6', name: 'Roze' }
  ];

  function isPresetColor(c) {
    for (var i = 0; i < PRESET_COLORS.length; i++) if (PRESET_COLORS[i].hex === c) return true;
    return false;
  }
  var SAVE_DELAY = 150;

  var state = { currentId: null, projects: Object.create(null) };
  var nodeIndex = Object.create(null); // nodeId -> projectId
  var idSeq = 0;
  var lastSaveOk = true;
  var readOnly = false;   // kapotte data kon niet apart bewaard worden: niets overschrijven
  var stale = false;      // een ander tabblad heeft intussen opgeslagen: niet overschrijven
  var lastWritten = null; // tekst die dit tabblad als laatste las of schreef
  var saveTimer = 0;
  var loadIssue = null;   // {kind:'corrupt'|'skipped', count, raw}
  var lastDropped = 0;    // punten die bij de laatste sanitizeProject wegvielen

  function emit(name, data) {
    if (BM.bus && typeof BM.bus.emit === 'function') {
      BM.bus.emit(name, data);
    }
  }

  function warn(msg, err) {
    try { console.warn('[BM.store] ' + msg, err || ''); } catch (e) { /* console kan ontbreken */ }
  }

  function num(v, fallback) {
    return (typeof v === 'number' && isFinite(v)) ? v : fallback;
  }

  function cleanName(value, max, fallback) {
    if (typeof value !== 'string') return fallback;
    var s = value.replace(/\s+/g, ' ').trim();
    if (!s) return fallback;
    return s.length > max ? s.slice(0, max) : s;
  }

  // '#abc', 'abc', '#AABBCC' -> '#aabbcc'; anders null.
  function normalizeColor(v) {
    if (typeof v !== 'string') return null;
    var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v.trim());
    if (!m) return null;
    var h = m[1].toLowerCase();
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return '#' + h;
  }

  function cleanSpacing(v) {
    v = num(v, 1);
    return v < SPACING_MIN ? SPACING_MIN : (v > SPACING_MAX ? SPACING_MAX : v);
  }

  function cleanPalette(list) {
    var out = [];
    if (!Array.isArray(list)) return out;
    for (var i = 0; i < list.length && out.length < PALETTE_MAX; i++) {
      var c = normalizeColor(list[i]);
      if (c && !isPresetColor(c) && out.indexOf(c) === -1) out.push(c);
    }
    return out;
  }

  function makeId(prefix) {
    idSeq = (idSeq + 1) % 1679616;
    return prefix + Date.now().toString(36) + idSeq.toString(36) +
      Math.random().toString(36).slice(2, 8);
  }

  // Unieke id, controleert bestaande items en de meegegeven 'used' set.
  function freshId(prefix, used) {
    var id;
    do {
      id = makeId(prefix);
    } while (nodeIndex[id] || state.projects[id] || used[id]);
    used[id] = true;
    return id;
  }

  function makeNode(id, parentId, title, x, y, vx, vy) {
    return {
      id: id,
      parentId: parentId,
      title: title,
      text: '',
      children: [],
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      created: Date.now()
    };
  }

  function cloneNode(n) {
    var c = {
      id: n.id,
      parentId: n.parentId,
      title: n.title,
      text: n.text,
      children: n.children.slice(),
      x: n.x,
      y: n.y,
      vx: n.vx,
      vy: n.vy,
      created: n.created
    };
    if (n.color) c.color = n.color;
    return c;
  }

  function register(project) {
    state.projects[project.id] = project;
    Object.keys(project.nodes).forEach(function (nid) {
      nodeIndex[nid] = project.id;
    });
  }

  function projectOf(nodeId) {
    if (typeof nodeId !== 'string') return null;
    var pid = nodeIndex[nodeId];
    return pid ? (state.projects[pid] || null) : null;
  }

  function listProjects() {
    return Object.keys(state.projects)
      .map(function (k) { return state.projects[k]; })
      .sort(function (a, b) {
        if (a.created !== b.created) return a.created - b.created;
        return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
      });
  }

  function firstProjectId() {
    var list = listProjects();
    return list.length ? list[0].id : null;
  }

  // Valideert en herbouwt een project. remap=true geeft altijd nieuwe ids
  // (import); remap=false houdt de bestaande ids waar dat kan (laden).
  // Knooppunten die niet vanuit de root bereikbaar zijn (cycli, wees) vallen weg.
  function sanitizeProject(raw, remap) {
    if (!raw || typeof raw !== 'object' || !raw.nodes || typeof raw.nodes !== 'object') return null;

    var src = Object.create(null);
    Object.keys(raw.nodes).forEach(function (key) {
      var n = raw.nodes[key];
      if (!n || typeof n !== 'object') return;
      var oid = (n.id != null) ? String(n.id) : key;
      if (!src[oid]) src[oid] = n;
    });

    var rootOrig = null;
    if (raw.rootId != null && src[String(raw.rootId)]) rootOrig = String(raw.rootId);
    if (rootOrig === null) {
      Object.keys(src).some(function (k) {
        if (src[k].parentId == null) { rootOrig = k; return true; }
        return false;
      });
    }
    if (rootOrig === null) return null;

    var kids = Object.create(null);
    Object.keys(src).forEach(function (k) {
      if (k === rootOrig || src[k].parentId == null) return;
      var p = String(src[k].parentId);
      if (p === k || !src[p]) return;
      (kids[p] = kids[p] || []).push(k);
    });
    // Volgorde van de kinderen: zoals opgeslagen in children[], de rest op aanmaaktijd.
    Object.keys(kids).forEach(function (p) {
      var order0 = Object.create(null);
      var saved = Array.isArray(src[p].children) ? src[p].children : [];
      for (var s = 0; s < saved.length; s++) {
        var key = String(saved[s]);
        if (order0[key] === undefined) order0[key] = s;
      }
      kids[p].sort(function (a, b) {
        var ia = order0[a], ib = order0[b];
        if (ia !== undefined && ib !== undefined) return ia - ib;
        if (ia !== undefined) return -1;
        if (ib !== undefined) return 1;
        return num(src[a].created, 0) - num(src[b].created, 0);
      });
    });

    // Breedte-eerst vanaf de root: alleen bereikbare knooppunten, ouder altijd voor kind.
    var order = [rootOrig];
    var seen = Object.create(null);
    seen[rootOrig] = true;
    for (var i = 0; i < order.length; i++) {
      var list = kids[order[i]] || [];
      for (var j = 0; j < list.length; j++) {
        if (!seen[list[j]]) {
          seen[list[j]] = true;
          order.push(list[j]);
        }
      }
    }

    lastDropped = Object.keys(src).length - order.length;

    var used = Object.create(null);
    var idMap = Object.create(null);

    function assign(oid) {
      var nid;
      if (!remap && VALID_ID.test(oid) && !nodeIndex[oid] && !state.projects[oid] && !used[oid]) {
        nid = oid;
        used[nid] = true;
      } else {
        nid = freshId('n', used);
      }
      idMap[oid] = nid;
      return nid;
    }

    var pid;
    var rawPid = (typeof raw.id === 'string') ? raw.id : null;
    if (!remap && rawPid && VALID_ID.test(rawPid) && !state.projects[rawPid]) {
      pid = rawPid;
      used[pid] = true;
    } else {
      pid = freshId('p', used);
    }

    var nodes = Object.create(null);
    order.forEach(function (oid) {
      var r = src[oid];
      var nid = assign(oid);
      var parentNid = (oid === rootOrig) ? null : idMap[String(r.parentId)];
      var node = makeNode(
        nid,
        parentNid,
        cleanName(r.title, MAX_TITLE, DEFAULT_NODE_TITLE),
        num(r.x, 0),
        num(r.y, 0),
        num(r.vx, 0),
        num(r.vy, 0)
      );
      node.text = (typeof r.text === 'string') ? r.text.slice(0, MAX_TEXT) : '';
      node.created = num(r.created, Date.now());
      var col = normalizeColor(r.color);
      if (col) node.color = col;
      nodes[nid] = node;
      if (parentNid !== null) nodes[parentNid].children.push(nid);
    });

    var rootNid = idMap[rootOrig];
    var name = cleanName(raw.name, MAX_NAME,
      cleanName(src[rootOrig].title, MAX_NAME, DEFAULT_PROJECT_NAME));
    nodes[rootNid].title = name;

    return {
      id: pid,
      name: name,
      created: num(raw.created, Date.now()),
      rootId: rootNid,
      spacing: cleanSpacing(raw.spacing),
      nodes: nodes
    };
  }

  function subtreeIn(project, rootId) {
    var out = [];
    var stack = [rootId];
    var seen = Object.create(null);
    while (stack.length) {
      var cur = stack.pop();
      var n = project.nodes[cur];
      if (!n || seen[cur]) continue;
      seen[cur] = true;
      out.push(cur);
      for (var i = n.children.length - 1; i >= 0; i--) stack.push(n.children[i]);
    }
    return out;
  }

  function spawnFor(parent, project) {
    var pos = null;
    if (BM.layout && typeof BM.layout.spawnPosition === 'function') {
      try {
        pos = BM.layout.spawnPosition(parent, project);
      } catch (e) {
        warn('layout.spawnPosition faalde, terugval gebruikt', e);
        pos = null;
      }
    }
    if (pos && isFinite(pos.x) && isFinite(pos.y)) {
      return {
        x: pos.x,
        y: pos.y,
        vx: num(pos.vx, 0),
        vy: num(pos.vy, 0)
      };
    }
    var angle = Math.random() * Math.PI * 2;
    var dist = 90;
    return {
      x: parent.x + Math.cos(angle) * dist,
      y: parent.y + Math.sin(angle) * dist,
      vx: Math.cos(angle) * 4,
      vy: Math.sin(angle) * 4
    };
  }

  function normalizeImport(data) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return null;
    if (Array.isArray(data.projects)) return data.projects;
    if (data.projects && typeof data.projects === 'object') {
      return Object.keys(data.projects).map(function (k) {
        var p = data.projects[k];
        if (p && typeof p === 'object' && p.id == null) p.id = k;
        return p;
      });
    }
    if (data.nodes && typeof data.nodes === 'object') return [data];
    return null;
  }

  // Wijzigingen worden kort gebundeld, zodat snel typen of veel toevoegen
  // niet bij elke stap de hele opslag wegschrijft. save() schrijft altijd direct.
  function requestSave() {
    if (saveTimer) return;
    saveTimer = setTimeout(function () {
      saveTimer = 0;
      save();
    }, SAVE_DELAY);
  }

  function setSaveOk(ok) {
    var was = lastSaveOk;
    lastSaveOk = ok;
    if (was && !ok) emit('store:save-failed', { readOnly: readOnly, stale: stale });
    else if (!was && ok) emit('store:save-ok', {});
  }

  function markStale() {
    if (stale) return;
    stale = true;
    emit('store:stale', {});
    setSaveOk(false);
  }

  function save() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = 0;
    }
    if (readOnly || stale) {
      // Niet wegschrijven: anders gaat data verloren die nog niet veilig is.
      setSaveOk(false);
      return false;
    }
    var text;
    try {
      text = JSON.stringify({
        format: FORMAT,
        version: VERSION,
        currentId: state.currentId,
        palette: palette,
        projects: state.projects
      });
    } catch (e) {
      setSaveOk(false);
      warn('opslaan: serialiseren mislukt', e);
      return false;
    }
    // Niets veranderd sinds de vorige keer: niet opnieuw schrijven (spaart werk en
    // voorkomt dat een ander open tabblad onnodig een melding krijgt).
    if (text === lastWritten && lastSaveOk) return true;
    try {
      // Heeft een ander tabblad intussen iets anders opgeslagen? Dan niet overschrijven.
      var current = window.localStorage.getItem(KEY);
      if (current !== lastWritten && current !== text) {
        markStale();
        return false;
      }
      window.localStorage.setItem(KEY, text);
      lastWritten = text;
      setSaveOk(true);
      return true;
    } catch (e) {
      // Geen opslag beschikbaar (privé-venster, vol, geblokkeerd): gewoon in geheugen verder werken.
      setSaveOk(false);
      warn('opslaan in localStorage mislukt, werkt verder in geheugen', e);
      return false;
    }
  }

  // Probeert een waarde weg te schrijven; geeft true als dat lukte.
  function trySet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Na "Kopie downloaden" mag de app weer gewoon opslaan.
  function releaseReadOnly() {
    if (!readOnly) return;
    readOnly = false;
    save();
  }

  function load() {
    state = { currentId: null, projects: Object.create(null) };
    nodeIndex = Object.create(null);
    loadIssue = null;
    readOnly = false;
    stale = false;
    lastWritten = null;
    palette = [];

    var text = null;
    try {
      text = window.localStorage.getItem(KEY);
    } catch (e) {
      text = null;
      warn('lezen uit localStorage mislukt', e);
    }
    lastWritten = text;
    if (!text) return;

    var data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      warn('opgeslagen data is geen geldige JSON, kopie bewaard onder ' + BACKUP_KEY, e);
      data = null;
    }
    if (!data || typeof data !== 'object' || !data.projects || typeof data.projects !== 'object') {
      var backed = trySet(BACKUP_KEY, text);
      // Lukt de reservekopie niet (bijv. opslag vol), dan de hoofdsleutel niet overschrijven
      // tot de gebruiker zelf een kopie heeft gedownload.
      if (!backed) readOnly = true;
      loadIssue = { kind: 'corrupt', count: 0, raw: text, backedUp: backed };
      return;
    }

    palette = cleanPalette(data.palette);

    var bad = [];
    Object.keys(data.projects).forEach(function (key) {
      var raw = data.projects[key];
      if (raw && typeof raw === 'object' && raw.id == null) raw.id = key;
      var p = sanitizeProject(raw, false);
      if (p) register(p);
      else bad.push(raw);
    });
    // Nooit stil data weggooien die we niet begrijpen: apart bewaren en melden.
    if (bad.length) {
      var keep = [];
      try {
        var old = JSON.parse(window.localStorage.getItem(ORPHAN_KEY) || '[]');
        if (Array.isArray(old)) keep = old;
      } catch (e4) { keep = []; }
      var rawText = JSON.stringify(keep.concat(bad));
      var kept = trySet(ORPHAN_KEY, rawText);
      if (!kept) readOnly = true;
      loadIssue = { kind: 'skipped', count: bad.length, raw: JSON.stringify(bad), backedUp: kept };
    }

    var wanted = (typeof data.currentId === 'string') ? data.currentId : null;
    state.currentId = (wanted && state.projects[wanted]) ? wanted : firstProjectId();
  }

  // Zet de localStorage-sleutel (per account). Moet vóór load() worden aangeroepen.
  // De herstel- en afvangsleutels volgen de hoofdsleutel.
  function setKey(k) {
    if (typeof k !== 'string' || !k) return false;
    KEY = k;
    BACKUP_KEY = k + '-kapot';
    ORPHAN_KEY = k + '-niet-geladen';
    return true;
  }

  function getKey() {
    return KEY;
  }

  // Kopie van wat save() wegschrijft (voor de cloud). Diepe kopie via JSON.
  function snapshot() {
    return JSON.parse(JSON.stringify({
      format: FORMAT,
      version: VERSION,
      currentId: state.currentId,
      palette: palette,
      projects: state.projects
    }));
  }

  function currentId() {
    return state.currentId;
  }

  function getProject(id) {
    return (typeof id === 'string' && state.projects[id]) || null;
  }

  function setCurrent(id) {
    if (!getProject(id)) return false;
    if (state.currentId === id) return true;
    state.currentId = id;
    requestSave();
    emit('project:switched', { projectId: id });
    return true;
  }

  function createProject(name) {
    var used = Object.create(null);
    var id = freshId('p', used);
    var rootId = freshId('n', used);
    var pname = cleanName(name, MAX_NAME, DEFAULT_PROJECT_NAME);

    var project = {
      id: id,
      name: pname,
      created: Date.now(),
      rootId: rootId,
      spacing: 1,
      nodes: Object.create(null)
    };
    project.nodes[rootId] = makeNode(rootId, null, pname, 0, 0, 0, 0);
    register(project);

    if (!state.currentId) state.currentId = id;
    requestSave();
    emit('store:changed', { projectId: id });
    return project;
  }

  function renameProject(id, name) {
    var p = getProject(id);
    if (!p) return false;
    p.name = cleanName(name, MAX_NAME, p.name);
    var root = p.nodes[p.rootId];
    if (root) root.title = p.name;
    requestSave();
    emit('store:changed', { projectId: id });
    emit('node:renamed', { projectId: id, nodeId: p.rootId });
    return true;
  }

  function deleteProject(id) {
    var p = getProject(id);
    if (!p) return false;
    Object.keys(p.nodes).forEach(function (nid) { delete nodeIndex[nid]; });
    delete state.projects[id];

    var switched = false;
    if (state.currentId === id) {
      state.currentId = firstProjectId();
      switched = true;
    }
    requestSave();
    emit('store:changed', { projectId: id });
    if (switched) emit('project:switched', { projectId: state.currentId });
    return true;
  }

  function getNode(id) {
    var project = projectOf(id);
    return project ? (project.nodes[id] || null) : null;
  }

  function children(id) {
    var project = projectOf(id);
    if (!project) return [];
    var node = project.nodes[id];
    return node.children.map(function (cid) { return project.nodes[cid]; })
      .filter(Boolean);
  }

  // Ids van het punt zelf en alle afstammelingen, in volgorde (diepte-eerst).
  function subtree(id) {
    var project = projectOf(id);
    if (!project) return [];
    return subtreeIn(project, id);
  }

  function depth(id) {
    var project = projectOf(id);
    if (!project) return -1;
    var n = project.nodes[id];
    var d = 0;
    var guard = 0;
    while (n && n.parentId != null && guard < 100000) {
      d++;
      guard++;
      n = project.nodes[n.parentId];
    }
    return d;
  }

  function addNode(parentId, title) {
    var project = projectOf(parentId);
    if (!project) return null;
    var parent = project.nodes[parentId];

    var nid = freshId('n', Object.create(null));
    var pos = spawnFor(parent, project);
    var node = makeNode(
      nid,
      parentId,
      cleanName(title, MAX_TITLE, DEFAULT_NODE_TITLE),
      pos.x, pos.y, pos.vx, pos.vy
    );

    project.nodes[nid] = node;
    nodeIndex[nid] = project.id;
    parent.children.push(nid);

    requestSave();
    emit('store:changed', { projectId: project.id });
    emit('node:added', { projectId: project.id, nodeId: nid });
    return node;
  }

  // Verwijdert het punt met de hele subtak. De root kan niet weg (geeft null).
  // Geeft een snapshot terug waarmee restoreSnapshot() het kan ongedaan maken.
  function removeNode(nodeId) {
    var project = projectOf(nodeId);
    if (!project || nodeId === project.rootId) return null;

    var node = project.nodes[nodeId];
    var parent = (node.parentId != null) ? (project.nodes[node.parentId] || null) : null;
    var index = parent ? parent.children.indexOf(nodeId) : -1;
    var ids = subtreeIn(project, nodeId);
    var copies = ids.map(function (id) { return cloneNode(project.nodes[id]); });

    if (parent && index !== -1) parent.children.splice(index, 1);
    ids.forEach(function (id) {
      delete project.nodes[id];
      delete nodeIndex[id];
    });

    requestSave();
    emit('store:changed', { projectId: project.id });
    emit('node:removed', { projectId: project.id, nodeIds: ids.slice() });

    return {
      projectId: project.id,
      parentId: node.parentId,
      index: index,
      nodeIds: ids,
      nodes: copies
    };
  }

  // Zet een verwijderde subtak terug (undo). Geeft false als dat niet kan.
  function restoreSnapshot(snap) {
    if (!snap || !Array.isArray(snap.nodes) || !snap.nodes.length) return false;
    var project = getProject(snap.projectId);
    if (!project || snap.parentId == null || !project.nodes[snap.parentId]) return false;

    var clash = snap.nodes.some(function (n) {
      return !n || nodeIndex[n.id] || project.nodes[n.id];
    });
    if (clash) return false;

    snap.nodes.forEach(function (n) {
      project.nodes[n.id] = cloneNode(n);
      nodeIndex[n.id] = project.id;
    });

    var parent = project.nodes[snap.parentId];
    var top = snap.nodes[0].id;
    var at = Math.max(0, Math.min(parent.children.length, num(snap.index, parent.children.length)));
    parent.children.splice(at, 0, top);

    requestSave();
    emit('store:changed', { projectId: project.id });
    emit('node:added', { projectId: project.id, nodeId: top });
    return true;
  }

  function renameNode(id, title) {
    var project = projectOf(id);
    if (!project) return false;
    var node = project.nodes[id];
    node.title = cleanName(title, MAX_TITLE, node.title);
    if (id === project.rootId) project.name = node.title;
    requestSave();
    emit('store:changed', { projectId: project.id });
    emit('node:renamed', { projectId: project.id, nodeId: id });
    return true;
  }

  function setText(id, text) {
    var project = projectOf(id);
    if (!project) return false;
    var node = project.nodes[id];
    node.text = (typeof text === 'string') ? text.slice(0, MAX_TEXT) : '';
    requestSave();
    emit('store:changed', { projectId: project.id });
    emit('node:text', { projectId: project.id, nodeId: id });
    return true;
  }

  // ---------- kleuren ----------

  // Eigen kleur zetten (of weghalen met null of ''). Geeft false als het punt niet
  // bestaat of de kleur ongeldig is.
  function setColor(id, color) {
    var project = projectOf(id);
    if (!project) return false;
    var node = project.nodes[id];
    var next = null;
    if (color != null && color !== '') {
      next = normalizeColor(color);
      if (!next) return false;
    }
    var prev = node.color || null;
    if (prev === next) return true;
    if (next) node.color = next;
    else delete node.color;
    requestSave();
    emit('store:changed', { projectId: project.id });
    emit('node:color', { projectId: project.id, nodeId: id, color: next, prev: prev });
    return true;
  }

  // De kleur die een punt toont: zijn eigen kleur, anders die van het dichtstbijzijnde
  // bovenliggende punt met een kleur, anders null.
  function effectiveColor(id) {
    var project = projectOf(id);
    if (!project) return null;
    var n = project.nodes[id];
    var guard = 0;
    while (n && guard++ < 100000) {
      if (n.color) return n.color;
      n = n.parentId != null ? project.nodes[n.parentId] : null;
    }
    return null;
  }

  function getPalette() {
    return palette.slice();
  }

  // Geeft false (ongeldig) of { ok: true, added, dropped } terug. Een vaste kleur
  // wordt niet toegevoegd (staat al in het palet). Is het palet vol, dan gaat de
  // oudste eigen kleur eruit; die staat dan in 'dropped' (voor Ongedaan maken).
  // 'at' (optioneel): plek waar de kleur terugkomt (bij Ongedaan maken).
  function addPaletteColor(color, at) {
    var c = normalizeColor(color);
    if (!c) return false;
    if (isPresetColor(c) || palette.indexOf(c) !== -1) return { ok: true, added: false, dropped: null };
    var dropped = null;
    if (palette.length >= PALETTE_MAX) dropped = palette.shift();
    if (typeof at === 'number' && at >= 0 && at < palette.length) palette.splice(at, 0, c);
    else palette.push(c);
    requestSave();
    emit('palette:changed', { palette: palette.slice() });
    return { ok: true, added: true, dropped: dropped };
  }

  function removePaletteColor(color) {
    var c = normalizeColor(color);
    var i = c ? palette.indexOf(c) : -1;
    if (i === -1) return false;
    palette.splice(i, 1);
    requestSave();
    emit('palette:changed', { palette: palette.slice() });
    return true;
  }

  // ---------- afstand ----------

  function getSpacing(projectId) {
    var p = getProject(projectId);
    return p ? cleanSpacing(p.spacing) : 1;
  }

  function setSpacing(projectId, value) {
    var p = getProject(projectId);
    if (!p) return false;
    var v = cleanSpacing(value);
    if (p.spacing === v) return true;
    p.spacing = v;
    requestSave();
    emit('project:spacing', { projectId: p.id, spacing: v });
    return true;
  }

  function exportJSON(projectId) {
    var list;
    if (projectId) {
      var p = getProject(projectId);
      list = p ? [p] : [];
    } else {
      list = listProjects();
    }
    return JSON.stringify({
      format: FORMAT,
      version: VERSION,
      exportedAt: new Date().toISOString(),
      palette: palette,
      projects: list
    }, null, 2);
  }

  // Importeert één of meer projecten. Alle ids worden opnieuw gemaakt,
  // dus er kan nooit een botsing ontstaan met bestaande data.
  function importJSON(text) {
    function fail(msg) {
      return { ok: false, count: 0, skipped: 0, projectIds: [], error: msg };
    }

    if (typeof text === 'string' && text.length > MAX_IMPORT_CHARS) {
      return fail('Dit bestand is te groot.');
    }

    var data;
    try {
      data = (typeof text === 'string') ? JSON.parse(text) : text;
    } catch (e) {
      return fail('Dit bestand is geen geldige JSON.');
    }

    if (data && typeof data === 'object' && data.format && data.format !== FORMAT) {
      return fail('Dit bestand is geen Berie mindmap-export.');
    }

    var list = normalizeImport(data);
    if (!list || !list.length) return fail('Dit bestand bevat geen mindmap-projecten.');

    var ids = [];
    var droppedNodes = 0;
    list.forEach(function (raw) {
      var p = sanitizeProject(raw, true);
      if (p) {
        droppedNodes += lastDropped;
        p.name = uniqueName(p.name);
        p.nodes[p.rootId].title = p.name;
        register(p);
        ids.push(p.id);
      }
    });

    if (!ids.length) return fail('Geen geldige projecten gevonden in dit bestand.');

    // Eigen kleuren uit het bestand bij het palet zetten (bestaande blijven staan).
    var paletteGrew = false;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      cleanPalette(data.palette).forEach(function (c) {
        if (palette.indexOf(c) === -1 && palette.length < PALETTE_MAX) {
          palette.push(c);
          paletteGrew = true;
        }
      });
    }

    if (!state.currentId) state.currentId = ids[0];
    save();
    ids.forEach(function (id) { emit('store:changed', { projectId: id }); });
    if (paletteGrew) emit('palette:changed', { palette: palette.slice() });

    return {
      ok: true,
      count: ids.length,
      skipped: list.length - ids.length,
      skippedNodes: droppedNodes,
      projectIds: ids,
      error: null
    };
  }

  // "Naam", "Naam (2)", "Naam (3)" ... zodat geimporteerde projecten te onderscheiden zijn.
  function uniqueName(name) {
    var taken = Object.create(null);
    Object.keys(state.projects).forEach(function (k) {
      taken[String(state.projects[k].name).toLowerCase()] = true;
    });
    if (!taken[name.toLowerCase()]) return name;
    var base = name.replace(/\s\(\d+\)$/, '');
    for (var i = 2; i < 10000; i++) {
      var cand = base + ' (' + i + ')';
      if (cand.length > MAX_NAME) cand = base.slice(0, MAX_NAME - String(i).length - 3) + ' (' + i + ')';
      if (!taken[cand.toLowerCase()]) return cand;
    }
    return name;
  }

  function getLoadIssue() {
    return loadIssue;
  }

  // Een ander tabblad heeft de mindmap opgeslagen: dit tabblad niet meer laten overschrijven.
  try {
    window.addEventListener('storage', function (e) {
      if (e.key !== KEY && e.key !== null) return;
      if (e.key === KEY && e.newValue === lastWritten) return;
      markStale();
    });
  } catch (e) { /* geen window-events: negeren */ }

  BM.store = {
    load: load,
    save: save,
    setKey: setKey,
    getKey: getKey,
    snapshot: snapshot,
    requestSave: requestSave,
    loadIssue: getLoadIssue,
    listProjects: listProjects,
    getProject: getProject,
    currentId: currentId,
    setCurrent: setCurrent,
    createProject: createProject,
    renameProject: renameProject,
    deleteProject: deleteProject,
    addNode: addNode,
    removeNode: removeNode,
    restoreSnapshot: restoreSnapshot,
    renameNode: renameNode,
    setText: setText,
    setColor: setColor,
    effectiveColor: effectiveColor,
    palette: getPalette,
    addPaletteColor: addPaletteColor,
    PRESET_COLORS: PRESET_COLORS,
    PALETTE_MAX: PALETTE_MAX,
    removePaletteColor: removePaletteColor,
    normalizeColor: normalizeColor,
    getSpacing: getSpacing,
    setSpacing: setSpacing,
    SPACING_MIN: SPACING_MIN,
    SPACING_MAX: SPACING_MAX,
    getNode: getNode,
    children: children,
    subtree: subtree,
    depth: depth,
    exportJSON: exportJSON,
    importJSON: importJSON,
    projectOf: projectOf,
    lastSaveOk: function () { return lastSaveOk; },
    isReadOnly: function () { return readOnly; },
    isStale: function () { return stale; },
    releaseReadOnly: releaseReadOnly
  };
})();
