// Inzichten (Free): op Profiel een korte stand per vak en de laatste sessies. Leest de tabellen voortgang en sessies.
// Gebruik: <div data-inzichten></div> op de pagina; vakken.js moet geladen zijn.
window.BES = window.BES || {};

(() => {
  const prefix = (document.querySelector('script[src*="inzichten.js"]')?.getAttribute('src') || '').split('assets/inzichten.js')[0];
  const el = (tag, klasse, tekst) => { const node = document.createElement(tag); if (klasse) node.className = klasse; if (tekst !== undefined) node.textContent = tekst; return node; };
  const procent = (goed, totaal) => totaal ? Math.round(goed / totaal * 100) : 0;
  const datum = new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'short' });

  const balk = (waarde, goed) => {
    const wrap = el('div', 'inz-balk');
    const vul = el('i', goed ? 'is-goed' : '');
    vul.style.width = '0%';
    wrap.append(vul);
    window.requestAnimationFrame(() => { vul.style.width = waarde + '%'; });
    return wrap;
  };

  async function toon(root) {
    const auth = window.BES.auth;
    await auth.gereed;
    const user = await auth.gebruiker();
    if (!user || !auth.client) { root.hidden = true; return; }
    const vakken = (window.BES_VAKKEN || []).filter(vak => vak.v2);
    const [voortgang, sessies] = await Promise.all([
      auth.client.from('voortgang').select('vak,hoofdstuk,laatst_goed,laatst_totaal').eq('user_id', user.id),
      auth.client.from('sessies').select('vak,niveau,modus,goed,totaal,gemaakt_op').eq('user_id', user.id).order('gemaakt_op', { ascending: false }).limit(5)
    ]);
    root.replaceChildren();
    if (voortgang.error) { root.append(el('p', 'inz-leeg', 'Je voortgang kon niet geladen worden. Probeer het later opnieuw.')); return; }

    // Per vak: gemiddelde van de laatste score per hoofdstuk (Hard mode apart, niet meegeteld)
    const perVak = {};
    for (const rij of voortgang.data || []) {
      if (rij.vak.endsWith('__hard') || !rij.laatst_totaal) continue;
      const v = perVak[rij.vak] = perVak[rij.vak] || { goed: 0, totaal: 0, hoofdstukken: 0, afgerond: 0 };
      v.goed += rij.laatst_goed;
      v.totaal += rij.laatst_totaal;
      v.hoofdstukken += 1;
      if (rij.laatst_goed === rij.laatst_totaal) v.afgerond += 1;
    }
    const geoefend = vakken.filter(vak => perVak[vak.id]).map(vak => ({ vak, ...perVak[vak.id], score: procent(perVak[vak.id].goed, perVak[vak.id].totaal) })).sort((a, b) => a.score - b.score);

    const kaart = el('div', 'kaart inz-kaart');
    if (!geoefend.length) {
      kaart.append(el('p', 'inz-leeg', 'Nog niets geoefend. Kies een vak op de hub; daarna zie je hier per vak hoe je ervoor staat.'));
    } else {
      const lijst = el('ul', 'inz-vakken');
      for (const item of geoefend.slice(0, 6)) {
        const li = el('li', 'inz-vak');
        const kop = el('div', 'inz-vak-kop');
        const naam = el('a', 'inz-naam', item.vak.naam);
        naam.href = `${prefix}vak/${item.vak.id}/`;
        kop.append(naam, el('span', 'inz-procent' + (item.score >= 80 ? ' is-goed' : ''), item.score + '%'));
        li.append(kop, balk(item.score, item.score >= 80), el('span', 'inz-sub', `${item.hoofdstukken} hoofdstuk${item.hoofdstukken === 1 ? '' : 'ken'} geoefend · ${item.afgerond} afgerond`));
        lijst.append(li);
      }
      kaart.append(lijst);
      const meer = el('a', 'tekstlink inz-meer', 'Weekoverzicht →');
      meer.href = `${prefix}voortgang.html`;
      kaart.append(meer);
    }
    root.append(kaart);

    if (!sessies.error && sessies.data?.length) {
      const namen = Object.fromEntries(vakken.map(vak => [vak.id, vak.naam]));
      const blok = el('div', 'kaart inz-kaart inz-sessies');
      blok.append(el('h3', 'inz-kop', 'Laatste sessies'));
      const ul = el('ul', 'inz-sessie-lijst');
      for (const s of sessies.data) {
        const li = el('li', 'inz-sessie');
        const p = procent(s.goed, s.totaal);
        li.append(
          el('span', 'inz-sessie-datum', datum.format(new Date(s.gemaakt_op))),
          el('span', 'inz-sessie-vak', namen[s.vak] || s.vak),
          el('span', 'inz-sessie-modus', `${s.modus === 'simulatie' ? 'Simulatie' : 'Training'}${s.niveau === 'hard' ? ' · Hard' : ''}`),
          el('span', 'inz-sessie-score' + (p >= 80 ? ' is-goed' : ''), `${s.goed} van ${s.totaal}`)
        );
        ul.append(li);
      }
      blok.append(ul);
      root.append(blok);
    }
    root.hidden = false;
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-inzichten]').forEach(root => { toon(root).catch(() => { root.hidden = true; }); });
  });
})();
