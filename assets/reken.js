(() => {
  'use strict';

  const el = id => document.getElementById(id);
  const pendingDecimals = new WeakMap();
  const fmt = (number, decimals) => number.toFixed(decimals).replace('.', ',');
  // Getal met hoogstens één decimaal en een komma, zonder ',0' (3 in plaats van 3,0).
  const getal = number => fmt(number, 1).replace(/,0$/, '');
  const beweging = window.matchMedia('(prefers-reduced-motion: reduce)');
  const zachtVerloop = node => getComputedStyle(node).getPropertyValue('--ease').trim() || 'ease-out';
  const emptyRows = () => [{ naam: '', punt: '', weeg: '' }, { naam: '', punt: '', weeg: '' }, { naam: '', punt: '', weeg: '' }];
  const ruleLabels = {
    ex2r1: 'Gewogen gemiddelde minstens 55%',
    ex2r2: 'Geen vak onder 8/20',
    ex2r3: 'Hoogstens 2 vakken onder 10',
    ex2r4: 'Hoogstens 3 punten tekort',
    ex2r5: 'Gewogen-punten-tekort hoogstens 18'
  };
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  // Schrijft alleen als er iets verandert, zodat een schermlezer niet bij elke toets opnieuw voorleest.
  function zetTekst(node, tekst) {
    if (node.textContent !== tekst) node.textContent = tekst;
  }

  function zetMarker(node, state) {
    zetTekst(node, state === null ? '−' : state ? '✓' : '×');
    node.setAttribute('role', 'img');
    node.setAttribute('aria-label', state === null ? 'Nog niet in te vullen' : state ? 'Voldaan' : 'Niet voldaan');
  }

  // Een rij glijdt open of dicht in hoogte en opacity (220 ms); de ruimte tussen de rijen schuift mee.
  function glijRij(item, naarOpen, klaar) {
    if (beweging.matches || !item.animate) { if (klaar) klaar(); return; }
    const stijl = getComputedStyle(item);
    const gat = parseFloat(getComputedStyle(item.parentElement).rowGap) || 0;
    const rand = item.previousElementSibling ? 'marginTop' : 'marginBottom';
    const open = { height: item.getBoundingClientRect().height + 'px', paddingBottom: stijl.paddingBottom, borderBottomWidth: stijl.borderBottomWidth, opacity: 1, [rand]: '0px' };
    const dicht = { height: '0px', paddingBottom: '0px', borderBottomWidth: '0px', opacity: 0, [rand]: -gat + 'px' };
    item.style.overflow = 'clip';
    const animatie = item.animate(naarOpen ? [dicht, open] : [open, dicht], { duration: 220, easing: zachtVerloop(item), fill: naarOpen ? 'none' : 'forwards' });
    const einde = () => { item.style.overflow = ''; if (klaar) klaar(); };
    animatie.finished.then(einde, einde);
  }

  // Alle rijen van een blok veranderen tegelijk (Alles wissen): de hoogte van het blok glijdt mee.
  function glijBlok(box, wijzig) {
    const voor = box.getBoundingClientRect().height;
    box.getAnimations().forEach(animatie => animatie.cancel());
    wijzig();
    if (beweging.matches || !box.animate || !voor) return;
    const na = box.getBoundingClientRect().height;
    if (Math.abs(voor - na) < 1) return;
    box.style.overflow = 'clip';
    box.animate([{ height: voor + 'px' }, { height: na + 'px' }], { duration: 220, easing: zachtVerloop(box) }).finished.then(() => { box.style.overflow = ''; }, () => { box.style.overflow = ''; });
  }

  // Een cijfer of gewicht buiten het toegestane bereik krijgt de foutrand; het rekent wel gewoon mee.
  function markeerBereik(input) {
    if (!input.matches('input[type="number"]')) return;
    if (input.validity.rangeUnderflow || input.validity.rangeOverflow) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function field(className, labelText, value, number, max, step) {
    const label = create('label', number ? 'reken-veld uwrap' : 'reken-veld naam-veld');
    label.append(create('span', 'veld-label', labelText));
    const input = create('input', className + ' auth-input' + (number ? ' num' : ''));
    input.type = number ? 'number' : 'text';
    input.placeholder = number ? '0' : labelText;
    if (number) {
      input.inputMode = 'decimal';
      input.min = '0';
      input.max = String(max);
      input.step = String(step);
    }
    const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    input.value = number ? text.replace(/,/g, '.') : text;
    label.append(input);
    return label;
  }

  function row(data, kind) {
    const element = create('div', 'crow');
    if (kind === 1) {
      element.append(field('c-naam', 'Onderdeel', data.naam, false));
      element.append(field('c-punt', 'Cijfer (op 20)', data.punt, true, 20, 0.1));
      element.append(field('c-weeg', 'Gewicht (%)', data.weeg, true, 100, 1));
    } else {
      element.append(field('v-naam', 'Vak', data.naam, false));
      element.append(field('v-sp', 'Studiepunten', data.sp, true, 30, 1));
      element.append(field('v-cij', 'Cijfer (op 20)', data.cij, true, 20, 1));
    }
    const remove = create('button', 'delbtn', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Rij verwijderen');
    element.append(remove);
    return element;
  }

  function updateRows(box) {
    const rows = [...box.querySelectorAll('.crow:not(.is-weg)')];
    rows.forEach((item, index) => {
      item.querySelectorAll('input').forEach(input => {
        input.setAttribute('aria-label', input.closest('label').querySelector('.veld-label').textContent + ', rij ' + (index + 1));
      });
      const remove = item.querySelector('.delbtn');
      remove.disabled = rows.length === 1;
      remove.setAttribute('aria-label', 'Rij ' + (index + 1) + ' verwijderen');
    });
  }

  function calcOne() {
    let sw = 0, spw = 0, zonder = 0;
    el('ex1Rows').querySelectorAll('.crow:not(.is-weg)').forEach(item => {
      const p = parseFloat(item.querySelector('.c-punt').value);
      const w = parseFloat(item.querySelector('.c-weeg').value);
      if (!isNaN(w)) {
        sw += w;
        if (!isNaN(p)) spw += p * w;
        else zonder += w;
      }
    });
    el('ex1Wsum').textContent = Math.round(sw);
    el('ex1Warn').classList.toggle('is-aan', sw > 0 && Math.round(sw) !== 100);
    // Een gewicht zonder cijfer telt als 0; dat zegt de uitslag erbij.
    zetTekst(el('ex1Hint'), zonder > 0 ? 'nog ' + Math.round(zonder) + '% zonder cijfer' : 'vanaf 10/20');
    const mark = el('ex1Mark'), rounded = el('ex1Round'), percentage = el('ex1Pct'), status = el('ex1Status');
    if (sw > 0) {
      const weighted = spw / sw, official = Math.round(weighted), pct = weighted / 20 * 100;
      mark.textContent = fmt(weighted, 1);
      rounded.textContent = official;
      percentage.textContent = Math.round(pct);
      status.dataset.state = official >= 10 ? 'goed' : 'fout';
      zetTekst(status, official >= 10 ? 'Geslaagd' : 'Niet geslaagd');
    } else {
      mark.textContent = '--';
      rounded.textContent = '--';
      percentage.textContent = '--';
      status.dataset.state = 'leeg';
      zetTekst(status, 'Vul gewichten in');
    }
  }

  function setRule(id, state, detail) {
    const node = el(id);
    node.dataset.state = state === null ? 'leeg' : state ? 'goed' : 'fout';
    // De kinderen blijven staan, zodat de kleurwissel zacht verloopt.
    let teken = node.querySelector('.ric');
    if (!teken) {
      teken = create('span', 'ric');
      node.replaceChildren(teken, create('span', 'rlbl', ruleLabels[id]));
    }
    zetMarker(teken, state);
    let regel = node.querySelector('.rdet');
    if (detail === undefined) { if (regel) regel.remove(); return; }
    if (!regel) { regel = create('span', 'rdet'); node.append(regel); }
    zetTekst(regel, detail);
  }

  function degree(pct) {
    const rounded = Math.round(pct);
    if (rounded >= 85) return { name: 'grootste onderscheiding', hint: '85% of meer', state: 'goed' };
    if (rounded >= 77) return { name: 'grote onderscheiding', hint: 'vanaf 77%', state: 'goed' };
    if (rounded >= 68) return { name: 'onderscheiding', hint: 'vanaf 68%', state: 'goed' };
    if (rounded >= 50) return { name: 'voldoening', hint: 'onder 68%', state: 'gewoon' };
    return { name: 'nog niet geslaagd', hint: 'je hebt minstens 50% nodig', state: 'leeg' };
  }

  function verdict(state, title, explanation) {
    el('ex2Verdict').dataset.state = state === null ? 'leeg' : state ? 'goed' : 'fout';
    const vak = el('ex2VIc');
    if (!vak.firstElementChild) vak.append(create('span', 'verdict-teken'));
    zetMarker(vak.firstElementChild, state);
    zetTekst(el('ex2VTitle'), title);
    zetTekst(el('ex2VSub'), explanation);
  }

  function calcTwo() {
    let ssp = 0, scs = 0;
    const items = [];
    el('ex2Rows').querySelectorAll('.crow:not(.is-weg)').forEach(item => {
      const c = parseFloat(item.querySelector('.v-cij').value);
      const s = parseFloat(item.querySelector('.v-sp').value);
      if (!isNaN(c) && !isNaN(s) && s > 0) {
        ssp += s;
        scs += c * s;
        items.push({ c, s, n: (item.querySelector('.v-naam').value || '').trim() });
      }
    });
    if (ssp <= 0) {
      el('ex2Avg').textContent = '--';
      el('ex2Pct').textContent = '--';
      el('ex2Graad').textContent = '--';
      el('ex2Graad').dataset.state = 'leeg';
      el('ex2GraadH').textContent = 'vanaf 68% onderscheiding';
      verdict(null, 'Vul je vakken in om te beginnen', 'Je ziet hier meteen of je aan de deliberatievoorwaarden voldoet.');
      Object.keys(ruleLabels).forEach(id => setRule(id, null));
      return;
    }
    const avg = scs / ssp, pct = avg / 20 * 100;
    // Het getal dat je ziet is het getal dat getoetst wordt.
    const pctRond = Math.round(pct);
    el('ex2Avg').textContent = fmt(avg, 1);
    el('ex2Pct').textContent = pctRond;
    const grade = degree(pct);
    el('ex2Graad').textContent = grade.name;
    el('ex2Graad').dataset.state = grade.state;
    el('ex2GraadH').textContent = grade.hint;
    const names = list => {
      const values = list.map(item => item.n).filter(Boolean);
      return values.length ? values.join(', ') : '';
    };
    const belowTen = items.filter(item => item.c < 10);
    const belowEight = items.filter(item => item.c < 8);
    // Tekorten op één decimaal: wat je leest is wat getoetst wordt, en rekenruis zoals 0,9000000000000004 verdwijnt.
    const deficit = Math.round(belowTen.reduce((sum, item) => sum + (10 - item.c), 0) * 10) / 10;
    const weightedDeficit = Math.round(belowTen.reduce((sum, item) => sum + (10 - item.c) * item.s, 0) * 10) / 10;
    const r1 = pctRond >= 55, r2 = belowEight.length === 0, r3 = belowTen.length <= 2, r4 = deficit <= 3, r5 = weightedDeficit <= 18;
    setRule('ex2r1', r1, pctRond + '%');
    setRule('ex2r2', r2, belowEight.length ? belowEight.length + ' onder 8' : 'in orde');
    setRule('ex2r3', r3, belowTen.length + ' onder 10' + (belowTen.length ? ': ' + names(belowTen) : ''));
    setRule('ex2r4', r4, getal(deficit) + ' punten tekort' + (belowTen.length > 1 ? ' samen' : '') + (belowTen.length ? ' (' + belowTen.map(item => getal(10 - item.c) + ' bij ' + (item.n || 'een vak')).join(', ') + ')' : ''));
    setRule('ex2r5', r5, 'GPT ' + getal(weightedDeficit) + (belowTen.length ? ' = ' + belowTen.map(item => getal(10 - item.c) + ' x ' + getal(item.s)).join(' + ') : ''));
    const allCredits = belowTen.length === 0, pass = r1 && r2 && r3 && r4 && r5;
    if (allCredits) verdict(true, 'Geslaagd voor al je vakken', 'Deliberatie is niet nodig, alles staat op 10 of meer.');
    else if (pass) verdict(true, 'Je voldoet aan de automatische voorwaarden', 'Op basis van de regels hieronder. De examencommissie bevestigt.');
    else verdict(false, 'Je voldoet niet automatisch', 'Bekijk welke regel rood staat. De commissie kan in bijzondere gevallen alsnog delibereren.');
  }

  function save() {
    try {
      const onderdelen = [...el('ex1Rows').querySelectorAll('.crow:not(.is-weg)')].map(item => ({ naam: item.querySelector('.c-naam').value, punt: item.querySelector('.c-punt').value, weeg: item.querySelector('.c-weeg').value }));
      const vakken = [...el('ex2Rows').querySelectorAll('.crow:not(.is-weg)')].map(item => ({ naam: item.querySelector('.v-naam').value, cij: item.querySelector('.v-cij').value, sp: item.querySelector('.v-sp').value }));
      window.localStorage.setItem('bes_reken', JSON.stringify({ onderdelen, vakken }));
    } catch {}
  }

  function update() {
    calcOne();
    calcTwo();
    save();
  }

  function normalizedInsert(input, text) {
    const normalized = text.replace(/,/g, '.');
    pendingDecimals.delete(input);
    try {
      if (document.execCommand('insertText', false, normalized)) return;
    } catch {}
    if (normalized === '.') {
      if (/^-?\d*$/.test(input.value)) pendingDecimals.set(input, input.value || '0');
      return;
    }
    input.value = normalized;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function initialize() {
    let stored = null;
    try { stored = JSON.parse(window.localStorage.getItem('bes_reken')); } catch {}
    [1, 2].forEach(kind => {
      const box = el('ex' + kind + 'Rows');
      const key = kind === 1 ? 'onderdelen' : 'vakken';
      const saved = Array.isArray(stored?.[key]) ? stored[key].filter(item => item && typeof item === 'object') : [];
      (saved.length ? saved : emptyRows()).forEach(data => box.append(row(data, kind)));
      updateRows(box);
      box.querySelectorAll('input[type="number"]').forEach(markeerBereik);
      box.addEventListener('input', event => { markeerBereik(event.target); update(); });
      box.addEventListener('beforeinput', event => {
        const input = event.target;
        if (!input.matches('input[type="number"]')) return;
        if (pendingDecimals.has(input)) {
          const prefix = pendingDecimals.get(input);
          if (event.cancelable && /^\d+$/.test(event.data || '')) {
            event.preventDefault();
            pendingDecimals.delete(input);
            input.value = prefix + '.' + event.data;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return;
          }
          if (event.cancelable && (event.data === ',' || event.data === '.')) {
            event.preventDefault();
            return;
          }
          pendingDecimals.delete(input);
          if (event.cancelable && event.inputType === 'deleteContentBackward') {
            event.preventDefault();
            return;
          }
        }
        if (!event.data?.includes(',') || !event.cancelable) return;
        event.preventDefault();
        normalizedInsert(input, event.data);
      });
      box.addEventListener('focusout', event => pendingDecimals.delete(event.target));
      box.addEventListener('keydown', event => {
        if (event.ctrlKey || event.metaKey || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Delete', 'Escape'].includes(event.key)) pendingDecimals.delete(event.target);
      });
      box.addEventListener('paste', event => {
        const input = event.target;
        const text = event.clipboardData?.getData('text') || '';
        if (!input.matches('input[type="number"]') || !text.includes(',')) return;
        event.preventDefault();
        normalizedInsert(input, text);
      });
      box.addEventListener('click', event => {
        const button = event.target.closest('.delbtn');
        if (!button) return;
        const parent = button.closest('.crow');
        const over = [...box.querySelectorAll('.crow:not(.is-weg)')];
        if (parent.classList.contains('is-weg') || over.length <= 1) return;
        const next = over[over.indexOf(parent) + 1] || over[over.indexOf(parent) - 1];
        // De rij telt meteen niet meer mee en glijdt dicht; pas daarna gaat hij uit de pagina.
        parent.classList.add('is-weg');
        updateRows(box);
        update();
        glijRij(parent, false, () => parent.remove());
        next.querySelector('input').focus();
      });
      el('ex' + kind + 'Add').addEventListener('click', () => {
        const added = row({}, kind);
        box.append(added);
        updateRows(box);
        update();
        glijRij(added, true);
        added.querySelector('input').focus();
      });
    });
    el('reken-wissen').addEventListener('click', () => {
      [1, 2].forEach(kind => {
        const box = el('ex' + kind + 'Rows');
        glijBlok(box, () => {
          box.replaceChildren(...emptyRows().map(data => row(data, kind)));
          updateRows(box);
        });
      });
      try { window.localStorage.removeItem('bes_reken'); } catch {}
      calcOne();
      calcTwo();
    });
    calcOne();
    calcTwo();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
