(function(){
  var BM = window.BM = window.BM || {};

  var NAME_MAX = 80;
  var TOAST_MS = 2600;

  var root = null;          // .bm-projects (vaste balk linksboven)
  var trigger = null;       // knop die het menu opent
  var currentLabel = null;  // naam van het actieve project in de knop
  var panel = null;         // het dropdown-paneel
  var listEl = null;        // lijst met projecten
  var newInput = null;      // invoerveld voor een nieuw project
  var hintEl = null;        // korte meldingsregel in het paneel
  var fileInput = null;     // verborgen bestandskiezer voor import

  var isOpen = false;
  var inited = false;
  var renamingId = null;    // project dat nu hernoemd wordt
  var renameCommit = null;  // commit-functie van het lopende hernoemen
  var confirmId = null;     // project dat wacht op bevestiging van verwijderen

  // ---------- hulpfuncties ----------

  function need() {
    if (!BM.store) {
      toast('Opslag is nog niet geladen.', true);
      return null;
    }
    return BM.store;
  }

  function safe(fn, fallback) {
    try { return fn(); }
    catch (e) {
      try { if (window.console) console.error('[BM.projects]', e); } catch (x) {}
      return fallback;
    }
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function btn(label, cls, onClick) {
    var b = el('button', 'bm-btn' + (cls ? ' ' + cls : ''), label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  function plural(n) {
    return n === 1 ? '1 punt' : n + ' punten';
  }

  function listProjects() {
    if (!BM.store) return [];
    var arr = safe(function(){ return BM.store.listProjects(); }, []) || [];
    var out = arr.slice();
    out.sort(function(a, b) {
      return String(a.name || '').localeCompare(String(b.name || ''), 'nl', { numeric: true, sensitivity: 'base' });
    });
    return out;
  }

  function getProject(id) {
    if (!BM.store || !id) return null;
    return safe(function(){ return BM.store.getProject(id); }, null);
  }

  function currentId() {
    if (!BM.store) return null;
    return safe(function(){ return BM.store.currentId(); }, null);
  }

  // Aantal branches (het middenpunt telt niet mee).
  function nodeCount(id) {
    var p = getProject(id);
    if (!p || !p.nodes) return 0;
    return Math.max(0, Object.keys(p.nodes).length - 1);
  }

  function countLabel(n) {
    if (n <= 0) return 'leeg';
    return n === 1 ? '1 branch' : n + ' branches';
  }

  function setHint(msg) {
    if (hintEl) hintEl.textContent = msg || '';
  }

  function toast(msg, isError) {
    if (typeof BM.toast === 'function') {
      BM.toast(msg, { error: !!isError });
      return;
    }
    var t = el('div', 'bm-toast' + (isError ? ' bm-toast--error' : ''), msg);
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('bm-toast--in'); });
    setTimeout(function(){
      t.classList.remove('bm-toast--in');
      setTimeout(function(){
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 300);
    }, TOAST_MS);
  }

  // ---------- label en lijst ----------

  function refreshLabel() {
    if (!currentLabel) return;
    var p = getProject(currentId());
    currentLabel.textContent = p ? p.name : 'Projecten';
    currentLabel.title = p ? p.name : '';
  }

  function renderList() {
    if (!listEl) return;
    refreshLabel();
    listEl.textContent = '';

    var projects = listProjects();
    var cur = currentId();

    if (!projects.length) {
      listEl.appendChild(el('li', 'bm-projects__empty', 'Nog geen projecten.'));
      return;
    }

    var onlyOne = projects.length <= 1;
    projects.forEach(function(p) {
      listEl.appendChild(buildRow(p, cur, onlyOne));
    });
  }

  function buildRow(p, cur, onlyOne) {
    var li = el('li', 'bm-projects__row' + (p.id === cur ? ' bm-projects__row--current' : ''));

    if (renamingId === p.id) return buildRename(li, p);
    if (confirmId === p.id) return buildConfirm(li, p);

    var pick = el('button', 'bm-projects__pick');
    pick.type = 'button';
    pick.title = 'Open dit project';
    pick.appendChild(el('span', 'bm-projects__name', p.name));
    pick.appendChild(el('span', 'bm-projects__meta', countLabel(nodeCount(p.id))));
    pick.addEventListener('click', function(){ switchTo(p.id); });

    var actions = el('div', 'bm-projects__actions');
    actions.appendChild(btn('Hernoemen', 'bm-btn--small', function(){ startRename(p.id); }));

    var del = btn('Verwijderen', 'bm-btn--danger bm-btn--small', function(){
      renamingId = null;
      renameCommit = null;
      confirmId = p.id;
      renderList();
    });
    if (onlyOne) {
      del.disabled = true;
      del.title = 'Het laatste project kan niet worden verwijderd';
    }
    actions.appendChild(del);

    li.appendChild(pick);
    li.appendChild(actions);
    return li;
  }

  function buildRename(li, p) {
    var inp = el('input', 'bm-input bm-projects__rename');
    inp.type = 'text';
    inp.maxLength = NAME_MAX;
    inp.value = p.name;
    inp.setAttribute('aria-label', 'Nieuwe naam van het project');

    var done = false;

    function commit() {
      if (done) return;
      done = true;
      var v = inp.value.trim();
      renamingId = null;
      renameCommit = null;
      if (!v) {
        setHint('Een project heeft altijd een naam.');
      } else if (v !== p.name && BM.store) {
        var ok = safe(function(){ BM.store.renameProject(p.id, v); return true; }, false);
        toast(ok ? 'Project hernoemd.' : 'Hernoemen mislukt.', !ok);
      }
      renderList();
    }

    function cancel() {
      if (done) return;
      done = true;
      renamingId = null;
      renameCommit = null;
      renderList();
    }

    renameCommit = commit;

    inp.addEventListener('keydown', function(e) {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        commit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    });
    inp.addEventListener('blur', commit);

    li.appendChild(inp);
    return li;
  }

  function buildConfirm(li, p) {
    var n = nodeCount(p.id);
    var box = el('div', 'bm-projects__confirm');
    box.appendChild(el('div', 'bm-projects__confirm-text',
      'Project "' + p.name + '"' + (n > 0 ? ' met ' + countLabel(n) : '') +
      ' verwijderen? Dit kan niet ongedaan worden gemaakt.'));

    var row = el('div', 'bm-projects__confirm-actions');
    row.appendChild(btn('Annuleren', '', function(){
      confirmId = null;
      renderList();
    }));
    row.appendChild(btn('Ja, verwijderen', 'bm-btn--danger', function(){
      deleteProject(p.id);
    }));
    box.appendChild(row);

    li.appendChild(box);
    return li;
  }

  function startRename(id) {
    confirmId = null;
    renamingId = id;
    renderList();
    var inp = listEl ? listEl.querySelector('.bm-projects__rename') : null;
    if (inp) {
      inp.focus();
      inp.select();
    }
  }

  // ---------- acties ----------

  // Zet het actieve project zonder het menu te sluiten.
  function activate(id) {
    if (!BM.store || !id) return false;
    var fired = false;
    var off = BM.bus.on('project:switched', function(){ fired = true; });
    try {
      BM.store.setCurrent(id);
    } catch (e) {
      off();
      toast('Project kon niet worden geopend.', true);
      return false;
    }
    off();
    if (!fired) BM.bus.emit('project:switched', { projectId: id });
    return true;
  }

  function switchTo(id) {
    if (!id) return;
    if (id !== currentId()) activate(id);
    close();
  }

  function createFromInput() {
    var s = need();
    if (!s) return;
    var name = newInput.value.trim();
    if (!name) {
      setHint('Geef het project eerst een naam.');
      newInput.focus();
      return;
    }
    if (name.length > NAME_MAX) name = name.slice(0, NAME_MAX);

    var p = safe(function(){ return s.createProject(name); }, null);
    if (!p || !p.id) {
      toast('Project aanmaken mislukt.', true);
      return;
    }
    newInput.value = '';
    setHint('');
    activate(p.id);
    toast('Project "' + p.name + '" aangemaakt.');
    close();
  }

  function deleteProject(id) {
    var s = need();
    if (!s) return;
    confirmId = null;

    var ok = safe(function(){ s.deleteProject(id); return true; }, false);
    if (!ok) {
      toast('Verwijderen mislukt.', true);
      renderList();
      return;
    }

    // Als het actieve project weg is, naar het eerste overgebleven project.
    var cur = currentId();
    if (!cur || !getProject(cur)) {
      var rest = listProjects();
      if (rest.length) activate(rest[0].id);
    }
    toast('Project verwijderd.');
    renderList();
  }

  function exportProjects() {
    var s = need();
    if (!s) return;
    var str = safe(function(){ return s.exportJSON(); }, null);
    if (typeof str !== 'string') {
      toast('Exporteren mislukt.', true);
      return;
    }
    try {
      var blob = new Blob([str], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = el('a');
      a.href = url;
      a.download = 'berie-mindmap-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function(){
        URL.revokeObjectURL(url);
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 1000);
      toast('Bestand geëxporteerd.');
      setHint('');
    } catch (e) {
      toast('Exporteren mislukt.', true);
    }
  }

  function onFilePicked() {
    var s = need();
    var f = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!s || !f) return;
    if (f.size > 25 * 1024 * 1024) {
      toast('Dit bestand is te groot.', true);
      return;
    }
    var reader = new FileReader();
    reader.onload = function() {
      try {
        var res = s.importJSON(String(reader.result));
        if (!res || !res.ok) {
          toast((res && res.error) || 'Dit bestand kon niet worden gelezen.', true);
          renderList();
          return;
        }
        // Het eerste geimporteerde project meteen openen.
        if (res.projectIds && res.projectIds.length) activate(res.projectIds[0]);
        renderList();
        var msg = res.count === 1 ? '1 project geïmporteerd.' : res.count + ' projecten geïmporteerd.';
        var extra = [];
        if (res.skipped > 0) extra.push(res.skipped === 1 ? '1 project overgeslagen' : res.skipped + ' projecten overgeslagen');
        if (res.skippedNodes > 0) extra.push(res.skippedNodes === 1 ? '1 los punt weggelaten' : res.skippedNodes + ' losse punten weggelaten');
        if (extra.length) msg += ' ' + extra.join(', ') + '.';
        toast(msg);
        setHint('');
      } catch (e) {
        toast('Dit bestand kon niet worden gelezen.', true);
      }
    };
    reader.onerror = function(){ toast('Lezen van het bestand mislukt.', true); };
    reader.readAsText(f);
  }

  // ---------- open / dicht ----------

  function open() {
    if (isOpen) return;
    if (!need()) return;
    isOpen = true;
    root.classList.add('bm-projects--open');
    trigger.setAttribute('aria-expanded', 'true');
    renderList();
  }

  function close() {
    if (!isOpen) return;
    // Lopend hernoemen bewaren (of annuleren als leeg) voordat het paneel sluit.
    if (renameCommit) renameCommit();
    renamingId = null;
    renameCommit = null;
    confirmId = null;
    isOpen = false;
    root.classList.remove('bm-projects--open');
    trigger.setAttribute('aria-expanded', 'false');
    setHint('');
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  // Wordt aangeroepen na store:changed / project:switched.
  function onStoreChanged() {
    refreshLabel();
    if (isOpen && !renamingId) renderList();
  }

  // ---------- opbouw ----------

  function build() {
    root = el('div', 'bm-projects');
    root.id = 'bm-projects';

    trigger = el('button', 'bm-btn bm-projects__trigger');
    trigger.type = 'button';
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.title = 'Projecten';
    trigger.appendChild(el('span', 'bm-projects__dot'));
    currentLabel = el('span', 'bm-projects__current', 'Projecten');
    trigger.appendChild(currentLabel);
    trigger.appendChild(el('span', 'bm-projects__caret'));
    trigger.addEventListener('click', toggle);

    panel = el('div', 'bm-projects__panel');
    panel.appendChild(el('div', 'bm-projects__head', 'Projecten'));

    listEl = el('ul', 'bm-projects__list');
    panel.appendChild(listEl);

    var newRow = el('div', 'bm-projects__new');
    newInput = el('input', 'bm-input');
    newInput.type = 'text';
    newInput.maxLength = NAME_MAX;
    newInput.placeholder = 'Naam van nieuw project';
    newInput.setAttribute('aria-label', 'Naam van nieuw project');
    newInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        createFromInput();
      }
    });
    newRow.appendChild(newInput);
    newRow.appendChild(btn('Nieuw project', 'bm-btn--add', createFromInput));
    panel.appendChild(newRow);

    var io = el('div', 'bm-projects__io');
    io.appendChild(btn('Exporteren', 'bm-btn--io', exportProjects));
    io.appendChild(btn('Importeren', 'bm-btn--io', function(){ fileInput.click(); }));
    panel.appendChild(io);

    hintEl = el('p', 'bm-hint', '');
    panel.appendChild(hintEl);

    fileInput = el('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.hidden = true;
    fileInput.addEventListener('change', onFilePicked);
    panel.appendChild(fileInput);

    root.appendChild(trigger);
    root.appendChild(panel);
    document.body.appendChild(root);

    // Klikken, wiel en toetsen in de balk mogen niet bij het canvas of de sneltoetsen terechtkomen.
    ['pointerdown', 'mousedown', 'touchstart', 'wheel', 'dblclick'].forEach(function(name) {
      root.addEventListener(name, function(e){ e.stopPropagation(); });
    });
    root.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        close();
        trigger.focus();
      }
      e.stopPropagation();
    });

    document.addEventListener('pointerdown', function(e) {
      if (isOpen && !root.contains(e.target)) close();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  // ---------- publieke API ----------

  function init() {
    if (inited) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    inited = true;
    build();
    BM.bus.on('store:changed', onStoreChanged);
    BM.bus.on('project:switched', onStoreChanged);
    refreshLabel();
  }

  BM.projects = {
    init: init,
    open: open,
    close: close,
    toggle: toggle,
    exportAll: exportProjects,
    refresh: onStoreChanged
  };
})();
