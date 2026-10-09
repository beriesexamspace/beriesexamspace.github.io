// De deur: deze pagina is alleen voor ingelogde accounts.
// Laad dit bestand in de <head> (zonder defer) op elke pagina die achter de deur hoort.
// Zonder sessie in de browser: meteen naar inloggen.html met de weg terug. Met sessie: pagina even verborgen tot auth.js het account bevestigt.
(() => {
  const script = document.currentScript;
  const prefix = (script?.getAttribute('src') || '').split('assets/deur.js')[0];
  const terug = window.location.pathname.split('/').slice(-1 - (prefix.split('../').length - 1)).join('/') + window.location.search + window.location.hash;
  const naarInloggen = () => {
    try { window.sessionStorage.setItem('bes_terug', terug); } catch {}
    window.location.replace(prefix + 'inloggen.html?terug=' + encodeURIComponent(terug));
  };
  window.BES_DEUR = { prefix, naarInloggen };
  let sessie = false;
  try {
    sessie = Object.keys(window.localStorage).some(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
  } catch {}
  if (!sessie) { naarInloggen(); return; }
  document.documentElement.classList.add('deur-check');
  window.setTimeout(() => document.documentElement.classList.remove('deur-check'), 4000);
})();
