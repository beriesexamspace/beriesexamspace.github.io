// Beslispagina: Berat opent deze via de link in de aanvraagmail.
// De gegevens (id, token, ja/nee) staan achter # in de link en gaan alleen naar de functie beslis.
// Openen alleen verandert niets; pas de klik op de knop voert de beslissing uit.
(function () {
  'use strict';

  var titel = document.getElementById('titel');
  var uitleg = document.getElementById('uitleg');
  var knop = document.getElementById('knop');

  function toon(kop, tekst) {
    titel.textContent = kop;
    uitleg.textContent = tekst || '';
  }

  function ongeldig() {
    knop.hidden = true;
    toon('Deze link is niet (meer) geldig.', 'Deze aanvraag is misschien al behandeld.');
  }

  function fout() {
    knop.hidden = true;
    toon('Er ging iets mis.', 'Probeer de link later opnieuw.');
  }

  var cfg = (window.BM && window.BM.config) || {};
  var params = new URLSearchParams(location.hash.slice(1));
  var id = params.get('id') || '';
  var t = params.get('t') || '';
  var a = params.get('a') || '';

  // Gegevens uit de adresbalk halen, zodat ze niet in de geschiedenis blijven staan
  try { history.replaceState(null, '', location.pathname); } catch (e) { /* niet erg */ }

  if (!cfg.supabaseUrl || !id || !t || (a !== 'ja' && a !== 'nee')) {
    ongeldig();
    return;
  }

  var url = cfg.supabaseUrl.replace(/\/$/, '') + '/functions/v1/beslis';

  function vraag(doe) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, t: t, a: a, doe: doe }),
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    }).then(function (res) {
      return res.json().catch(function () { return { ok: false, fout: 'serverfout' }; });
    });
  }

  vraag(false).then(function (r) {
    if (!r || !r.ok) {
      if (r && r.fout === 'ongeldige_link') ongeldig(); else fout();
      return;
    }
    if (a === 'ja') {
      toon('Toegang geven aan ' + r.email + '?', 'Naam: ' + r.naam);
      knop.textContent = 'Ja, geef toegang';
      knop.className = 'knop';
    } else {
      toon('Aanvraag afwijzen?', 'Aanvraag van ' + r.email + ' (' + r.naam + ')');
      knop.textContent = 'Ja, wijs af';
      knop.className = 'knop nee';
    }
    knop.hidden = false;
  }).catch(fout);

  knop.addEventListener('click', function () {
    knop.disabled = true;
    knop.textContent = 'Bezig...';
    vraag(true).then(function (r) {
      if (!r || !r.ok) {
        if (r && r.fout === 'ongeldige_link') ongeldig(); else fout();
        return;
      }
      knop.hidden = true;
      if (r.besluit === 'ja') {
        toon('Gedaan.', 'Toegang gegeven aan ' + r.email + '. ' + (r.mail
          ? 'De aanvrager heeft een mail gekregen.'
          : 'De mail kon niet worden verstuurd. Stuur de aanvrager de link naar de app zelf.'));
      } else {
        toon('Gedaan.', 'De aanvraag van ' + r.email + ' is afgewezen. De aanvrager krijgt geen mail.');
      }
    }).catch(fout);
  });
})();
