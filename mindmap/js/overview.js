(function(){
  var BM = window.BM = window.BM || {};

  // Gesorteerd, ingesprongen overzicht van alles wat onder een punt hangt.
  // render(container, nodeId) tekent het in container. Alles is iteratief
  // (geen recursie), zodat ook heel diepe bomen werken.

  var live = [];                          // open overzichten (staat per container)
  var collapsed = Object.create(null);    // ingeklapte takken, per node-id
  var SEARCH_THRESHOLD = 15;              // zoekveld vanaf meer dan zoveel regels
  var SNIPPET_LEN = 90;
  var INDENT_STEP = 14;
  var INDENT_MAX = 8;                     // dieper dan dit springt niet verder in
  var ENTER_ROWS = 14;                    // zoveel regels krijgen een instap-animatie
  var ENTER_NEW_MAX = 24;                 // max. nieuw zichtbare regels met animatie (uitklappen, nieuwe branch)
  var ROW_PAGE = 250;                     // zoveel regels per keer tekenen; daarna "Toon meer"
  var SEARCH_DELAY = 120;                 // ms wachten na typen in het zoekveld
  var LEAVE_MS = 170;                     // inklappen: zo lang faden de onderliggende regels uit

  function reduceMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  }

  var collator = null;
  try {
    if (typeof Intl !== 'undefined' && Intl.Collator) {
      collator = new Intl.Collator('nl', { numeric: true, sensitivity: 'base' });
    }
  } catch (e) { collator = null; }

  function cmpTitle(a, b) {
    var x = String(a || ''), y = String(b || '');
    if (collator) return collator.compare(x, y);
    x = x.toLowerCase(); y = y.toLowerCase();
    return x < y ? -1 : (x > y ? 1 : 0);
  }

  function getNode(id) {
    try {
      return (BM.store && BM.store.getNode && id) ? (BM.store.getNode(id) || null) : null;
    } catch (e) { return null; }
  }

  function snippetOf(text) {
    var t = String(text || '').replace(/\s+/g, ' ').trim();
    if (!t) return '';
    return t.length > SNIPPET_LEN ? t.slice(0, SNIPPET_LEN - 3) + '...' : t;
  }

  function kidsOf(n) {
    return (n && Array.isArray(n.children)) ? n.children : [];
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function pluralPunten(n) {
    return n === 1 ? '1 punt' : n + ' punten';
  }

  // ---------- regels opbouwen ----------

  // Geeft { rows, total }. Het punt zelf staat niet in de lijst; zijn kinderen
  // vormen het eerste niveau.
  function buildRows(rootId, query) {
    var q = query ? query.toLowerCase() : '';
    var rootNode = getNode(rootId);
    if (!rootNode) return { rows: [], total: 0 };

    // 1. Pre-order lijst van de hele subtak (iteratief).
    var order = [];
    var nodes = Object.create(null);
    var stack = [rootId];
    while (stack.length) {
      var id = stack.pop();
      if (nodes[id]) continue;
      var n = getNode(id);
      if (!n) continue;
      nodes[id] = n;
      order.push(id);
      var k = kidsOf(n);
      for (var i = k.length - 1; i >= 0; i--) stack.push(k[i]);
    }

    // 2. Achterwaarts: aantal afstammelingen en of er iets matcht.
    var count = Object.create(null);
    var match = q ? Object.create(null) : null;
    var self = q ? Object.create(null) : null;
    for (var j = order.length - 1; j >= 0; j--) {
      var nid = order[j];
      var nd = nodes[nid];
      var kids = kidsOf(nd);
      var total = 0;
      var m = false;
      if (q) {
        var hit = String(nd.title || '').toLowerCase().indexOf(q) >= 0 ||
          String(nd.text || '').toLowerCase().indexOf(q) >= 0;
        self[nid] = hit;
        m = hit;
      }
      for (var c = 0; c < kids.length; c++) {
        if (!nodes[kids[c]]) continue;
        total += 1 + count[kids[c]];
        if (q && match[kids[c]]) m = true;
      }
      count[nid] = total;
      if (q) match[nid] = m;
    }

    function sortedKids(n) {
      var ids = kidsOf(n);
      var items = [];
      for (var s = 0; s < ids.length; s++) {
        var cn = nodes[ids[s]];
        if (cn) items.push(cn);
      }
      items.sort(function(a, b) {
        var r = cmpTitle(a.title, b.title);
        return r !== 0 ? r : (a.created || 0) - (b.created || 0);
      });
      return items;
    }

    // 3. Regels in gesorteerde volgorde (iteratief, met een stapel).
    // Kleur van het punt zelf (eigen of geërfd); de regels erven die verder.
    var baseColor = null;
    try { baseColor = (BM.store && BM.store.effectiveColor) ? BM.store.effectiveColor(rootId) : null; } catch (e) { baseColor = null; }

    var rows = [];
    var work = [];
    var first = sortedKids(rootNode);
    for (var f = first.length - 1; f >= 0; f--) work.push({ n: first[f], d: 0, c: baseColor });
    while (work.length) {
      var it = work.pop();
      var node = it.n;
      if (q && !match[node.id]) continue;
      var hasKids = kidsOf(node).length > 0;
      var isCollapsed = !q && !!collapsed[node.id];
      var col = node.color || it.c || null;
      rows.push({
        id: node.id,
        depth: it.d,
        title: node.title || '',
        count: count[node.id] || 0,
        snippet: snippetOf(node.text),
        hasKids: hasKids,
        collapsed: isCollapsed,
        matched: q ? !!self[node.id] : true,
        color: col,
        ownColor: !!node.color
      });
      if (hasKids && !isCollapsed) {
        var sk = sortedKids(node);
        for (var b = sk.length - 1; b >= 0; b--) work.push({ n: sk[b], d: it.d + 1, c: col });
      }
    }

    return { rows: rows, total: count[rootId] || 0 };
  }

  // ---------- tekenen ----------

  var OPEN_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>';

  var CHEVRON = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4l4 4-4 4"/></svg>';

  // SVG-knoppen een keer opbouwen en per regel klonen (sneller dan innerHTML per regel).
  var tplOpen = null, tplChevron = null;
  function svgFrom(html) {
    var box = document.createElement('div');
    box.innerHTML = html;
    return box.firstChild;
  }
  function openIcon() {
    if (!tplOpen) tplOpen = svgFrom(OPEN_ICON);
    return tplOpen.cloneNode(true);
  }
  function chevronIcon() {
    if (!tplChevron) tplChevron = svgFrom(CHEVRON);
    return tplChevron.cloneNode(true);
  }

  function drawList(state) {
    var list = state.list;
    clearTimeout(state.leaveTimer);
    var prevIds = state.drawn ? state.prevIds : null;
    var nextIds = Object.create(null);
    var flipId = state.flipId;
    state.flipId = null;
    var flips = [];
    var focusedId = null;
    var ae = document.activeElement;
    if (ae && list.contains(ae)) {
      var fr = ae.closest ? ae.closest('.bm-ov-row') : null;
      if (fr) focusedId = fr.getAttribute('data-id');
    }
    var scroll = list.scrollTop;

    list.textContent = '';
    var node = getNode(state.nodeId);
    if (!node) {
      list.appendChild(el('div', 'bm-ov-empty', 'Dit punt bestaat niet meer.'));
      state.count.textContent = '';
      state.total = 0;
      return;
    }

    var built = buildRows(state.nodeId, state.query);
    state.total = built.total;
    state.count.textContent = pluralPunten(built.total);

    if (!built.rows.length) {
      list.appendChild(el('div', 'bm-ov-empty', state.query
        ? 'Niets gevonden voor "' + state.query + '".'
        : 'Nog geen branches onder dit punt. Kies Add branch om te beginnen.'));
      state.prevIds = nextIds;
      state.drawn = true;
      return;
    }

    var firstDraw = !state.drawn;
    var enterIdx = 0;
    var shown = Math.min(built.rows.length, state.limit || ROW_PAGE);
    var frag = document.createDocumentFragment();
    for (var i = 0; i < shown; i++) {
      var r = built.rows[i];
      nextIds[r.id] = true;
      // Instap-animatie: bij de eerste keer de bovenste regels, daarna alleen regels
      // die er net bij komen (uitklappen, nieuwe branch).
      var enter = false;
      if (firstDraw) {
        if (i < ENTER_ROWS) { enter = true; enterIdx = i; }
      } else if (prevIds && !prevIds[r.id] && enterIdx < ENTER_NEW_MAX) {
        enter = true;
      }
      var row = el('div', 'bm-ov-row' + (r.hasKids ? ' bm-ov-row--parent' : '') +
        (r.id === state.activeId ? ' bm-ov-row--active' : '') +
        (state.query && !r.matched ? ' bm-ov-row--context' : '') +
        (enter ? ' bm-ov-row--enter' : ''));
      if (enter) {
        row.style.setProperty('--i', String(enterIdx));
        if (!firstDraw) enterIdx++;
      }
      row.setAttribute('role', 'treeitem');
      row.setAttribute('tabindex', '0');
      row.setAttribute('aria-level', String(r.depth + 1));
      if (r.hasKids) row.setAttribute('aria-expanded', r.collapsed ? 'false' : 'true');
      row.setAttribute('data-id', r.id);
      row.style.paddingLeft = (6 + Math.min(r.depth, INDENT_MAX) * INDENT_STEP) + 'px';

      var caret;
      if (r.hasKids && !state.query) {
        // Net uitgeklapt: het pijltje eerst in de oude stand zetten en een frame later
        // omzetten, zodat het zichtbaar draait.
        var flip = r.id === flipId;
        var openNow = flip ? r.collapsed : !r.collapsed;
        caret = el('button', 'bm-ov-toggle' + (openNow ? ' bm-ov-toggle--open' : ''));
        caret.type = 'button';
        caret.tabIndex = -1;
        caret.setAttribute('aria-label', r.collapsed ? 'Uitklappen' : 'Inklappen');
        caret.setAttribute('data-toggle', r.id);
        caret.appendChild(chevronIcon());
        if (flip) flips.push({ el: caret, open: !r.collapsed });
      } else {
        caret = el('span', 'bm-ov-toggle bm-ov-toggle--spacer');
      }
      row.appendChild(caret);

      var main = el('div', 'bm-ov-main');
      var top = el('div', 'bm-ov-top');
      if (r.depth >= INDENT_MAX) {
        var lvl = el('span', 'bm-ov-depth', 'niv. ' + (r.depth + 1));
        lvl.title = 'Niveau ' + (r.depth + 1);
        top.appendChild(lvl);
      }
      if (r.color) {
        var dot = el('span', 'bm-ov-dot' + (r.ownColor ? ' bm-ov-dot--own' : ''));
        dot.style.setProperty('--sw', r.color);
        dot.title = r.ownColor ? 'Eigen kleur' : 'Kleur van de tak erboven';
        top.appendChild(dot);
      }
      var name = el('span', 'bm-ov-name', r.title || '(zonder naam)');
      name.title = r.title || '';
      top.appendChild(name);
      if (r.count > 0) {
        var badge = el('span', 'bm-ov-count', String(r.count));
        badge.title = r.count === 1 ? '1 onderliggend punt' : r.count + ' onderliggende punten';
        top.appendChild(badge);
      }
      main.appendChild(top);
      if (r.snippet) main.appendChild(el('div', 'bm-ov-snip', r.snippet));
      row.appendChild(main);

      var open = el('button', 'bm-ov-open');
      open.type = 'button';
      open.tabIndex = -1;
      open.title = 'Notitie openen';
      open.setAttribute('aria-label', 'Notitie openen');
      open.setAttribute('data-open', r.id);
      open.appendChild(openIcon());
      row.appendChild(open);

      frag.appendChild(row);
    }
    // Heel veel regels: niet alles in een keer tekenen.
    if (built.rows.length > shown) {
      var rest = built.rows.length - shown;
      var more = el('button', 'bm-btn bm-btn--small bm-ov-more',
        'Toon meer (' + (rest === 1 ? '1 regel' : rest + ' regels') + ' over)');
      more.type = 'button';
      more.setAttribute('data-more', '1');
      frag.appendChild(more);
    }
    list.appendChild(frag);
    state.drawn = true;
    state.prevIds = nextIds;
    list.scrollTop = scroll;

    if (flips.length) {
      requestAnimationFrame(function() {
        for (var f = 0; f < flips.length; f++) {
          flips[f].el.classList.toggle('bm-ov-toggle--open', flips[f].open);
        }
      });
    }

    if (focusedId) {
      var again = list.querySelector('.bm-ov-row[data-id="' + cssEscape(focusedId) + '"]');
      if (again) {
        try { again.focus({ preventScroll: true }); } catch (e) { /* negeren */ }
      }
    }
  }

  function cssEscape(s) {
    return String(s).replace(/["\\]/g, '\\$&');
  }

  function isRootId(id) {
    var n = getNode(id);
    return !!n && n.parentId == null;
  }

  // Zoekterm doorgeven aan de kaart: passende punten lichten op.
  function zoekOpKaart(q) {
    try { if (BM.render && typeof BM.render.zoek === 'function') BM.render.zoek(q || ''); } catch (e) { /* negeren */ }
  }

  function refreshVisibility(state) {
    // Op het hoofdpunt staat de zoekbalk er altijd; elders vanaf veel regels.
    var show = state.root || (state.total || 0) > SEARCH_THRESHOLD || !!state.query;
    state.search.classList.toggle('bm-ov-searchbox--hidden', !show);
  }

  function redraw(state) {
    try {
      drawList(state);
      refreshVisibility(state);
    } catch (err) {
      try { console.warn('[BM.overview] tekenen mislukt', err); } catch (e) { /* negeren */ }
    }
  }

  // ---------- acties ----------

  // Waar het punt moet komen: in het grootste vrije deel naast de pop-up.
  function focusPoint(container) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var box = container.closest ? container.closest('.bm-popup') : null;
    if (!box) return null;
    var r = box.getBoundingClientRect();
    var spaces = [
      { s: r.left, x: r.left / 2, y: vh / 2 },
      { s: vw - r.right, x: r.right + (vw - r.right) / 2, y: vh / 2 },
      { s: r.top, x: vw / 2, y: r.top / 2 },
      { s: vh - r.bottom, x: vw / 2, y: r.bottom + (vh - r.bottom) / 2 }
    ];
    spaces.sort(function(a, b) { return b.s - a.s; });
    if (spaces[0].s < 90) return null;
    return { x: spaces[0].x, y: spaces[0].y };
  }

  function setActive(state, id) {
    state.activeId = id;
    var rows = state.list.querySelectorAll('.bm-ov-row');
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle('bm-ov-row--active', rows[i].getAttribute('data-id') === id);
    }
  }

  function focusNode(state, id) {
    if (!id || !BM.bus) return;
    setActive(state, id);
    var at = focusPoint(state.container);
    BM.bus.emit('node:focus', {
      nodeId: id,
      source: 'overview',
      screenX: at ? at.x : undefined,
      screenY: at ? at.y : undefined
    });
  }

  function rowOf(state, id) {
    return state.list.querySelector('.bm-ov-row[data-id="' + cssEscape(id) + '"]');
  }

  function toggle(state, id) {
    if (collapsed[id]) {
      // Uitklappen: meteen tekenen; nieuwe regels schuiven in en het pijltje draait.
      delete collapsed[id];
      state.flipId = id;
      redraw(state);
      return;
    }
    collapsed[id] = true;
    var row = rowOf(state, id);
    if (!row || reduceMotion()) { redraw(state); return; }

    // Inklappen: pijltje draait nu, de onderliggende regels faden eerst uit.
    var btn = row.querySelector('.bm-ov-toggle');
    if (btn) {
      btn.classList.remove('bm-ov-toggle--open');
      btn.setAttribute('aria-label', 'Uitklappen');
    }
    row.setAttribute('aria-expanded', 'false');
    var lvl = +row.getAttribute('aria-level');
    var leaving = [];
    var n = row.nextElementSibling;
    while (n && n.classList.contains('bm-ov-row') && +n.getAttribute('aria-level') > lvl) {
      leaving.push(n);
      n = n.nextElementSibling;
    }
    if (!leaving.length) { redraw(state); return; }
    var k;
    var heights = [];
    for (k = 0; k < leaving.length; k++) heights.push(leaving[k].offsetHeight);
    for (k = 0; k < leaving.length; k++) leaving[k].style.maxHeight = heights[k] + 'px';
    requestAnimationFrame(function() {
      for (var q = 0; q < leaving.length; q++) leaving[q].classList.add('bm-ov-row--leave');
    });
    clearTimeout(state.leaveTimer);
    state.leaveTimer = setTimeout(function() { redraw(state); }, LEAVE_MS);
  }

  function attachEvents(state) {
    var list = state.list;

    list.addEventListener('click', function(e) {
      var t = e.target;
      var mr = t && t.closest ? t.closest('[data-more]') : null;
      if (mr) {
        e.stopPropagation();
        state.limit = (state.limit || ROW_PAGE) + ROW_PAGE;
        redraw(state);
        return;
      }
      var tg = t && t.closest ? t.closest('[data-toggle]') : null;
      if (tg) {
        e.stopPropagation();
        toggle(state, tg.getAttribute('data-toggle'));
        return;
      }
      var op = t && t.closest ? t.closest('[data-open]') : null;
      if (op) {
        e.stopPropagation();
        if (BM.bus) BM.bus.emit('ui:open-editor', { nodeId: op.getAttribute('data-open') });
        return;
      }
      var row = t && t.closest ? t.closest('.bm-ov-row') : null;
      if (row) focusNode(state, row.getAttribute('data-id'));
    });

    list.addEventListener('dblclick', function(e) {
      var row = e.target && e.target.closest ? e.target.closest('.bm-ov-row') : null;
      if (!row || (e.target.closest && e.target.closest('button'))) return;
      if (BM.bus) BM.bus.emit('ui:open-editor', { nodeId: row.getAttribute('data-id') });
    });

    list.addEventListener('keydown', function(e) {
      var row = e.target && e.target.closest ? e.target.closest('.bm-ov-row') : null;
      if (!row) return;
      var id = row.getAttribute('data-id');
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          if (BM.bus) BM.bus.emit('ui:open-editor', { nodeId: id });
        } else {
          focusNode(state, id);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        var exp = row.getAttribute('aria-expanded');
        if (exp === null || state.query) return;
        e.preventDefault();
        if ((e.key === 'ArrowRight') === (exp === 'false')) toggle(state, id);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var rows = state.list.querySelectorAll('.bm-ov-row');
        var idx = Array.prototype.indexOf.call(rows, row);
        var next = rows[idx + (e.key === 'ArrowDown' ? 1 : -1)];
        if (next) next.focus();
      }
    });

    // Zoeken: kort wachten na typen, zodat niet bij elke toets de hele lijst opnieuw wordt gebouwd.
    state.input.addEventListener('input', function() {
      clearTimeout(state.searchTimer);
      state.searchTimer = setTimeout(function() {
        var q = state.input.value.trim();
        if (q === state.query) return;
        state.query = q;
        state.limit = ROW_PAGE;
        redraw(state);
      }, SEARCH_DELAY);
      // De kaart meteen bijwerken (zonder wachten), zodat elke letter direct oplicht.
      zoekOpKaart(state.input.value);
    });
    state.input.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown') {
        var firstRow = state.list.querySelector('.bm-ov-row');
        if (firstRow) { e.preventDefault(); firstRow.focus(); }
      } else if (e.key === 'Escape' && state.input.value) {
        // Eerst de zoekterm wissen; een tweede Esc sluit de pop-up.
        e.preventDefault();
        e.stopPropagation();
        clearTimeout(state.searchTimer);
        state.input.value = '';
        zoekOpKaart('');
        state.query = '';
        state.limit = ROW_PAGE;
        redraw(state);
      }
    });
  }

  // ---------- live bijwerken ----------

  var pending = false;
  function scheduleRefresh() {
    if (pending) return;
    pending = true;
    var run = function() {
      pending = false;
      for (var i = live.length - 1; i >= 0; i--) {
        var st = live[i];
        if (!st.container.isConnected ||
            (st.container.closest && st.container.closest('.bm-popup--closing'))) {
          releaseState(st);
          continue;
        }
        redraw(st);
      }
    };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run);
    else setTimeout(run, 16);
  }

  function releaseState(st) {
    var i = live.indexOf(st);
    if (i >= 0) live.splice(i, 1);
    clearTimeout(st.searchTimer);
    clearTimeout(st.leaveTimer);
    st.prevIds = null;
    zoekOpKaart('');
  }

  // Overzicht in deze container loslaten (bijv. als de pop-up sluit).
  function release(container) {
    for (var i = live.length - 1; i >= 0; i--) {
      if (live[i].container === container) releaseState(live[i]);
    }
  }

  var subscribed = false;
  function subscribe() {
    if (!BM.bus || subscribed) return;
    subscribed = true;
    var evs = ['node:added', 'node:removed', 'node:renamed', 'node:text', 'node:color', 'project:switched'];
    for (var i = 0; i < evs.length; i++) {
      BM.bus.on(evs[i], function() {
        if (live.length) scheduleRefresh();
      });
    }
    // Ingeklapte takken van verwijderde punten vergeten.
    BM.bus.on('node:removed', function(d) {
      var ids = d && d.nodeIds;
      if (!ids) return;
      for (var j = 0; j < ids.length; j++) delete collapsed[ids[j]];
    });
  }

  // ---------- publiek ----------

  function render(container, nodeId) {
    if (!container) return;
    subscribe();

    var state = null;
    for (var i = 0; i < live.length; i++) {
      if (live[i].container === container) { state = live[i]; break; }
    }
    // Container leeggemaakt door de aanroeper: opnieuw opbouwen, maar de zoekterm bewaren.
    var keepQuery = '';
    if (state && !container.contains(state.list)) {
      if (state.nodeId === nodeId) keepQuery = state.query || '';
      live.splice(live.indexOf(state), 1);
      state = null;
    }

    if (!state || state.nodeId !== nodeId) {
      if (state) live.splice(live.indexOf(state), 1);
      container.textContent = '';
      container.classList.add('bm-overview');

      var head = el('div', 'bm-ov-head');
      head.appendChild(el('span', 'bm-ov-title', 'Overzicht'));
      var count = el('span', 'bm-ov-total', '');
      head.appendChild(count);
      container.appendChild(head);

      var search = el('div', 'bm-ov-searchbox bm-ov-searchbox--hidden');
      var input = el('input', 'bm-input bm-ov-search');
      input.type = 'search';
      var opRoot = isRootId(nodeId);
      input.placeholder = opRoot ? 'Zoek in je hele mindmap' : 'Zoeken in deze tak';
      input.setAttribute('aria-label', opRoot ? 'Zoek in je hele mindmap' : 'Zoeken in deze tak');
      if (opRoot) search.classList.add('bm-ov-searchbox--root');
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.value = keepQuery;
      search.appendChild(input);
      container.appendChild(search);

      var list = el('div', 'bm-ov-list');
      list.setAttribute('role', 'tree');
      list.setAttribute('aria-label', 'Overzicht van deze tak');
      container.appendChild(list);

      state = {
        container: container,
        nodeId: nodeId,
        root: opRoot,
        query: keepQuery,
        activeId: null,
        drawn: false,
        prevIds: null,
        flipId: null,
        limit: ROW_PAGE,
        searchTimer: 0,
        leaveTimer: 0,
        total: 0,
        count: count,
        search: search,
        input: input,
        list: list
      };
      attachEvents(state);
    } else {
      clearTimeout(state.searchTimer);
      state.query = state.input.value.trim();
    }

    if (live.indexOf(state) < 0) live.push(state);
    redraw(state);
  }

  BM.overview = {
    render: render,
    release: release,
    buildRows: buildRows
  };
})();
