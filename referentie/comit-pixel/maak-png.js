// Maakt PNG-afbeeldingen van Comit uit het raster in comit-pixel.js, zonder extra pakketten.
// Gebruik: node referentie/comit-pixel/maak-png.js [schaal]   (standaard 16 = 256×352 px)
// Uitvoer: comit-licht.png en comit-donker.png naast dit bestand.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const comit = require('./comit-pixel.js').COMIT_PIXEL;

const schaal = Number(process.argv[2]) || 16;

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function hex(kleur) {
  const m = kleur.match(/^#([0-9a-f]{6})$/i);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function png(palet, bestand) {
  const b = comit.breedte * schaal, h = comit.hoogte * schaal;
  const rijen = [];
  for (let y = 0; y < h; y++) {
    const rij = Buffer.alloc(1 + b * 4); // filter 0 + RGBA
    for (let x = 0; x < b; x++) {
      const teken = comit.RASTER[Math.floor(y / schaal)][Math.floor(x / schaal)];
      const i = 1 + x * 4;
      if (teken === '.') { rij[i + 3] = 0; continue; }
      const [r, g, bl] = hex(palet[teken]);
      rij[i] = r; rij[i + 1] = g; rij[i + 2] = bl; rij[i + 3] = 255;
    }
    rijen.push(rij);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(b, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const out = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rijen))),
    chunk('IEND', Buffer.alloc(0))
  ]);
  fs.writeFileSync(path.join(__dirname, bestand), out);
  console.log(bestand, b + '×' + h);
}

png(comit.PALET.licht, 'comit-licht.png');
png(comit.PALET.donker, 'comit-donker.png');
