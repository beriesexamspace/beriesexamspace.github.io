// Zet de nieuwe site klaar in de repo van het hoofddomein (beriesexamspace.github.io).
//
//   node lancering/verhuis.js <map-van-de-hoofdrepo>
//
// 1. Haalt alles in die map weg behalve .git, CNAME en LICENSE. De oude site blijft in de git-geschiedenis.
// 2. Kopieert deze repo erin, zonder .git, .claude en lancering/doorsturen.
// 3. Haalt /v2/ uit de paden van de site (html, js, css, manifest) en uit SITE_URL in de Edge Functions.
// 4. Zet de doorstuurpagina's van maak-doorsturen.js erin (/mbg/ -> /vak/mbg/, /stat/, /reco/).
// 5. Geeft 404.html een doorverwijzing voor oude links: /v2/... en dieper in een oude vakmap (/mbg/x.html).
//
// Opnieuw draaien mag: het resultaat is telkens een verse kopie van v2. Werk in de hoofdrepo dus op een
// aparte branch en voeg die pas op de lanceerdag samen met main.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const bron = path.resolve(__dirname, '..');
const doel = process.argv[2] && path.resolve(process.argv[2]);

const stop = melding => { console.error(melding); process.exit(1); };
if (!doel) stop('Gebruik: node lancering/verhuis.js <map-van-de-hoofdrepo>');
if (doel === bron) stop('De doelmap is deze repo zelf.');
if (!fs.existsSync(path.join(doel, '.git'))) stop('De doelmap is geen git-repo: ' + doel);
const cname = fs.existsSync(path.join(doel, 'CNAME')) ? fs.readFileSync(path.join(doel, 'CNAME'), 'utf8').trim() : '';
if (cname !== 'beriesexamspace.com') stop('De doelmap heeft geen CNAME beriesexamspace.com; is dit wel de repo van het hoofddomein?');

// 1. Oude inhoud weg
const BEWAREN = new Set(['.git', 'CNAME', 'LICENSE']);
for (const naam of fs.readdirSync(doel)) {
  if (!BEWAREN.has(naam)) fs.rmSync(path.join(doel, naam), { recursive: true, force: true });
}

// 2. Kopie van v2
const OVERSLAAN = new Set(['.git', '.claude', path.join('lancering', 'doorsturen')].map(p => path.join(bron, p)));
for (const naam of fs.readdirSync(bron)) {
  const van = path.join(bron, naam);
  if (OVERSLAAN.has(van)) continue;
  fs.cpSync(van, path.join(doel, naam), { recursive: true, filter: p => !OVERSLAAN.has(p) });
}

// 3. /v2/ uit de paden
const SITE = new Set(['.html', '.js', '.css', '.webmanifest', '.json', '.svg']);
const NIET_HERSCHRIJVEN = ['.git', 'lancering', 'codex', 'referentie'].map(p => path.join(doel, p));
let herschreven = 0;
const loop = map => {
  for (const item of fs.readdirSync(map, { withFileTypes: true })) {
    const pad = path.join(map, item.name);
    if (NIET_HERSCHRIJVEN.includes(pad)) continue;
    if (item.isDirectory()) { loop(pad); continue; }
    const ext = path.extname(item.name).toLowerCase();
    if (!SITE.has(ext) && ext !== '.ts') continue;
    const oud = fs.readFileSync(pad, 'utf8');
    const nieuw = SITE.has(ext)
      ? oud.split('/v2/').join('/')
      : oud.split('beriesexamspace.com/v2/').join('beriesexamspace.com/');
    if (nieuw !== oud) { fs.writeFileSync(pad, nieuw); herschreven++; }
  }
};
loop(doel);

// 4. Doorstuurpagina's voor de oude vaklinks
execFileSync(process.execPath, [path.join(__dirname, 'maak-doorsturen.js')], { stdio: 'inherit' });
const doorsturen = path.join(__dirname, 'doorsturen');
const oudeMappen = fs.readdirSync(doorsturen);
for (const map of oudeMappen) {
  if (fs.existsSync(path.join(doel, map))) stop('Doorstuurmap botst met een bestaande map: ' + map);
  fs.cpSync(path.join(doorsturen, map), path.join(doel, map), { recursive: true });
}

// 5. 404.html: oude links doorsturen
const pagina404 = path.join(doel, '404.html');
const html404 = fs.readFileSync(pagina404, 'utf8');
const script404 = `  <script>
    // Oude links: /v2/... wordt /..., en alles in een oude vakmap (bijvoorbeeld /mbg/samenvatting.html) gaat naar de doorstuurpagina van die map.
    (() => {
      const oudeMappen = ${JSON.stringify(oudeMappen)};
      const pad = window.location.pathname;
      const eerste = pad.split('/')[1];
      let nieuw = null;
      if (eerste === 'v2') nieuw = pad.slice(3) || '/';
      else if (oudeMappen.includes(eerste) && pad !== '/' + eerste + '/') nieuw = '/' + eerste + '/';
      if (nieuw) window.location.replace(nieuw + window.location.search + window.location.hash);
    })();
  </script>
</head>`;
if (!html404.includes('</head>')) stop('404.html heeft geen </head>.');
fs.writeFileSync(pagina404, html404.replace('</head>', script404));

console.log(`Klaar: ${herschreven} bestanden zonder /v2/, ${oudeMappen.length} doorstuurmappen, 404.html stuurt oude links door.`);
