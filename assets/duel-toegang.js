// Wie mag het duel zien? Sinds 08-11-2026 iedereen met een account (VOOR_IEDEREEN = true).
// Meedoen via een uitnodigingslink (duel.html?c=CODE) mag met elk account; dat regelt duel.html.
// Voor iedereen open: VOOR_IEDEREEN op true zetten.
// Gebruikt door duel-start.js (de knop op de vakpagina) en duel.html (de pagina zelf).
(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  if (BES.duelToegang) return;

  const VOOR_IEDEREEN = true;

  // true = dit account mag het duel zien, false = niet, null = niet ingelogd (nog onbekend).
  BES.duelMagAccount = async gebruiker => {
    if (!gebruiker || !gebruiker.id) return null;
    if (VOOR_IEDEREEN) return true;
    // Beheerder = het account met Beheer (rpc is_beheerder, zie auth.js).
    try { return (await BES.auth?.isBeheerder?.()) === true; } catch { return false; }
  };

  // Met ?test=duel speelt het duel op de nep-database. Dat mag alleen op de eigen laptop, niet op de echte site.
  BES.duelToegang = async () => {
    if (new URLSearchParams(window.location.search).get('test') === 'duel') {
      return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    }
    let gebruiker = null;
    try {
      await BES.auth?.gereed;
      gebruiker = await BES.auth?.gebruiker?.();
    } catch {}
    return BES.duelMagAccount(gebruiker);
  };
})();
