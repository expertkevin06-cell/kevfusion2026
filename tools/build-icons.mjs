/* KEV FUSION — génère TOUS les PNG requis par PWABuilder. Aucune dépendance, aucun réseau.
   Usage : node tools/build-icons.mjs */
import { writeFile, readFile, access } from 'node:fs/promises';
import { makeCtx } from './raster.mjs';
import { drawRally, DEF } from './car.mjs';

const ANY   = [16, 32, 48, 64, 72, 96, 128, 144, 152, 192, 384, 512];
const MASK  = [192, 512];
const APPLE = [180, 167, 152, 120];

/* réglages optionnels persistés par icons.html */
let OPT = {};
try { OPT = JSON.parse(await readFile('icon-config.json', 'utf8')); } catch { OPT = {}; }
const base = Object.assign({}, DEF, OPT);

function make(size, maskable, ss) {
  const ctx = makeCtx(size, ss);
  drawRally(ctx, size, Object.assign({}, base, {
    maskable,
    radius: maskable ? 0 : base.radius,
    scale: maskable ? base.scale * 0.92 : base.scale
  }));
  return ctx.toPNG();
}

const jobs = [];
ANY.forEach(s => jobs.push([`icon-${s}.png`, s, false]));
MASK.forEach(s => jobs.push([`icon-${s}-maskable.png`, s, true]));
APPLE.forEach(s => jobs.push([`apple-${s}.png`, s, true]));
jobs.push(['apple-touch-icon.png', 180, true]);
jobs.push(['favicon-32.png', 32, false]);
jobs.push(['favicon-16.png', 16, false]);

let n = 0;
for (const [name, size, mask] of jobs) {
  const ss = size <= 64 ? 4 : (size <= 192 ? 3 : 2);
  const buf = make(size, mask, ss);
  await writeFile(name, buf);
  n++;
  console.log(`✓ ${name.padEnd(26)} ${String(size).padStart(4)}px  ${(buf.length / 1024).toFixed(1)} Ko`);
}

/* vérification stricte du manifest : chaque src doit exister et être un PNG déclaré */
const mf = JSON.parse(await readFile('manifest.webmanifest', 'utf8'));
const problems = [];
const check = async (ic, where) => {
  if (!ic.src) return problems.push(`${where}: src absent`);
  if (!/^image\/png$/.test(ic.type || '')) problems.push(`${where}: type doit être image/png (${ic.src})`);
  if (!/^\d+x\d+$/.test(ic.sizes || '')) problems.push(`${where}: sizes doit être NxN (${ic.src})`);
  try { await access(ic.src.replace(/^\.\//, '')); }
  catch { problems.push(`${where}: fichier introuvable ${ic.src}`); }
};
for (const ic of mf.icons || []) await check(ic, 'icons');
for (const sc of mf.shortcuts || []) for (const ic of sc.icons || []) await check(ic, `shortcut "${sc.name}"`);

console.log(`\n${n} PNG générés.`);
if (problems.length) { console.error('✗ Manifest invalide :\n - ' + problems.join('\n - ')); process.exit(1); }
console.log('✅ manifest.webmanifest : liens, types et tailles valides — PWABuilder prêt.');
