(function () {
  var BM = window.BM = window.BM || {};

  // Notitie-paneel (zijpaneel) voor een punt van de mindmap.
  // Afhankelijk van: BM.bus, BM.store.

  var TEXT_DELAY = 350;
  var TITLE_DELAY = 300;
  var MAX_TITLE = 200;       // gelijk aan de grens in store.js
  var MAX_ROOT_TITLE = 80;   // het middenpunt is de projectnaam (max. 80 tekens)
  var MAX_TEXT = 1000000;    // gelijk aan de grens in store.js
  var MAX_CRUMBS = 4;

  var st = {
    built: false,
    open: false,
    projectId: null,
    nodeId: null,
    dirtyText: false,
    dirtyTitle: false,
    textTimer: null,
    titleTimer: null,
    el: null,
    crumbsEl: null,
    titleEl: null,
    textEl: null,
    statusEl: null,
    dotEl: null,
    closeBtn: null
  };

  function emit(name, data) {
    if (BM.bus) BM.bus.emit(name, data);
  }

  function getNode(id) {
    if (!id || !BM.store) return null;
    try {
      return BM.store.getNode(id) || null;
    } catch (e) {
      return null;
    }
  }

  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }

  function nodeLabel(node) {
    var t = node && node.title ? String(node.title).trim() : '';
    return t || 'Zonder naam';
  }

  function setStatus(text, busy) {
    if (!st.statusEl) return;
    st.statusEl.textContent = text;
    st.statusEl.setAttribute('data-state', busy ? 'busy' : 'saved');
  }

  // Na een wijziging direct wegschrijven en eerlijk laten zien of dat lukte.
  function commitStatus() {
    var ok = true;
    try {
      ok = BM.store.save() !== false;
    } catch (e) {
      ok = false;
    }
    if (ok) {
      setStatus('Opgeslagen', false);
    } else if (st.statusEl) {
      st.statusEl.textContent = 'Niet opgeslagen';
      st.statusEl.setAttribute('data-state', 'error');
    }
  }

  function prefersFinePointer() {
    try {
      return !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches);
    } catch (e) {
      return false;
    }
  }

  function focusText() {
    if (!prefersFinePointer()) return;
    requestAnimationFrame(function () {
      try {
        st.textEl.focus({ preventScroll: true });
      } catch (e) { /* focus is optioneel */ }
    });
  }

  // ---------- opslaan ----------

  function saveText() {
    if (st.textTimer) {
      clearTimeout(st.textTimer);
      st.textTimer = null;
    }
    if (!st.dirtyText) return;
    st.dirtyText = false;
    var node = getNode(st.nodeId);
    if (!node) return;
    var value = st.textEl.value;
    if (value !== (node.text || '')) {
      BM.store.setText(st.nodeId, value);
    }
    commitStatus();
  }

  function saveTitle() {
    if (st.titleTimer) {
      clearTimeout(st.titleTimer);
      st.titleTimer = null;
    }
    if (!st.dirtyTitle) return;
    st.dirtyTitle = false;
    var node = getNode(st.nodeId);
    if (!node) return;
    var value = st.titleEl.value.replace(/\s+/g, ' ').trim();
    if (!value) {
      // lege titel niet opslaan: terug naar de oude titel
      st.titleEl.value = node.title || '';
      commitStatus();
      return;
    }
    if (value !== node.title) {
      // de root-titel is de projectnaam (renameProject zet ook de titel van het middenpunt)
      if (node.parentId == null && BM.store.renameProject) {
        BM.store.renameProject(st.projectId, value);
      } else {
        BM.store.renameNode(st.nodeId, value);
      }
    }
    commitStatus();
    renderCrumbs();
  }

  function flush() {
    saveTitle();
    saveText();
  }

  // ---------- pad (broodkruimels) ----------

  function renderCrumbs() {
    if (!st.crumbsEl) return;
    st.crumbsEl.textContent = '';
    if (!st.open || !st.nodeId) return;

    var path = [];
    var cur = getNode(st.nodeId);
    var guard = 0;
    while (cur && guard++ < 10000) {
      path.unshift(cur);
      cur = cur.parentId ? getNode(cur.parentId) : null;
    }
    if (!path.length) return;

    var items = path;
    if (path.length > MAX_CRUMBS) {
      items = [path[0], null, path[path.length - 2], path[path.length - 1]];
    }

    items.forEach(function (item, i) {
      if (i > 0) {
        st.crumbsEl.appendChild(h('span', 'bm-editor-sep', '›'));
      }
      if (item === null) {
        st.crumbsEl.appendChild(h('span', 'bm-editor-gap', '…'));
        return;
      }
      var isCurrent = item.id === st.nodeId;
      var btn = h('button', 'bm-editor-crumb' + (isCurrent ? ' is-current' : ''), nodeLabel(item));
      btn.type = 'button';
      btn.title = nodeLabel(item);
      if (isCurrent) {
        btn.setAttribute('aria-current', 'location');
      } else {
        btn.addEventListener('click', function () {
          emit('node:focus', { nodeId: item.id });
          emit('ui:open-editor', { nodeId: item.id });
        });
      }
      st.crumbsEl.appendChild(btn);
    });
  }

  // ---------- kleur ----------

  // Klein bolletje in de kop met de kleur van dit punt (eigen of geërfd).
  function renderDot() {
    if (!st.dotEl) return;
    var c = null;
    if (st.open && st.nodeId && BM.store && BM.store.effectiveColor) {
      try { c = BM.store.effectiveColor(st.nodeId); } catch (e) { c = null; }
    }
    var node = getNode(st.nodeId);
    var own = !!(node && node.color);
    st.dotEl.classList.toggle('bm-editor-dot--on', !!c);
    st.dotEl.classList.toggle('bm-editor-dot--own', own);
    if (c) st.dotEl.style.setProperty('--sw', c);
    st.dotEl.title = c ? (own ? 'Eigen kleur' : 'Kleur van de tak erboven') : '';
  }

  // ---------- open / dicht ----------

  function openNode(nodeId) {
    var node = getNode(nodeId);
    if (!node) return;
    var projectId = BM.store.currentId();

    if (st.open && st.nodeId === nodeId && st.projectId === projectId) {
      renderCrumbs();
      focusText();
      return;
    }

    flush(); // wijzigingen van het vorige punt eerst wegschrijven

    st.projectId = projectId;
    st.nodeId = nodeId;
    st.dirtyText = false;
    st.dirtyTitle = false;
    st.titleEl.maxLength = node.parentId == null ? MAX_ROOT_TITLE : MAX_TITLE;
    st.titleEl.value = node.title || '';
    st.textEl.value = node.text || '';
    if (BM.store.lastSaveOk && !BM.store.lastSaveOk()) {
      st.statusEl.textContent = 'Niet opgeslagen';
      st.statusEl.setAttribute('data-state', 'error');
    } else {
      setStatus('Opgeslagen', false);
    }
    st.open = true;
    renderCrumbs();
    renderDot();

    st.el.classList.add('bm-editor--open');
    st.el.setAttribute('aria-hidden', 'false');
    st.el.inert = false;
    focusText();
  }

  function closeNode() {
    if (!st.open) return;
    flush();
    st.open = false;
    st.nodeId = null;
    st.projectId = null;
    st.el.classList.remove('bm-editor--open');
    st.el.setAttribute('aria-hidden', 'true');
    st.el.inert = true;
    if (document.activeElement && st.el.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    renderCrumbs();
  }

  // ---------- bouwen ----------

  function build() {
    var el = h('aside', 'bm-editor');
    el.setAttribute('role', 'complementary');
    el.setAttribute('aria-label', 'Notitie');
    el.setAttribute('aria-hidden', 'true');
    el.inert = true;

    var head = h('div', 'bm-editor-head');
    var dot = h('span', 'bm-editor-dot');
    dot.setAttribute('aria-hidden', 'true');
    var crumbs = h('nav', 'bm-editor-crumbs');
    crumbs.setAttribute('aria-label', 'Pad naar dit punt');
    var closeBtn = h('button', 'bm-btn bm-editor-close', 'Sluiten');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Sluit notitie');
    head.appendChild(dot);
    head.appendChild(crumbs);
    head.appendChild(closeBtn);

    var titleEl = h('input', 'bm-input bm-editor-title');
    titleEl.type = 'text';
    titleEl.maxLength = MAX_TITLE;
    titleEl.placeholder = 'Titel';
    titleEl.setAttribute('aria-label', 'Titel van dit punt');
    titleEl.autocomplete = 'off';
    titleEl.spellcheck = false;

    var textEl = h('textarea', 'bm-editor-text');
    textEl.placeholder = 'Schrijf hier je notitie...';
    textEl.maxLength = MAX_TEXT;
    textEl.setAttribute('aria-label', 'Notitie');

    var foot = h('div', 'bm-editor-foot');
    var status = h('span', 'bm-hint bm-editor-status', 'Opgeslagen');
    status.setAttribute('data-state', 'saved');
    status.setAttribute('aria-live', 'polite');
    var hint = h('span', 'bm-hint bm-editor-note', 'Wijzigingen worden automatisch opgeslagen.');
    foot.appendChild(status);
    foot.appendChild(hint);

    el.appendChild(head);
    el.appendChild(titleEl);
    el.appendChild(textEl);
    el.appendChild(foot);
    document.body.appendChild(el);

    st.el = el;
    st.crumbsEl = crumbs;
    st.titleEl = titleEl;
    st.textEl = textEl;
    st.statusEl = status;
    st.dotEl = dot;
    st.closeBtn = closeBtn;

    // Events binnen het paneel
    closeBtn.addEventListener('click', function () {
      closeNode();
    });

    titleEl.addEventListener('input', function () {
      st.dirtyTitle = true;
      setStatus('Opslaan...', true);
      if (st.titleTimer) clearTimeout(st.titleTimer);
      st.titleTimer = setTimeout(saveTitle, TITLE_DELAY);
    });
    titleEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        titleEl.blur();
      }
    });
    titleEl.addEventListener('blur', function () {
      saveTitle();
    });

    textEl.addEventListener('input', function () {
      st.dirtyText = true;
      setStatus('Opslaan...', true);
      if (st.textTimer) clearTimeout(st.textTimer);
      st.textTimer = setTimeout(saveText, TEXT_DELAY);
    });
    textEl.addEventListener('blur', function () {
      saveText();
    });

    // Toetsen en muis binnen het paneel niet doorgeven aan het canvas
    // (sneltoetsen zoals F, pannen, zoomen). Escape blijft bubbelen.
    el.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') e.stopPropagation();
    });
    ['pointerdown', 'mousedown', 'touchstart', 'dblclick'].forEach(function (type) {
      el.addEventListener(type, function (e) {
        e.stopPropagation();
      });
    });
    el.addEventListener('wheel', function (e) {
      e.stopPropagation();
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && st.open) {
        closeNode();
      }
    });
  }

  // ---------- bus-koppelingen ----------

  function subscribe() {
    BM.bus.on('ui:open-editor', function (d) {
      if (d && d.nodeId) openNode(d.nodeId);
    });

    BM.bus.on('project:switched', function () {
      if (st.open) closeNode();
    });

    BM.bus.on('node:color', function (d) {
      if (!st.open || !d) return;
      if (d.projectId && d.projectId !== st.projectId) return;
      renderDot();
    });

    BM.bus.on('store:save-failed', function () {
      if (!st.open || !st.statusEl) return;
      st.statusEl.textContent = 'Niet opgeslagen';
      st.statusEl.setAttribute('data-state', 'error');
    });
    BM.bus.on('store:save-ok', function () {
      if (st.open && !st.dirtyText && !st.dirtyTitle) setStatus('Opgeslagen', false);
    });

    BM.bus.on('node:removed', function (d) {
      if (!st.open || !d) return;
      if (d.projectId && d.projectId !== st.projectId) return;
      var ids = d.nodeIds || [];
      if (ids.indexOf(st.nodeId) !== -1 || !getNode(st.nodeId)) {
        closeNode();
      }
    });

    BM.bus.on('node:renamed', function (d) {
      if (!st.open || !d) return;
      if (d.projectId && d.projectId !== st.projectId) return;
      if (d.nodeId === st.nodeId && document.activeElement !== st.titleEl) {
        var n = getNode(st.nodeId);
        if (n) st.titleEl.value = n.title || '';
      }
      renderCrumbs();
    });

    BM.bus.on('node:text', function (d) {
      if (!st.open || !d) return;
      if (d.projectId && d.projectId !== st.projectId) return;
      if (d.nodeId !== st.nodeId || st.dirtyText) return;
      if (document.activeElement === st.textEl) return;
      var n = getNode(st.nodeId);
      if (n && st.textEl.value !== (n.text || '')) {
        st.textEl.value = n.text || '';
      }
    });

    BM.bus.on('store:changed', function (d) {
      if (!st.open) return;
      if (d && d.projectId && d.projectId !== st.projectId) return;
      if (!getNode(st.nodeId)) {
        closeNode();
        return;
      }
      renderCrumbs();
    });
  }

  // ---------- init ----------

  function init() {
    if (st.built) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    build();
    subscribe();
    st.built = true;
  }

  BM.editor = {
    init: init,
    open: function (nodeId) {
      init();
      openNode(nodeId);
    },
    close: function () {
      closeNode();
    },
    // Schrijf openstaande wijzigingen nu weg. Roep dit aan vóór project-wissel of verwijderen.
    flush: function () {
      flush();
    },
    isOpen: function () {
      return st.open;
    },
    currentNodeId: function () {
      return st.open ? st.nodeId : null;
    }
  };

  init();
})();
