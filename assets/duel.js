// Duel: verbinding met Supabase (functies, realtime, klok en de volledige spelstand).
// De database is de scheidsrechter. Dit bestand roept alleen de functies aan, leest de stand en houdt de klok gelijk.
// Met ?test=duel laadt duel.html duel-nep.js; staat die er al, dan blijft hij staan.
(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  let testModus = false;
  try { testModus = new URLSearchParams(window.location.search).get('test') === 'duel'; } catch {}
  if (testModus && BES.duel) return;

  const CODE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;
  const ONLINE_MS = 20000;      // online = laatst gezien minder dan 20 seconden geleden
  const LANG_WEG_MS = 60000;    // de maker is zo lang niet gezien: iedereen mag starten en na niemand verder
  const VERS_MS = 25000;        // zo lang na het laatste gelukte ophalen telt laatst_gezien nog als vers
  const HIER_MS = 10000;        // duel_hier elke 10 seconden
  const OPEN_MS = 30000;        // niemand drukt: na 30 seconden
  const SPELING_MS = 1000;      // een antwoord telt nog tot 1 seconde na de deadline (zoals duel_antwoord)
  const ONTHULD_MS = 3000;      // goed of iedereen fout: 3 seconden tonen
  const MARGE_MS = 300;         // verder() net na het moment, de server beslist
  const RPC_LIMIET = 10000;
  const LEES_LIMIET = 8000;
  const TIK_MS = 1000;
  const SNEL_LADEN_MS = 3000;   // zonder realtime of net terug: elke 3 seconden ophalen
  const RUSTIG_LADEN_MS = 15000; // met realtime: toch af en toe alles ophalen
  const TIJD_VELDEN = ['open_sinds', 'deadline', 'onthuld_op', 'aangemaakt', 'verloopt'];

  const slaap = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const mislukt = fout => ({ ok: false, fout });
  const normCode = code => String(code ?? '').trim().toUpperCase();
  const geldigeCode = code => CODE.test(code);
  const heelGetal = waarde => {
    if (Number.isInteger(waarde)) return waarde;
    if (typeof waarde === 'string' && /^\d+$/.test(waarde.trim())) return Number(waarde.trim());
    return NaN;
  };
  const monotoon = () => (window.performance && typeof window.performance.now === 'function') ? window.performance.now() : Date.now();

  // Tijd uit de database naar milliseconden. Werkt met '2026-11-05T10:00:00.123456+00:00', '2026-11-05 10:00:00+00',
  // met een Date en met een getal (seconden of milliseconden). Safari leest niet elk formaat, daarom zelf ontleden.
  function tijd(waarde) {
    if (waarde === null || waarde === undefined || waarde === '') return NaN;
    if (typeof waarde === 'number') return Number.isFinite(waarde) ? (Math.abs(waarde) < 1e11 ? waarde * 1000 : waarde) : NaN;
    if (waarde instanceof Date) return waarde.getTime();
    const tekst = String(waarde).trim();
    if (/^-?\d+(\.\d+)?$/.test(tekst)) return tijd(Number(tekst));
    const delen = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?)(?:[.,](\d+))?\s*(Z|[+-]\d{2}(?::?\d{2})?)?$/i.exec(tekst);
    if (delen) {
      const klokDeel = delen[2].length === 5 ? delen[2] + ':00' : delen[2];
      const milli = ((delen[3] || '') + '000').slice(0, 3);
      let zone = (delen[4] || 'Z').toUpperCase();
      if (zone !== 'Z') {
        const z = /^([+-]\d{2}):?(\d{2})?$/.exec(zone);
        zone = z ? z[1] + ':' + (z[2] || '00') : 'Z';
      }
      const ms = Date.parse(delen[1] + 'T' + klokDeel + '.' + milli + zone);
      if (Number.isFinite(ms)) return ms;
    }
    const ms = Date.parse(tekst);
    return Number.isFinite(ms) ? ms : NaN;
  }

  // Wacht hoogstens zo lang op Supabase; daarna telt het als geen verbinding (het verzoek zelf loopt gewoon af).
  function binnenTijd(belofte, ms) {
    let timer = 0;
    const limiet = new Promise(resolve => {
      timer = window.setTimeout(() => resolve({ data: null, error: { message: 'tijdslimiet', tijdslimiet: true }, status: 0 }), ms);
    });
    const echt = Promise.resolve(belofte).then(
      antwoord => antwoord,
      fout => ({ data: null, error: { message: String(fout?.message || fout || 'fout') }, status: 0 })
    );
    return Promise.race([echt, limiet]).finally(() => window.clearTimeout(timer));
  }

  async function verbinding() {
    const auth = BES.auth;
    if (!auth) return null;
    try { await auth.gereed; } catch {}
    return auth.beschikbaar && auth.client ? auth.client : null;
  }

  async function mijnId() {
    try {
      const gebruiker = await BES.auth?.gebruiker?.();
      return typeof gebruiker?.id === 'string' && gebruiker.id ? gebruiker.id : null;
    } catch { return null; }
  }

  function foutVan(antwoord) {
    const fout = antwoord?.error || {};
    const status = Number(antwoord?.status ?? fout.status) || 0;
    const code = String(fout.code || '');
    const tekst = String(fout.message || '');
    if (fout.tijdslimiet || status === 0 || window.navigator.onLine === false || /failed to fetch|networkerror|load failed|fetch failed|network/i.test(tekst)) return 'geen_verbinding';
    if (status === 401 || code === 'PGRST301' || code === '42501' || /jwt/i.test(tekst)) return 'niet_ingelogd';
    console.warn('Duel: onverwacht antwoord van de database', code || status, tekst.slice(0, 160));
    return 'ongeldig';
  }

  // Eén functie in de database aanroepen. Geeft altijd { ok, ... } terug en gooit nooit.
  async function roep(naam, args, opties = {}) {
    const client = await verbinding();
    if (!client || typeof client.rpc !== 'function') return mislukt('geen_verbinding');
    if (naam !== 'duel_server_tijd' && !(await mijnId())) return mislukt('niet_ingelogd');
    let antwoord;
    try {
      antwoord = await binnenTijd(client.rpc(naam, args || {}), RPC_LIMIET);
    } catch (fout) {
      antwoord = { data: null, error: { message: String(fout?.message || fout) }, status: 0 };
    }
    if (opties.wek) wekVolgers(opties.wek);
    if (antwoord?.error) return mislukt(foutVan(antwoord));
    let data = antwoord?.data;
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch {} }
    if (Array.isArray(data) && data.length === 1) data = data[0];
    if (!data || typeof data !== 'object' || typeof data.ok !== 'boolean') return mislukt('ongeldig');
    if (data.ok === false && typeof data.fout !== 'string') return { ...data, fout: 'ongeldig' };
    return data;
  }

  // Een select met tijdslimiet. Geeft { data, error } terug.
  async function lees(query) {
    try {
      const antwoord = await binnenTijd(query, LEES_LIMIET);
      return { data: antwoord?.data ?? null, error: antwoord?.error || null };
    } catch (fout) {
      return { data: null, error: fout || { message: 'fout' } };
    }
  }

  /* ---------- Klok: verschil met de server ---------- */

  const klok = { verschil: 0, metingen: [], bezig: null, gestart: false, laatste: 0, ankerDatum: Date.now(), ankerMono: monotoon() };

  function kiesBesteMeting() {
    const grens = Date.now() - 10 * 60 * 1000;
    klok.metingen = klok.metingen.filter(meting => meting.op >= grens).slice(-20);
    if (!klok.metingen.length) return;
    // De meting met de kortste heen-en-terugtijd is het nauwkeurigst.
    const beste = klok.metingen.reduce((a, b) => (b.rtt < a.rtt ? b : a));
    const oud = klok.verschil;
    klok.verschil = Math.round(beste.verschil);
    if (Math.abs(klok.verschil - oud) > 50) volgers.forEach(volger => volger.herplan());
  }

  function meetKlok(aantal = 5) {
    klok.gestart = true;
    if (klok.bezig) return klok.bezig;
    klok.bezig = (async () => {
      for (let i = 0; i < aantal; i++) {
        const voor = monotoon();
        const antwoord = await roep('duel_server_tijd', {});
        const na = monotoon();
        const ontvangen = Date.now();
        const server = antwoord?.ok ? tijd(antwoord.nu) : NaN;
        if (Number.isFinite(server)) {
          const rtt = Math.max(0, na - voor);
          klok.metingen.push({ rtt, verschil: server + rtt / 2 - ontvangen, op: ontvangen });
        } else if (antwoord?.fout === 'geen_verbinding') {
          break;
        }
        if (i < aantal - 1) await slaap(120);
      }
      klok.laatste = Date.now();
      kiesBesteMeting();
    })().catch(() => {}).finally(() => { klok.bezig = null; });
    return klok.bezig;
  }

  // Sprong in de klok van het toestel (tijd aangepast, of de telefoon sliep): oude metingen kloppen niet meer.
  function controleerKlokSprong() {
    const datum = Date.now();
    const mono = monotoon();
    const verschil = (datum - klok.ankerDatum) - (mono - klok.ankerMono);
    klok.ankerDatum = datum;
    klok.ankerMono = mono;
    if (Math.abs(verschil) <= 1500) return false;
    klok.metingen = [];
    if (klok.gestart) meetKlok(3);
    volgers.forEach(volger => volger.herplan());
    return true;
  }

  function nu() {
    if (!klok.gestart) meetKlok(5);
    return Date.now() + klok.verschil;
  }

  /* ---------- Volgen: realtime en de volledige stand ---------- */

  const volgers = new Set();

  function wekVolgers(code) {
    volgers.forEach(volger => { if (volger.code === code) volger.herlaad(20); });
  }

  function maakVolger(code, bijWijziging) {
    let gestopt = false;
    let ik = null;
    let kamer = null;
    let deelnemers = [];       // { speler, naam, punten, binnen, gezien }
    let vragen = {};
    let vragenCompleet = false;
    let pogingen = [];
    let geladen = false;
    let laadOk = false;
    let versOp = 0;            // servertijd van het laatste gelukte ophalen van de deelnemers
    let laatsteLaad = 0;
    let snelTot = 0;
    let vorigeJson = '';
    let wasDeelnemer = false;

    let laadTimer = 0;
    let laadSinds = 0;
    let laadBezig = false;
    let laadOpnieuw = false;

    let kanaal = null;
    let kanaalNr = 0;
    let kanaalOk = false;
    let kanaalPoging = 0;
    let kanaalHerstel = 0;
    let kanaalOpent = false;

    let verderTimer = 0;
    let verderSleutel = '';
    let verderPogingen = 0;

    let hierTimer = 0;
    let tikTimer = 0;

    // Verbonden = ophalen lukt. Realtime (kanaalOk) kiest alleen hoe vaak we zelf ophalen: zonder realtime
    // werkt het spel gewoon via ophalen elke 3 seconden, bv. op een netwerk dat websockets blokkeert.
    function isVerbonden() {
      return window.navigator.onLine !== false && laadOk;
    }

    function bouwStaat() {
      const tijdNu = nu();
      // Lang weg alleen op verse gegevens. Na slapen of zonder net blijft deze klok staan op het laatste ophalen
      // (+ VERS_MS): een oude laatst_gezien maakt de maker dan niet ineens "weg". Na het volgende ophalen klopt het weer.
      const peil = Math.min(tijdNu, versOp + VERS_MS);
      const lijst = {};
      Object.keys(vragen).forEach(nr => {
        const vraag = vragen[nr];
        lijst[nr] = { vraag: vraag.vraag, opties: vraag.opties.slice(), hoofdstuk: vraag.hoofdstuk };
      });
      return {
        kamer: kamer ? { ...kamer } : null,
        deelnemers: deelnemers.map(d => ({
          speler: d.speler,
          naam: d.naam,
          punten: d.punten,
          online: Number.isFinite(d.gezien) && tijdNu - d.gezien < ONLINE_MS,
          lang_weg: Number.isFinite(d.gezien) && peil - d.gezien >= LANG_WEG_MS
        })),
        vragen: lijst,
        pogingen: pogingen.map(p => ({ nr: p.nr, speler: p.speler, keuze: p.keuze, goed: p.goed })),
        ik,
        verbonden: isVerbonden()
      };
    }

    // Altijd de volledige stand doorgeven, en alleen als er iets veranderd is. Elke keer een nieuwe kopie.
    function stuur() {
      if (gestopt || !geladen) return;
      let json = '';
      try { json = JSON.stringify(bouwStaat()); } catch { return; }
      if (json === vorigeJson) return;
      vorigeJson = json;
      try { bijWijziging(JSON.parse(json)); } catch (fout) { console.error(fout); }
    }

    function leegMaken() {
      kamer = null;
      deelnemers = [];
      vragen = {};
      vragenCompleet = false;
      pogingen = [];
      wasDeelnemer = false;
      wisVerder();
    }

    function kamerRij(rij) {
      const kopie = { ...rij };
      TIJD_VELDEN.forEach(veld => {
        if (kopie[veld] === null || kopie[veld] === undefined) return;
        const ms = tijd(kopie[veld]);
        if (Number.isFinite(ms)) kopie[veld] = new Date(ms).toISOString();
      });
      return kopie;
    }

    function deelnemerRij(rij) {
      return {
        speler: String(rij.speler || ''),
        naam: String(rij.naam ?? ''),
        punten: Number(rij.punten) || 0,
        binnen: tijd(rij.binnen),
        gezien: tijd(rij.laatst_gezien)
      };
    }

    /* Ophalen: eerst de kamer, daarna deelnemers en pogingen. Zo horen punten en pogingen altijd minstens bij die kamer. */

    function herlaad(wacht = 80) {
      if (gestopt) return;
      const nuMono = monotoon();
      if (!laadTimer) laadSinds = nuMono;
      else {
        if (nuMono - laadSinds > 400) return; // al lang genoeg uitgesteld, de geplande lading komt zo
        window.clearTimeout(laadTimer);
      }
      laadTimer = window.setTimeout(() => { laadTimer = 0; laad(); }, Math.max(0, wacht));
    }

    async function laad() {
      if (gestopt) return;
      if (laadBezig) { laadOpnieuw = true; return; }
      laadBezig = true;
      laatsteLaad = Date.now();
      try {
        await haalStaat();
      } catch {
        laadOk = false;
        geladen = true;
        stuur();
      } finally {
        laadBezig = false;
        if (laadOpnieuw && !gestopt) { laadOpnieuw = false; herlaad(0); }
      }
    }

    async function haalStaat() {
      const client = await verbinding();
      const id = await mijnId();
      if (gestopt) return;
      const andereSpeler = id !== ik;
      ik = id;
      if (!client || typeof client.from !== 'function') {
        laadOk = false;
        geladen = true;
        stuur();
        return;
      }
      if (!ik || !geldigeCode(code)) {
        sluitKanaal();
        leegMaken();
        laadOk = true;
        geladen = true;
        stuur();
        return;
      }
      if (andereSpeler || (!kanaal && !kanaalHerstel && !kanaalOpent)) openKanaal();

      const k = await lees(client.from('duel_kamers').select('*').eq('code', code).maybeSingle());
      if (gestopt || ik !== id) return;
      if (k.error) { laadMislukt(); return; }
      if (!k.data) {
        // Geen deelnemer (of de kamer bestaat niet): de kamer is dan niet leesbaar.
        leegMaken();
        laadOk = true;
        geladen = true;
        stuur();
        return;
      }
      const [d, p, q] = await Promise.all([
        lees(client.from('duel_deelnemers').select('speler,naam,punten,binnen,laatst_gezien').eq('kamer', code)),
        lees(client.from('duel_pogingen').select('nr,speler,keuze,goed,op').eq('kamer', code)),
        vragenCompleet ? Promise.resolve(null) : lees(client.from('duel_vragen').select('nr,vraag,opties,hoofdstuk').eq('kamer', code).order('nr', { ascending: true }))
      ]);
      if (gestopt || ik !== id) return;
      if (d.error || p.error || (q && q.error)) { laadMislukt(); return; }

      kamer = kamerRij(k.data);
      versOp = nu();
      deelnemers = (Array.isArray(d.data) ? d.data : [])
        .filter(rij => rij && rij.speler)
        .map(deelnemerRij)
        .sort((a, b) => ((a.binnen || 0) - (b.binnen || 0)) || (a.speler < b.speler ? -1 : a.speler > b.speler ? 1 : 0));
      pogingen = (Array.isArray(p.data) ? p.data : [])
        .filter(rij => rij && rij.speler)
        .map(rij => ({
          nr: Number(rij.nr),
          speler: String(rij.speler),
          keuze: rij.keuze === null || rij.keuze === undefined ? null : Number(rij.keuze),
          goed: rij.goed === true,
          op: tijd(rij.op)
        }))
        .sort((a, b) => ((a.op || 0) - (b.op || 0)) || (a.nr - b.nr));
      if (q) {
        const nieuw = {};
        (Array.isArray(q.data) ? q.data : []).forEach(rij => {
          const nr = Number(rij?.nr);
          if (!Number.isInteger(nr)) return;
          nieuw[nr] = {
            vraag: String(rij.vraag ?? ''),
            opties: Array.isArray(rij.opties) ? rij.opties.map(optie => String(optie ?? '')) : [],
            hoofdstuk: rij.hoofdstuk === null || rij.hoofdstuk === undefined ? '' : String(rij.hoofdstuk)
          };
        });
        vragen = nieuw;
        const aantal = Object.keys(nieuw).length;
        vragenCompleet = aantal > 0 && aantal >= (Number(kamer.aantal) || 0);
      }
      laadOk = true;
      geladen = true;
      const eersteKeer = !wasDeelnemer;
      wasDeelnemer = true;
      stuur();
      plan();
      if (eersteKeer) hier();
    }

    function laadMislukt() {
      laadOk = false;
      geladen = true;
      stuur();
    }

    /* Realtime: één kanaal per kamer, met de drie tabellen. */

    function sluitKanaal() {
      kanaalNr++;
      kanaalOk = false;
      window.clearTimeout(kanaalHerstel);
      kanaalHerstel = 0;
      const oud = kanaal;
      kanaal = null;
      if (!oud) return;
      try {
        const client = BES.auth?.client;
        const klaar = client?.removeChannel ? client.removeChannel(oud) : oud.unsubscribe?.();
        if (klaar && typeof klaar.catch === 'function') klaar.catch(() => {});
      } catch {}
    }

    async function openKanaal() {
      sluitKanaal();
      const nr = kanaalNr;
      if (gestopt || !ik || !geldigeCode(code)) return;
      const client = BES.auth?.client;
      if (!client || typeof client.channel !== 'function') { planKanaalHerstel(); return; }
      // Realtime moet met de sessie van deze speler luisteren, anders laat de database niets door.
      kanaalOpent = true;
      try {
        const sessie = await client.auth?.getSession?.();
        const token = sessie?.data?.session?.access_token;
        if (token && client.realtime?.setAuth) {
          const klaar = client.realtime.setAuth(token);
          if (klaar && typeof klaar.catch === 'function') klaar.catch(() => {});
        }
      } catch {}
      kanaalOpent = false;
      if (gestopt || nr !== kanaalNr) return;
      let nieuw = null;
      try {
        const naam = 'duel-' + code + '-' + Math.random().toString(36).slice(2, 8);
        nieuw = client.channel(naam)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'duel_kamers', filter: 'code=eq.' + code }, () => melding(nr))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'duel_deelnemers', filter: 'kamer=eq.' + code }, bericht => meldingDeelnemer(nr, bericht))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'duel_pogingen', filter: 'kamer=eq.' + code }, () => melding(nr));
        kanaal = nieuw;
        nieuw.subscribe((status, fout) => kanaalStatus(nr, status, fout));
      } catch {
        if (nieuw && !kanaal) kanaal = nieuw;
        if (nr === kanaalNr) { kanaalOk = false; stuur(); planKanaalHerstel(); }
      }
    }

    function kanaalStatus(nr, status) {
      if (gestopt || nr !== kanaalNr) return;
      if (status === 'SUBSCRIBED') {
        kanaalOk = true;
        kanaalPoging = 0;
        window.clearTimeout(kanaalHerstel);
        kanaalHerstel = 0;
        // (Weer) verbonden: alles opnieuw ophalen, er kan intussen iets gebeurd zijn.
        herlaad(0);
        stuur();
        return;
      }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        kanaalOk = false;
        stuur();
        planKanaalHerstel();
      }
    }

    function planKanaalHerstel() {
      if (gestopt || kanaalHerstel) return;
      const wacht = Math.min(30000, 2000 * 2 ** Math.min(kanaalPoging, 4));
      kanaalPoging++;
      kanaalHerstel = window.setTimeout(() => {
        kanaalHerstel = 0;
        if (gestopt || kanaalOk) return;
        if (window.navigator.onLine === false) { planKanaalHerstel(); return; }
        openKanaal();
      }, wacht);
    }

    function melding(nr) {
      if (gestopt || nr !== kanaalNr) return;
      herlaad();
    }

    // duel_hier verandert alleen laatst_gezien: dat nemen we meteen over, zonder alles op te halen.
    // Elke andere wijziging (punten, nieuwe speler, weg) haalt de volledige stand opnieuw op.
    function meldingDeelnemer(nr, bericht) {
      if (gestopt || nr !== kanaalNr) return;
      const nieuw = bericht?.new;
      if (bericht?.eventType === 'UPDATE' && nieuw && typeof nieuw === 'object' && !(bericht.errors && bericht.errors.length)) {
        const deelnemer = deelnemers.find(d => d.speler === nieuw.speler);
        if (deelnemer && 'punten' in nieuw && 'naam' in nieuw
          && (Number(nieuw.punten) || 0) === deelnemer.punten && String(nieuw.naam ?? '') === deelnemer.naam) {
          const gezien = tijd(nieuw.laatst_gezien);
          if (Number.isFinite(gezien)) {
            if (!(gezien <= deelnemer.gezien)) deelnemer.gezien = gezien;
            stuur();
            return;
          }
        }
      }
      herlaad();
    }

    /* Klok: zelf verder() inplannen op deadline + 1 s, open_sinds + 30 s en onthuld_op + 3 s (telkens + 300 ms). */

    function wisVerder() {
      window.clearTimeout(verderTimer);
      verderTimer = 0;
      verderSleutel = '';
      verderPogingen = 0;
    }

    function doelMoment() {
      if (!kamer) return NaN;
      // Zelfde speling als duel_antwoord: anders wint verder() het van een antwoord dat net na de deadline binnenkomt.
      if (kamer.status === 'antwoord') return tijd(kamer.deadline) + SPELING_MS;
      if (kamer.status === 'open') return tijd(kamer.open_sinds) + OPEN_MS;
      if (kamer.status === 'onthulling' && (kamer.uitkomst === 'goed' || kamer.uitkomst === 'iedereen_fout')) return tijd(kamer.onthuld_op) + ONTHULD_MS;
      return NaN; // wachtkamer, einde, of niemand (dan wacht het spel op "Volgende vraag")
    }

    function plan() {
      if (gestopt) return;
      const doel = doelMoment();
      if (!Number.isFinite(doel)) { wisVerder(); return; }
      const sleutel = [kamer.versie, kamer.status, kamer.vraag_nr, doel].join('|');
      if (sleutel === verderSleutel && verderTimer) return;
      if (sleutel !== verderSleutel) {
        verderSleutel = sleutel;
        verderPogingen = 0;
      } else if (verderPogingen) {
        return; // zelfde stand, er loopt al een nieuwe poging of we zijn gestopt met proberen
      }
      window.clearTimeout(verderTimer);
      const wacht = Math.min(2147483000, Math.max(0, doel + MARGE_MS - nu()));
      verderTimer = window.setTimeout(roepVerder, wacht);
    }

    function herplan() {
      if (gestopt) return;
      window.clearTimeout(verderTimer);
      verderTimer = 0;
      verderSleutel = '';
      plan();
    }

    async function roepVerder() {
      verderTimer = 0;
      if (gestopt || !kamer) return;
      const sleutel = verderSleutel;
      verderPogingen++;
      const antwoord = await roep('duel_verder', { p_code: code }, { wek: code });
      if (gestopt || sleutel !== verderSleutel || verderTimer) return;
      // Nog dezelfde stand na het ophalen? Dan was de server nog niet zover: rustig opnieuw proberen.
      // Geen verbinding telt niet mee voor het maximum: zo blijft het om de 5 seconden proberen tot het net terug is.
      if (antwoord && antwoord.fout === 'geen_verbinding') verderPogingen = Math.min(verderPogingen, 5);
      // Opgegeven of 20 keer geprobeerd: terug() (online, zichtbaar) en bijAuth plannen opnieuw met herplan().
      const opgeven = antwoord && antwoord.ok === false && ['verlopen', 'bestaat_niet', 'geen_deelnemer', 'niet_ingelogd'].includes(antwoord.fout);
      if (opgeven || verderPogingen >= 20) return;
      verderTimer = window.setTimeout(roepVerder, Math.min(5000, 1000 * verderPogingen));
    }

    /* Aanwezig: duel_hier elke 10 seconden. */

    function hier() {
      if (gestopt || !ik || !kamer || !geldigeCode(code)) return;
      roep('duel_hier', { p_code: code });
    }

    function tik() {
      if (gestopt) return;
      if (controleerKlokSprong()) herlaad(0);
      const tijdNu = Date.now();
      const client = BES.auth?.client;
      if (kanaalOk && client?.realtime && typeof client.realtime.isConnected === 'function' && !client.realtime.isConnected()) {
        kanaalOk = false;
        planKanaalHerstel();
      }
      const snel = !kanaalOk || !laadOk || tijdNu < snelTot;
      if (tijdNu - laatsteLaad >= (snel ? SNEL_LADEN_MS : RUSTIG_LADEN_MS)) herlaad(0);
      if (klok.gestart && !klok.bezig && tijdNu - klok.laatste > 60000) meetKlok(1);
      stuur(); // online-stippen kloppen ook als er even niets binnenkomt
      plan();
    }

    function terug() {
      if (gestopt) return;
      snelTot = Date.now() + 30000;
      stuur();
      herlaad(0);
      hier();
      meetKlok(2);
      herplan(); // ook als verder() het eerder had opgegeven
      if (ik && geldigeCode(code) && !kanaalOk && !kanaalOpent && kanaal?.state !== 'joining') openKanaal();
    }

    const bijOnline = () => terug();
    const bijOffline = () => stuur();
    const bijZicht = () => { if (document.visibilityState === 'visible') terug(); };
    const bijPagina = event => { if (event.persisted) terug(); };
    const bijAuth = () => { herlaad(0); herplan(); };

    function begin() {
      window.addEventListener('online', bijOnline);
      window.addEventListener('offline', bijOffline);
      document.addEventListener('visibilitychange', bijZicht);
      window.addEventListener('pageshow', bijPagina);
      window.addEventListener('bes:auth', bijAuth);
      hierTimer = window.setInterval(hier, HIER_MS);
      tikTimer = window.setInterval(tik, TIK_MS);
      if (!klok.gestart) meetKlok(5);
      laad();
    }

    function stop() {
      if (gestopt) return;
      gestopt = true;
      volgers.delete(volger);
      window.clearTimeout(laadTimer);
      window.clearTimeout(verderTimer);
      window.clearInterval(hierTimer);
      window.clearInterval(tikTimer);
      laadTimer = verderTimer = hierTimer = tikTimer = 0;
      sluitKanaal();
      window.removeEventListener('online', bijOnline);
      window.removeEventListener('offline', bijOffline);
      document.removeEventListener('visibilitychange', bijZicht);
      window.removeEventListener('pageshow', bijPagina);
      window.removeEventListener('bes:auth', bijAuth);
    }

    const volger = { code, herlaad, herplan, begin, stop };
    return volger;
  }

  function volg(code, bijWijziging) {
    const volger = maakVolger(normCode(code), typeof bijWijziging === 'function' ? bijWijziging : () => {});
    volgers.add(volger);
    volger.begin();
    // stop() werkt als functie en als methode: const stop = volg(...); stop() of volg(...).stop()
    const stop = () => volger.stop();
    stop.stop = stop;
    return stop;
  }

  /* ---------- De functies ---------- */

  function metCode(code, doe) {
    const schoon = normCode(code);
    if (!geldigeCode(schoon)) return Promise.resolve(mislukt('bestaat_niet'));
    return doe(schoon);
  }

  function metNr(nr) {
    const getal = heelGetal(nr);
    return Number.isInteger(getal) && getal >= 1 ? getal : NaN;
  }

  BES.duel = {
    async maak({ vak, hoofdstukken, vragen } = {}) {
      if (typeof vak !== 'string' || !vak || !Array.isArray(hoofdstukken) || !Array.isArray(vragen)) return mislukt('ongeldig');
      return roep('duel_maak', { p_vak: vak, p_hoofdstukken: hoofdstukken, p_vragen: vragen });
    },
    async doeMee(code) {
      return metCode(code, c => roep('duel_doe_mee', { p_code: c }, { wek: c }));
    },
    async start(code) {
      return metCode(code, c => roep('duel_start', { p_code: c }, { wek: c }));
    },
    async druk(code, nr) {
      return metCode(code, c => {
        const n = metNr(nr);
        return Number.isNaN(n) ? mislukt('ongeldig') : roep('duel_druk', { p_code: c, p_nr: n }, { wek: c });
      });
    },
    async antwoord(code, nr, keuze) {
      return metCode(code, c => {
        const n = metNr(nr);
        const k = keuze === null ? null : heelGetal(keuze);
        if (Number.isNaN(n) || (k !== null && !(Number.isInteger(k) && k >= 0))) return mislukt('ongeldig');
        return roep('duel_antwoord', { p_code: c, p_nr: n, p_keuze: k }, { wek: c });
      });
    },
    async verder(code) {
      return metCode(code, c => roep('duel_verder', { p_code: c }, { wek: c }));
    },
    async volgende(code, nr) {
      return metCode(code, c => {
        const n = metNr(nr);
        return Number.isNaN(n) ? mislukt('ongeldig') : roep('duel_volgende', { p_code: c, p_nr: n }, { wek: c });
      });
    },
    async uitleg(code, nr) {
      return metCode(code, c => {
        const n = metNr(nr);
        return Number.isNaN(n) ? mislukt('ongeldig') : roep('duel_uitleg', { p_code: c, p_nr: n });
      });
    },
    async opnieuw(code, vragen) {
      return metCode(code, c => (Array.isArray(vragen)
        ? roep('duel_opnieuw', { p_code: c, p_vragen: vragen }, { wek: c })
        : mislukt('ongeldig')));
    },
    volg,
    nu
  };
})();
