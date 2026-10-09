// Versies: het welkomstscherm (Wat is nieuw) verschijnt één keer per persoon per versie.
// Nieuwe versie uitbrengen: 1) updates toevoegen met versie: N, 2) BES_VERSIE = N zetten, 3) cachenummer verhogen.
// Iedereen die daarna inlogt (nieuw of bestaand account) ziet het scherm één keer; daarna niet meer tot de volgende versie.
window.BES_VERSIE = 1;

window.BES_UPDATES = [
  { versie: 1, soort: 'nieuw', datum: '20 september 2026', tekst: '**Inloggen met Google**: één klik, geen wachtwoord nodig.' },
  { versie: 1, soort: 'nieuw', datum: '19 september 2026', tekst: '**Sociologie I** staat erin, met 204 vragen en oude examenvragen.' },
  { versie: 1, soort: 'nieuw', datum: '19 september 2026', tekst: '**Leren leren**: slim studeren, focus en hulp als het even niet gaat.' },
  { versie: 1, soort: 'nieuw', datum: '19 september 2026', tekst: '**Feedbackpagina**: meld een fout of stuur een idee.' },
  { versie: 1, soort: 'nieuw', datum: '18 september 2026', tekst: '**Hard mode** bij Inleiding tot de pedagogiek, met minstens 8 vragen per ronde.' },
  { versie: 1, soort: 'verbeterd', datum: '16 september 2026', tekst: '**Reken je punten** en **Examen-info** staan in de nieuwe stijl.' },
  { versie: 1, soort: 'verbeterd', datum: '15 september 2026', tekst: 'Alle vakken staan in de **nieuwe vakpagina**, met **voortgang bij je account**.' },
  { versie: 1, soort: 'nieuw', datum: '15 september 2026', tekst: '**Aanmelden en inloggen** met je eigen account.' },
  { versie: 1, soort: 'nieuw', datum: '14 september 2026', tekst: "Nieuwe **startpagina**, **hub**, **jaarpagina's** en **WhatsApp-pagina**." }
];

window.BES = window.BES || {};
window.BES.updateTekst = tekst => {
  const waarde = typeof tekst === 'string' ? tekst : '';
  const fragment = document.createDocumentFragment();
  let vanaf = 0;
  for (const match of waarde.matchAll(/\*\*([^*]+)\*\*/g)) {
    fragment.append(waarde.slice(vanaf, match.index));
    const nadruk = document.createElement('strong');
    nadruk.textContent = match[1];
    fragment.append(nadruk);
    vanaf = match.index + match[0].length;
  }
  fragment.append(waarde.slice(vanaf));
  return fragment;
};

window.BES.updateRij = (update, variant) => {
  const item = document.createElement('li');
  item.className = variant === 'hub' ? 'hub-update' : 'nieuw-update';
  const meta = document.createElement('span');
  meta.className = 'update-meta';
  const label = document.createElement('span');
  const soort = update.soort === 'verbeterd' ? 'verbeterd' : 'nieuw';
  label.className = 'update-label update-label-' + soort;
  label.textContent = soort === 'verbeterd' ? 'Verbeterd' : 'Nieuw';
  const datum = document.createElement('span');
  datum.className = 'update-datum';
  datum.textContent = update.datum;
  meta.append(label, datum);
  const tekst = document.createElement('span');
  tekst.append(window.BES.updateTekst(update.tekst));
  item.append(meta, tekst);
  return item;
};
