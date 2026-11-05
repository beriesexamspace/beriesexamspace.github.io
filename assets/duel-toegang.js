// Wie mag het duel zien? Zolang het duel in stilte live staat, alleen de accounts in TESTERS (knop en duel maken).
// Meedoen via een uitnodigingslink (duel.html?c=CODE) mag met elk account; dat regelt duel.html.
// TESTERS bevat de SHA-256 van het account-id (geen id's in deze openbare code). Lijst leeg = iedereen met een account.
// Gebruikt door duel-start.js (de knop op de vakpagina) en duel.html (de pagina zelf).
(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  if (BES.duelToegang) return;

  const TESTERS = [
    '760e29acc21af2fb15e772ff86def5709ff2dbc228bad6c8457606b89947c618'
  ];

  const hash = async tekst => {
    const bytes = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(tekst)));
    return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
  };

  // true = dit account mag het duel zien, false = niet, null = niet ingelogd (nog onbekend).
  BES.duelMagAccount = async gebruiker => {
    if (!gebruiker || !gebruiker.id) return null;
    if (!TESTERS.length) return true;
    try { return TESTERS.includes(await hash(gebruiker.id)); } catch { return false; }
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
