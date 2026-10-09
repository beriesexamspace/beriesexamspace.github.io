// Maakt doorstuurpagina's voor de oude vaklinks (bijvoorbeeld beriesexamspace.com/mbg/).
// Uitvoer: lancering/doorsturen/<id>/index.html, één per vak uit assets/vakken.js,
// plus de oude mappen die geen vak-id zijn (zie OUDE_MAPPEN).
// lancering/verhuis.js zet deze mappen bij de lancering in de repo van het hoofddomein.
//
//   node lancering/maak-doorsturen.js            -> doel /vak/<id>/ (na de lancering op het hoofddomein)
//   node lancering/maak-doorsturen.js /v2/vak/   -> doel /v2/vak/<id>/ (zolang v2 nog onder /v2/ staat)

const fs = require('fs');
const path = require('path');

const doelBasis = process.argv[2] || '/vak/';
const siteBasis = doelBasis.replace(/vak\/$/, '');
global.window = {};
require(path.join(__dirname, '..', 'assets', 'vakken.js'));
const vakken = window.BES_VAKKEN || [];
const uit = path.join(__dirname, 'doorsturen');
fs.rmSync(uit, { recursive: true, force: true });

// Oude mappen op het hoofddomein die geen vak-id zijn: /stat/ was Statistiek II, /reco/ bestaat niet meer.
const OUDE_MAPPEN = [
  { map: 'stat', doel: `${doelBasis}stat2/`, naam: 'Statistiek II' },
  { map: 'reco', doel: siteBasis, naam: "Berie's Exam Space" }
];

const pagina = (doel, naam) => `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=${doel}">
  <link rel="canonical" href="https://beriesexamspace.com${doel}">
  <title>${naam} is verhuisd | Berie's Exam Space</title>
  <script>window.location.replace('${doel}' + window.location.hash);</script>
  <style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Inter,-apple-system,system-ui,sans-serif;background:#fff;color:#1d1d1f;text-align:center;padding:24px}a{color:#0071e3}@media(prefers-color-scheme:dark){body{background:#0b0b0c;color:#f5f5f7}a{color:#0a84ff}}</style>
</head>
<body>
  <p>${naam} staat nu op de nieuwe site.<br><a href="${doel}">Ga verder →</a></p>
</body>
</html>
`;

const mappen = [
  ...vakken.map(vak => ({ map: vak.id, doel: `${doelBasis}${vak.id}/`, naam: vak.naam })),
  ...OUDE_MAPPEN
];
for (const { map, doel, naam } of mappen) {
  fs.mkdirSync(path.join(uit, map), { recursive: true });
  fs.writeFileSync(path.join(uit, map, 'index.html'), pagina(doel, naam));
}
console.log(`${mappen.length} doorstuurpagina's in ${path.relative(process.cwd(), uit)} (doel ${doelBasis}<id>/)`);
