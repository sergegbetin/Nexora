#!/usr/bin/env node
/**
 * Audit visuel & responsive — vérifie ce que l'audit DOM ne peut pas voir :
 *
 *   1. 5 largeurs (1440, 1280, 1024, 390, 375) sur les routes prioritaires :
 *      aucun overflow horizontal, aucun élément hors écran, images chargées et
 *      avec `alt`, polices réellement disponibles, 1 <h1>, title après rendu
 *      client, contrastes WCAG AA, ressources en échec (404/500).
 *   2. Parcours utilisateur complet (accueil → boutique → produit → panier →
 *      checkout → confirmation → retour arrière) + états de l'interface.
 *   3. Zéro erreur console (JavaScript) pendant toute l'exécution.
 *   4. Contrôles statiques : focus visible, prefers-reduced-motion, chargement
 *      différé des images et réservation de place.
 *
 * Prérequis : `npm run build` (les sondes sont copiées dans dist/) et un
 * Chrome/Chromium installé (sinon : CHROME_PATH=/chemin/vers/chrome).
 *
 * Usage : npm run audit:visual
 */
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PORT = 4200;
const BASE = `http://127.0.0.1:${PORT}`;

const WIDTHS = [1440, 1280, 1024, 390, 375];
const ROUTES = [
  '/',
  '/boutique',
  '/categorie/audio',
  '/produit/nexora-soundmax-headphones',
  '/panier',
  '/checkout',
  '/compte',
  '/faq',
  '/confidentialite',
];

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
const note = (message) => console.log(`INFO ${message}`);

const decode = (text) =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');

if (!chrome) {
  console.error('FAIL aucun Chrome/Chromium détecté — définissez CHROME_PATH.');
  process.exit(1);
}
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('FAIL dist/ introuvable — lancez `npm run build` avant cet audit.');
  process.exit(1);
}

/** Exécute une sonde headless et renvoie le corps de sortie + les erreurs console. */
function runProbe(probe, query, { budget = 90000, timeout = 180000 } = {}) {
  const target = join(DIST, `__${probe}`);
  copyFileSync(join(ROOT, 'scripts', 'probes', probe), target);
  try {
    const run = spawnSync(
      chrome,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--enable-logging=stderr',
        '--v=0',
        `--virtual-time-budget=${budget}`,
        '--window-size=1440,1200',
        '--dump-dom',
        `${BASE}/__${probe}${query}`,
      ],
      { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 },
    );
    const body = run.stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/);
    const output = body ? decode(body[1]) : '';
    const consoleErrors = (run.stderr || '')
      .split('\n')
      .filter((line) => /:ERROR:CONSOLE\(/.test(line))
      .map((line) => line.replace(/^.*?ERROR:CONSOLE\(\d+\)\s*/, '').trim())
      .filter((line) => line && !/favicon\.ico/.test(line));
    return { output, consoleErrors: [...new Set(consoleErrors)] };
  } finally {
    rmSync(target, { force: true });
  }
}

// ─── 4. Contrôles statiques (CSS / composants) ───────────────────────────────
function staticChecks() {
  const cssFiles = readdirSync(join(DIST, 'assets')).filter((f) => f.endsWith('.css'));
  const css = cssFiles.map((f) => readFileSync(join(DIST, 'assets', f), 'utf8')).join('\n');
  const smartImage = readFileSync(join(ROOT, 'src', 'components', 'SmartImage.tsx'), 'utf8');

  if (/:focus-visible\s*[,{]/.test(css)) ok('a11y · indicateur de focus visible défini (:focus-visible)');
  else fail('a11y · aucun style :focus-visible dans le CSS livré');

  if (/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css)) {
    ok('a11y · animations réduites gérées (prefers-reduced-motion)');
  } else {
    fail('a11y · bloc prefers-reduced-motion absent');
  }

  const media = (css.match(/@media/g) || []).length;
  if (media >= 5) ok(`responsive · ${media} points de rupture médias`);
  else fail(`responsive · seulement ${media} blocs @media`);

  const aspect = (css.match(/aspect-ratio/g) || []).length;
  if (aspect >= 3) ok(`perf · ${aspect} réservations de place (aspect-ratio)`);
  else fail(`perf · seulement ${aspect} utilisations d'aspect-ratio`);

  if (/loading=\{eager \? 'eager' : 'lazy'\}/.test(smartImage) && /decoding="async"/.test(smartImage)) {
    ok('perf · images en chargement différé + decoding="async"');
  } else {
    fail('perf · SmartImage sans loading="lazy" ou decoding="async"');
  }

  const html = readFileSync(join(DIST, 'index.html'), 'utf8');
  if (/viewport[^>]*content=/.test(html)) ok('responsive · meta viewport présent');
  else fail('responsive · meta viewport absent');
}

// ─── Exécution ───────────────────────────────────────────────────────────────
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

  const consoleErrors = [];
  const seenProblems = new Set();

  // ─── 1. Responsive ───────────────────────────────────────────────────────
  const routesQuery = encodeURIComponent(ROUTES.join(','));
  for (const width of WIDTHS) {
    const { output, consoleErrors: errs } = runProbe(
      'layout.html',
      `?width=${width}&routes=${routesQuery}`,
      { budget: 120000 },
    );
    consoleErrors.push(...errs);

    let payload;
    try {
      payload = JSON.parse(output);
    } catch {
      fail(`responsive ${width}px · sonde illisible (${output.slice(0, 120) || 'vide'})`);
      continue;
    }
    if (payload.error) {
      fail(`responsive ${width}px · ${payload.error.split('\n')[0]}`);
      continue;
    }

    const problems = payload.results.flatMap((r) =>
      r.problems.map((p) => `${width}px ${r.route} · ${p}`),
    );
    const infos = payload.results.flatMap((r) => r.info.map((i) => `${width}px ${r.route} · ${i}`));
    infos.forEach(note);
    // Les contrastes ne varient pas d'une largeur à l'autre : on ne répète qu'une fois.
    const fresh = problems.filter((problem) => {
      const key = problem.replace(/^\d+px /, '');
      if (seenProblems.has(key)) return false;
      seenProblems.add(key);
      return true;
    });
    if (problems.length) fresh.forEach(fail);
    else {
      ok(`responsive ${width}px · ${payload.results.length} routes sans défaut de mise en page`);
    }
  }

  // ─── 2. Parcours utilisateur ─────────────────────────────────────────────
  const journey = runProbe('journey.html', '', { budget: 150000, timeout: 240000 });
  consoleErrors.push(...journey.consoleErrors);
  const lines = journey.output.split('\n').filter(Boolean);
  if (!lines.length) {
    fail('parcours · aucun résultat de la sonde');
  } else {
    const journeyFails = lines.filter((line) => line.startsWith('FAIL'));
    const journeyOk = lines.filter((line) => line.startsWith('OK'));
    journeyFails.forEach((line) => fail(`parcours · ${line.replace(/^FAIL\s*/, '')}`));
    if (!journeyFails.length && journeyOk.length >= 10) {
      ok(`parcours · ${journeyOk.length} étapes fonctionnelles validées`);
    } else if (!journeyFails.length) {
      fail(`parcours · seulement ${journeyOk.length} étapes remontées (sonde incomplète ?)`);
    }
  }

  // ─── 3. Erreurs console ──────────────────────────────────────────────────
  const uniqueErrors = [...new Set(consoleErrors)];
  if (uniqueErrors.length) {
    uniqueErrors.slice(0, 5).forEach((line) => fail(`console · ${line.slice(0, 200)}`));
    if (uniqueErrors.length > 5) fail(`console · … et ${uniqueErrors.length - 5} autre(s)`);
  } else {
    ok('console · aucune erreur JavaScript pendant les audits navigateur');
  }

  // ─── 4. Statique ─────────────────────────────────────────────────────────
  staticChecks();
} catch (error) {
  fail(`exécution · ${error.message}`);
} finally {
  stop();
}

if (fails.length) {
  console.log(`\n${fails.length} échec(s) sur ${passed + fails.length} vérification(s) visuelles.`);
  process.exit(1);
}
console.log(`\nToutes les vérifications visuelles passent (${passed}).`);
