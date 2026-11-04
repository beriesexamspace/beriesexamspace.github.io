(function (wortel) {
  'use strict';

  const lijnen = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  const geheugen = new Map();

  function uitslag(bord) {
    for (const lijn of lijnen) {
      const [a, b, c] = lijn;
      if (bord[a] !== null && bord[a] === bord[b] && bord[a] === bord[c]) {
        return { winnaar: bord[a], lijn: lijn.slice() };
      }
    }
    return bord.includes(null) ? null : { winnaar: 'gelijk', lijn: null };
  }

  function legeVakken(bord) {
    const zetten = [];
    for (let i = 0; i < 9; i += 1) {
      if (bord[i] === null) zetten.push(i);
    }
    return zetten;
  }

  function kiesWillekeurig(zetten, kans) {
    return zetten[Math.floor(kans() * zetten.length)];
  }

  function winnendeZetten(bord, speler, zetten) {
    return zetten.filter(function (zet) {
      bord[zet] = speler;
      const resultaat = uitslag(bord);
      bord[zet] = null;
      return resultaat !== null && resultaat.winnaar === speler;
    });
  }

  function sleutelVoor(bord, speler, robot) {
    let sleutel = 0;
    for (let i = 0; i < 9; i += 1) {
      sleutel = sleutel * 3 + (bord[i] === 'X' ? 1 : bord[i] === 'O' ? 2 : 0);
    }
    return sleutel * 4 + (speler === 'X' ? 2 : 0) + (robot === 'X' ? 1 : 0);
  }

  function minimax(bord, speler, robot, bezet) {
    const sleutel = sleutelVoor(bord, speler, robot);
    if (geheugen.has(sleutel)) return geheugen.get(sleutel);

    const resultaat = uitslag(bord);
    let score;
    if (resultaat !== null) {
      // Vroege winst en laat verlies; scores blijven geldig in het geheugen.
      score = resultaat.winnaar === 'gelijk' ? 0
        : resultaat.winnaar === robot ? 10 - bezet : bezet - 10;
    } else {
      const maximaliseer = speler === robot;
      const volgende = speler === 'X' ? 'O' : 'X';
      score = maximaliseer ? -Infinity : Infinity;
      for (let zet = 0; zet < 9; zet += 1) {
        if (bord[zet] !== null) continue;
        bord[zet] = speler;
        const waarde = minimax(bord, volgende, robot, bezet + 1);
        bord[zet] = null;
        score = maximaliseer ? Math.max(score, waarde) : Math.min(score, waarde);
      }
    }
    geheugen.set(sleutel, score);
    return score;
  }

  function perfecteZet(bord, robot, zetten, kans) {
    const tegenstander = robot === 'X' ? 'O' : 'X';
    const bezet = 9 - zetten.length;
    let besteScore = -Infinity;
    let besteZetten = [];
    for (const zet of zetten) {
      bord[zet] = robot;
      const score = minimax(bord, tegenstander, robot, bezet + 1);
      bord[zet] = null;
      if (score > besteScore) {
        besteScore = score;
        besteZetten = [zet];
      } else if (score === besteScore) {
        besteZetten.push(zet);
      }
    }
    return kiesWillekeurig(besteZetten, kans);
  }

  function kiesZet(bord, robot, niveau, kans = Math.random) {
    if (uitslag(bord) !== null) throw new Error('Het spel is al afgelopen.');
    if (robot !== 'X' && robot !== 'O') throw new Error('Onbekend robotsymbool.');
    if (!['makkelijk', 'normaal', 'onmogelijk'].includes(niveau)) {
      throw new Error('Onbekend niveau.');
    }

    // Alle proefzetten gebeuren op een kopie.
    const werkbord = bord.slice();
    const zetten = legeVakken(werkbord);
    if (zetten.length === 0) throw new Error('Er is geen leeg vak.');
    if (niveau === 'onmogelijk') return perfecteZet(werkbord, robot, zetten, kans);

    const winst = winnendeZetten(werkbord, robot, zetten);
    if (winst.length > 0 && (niveau === 'normaal' || kans() < 0.5)) {
      return kiesWillekeurig(winst, kans);
    }

    const tegenstander = robot === 'X' ? 'O' : 'X';
    const blokkades = winnendeZetten(werkbord, tegenstander, zetten);
    if (blokkades.length > 0 && (niveau === 'normaal' || kans() < 0.3)) {
      return kiesWillekeurig(blokkades, kans);
    }

    if (niveau === 'normaal' && kans() < 0.6) {
      return perfecteZet(werkbord, robot, zetten, kans);
    }
    return kiesWillekeurig(zetten, kans);
  }

  const Robot = { kiesZet, uitslag, lijnen };
  if (typeof module !== 'undefined' && module.exports) module.exports = Robot;
  else wortel.Robot = Robot;
})(typeof window !== 'undefined' ? window : globalThis);
