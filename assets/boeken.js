(() => {
  'use strict';

  const auth = window.BES?.auth;
  const client = auth?.client;
  const byId = id => document.getElementById(id);
  const content = byId('boeken-inhoud');
  const access = byId('boeken-toegang');
  const accessText = byId('boeken-toegang-tekst');
  const login = byId('boeken-inloggen');
  const list = byId('boeken-lijst');
  const ownList = byId('mijn-boeken-lijst');
  const listStatus = byId('boeken-status');
  const ownStatus = byId('mijn-boeken-status');
  const retry = byId('boeken-opnieuw');
  const empty = byId('boeken-leeg');
  const search = byId('boeken-zoeken');
  const form = byId('boek-form');
  const fields = byId('boek-velden');
  const submit = byId('boek-plaatsen');
  const formResult = byId('boek-resultaat');
  const phone = byId('boek-whatsapp');
  const consent = byId('boek-toestemming');
  const photos = byId('boek-fotos');
  const hint = byId('boek-plaats-hint');
  const subjects = Array.isArray(window.BES_VAKKEN) ? window.BES_VAKKEN : [];
  const subjectMap = new Map(subjects.map(subject => [subject.id, subject]));
  const conditions = { nieuw: 'Nieuw', 'als-nieuw': 'Als nieuw', gebruikt: 'Gebruikt', notities: 'Met notities' };
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const phonePattern = /^\+(32|31)[0-9]{8,10}$/;
  const allowedImages = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif']);
  const columns = 'id,user_id,vak,titel,staat,prijs,plek,fotos,whatsapp,gemaakt,verloopt,verkocht';
  let user = null;
  let rows = [];
  let year = 'alle';
  let generation = 0;
  let request = 0;
  let authRevision = 0;
  let placing = false;
  let loaded = false;
  let expiryTimer = 0;
  let suspended = false;
  let pendingPlacement = null;
  const mutations = new Set();

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = (text, className = 'knop-secundair') => {
    const node = element('button', className, text);
    node.type = 'button';
    return node;
  };
  const context = () => ({ owner: user?.id, generation });
  const current = ctx => Boolean(user && ctx.owner === user.id && ctx.generation === generation);
  const assertCurrent = ctx => { if (!current(ctx)) throw new Error('session_changed'); };
  const subjectName = row => subjectMap.get(row.vak)?.naam || 'Ander vak';
  const active = row => !row.verkocht && Date.parse(row.verloopt) > Date.now();
  const priceText = value => Number(value).toLocaleString('nl-BE', { maximumFractionDigits: 2 }) + ' euro';
  const dateText = value => {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' }) : '';
  };
  const showResult = (node, message, failure = false) => {
    node.textContent = message;
    node.hidden = !message;
    node.classList.toggle('is-fout', failure);
  };

  // Alleen een JPEG in de map van de eigenaar kan als boekfoto worden gebruikt.
  const safePaths = row => {
    if (!uuidPattern.test(row.user_id) || !Array.isArray(row.fotos)) return [];
    const prefix = row.user_id + '/';
    return row.fotos.slice(0, 3).filter(path => typeof path === 'string' && path.startsWith(prefix) && /^[a-zA-Z0-9_-]+\.jpg$/.test(path.slice(prefix.length)));
  };
  // De bucket is privé: foto's krijgen een tijdelijke link (1 uur), alleen in het geheugen en alleen voor ingelogden.
  const signed = new Map();
  let signing = null;
  let lastSignTry = 0;
  const needsSigning = () => rows.some(row => safePaths(row).some(path => !(signed.get(path)?.until > Date.now() + 60000)));
  const signPhotos = async () => {
    if (!user || !client) return;
    const ctx = context();
    const ticket = request;
    const paths = [...new Set(rows.flatMap(safePaths))].filter(path => !(signed.get(path)?.until > Date.now() + 60000));
    for (let index = 0; index < paths.length; index += 100) {
      try {
        const { data, error } = await client.storage.from('boekfotos').createSignedUrls(paths.slice(index, index + 100), 3600);
        if (!current(ctx) || ticket !== request) return;
        if (!error && Array.isArray(data)) data.forEach(item => { if (item && !item.error && item.path && item.signedUrl) signed.set(item.path, { url: item.signedUrl, until: Date.now() + 3500000 }); });
      } catch {}
    }
  };
  const signAndRender = () => {
    if (signing || !needsSigning() || Date.now() - lastSignTry < 15000) return;
    lastSignTry = Date.now();
    signing = signPhotos().finally(() => { signing = null; render(); });
  };
  const photoUrl = (row, path) => {
    if (!user || !safePaths(row).includes(path)) return '';
    const entry = signed.get(path);
    if (!entry || entry.until <= Date.now()) return '';
    try {
      const base = new URL(window.BES_CONFIG?.supabaseUrl);
      if (!/^https?:$/.test(base.protocol)) return '';
      const actual = new URL(entry.url);
      const expected = new URL('/storage/v1/object/sign/boekfotos/' + path, base);
      const alleenToken = [...actual.searchParams.keys()].every(key => key === 'token') && actual.searchParams.has('token');
      return /^https?:$/.test(actual.protocol) && !actual.username && !actual.password && !actual.hash && alleenToken && actual.origin === expected.origin && actual.pathname === expected.pathname ? actual.href : '';
    } catch { return ''; }
  };

  const addPhotos = (card, row) => {
    const sources = safePaths(row).map(path => photoUrl(row, path)).filter(Boolean);
    if (!sources.length) { card.append(element('div', 'boek-geen-foto', 'Geen foto')); return; }
    const gallery = element('div', 'boek-fotos');
    sources.forEach((source, index) => {
      const image = element('img');
      image.alt = 'Foto ' + (index + 1) + ' van ' + row.titel;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.referrerPolicy = 'no-referrer';
      image.src = source;
      image.addEventListener('error', () => {
        image.remove();
        if (!gallery.children.length) gallery.replaceWith(element('div', 'boek-geen-foto', 'Foto niet beschikbaar'));
      }, { once: true });
      gallery.append(image);
    });
    card.append(gallery);
  };

  const reportPanel = (row, card) => {
    const toggle = button('Meld dit boek', 'boeken-tekstknop');
    toggle.dataset.action = 'melden';
    toggle.setAttribute('aria-expanded', 'false');
    const panel = element('form', 'boeken-paneel');
    panel.hidden = true;
    panel.id = 'boek-melden-' + row.id;
    toggle.setAttribute('aria-controls', panel.id);
    const input = element('textarea', 'auth-input');
    input.id = 'boek-reden-' + row.id;
    input.required = true;
    input.maxLength = 300;
    const label = element('label', '', 'Wat klopt er niet?');
    label.htmlFor = input.id;
    const help = element('p', 'auth-help', 'Maximaal 300 tekens.');
    const send = button('Melding versturen', 'knop-secundair');
    send.type = 'submit';
    const result = element('p', 'boeken-resultaat');
    result.setAttribute('role', 'status');
    result.hidden = true;
    panel.append(label, input, help, send, result);
    let busy = false;
    toggle.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      toggle.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) input.focus();
    });
    input.addEventListener('input', () => input.setCustomValidity(''));
    panel.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !user) return;
      const reason = input.value.trim();
      input.setCustomValidity(!reason || reason.length > 300 ? 'Vul een reden van maximaal 300 tekens in.' : '');
      if (!panel.reportValidity()) return;
      const ctx = context();
      busy = true;
      send.disabled = true;
      input.disabled = true;
      showResult(result, 'Je melding wordt verstuurd…');
      try {
        const response = await client.from('boek_meldingen').insert({ boek_id: row.id, user_id: ctx.owner, reden: reason });
        if (response.error && response.error.code !== '23505') throw response.error;
        if (!current(ctx)) return;
        panel.replaceChildren(element('p', 'boeken-resultaat', 'Bedankt, we kijken ernaar.'));
        toggle.hidden = true;
      } catch {
        if (current(ctx)) showResult(result, 'Melden is niet gelukt. Probeer het opnieuw.', true);
      } finally {
        busy = false;
        if (current(ctx)) { send.disabled = false; input.disabled = false; }
      }
    });
    card.append(toggle, panel);
  };

  const ownActions = (row, card) => {
    const actions = element('div', 'boeken-acties');
    const sold = button('Verkocht');
    sold.dataset.action = 'verkocht';
    sold.disabled = Boolean(row.verkocht);
    const edit = button('Prijs aanpassen');
    edit.dataset.action = 'prijs';
    const extend = button('Verlengen');
    extend.dataset.action = 'verlengen';
    const remove = button('Wissen', 'boeken-tekstknop');
    remove.dataset.action = 'wissen';
    const result = element('p', 'boeken-resultaat');
    result.setAttribute('role', 'status');
    result.hidden = true;
    const priceForm = element('form', 'boeken-paneel');
    priceForm.hidden = true;
    priceForm.id = 'boek-prijs-form-' + row.id;
    edit.setAttribute('aria-controls', priceForm.id);
    edit.setAttribute('aria-expanded', 'false');
    const label = element('label', '', 'Nieuwe prijs in euro');
    const input = element('input', 'auth-input');
    input.id = 'boek-nieuwe-prijs-' + row.id;
    label.htmlFor = input.id;
    input.type = 'number';
    input.inputMode = 'decimal';
    input.min = '0';
    input.max = '500';
    input.step = '.01';
    input.required = true;
    input.value = row.prijs;
    const save = button('Prijs opslaan');
    save.type = 'submit';
    priceForm.append(label, input, save);
    actions.append(sold, edit, extend, remove);
    card.append(actions, priceForm, result);
    if (mutations.has(row.id)) card.querySelectorAll('button,input').forEach(node => { node.disabled = true; });
    let busy = false;
    const run = async (operation, success) => {
      if (busy || mutations.has(row.id) || !user || row.user_id !== user.id) return;
      const ctx = context();
      const controls = [...card.querySelectorAll('button,input')].map(node => [node, node.disabled]);
      busy = true;
      mutations.add(row.id);
      controls.forEach(([node]) => { node.disabled = true; });
      showResult(result, 'Even geduld…');
      try {
        await operation(ctx);
        if (!current(ctx)) return;
        mutations.delete(row.id);
        render();
        ownStatus.textContent = success;
      } catch (failure) {
        if (current(ctx)) {
          const message = failure.message === 'missing' ? 'Dit boek is al gewijzigd of gewist. Laad de pagina opnieuw.' : 'Dit is niet gelukt. Controleer je verbinding en probeer opnieuw.';
          mutations.delete(row.id);
          if (card.isConnected) showResult(result, message, true);
          else { render(); ownStatus.textContent = message; }
        }
      } finally {
        busy = false;
        if (current(ctx)) {
          mutations.delete(row.id);
          controls.forEach(([node, disabled]) => { node.disabled = disabled; });
        }
      }
    };
    const update = async (ctx, values) => {
      assertCurrent(ctx);
      const response = await client.from('boeken').update(values).eq('id', row.id).eq('user_id', ctx.owner).select('id');
      if (response.error) throw response.error;
      if (!response.data?.length) throw new Error('missing');
      assertCurrent(ctx);
      Object.assign(row, values);
    };
    sold.addEventListener('click', () => run(ctx => update(ctx, { verkocht: true }), 'Je boek staat als verkocht.'));
    extend.addEventListener('click', () => run(ctx => update(ctx, { verloopt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() }), 'Je boek is met 60 dagen vanaf vandaag verlengd.'));
    edit.addEventListener('click', () => {
      priceForm.hidden = !priceForm.hidden;
      edit.setAttribute('aria-expanded', String(!priceForm.hidden));
      if (!priceForm.hidden) input.focus();
    });
    priceForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!priceForm.reportValidity()) return;
      run(ctx => update(ctx, { prijs: Number(input.value) }), 'Je nieuwe prijs is opgeslagen.');
    });
    remove.addEventListener('click', () => {
      if (!window.confirm('Wil je dit boek en de foto’s wissen? Dit kun je niet terugdraaien.')) return;
      run(async ctx => {
        assertCurrent(ctx);
        // Eerst de foto's wissen; bij een opslagfout blijft de advertentie beschikbaar om opnieuw te proberen.
        const paths = safePaths(row);
        if (paths.length) {
          const storage = await client.storage.from('boekfotos').remove(paths);
          if (storage.error) throw storage.error;
        }
        assertCurrent(ctx);
        const response = await client.from('boeken').delete().eq('id', row.id).eq('user_id', ctx.owner).select('id');
        if (response.error) throw response.error;
        if (!response.data?.length) throw new Error('missing');
        assertCurrent(ctx);
        rows = rows.filter(book => book.id !== row.id);
      }, 'Je boek en de foto’s zijn gewist.');
    });
  };

  const bookCard = (row, own) => {
    const card = element('article', 'kaart boek-kaart');
    card.dataset.boekId = row.id;
    addPhotos(card, row);
    const info = element('div', 'boek-info');
    info.append(element('h3', '', row.titel), element('p', 'boek-vak', subjectName(row)));
    info.append(element('p', 'boek-prijs', priceText(row.prijs)), element('p', 'boek-staat', conditions[row.staat] || 'Gebruikt'));
    if (row.plek) info.append(element('p', 'boek-plek', row.plek));
    const date = dateText(row.gemaakt);
    if (date) info.append(element('p', 'boek-datum', 'Geplaatst op ' + date));
    if (own) {
      info.append(element('span', 'boek-status' + (row.verkocht ? ' is-verkocht' : ''), row.verkocht ? 'Verkocht' : active(row) ? 'Te koop' : 'Verlopen'));
    }
    card.append(info);
    if (own) ownActions(row, card);
    else {
      const actions = element('div', 'boeken-acties');
      if (phonePattern.test(row.whatsapp)) {
        const contact = element('a', 'knop', 'Stuur een WhatsApp');
        const message = 'Hoi, ik zag je boek "' + row.titel + '" op Berie\'s Exam Space. Is het nog te koop?';
        contact.href = 'https://wa.me/' + row.whatsapp.slice(1) + '?text=' + encodeURIComponent(message);
        contact.addEventListener('click', event => {
          if (!user || !active(row)) { event.preventDefault(); render(); }
        });
        actions.append(contact);
      } else actions.append(element('p', 'auth-help', 'Contact is tijdelijk niet beschikbaar.'));
      card.append(actions);
      reportPanel(row, card);
    }
    return card;
  };

  const render = () => {
    window.clearTimeout(expiryTimer);
    list.replaceChildren();
    ownList.replaceChildren();
    if (!user || !loaded) return;
    const query = search.value.trim().toLocaleLowerCase('nl');
    const matches = rows.filter(row => active(row) && (year === 'alle' || (subjectMap.get(row.vak)?.jaar || 'ander') === year) && (row.titel + ' ' + subjectName(row)).toLocaleLowerCase('nl').includes(query));
    matches.forEach(row => list.append(bookCard(row, false)));
    empty.hidden = matches.length !== 0;
    byId('boeken-leeg-tekst').textContent = query || year !== 'alle' ? 'Geen boeken gevonden. Probeer een ander vak of een andere zoekterm.' : 'Er staan nog geen boeken te koop. Jouw boek kan het eerste zijn.';
    listStatus.textContent = matches.length + (matches.length === 1 ? ' boek gevonden' : ' boeken gevonden');
    const own = rows.filter(row => row.user_id === user.id);
    own.forEach(row => ownList.append(bookCard(row, true)));
    ownStatus.textContent = own.length ? '' : 'Je hebt nog geen boeken geplaatst.';
    // Ook in een lang geopend tabblad verdwijnen verlopen contactlinks tijdig.
    const deadlines = rows.filter(active).map(row => Date.parse(row.verloopt));
    if (deadlines.length) expiryTimer = window.setTimeout(render, Math.min(2147483647, Math.max(50, Math.min(...deadlines) - Date.now() + 50)));
    signAndRender();
  };

  // Losse eigen foto's (van een gewiste of nooit geplaatste advertentie) weghalen: niet in een eigen boek,
  // ouder dan 15 minuten en niet van een plaatsing die nog gecontroleerd moet worden.
  const opruimen = async (ctx, ticket) => {
    try {
      const bucket = client.storage.from('boekfotos');
      const lijst = await bucket.list(user.id, { limit: 100, offset: 0 });
      if (!current(ctx) || ticket !== request || lijst.error || !Array.isArray(lijst.data)) return;
      const inGebruik = new Set(rows.filter(row => row.user_id === user.id).flatMap(safePaths));
      (pendingPlacement?.paths || []).forEach(path => inGebruik.add(path));
      const grens = Date.now() - 15 * 60 * 1000;
      const weg = lijst.data
        .filter(foto => foto && foto.id && typeof foto.name === 'string' && /^[a-zA-Z0-9_-]+\.jpg$/.test(foto.name))
        .filter(foto => Date.parse(foto.created_at) < grens)
        .map(foto => user.id + '/' + foto.name)
        .filter(path => !inGebruik.has(path));
      if (weg.length && current(ctx) && ticket === request) await bucket.remove(weg);
    } catch {}
  };

  const load = async () => {
    if (!user || !client) return;
    const ctx = context();
    const ticket = ++request;
    loaded = false;
    lastSignTry = 0;
    rows = [];
    render();
    empty.hidden = true;
    retry.hidden = true;
    list.setAttribute('aria-busy', 'true');
    listStatus.textContent = 'De boeken worden geladen…';
    ownStatus.textContent = 'Je boeken worden geladen…';
    try {
      const fetched = new Map();
      for (let offset = 0; ; offset += 250) {
        if (!current(ctx) || ticket !== request) return;
        const response = await client.from('boeken').select(columns)
          .order('gemaakt', { ascending: false }).order('id', { ascending: false }).range(offset, offset + 249);
        if (!current(ctx) || ticket !== request) return;
        if (response.error || !Array.isArray(response.data)) throw response.error || new Error('invalid_response');
        response.data.forEach(row => {
          if (uuidPattern.test(row.id) && uuidPattern.test(row.user_id) && typeof row.titel === 'string') fetched.set(row.id, row);
        });
        if (response.data.length < 250) break;
      }
      rows = [...fetched.values()];
      loaded = true;
      render();
      opruimen(ctx, ticket);
    } catch {
      if (!current(ctx) || ticket !== request) return;
      listStatus.textContent = 'De boeken konden niet worden geladen. Probeer het zo opnieuw.';
      ownStatus.textContent = 'Je boeken konden niet worden geladen.';
      retry.hidden = false;
    } finally {
      if (current(ctx) && ticket === request) list.setAttribute('aria-busy', 'false');
    }
  };

  const normalPhone = () => phone.value.replace(/\s/g, '');
  const updateForm = () => {
    const validNumber = phonePattern.test(normalPhone());
    phone.setCustomValidity(validNumber ? '' : 'Vul een geldig nummer met +32 of +31 in.');
    byId('boek-titel').setCustomValidity(byId('boek-titel').value.trim() ? '' : 'Vul een titel in.');
    const files = [...photos.files];
    const imageError = files.length > 3 ? 'Kies maximaal 3 foto’s.' : files.some(file => !allowedImages.has(file.type)) ? 'Kies foto’s in een ondersteund afbeeldingsformaat.' : '';
    photos.setCustomValidity(imageError);
    byId('boek-fotos-hint').textContent = imageError || 'We verkleinen je foto’s voor je ze plaatst.';
    submit.disabled = placing || !user || (!pendingPlacement && (!validNumber || !consent.checked));
    submit.textContent = pendingPlacement ? 'Controleer plaatsing' : 'Boek plaatsen →';
    hint.textContent = pendingPlacement ? 'Controleer eerst of dit boek is geplaatst voordat je opnieuw probeert.' : placing ? 'Je boek wordt geplaatst…' : !validNumber && !consent.checked ? 'Vul een geldig nummer met +32 of +31 in en geef toestemming om je boek te plaatsen.' : !validNumber ? 'Vul een geldig nummer met +32 of +31 in.' : !consent.checked ? 'Vink aan dat je nummer zichtbaar mag zijn voor ingelogde studenten.' : 'Je nummer is alleen bij dit boek zichtbaar voor ingelogde studenten.';
  };

  const placementExists = async (ctx, id) => {
    assertCurrent(ctx);
    const response = await client.from('boeken').select('id').eq('id', id).eq('user_id', ctx.owner);
    if (response.error || !Array.isArray(response.data)) throw response.error || new Error('unknown');
    assertCurrent(ctx);
    return response.data.some(row => row.id === id);
  };
  const placementDone = async () => {
    pendingPlacement = null;
    form.reset();
    showResult(formResult, 'Je boek staat erbij. Je vindt het ook bij Mijn boeken.');
    await load();
  };
  const checkPendingPlacement = async () => {
    const pending = pendingPlacement;
    const ctx = context();
    placing = true;
    updateForm();
    showResult(formResult, 'We controleren of je boek is geplaatst…');
    try {
      if (await placementExists(ctx, pending.id)) await placementDone();
      else {
        if (pending.paths.length) {
          const cleanup = await client.storage.from('boekfotos').remove(pending.paths);
          if (cleanup.error) throw cleanup.error;
        }
        assertCurrent(ctx);
        pendingPlacement = null;
        showResult(formResult, 'Je boek is niet geplaatst. Je kunt het nu opnieuw proberen.', true);
      }
    } catch {
      if (current(ctx)) showResult(formResult, 'We kunnen de plaatsing nog niet bevestigen. Controleer het straks opnieuw. Je foto’s blijven voorlopig bewaard.', true);
    } finally {
      if (current(ctx)) {
        placing = false;
        fields.disabled = Boolean(pendingPlacement);
        updateForm();
      }
    }
  };

  const compressPhoto = async file => {
    let source;
    let objectUrl;
    try {
      if ('createImageBitmap' in window) source = await createImageBitmap(file, { imageOrientation: 'from-image' });
      else {
        objectUrl = URL.createObjectURL(file);
        source = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error('photo_invalid'));
          image.src = objectUrl;
        });
      }
      const width = source.width || source.naturalWidth;
      const height = source.height || source.naturalHeight;
      if (!width || !height) throw new Error('photo_invalid');
      const scale = Math.min(1, 1200 / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const drawing = canvas.getContext('2d');
      if (!drawing) throw new Error('photo_invalid');
      drawing.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--white').trim();
      drawing.fillRect(0, 0, canvas.width, canvas.height);
      drawing.drawImage(source, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .8));
      if (!blob || blob.type !== 'image/jpeg') throw new Error('photo_invalid');
      if (blob.size > 1048576) throw new Error('photo_large');
      return blob;
    } finally {
      source?.close?.();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  };

  form.addEventListener('input', updateForm);
  form.addEventListener('change', updateForm);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (placing || !user || !client) return;
    if (pendingPlacement) { await checkPendingPlacement(); return; }
    updateForm();
    if (!form.reportValidity() || submit.disabled) return;
    const ctx = context();
    const payload = {
      id: crypto.randomUUID(),
      user_id: ctx.owner,
      vak: byId('boek-vak').value,
      titel: byId('boek-titel').value.trim(),
      staat: byId('boek-staat').value,
      prijs: Number(byId('boek-prijs').value),
      plek: byId('boek-plek').value.trim() || null,
      whatsapp: normalPhone(),
      toestemming: consent.checked,
      fotos: []
    };
    const files = [...photos.files];
    const attempted = [];
    let inserted = false;
    let insertStarted = false;
    placing = true;
    fields.disabled = true;
    updateForm();
    showResult(formResult, '');
    try {
      const blobs = [];
      for (const file of files) { assertCurrent(ctx); blobs.push(await compressPhoto(file)); }
      for (const blob of blobs) {
        assertCurrent(ctx);
        const path = ctx.owner + '/' + crypto.randomUUID() + '.jpg';
        attempted.push(path);
        const response = await client.storage.from('boekfotos').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
        if (response.error) throw response.error;
        payload.fotos.push(path);
      }
      assertCurrent(ctx);
      insertStarted = true;
      const response = await client.from('boeken').insert(payload);
      if (response.error) throw response.error;
      inserted = true;
      if (!current(ctx)) return;
      await placementDone();
    } catch (failure) {
      // Een verloren antwoord bewijst niet dat de INSERT mislukte. Controleer het vaste id eerst.
      if (insertStarted && !inserted) {
        try {
          if (await placementExists(ctx, payload.id)) {
            inserted = true;
            await placementDone();
            return;
          }
        } catch {
          if (current(ctx)) {
            pendingPlacement = { id: payload.id, paths: [...attempted] };
            showResult(formResult, 'We weten nog niet of je boek is geplaatst. Controleer de plaatsing voordat je opnieuw probeert. Je foto’s blijven voorlopig bewaard.', true);
          }
          return;
        }
      }
      let cleanupFailed = false;
      // Wacht elke upload af en ruim ook eerdere uploads op als een volgende mislukt.
      if (!inserted && attempted.length) {
        try {
          const cleanup = await client.storage.from('boekfotos').remove(attempted);
          cleanupFailed = Boolean(cleanup.error);
        } catch { cleanupFailed = true; }
      }
      if (current(ctx)) {
        const message = failure.message === 'photo_large' ? 'Een foto blijft groter dan 1 MB. Kies een kleinere foto.' : failure.message === 'photo_invalid' || failure.name === 'InvalidStateError' ? 'Een foto kon niet worden geopend. Kies een andere foto.' : 'Plaatsen is niet gelukt. Controleer je verbinding en probeer opnieuw.';
        showResult(formResult, message + (cleanupFailed ? ' De geüploade foto’s konden nog niet worden opgeruimd.' : ''), true);
      }
    } finally {
      // Ook het tijdelijke verzoekobject houdt het nummer niet vast.
      payload.whatsapp = '';
      if (current(ctx)) {
        placing = false;
        fields.disabled = Boolean(pendingPlacement);
        updateForm();
      }
    }
  });

  Object.entries({ '1ba': '1ste bachelor', '2ba': '2de bachelor', '3ba': '3de bachelor' }).forEach(([id, name]) => {
    const group = element('optgroup');
    group.label = name;
    subjects.filter(subject => subject.jaar === id).forEach(subject => {
      const option = element('option', '', subject.naam);
      option.value = subject.id;
      group.append(option);
    });
    byId('boek-vak').append(group);
  });
  const other = element('option', '', 'Ander vak');
  other.value = 'ander';
  byId('boek-vak').append(other);
  document.querySelectorAll('.boeken-filter').forEach(filter => filter.addEventListener('click', () => {
    year = filter.dataset.jaar;
    document.querySelectorAll('.boeken-filter').forEach(node => node.setAttribute('aria-pressed', String(node === filter)));
    render();
  }));
  search.addEventListener('input', render);
  retry.addEventListener('click', load);

  const applyUser = value => {
    const next = value && uuidPattern.test(value.id) ? value : null;
    if (next?.id === user?.id && (next || !content.hidden)) return;
    generation++;
    request++;
    window.clearTimeout(expiryTimer);
    rows.forEach(row => { row.whatsapp = ''; });
    rows = [];
    signed.clear();
    mutations.clear();
    user = next;
    loaded = false;
    placing = false;
    pendingPlacement = null;
    form.reset();
    fields.disabled = false;
    showResult(formResult, '');
    list.replaceChildren();
    ownList.replaceChildren();
    listStatus.textContent = '';
    ownStatus.textContent = '';
    empty.hidden = true;
    content.hidden = !user;
    access.hidden = Boolean(user);
    accessText.textContent = 'Log in om boeken te bekijken of er een te plaatsen.';
    login.hidden = false;
    updateForm();
    if (user) load();
  };
  window.addEventListener('bes:auth', event => {
    authRevision++;
    applyUser(suspended || event.detail?.uitloggen ? null : event.detail?.user);
  });
  window.addEventListener('pagehide', () => {
    suspended = true;
    authRevision++;
    applyUser(null);
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { suspended = false; initialize(); }
  });
  async function initialize() {
    const revision = authRevision;
    try {
      if (!auth || !client) throw new Error('unavailable');
      await auth.gereed;
      const initial = await auth.gebruiker();
      if (!suspended && revision === authRevision) applyUser(initial);
    } catch {
      if (revision === authRevision) applyUser(null);
    }
  }
  updateForm();
  initialize();
})();
