// Over jezelf (optioneel): het formulier na het aanmelden en op het profiel, en de weergave op het profiel.
// Alles is platte tekst via textContent; auth.js maakt de waarden schoon voordat ze bewaard worden.
(() => {
  'use strict';

  const JAREN = [['1ba', '1ste bachelor'], ['2ba', '2de bachelor'], ['3ba', '3de bachelor'], ['master', 'Master'], ['anders', 'Anders']];
  const MAX_TEKST = 300;
  let volgnummer = 0;

  const maak = (tag, klasse, tekst) => {
    const element = document.createElement(tag);
    if (klasse) element.className = klasse;
    if (tekst !== undefined) element.textContent = tekst;
    return element;
  };
  const jaarNaam = code => (JAREN.find(([waarde]) => waarde === code) || [])[1] || '';

  // Keuzerondjes, als knopjes (jaar) of als twee kaartjes (wie mag het lezen).
  function keuzes(naam, titel, opties, gekozen, klasse) {
    const groep = maak('fieldset', 'over-groep ' + klasse);
    groep.append(maak('legend', '', titel));
    const rij = maak('div', 'over-keuzes');
    opties.forEach(([waarde, kop, uitleg]) => {
      const label = maak('label', 'over-keuze');
      const input = maak('input');
      input.type = 'radio';
      input.name = naam;
      input.value = waarde;
      input.checked = waarde === gekozen;
      const tekst = maak('span', 'over-keuze-tekst');
      tekst.append(maak('span', 'over-keuze-kop', kop));
      if (uitleg) tekst.append(maak('span', 'over-keuze-uitleg', uitleg));
      label.append(input, tekst);
      rij.append(label);
    });
    groep.append(rij);
    return groep;
  }

  // opties: waarde (opgeslagen gegevens), opslaanTekst, tweede ({ tekst, href } of { tekst, bijKlik }),
  // leegMag (alles leeg opslaan wist het), wissen (toont Alles weghalen; bewaart dan null),
  // opslaan (async functie die het object bewaart, of null om alles weg te halen).
  function formulier(opties) {
    const n = ++volgnummer;
    const waarde = opties.waarde || {};
    const form = maak('form', 'over-form');
    form.noValidate = true;

    const studieVeld = maak('div', 'over-veld');
    const studieLabel = maak('label', '', 'Wat studeer je?');
    studieLabel.htmlFor = 'over-studie-' + n;
    const studie = maak('input', 'auth-input');
    studie.id = studieLabel.htmlFor;
    studie.type = 'text';
    studie.maxLength = 60;
    studie.placeholder = 'Bijvoorbeeld Psychologie aan de VUB';
    studie.autocomplete = 'off';
    studie.value = waarde.studie || '';
    studieVeld.append(studieLabel, studie);

    const jaren = keuzes('over-jaar-' + n, 'In welk jaar zit je?', JAREN, waarde.jaar, 'is-jaren');

    const tekstVeld = maak('div', 'over-veld');
    const tekstLabel = maak('label', '', 'Vertel iets over jezelf');
    tekstLabel.htmlFor = 'over-tekst-' + n;
    const tekst = maak('textarea', 'auth-input over-tekst');
    tekst.id = tekstLabel.htmlFor;
    tekst.maxLength = MAX_TEKST;
    tekst.rows = 4;
    tekst.placeholder = 'Bijvoorbeeld waarom je hier oefent, wat je graag doet of wat je later wil worden.';
    tekst.value = waarde.tekst || '';
    const teller = maak('p', 'auth-help over-teller');
    teller.id = 'over-teller-' + n;
    tekst.setAttribute('aria-describedby', teller.id);
    const telBij = () => {
      const rest = Math.max(0, MAX_TEKST - tekst.value.length);
      teller.textContent = 'Nog ' + rest + (rest === 1 ? ' teken' : ' tekens');
    };
    tekst.addEventListener('input', telBij);
    telBij();
    tekstVeld.append(tekstLabel, tekst, teller);

    const wie = keuzes('over-wie-' + n, 'Wie mag dit lezen?', [
      ['berie', 'Alleen Berie', 'Niemand anders ziet het.'],
      ['openbaar', 'Openbaar', 'Andere studenten met een account kunnen het binnenkort op je profiel lezen.']
    ], waarde.openbaar ? 'openbaar' : 'berie', 'is-wie');

    const fout = maak('p', 'auth-error');
    fout.setAttribute('role', 'alert');
    fout.hidden = true;

    let bezig = false;
    const knoppen = maak('div', 'over-knoppen');
    const opslaan = maak('button', 'knop', opties.opslaanTekst || 'Opslaan →');
    opslaan.type = 'submit';
    knoppen.append(opslaan);
    let tweede = null;
    if (opties.tweede) {
      tweede = maak(opties.tweede.href ? 'a' : 'button', 'knop-secundair', opties.tweede.tekst);
      if (opties.tweede.href) tweede.href = opties.tweede.href;
      else tweede.type = 'button';
      // Tijdens het opslaan doet de tweede knop niets, zodat er niets half bewaard wordt.
      tweede.addEventListener('click', event => {
        if (bezig) { event.preventDefault(); return; }
        if (opties.tweede.bijKlik) opties.tweede.bijKlik(event);
      });
      knoppen.append(tweede);
    }

    form.append(studieVeld, jaren, tekstVeld, wie, fout, knoppen);
    let wissen = null;
    if (opties.wissen) {
      wissen = maak('button', 'tekstlink over-wissen', 'Alles weghalen');
      wissen.type = 'button';
      form.append(wissen);
    }
    // Een melding verdwijnt zodra je iets invult of kiest.
    form.addEventListener('input', () => { if (!bezig) fout.hidden = true; });

    const bewaar = async over => {
      bezig = true;
      const knopTekst = opslaan.textContent;
      opslaan.disabled = true;
      opslaan.textContent = 'Even geduld…';
      if (tweede) {
        if (tweede.tagName === 'BUTTON') tweede.disabled = true;
        else tweede.setAttribute('aria-disabled', 'true');
      }
      if (wissen) wissen.disabled = true;
      form.setAttribute('aria-busy', 'true');
      try {
        await opties.opslaan(over);
      } catch (failure) {
        fout.textContent = failure?.message || 'Opslaan is niet gelukt. Probeer het opnieuw.';
        fout.hidden = false;
      } finally {
        bezig = false;
        opslaan.disabled = false;
        opslaan.textContent = knopTekst;
        if (tweede) {
          tweede.disabled = false;
          tweede.removeAttribute('aria-disabled');
        }
        if (wissen) wissen.disabled = false;
        form.removeAttribute('aria-busy');
      }
    };

    if (wissen) wissen.addEventListener('click', () => { if (!bezig) bewaar(null); });

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (bezig) return;
      const over = {
        studie: studie.value.trim(),
        jaar: form.querySelector('input[name="over-jaar-' + n + '"]:checked')?.value || '',
        tekst: tekst.value.trim(),
        openbaar: form.querySelector('input[name="over-wie-' + n + '"]:checked')?.value === 'openbaar'
      };
      fout.hidden = true;
      if (!opties.leegMag && !over.studie && !over.jaar && !over.tekst) {
        fout.textContent = 'Vul minstens iets in, of kies ' + (opties.tweede?.tekst || 'Overslaan') + '.';
        fout.hidden = false;
        studie.focus();
        return;
      }
      bewaar(over);
    });

    return { form, focus: () => studie.focus() };
  }

  // Wat je over jezelf vertelde, zoals het op je profiel staat.
  function weergave(over) {
    const blok = maak('div', 'over-weergave');
    const regel = [over.studie, jaarNaam(over.jaar)].filter(Boolean).join(' · ');
    if (regel) blok.append(maak('p', 'over-regel', regel));
    if (over.tekst) blok.append(maak('p', 'over-lees', over.tekst));
    blok.append(maak('span', 'over-label' + (over.openbaar ? ' is-openbaar' : ''), over.openbaar ? 'Openbaar' : 'Alleen Berie'));
    return blok;
  }

  window.BES = window.BES || {};
  window.BES.overJezelf = { formulier, weergave, jaarNaam };
})();
