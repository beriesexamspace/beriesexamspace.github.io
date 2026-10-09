// Comit als pixel-brie: één bron (het raster) voor de site (SVG) én voor afbeeldingen (PNG via maak-png.js).
// Elke letter in het raster is een kleur uit het palet. Het hoofd is een puntje brie (witte korst, romige binnenkant),
// het trainingspak (w) is wit in lichte modus en zwart in donkere modus.
(function (root) {
  const RASTER = [
    '......######......',
    '....##rrrrrr##....',
    '...#rrrrrrrrrr#...',
    '..#rrrrrrrrrrrr#..',
    '.#rrrrrrrrrrrrrr#.',
    '.#rccccccccccccr#.',
    '.#rccccccccccccr#.',
    '.#rccecccccecccr#.',
    '.#rccecccccecccr#.',
    '.#rccccccccccccr#.',
    '.#rcsccceecccscr#.',
    '..#rrrrrrrrrrrr#..',
    '...##rrrrrrrr##...',
    '....##wwwwww##....',
    '...#ww#wwww#ww#...',
    '...#ww#wwww#ww#...',
    '....##wwwwww##....',
    '.....#ww##ww#.....',
    '.....#ww##ww#.....',
    '.....###..###.....'
  ];

  // Kleuren per stand: rand, korst (r), romige binnenkant (c), ogen en mond (e), blosjes (s), trainingspak (w)
  const PALET = {
    licht: { '#': '#1d1d1f', r: '#fbfbf7', c: '#f5e4ad', e: '#1d1d1f', s: '#f4a6a0', w: '#ffffff' },
    donker: { '#': '#9a9aa0', r: '#efefeb', c: '#f1dc9c', e: '#1d1d1f', s: '#f08c86', w: '#0f0f10' }
  };

  const breedte = RASTER[0].length;
  const hoogte = RASTER.length;
  RASTER.forEach((rij, i) => { if (rij.length !== breedte) throw new Error('rij ' + i + ' heeft ' + rij.length + ' tekens'); });

  // SVG met één rect per pixel; kleuren via CSS-variabelen zodat het thema ze wisselt zonder herteken
  function svg(opties = {}) {
    const schaal = opties.schaal || 8;
    const klas = opties.klas || 'comit-pixel';
    let rects = '';
    RASTER.forEach((rij, y) => {
      Array.from(rij).forEach((teken, x) => {
        if (teken === '.') return;
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="var(--comit-${teken === '#' ? 'rand' : teken})"/>`;
      });
    });
    return `<svg class="${klas}" viewBox="0 0 ${breedte} ${hoogte}" width="${breedte * schaal}" height="${hoogte * schaal}" shape-rendering="crispEdges" aria-label="Comit" role="img">${rects}</svg>`;
  }

  const vars = palet => Object.entries(palet).map(([k, v]) => `--comit-${k === '#' ? 'rand' : k}: ${v};`).join(' ');
  const css = `
.comit-pixel { ${vars(PALET.licht)} image-rendering: pixelated; }
html[data-theme="dark"] .comit-pixel { ${vars(PALET.donker)} }
`;

  root.COMIT_PIXEL = { RASTER, PALET, breedte, hoogte, svg, css };
})(typeof window !== 'undefined' ? window : module.exports);
