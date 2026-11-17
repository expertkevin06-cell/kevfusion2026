/* KEV FUSION 2026 — rasterise icon.svg (voiture de rallye) vers tous les PNG requis par PWABuilder.
   Aucune police, aucun asset binaire : source unique = icon.svg. Node 20 + sharp. */
import { readFile, writeFile, access } from 'node:fs/promises';
import sharp from 'sharp';

const SRC = 'icon.svg';
const ANY   = [16, 32, 48, 64, 72, 96, 128, 144, 152, 192, 384, 512];
const MASK  = [192, 512];
const APPLE = [180, 167, 152, 120];

const raw = await readFile(SRC, 'utf8');
const m = raw.match(/<!--CAR-->([\s\S]*?)<!--\/CAR-->/);
if (!m) { console.error('✗ marqueurs <!--CAR--> … <!--/CAR--> absents de icon.svg'); process.exit(1); }
const CAR = m[1];

const BG_DEFS = `<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#04140c"/><stop offset=".52" stop-color="#0a3220"/><stop offset="1" stop-color="#0d4a2b"/></linearGradient>
<radialGradient id="spot" cx=".36" cy=".24" r=".82"><stop offset="0" stop-color="#2ce06a" stop-opacity=".34"/><stop offset=".55" stop-color="#0d4a2b" stop-opacity=".18"/><stop offset="1" stop-color="#04140c" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".46" r=".78"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
</defs>`;

function wrap({ size, radius, scale, maskable }) {
  const rx = maskable ? 0 : Math.round(512 * radius);
  const k = scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
${BG_DEFS}
<rect x="0" y="0" width="512" height="512" rx="${rx}" fill="url(#bg)"/>
<rect x="0" y="0" width="512" height="512" rx="${rx}" fill="url(#spot)"/>
<rect x="0" y="300" width="512" height="212" rx="${rx}" fill="url(#floor)"/>
<rect x="0" y="0" width="512" height="512" rx="${rx}" fill="url(#vig)"/>
<g transform="translate(256 262) scale(${k}) translate(-256 -262)">${CAR}</g>
</svg>`;
}

const jobs = [];
for (const s of ANY)   jobs.push([`icon-${s}.png`,            wrap({ size: s, radius: 0.227, scale: 1,    maskable: false })]);
for (const s of MASK)  jobs.push([`icon-${s}-maskable.png`,   wrap({ size: s, radius: 0,     scale: 0.76, maskable: true  })]);
for (const s of APPLE) jobs.push([`apple-${s}.png`,           wrap({ size: s, radius: 0,     scale: 0.94, maskable: true  })]);
jobs.push(['apple-touch-icon.png', wrap({ size: 180, radius: 0, scale: 0.94, maskable: true })]);
jobs.push(['favicon-32.png',       wrap({ size: 32,  radius: 0.227, scale: 1, maskable: false })]);
jobs.push(['favicon-16.png',       wrap({ size: 16,  radius: 0.227, scale: 1, maskable: false })]);

let ok = 0;
for (const [name, svg] of jobs) {
  const buf = await sharp(Buffer.from(svg), { density: 384 })
    .resize({ width: parseInt(name.match(/(\d+)/)?.[1] || '180', 10) || 180, fit: 'fill' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  await writeFile(name, buf);
  ok++;
  console.log('✓', name, (buf.length / 1024).toFixed(1) + ' Ko');
}

/* contrôle : chaque src du manifest doit exister */
const mf = JSON.parse(await readFile('manifest.webmanifest', 'utf8'));
let missing = [];
for (const ic of mf.icons || []) {
  if (ic.src.startsWith('data:')) continue;
  try { await access(ic.src.replace(/^\.\//, '')); } catch { missing.push(ic.src); }
}
for (const sc of mf.shortcuts || []) for (const ic of sc.icons || []) {
  try { await access(ic.src.replace(/^\.\//, '')); } catch { missing.push(ic.src); }
}
console.log(`\n${ok} PNG générés.`);
if (missing.length) { console.error('✗ icons manquants dans le manifest :', [...new Set(missing)].join(', ')); process.exit(1); }
console.log('✅ manifest.webmanifest : tous les icons resolves — PWABuilder prêt.');
