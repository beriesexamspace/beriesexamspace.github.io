(function () {
  'use strict';
  var BM = window.BM = window.BM || {};

  // Accentkleur en profiel van de gebruiker. Alleen op deze computer (localStorage), nooit in de cloud.
  // Het thema zet de CSS-variabelen van de accentkleur op document.documentElement.
  // Het profiel bestaat uit een naam (optioneel, max 40 tekens) en een rol: 'student', 'leerkracht', 'anders' of null.
  // Alle localStorage-toegang zit in try/catch: zonder opslag werkt alles met de standaardwaarden.

  var THEMA_KEY = 'bm-thema';
  var PROFIEL_KEY = 'bm-profiel';
  var STANDAARD = '#8b7cf6';
  var NAAM_MAX = 40;
  var ROLLEN = ['student', 'leerkracht', 'anders'];

  var LIJST = [
    { naam: 'Paars', hex: '#8b7cf6' },
    { naam: 'Blauw', hex: '#5b8def' },
    { naam: 'Teal', hex: '#3fb9b2' },
    { naam: 'Groen', hex: '#4fbf7a' },
    { naam: 'Geel', hex: '#e0b84a' },
    { naam: 'Oranje', hex: '#f08a4b' },
    { naam: 'Roze', hex: '#e46fb0' },
    { naam: 'Rood', hex: '#e5626b' }
  ];

  var huidigeHex = STANDAARD;
  var profielData = { naam: '', rol: null };

  function geldigHex(h) {
    return typeof h === 'string' && /^#[0-9a-fA-F]{6}$/.test(h);
  }

  function leesOpslag(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function schrijfOpslag(key, tekst) {
    try {
      window.localStorage.setItem(key, tekst);
      return true;
    } catch (e) {
      return false;
    }
  }

  function naarKanalen(hex) {
    return [
      parseInt(hex.substr(1, 2), 16),
      parseInt(hex.substr(3, 2), 16),
      parseInt(hex.substr(5, 2), 16)
    ];
  }

  // Zet de accentvariabelen. Geeft de gebruikte hex terug (bij een ongeldige waarde de standaard).
  function toepassen(hex) {
    var h = geldigHex(hex) ? hex.toLowerCase() : STANDAARD;
    var k = naarKanalen(h);
    var rgb = k[0] + ', ' + k[1] + ', ' + k[2];
    // Hover: iets lichter, door een klein stukje naar wit te mengen.
    var licht = k.map(function (v) { return Math.round(v + (255 - v) * 0.14); });
    var stijl = document.documentElement.style;
    stijl.setProperty('--bm-accent', h);
    stijl.setProperty('--bm-accent-rgb', rgb);
    stijl.setProperty('--bm-accent-hover', 'rgb(' + licht.join(', ') + ')');
    stijl.setProperty('--bm-accent-soft', 'rgba(' + rgb + ', 0.16)');
    return h;
  }

  function kiezen(hex) {
    if (!geldigHex(hex)) return huidigeHex;
    huidigeHex = toepassen(hex);
    schrijfOpslag(THEMA_KEY, huidigeHex);
    BM.bus.emit('thema:changed', { hex: huidigeHex });
    return huidigeHex;
  }

  function huidige() {
    return huidigeHex;
  }

  function lijst() {
    return LIJST.map(function (k) { return { naam: k.naam, hex: k.hex }; });
  }

  // Bij het laden meteen de bewaarde kleur, zodat er geen paarse flits is.
  function laadThema() {
    var t = leesOpslag(THEMA_KEY);
    huidigeHex = toepassen(geldigHex(t) ? t : STANDAARD);
  }

  // Maakt een schoon profiel: naam gekort tot 40 tekens, rol alleen een toegestane waarde of null.
  function schoon(p) {
    var naam = (p && typeof p.naam === 'string') ? p.naam.trim().slice(0, NAAM_MAX) : '';
    var rol = (p && ROLLEN.indexOf(p.rol) !== -1) ? p.rol : null;
    return { naam: naam, rol: rol };
  }

  function laadProfiel() {
    var t = leesOpslag(PROFIEL_KEY);
    var d = null;
    try { d = t ? JSON.parse(t) : null; } catch (e) { d = null; }
    profielData = schoon(d);
  }

  function profiel() {
    return { naam: profielData.naam, rol: profielData.rol };
  }

  function zetProfiel(p) {
    profielData = schoon(p);
    schrijfOpslag(PROFIEL_KEY, JSON.stringify(profielData));
    BM.bus.emit('profiel:changed', profiel());
    return profiel();
  }

  laadThema();
  laadProfiel();

  BM.thema = {
    lijst: lijst,
    huidige: huidige,
    kiezen: kiezen,
    toepassen: toepassen,
    profiel: profiel,
    zetProfiel: zetProfiel
  };
})();
