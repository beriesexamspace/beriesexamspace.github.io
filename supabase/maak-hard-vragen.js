// Haalt de Hard mode-vragen uit de openbare data.js van elk vak en zet ze in supabase/hard-vragen-data.sql.
// In data.js komt daarvoor hardPerHoofdstuk in de plaats: per hoofdstuk het aantal Hard mode-vragen.
//
//   node supabase/maak-hard-vragen.js
//
// Daarna in de SQL-editor van Supabase eerst supabase/hard-vragen.sql en dan supabase/hard-vragen-data.sql uitvoeren.
// Nieuwe Hard mode-vragen? Zet ze tijdelijk als "hardVragen" in data.js en draai dit script opnieuw: de SQL vervangt
// de vragen van dat vak in de tabel (upsert), en data.js wordt weer zonder vragen weggeschreven.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const vakMap = path.join(root, 'vak');
const regels = [
  '-- Gemaakt door supabase/maak-hard-vragen.js. Voer eerst supabase/hard-vragen.sql uit.',
  '-- Per vak de Hard mode-vragen; opnieuw uitvoeren vervangt ze.'
];
let vakken = 0;
let vragen = 0;

for (const id of fs.readdirSync(vakMap).sort()) {
  const bestand = path.join(vakMap, id, 'data.js');
  if (!fs.existsSync(bestand)) continue;
  const tekst = fs.readFileSync(bestand, 'utf8').replace(/\r\n/g, '\n');
  const start = tekst.indexOf('window.BES_VAK = ');
  if (start < 0) continue;
  global.window = {};
  new Function('window', tekst)(global.window);
  const vak = global.window.BES_VAK;
  if (!vak || !Array.isArray(vak.hardVragen) || !vak.hardVragen.length) continue;

  // Zelfde inspringing als het bestand nu heeft, zodat alleen de Hard mode-regels veranderen.
  const inspring = [1, 2].find(n => tekst.slice(start) === 'window.BES_VAK = ' + JSON.stringify(vak, null, n) + ';\n');
  if (!inspring) { console.log(`overgeslagen: ${id} (opmaak wijkt af, pas met de hand aan)`); continue; }

  const json = JSON.stringify(vak.hardVragen);
  if (json.includes('$hv$')) throw new Error(`${id}: de tekst bevat $hv$`);
  regels.push(`insert into public.hard_vragen (vak, vragen) values ('${id}', $hv$${json}$hv$::jsonb)\n  on conflict (vak) do update set vragen = excluded.vragen, bijgewerkt = now();`);

  const perHoofdstuk = {};
  for (const vraag of vak.hardVragen) perHoofdstuk[vraag.h] = (perHoofdstuk[vraag.h] || 0) + 1;
  const nieuw = {};
  for (const [sleutel, waarde] of Object.entries(vak)) {
    if (sleutel === 'hardVragen') nieuw.hardPerHoofdstuk = perHoofdstuk;
    else nieuw[sleutel] = waarde;
  }
  fs.writeFileSync(bestand, tekst.slice(0, start) + 'window.BES_VAK = ' + JSON.stringify(nieuw, null, inspring) + ';\n');
  vakken++;
  vragen += vak.hardVragen.length;
}

if (vakken) fs.writeFileSync(path.join(__dirname, 'hard-vragen-data.sql'), regels.join('\n') + '\n');
console.log(`${vragen} Hard mode-vragen uit ${vakken} vakken naar supabase/hard-vragen-data.sql; data.js heeft nu hardPerHoofdstuk.`);
