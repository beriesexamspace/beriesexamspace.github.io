(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  const config = window.BES_CONFIG || {};
  const scriptPath = document.currentScript?.getAttribute('src') || 'assets/auth.js';
  const pagePrefix = scriptPath.split('assets/auth.js')[0];
  let client = null;
  let currentUser = null;
  let recoveryUserId = null;
  let initializationError = null;
  let renderTimer = 0;
  let signingOut = false;
  let logoutInProgress = false;
  let profileQueue = Promise.resolve();

  const messages = {
    unavailable: 'Accounts zijn nog niet ingeschakeld. Je kunt wel gewoon oefenen.',
    duplicate: 'Dit e-mailadres heeft al een account. Log in.',
    invalid_credentials: 'E-mail of wachtwoord klopt niet.',
    rate_limit: 'Even wachten, probeer het over een minuut opnieuw.',
    network: 'Even geen verbinding. Probeer het opnieuw.',
    invalid_email: 'Dit e-mailadres klopt niet. Controleer het en probeer het opnieuw.',
    invalid_name: 'Vul je voornaam en achternaam in om verder te gaan.',
    signed_out: 'Je bent niet meer ingelogd. Log opnieuw in.',
    weak_password: 'Je wachtwoord is te kort. Kies minimaal 8 tekens.',
    same_password: 'Dit is je huidige wachtwoord. Kies een ander wachtwoord.',
    recovery_invalid: 'Deze link is verlopen. Vraag een nieuwe aan.',
    confirmation_required: 'Je account kan nog niet direct inloggen. Probeer later opnieuw.',
    email_confirmation: 'Deze bevestigingslink is ongeldig of verlopen. Vraag de e-mailwijziging opnieuw aan via je profiel.',
    reauthentication_needed: 'Log opnieuw in en probeer de wijziging nog eens.',
    google_unavailable: 'Inloggen met Google is nog niet ingeschakeld.',
    unknown: 'Dit is niet gelukt. Probeer het opnieuw.'
  };

  function failure(code) {
    const error = new Error(messages[code] || messages.unknown);
    error.code = code in messages ? code : 'unknown';
    return error;
  }

  function readableError(error) {
    const code = String(error?.code || '').toLowerCase();
    const message = String(error?.message || '').toLowerCase();
    if (code in messages && error.message === messages[code]) return error;
    if (error?.status === 429 || /rate_limit|too_many_requests/.test(code) || /rate limit|too many requests/.test(message)) return failure('rate_limit');
    if (/user_already_exists|email_exists/.test(code) || /already registered|already been registered/.test(message)) return failure('duplicate');
    if (code === 'invalid_credentials' || /invalid login credentials/.test(message)) return failure('invalid_credentials');
    if (/email_address_invalid|validation_failed/.test(code) && /email/.test(message)) return failure('invalid_email');
    if (code === 'weak_password' || /password should be at least|password is too short/.test(message)) return failure('weak_password');
    if (code === 'same_password') return failure('same_password');
    if (/reauthentication_needed|reauthentication_not_valid/.test(code)) return failure('reauthentication_needed');
    if (/session_not_found|session_expired|otp_expired|refresh_token_not_found/.test(code)) return failure('recovery_invalid');
    if (code === 'email_not_confirmed') return failure('confirmation_required');
    if (/provider.*(not enabled|disabled)|unsupported provider|validation_failed.*provider/.test(message) || (code === 'validation_failed' && /provider/.test(message))) return failure('google_unavailable');
    if (window.navigator.onLine === false || error?.name === 'AuthRetryableFetchError' || error instanceof TypeError || /failed to fetch|network|load failed|fetch failed/.test(message)) return failure('network');
    return failure('unknown');
  }

  const cleanName = (value, limit = 60) => typeof value === 'string'
    ? Array.from(value.normalize('NFC').replace(/[^\p{L}\p{M}\p{Nd} '\u2019-]/gu, '')).slice(0, limit).join('').trim()
    : '';

  function nameDetails(user) {
    const metadata = user?.user_metadata || {};
    const voornaam = cleanName(metadata.voornaam);
    const achternaam = cleanName(metadata.achternaam);
    const bijnaam = cleanName(metadata.bijnaam, 24);
    const gesplitst = Boolean(voornaam && achternaam);
    const volledig = gesplitst ? voornaam + ' ' + achternaam : cleanName(metadata.naam, 121);
    return { voornaam, achternaam, bijnaam, volledig, gesplitst, aanspreeknaam: bijnaam || voornaam || volledig };
  }

  // Over jezelf (optioneel): studie, jaar, een korte tekst en of het openbaar is. Altijd platte tekst, nooit HTML.
  const overJaren = ['1ba', '2ba', '3ba', 'master', 'anders'];
  const cleanText = (value, limit, regels = false) => typeof value === 'string'
    ? Array.from(value.normalize('NFC')
      .replace(regels ? /\r\n?/g : /\s+/g, regels ? '\n' : ' ')
      .replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069]/g, '')
      .replace(/\n{3,}/g, '\n\n')).slice(0, limit).join('').trim()
    : '';

  function overDetails(value) {
    const over = value && typeof value === 'object' ? value : {};
    return {
      studie: cleanText(over.studie, 60),
      jaar: overJaren.includes(over.jaar) ? over.jaar : '',
      tekst: cleanText(over.tekst, 300, true),
      openbaar: over.openbaar === true
    };
  }

  const callbackUrl = new URL(window.location.href);
  const callbackHash = new URLSearchParams(callbackUrl.hash.slice(1));
  const emailCallback = callbackUrl.searchParams.get('email') === 'bevestigen';
  const emailCallbackError = emailCallback && (callbackHash.has('error') || callbackHash.has('error_code') || callbackUrl.searchParams.has('error'));
  // Terugkeer van Google: bij een fout (bijvoorbeeld provider nog uit) de melding bewaren en de hash opruimen
  const googleCallback = callbackUrl.searchParams.get('google') === 'terug';
  const googleErrorText = googleCallback ? (callbackHash.get('error_description') || callbackUrl.searchParams.get('error_description') || (callbackHash.has('error') ? 'error' : '')) : '';
  const googleError = googleErrorText ? failure(/provider|unsupported|not enabled|disabled/i.test(googleErrorText) ? 'google_unavailable' : 'unknown') : null;
  if (googleError) {
    try { window.history.replaceState(null, '', callbackUrl.pathname + callbackUrl.search); } catch {}
  }

  function clearName() {
    try { window.localStorage.removeItem('bes_naam'); } catch {}
  }

  function photoUrl(user, value = user?.user_metadata?.foto) {
    if (!user || typeof value !== 'string' || !value) return '';
    try {
      const expected = new URL('/storage/v1/object/public/avatars/' + encodeURIComponent(user.id) + '.jpg', config.supabaseUrl);
      const actual = new URL(value);
      return /^https?:$/.test(actual.protocol) && actual.origin === expected.origin && actual.pathname === expected.pathname ? actual.href : '';
    } catch { return ''; }
  }

  function fillAvatar(element, user) {
    const words = nameDetails(user).volledig.split(/\s+/).filter(Boolean);
    const initials = Array.from(words.map(word => word.match(/\p{L}/u)?.[0] || '').filter(Boolean).slice(0, 2).join('').toLocaleUpperCase('nl')).slice(0, 2).join('');
    element.replaceChildren();
    element.textContent = initials;
    element.setAttribute('aria-hidden', 'true');
    const source = photoUrl(user);
    if (!source) return;
    const image = document.createElement('img');
    image.alt = '';
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => { if (element.contains(image)) element.textContent = initials; }, { once: true });
    image.src = source;
    element.replaceChildren(image);
  }

  // Profielmenu in de nav: een knop die een lijstje uitklapt (Profiel, Weekoverzicht, Foutenlijst, Examenplan, Uitloggen).
  // Abonnement staat niet in het menu: dat pas je aan via Profiel (blok Jouw abonnement).
  function zetProfielMenu(menu, open) {
    const knop = menu.querySelector('.profiel-knop');
    const lijst = menu.querySelector('.profiel-menu-lijst');
    if (!knop || !lijst) return;
    knop.setAttribute('aria-expanded', String(open));
    lijst.hidden = !open;
    menu.classList.toggle('is-open', open);
  }

  // Is dit account beheerder? Eén keer per account per pagina gevraagd; dan komt Beheer als link in de navigatiebalk.
  let beheerderBelofte = null;
  const isBeheerder = () => {
    if (!beheerderBelofte) beheerderBelofte = client && currentUser ? client.rpc('is_beheerder').then(({ data }) => data === true, () => false) : Promise.resolve(false);
    return beheerderBelofte;
  };

  function maakProfielMenu(index) {
    const menu = document.createElement('div');
    menu.className = 'profiel-menu';
    const lijstId = 'profiel-menu-' + index;
    const knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'profiel-knop';
    knop.setAttribute('aria-expanded', 'false');
    knop.setAttribute('aria-controls', lijstId);
    const avatar = document.createElement('span');
    avatar.className = 'profiel-avatar';
    fillAvatar(avatar, currentUser);
    const pijl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    pijl.setAttribute('class', 'profiel-pijl');
    pijl.setAttribute('viewBox', '0 0 24 24');
    pijl.setAttribute('aria-hidden', 'true');
    const lijn = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    lijn.setAttribute('d', 'm7 10 5 5 5-5');
    pijl.append(lijn);
    knop.append(avatar, document.createTextNode('Profiel'), pijl);

    const lijst = document.createElement('div');
    lijst.className = 'profiel-menu-lijst';
    lijst.id = lijstId;
    lijst.hidden = true;
    const kop = document.createElement('p');
    kop.className = 'profiel-menu-kop';
    const naam = document.createElement('strong');
    const gegevens = nameDetails(currentUser);
    naam.textContent = gegevens.aanspreeknaam || gegevens.volledig || 'Jouw account';
    const plan = document.createElement('span');
    plan.className = 'profiel-menu-plan';
    plan.hidden = true;
    kop.append(naam, plan);
    lijst.append(kop);
    const pagina = window.location.pathname.split('/').pop() || 'index.html';
    [['Profiel', 'profiel.html'], ['Weekoverzicht', 'voortgang.html'], ['Foutenlijst', 'fouten.html'], ['Examenplan', 'examenplan.html'], ['Feedback', 'feedback.html']].forEach(([tekst, pad]) => {
      const link = document.createElement('a');
      link.href = pagePrefix + pad;
      link.textContent = tekst;
      if (pagina === pad) link.setAttribute('aria-current', 'page');
      lijst.append(link);
    });
    const uitloggen = document.createElement('button');
    uitloggen.type = 'button';
    uitloggen.className = 'profiel-menu-uitloggen';
    uitloggen.setAttribute('data-account-uitloggen', '');
    uitloggen.textContent = 'Uitloggen';
    lijst.append(document.createElement('hr'), uitloggen);

    knop.addEventListener('click', () => zetProfielMenu(menu, knop.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('focusout', event => { if (event.relatedTarget && !menu.contains(event.relatedTarget)) zetProfielMenu(menu, false); });
    menu.append(knop, lijst);
    if (typeof BES.plan === 'function') {
      BES.plan().then(gegeven => {
        plan.textContent = BES.planNaam(gegeven.plan);
        plan.dataset.plan = gegeven.plan;
        plan.hidden = false;
      }).catch(() => {});
    }
    return menu;
  }

  function renderAccount() {
    document.querySelectorAll('nav.navigation, nav.nav-vol').forEach((navigation, index) => {
      let controls = navigation.querySelector('.account-controls');
      if (!controls) {
        const original = navigation.querySelector('.login-button');
        if (!original) return;
        controls = document.createElement('div');
        controls.className = 'account-controls';
        original.replaceWith(controls);
      }
      controls.replaceChildren();
      navigation.querySelectorAll('.account-uitloggen-mobiel, [data-account-uitloggen], [data-beheer-nav]').forEach(link => link.remove());
      // Over mij op open pagina's: ingelogd naar het rode blok Wie is Berie op de hub, anders naar Over mij (de hub zit achter de login).
      navigation.querySelectorAll('.navigation-links a[data-over-mij]').forEach(link => {
        link.href = pagePrefix + (currentUser ? 'hub.html#wie-is-berie' : 'over-mij.html');
      });
      if (!currentUser) {
        beheerderBelofte = null;
        const login = document.createElement('a');
        login.className = 'pill login-button';
        login.textContent = 'Inloggen →';
        login.href = pagePrefix + 'inloggen.html';
        controls.append(login);
        return;
      }
      controls.append(maakProfielMenu(index));
      // Beheer als laatste link in de navigatiebalk, alleen voor de beheerder.
      const eigenaar = currentUser.id;
      isBeheerder().then(ja => {
        const links = navigation.querySelector('.navigation-links');
        if (!ja || !links || currentUser?.id !== eigenaar || links.querySelector('[data-beheer-nav]')) return;
        const item = document.createElement('li');
        item.setAttribute('data-beheer-nav', '');
        const link = document.createElement('a');
        link.href = pagePrefix + 'beheer.html';
        link.textContent = 'Beheer';
        if ((window.location.pathname.split('/').pop() || 'index.html') === 'beheer.html') link.setAttribute('aria-current', 'page');
        item.append(link);
        links.append(item);
      });
    });
    document.querySelectorAll('[data-account-opties]').forEach(element => { element.hidden = Boolean(currentUser); });
    document.querySelectorAll('[data-account-sessie]').forEach(element => {
      element.hidden = !currentUser;
      const link = element.querySelector('[data-account-uitloggen]');
      if (link && currentUser) {
        link.textContent = 'Uitloggen';
      }
    });
  }

  let completingName = false;
  // Na inloggen met Google ontbreken voornaam en achternaam; vul ze één keer aan uit de naam die Google meegeeft
  function completeNameFromProvider(user) {
    if (!user || completingName || logoutInProgress || !client) return;
    const metadata = user.user_metadata || {};
    if (cleanName(metadata.voornaam)) return;
    const full = cleanName(metadata.full_name || metadata.name, 121);
    if (!full) return;
    const [voornaam, ...rest] = full.split(' ');
    const achternaam = rest.join(' ').trim();
    if (!voornaam || !achternaam) return;
    completingName = true;
    const data = { voornaam, achternaam, naam: voornaam + ' ' + achternaam };
    client.auth.updateUser({ data })
      .then(result => { if (result?.data?.user && currentUser?.id === result.data.user.id) setUser(result.data.user); })
      .catch(() => {})
      .finally(() => { completingName = false; });
  }

  function setUser(user, clearGuestName = false) {
    currentUser = user || null;
    if (currentUser) completeNameFromProvider(currentUser);
    if (currentUser) {
      const name = nameDetails(currentUser).aanspreeknaam;
      if (name) BES.naamOpslaan?.(name);
      else clearName();
    } else if (clearGuestName) {
      clearName();
    }
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(() => {
      renderAccount();
      window.dispatchEvent(new CustomEvent('bes:auth', { detail: { user: currentUser, uitloggen: logoutInProgress } }));
    }, 0);
  }

  async function requireClient() {
    if (!auth.beschikbaar) throw failure('unavailable');
    await auth.gereed;
    return client;
  }

  async function request(operation) {
    try {
      const activeClient = await requireClient();
      const result = await operation(activeClient.auth);
      if (result.error) throw result.error;
      return result.data;
    } catch (error) {
      throw readableError(error);
    }
  }

  const auth = BES.auth = {
    beschikbaar: false,
    gereed: Promise.resolve(null),
    get client() { return client; },
    get terugNa() {
      let waarde = '';
      try { waarde = new URLSearchParams(window.location.search).get('terug') || window.sessionStorage.getItem('bes_terug') || ''; } catch {}
      try { window.sessionStorage.removeItem('bes_terug'); } catch {}
      // alleen eigen relatieve paden, nooit een andere site
      if (!waarde || /^[a-z]+:|^\/\/|^\//i.test(waarde) || waarde.includes('..')) return pagePrefix + 'hub.html';
      return pagePrefix + waarde;
    },
    get versieGezien() { return Number(currentUser?.user_metadata?.versie_gezien) || 0; },
    avatarVullen: fillAvatar,
    naamGegevens: nameDetails,
    overGegevens: user => overDetails(user?.user_metadata?.over),
    get googleFout() { return googleError; },
    get emailBevestiging() { return { teruggekeerd: emailCallback, fout: emailCallbackError || (emailCallback && initializationError?.code === 'recovery_invalid') }; },

    async gebruiker() {
      await auth.gereed;
      return currentUser;
    },

    async gebruikerVerversen() {
      const owner = currentUser?.id;
      if (!owner) return null;
      const data = await request(api => api.getUser());
      if (!data?.user || currentUser?.id !== owner || data.user.id !== owner || logoutInProgress) throw failure('signed_out');
      setUser(data.user);
      return data.user;
    },

    async aanmelden(naam, email, wachtwoord) {
      const metadata = { voornaam: cleanName(naam?.voornaam), achternaam: cleanName(naam?.achternaam), bijnaam: cleanName(naam?.bijnaam, 24) };
      if (!metadata.voornaam || !metadata.achternaam) throw failure('invalid_name');
      metadata.naam = metadata.voornaam + ' ' + metadata.achternaam;
      if (String(wachtwoord).length < 8) throw failure('weak_password');
      const data = await request(api => api.signUp({
        email: String(email).trim(),
        password: wachtwoord,
        options: { data: metadata }
      }));
      if (data?.user?.identities?.length === 0) throw failure('duplicate');
      if (!data?.session || !data?.user) throw failure('confirmation_required');
      setUser(data.user);
      return data.user;
    },

    // Start het inloggen via Google; Supabase stuurt de gebruiker daarna terug naar de hub
    async metGoogle() {
      const redirectTo = new URL(pagePrefix + 'inloggen.html?google=terug', window.location.href).href;
      const data = await request(api => api.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } }));
      if (!data?.url) throw failure('unknown');
      // Eerst controleren of Google aanstaat; zolang de provider uit staat geeft Supabase een 400 in plaats van een doorverwijzing
      try {
        const check = await fetch(data.url, { redirect: 'manual', credentials: 'omit' });
        if (check.status === 400 || check.status === 404 || check.status === 422) throw failure('google_unavailable');
      } catch (error) {
        if (error?.code === 'google_unavailable') throw error;
        // netwerkfout of opaque redirect: gewoon doorgaan, de browser volgt de echte doorverwijzing
      }
      window.location.assign(data.url);
    },

    async inloggen(email, wachtwoord) {
      const data = await request(api => api.signInWithPassword({ email: String(email).trim(), password: wachtwoord }));
      if (!data?.session || !data?.user) throw failure('invalid_credentials');
      recoveryUserId = null;
      setUser(data.user);
      return data.user;
    },

    async uitloggen() {
      logoutInProgress = true;
      try {
        await request(api => api.signOut());
        recoveryUserId = null;
        // Na uitloggen beslist het account weer of de kennismaking al gezien is (user_metadata.versie_gezien),
        // niet meer dit toestel. Zo kan een volgend account op hetzelfde toestel de kennismaking wel krijgen.
        try {
          window.localStorage.removeItem('bes_versie_gezien');
          window.localStorage.removeItem('bes_comit_voorgesteld');
        } catch {}
        setUser(null, true);
        window.location.assign(pagePrefix + 'index.html');
      } catch (error) {
        logoutInProgress = false;
        throw error;
      }
    },

    async herstelMail(email) {
      const redirectTo = new URL(pagePrefix + 'wachtwoord.html', window.location.href).href;
      await request(api => api.resetPasswordForEmail(String(email).trim(), { redirectTo }));
    },

    async herstelGeldig() {
      await auth.gereed;
      if (initializationError && ['network', 'rate_limit'].includes(initializationError.code)) throw initializationError;
      return Boolean(auth.beschikbaar && currentUser && recoveryUserId === currentUser.id);
    },

    async nieuwWachtwoord(wachtwoord) {
      await requireClient();
      if (!await auth.herstelGeldig()) throw failure('recovery_invalid');
      if (String(wachtwoord).length < 8) throw failure('weak_password');
      const data = await request(api => api.updateUser({ password: wachtwoord }));
      if (!data?.user) throw failure('recovery_invalid');
      recoveryUserId = null;
      setUser(data.user);
      return data.user;
    },

    async profielBijwerken(patch = {}, wachtwoord = '', email = '', options = {}) {
      const owner = currentUser?.id;
      await requireClient();
      if (!owner || currentUser?.id !== owner || logoutInProgress) throw failure('signed_out');
      const metadata = {};
      if (['voornaam', 'achternaam'].some(key => Object.hasOwn(patch, key))) {
        metadata.voornaam = cleanName(patch.voornaam);
        metadata.achternaam = cleanName(patch.achternaam);
        if (!metadata.voornaam || !metadata.achternaam) throw failure('invalid_name');
        metadata.naam = metadata.voornaam + ' ' + metadata.achternaam;
      }
      if (Object.hasOwn(patch, 'bijnaam')) metadata.bijnaam = cleanName(patch.bijnaam, 24);
      if (Object.hasOwn(patch, 'naam')) {
        metadata.naam = cleanName(patch.naam, 121);
        if (!metadata.naam) throw failure('invalid_name');
      }
      if (Object.hasOwn(patch, 'over')) {
        const over = overDetails(patch.over);
        metadata.over = over.studie || over.jaar || over.tekst ? { ...over, bijgewerkt: new Date().toISOString() } : null;
      }
      if (Object.hasOwn(patch, 'versieGezien')) metadata.versie_gezien = Math.max(0, Math.floor(Number(patch.versieGezien) || 0));
      if (Object.hasOwn(patch, 'thema')) {
        if (!['licht', 'donker'].includes(patch.thema)) throw failure('unknown');
        metadata.thema = patch.thema;
      }
      if (Object.hasOwn(patch, 'foto')) {
        metadata.foto = patch.foto === null || patch.foto === '' ? null : photoUrl(currentUser, patch.foto);
        if (metadata.foto === '') throw failure('unknown');
      }
      if (wachtwoord && (typeof wachtwoord !== 'string' || wachtwoord.length < 8)) throw failure('weak_password');
      const newEmail = typeof email === 'string' ? email.trim() : '';
      if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) throw failure('invalid_email');
      const operation = async () => {
        if (!currentUser || currentUser.id !== owner || logoutInProgress) throw failure('signed_out');
        const changeEmail = newEmail && newEmail.toLowerCase() !== String(currentUser.email || '').toLowerCase()
          && (options.emailOpnieuw || newEmail.toLowerCase() !== String(currentUser.new_email || '').toLowerCase());
        if (!Object.keys(metadata).length && !wachtwoord && !changeEmail) return currentUser;
        const attributes = { data: metadata };
        if (wachtwoord) attributes.password = wachtwoord;
        if (changeEmail) attributes.email = newEmail;
        const requestOptions = changeEmail ? { emailRedirectTo: new URL(pagePrefix + 'profiel.html?email=bevestigen', window.location.href).href } : undefined;
        const data = await request(api => {
          if (!currentUser || currentUser.id !== owner || logoutInProgress) throw failure('signed_out');
          return api.updateUser(attributes, requestOptions);
        });
        if (!data?.user || data.user.id !== owner || currentUser?.id !== owner || logoutInProgress) throw failure('signed_out');
        setUser(data.user);
        return data.user;
      };
      const result = profileQueue.then(operation, operation);
      profileQueue = result.catch(() => {});
      return result;
    }
  };

  const filled = value => typeof value === 'string' && value.trim() && !/[\[\]]/.test(value);
  let validUrl = false;
  try { validUrl = /^https?:$/.test(new URL(config.supabaseUrl).protocol); } catch {}

  if (validUrl && filled(config.supabaseUrl) && filled(config.supabaseAnonKey) && typeof window.supabase?.createClient === 'function') {
    try {
      client = window.supabase.createClient(config.supabaseUrl.trim(), config.supabaseAnonKey.trim());
      auth.beschikbaar = true;
      client.auth.onAuthStateChange((event, session) => {
        if (event === 'USER_UPDATED' && (logoutInProgress || !currentUser || session?.user?.id !== currentUser.id)) return;
        if (event === 'PASSWORD_RECOVERY') recoveryUserId = session?.user?.id || null;
        if (event === 'SIGNED_OUT' || !session || (recoveryUserId && session.user?.id !== recoveryUserId)) recoveryUserId = null;
        setUser(session?.user, event === 'SIGNED_OUT');
      });
      auth.gereed = (async () => {
        try {
          const initialized = await client.auth.initialize();
          if (initialized.error) initializationError = readableError(initialized.error);
          const { data, error } = await client.auth.getSession();
          if (error) initializationError = readableError(error);
          else setUser(data?.session?.user);
        } catch (error) { initializationError = readableError(error); }
        await new Promise(resolve => window.setTimeout(resolve, 0));
        return currentUser;
      })();
    } catch {
      auth.beschikbaar = false;
      client = null;
    }
  }

  if (!auth.beschikbaar) console.info('Accounts zijn nog niet ingeschakeld; de client is niet aangemaakt.');

  // De deur (assets/deur.js): zodra de sessie bekend is, pagina tonen of naar inloggen sturen.
  // Zolang de site niet open is, mag alleen een account met toegang binnen (heeft_toegang in Supabase, zie supabase/toegang.sql).
  const openDeur = async () => {
    if (!window.BES_DEUR) return;
    if (!currentUser) { window.BES_DEUR.naarInloggen(); return; }
    let toegang = false;
    try {
      const { data, error } = await client.rpc('heeft_toegang');
      toegang = !error && data === true;
    } catch {}
    if (toegang) document.documentElement.classList.remove('deur-check');
    else window.location.replace(window.BES_DEUR.prefix + 'gesloten.html');
  };
  auth.gereed.then(openDeur, openDeur);

  const initializeView = () => {
    renderAccount();
    // Profielmenu dicht bij een klik ernaast of met Escape.
    document.addEventListener('click', event => {
      document.querySelectorAll('.profiel-menu.is-open').forEach(menu => { if (!menu.contains(event.target)) zetProfielMenu(menu, false); });
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('.profiel-menu.is-open').forEach(menu => { zetProfielMenu(menu, false); menu.querySelector('.profiel-knop')?.focus(); });
    });
    document.addEventListener('click', async event => {
      const link = event.target.closest?.('[data-account-uitloggen]');
      if (!link || !currentUser) return;
      event.preventDefault();
      if (signingOut) return;
      signingOut = true;
      link.setAttribute('aria-disabled', 'true');
      const errorHost = link.closest('[data-uitloggen-groep]') || link.closest('nav') || document.querySelector('nav.navigation, nav.nav-vol') || document.querySelector('[data-account-sessie]') || link.parentElement;
      const previousError = document.querySelector('[data-account-fout]');
      if (previousError) previousError.remove();
      try {
        await auth.uitloggen();
      } catch (error) {
        const message = document.createElement('p');
        message.className = 'auth-error account-fout';
        message.setAttribute('data-account-fout', '');
        message.setAttribute('role', 'status');
        message.textContent = `${readableError(error).message} `;
        const retry = document.createElement('a');
        retry.href = '#';
        retry.setAttribute('data-account-uitloggen', '');
        retry.textContent = 'Opnieuw uitloggen';
        message.append(retry);
        if (errorHost.tagName === 'NAV') errorHost.insertAdjacentElement('afterend', message);
        else errorHost.append(message);
      } finally {
        signingOut = false;
        link.removeAttribute('aria-disabled');
      }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeView, { once: true });
  else initializeView();
})();
