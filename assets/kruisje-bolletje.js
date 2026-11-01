(() => {
  'use strict';

  // Jij speelt altijd met kruisjes, de robot met bolletjes. Wie begint wisselt na elk spel.
  const JIJ = 'X';
  const ROBOT = 'O';
  const NIVEAUS = ['makkelijk', 'normaal', 'onmogelijk'];
  const VELDEN = ['jij', 'gelijk', 'robot'];
  const SLEUTEL_NIVEAU = 'bes_kruisje_niveau';
  const SLEUTEL_STAND = 'bes_kruisje_stand';
  const UITLEG = {
    makkelijk: 'Op Makkelijk let de robot nog niet goed op. Ideaal om op te warmen.',
    normaal: 'Op Normaal pakt de robot elke kans en blokkeert hij je, maar soms gokt hij.',
    onmogelijk: 'Op Onmogelijk rekent de robot elke zet vooruit. Het beste wat je kan halen is gelijkspel.'
  };
  const KRUIS = '<svg class="kb-teken kb-kruis" viewBox="0 0 100 100" aria-hidden="true"><line x1="18" y1="18" x2="82" y2="82" pathLength="1"/><line x1="82" y1="18" x2="18" y2="82" pathLength="1"/></svg>';
  const BOL = '<svg class="kb-teken kb-bol" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="33" pathLength="1"/></svg>';
  const FOUT = 'Het spel kan niet laden. Vernieuw de pagina.';

  const el = id => document.getElementById(id);
  let bordEl = null, statusEl = null, statusTekst = null, vakken = [];
  let niveau = 'normaal';
  let stand = legeStand();
  let bord = Array(9).fill(null);
  let beurt = JIJ, klaar = true, jijBegint = true, wacht = null, nieuwTimer = null, toetsVak = null;

  function legeStand() {
    const leeg = {};
    NIVEAUS.forEach(naam => { leeg[naam] = { jij: 0, gelijk: 0, robot: 0 }; });
    return leeg;
  }

  // Alleen gehele getallen vanaf 0 tellen, de rest wordt 0.
  const geldig = waarde => Number.isSafeInteger(waarde) && waarde >= 0 ? waarde : 0;

  // Opslaan mag mislukken (privévenster, file://): dan werkt het spel gewoon zonder.
  function leesStand() {
    const nieuw = legeStand();
    let opgeslagen = null;
    try { opgeslagen = JSON.parse(window.localStorage.getItem(SLEUTEL_STAND)); } catch {}
    if (!opgeslagen || typeof opgeslagen !== 'object') return nieuw;
    NIVEAUS.forEach(naam => {
      const rij = opgeslagen[naam];
      if (!rij || typeof rij !== 'object') return;
      VELDEN.forEach(veld => { nieuw[naam][veld] = geldig(rij[veld]); });
    });
    return nieuw;
  }

  // Per veld telt het hoogste getal, zodat een ouder tabblad de stand nooit verlaagt.
  function voegStandSamen() {
    const opgeslagen = leesStand();
    NIVEAUS.forEach(naam => VELDEN.forEach(veld => {
      stand[naam][veld] = Math.max(stand[naam][veld], opgeslagen[naam][veld]);
    }));
  }

  function bewaarStand() {
    try { window.localStorage.setItem(SLEUTEL_STAND, JSON.stringify(stand)); } catch {}
  }

  function leesNiveau() {
    let opgeslagen = null;
    try { opgeslagen = window.localStorage.getItem(SLEUTEL_NIVEAU); } catch {}
    return NIVEAUS.includes(opgeslagen) ? opgeslagen : 'normaal';
  }

  function bewaarNiveau() {
    try { window.localStorage.setItem(SLEUTEL_NIVEAU, niveau); } catch {}
  }

  const robotKlaar = () => !!window.Robot && typeof window.Robot.kiesZet === 'function' && typeof window.Robot.uitslag === 'function';
  const standRijen = () => [...document.querySelectorAll('.kb-tabel tbody tr[data-niveau]')];

  function zetStatus(tekst, beurtVan, uitslag) {
    statusTekst.textContent = tekst;
    if (beurtVan) statusEl.dataset.beurt = beurtVan; else delete statusEl.dataset.beurt;
    if (uitslag) statusEl.dataset.uitslag = uitslag; else delete statusEl.dataset.uitslag;
  }

  function tekenBord() {
    vakken.forEach((vak, i) => {
      const teken = bord[i];
      vak.disabled = klaar || beurt !== JIJ || teken !== null;
      vak.setAttribute('aria-label', 'Vak ' + (i + 1) + ', ' + (teken === JIJ ? 'kruisje' : teken === ROBOT ? 'bolletje' : 'leeg'));
    });
  }

  function tekenNiveau() {
    document.querySelectorAll('.kb-niveau').forEach(knop => knop.setAttribute('aria-pressed', String(knop.dataset.niveau === niveau)));
    const uitleg = el('kb-uitleg');
    if (uitleg) uitleg.textContent = UITLEG[niveau];
  }

  function tekenStand() {
    standRijen().forEach(rij => {
      const naam = rij.dataset.niveau;
      if (!stand[naam]) return;
      VELDEN.forEach(veld => {
        const cel = rij.querySelector('[data-veld="' + veld + '"]');
        if (cel) cel.textContent = String(stand[naam][veld]);
      });
      if (naam === niveau) rij.setAttribute('aria-current', 'true');
      else rij.removeAttribute('aria-current');
    });
  }

  // De rij van het gespeelde niveau licht even op.
  function markeerRij(naam) {
    clearTimeout(nieuwTimer);
    standRijen().forEach(rij => rij.classList.remove('kb-nieuw'));
    const rij = standRijen().find(item => item.dataset.niveau === naam);
    if (!rij) return;
    void rij.offsetWidth;
    rij.classList.add('kb-nieuw');
    nieuwTimer = setTimeout(() => rij.classList.remove('kb-nieuw'), 1200);
  }

  function toonFout() {
    clearTimeout(wacht);
    wacht = null;
    klaar = true;
    zetStatus(FOUT);
    tekenBord();
  }

  // Een gevuld vak gaat dicht en verliest zo de focus. Wie met het toetsenbord speelt,
  // krijgt de focus terug op een leeg vak, of op Nieuw spel als het spel voorbij is.
  function herstelFocus() {
    const vorige = toetsVak;
    toetsVak = null;
    if (vorige === null) return;
    const actief = document.activeElement;
    if (actief && actief !== document.body && !vakken.includes(actief)) return;
    let doel = el('kb-opnieuw');
    if (!klaar) {
      for (let stap = 1; stap <= 9; stap += 1) {
        const i = (vorige + stap) % 9;
        if (bord[i] === null) { doel = vakken[i]; break; }
      }
    }
    if (doel) doel.focus();
  }

  function nieuwSpel() {
    clearTimeout(wacht);
    wacht = null;
    toetsVak = null;
    bord = Array(9).fill(null);
    vakken.forEach(vak => { vak.replaceChildren(); vak.classList.remove('kb-lijn'); });
    delete bordEl.dataset.winnaar;
    if (!robotKlaar()) { toonFout(); return; }
    klaar = false;
    beurt = jijBegint ? JIJ : ROBOT;
    if (beurt === ROBOT) robotZet();
    else {
      zetStatus('Jij begint. Jij speelt met kruisjes.', 'jij');
      tekenBord();
    }
  }

  function zet(i, teken) {
    bord[i] = teken;
    vakken[i].innerHTML = teken === JIJ ? KRUIS : BOL;
    const uitslag = window.Robot.uitslag(bord);
    if (uitslag) { einde(uitslag); return; }
    beurt = teken === JIJ ? ROBOT : JIJ;
    if (beurt === ROBOT) robotZet();
    else {
      zetStatus('Jij bent aan zet.', 'jij');
      tekenBord();
      herstelFocus();
    }
  }

  function klikVak(i, event) {
    if (klaar || beurt !== JIJ || bord[i] !== null) return;
    // Enter of spatie op een knop geeft een klik met detail 0.
    toetsVak = event && event.detail === 0 ? i : null;
    zet(i, JIJ);
  }

  // Korte pauze zodat het lijkt alsof de robot nadenkt.
  function robotZet() {
    zetStatus('De robot denkt na.', 'robot');
    tekenBord();
    wacht = setTimeout(() => {
      wacht = null;
      let keuze = null;
      try { keuze = window.Robot.kiesZet(bord, ROBOT, niveau); } catch {}
      if (!Number.isInteger(keuze) || keuze < 0 || keuze > 8 || bord[keuze] !== null) { toonFout(); return; }
      zet(keuze, ROBOT);
    }, 420 + Math.round(Math.random() * 280));
  }

  function einde(uitslag) {
    klaar = true;
    jijBegint = !jijBegint;
    const wie = uitslag.winnaar === JIJ ? 'jij' : uitslag.winnaar === ROBOT ? 'robot' : 'gelijk';
    voegStandSamen();
    stand[niveau][wie] += 1;
    bewaarStand();
    if (uitslag.lijn) uitslag.lijn.forEach(i => vakken[i].classList.add('kb-lijn'));
    bordEl.dataset.winnaar = wie;
    const volgende = jijBegint ? 'Volgende keer begin jij.' : 'Volgende keer begint de robot.';
    const tekst = {
      jij: niveau === 'onmogelijk' ? 'Jij wint! Dat zou eigenlijk niet kunnen.' : 'Jij wint! Durf je een moeilijker niveau aan?',
      gelijk: niveau === 'onmogelijk' ? 'Gelijkspel. Beter kan niemand tegen deze robot.' : 'Gelijkspel.',
      robot: 'De robot wint. Nog een keer?'
    }[wie];
    zetStatus(tekst + ' ' + volgende, null, wie);
    tekenBord();
    tekenStand();
    markeerRij(niveau);
    herstelFocus();
  }

  function start() {
    bordEl = el('kb-bord');
    statusEl = el('kb-status');
    statusTekst = el('kb-status-tekst');
    if (!bordEl || !statusEl || !statusTekst) return;

    vakken = Array.from({ length: 9 }, (_, i) => {
      const vak = document.createElement('button');
      vak.type = 'button';
      vak.className = 'kb-vak';
      vak.setAttribute('aria-label', 'Vak ' + (i + 1) + ', leeg');
      vak.addEventListener('click', event => klikVak(i, event));
      return vak;
    });
    bordEl.replaceChildren(...vakken);

    niveau = leesNiveau();
    stand = leesStand();
    tekenNiveau();
    tekenStand();

    // Een ander niveau kiezen start een nieuw spel.
    document.querySelectorAll('.kb-niveau').forEach(knop => {
      knop.addEventListener('click', () => {
        const keuze = knop.dataset.niveau;
        if (!NIVEAUS.includes(keuze) || keuze === niveau) return;
        niveau = keuze;
        bewaarNiveau();
        tekenNiveau();
        tekenStand();
        nieuwSpel();
      });
    });
    const opnieuw = el('kb-opnieuw');
    if (opnieuw) opnieuw.addEventListener('click', nieuwSpel);

    // Stand gelijk houden met een ander tabblad.
    window.addEventListener('storage', event => {
      if (event.key !== SLEUTEL_STAND) return;
      voegStandSamen();
      tekenStand();
    });

    nieuwSpel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
