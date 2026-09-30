#!/usr/bin/env node
/**
 * Pré-rendu statique — SEO côté serveur sans casser le routing client.
 *
 * Pour chaque route publique, produit `dist/<route>/index.html` contenant :
 *   - le corps rendu par React (le contenu principal est donc visible sans JS) ;
 *   - un `<head>` complet : title, description, canonical, Open Graph,
 *     Twitter Card, robots et JSON-LD.
 *
 * La SPA se reprend ensuite la main au chargement (createRoot, sans hydratation) :
 * aucun mismatch possible, le HTML statique sert les crawlers et le LCP.
 *
 * Génère aussi `robots.txt` et `sitemap.xml`.
 *
 * Usage : npm run build   (dernière étape)
 *         npm run prerender
 *
 * Sans `VITE_SITE_URL`, canonical et sitemap tombent sur le repli local —
 * un avertissement est affiché (voir README « Deployment security »).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(ROOT, 'dist');
const SSR_BUNDLE = join(ROOT, '.ssr-build', 'ssr-entry.js');
const TEMPLATE = join(DIST, 'index.html');

const fail = (message) => {
  console.error(`FAIL ${message}`);
  process.exit(1);
};

if (!existsSync(TEMPLATE)) fail('dist/index.html introuvable — lancez `npm run build`.');
if (!existsSync(SSR_BUNDLE)) fail('.ssr-build/ssr-entry.js introuvable — le build SSR n\'a pas tourné.');

// ─── Shims navigateurs (identiques à scripts/ssr-smoke.mjs) ─────────────────
const FALLBACK_ORIGIN = 'http://localhost:4173';
const storage = new Map();
globalThis.window = {
  location: { origin: FALLBACK_ORIGIN, pathname: '/', search: '', hash: '' },
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
  scrollTo: () => {},
};
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const { renderPage, prerenderRoutes, siteOrigin } = await import(pathToFileURL(SSR_BUNDLE).href);

// Origine réellement utilisée dans les balises (import.meta.env VITE_SITE_URL
// cuit dans le bundle) — sert au robots.txt et au sitemap.
const SITE_ORIGIN = siteOrigin();

const template = readFileSync(TEMPLATE, 'utf8');

/** Retire les balises SEO statiques du gabarit pour ne jamais les dupliquer. */
const stripSeo = (html) =>
  html
    .replace(/<title[^>]*>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+(?:name="(?:description|robots)"|property="og:[^"]*")[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '')
    .replace(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi, '');

const base = stripSeo(template);
if (/<title[\s>]/i.test(base) || /name="description"/i.test(base)) {
  fail('échec du nettoyage du gabarit : title/description toujours présents.');
}

const buildDocument = ({ head, html }) =>
  base.replace('</head>', () => `    ${head}\n  </head>`).replace('<div id="root"></div>', () => `<div id="root">${html}</div>`);

const routes = prerenderRoutes();
const indexable = [];
let written = 0;

const write = (relativeFile, content) => {
  const target = join(DIST, relativeFile);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  written += 1;
};

for (const route of routes) {
  const page = renderPage(route);
  if (!page.seo?.title) fail(`route ${route} : aucune métadonnée (useSeo manquant ?)`);
  if (!/<h1[\s>]/.test(page.html)) fail(`route ${route} : aucun <h1> dans le HTML pré-rendu`);

  const document = buildDocument(page);
  const relative = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}/index.html`;
  write(relative, document);

  if (!page.seo.robots?.includes('noindex')) indexable.push(route);
}

// 404 servi par les hébergeurs pour toute route inconnue.
const notFound = renderPage('/route-inexistante-pour-le-404');
write('404.html', buildDocument(notFound));

// ─── robots.txt + sitemap.xml ───────────────────────────────────────────────
write(
  'robots.txt',
  [`User-agent: *`, `Allow: /`, ``, `Sitemap: ${SITE_ORIGIN}/sitemap.xml`, ``].join('\n'),
);

write(
  'sitemap.xml',
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...indexable.map((route) => `  <url><loc>${SITE_ORIGIN}${route}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n'),
);

const hostConfigured = Boolean(SITE_ORIGIN && SITE_ORIGIN !== FALLBACK_ORIGIN);
console.log(`Pré-rendu : ${written} fichiers (${indexable.length} routes indexables).`);
console.log('Générés : robots.txt, sitemap.xml, 404.html.');
if (!hostConfigured) {
  console.warn(
    '\nATTENTION : VITE_SITE_URL est absente — canonical, og:url, robots.txt et sitemap.xml\n' +
      `utilisent le repli local « ${SITE_ORIGIN} ». Définissez-la avant la production :\n` +
      '  VITE_SITE_URL=https://www.votre-domaine.fr npm run build',
  );
}
