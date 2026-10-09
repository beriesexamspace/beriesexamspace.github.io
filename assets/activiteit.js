(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  const IDLE = 120000;
  const SESSION = 1800000;
  const PREFIX = 'bes_studieactiviteit_';
  const mount = document.querySelector('[data-kalender]');
  const statusNode = document.querySelector('[data-kalender-status]');
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const integer = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
  const dayKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  let owner = null;
  let revision = 0;
  let authRevision = 0;
  let device = '';
  let available = false;
  let localFailure = false;
  let deviceReady = Promise.resolve();
  let remoteState = 'laden';
  let snapshot = { dagen: {}, elders: [] };
  let lastInput = Date.now();
  let cursor = Date.now();
  let previousLearning = false;
  let syncBusy = false;
  let lastSync = 0;
  let month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let monthTitle;
  let nextButton;
  let grid;
  let details;
  let activeDay = '';
  let renderStamp = '';

  try {
    const test = PREFIX + 'controle';
    window.localStorage.setItem(test, '1');
    window.localStorage.removeItem(test);
    available = Boolean(navigator.locks?.request);
    if (available) deviceReady = navigator.locks.request('bes_studieapparaat', () => {
      device = window.localStorage.getItem('bes_studieapparaat') || '';
      if (!uuidPattern.test(device)) {
        device = window.crypto.randomUUID();
        window.localStorage.setItem('bes_studieapparaat', device);
      }
    }).catch(() => { localFailure = true; });
  } catch { localFailure = true; }

  function cleanDay(value) {
    return { leertijd_ms: Math.min(86400000, integer(value?.leertijd_ms)), bezoeken: Math.min(1000, integer(value?.bezoeken)) };
  }

  function read(id) {
    try {
      const data = JSON.parse(window.localStorage.getItem(PREFIX + id) || '{}');
      return {
        dagen: Object.fromEntries(Object.entries(data.dagen || {}).filter(([key]) => datePattern.test(key)).map(([key, value]) => [key, cleanDay(value)])),
        sessieLaatst: integer(data.sessieLaatst),
        geboektTot: integer(data.geboektTot),
        bevestigd: data.bevestigd && typeof data.bevestigd === 'object' ? data.bevestigd : {},
        elders: Array.isArray(data.elders) ? data.elders.filter(row => datePattern.test(row.dag) && uuidPattern.test(row.apparaat)).map(row => ({ dag: row.dag, apparaat: row.apparaat, ...cleanDay(row) })) : []
      };
    } catch {
      localFailure = true;
      return { dagen: {}, sessieLaatst: 0, geboektTot: 0, bevestigd: {}, elders: [] };
    }
  }

  async function transaction(id, token, operation) {
    await deviceReady;
    if (!available || localFailure || !id) return;
    try {
      await navigator.locks.request(PREFIX + id, () => {
        if (owner !== id || revision !== token) return;
        const data = read(id);
        if (localFailure) return;
        const changed = operation(data);
        if (changed) window.localStorage.setItem(PREFIX + id, JSON.stringify(data));
        snapshot = data;
      });
    } catch { localFailure = true; }
    render();
  }

  function visible() {
    return document.visibilityState === 'visible' && document.hasFocus();
  }

  function learning() {
    if (!document.querySelector('.vak-pagina')) return false;
    return ['oefenscherm', 'paneel-theorie', 'paneel-hacks'].some(id => {
      const node = document.getElementById(id);
      return node && !node.closest('[hidden]');
    });
  }

  function addTime(data, start, end) {
    while (start < end) {
      const current = new Date(start);
      const key = dayKey(current);
      const midnight = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1).getTime();
      const until = Math.min(end, midnight);
      const day = data.dagen[key] ||= { leertijd_ms: 0, bezoeken: 0 };
      day.leertijd_ms = Math.min(86400000, day.leertijd_ms + until - start);
      start = until;
    }
  }

  function sample() {
    const now = Date.now();
    const id = owner;
    const token = revision;
    const showing = visible();
    const inputAt = lastInput;
    const start = cursor;
    const end = Math.min(now, inputAt + IDLE);
    const credit = previousLearning && showing && now >= start && now - start <= 10000;
    cursor = now;
    previousLearning = showing && learning() && now < inputAt + IDLE;
    if (!id) return Promise.resolve();
    return transaction(id, token, data => {
      let changed = false;
      if (showing && now - inputAt < IDLE && inputAt > data.sessieLaatst) {
        const key = dayKey(new Date(inputAt));
        const day = data.dagen[key] ||= { leertijd_ms: 0, bezoeken: 0 };
        if (!data.sessieLaatst || inputAt - data.sessieLaatst >= SESSION) day.bezoeken = Math.min(1000, day.bezoeken + 1);
        data.sessieLaatst = inputAt;
        changed = true;
      }
      const from = Math.max(start, data.geboektTot);
      if (credit && end > from) {
        addTime(data, from, end);
        data.geboektTot = end;
        changed = true;
      }
      return changed;
    });
  }

  function activity() {
    if (!visible()) return;
    sample();
    lastInput = Date.now();
    previousLearning = learning();
  }

  function signature(day) { return `${day.leertijd_ms}:${day.bezoeken}`; }

  async function synchronize(force = false) {
    await deviceReady;
    if (!owner || !available || localFailure || syncBusy || (!force && Date.now() - lastSync < 30000)) return;
    const client = BES.auth?.client;
    if (!client) { remoteState = 'lokaal'; render(); return; }
    const id = owner;
    const token = revision;
    syncBusy = true;
    lastSync = Date.now();
    try {
      const rows = [];
      for (let offset = 0; ; offset += 1000) {
        if (owner !== id || revision !== token) return;
        let query = client.from('studieactiviteit').select('apparaat,dag,leertijd_ms,bezoeken').eq('user_id', id);
        if (!mount) query = query.eq('apparaat', device);
        const result = await query.order('dag').order('apparaat').range(offset, offset + 999);
        if (result.error) throw result.error;
        if (!Array.isArray(result.data)) throw new Error('Ongeldige activiteitgegevens');
        rows.push(...result.data);
        if (result.data.length < 1000) break;
      }
      if (owner !== id || revision !== token) return;
      await transaction(id, token, data => {
        rows.filter(row => datePattern.test(row.dag) && uuidPattern.test(row.apparaat)).forEach(row => {
          if (row.apparaat !== device) return;
          const saved = data.dagen[row.dag] ||= { leertijd_ms: 0, bezoeken: 0 };
          saved.leertijd_ms = Math.max(saved.leertijd_ms, cleanDay(row).leertijd_ms);
          saved.bezoeken = Math.max(saved.bezoeken, cleanDay(row).bezoeken);
        });
        if (mount) data.elders = rows.filter(row => row.apparaat !== device && datePattern.test(row.dag) && uuidPattern.test(row.apparaat)).map(row => ({ apparaat: row.apparaat, dag: row.dag, ...cleanDay(row) }));
        return true;
      });
      if (localFailure || owner !== id || revision !== token) return;
      const state = read(id);
      const pending = Object.entries(state.dagen).filter(([date, day]) => state.bevestigd[date] !== signature(day));
      for (let offset = 0; offset < pending.length; offset += 100) {
        if (owner !== id || revision !== token) return;
        const batch = pending.slice(offset, offset + 100);
        const result = await client.rpc('studieactiviteit_bewaren', {
          p_eigenaar: id,
          p_apparaat: device,
          p_dagen: batch.map(([dag, day]) => ({ dag, ...day }))
        });
        if (result.error) throw result.error;
        if (owner !== id || revision !== token) return;
        await transaction(id, token, data => {
          batch.forEach(([date, day]) => { data.bevestigd[date] = signature(day); });
          return true;
        });
      }
      if (owner === id && revision === token) remoteState = 'account';
    } catch (error) {
      if (owner === id && revision === token) {
        remoteState = /42P01|PGRST20[25]/.test(String(error?.code)) ? 'inrichting' : 'lokaal';
      }
    } finally {
      syncBusy = false;
      render();
      if (owner && (owner !== id || revision !== token)) synchronize(true);
    }
  }

  function totals() {
    const days = Object.fromEntries(Object.entries(snapshot.dagen).map(([key, value]) => [key, { ...value }]));
    snapshot.elders.forEach(row => {
      const day = days[row.dag] ||= { leertijd_ms: 0, bezoeken: 0 };
      day.leertijd_ms += row.leertijd_ms;
      day.bezoeken += row.bezoeken;
    });
    return days;
  }

  function duration(milliseconds) {
    if (milliseconds > 0 && milliseconds < 60000) return 'minder dan 1 minuut geleerd';
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    return `${hours ? `${hours} uur${minutes % 60 ? ' en ' : ''}` : ''}${!hours || minutes % 60 ? `${minutes % 60} ${minutes % 60 === 1 ? 'minuut' : 'minuten'}` : ''} geleerd`;
  }

  function description(key, days) {
    const date = new Date(`${key}T12:00:00`);
    const label = date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    if (key > dayKey(new Date())) return `${label} · Deze dag moet nog komen`;
    const day = days[key];
    return day ? `${label} · ${day.bezoeken} ${day.bezoeken === 1 ? 'bezoek' : 'bezoeken'} · ${duration(day.leertijd_ms)}` : `${label} · Geen gegevens geregistreerd`;
  }

  function showDay(key) {
    activeDay = key;
    if (details) details.textContent = description(key, totals());
    grid?.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.dag === key));
    });
  }

  // Met de muis over een dag: alleen de regel eronder tonen. De dag wordt pas gekozen bij klikken of met het toetsenbord.
  function previewDay(key) {
    if (details) details.textContent = description(key, totals());
  }

  function previewOff() {
    grid?.querySelectorAll('.is-hover').forEach(button => button.classList.remove('is-hover'));
    if (!details) return;
    details.textContent = activeDay ? description(activeDay, totals()) : 'Kies een dag om je bezoeken en leertijd te zien.';
  }

  function buildCalendar() {
    if (!mount) return;
    mount.classList.add('studiekalender');
    const controls = create('div', 'kalender-bediening');
    const previous = create('button', 'kalender-maandknop', '←');
    previous.type = 'button';
    previous.setAttribute('aria-label', 'Vorige maand');
    monthTitle = create('h3', 'kalender-maand');
    monthTitle.id = 'kalender-maand';
    monthTitle.setAttribute('aria-live', 'polite');
    nextButton = create('button', 'kalender-maandknop', '→');
    nextButton.type = 'button';
    nextButton.setAttribute('aria-label', 'Volgende maand');
    const move = increment => {
      const next = new Date(month.getFullYear(), month.getMonth() + increment, 1);
      const today = new Date();
      if (next > new Date(today.getFullYear(), today.getMonth(), 1)) return;
      month = next;
      activeDay = '';
      renderStamp = '';
      render();
    };
    previous.addEventListener('click', () => move(-1));
    nextButton.addEventListener('click', () => move(1));
    controls.append(previous, monthTitle, nextButton);
    const weekdays = create('div', 'kalender-weekdagen');
    weekdays.setAttribute('aria-hidden', 'true');
    ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].forEach(name => weekdays.append(create('span', '', name)));
    grid = create('div', 'kalender-dagen');
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-labelledby', monthTitle.id);
    details = create('p', 'kalender-daginfo');
    details.id = 'kalender-daginfo';
    details.setAttribute('role', 'status');
    const legend = create('div', 'kalender-legenda');
    legend.append(create('span', '', 'Minder leertijd'));
    for (let i = 0; i < 5; i++) {
      const item = create('span', 'kalender-staal');
      item.dataset.intensiteit = i;
      item.setAttribute('aria-hidden', 'true');
      legend.append(item);
    }
    legend.append(create('span', '', 'Meer leertijd'));
    const explanation = create('p', 'kalender-uitleg', 'Tik op een dag of ga er met je muis overheen. Leertijd is een indicatie tijdens oefenen, theorie en studie-hacks. De teller pauzeert na 2 minuten zonder activiteit. Een stippelrand betekent: geen gegevens geregistreerd.');
    mount.replaceChildren(controls, weekdays, grid, details, legend, explanation);
  }

  function render() {
    if (!mount || !grid) return;
    if (statusNode) {
      statusNode.textContent = !owner ? 'Log in om je eigen studiekalender te bekijken.' : localFailure ? 'Lokale opslag is niet beschikbaar. Je activiteit wordt in deze browser niet gemeten.' : !available ? 'In deze browser kunnen we je leertijd niet betrouwbaar meten. Er wordt hier geen activiteit opgeslagen.' : remoteState === 'account' ? 'Je activiteit is gekoppeld aan je account. Nieuwe meetgegevens worden regelmatig opgeslagen.' : remoteState === 'inrichting' ? 'Opgeslagen in deze browser. Synchronisatie met je account is nog niet ingeschakeld.' : remoteState === 'laden' ? 'Je eigen activiteit wordt geladen…' : 'Opgeslagen in deze browser. Synchroniseren met je account is nu niet gelukt.';
    }
    const days = totals();
    const today = new Date();
    const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
    const stamp = `${owner}|${monthKey}|${dayKey(today)}|${JSON.stringify(days)}`;
    if (stamp === renderStamp) return;
    renderStamp = stamp;
    monthTitle.textContent = month.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
    nextButton.disabled = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();
    const focusedKey = grid.contains(document.activeElement) ? document.activeElement.dataset.dag : null;
    grid.replaceChildren();
    const offset = (month.getDay() + 6) % 7;
    for (let i = 0; i < offset; i++) grid.append(create('span', 'kalender-leeg'));
    const number = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= number; i++) {
      const key = dayKey(new Date(month.getFullYear(), month.getMonth(), i));
      const button = create('button', 'kalender-dag', String(i));
      const day = days[key];
      button.type = 'button';
      button.dataset.dag = key;
      button.dataset.intensiteit = !day?.leertijd_ms ? 0 : day.leertijd_ms < 900000 ? 1 : day.leertijd_ms < 1800000 ? 2 : day.leertijd_ms < 3600000 ? 3 : 4;
      button.classList.toggle('is-onbekend', !day && key <= dayKey(today));
      button.classList.toggle('is-toekomst', key > dayKey(today));
      button.setAttribute('aria-label', description(key, days));
      button.setAttribute('aria-pressed', String(activeDay === key));
      if (key === dayKey(today)) button.setAttribute('aria-current', 'date');
      button.addEventListener('pointerenter', () => { button.classList.add('is-hover'); previewDay(key); });
      button.addEventListener('pointerleave', () => { button.classList.remove('is-hover'); previewOff(); });
      button.addEventListener('focus', () => showDay(key));
      button.addEventListener('click', () => showDay(key));
      grid.append(button);
    }
    if (focusedKey) grid.querySelector(`[data-dag="${focusedKey}"]`)?.focus({ preventScroll: true });
    details.textContent = activeDay ? description(activeDay, days) : 'Kies een dag om je bezoeken en leertijd te zien.';
  }

  function setUser(user) {
    const next = typeof user?.id === 'string' && uuidPattern.test(user.id) ? user.id : null;
    if (next === owner) return;
    revision += 1;
    owner = next;
    snapshot = next ? read(next) : { dagen: {}, elders: [] };
    remoteState = 'laden';
    lastSync = 0;
    lastInput = Date.now();
    cursor = lastInput;
    previousLearning = false;
    activeDay = '';
    renderStamp = '';
    render();
    sample().then(() => synchronize(true));
  }

  buildCalendar();
  render();
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(name => window.addEventListener(name, activity, { passive: true }));
  let pointerTime = 0;
  window.addEventListener('pointermove', () => {
    if (Date.now() - pointerTime < 1000) return;
    pointerTime = Date.now();
    activity();
  }, { passive: true });
  window.addEventListener('focus', activity);
  window.addEventListener('blur', () => { sample(); previousLearning = false; });
  document.addEventListener('visibilitychange', () => {
    sample();
    previousLearning = false;
    if (visible()) activity();
  });
  window.addEventListener('pagehide', () => { sample(); synchronize(true); });
  window.addEventListener('online', () => synchronize(true));
  window.addEventListener('storage', event => {
    if (owner && event.key === PREFIX + owner) { snapshot = read(owner); render(); }
  });
  window.addEventListener('bes:auth', event => { authRevision += 1; setUser(event.detail?.user); });
  const initialRevision = authRevision;
  BES.auth?.gebruiker().then(user => {
    if (authRevision === initialRevision) setUser(user);
  }).catch(() => { if (authRevision === initialRevision) setUser(null); });
  window.setInterval(() => { sample().then(() => synchronize()); }, 1000);
  BES.activiteit = Object.freeze({
    get overzicht() { return owner ? totals() : {}; },
    get opslag() { return localFailure || !available ? 'niet-beschikbaar' : remoteState; }
  });
})();
