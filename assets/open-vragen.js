// Oefenmodus Open vragen op de vakpagina (samen met assets/vak.js).
// De student schrijft een antwoord uit het hoofd. Comit kijkt het na tegen de kernpunten van een modelantwoord,
// via de Edge Function "comit-nakijken" (voorstel: voorstel/edge-function/). Er gaat alleen de vraag, het modelantwoord
// met de kernpunten en het antwoord van de student mee, nooit een naam, e-mailadres of user-id.
// Lukt het nakijken niet (fout, time-out, geen sessie), dan toont de pagina het modelantwoord en komt er niets in de Foutenlijst.
window.BES = window.BES || {};

(() => {
  'use strict';

  const BES = window.BES;
  const MAX_TEKENS = 3000;
  const MIN_TEKENS = 15;
  const WACHTTIJD = 28000;
  const STATUSSEN = { aanwezig: 'Aanwezig', gedeeltelijk: 'Gedeeltelijk', ontbreekt: 'Ontbreekt' };

  // Tekst uit het antwoord van de functie: alleen gewone tekst, ingekort.
  const tekstVan = (waarde, max) => typeof waarde === 'string' ? waarde.trim().slice(0, max) : '';
  const lijstVan = (waarde, max = 6) => Array.isArray(waarde) ? waarde.map(item => tekstVan(item, 400)).filter(Boolean).slice(0, max) : [];

  // Het antwoord van de functie moet precies kloppen: elk kernpunt één keer, met een bekende status. Anders: null (dan de terugval).
  function controleer(data, kernpunten) {
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return null; } }
    if (!data || typeof data !== 'object' || !Array.isArray(data.kernpunten)) return null;
    const ids = new Set(kernpunten.map(punt => punt.id));
    const gezien = new Map();
    for (const punt of data.kernpunten) {
      if (!punt || !ids.has(punt.id) || gezien.has(punt.id) || !Object.hasOwn(STATUSSEN, punt.status)) return null;
      gezien.set(punt.id, { status: punt.status, toelichting: tekstVan(punt.toelichting, 400) });
    }
    if (gezien.size !== ids.size) return null;
    const onjuist = (Array.isArray(data.onjuist) ? data.onjuist : []).map(item => {
      const tekst = tekstVan(typeof item === 'string' ? item : item?.tekst, 400);
      const kernpunt = item && typeof item === 'object' && ids.has(item.kernpunt) ? item.kernpunt : null;
      return tekst ? { tekst, kernpunt } : null;
    }).filter(Boolean).slice(0, 6);
    const tip = tekstVan(data.tip, 400);
    if (!tip) return null;
    return { kernpunten: gezien, goed: lijstVan(data.goed), ontbreekt: lijstVan(data.ontbreekt), onjuist, tip };
  }

  async function nakijken(vraag, antwoord) {
    const auth = BES.auth;
    const client = auth?.client;
    let user = null;
    try { user = await auth?.gebruiker?.(); } catch {}
    if (!client?.functions || !user) return { ok: false };
    const kernpunten = vraag.k.map((tekst, index) => ({ id: `k${index + 1}`, tekst }));
    let timer;
    try {
      const aanroep = client.functions.invoke('comit-nakijken', {
        body: { vraag: vraag.q, modelantwoord: vraag.m, kernpunten, antwoord: antwoord.slice(0, MAX_TEKENS) }
      });
      aanroep.catch?.(() => {});
      const { data, error } = await Promise.race([aanroep, new Promise(klaar => { timer = window.setTimeout(() => klaar({ data: null, error: 'tijd' }), WACHTTIJD); })]);
      if (error || !data) return { ok: false };
      // Daglimiet van de functie: een rustige melding, verder hetzelfde als de terugval.
      if (data.limiet === true) return { ok: false, melding: tekstVan(data.tekst, 300) };
      const uitkomst = controleer(data, kernpunten);
      return uitkomst ? { ok: true, ...uitkomst } : { ok: false };
    } catch {
      return { ok: false };
    } finally {
      window.clearTimeout(timer);
    }
  }

  BES.openVragen = (vak) => {
    const { create, fade, toonBlok, verbergBlok } = vak;
    const byId = id => document.getElementById(id);
    let ronde = null;

    // Het scherm wordt één keer gemaakt, naast het gewone oefenscherm.
    function maakScherm() {
      if (byId('openscherm')) return byId('openscherm');
      const scherm = create('section', 'oefenscherm openscherm');
      scherm.id = 'openscherm';
      scherm.hidden = true;
      scherm.setAttribute('aria-labelledby', 'open-vraag-tekst');
      scherm.innerHTML = `
        <button class="terug vak-tekstknop" type="button" id="open-stop">Stop</button>
        <div class="kaart stop-bevestiging" id="open-stop-bevestiging" role="group" aria-labelledby="open-stop-tekst" hidden>
          <p id="open-stop-tekst">Stoppen? Wat je bij deze vraag typte, gaat verloren.</p>
          <div class="vak-knoppen">
            <button class="knop" type="button" id="open-stop-ja">Ja, stoppen</button>
            <button class="knop-secundair" type="button" id="open-stop-nee">Verder oefenen</button>
          </div>
        </div>
        <div class="voortgang-balk" id="open-balk" role="progressbar" aria-label="Voortgang van deze oefening" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
        <div id="open-vraagdeel">
          <p class="eyebrow" id="open-teller"></p>
          <p class="label oefening-niveau">Open vragen</p>
          <h2 id="open-vraag-tekst" tabindex="-1"></h2>
          <label class="open-label" for="open-antwoord">Jouw antwoord</label>
          <textarea class="auth-input" id="open-antwoord" rows="8" maxlength="${MAX_TEKENS}" aria-describedby="open-teken open-uitleg"></textarea>
          <p class="vak-hint open-teken" id="open-teken"></p>
          <p class="vak-hint" id="open-uitleg">Schrijf uit het hoofd. Wees specifiek, gebruik de juiste begrippen en geef een voorbeeld of argument.</p>
          <div class="vak-volgende"><button class="knop" type="button" id="open-nakijken">Nakijken →</button></div>
          <p class="vak-hint open-status" id="open-status" role="status" aria-live="polite"></p>
          <div class="open-resultaat" id="open-resultaat" hidden></div>
          <div class="vak-volgende"><button class="knop" type="button" id="open-volgende" hidden>Volgende →</button></div>
        </div>
        <div class="kaart open-einde" id="open-einde" hidden>
          <h2 id="open-einde-kop" tabindex="-1"></h2>
          <p class="vak-score-tekst" id="open-einde-tekst"></p>
          <div class="vak-knoppen">
            <button class="knop" type="button" id="open-opnieuw">Opnieuw</button>
            <button class="knop-secundair" type="button" id="open-terug">Terug naar het vak</button>
          </div>
        </div>`;
      const plek = byId('oefenscherm');
      plek.after(scherm);

      const antwoord = byId('open-antwoord');
      antwoord.addEventListener('input', telTekens);
      byId('open-nakijken').addEventListener('click', kijkNa);
      byId('open-volgende').addEventListener('click', volgende);
      byId('open-stop').addEventListener('click', () => {
        if (!ronde || ronde.klaar || (!antwoord.value.trim() || ronde.nagekeken)) { stop(); return; }
        toonBlok(byId('open-stop-bevestiging'));
        byId('open-stop-nee').focus();
      });
      byId('open-stop-nee').addEventListener('click', () => { verbergBlok(byId('open-stop-bevestiging')); byId('open-stop').focus(); });
      byId('open-stop-ja').addEventListener('click', stop);
      byId('open-opnieuw').addEventListener('click', () => { if (ronde) start(vak.shuffle(ronde.vragen)); });
      byId('open-terug').addEventListener('click', stop);
      return scherm;
    }

    function telTekens() {
      const lengte = byId('open-antwoord').value.length;
      byId('open-teken').textContent = `${lengte} van ${MAX_TEKENS} tekens`;
      byId('open-nakijken').disabled = ronde?.bezig || byId('open-antwoord').value.trim().length < MIN_TEKENS;
    }

    function stop() {
      ronde = null;
      byId('open-stop-bevestiging').hidden = true;
      vak.naarKeuzes();
    }

    function start(vragen) {
      maakScherm();
      ronde = { vragen, index: 0, nagekeken: false, bezig: false, klaar: false, ontbrak: 0 };
      byId('open-einde').hidden = true;
      byId('open-vraagdeel').hidden = false;
      byId('open-stop').hidden = false;
      vak.toonScherm('open');
      toonVraag();
    }

    function toonVraag() {
      const vraag = ronde.vragen[ronde.index];
      ronde.nagekeken = false;
      ronde.bezig = false;
      byId('open-stop-bevestiging').hidden = true;
      byId('open-teller').textContent = `Vraag ${ronde.index + 1} van ${ronde.vragen.length} · ${vak.hoofdstukNaam(vraag.h)}`;
      byId('open-vraag-tekst').textContent = vraag.q;
      const balk = byId('open-balk');
      balk.setAttribute('aria-valuemax', String(ronde.vragen.length));
      balk.setAttribute('aria-valuenow', String(ronde.index));
      balk.querySelector('span').style.width = `${ronde.index / ronde.vragen.length * 100}%`;
      const antwoord = byId('open-antwoord');
      antwoord.value = '';
      antwoord.readOnly = false;
      byId('open-nakijken').hidden = false;
      byId('open-status').textContent = '';
      byId('open-resultaat').hidden = true;
      byId('open-resultaat').replaceChildren();
      byId('open-volgende').hidden = true;
      byId('open-volgende').textContent = ronde.index === ronde.vragen.length - 1 ? 'Afronden →' : 'Volgende →';
      telTekens();
      byId('open-vraag-tekst').focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: vak.reducedMotion.matches ? 'auto' : 'smooth' });
    }

    async function kijkNa() {
      if (!ronde || ronde.bezig || ronde.nagekeken) return;
      const huidige = ronde;
      const vraag = ronde.vragen[ronde.index];
      const tekst = byId('open-antwoord').value.trim();
      if (tekst.length < MIN_TEKENS) return;
      ronde.bezig = true;
      byId('open-antwoord').readOnly = true;
      byId('open-nakijken').disabled = true;
      byId('open-status').textContent = 'Comit kijkt je antwoord na.';
      const uitkomst = await nakijken(vraag, tekst);
      // Intussen gestopt of een nieuwe ronde: dit antwoord niet meer tonen of bewaren.
      if (ronde !== huidige) return;
      ronde.bezig = false;
      ronde.nagekeken = true;
      byId('open-nakijken').hidden = true;
      toonUitkomst(vraag, uitkomst);
      byId('open-volgende').hidden = false;
    }

    function blok(kop, items, leeg) {
      const kaart = create('div', 'kaart open-blok');
      kaart.append(create('h3', '', kop));
      if (!items.length) { kaart.append(create('p', 'gedimde-tekst', leeg)); return kaart; }
      const lijst = create('ul', 'open-lijst');
      items.forEach(item => lijst.append(create('li', '', item)));
      kaart.append(lijst);
      return kaart;
    }

    function modelBlok(vraag, open) {
      const details = create('details', 'kaart open-model');
      details.open = open;
      details.append(create('summary', '', 'Modelantwoord en kernpunten'));
      details.append(create('p', 'open-model-tekst', vraag.m));
      const lijst = create('ol', 'open-lijst');
      vraag.k.forEach(punt => lijst.append(create('li', '', punt)));
      details.append(create('h3', '', 'Kernpunten'), lijst);
      return details;
    }

    function toonUitkomst(vraag, uitkomst) {
      const doel = byId('open-resultaat');
      const delen = [];
      if (!uitkomst.ok) {
        byId('open-status').textContent = '';
        const melding = create('div', 'kaart open-melding');
        melding.append(create('p', '', uitkomst.melding || 'Comit kan je antwoord nu niet nakijken.'),
          create('p', '', 'Vergelijk je antwoord zelf met het modelantwoord en de kernpunten hieronder. Er komt niets in je foutenlijst.'));
        delen.push(melding, modelBlok(vraag, true));
        doel.replaceChildren(...delen);
        toonBlok(doel);
        return;
      }
      byId('open-status').textContent = 'Nagekeken.';
      delen.push(
        blok('Wat goed was', uitkomst.goed, 'Comit vond nog geen kernpunt dat helemaal klopt.'),
        blok('Wat ontbreekt', uitkomst.ontbreekt, 'Er ontbreekt geen kernpunt.'),
        blok('Wat onjuist is', uitkomst.onjuist.map(item => item.tekst), 'Comit vond niets onjuists.')
      );
      // Per kernpunt: aanwezig, gedeeltelijk of ontbreekt.
      const perPunt = create('div', 'kaart open-blok');
      perPunt.append(create('h3', '', 'Per kernpunt'));
      const lijst = create('ul', 'open-kernpunten');
      vraag.k.forEach((punt, index) => {
        const oordeel = uitkomst.kernpunten.get(`k${index + 1}`);
        const rij = create('li', `open-kernpunt is-${oordeel.status}`);
        rij.append(create('span', 'open-oordeel', STATUSSEN[oordeel.status]), create('span', 'open-punt', punt));
        if (oordeel.toelichting) rij.append(create('span', 'open-toelichting', oordeel.toelichting));
        lijst.append(rij);
      });
      perPunt.append(lijst);
      const tip = create('aside', 'kaart comit open-tip');
      const gezicht = create('span', 'comit-gezicht');
      gezicht.setAttribute('aria-hidden', 'true');
      // Hetzelfde gezicht als Comit op het eindscherm (assets/comit.js).
      if (typeof BES.comitLogo === 'function') gezicht.append(BES.comitLogo(24));
      const tekst = create('div', 'comit-tekst');
      tekst.append(create('p', 'comit-naam', 'Tip van Comit'), create('p', 'comit-tip', uitkomst.tip));
      tip.append(gezicht, tekst);
      delen.push(perPunt, tip);

      // Foutenlijst: ontbrekende kernpunten en kernpunten waar iets onjuists over staat. Gedeeltelijk blijft buiten de lijst.
      const onjuisteIds = new Set(uitkomst.onjuist.map(item => item.kernpunt).filter(Boolean));
      const fout = vraag.k.filter((_, index) => {
        const id = `k${index + 1}`;
        return uitkomst.kernpunten.get(id).status === 'ontbreekt' || onjuisteIds.has(id);
      });
      const goed = vraag.k.filter((punt, index) => uitkomst.kernpunten.get(`k${index + 1}`).status === 'aanwezig' && !fout.includes(punt));
      if (vak.ingelogd()) {
        vak.bewaar(vraag, fout, goed);
        if (fout.length) delen.push(create('p', 'vak-hint', `${fout.length === 1 ? 'Het kernpunt dat ontbrak, staat' : 'De kernpunten die ontbraken, staan'} nu in je foutenlijst.`));
        ronde.ontbrak += fout.length;
      }
      delen.push(modelBlok(vraag, true));
      doel.replaceChildren(...delen);
      toonBlok(doel);
    }

    function volgende() {
      if (!ronde || !ronde.nagekeken) return;
      if (ronde.index < ronde.vragen.length - 1) { ronde.index += 1; toonVraag(); return; }
      ronde.klaar = true;
      byId('open-vraagdeel').hidden = true;
      const balk = byId('open-balk');
      balk.setAttribute('aria-valuenow', String(ronde.vragen.length));
      balk.querySelector('span').style.width = '100%';
      byId('open-einde-kop').textContent = `${ronde.vragen.length === 1 ? 'Je open vraag is' : `Je ${ronde.vragen.length} open vragen zijn`} klaar.`;
      byId('open-einde-tekst').textContent = ronde.ontbrak
        ? 'Wat ontbrak, oefen je later opnieuw via je foutenlijst.'
        : 'Lees de modelantwoorden nog eens rustig na en probeer het later opnieuw uit het hoofd.';
      fade(byId('open-einde'));
      byId('open-einde-kop').focus({ preventScroll: true });
    }

    return { start };
  };
})();
