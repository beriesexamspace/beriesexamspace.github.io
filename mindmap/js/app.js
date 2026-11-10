(function () {
  'use strict';
  var BM = window.BM = window.BM || {};

  // Start van de app: laadt de opslag, zorgt voor een project, koppelt de modules
  // en start de render-lus. Alle modules zijn al geladen (zie index.html).

  var FIRST_PROJECT = 'Mijn eerste project';
  var INTRO_TEXT = 'Klik op het witte puntje om te beginnen';
  var intro = null;        // zichtbaar startblokje, of null
  var started = false;

  function attempt(where, fn) {
    try {
      return fn();
    } catch (err) {
      try { console.error('[BM.app] ' + where + ' mislukt:', err); } catch (e) { /* console kan ontbreken */ }
      return undefined;
    }
  }

  function rootHasChildren(projectId) {
    var p = BM.store.getProject(projectId);
    if (!p || !p.nodes || !p.rootId) return false;
    var root = p.nodes[p.rootId];
    return !!(root && root.children && root.children.length);
  }

  // ---------- startmelding ----------
  // Zichtbaar zolang het huidige project alleen het middenpunt heeft en er geen pop-up open is.
  // Werkt per project: een nieuw, leeg project krijgt de melding ook weer.

  function showIntro() {
    if (intro) return;
    var el = document.getElementById('bm-intro');
    if (!el || el.classList.contains('bm-intro--hide')) {
      el = document.createElement('div');
      el.className = 'bm-intro';
      el.setAttribute('role', 'note');
      el.textContent = INTRO_TEXT;
      document.body.appendChild(el);
    }
    el.id = 'bm-intro';
    intro = el;
  }

  function hideIntro() {
    if (!intro) return;
    var el = intro;
    intro = null;
    el.removeAttribute('id');
    el.classList.add('bm-intro--hide');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 450);
  }

  function updateIntro() {
    var popupOpen = !!(BM.popup && BM.popup.isOpen && BM.popup.isOpen());
    var empty = !rootHasChildren(BM.store.currentId());
    if (empty && !popupOpen) showIntro();
    else hideIntro();
  }

  // ---------- opslag ----------

  // Zorgt dat er altijd één actief project is.
  function ensureProject() {
    var list = BM.store.listProjects();
    if (!list.length) {
      BM.store.createProject(FIRST_PROJECT);
      list = BM.store.listProjects();
    }
    var cur = BM.store.currentId();
    if (!cur || !BM.store.getProject(cur)) {
      BM.store.setCurrent(list[0].id);
    }
  }

  // Eerst de lopende tekst in het notitiepaneel wegschrijven, dan alles opslaan.
  function saveNow() {
    attempt('notitie', function () { if (BM.editor && BM.editor.flush) BM.editor.flush(); });
    attempt('opslaan', function () { BM.store.save(); });
  }

  function downloadText(text, name) {
    try {
      var blob = new Blob([text], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(url);
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 1000);
    } catch (e) { /* negeren */ }
  }

  // Als de opgeslagen data niet (helemaal) gelezen kon worden: melden en een kopie aanbieden.
  function reportLoadIssue() {
    var issue = BM.store.loadIssue && BM.store.loadIssue();
    if (!issue || typeof BM.toast !== 'function') return;
    var kept = issue.backedUp !== false;
    var tail = kept
      ? ' Er is een kopie bewaard.'
      : ' Download eerst een kopie; tot dan wordt er niets opgeslagen.';
    var msg = issue.kind === 'corrupt'
      ? 'Je opgeslagen mindmap kon niet worden gelezen.' + tail
      : (issue.count === 1
        ? '1 project kon niet worden geladen.' + tail
        : issue.count + ' projecten konden niet worden geladen.' + tail);
    BM.toast(msg, {
      error: true,
      // Kon de kopie niet bewaard worden, dan blijft de melding staan tot er gedownload is.
      ms: kept ? 15000 : 0,
      action: 'Kopie downloaden',
      onAction: function () {
        downloadText(issue.raw || '', 'berie-mindmap-kopie-' + new Date().toISOString().slice(0, 10) + '.json');
        if (!kept && BM.store.releaseReadOnly) {
          // Even wachten zodat de download zeker gestart is, dan weer normaal opslaan.
          setTimeout(function () { attempt('opslaan', BM.store.releaseReadOnly); }, 1500);
        }
      }
    });
  }

  // ---------- opslagproblemen tijdens het werken ----------

  var saveToast = null;

  function exportAll() {
    if (BM.projects && typeof BM.projects.exportAll === 'function') BM.projects.exportAll();
  }

  function onSaveFailed() {
    if (typeof BM.toast !== 'function') return;
    // Deze gevallen hebben hun eigen melding.
    if (BM.store.isReadOnly && BM.store.isReadOnly()) return;
    if (BM.store.isStale && BM.store.isStale()) return;
    if (saveToast) return;
    saveToast = BM.toast('Opslaan lukt niet (opslag vol of geblokkeerd). Exporteer je mindmap om niets kwijt te raken.', {
      error: true,
      ms: 0,
      action: 'Exporteren',
      onAction: function () { saveToast = null; exportAll(); }
    });
  }

  function onSaveOk() {
    if (saveToast) {
      saveToast.close();
      saveToast = null;
    }
  }

  function onStale() {
    if (typeof BM.toast !== 'function') return;
    if (saveToast) { saveToast.close(); saveToast = null; }
    BM.toast('De mindmap is in een ander tabblad gewijzigd. Herlaad dit tabblad om verder te werken zonder iets te overschrijven.', {
      error: true,
      ms: 0,
      action: 'Herladen',
      onAction: function () { try { window.location.reload(); } catch (e) { /* negeren */ } }
    });
  }

  // Posities alleen uitrekenen als het nodig is (punten zonder eigen plek, bijv. na
  // een import), en dan met een tijdslimiet zodat het scherm niet vastloopt.
  // De rest beweegt daarna zichtbaar in de render-lus.
  function prepareLayout(p) {
    if (!p || !BM.layout) return;
    if (BM.layout.needsLayout && !BM.layout.needsLayout(p)) return;
    BM.layout.settle(p, 400, 60);
  }

  // ---------- start ----------

  function start() {
    if (started) return;
    started = true;

    intro = document.getElementById('bm-intro');

    attempt('opslag laden', function () { BM.store.load(); });
    attempt('project klaarzetten', ensureProject);

    var pid = BM.store.currentId();

    // Posities van het huidige project vooraf uitrekenen, zodat de eerste frame al klopt.
    attempt('layout', function () {
      prepareLayout(BM.store.getProject(pid));
    });

    attempt('render', function () { BM.render.init(); });
    attempt('invoer', function () {
      if (BM.render.canvas) BM.input.attach(BM.render.canvas);
    });
    attempt('projectbalk', function () { BM.projects.init(); });
    attempt('weergave', function () { if (BM.view) BM.view.init(); });

    // Meteen goed in beeld zetten (zonder animatie bij het opstarten).
    attempt('beeld', function () { BM.camera.fit({ ms: 0 }); });

    attempt('startmelding', updateIntro);
    attempt('melding opslag', reportLoadIssue);

    BM.bus.on('node:dblclick', hideIntro);
    ['node:added', 'node:removed', 'project:switched', 'ui:popup-closed', 'store:changed'].forEach(function (ev) {
      BM.bus.on(ev, function () { attempt('startmelding', updateIntro); });
    });
    BM.bus.on('project:switched', function (d) {
      attempt('beeld na wisselen', function () {
        prepareLayout(BM.store.getProject(d && d.projectId));
        BM.camera.fit({ ms: 620 });
      });
    });

    BM.bus.on('store:save-failed', function () { attempt('melding opslag', onSaveFailed); });
    BM.bus.on('store:save-ok', function () { attempt('melding opslag', onSaveOk); });
    BM.bus.on('store:stale', function () { attempt('melding tabblad', onStale); });
    // Ging het opslaan al mis tijdens het opstarten, dan nu alsnog melden.
    if (BM.store.lastSaveOk && !BM.store.lastSaveOk()) attempt('melding opslag', onSaveFailed);

    window.addEventListener('beforeunload', saveNow);
    window.addEventListener('pagehide', saveNow);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') saveNow();
    });
  }

  BM.app = { start: start, saveNow: saveNow };

  // Met cloud-login start BM.auth de app zelf, na een geslaagde login (BM.cloud.begin).
  function autoStart() {
    if (BM.auth && BM.auth.vereist()) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  }

  autoStart();
})();
