(function () {
  var BM = window.BM = window.BM || {};

  var GAP = 24;            // distance between the node and the popup
  var MARGIN = 16;         // minimum distance to the viewport edge
  var CLOSE_MS = 180;      // close animation length
  var TOAST_MS = 3200;
  var UNDO_MS = 6000;
  var SIDE_MIN_W = 721;    // vanaf deze breedte (px) staat de pop-up vast rechts
  var SIDE_RIGHT = 16;     // vaste plek rechts
  var SIDE_TOP = 76;       // onder de ronde accountknop rechtsboven
  var SIDE_BOTTOM = 16;    // ruimte onder de pop-up (max. hoogte = venster - 92px)
  var COUNT_MIN = 1;       // teller naast Add branch
  var COUNT_MAX = 10;

  var state = null;        // the open popup session, or null
  var refreshQueued = false;

  var toastEl = null;
  var toastText = null;
  var toastBtn = null;
  var toastTimer = 0;

  var ICON = {
    add: '<path d="M12 5v14M5 12h14"/>',
    rename: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    open: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'
  };

  function safe(fn, fallback) {
    try {
      var v = fn();
      return v === undefined ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function reduceMotion() {
    return safe(function () {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }, false);
  }

  function clamp(v, lo, hi) {
    return Math.min(Math.max(v, lo), hi);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function getNode(id) {
    return safe(function () { return BM.store.getNode(id) || null; }, null);
  }

  function isRoot(node) {
    return node.parentId === null || node.parentId === undefined;
  }

  function descendantCount(id) {
    return safe(function () { return Math.max(0, BM.store.subtree(id).length - 1); }, 0);
  }

  function countText(n) {
    if (n === 0) return 'geen branches eronder';
    if (n === 1) return '1 branch eronder';
    return n + ' branches eronder';
  }

  function sameProject(d) {
    return !state || !d || !d.projectId || d.projectId === state.projectId;
  }

  function mkBtn(label, iconKey, extraCls) {
    var b = el('button', 'bm-btn bm-popup__btn' + (extraCls ? ' ' + extraCls : ''));
    b.type = 'button';
    b.innerHTML = '<svg class="bm-btn__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      ICON[iconKey] + '</svg>';
    b.appendChild(el('span', 'bm-btn__label', label));
    return b;
  }

  // ---------- DOM construction ----------

  function build() {
    var root = el('div', 'bm-popup');
    root.tabIndex = -1;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Branch');

    var head = el('div', 'bm-popup__head');
    var titleBox = el('div', 'bm-popup__titlebox');
    var title = el('h2', 'bm-popup__title');
    var meta = el('div', 'bm-popup__meta');
    titleBox.appendChild(title);
    titleBox.appendChild(meta);
    var closeBtn = el('button', 'bm-btn bm-popup__close', '×');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Sluiten');
    closeBtn.title = 'Sluiten (Esc)';
    head.appendChild(titleBox);
    head.appendChild(closeBtn);

    var actions = el('div', 'bm-popup__actions');
    actions.setAttribute('role', 'group');
    actions.setAttribute('aria-label', 'Acties');
    // Add branch met de teller "− 1 +" (hoeveel branches er in één keer bijkomen).
    var addRow = el('div', 'bm-popup__addrow');
    var bAdd = mkBtn('Add branch', 'add', 'bm-popup__btn--add');
    var counter = el('div', 'bm-popup__counter');
    var bMinus = el('button', 'bm-btn bm-popup__step bm-popup__step--minus', '−');
    bMinus.type = 'button';
    bMinus.setAttribute('aria-label', 'Minder');
    bMinus.title = 'Minder branches';
    var count = el('span', 'bm-popup__count', '1');
    count.setAttribute('aria-live', 'polite');
    var bPlus = el('button', 'bm-btn bm-popup__step bm-popup__step--plus', '+');
    bPlus.type = 'button';
    bPlus.setAttribute('aria-label', 'Meer');
    bPlus.title = 'Meer branches';
    counter.appendChild(bMinus);
    counter.appendChild(count);
    counter.appendChild(bPlus);
    addRow.appendChild(bAdd);
    addRow.appendChild(counter);
    var bRen = mkBtn('Rename', 'rename', 'bm-popup__btn--rename');
    var bDel = mkBtn('Delete branch', 'trash', 'bm-btn--danger bm-popup__btn--delete');
    var bOpen = mkBtn('Open', 'open', 'bm-popup__btn--open');
    actions.appendChild(addRow);
    actions.appendChild(bRen);
    actions.appendChild(bDel);
    actions.appendChild(bOpen);

    // Kleur: palet met bolletjes, "Geen kleur" en een plus voor een eigen kleur.
    var colors = el('div', 'bm-popup__colors');
    var colorHead = el('div', 'bm-popup__colorhead');
    colorHead.appendChild(el('span', 'bm-popup__colorlabel', 'Kleur'));
    var colorState = el('span', 'bm-popup__colorstate', '');
    colorHead.appendChild(colorState);
    var swatches = el('div', 'bm-swatches');
    swatches.setAttribute('role', 'group');
    swatches.setAttribute('aria-label', 'Kleur van deze branch');
    var picker = el('input', 'bm-swatch-picker');
    picker.type = 'color';
    picker.tabIndex = -1;
    picker.setAttribute('aria-hidden', 'true');
    colors.appendChild(colorHead);
    colors.appendChild(swatches);
    colors.appendChild(picker);

    var renameRow = el('div', 'bm-popup__rename');
    var input = el('input', 'bm-input');
    input.type = 'text';
    input.placeholder = 'Nieuwe naam';
    input.maxLength = 120;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('aria-label', 'Nieuwe naam');
    renameRow.appendChild(input);
    var renameHint = el('div', 'bm-hint', 'Enter bevestigt, Esc annuleert');
    renameRow.appendChild(renameHint);

    var confirmRow = el('div', 'bm-popup__confirm');
    var confirmText = el('p', 'bm-popup__confirm-text');
    var confirmBtns = el('div', 'bm-popup__confirm-btns');
    var bCancel = el('button', 'bm-btn bm-popup__btn--cancel', 'Annuleren');
    bCancel.type = 'button';
    var bConfirm = el('button', 'bm-btn bm-btn--danger bm-popup__btn--confirm', 'Verwijderen');
    bConfirm.type = 'button';
    confirmBtns.appendChild(bCancel);
    confirmBtns.appendChild(bConfirm);
    confirmRow.appendChild(confirmText);
    confirmRow.appendChild(confirmBtns);

    var list = el('div', 'bm-overview');
    var hint = el('div', 'bm-hint', 'Klik op een regel om hem in beeld te brengen. Esc sluit.');

    root.appendChild(head);
    root.appendChild(actions);
    root.appendChild(colors);
    root.appendChild(renameRow);
    root.appendChild(confirmRow);
    root.appendChild(list);
    root.appendChild(hint);

    return {
      root: root, title: title, meta: meta, closeBtn: closeBtn, actions: actions,
      bAdd: bAdd, bMinus: bMinus, bPlus: bPlus, count: count,
      bRen: bRen, bDel: bDel, bOpen: bOpen,
      renameRow: renameRow, input: input, renameHint: renameHint,
      confirmRow: confirmRow, confirmText: confirmText, bCancel: bCancel, bConfirm: bConfirm,
      colors: colors, colorState: colorState, swatches: swatches, picker: picker,
      list: list
    };
  }

  // ---------- kleuren ----------

  var PLUS_SVG = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" ' +
    'stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

  function paletteList() {
    return safe(function () { return BM.colors.palette(); }, []);
  }

  // Bolletjes alleen opnieuw opbouwen als het palet veranderd is (zodat hover en
  // focus niet bij elke kleine wijziging verspringen).
  function buildSwatches(s, force) {
    var ui = s.ui;
    var list = paletteList();
    var key = list.map(function (p) { return p.hex + (p.custom ? '*' : ''); }).join('|');
    if (!force && s.swatchKey === key) return;
    var hadFocus = ui.swatches.contains(document.activeElement);
    var focusColor = hadFocus ? document.activeElement.getAttribute('data-color') : null;
    var appear = s.swatchKey != null; // na de eerste keer: nieuwe bolletjes zacht laten verschijnen
    var oldKeys = Object.create(null);
    (s.swatchKey || '').split('|').forEach(function (k) { oldKeys[k.replace('*', '')] = true; });
    s.swatchKey = key;
    ui.swatches.textContent = '';

    var none = el('button', 'bm-swatch bm-swatch--none');
    none.type = 'button';
    none.setAttribute('data-color', '');
    none.setAttribute('aria-label', 'Geen kleur');
    none.title = 'Geen kleur';
    ui.swatches.appendChild(none);

    list.forEach(function (p) {
      var b = el('button', 'bm-swatch');
      b.type = 'button';
      b.style.setProperty('--sw', p.hex);
      b.setAttribute('data-color', p.hex);
      b.setAttribute('aria-label', p.custom ? 'Eigen kleur ' + p.hex : p.name);
      b.title = p.custom ? 'Eigen kleur (Delete haalt hem uit het palet)' : p.name;
      if (!p.custom) {
        ui.swatches.appendChild(b);
        return;
      }
      var wrap = el('span', 'bm-swatch-wrap' + (appear && !oldKeys[p.hex] ? ' bm-swatch-wrap--new' : ''));
      wrap.appendChild(b);
      var x = el('button', 'bm-swatch__x', '×');
      x.type = 'button';
      x.tabIndex = -1;
      x.setAttribute('data-remove', p.hex);
      x.setAttribute('aria-label', 'Kleur uit het palet halen');
      x.title = 'Uit het palet halen';
      wrap.appendChild(x);
      ui.swatches.appendChild(wrap);
    });

    var add = el('button', 'bm-swatch bm-swatch--add');
    add.type = 'button';
    add.setAttribute('data-add', '1');
    add.setAttribute('aria-label', 'Eigen kleur toevoegen');
    add.title = 'Eigen kleur toevoegen';
    add.innerHTML = PLUS_SVG;
    ui.swatches.appendChild(add);

    if (focusColor !== null) {
      var again = ui.swatches.querySelector('.bm-swatch[data-color="' + focusColor + '"]') || add;
      again.focus({ preventScroll: true });
    }
  }

  // Welke kleur is gekozen, en waar komt de kleur vandaan?
  function renderColors(node) {
    var s = state;
    if (!s) return;
    var ui = s.ui;
    buildSwatches(s, false);
    var own = node.color || null;
    var btns = ui.swatches.querySelectorAll('.bm-swatch[data-color]');
    for (var i = 0; i < btns.length; i++) {
      var c = btns[i].getAttribute('data-color');
      var on = own ? c === own : c === '';
      btns[i].classList.toggle('is-selected', on);
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    var txt = 'Geen kleur';
    var dot = null;
    if (own) {
      txt = 'Eigen kleur';
      dot = own;
    } else {
      var from = inheritedFrom(node);
      if (from) {
        txt = 'Van "' + (from.title || 'Zonder naam') + '"';
        dot = from.color;
      }
    }
    ui.colorState.textContent = txt;
    ui.colorState.title = txt;
    ui.colorState.style.setProperty('--sw', dot || 'transparent');
    ui.colorState.classList.toggle('bm-popup__colorstate--dot', !!dot);
  }

  function inheritedFrom(node) {
    var n = node;
    var guard = 0;
    while (n && n.parentId != null && guard++ < 100000) {
      n = getNode(n.parentId);
      if (n && n.color) return n;
    }
    return null;
  }

  function applyColor(nodeId, hex) {
    var node = getNode(nodeId);
    if (!node) return false;
    if ((node.color || null) === (hex || null)) return false;
    safe(function () { return BM.store.setColor(nodeId, hex || null); }, false);
    return true;
  }

  function narrowScreen() {
    return safe(function () {
      return !!(window.matchMedia && window.matchMedia('(max-width: 640px)').matches);
    }, false);
  }

  // Brede schermen (> 720px): de pop-up staat vast rechts en volgt het punt niet.
  function sideMode() {
    return safe(function () {
      if (window.matchMedia) return window.matchMedia('(min-width: ' + SIDE_MIN_W + 'px)').matches;
      return window.innerWidth >= SIDE_MIN_W;
    }, false);
  }

  function setCount(s, n) {
    var v = clamp(n, COUNT_MIN, COUNT_MAX);
    var ui = s.ui;
    s.count = v;
    if (ui.count.textContent !== String(v)) {
      ui.count.textContent = String(v);
      ui.count.classList.remove('bm-popup__count--bump');
      void ui.count.offsetWidth;
      ui.count.classList.add('bm-popup__count--bump');
    }
    // aria-disabled (niet disabled), zodat de knop de focus houdt aan de grens.
    ui.bMinus.setAttribute('aria-disabled', v <= COUNT_MIN ? 'true' : 'false');
    ui.bPlus.setAttribute('aria-disabled', v >= COUNT_MAX ? 'true' : 'false');
  }

  // Kleur kiezen en de golf laten zien. De pop-up staat vaak precies over de tak:
  // - telefoon (smal scherm): pop-up sluit, de golf start als het sluiten klaar is;
  // - computer: pop-up wordt de duur van de golf bijna doorzichtig (bm-popup--kijk).
  function chooseColor(s, nodeId, hex) {
    var node = getNode(nodeId);
    if (!node || (node.color || null) === (hex || null)) return;
    if (!reduceMotion() && narrowScreen()) {
      close();
      setTimeout(function () { applyColor(nodeId, hex); }, CLOSE_MS + 30);
      return;
    }
    if (!applyColor(nodeId, hex)) return;
    if (reduceMotion()) return;
    var dur = safe(function () { return BM.colors.waveRemaining(); }, 0);
    if (dur > 0 && state === s) watchWave(s, dur);
  }

  function watchWave(s, dur) {
    var root = s.ui.root;
    clearTimeout(s.kijkTimer);
    s.kijk = true;
    s.kijkLeft = false;
    root.classList.remove('bm-popup--terug');
    root.classList.add('bm-popup--kijk');
    s.kijkTimer = setTimeout(function () { stopWatch(s); }, dur);
    if (!s.onKijkMove) {
      // Pas terug als de muis eerst van de pop-up af is geweest en er daarna weer op komt.
      s.onKijkMove = function (e) {
        if (!s.kijk) return;
        var inside = pointInPopup(s, e.clientX, e.clientY);
        if (!inside) s.kijkLeft = true;
        else if (s.kijkLeft) stopWatch(s);
      };
      document.addEventListener('pointermove', s.onKijkMove, true);
    }
  }

  function pointInPopup(s, x, y) {
    var r = s.ui.root.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  function stopWatch(s) {
    clearTimeout(s.kijkTimer);
    s.kijkTimer = 0;
    if (s.onKijkMove) {
      document.removeEventListener('pointermove', s.onKijkMove, true);
      s.onKijkMove = null;
    }
    if (!s.kijk) return;
    s.kijk = false;
    var root = s.ui.root;
    root.classList.add('bm-popup--terug');
    root.classList.remove('bm-popup--kijk');
    setTimeout(function () { root.classList.remove('bm-popup--terug'); }, 300);
  }

  function onSwatchClick(e) {
    var s = state;
    if (!s) return;
    var t = e.target;
    var rm = t && t.closest ? t.closest('[data-remove]') : null;
    if (rm) {
      e.stopPropagation();
      removeFromPalette(rm.getAttribute('data-remove'));
      return;
    }
    var add = t && t.closest ? t.closest('[data-add]') : null;
    if (add) {
      openPicker(s);
      return;
    }
    var sw = t && t.closest ? t.closest('.bm-swatch[data-color]') : null;
    if (sw) chooseColor(s, s.nodeId, sw.getAttribute('data-color'));
  }

  // Eigen kleur uit het palet halen (kruisje of Delete op het bolletje), met Ongedaan maken.
  function removeFromPalette(hex) {
    var idx = safe(function () { return BM.store.palette().indexOf(hex); }, -1);
    var gone = safe(function () { return BM.store.removePaletteColor(hex); }, false);
    if (gone) {
      toast('Kleur uit het palet gehaald', {
        action: 'Ongedaan maken',
        ms: UNDO_MS,
        onAction: function () { safe(function () { return BM.store.addPaletteColor(hex, idx); }, false); }
      });
    }
    return gone;
  }

  function openPicker(s) {
    var picker = s.ui.picker;
    var node = getNode(s.nodeId);
    var start = (node && (node.color || safe(function () { return BM.store.effectiveColor(node.id); }, null))) || '#8b7cf6';
    s.pickTarget = s.nodeId;
    picker.value = start;
    try {
      if (typeof picker.showPicker === 'function') picker.showPicker();
      else picker.click();
    } catch (err) {
      try { picker.click(); } catch (e2) { /* geen kleurkiezer beschikbaar */ }
    }
  }

  // Kleur gekozen in de kleurkiezer: bij het palet zetten en meteen toepassen.
  function onPicked(s) {
    var hex = safe(function () { return BM.store.normalizeColor(s.ui.picker.value); }, null);
    if (!hex) return;
    // Vaste kleur gekozen? Dan niet nog eens als eigen kleur bewaren (store slaat hem over).
    var res = safe(function () { return BM.store.addPaletteColor(hex); }, false);
    if (res && res.dropped) {
      var dropped = res.dropped;
      toast('Palet vol: oudste eigen kleur weggehaald', {
        action: 'Ongedaan maken',
        ms: UNDO_MS,
        onAction: function () {
          safe(function () {
            BM.store.removePaletteColor(hex);
            return BM.store.addPaletteColor(dropped, 0);
          }, false);
        }
      });
    }
    var target = s.pickTarget || s.nodeId;
    s.pickTarget = null;
    chooseColor(s, target, hex);
  }

  function wire(s) {
    var ui = s.ui;
    ui.closeBtn.addEventListener('click', function () { close(); });
    ui.bAdd.addEventListener('click', addBranch);
    ui.bMinus.addEventListener('click', function () { setCount(s, s.count - 1); });
    ui.bPlus.addEventListener('click', function () { setCount(s, s.count + 1); });
    ui.bRen.addEventListener('click', startRename);
    ui.bDel.addEventListener('click', startDelete);
    ui.bOpen.addEventListener('click', openEditor);
    ui.bCancel.addEventListener('click', cancelDelete);
    ui.bConfirm.addEventListener('click', confirmDelete);
    ui.input.addEventListener('keydown', onInputKey);
    ui.input.addEventListener('input', function () {
      ui.input.classList.remove('bm-input--invalid');
      ui.input.removeAttribute('aria-invalid');
    });
    ui.input.addEventListener('blur', onInputBlur);
    ui.root.addEventListener('keydown', onRootKey);
    ui.swatches.addEventListener('click', onSwatchClick);
    ui.picker.addEventListener('change', function () { onPicked(s); });
  }

  // ---------- sizing and placement ----------

  function measure() {
    var s = state;
    if (!s) return;
    var r = s.ui.root;
    var room = s.side ? SIDE_TOP + SIDE_BOTTOM : MARGIN * 2;
    r.style.maxHeight = Math.max(200, window.innerHeight - room) + 'px';
    s.size = { w: r.offsetWidth, h: r.offsetHeight };
  }

  function position() {
    var s = state;
    if (!s) return;
    // Vaste plek rechts: de CSS-klasse bepaalt right/top, dus geen inline left/top.
    if (s.side) {
      s.ui.root.style.left = '';
      s.ui.root.style.top = '';
      s.ui.root.setAttribute('data-side', 'fixed-right');
      return;
    }
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var w = s.size.w;
    var h = s.size.h;
    var ax = s.anchor.x;
    var ay = s.anchor.y;

    var fitR = ax + GAP + w <= vw - MARGIN;
    var fitL = ax - GAP - w >= MARGIN;
    var fitB = ay + GAP + h <= vh - MARGIN;
    var fitA = ay - GAP - h >= MARGIN;

    // De kant wordt bij het openen gekozen en blijft daarna staan. Alleen als hij
    // echt niet meer past (en de andere kant wel), wisselt hij, met een zachte overgang.
    var right = s.right == null ? fitR : s.right;
    if (right && !fitR && fitL) right = false;
    else if (!right && !fitL && fitR) right = true;
    var below = s.below == null ? fitB : s.below;
    if (below && !fitB && fitA) below = false;
    else if (!below && !fitA && fitB) below = true;

    if ((s.right != null && right !== s.right) || (s.below != null && below !== s.below)) {
      slide(s);
    }
    s.right = right;
    s.below = below;

    var left = right ? ax + GAP : ax - GAP - w;
    var top = below ? ay + GAP : ay - GAP - h;

    left = clamp(left, MARGIN, Math.max(MARGIN, vw - w - MARGIN));
    top = clamp(top, MARGIN, Math.max(MARGIN, vh - h - MARGIN));

    var r = s.ui.root;
    r.style.left = Math.round(left) + 'px';
    r.style.top = Math.round(top) + 'px';
    r.setAttribute('data-side', (below ? 'below' : 'above') + '-' + (right ? 'right' : 'left'));
  }

  // Kantwissel: left/top kort laten overgaan, daarna weer direct volgen.
  function slide(s) {
    if (reduceMotion()) return;
    var r = s.ui.root;
    r.classList.add('bm-popup--sliding');
    clearTimeout(s.slideTimer);
    s.slideTimer = setTimeout(function () {
      r.classList.remove('bm-popup--sliding');
    }, 240);
  }

  // Vaste plek rechts (breed scherm) of naast het punt (smal scherm). Wisselt het
  // scherm van breedte, dan wordt de volgende stand meteen toegepast.
  function applySide(s) {
    var want = sideMode();
    if (want === !!s.side) return;
    s.side = want;
    var r = s.ui.root;
    r.classList.toggle('bm-popup--side', want);
    clearTimeout(s.slideTimer);
    r.classList.remove('bm-popup--sliding');
    if (want) {
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
    } else {
      var n = getNode(s.nodeId);
      var p = n ? toScreen(n.x, n.y) : null;
      if (p) s.anchor = p;
      startFollow(s);
    }
    measure();
    position();
  }

  function setMode(mode) {
    var s = state;
    if (!s) return;
    var ui = s.ui;
    s.mode = mode; // set first, so a blur during hiding is ignored
    ui.root.classList.toggle('bm-popup--renaming', mode === 'rename');
    ui.root.classList.toggle('bm-popup--confirm', mode === 'confirm');
    // Acties blijven zichtbaar bij het hernoemen, zodat Add branch ook dan werkt.
    ui.actions.style.display = mode === 'confirm' ? 'none' : '';
    ui.colors.style.display = mode === 'menu' ? '' : 'none';
    ui.renameRow.style.display = mode === 'rename' ? '' : 'none';
    ui.confirmRow.style.display = mode === 'confirm' ? '' : 'none';
    measure();
    position();
  }

  // ---------- rendering ----------

  function renderHeader(node) {
    var ui = state.ui;
    var root = isRoot(node);
    var n = descendantCount(node.id);
    var lvl = root ? 'Hoofdpunt' : 'Niveau ' + safe(function () { return BM.store.depth(node.id); }, 0);
    ui.title.textContent = node.title || 'Zonder naam';
    ui.meta.textContent = lvl + ' · ' + countText(n);
    ui.bDel.disabled = root;
    ui.bDel.title = root ? 'Het hoofdpunt kan niet verwijderd worden' : 'Branch verwijderen';
    ui.root.classList.toggle('bm-popup--root', root);
    renderColors(node);
  }

  function refreshAll() {
    var s = state;
    if (!s || !s.open) return;
    var node = getNode(s.nodeId);
    if (!node) { close(); return; }

    renderHeader(node);

    var root = s.ui.root;
    var hadFocus = root.contains(document.activeElement);
    // De lijst niet leegmaken: overview hergebruikt zijn eigen staat (zoekterm, focus, inklappen).
    try {
      if (BM.overview && typeof BM.overview.render === 'function') {
        BM.overview.render(s.ui.list, s.nodeId);
      }
    } catch (err) {
      s.ui.list.appendChild(el('div', 'bm-hint', 'Overzicht kon niet worden geladen.'));
      if (window.console) console.warn('[popup] overview', err);
    }
    if (hadFocus && !root.contains(document.activeElement)) {
      root.focus({ preventScroll: true });
    }
    measure();
    position();
  }

  function refreshHeader() {
    var s = state;
    if (!s || !s.open) return;
    var node = getNode(s.nodeId);
    if (!node) { close(); return; }
    renderHeader(node);
    measure();
    position();
  }

  function scheduleRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(function () {
      refreshQueued = false;
      refreshAll();
    });
  }

  // ---------- actions ----------

  // Nieuwe branch: meteen een naamveld, zodat niet alles "Nieuwe branch" heet.
  // Enter slaat de naam op, Esc laat "Nieuwe branch" staan.
  // De pop-up blijft staan op het ouderpunt: de nieuwe branch krijgt alleen het naamveld.
  function addNamed(parentId, name) {
    return safe(function () { return BM.store.addNode(parentId, name); }, null);
  }

  function addBranch() {
    var s = state;
    if (!s) return;
    // Stond er nog een naam open (ook als er op Add branch geklikt wordt): eerst bewaren.
    if (s.mode === 'rename') {
      applyRename(s);
      exitRename(false);
    }
    var n = s.count || COUNT_MIN;
    if (n > COUNT_MIN) {
      addMany(s, n);
      return;
    }
    var node = addNamed(s.nodeId, 'Nieuwe branch');
    if (!node) {
      toast('Kon geen branch toevoegen');
      return;
    }
    refreshHeader();
    startRename(node.id);
  }

  // Meerdere branches in één keer, zonder naamveld: "Nieuwe branch", "Nieuwe branch 2", ...
  function addMany(s, n) {
    var made = 0;
    for (var k = 1; k <= n; k++) {
      if (addNamed(s.nodeId, k === 1 ? 'Nieuwe branch' : 'Nieuwe branch ' + k)) made++;
    }
    setCount(s, COUNT_MIN);
    if (!made) {
      toast('Kon geen branch toevoegen', { error: true });
      return;
    }
    refreshHeader();
    toast(made === 1 ? '1 branch toegevoegd' : made + ' branches toegevoegd');
    if (state === s) s.ui.bAdd.focus({ preventScroll: true });
  }

  function openEditor() {
    var s = state;
    if (!s) return;
    var id = s.nodeId;
    close();
    BM.bus.emit('ui:open-editor', { nodeId: id });
  }

  // Rename

  // targetId: het punt dat een naam krijgt (standaard het punt van de pop-up;
  // na Add branch de nieuwe branch).
  function startRename(targetId) {
    var s = state;
    if (!s) return;
    var id = (typeof targetId === 'string') ? targetId : s.nodeId;
    var node = getNode(id);
    if (!node) return;
    s.renameId = id;
    s.renameIsNew = id !== s.nodeId;
    setMode('rename');
    var input = s.ui.input;
    // De projectnaam (middenpunt) mag maximaal 80 tekens zijn, andere punten 200.
    input.maxLength = isRoot(node) ? 80 : 200;
    input.placeholder = s.renameIsNew ? 'Naam van de nieuwe branch' : 'Nieuwe naam';
    input.setAttribute('aria-label', input.placeholder);
    s.ui.renameHint.textContent = s.renameIsNew
      ? 'Enter slaat de naam op, Esc laat "Nieuwe branch" staan'
      : 'Enter bevestigt, Esc annuleert';
    input.value = node.title || '';
    input.classList.remove('bm-input--invalid');
    input.removeAttribute('aria-invalid');
    input.classList.remove('bm-input--in');
    void input.offsetWidth;
    input.classList.add('bm-input--in');
    input.focus({ preventScroll: true });
    input.select();
  }

  function exitRename(focusBtn) {
    var s = state;
    if (!s) return;
    var wasNew = s.renameIsNew;
    s.renameId = null;
    s.renameIsNew = false;
    setMode('menu');
    // Na een nieuwe branch staat de focus op Add branch, zodat Enter er meteen nog een maakt.
    if (focusBtn) (wasNew ? s.ui.bAdd : s.ui.bRen).focus({ preventScroll: true });
  }

  // Slaat de getypte naam op (als die niet leeg is en anders is). Geeft false bij een lege naam.
  function applyRename(s) {
    var name = s.ui.input.value.replace(/\s+/g, ' ').trim();
    if (!name) return false;
    var id = s.renameId || s.nodeId;
    var node = getNode(id);
    if (node && name !== node.title) {
      if (isRoot(node) && BM.store.renameProject) {
        // renameProject zet ook de titel van het middenpunt.
        safe(function () { BM.store.renameProject(BM.store.projectOf(id).id, name); return true; }, false);
      } else {
        safe(function () { BM.store.renameNode(id, name); return true; }, false);
      }
    }
    return true;
  }

  function commitRename(fromBlur) {
    var s = state;
    if (!s || s.mode !== 'rename') return;
    var input = s.ui.input;
    if (!applyRename(s)) {
      if (fromBlur) { exitRename(false); return; }
      input.classList.add('bm-input--invalid');
      input.setAttribute('aria-invalid', 'true');
      input.focus({ preventScroll: true });
      return;
    }
    exitRename(!fromBlur);
    refreshHeader();
  }

  function onInputKey(e) {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      exitRename(true);
    }
  }

  function onInputBlur() {
    var s = state;
    if (!s || s.mode !== 'rename') return;
    if (s.ui.input.value.trim()) commitRename(true);
    else exitRename(false);
  }

  // Delete with confirmation and undo

  function startDelete() {
    var s = state;
    if (!s) return;
    var node = getNode(s.nodeId);
    if (!node || isRoot(node)) return;
    var n = descendantCount(node.id);
    s.ui.confirmText.textContent = n === 0
      ? 'Deze branch wordt verwijderd. Je kunt dit even ongedaan maken.'
      : 'Deze branch en ' + n + (n === 1 ? ' punt' : ' punten') +
        ' eronder worden verwijderd. Je kunt dit even ongedaan maken.';
    setMode('confirm');
    s.ui.bCancel.focus({ preventScroll: true });
  }

  function cancelDelete() {
    var s = state;
    if (!s) return;
    setMode('menu');
    s.ui.bDel.focus({ preventScroll: true });
  }

  // Ongedaan maken: de snapshot die store.removeNode teruggeeft, zet de store zelf terug
  // (incl. de id-index), zodat het punt meteen weer opvraagbaar is.
  // Zit je inmiddels in een ander project, dan gaan we eerst terug naar het project
  // waar de branch vandaan kwam, zodat je ziet dat hij terug is.
  function restoreSnapshot(snap) {
    var otherProject = safe(function () { return BM.store.currentId(); }, null) !== snap.projectId;
    var proj = safe(function () { return BM.store.getProject(snap.projectId); }, null);
    if (otherProject && proj) safe(function () { return BM.store.setCurrent(snap.projectId); }, false);
    var ok = safe(function () { return BM.store.restoreSnapshot(snap); }, false);
    if (!ok) {
      toast('Kan dit niet ongedaan maken', { error: true });
      return;
    }
    toast(otherProject && proj ? 'Branch teruggezet in ' + proj.name : 'Branch teruggezet');
  }

  // Verwijderen: eerst de branch laten uitfaden (BM.anim), daarna pas uit de store halen.
  function confirmDelete() {
    var s = state;
    if (!s) return;
    var node = getNode(s.nodeId);
    if (!node || isRoot(node)) return;
    var id = node.id;
    var ids = safe(function () { return BM.store.subtree(id); }, [id]);
    close();

    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      pendingDeletes.splice(pendingDeletes.indexOf(finish) >>> 0, 1);
      var snap = safe(function () { return BM.store.removeNode(id); }, null);
      if (!snap) {
        // De punten weer zichtbaar maken; anders blijven ze onzichtbaar maar bestaan ze nog.
        if (BM.anim && typeof BM.anim.forget === 'function') ids.forEach(BM.anim.forget);
        toast('Kon branch niet verwijderen');
        return;
      }
      toast('Branch verwijderd', {
        action: 'Ongedaan maken',
        ms: UNDO_MS,
        onAction: function () { restoreSnapshot(snap); }
      });
    };

    pendingDeletes.push(finish);
    if (BM.anim && typeof BM.anim.fadeOut === 'function') {
      BM.anim.fadeOut(ids, 260, finish);
    } else {
      finish();
    }
  }

  // Wordt het tabblad gesloten tijdens het uitfaden, dan het verwijderen nu afronden
  // (vóór app.js het geheel opslaat; deze listener staat eerder geregistreerd).
  var pendingDeletes = [];
  function flushDeletes() {
    pendingDeletes.slice().forEach(function (fn) { fn(); });
  }
  window.addEventListener('pagehide', flushDeletes);
  window.addEventListener('beforeunload', flushDeletes);

  // ---------- toast ----------

  // Meldingen staan in een stapel onderin. Elke melding heeft een eigen timer, dus
  // een nieuwe melding duwt de "Ongedaan maken"-melding niet weg.
  // Gewone meldingen zonder knop vervangen elkaar wel (maximaal een tegelijk).
  var MAX_TOASTS = 3;

  function ensureStack() {
    if (toastEl && toastEl.isConnected) return toastEl;
    toastEl = el('div', 'bm-toasts');
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function dismiss(item) {
    if (!item || item._gone) return;
    item._gone = true;
    clearTimeout(item._timer);
    item.classList.remove('bm-toast--show');
    var h = item.offsetHeight;
    item.style.marginTop = '-' + (h + 8) + 'px';
    setTimeout(function () {
      if (item.parentNode) item.parentNode.removeChild(item);
    }, reduceMotion() ? 0 : 300);
  }

  function toast(text, opts) {
    opts = opts || {};
    var stack = ensureStack();
    var hasAction = !!(opts.action && typeof opts.onAction === 'function');

    // Gewone melding: vervang de vorige gewone melding.
    if (!hasAction) {
      Array.prototype.forEach.call(stack.querySelectorAll('.bm-toast--plain'), dismiss);
    }

    var item = el('div', 'bm-toast' + (hasAction ? ' bm-toast--action' : ' bm-toast--plain') +
      (opts.error ? ' bm-toast--error' : ''));
    item.appendChild(el('span', 'bm-toast__text', text));
    if (hasAction) {
      var b = el('button', 'bm-btn bm-btn--small bm-toast__action', opts.action);
      b.type = 'button';
      b.addEventListener('click', function () {
        dismiss(item);
        opts.onAction();
      });
      item.appendChild(b);
    }
    if (opts.tag) item.setAttribute('data-tag', opts.tag);
    stack.appendChild(item);

    // ms: 0 = blijvend (tot de knop gekozen is). Blijvende meldingen worden nooit weggeduwd.
    var sticky = opts.ms === 0 && hasAction;
    item._sticky = sticky;

    var all = stack.querySelectorAll('.bm-toast');
    var live = Array.prototype.filter.call(all, function (x) { return !x._gone && !x._sticky; });
    while (live.length > MAX_TOASTS) dismiss(live.shift());

    requestAnimationFrame(function () {
      void item.offsetWidth;
      item.classList.add('bm-toast--show');
    });
    if (!sticky) item._timer = setTimeout(function () { dismiss(item); }, opts.ms || TOAST_MS);
    return { close: function () { dismiss(item); } };
  }

  // ---------- keyboard ----------

  function trapTab(e, root) {
    var items = Array.prototype.filter.call(
      root.querySelectorAll('button, input, [tabindex="0"]'),
      function (x) { return !x.disabled && x.offsetParent !== null; }
    );
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    var a = document.activeElement;
    var outside = !root.contains(a) || a === root;
    if (e.shiftKey) {
      if (outside || a === first) { e.preventDefault(); last.focus({ preventScroll: true }); }
    } else if (outside || a === last) {
      e.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  function onRootKey(e) {
    var s = state;
    if (!s) return;
    e.stopPropagation(); // keep global shortcuts (F, Esc of the editor, ...) out of the popup

    if (e.key === 'Tab') {
      trapTab(e, s.ui.root);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      if (s.mode === 'confirm') cancelDelete();
      else if (s.mode === 'rename') exitRename(true);
      else close();
      return;
    }
    if (s.kijk) stopWatch(s); // een toets brengt de pop-up meteen terug
    if (s.mode === 'rename') return;

    if ((e.key === 'Delete' || e.key === 'Backspace') && s.ui.swatches.contains(document.activeElement)) {
      var own = document.activeElement;
      var wrapEl = own.closest ? own.closest('.bm-swatch-wrap') : null;
      if (wrapEl && own.classList.contains('bm-swatch')) {
        e.preventDefault();
        var all = Array.prototype.slice.call(s.ui.swatches.querySelectorAll('.bm-swatch'));
        var pos = all.indexOf(own);
        if (removeFromPalette(own.getAttribute('data-color'))) {
          // Focus naar het bolletje dat nu op dezelfde plek staat (anders het plusje).
          buildSwatches(s, false);
          renderColors(getNode(s.nodeId) || {});
          var now = s.ui.swatches.querySelectorAll('.bm-swatch');
          var next = now[Math.min(pos, now.length - 1)];
          if (next) next.focus({ preventScroll: true });
        }
      }
      return;
    }

    if (e.key === 'Enter') {
      if (document.activeElement === s.ui.root) {
        e.preventDefault();
        openEditor();
      }
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      // Pijltjes binnen het kleurpalet: naar het vorige of volgende bolletje.
      if (s.ui.swatches.contains(document.activeElement)) {
        var sws = Array.prototype.slice.call(s.ui.swatches.querySelectorAll('.bm-swatch'));
        var si = sws.indexOf(document.activeElement);
        if (si !== -1) {
          e.preventDefault();
          var sd = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1;
          sws[(si + sd + sws.length) % sws.length].focus({ preventScroll: true });
        }
        return;
      }
      var group = s.mode === 'confirm'
        ? [s.ui.bCancel, s.ui.bConfirm]
        : [s.ui.bAdd, s.ui.bMinus, s.ui.bPlus, s.ui.bRen, s.ui.bDel, s.ui.bOpen];
      group = group.filter(function (b) { return !b.disabled && b.offsetParent !== null; });
      var idx = group.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      var dir = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1;
      group[(idx + dir + group.length) % group.length].focus({ preventScroll: true });
    }
  }

  // ---------- listeners while open ----------

  function toScreen(x, y) {
    var r = safe(function () { return BM.camera.worldToScreen(x, y); }, null);
    if (!r) return null;
    if (Array.isArray(r)) return { x: r[0], y: r[1] };
    if (typeof r.x === 'number' && typeof r.y === 'number') return { x: r.x, y: r.y };
    return null;
  }

  function startFollow(s) {
    if (s.side) return; // vaste plek rechts: geen volgen
    if (!BM.camera || typeof BM.camera.worldToScreen !== 'function') return;
    var tick = function () {
      if (state !== s) return;
      var n = getNode(s.nodeId);
      if (!n) { close(); return; }
      var p = s.frozen ? null : toScreen(n.x, n.y);
      if (p && (Math.abs(p.x - s.anchor.x) > 0.5 || Math.abs(p.y - s.anchor.y) > 0.5)) {
        s.anchor = p;
        position();
      }
      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
  }

  function listen(s) {
    s.onDown = function (e) {
      if (state !== s) return;
      if (s.kijk && pointInPopup(s, e.clientX, e.clientY)) {
        // Pop-up is doorzichtig (kleurgolf): een druk erop haalt hem terug,
        // zonder dat de klik op het canvas eronder terechtkomt.
        e.preventDefault();
        e.stopPropagation();
        stopWatch(s);
        return;
      }
      var t = e.target;
      if (s.ui.root.contains(t)) return;
      // Het accountmenu (rechtsboven) hoort bij de pagina: een klik erin sluit de pop-up niet.
      if (t && t.closest && t.closest('#bm-account')) return;
      // Meldingen (ook de knop Ongedaan maken) en elementen die door een herteken-actie
      // al uit de pagina zijn gehaald, sluiten de pop-up niet.
      if (t && t.closest && t.closest('.bm-toasts')) return;
      if (t && t.isConnected === false) return;
      if (t && t.tagName === 'CANVAS') {
        var hit = safe(function () {
          return BM.render && typeof BM.render.hitTest === 'function'
            ? BM.render.hitTest(e.clientX, e.clientY) : null;
        }, null);
        if (hit && hit === s.nodeId) return; // pressing the same node keeps the popup
        // Vaste pop-up (breed scherm): een klik op een ander punt laat hem staan;
        // het klik-event (node:click) wisselt dan alleen de inhoud.
        if (hit && s.side) return;
      }
      close();
    };
    // Zoomen met het wiel sluit de pop-up niet: hij volgt zijn punt (startFollow).
    s.onKey = function (e) {
      if (state !== s || e.key !== 'Escape') return;
      if (s.ui.root.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      close();
    };
    s.onResize = function () {
      if (state !== s) return;
      applySide(s);
      measure();
      position();
    };

    s.subs = [
      ['project:switched', function () { if (state === s) close(); }],
      ['ui:open-editor', function () { if (state === s) close(); }],
      // Klik in het overzicht: de pop-up blijft staan (niet meer meeschuiven met zijn punt),
      // terwijl de camera het gekozen punt naast de pop-up in beeld brengt.
      ['node:focus', function (d) { if (state === s && d && d.source === 'overview') s.frozen = true; }],
      // De lijst zelf werkt overview.js bij via zijn eigen bus-abonnement;
      // hier alleen de kop (titel en aantallen). Zo wordt de lijst maar een keer opgebouwd.
      ['node:removed', function (d) {
        if (state !== s) return;
        if (d && d.nodeIds && d.nodeIds.indexOf(s.nodeId) !== -1) close();
        else if (sameProject(d)) refreshHeader();
      }],
      ['node:added', function (d) { if (state === s && sameProject(d)) refreshHeader(); }],
      ['node:color', function (d) { if (state === s && sameProject(d)) refreshHeader(); }],
      ['palette:changed', function () { if (state === s) refreshHeader(); }],
      ['node:renamed', function (d) { if (state === s && sameProject(d)) refreshHeader(); }]
    ];

    // Groeit of krimpt de pop-up (bijv. omdat het overzicht nieuwe regels kreeg),
    // dan opnieuw meten en binnen het scherm houden.
    if (typeof ResizeObserver === 'function') {
      s.ro = new ResizeObserver(function () {
        if (state !== s) return;
        measure();
        position();
      });
      s.ro.observe(s.ui.root);
    }

    document.addEventListener('pointerdown', s.onDown, true);
    document.addEventListener('keydown', s.onKey, true);
    window.addEventListener('resize', s.onResize);
    s.subs.forEach(function (p) { BM.bus.on(p[0], p[1]); });
  }

  function unlisten(s) {
    document.removeEventListener('pointerdown', s.onDown, true);
    document.removeEventListener('keydown', s.onKey, true);
    window.removeEventListener('resize', s.onResize);
    if (s.ro) { try { s.ro.disconnect(); } catch (e) { /* negeren */ } s.ro = null; }
    (s.subs || []).forEach(function (p) { BM.bus.off(p[0], p[1]); });
    s.subs = [];
  }

  // ---------- open / close ----------

  // Breed scherm, pop-up al open: alleen de inhoud wisselt naar het andere punt
  // (geen dicht- en weer opengaan).
  function switchNode(s, nodeId) {
    var hadFocus = s.ui.root.contains(document.activeElement);
    s.nodeId = nodeId;
    s.projectId = safe(function () { return BM.store.currentId(); }, null);
    s.frozen = false;
    s.pickTarget = null;
    s.renameId = null;
    s.renameIsNew = false;
    if (s.kijk) stopWatch(s);
    setCount(s, COUNT_MIN);
    setMode('menu');
    refreshAll();
    if (hadFocus && !s.ui.root.contains(document.activeElement)) s.ui.root.focus({ preventScroll: true });
    safe(function () { BM.bus.emit('ui:popup-opened', { nodeId: nodeId }); return true; }, false);
  }

  function openAt(nodeId, sx, sy) {
    if (!nodeId || !getNode(nodeId)) return;
    var side = sideMode();

    if (state && state.open) {
      if (state.nodeId === nodeId) {
        state.frozen = false;
        state.anchor = { x: sx || 0, y: sy || 0 };
        position();
        return;
      }
      if (side && state.side) {
        switchNode(state, nodeId);
        return;
      }
      close();
    }

    var prev = document.activeElement;
    var s = {
      open: true,
      nodeId: nodeId,
      projectId: safe(function () { return BM.store.currentId(); }, null),
      anchor: { x: sx || 0, y: sy || 0 },
      side: side,          // vaste plek rechts (breed scherm)
      count: COUNT_MIN,    // teller van Add branch
      mode: 'menu',
      size: { w: 0, h: 0 },
      right: null,         // gekozen kant (rechts van het punt), vast na het openen
      below: null,
      renameId: null,
      renameIsNew: false,
      swatchKey: null,
      pickTarget: null,
      kijk: false,
      kijkTimer: 0,
      onKijkMove: null,
      raf: 0,
      prevFocus: prev && prev !== document.body ? prev : null,
      ui: null,
      subs: []
    };
    s.ui = build();
    state = s;
    wire(s);
    s.ui.root.classList.toggle('bm-popup--side', side);
    document.body.appendChild(s.ui.root);
    setCount(s, COUNT_MIN);
    setMode('menu');
    refreshAll();
    listen(s);
    requestAnimationFrame(function () {
      if (state !== s) return;
      void s.ui.root.offsetWidth; // force style so the transition runs
      s.ui.root.classList.add('bm-popup--open');
      // Pas focussen als de pop-up zichtbaar is (anders gaat de focus verloren),
      // en niet als er intussen al iets in de pop-up de focus heeft.
      if (!s.ui.root.contains(document.activeElement)) s.ui.root.focus({ preventScroll: true });
    });
    startFollow(s);
    safe(function () { BM.bus.emit('ui:popup-opened', { nodeId: nodeId }); return true; }, false);
  }

  function close() {
    var s = state;
    if (!s) return;
    // Een getypte naam niet weggooien als de pop-up sluit (buiten klikken, project wisselen).
    if (s.mode === 'rename') safe(function () { return applyRename(s); }, false);
    state = null;
    s.open = false;
    stopWatch(s);
    unlisten(s);
    if (s.raf) cancelAnimationFrame(s.raf);
    clearTimeout(s.slideTimer);
    safe(function () {
      if (BM.overview && typeof BM.overview.release === 'function') BM.overview.release(s.ui.list);
      return true;
    }, false);

    var root = s.ui.root;
    var hadFocus = root.contains(document.activeElement);
    root.classList.remove('bm-popup--open');
    root.classList.add('bm-popup--closing');
    root.setAttribute('aria-hidden', 'true');
    root.style.pointerEvents = 'none';

    var remove = function () {
      if (root.parentNode) root.parentNode.removeChild(root);
    };
    if (reduceMotion()) remove();
    else setTimeout(remove, CLOSE_MS);

    safe(function () { BM.bus.emit('ui:popup-closed', { nodeId: s.nodeId }); return true; }, false);

    if (hadFocus) {
      var target = s.prevFocus;
      if (target && document.body.contains(target) && typeof target.focus === 'function') {
        target.focus({ preventScroll: true });
      } else if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
    }
  }

  // ---------- public API ----------

  BM.popup = {
    open: openAt,
    close: close,
    isOpen: function () { return !!(state && state.open); },
    refresh: scheduleRefresh,
    toast: toast
  };
  // Gedeelde meldingen voor alle modules (projectbalk, app).
  BM.toast = toast;

  /* Eén klik: menu met Add branch / Rename / Delete branch / Open + overzicht */
  BM.bus.on('node:click', function (d) {
    if (!d || !d.nodeId) return;
    openAt(d.nodeId, d.screenX, d.screenY);
  });
  /* Vanuit andere onderdelen (bijv. het notitiepaneel): pop-up voor dit punt openen.
     Breed scherm: vaste plek rechts. Smal scherm: naast het punt. */
  BM.bus.on('ui:open-popup', function (d) {
    if (!d || !d.nodeId) return;
    var node = getNode(d.nodeId);
    if (!node) return;
    if (sideMode()) {
      openAt(d.nodeId);
      return;
    }
    var p = null;
    if (typeof d.screenX === 'number' && typeof d.screenY === 'number') p = { x: d.screenX, y: d.screenY };
    else p = toScreen(node.x, node.y);
    if (!p) p = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    openAt(d.nodeId, p.x, p.y);
  });
  /* Dubbelklik: lezen wat erin staat (notitiepaneel) */
  BM.bus.on('node:dblclick', function (d) {
    if (!d || !d.nodeId) return;
    if (typeof close === 'function') { try { close(); } catch (e) {} }
    BM.bus.emit('ui:open-editor', { nodeId: d.nodeId });
  });
})();
