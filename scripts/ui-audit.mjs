#!/usr/bin/env node
/**
 * Audit UI — vérifie ce que l'audit DOM (npm run audit) ne peut pas voir :
 *
 *   1. les polices auto-hébergées se chargent réellement dans le navigateur ;
 *   2. l'effacement des données locales vide bien le stockage du navigateur
 *      (connexion → carte « Données locales » → confirmation).
 *
 * Prérequis : `npm run build` (les sondes sont copiées dans dist/) et un
 * Chrome/Chromium installé (sinon : CHROME_PATH=/chemin/vers/chrome).
 *
 * Usage : npm run audit:ui
 */
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PORT = 4199;
const BASE = `http://127.0.0.1:${PORT}`;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));

const fails = [];
let passed = 0;
const ok = (message) => {
  passed += 1;
  console.log(`OK   ${message}`);
};
const fail = (message) => {
  fails.push(message);
  console.log(`FAIL ${message}`);
};

const decode = (text) =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');

const CHECKS = [
  {
    probe: 'fonts.html',
    expect: [
      'fonts.status = loaded',
      'Inter 400 dispo = true',
      'Space Grotesk 700 dispo = true',
      'police calculée (h1) = "Space Grotesk", sans-serif',
    ],
    label: 'polices auto-hébergées réellement utilisées',
  },
  {
    probe: 'clear-data.html',
    expect: [
      'carte données locales présente = true',
      'bouton effacement présent = true',
      'confirmation affichée = true',
      'total de clés restantes = 0',
    ],
    label: 'effacement des données locales (stockage vidé)',
  },
];

if (!chrome) {
  console.error('FAIL aucun Chrome/Chromium détecté — définissez CHROME_PATH.');
  process.exit(1);
}
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('FAIL dist/ introuvable — lancez `npm run build` avant cet audit.');
  process.exit(1);
}

// ─── Serveur de prévisualisation dédié à l'audit ────────────────────────────
const viteBin = join(ROOT, 'node_modules', '.bin', 'vite');
if (!existsSync(viteBin)) {
  console.error('FAIL dépendances absentes — lancez `npm install`.');
  process.exit(1);
}
const server = spawn(viteBin, ['preview', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  stdio: 'ignore',
  detached: false,
});

const stop = () => {
  if (!server.killed) server.kill('SIGTERM');
};

try {
  let ready = false;
  for (let attempt = 0; attempt < 60 && !ready; attempt += 1) {
    try {
      const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(500) });
      ready = res.ok;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  if (!ready) throw new Error('serveur de prévisualisation non démarré');

  for (const check of CHECKS) {
    const target = join(DIST, `__${check.probe}`);
    copyFileSync(join(ROOT, 'scripts', 'probes', check.probe), target);
    const run = spawnSync(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--virtual-time-budget=15000',
      '--dump-dom',
      `${BASE}/__${check.probe}`,
    ], { encoding: 'utf8', timeout: 60000, maxBuffer: 32 * 1024 * 1024 });

    rmSync(target, { force: true });

    const body = run.stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/);
    const output = body ? decode(body[1]) : '';
    if (!output) {
      fail(`${check.label} · aucun résultat de la sonde (${check.probe})`);
      continue;
    }
    const missing = check.expect.filter((line) => !output.includes(line));
    if (missing.length) {
      fail(`${check.label} · attendu : ${missing.join(' | ')} — obtenu : ${output.replace(/\n/g, ' / ')}`);
    } else {
      ok(check.label);
    }
  }
} catch (error) {
  fail(`exécution · ${error.message}`);
} finally {
  stop();
}

if (fails.length) {
  console.log(`\n${fails.length} échec(s) sur ${passed + fails.length} vérification(s) UI.`);
  process.exit(1);
}
console.log(`\nToutes les vérifications UI passent (${passed}).`);
