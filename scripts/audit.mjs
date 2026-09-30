/**
 * Audit automatisé du site NEXORA.
 *
 * 1. Vérifie le <head> statique (SEO : title, description, Open Graph, lang).
 * 2. Vérifie que chaque image référencée par le code existe dans public/images.
 * 3. Rend chaque route côté serveur et vérifie les blocs attendus (balises
 *    analysées sans leurs marquages pour ne pas dépendre de la mise en forme).
 * 4. Pré-remplit panier + commande dans le stockage simulé pour contrôler les
 *    états riches (panier rempli, checkout, confirmation).
 *
 * Usage : npm run audit
 */
import { createServer } from 'vite';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());

/** Retire les balises, décode les entités et normalise les espaces. */
const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;|&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

/** Colonnes attendues : motif présent dans le texte visible de la page. */
const ROUTES = {
  '/': [
    'NEXORA CYBER WEEK',
    'Les offres Q4 que vous attendiez.',
    'Découvrez une sélection de produits tech et lifestyle',
    "Jusqu'à -50%",
    'Acheter maintenant',
    'Découvrir les offres',
    'Paiement sécurisé',
    'Livraison fiable',
    'Retours simples',
    'Support client',
    'Explorez nos catégories.',
    'Les plus populaires',
    'Offre flash',
    'Votre prochaine bonne affaire est ici.',
    'Trouvez le cadeau parfait',
    'Ils ont choisi NEXORA',
    'Avis de démonstration',
    'Ne manquez aucune offre.',
    "Je m'inscris",
    'Smart deals. Better living.',
    'Service client',
    'Confidentialité',
  ],
  '/boutique': [
    'Tout ce qui rend le quotidien meilleur.',
    'Trier par',
    'Prix croissant',
    'Prix décroissant',
    'Nouveautés',
    'Popularité',
    'Meilleures ventes',
    'Budget',
    'Notation minimale',
    'Disponibilité & promos',
    'Réinitialiser les filtres',
    'Filtres',
    'produit',
  ],
  '/categorie/audio': ['Audio', 'Ajouter au panier'],
  '/produit/nexora-soundmax-headphones': [
    'NEXORA SoundMax Headphones',
    'Ajouter au panier',
    'Acheter maintenant',
    'Économisez',
    'Livraison estimée',
    'Retours simples',
    'Paiement sécurisé',
    'Description',
    'Caractéristiques',
    'Avis',
    'FAQ produit',
    'Vous aimerez aussi',
    'Avis de démonstration',
  ],
  '/panier': ['Votre panier.', 'Votre panier est vide.'],
  '/checkout': ['Votre panier est vide.', 'Retour à la boutique'],
  '/confirmation': ['Aucune commande récente.', 'Retour à la boutique'],
  '/recherche': ['Quel sera votre', 'Catégories', 'Produits populaires'],
  '/favoris': ['Vos envies', 'Explorer la boutique'],
  '/compte': ['Compte'],
  '/faq': ['FAQ'],
  '/contact': ['Contact'],
  '/conditions': ['Conditions'],
  '/confidentialite': ['Confidentialité'],
  '/livraison': ['Livraison'],
  '/retours': ['Retour'],
};

/** États riches : nécessitent un panier / une commande pré-chargés. */
const SEEDED_ROUTES = {
  '/panier': ['Sous-total', 'Passer au paiement', 'Paiement sécurisé'],
  '/checkout': [
    'Vos informations',
    'Continuer',
    'NEXORA SoundMax Headphones',
    'Remise',
    'Aucune donnée bancaire stockée',
  ],
  '/confirmation': [
    'Commande confirmée.',
    'Continuer mes achats',
    'Total payé',
    'NEXORA SoundMax Headphones',
  ],
};

const failures = [];
const warnings = [];
const ok = (msg) => console.log(`OK   ${msg}`);
const fail = (msg) => {
  failures.push(msg);
  console.log(`FAIL ${msg}`);
};
/** Avertissement non bloquant (action humaine requise, mais pas une régression). */
const warn = (msg) => {
  warnings.push(msg);
  console.log(`WARN ${msg}`);
};
/** Les titles sortent HTML-encodés (`&amp;`) : on décode avant toute comparaison. */
const decodeHtml = (value) =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

// ─── 1. <head> statique ───────────────────────────────────────────────────────
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
for (const needle of [
  'lang="fr"',
  'name="description"',
  'property="og:title"',
  'property="og:description"',
  'property="og:image"',
  'name="viewport"',
]) {
  html.includes(needle) ? ok(`head · ${needle}`) : fail(`head manquant · ${needle}`);
}
// Le title porte désormais `data-seo` (mis à jour par la SPA et figé au
// pré-rendu) : on contrôle le contenu de la balise, pas ses attributs.
/<title[^>]*>NEXORA — Cyber Week \| Tech &amp; Lifestyle Deals<\/title>/.test(html)
  ? ok('head · <title> conforme')
  : fail('head manquant · <title> NEXORA — Cyber Week');

// Aucune ressource chargée depuis l'extérieur : vie privée + CSP en mode strict.
const externalRefs = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
externalRefs.length
  ? fail(`head · ressource externe détectée : ${externalRefs.join(', ')}`)
  : ok('head · aucune ressource externe (tout est servi depuis le site)');

// ─── 2. Intégrité des images ─────────────────────────────────────────────────
const sourceFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry)) sourceFiles.push(full);
  }
};
walk(join(ROOT, 'src'));

const refs = new Set();
for (const file of sourceFiles) {
  const content = readFileSync(file, 'utf8');
  for (const match of content.matchAll(/image\('([^']+)'\)/g)) refs.add(match[1]);
  for (const match of content.matchAll(/'(\/?images\/[^']+)'/g)) refs.add(match[1].replace(/^images\//, ''));
}
let missingImages = 0;
for (const ref of [...refs].sort()) {
  if (!existsSync(join(ROOT, 'public', 'images', ref))) {
    missingImages += 1;
    fail(`image manquante · public/images/${ref}`);
  }
}
if (!missingImages) ok(`${refs.size} images référencées trouvées dans public/images`);

// ─── 3. CTA principaux présents dans les composants ─────────────────────────
const CTAS = [
  ['src/pages/Home.tsx', 'Acheter maintenant'],
  ['src/pages/Home.tsx', 'Découvrir les offres'],
  ['src/pages/ProductPage.tsx', 'Ajouter au panier'],
  ['src/pages/ProductPage.tsx', 'Acheter maintenant'],
  ['src/pages/CartPage.tsx', 'Passer au paiement'],
  ['src/pages/CheckoutPage.tsx', 'Confirmer la commande'],
  ['src/components/Header.tsx', 'Voir les offres'],
  ['src/pages/ProductPage.tsx', 'sticky-cart'],
];
let missingCta = 0;
for (const [file, needle] of CTAS) {
  const content = readFileSync(join(ROOT, file), 'utf8');
  if (!content.includes(needle)) {
    missingCta += 1;
    fail(`CTA manquant · ${file} → « ${needle} »`);
  }
}
if (!missingCta) ok(`${CTAS.length} CTA principaux présents`);

// ─── 4. Sécurité ────────────────────────────────────────────────────────────
const SECURITY_RULES = [
  {
    // Aucune injection de HTML : React échappe par défaut, on interdit les sorties brutes.
    pattern: /dangerouslySetInnerHTML|\.innerHTML\s*=|document\.write\(|\beval\s*\(|new Function\s*\(/,
    files: sourceFiles,
    ko: 'sink XSS utilisé',
    ok: 'aucun sink XSS (dangerouslySetInnerHTML / innerHTML / eval)',
  },
  {
    // Prototype : rien ne doit sortir du navigateur vers un serveur.
    // Exception unique et encadrée : StripePayment, qui contacte l'endpoint de
    // paiement same-origin (VITE_STRIPE_INTENT_ENDPOINT) en mode Stripe.
    pattern: /\bfetch\s*\(|\baxios\b|XMLHttpRequest|sendBeacon|WebSocket\s*\(/,
    files: sourceFiles,
    allow: [/src[\\/]components[\\/]StripePayment\.tsx$/],
    ko: 'appel réseau détecté',
    ok: 'aucun appel réseau sortant (hors endpoint de paiement same-origin)',
  },
  {
    pattern: /target=["']_blank["'](?![^>]*rel=)/,
    files: sourceFiles,
    ko: 'target="_blank" sans rel="noopener"',
    ok: 'aucun lien externe ouvert sans rel de sécurité',
  },
  {
    // Les données de carte ne doivent jamais rejoindre l'état persistant.
    pattern: /\bcard\b/,
    files: [join(ROOT, 'src/context/StoreContext.tsx')],
    ko: 'un champ bancaire transite par le store persistant',
    ok: 'aucune donnée bancaire dans le store / le stockage local',
  },
  {
    // Vie privée + CSP stricte : aucune ressource chargée depuis un tiers.
    pattern:
      /fonts\.googleapis\.com|fonts\.gstatic\.com|google-analytics\.com|googletagmanager|cdn\.[a-z]|unpkg\.com|jsdelivr\.net/,
    files: [
      ...sourceFiles,
      join(ROOT, 'index.html'),
      ...readdirSync(join(ROOT, 'src', 'styles'))
        .filter((f) => f.endsWith('.css'))
        .map((f) => join(ROOT, 'src', 'styles', f)),
    ],
    ko: 'service tiers référencé',
    ok: 'aucun tiers externe (polices, scripts et images auto-hébergés)',
  },
];

let securityFailures = 0;
for (const rule of SECURITY_RULES) {
  const hit = rule.files.find((file) => {
    const content = readFileSync(file, 'utf8');
    if (!rule.pattern.test(content)) return false;
    if (rule.allow?.some((allowed) => allowed.test(file))) {
      // Fichier toléré : on n'accepte que l'appel vers l'endpoint configuré.
      // Une URL externe codée en dur, XHR, WebSocket ou beacon reste bloquante.
      return /\bfetch\s*\(\s*["'`]https?:\/\/|\baxios\b|XMLHttpRequest|sendBeacon|WebSocket\s*\(/.test(
        content,
      );
    }
    return true;
  });
  if (hit) {
    securityFailures += 1;
    fail(`sécurité · ${rule.ko} (${hit.replace(`${ROOT}/`, '')})`);
  }
}
if (!securityFailures) ok(`sécurité · code source conforme (${SECURITY_RULES.length} règles)`);

// Ressources chargées en http:// (mixed content) — les espaces de noms SVG sont exclus.
const insecureRefs = [];
for (const file of [...sourceFiles, join(ROOT, 'index.html')]) {
  const content = readFileSync(file, 'utf8');
  for (const match of content.matchAll(/["'(](http:\/\/[^"')\s]+)/g)) {
    const url = match[1];
    // w3.org = espace de noms XML ; localhost/127.0.0.1 = repli local d'origine.
    if (/w3\.org/.test(url) || /^http:\/\/(localhost|127\.0\.0\.1)/.test(url)) continue;
    insecureRefs.push(`${file.replace(`${ROOT}/`, '')} → ${url}`);
  }
}
insecureRefs.length
  ? fail(`ressource non chiffrée · ${insecureRefs.join(', ')}`)
  : ok('sécurité · aucune ressource chargée en http:// (mixed content)');

const headers = join(ROOT, 'public', '_headers');
if (!existsSync(headers)) {
  fail('sécurité · public/_headers absent (en-têtes de sécurité non déployés)');
} else {
  const headersContent = readFileSync(headers, 'utf8');
  const requiredHeaders = [
    'Content-Security-Policy',
    'frame-ancestors',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'X-Frame-Options',
    'Permissions-Policy',
    'Strict-Transport-Security',
  ];
  const missingHeaders = requiredHeaders.filter((h) => !headersContent.includes(h));
  missingHeaders.length
    ? fail(`sécurité · en-têtes manquants dans _headers : ${missingHeaders.join(', ')}`)
    : ok(`sécurité · ${requiredHeaders.length} en-têtes de sécurité dans public/_headers`);
}

const headOk = html.includes('name="referrer"');
headOk ? ok('sécurité · meta referrer présente') : fail('sécurité · meta referrer absente de index.html');

// ─── 4bis. Secrets et champs bancaires ─────────────────────────────────────
const SECRET_PATTERNS = [
  [/sk_(?:live|test)_[A-Za-z0-9]{10,}/, 'clé secrète Stripe'],
  [/whsec_[A-Za-z0-9]{10,}/, 'secret de webhook Stripe'],
  [/rk_(?:live|test)_[A-Za-z0-9]{10,}/, 'clé restreinte Stripe'],
];
const secretsFound = [];
for (const file of [...sourceFiles, join(ROOT, 'index.html')]) {
  const content = readFileSync(file, 'utf8');
  for (const [pattern, label] of SECRET_PATTERNS) {
    if (pattern.test(content)) secretsFound.push(`${file.replace(`${ROOT}/`, '')} (${label})`);
  }
}
secretsFound.length
  ? fail(`sécurité · secret exposé → ${secretsFound.join(', ')}`)
  : ok('sécurité · aucune clé secrète dans le code source ni dans le HTML');

// Aucun champ bancaire côté frontend : les données de carte ne peuvent être ni
// saisies dans notre état, ni stockées, ni affichées hors de l'iframe Stripe.
const paymentFiles = sourceFiles.filter((file) =>
  /CheckoutPage|PaymentStep|StripePayment/.test(file),
);
// On cible les balises <input> (et non la prose explicative du mode démo).
const CARD_FIELD =
  /<input\b[^>]*(?:4242|cvc|cvv|card|expiry|expiration|cc-number|cc-csc|cc-exp)|Num[ée]ro de carte\s*<input/i;
const cardFields = paymentFiles.filter((file) => CARD_FIELD.test(readFileSync(file, 'utf8')));
cardFields.length
  ? fail(`sécurité · champ bancaire détecté → ${cardFields.join(', ')}`)
  : ok('sécurité · aucun champ bancaire côté frontend (iframe Stripe uniquement)');

// Endpoint de paiement : la seule requête autorisée du front doit viser une URL
// configurée (same-origin) — jamais une adresse tierce codée en dur.
const stripePaymentFile = join(ROOT, 'src', 'components', 'StripePayment.tsx');
if (existsSync(stripePaymentFile)) {
  const paymentSource = readFileSync(stripePaymentFile, 'utf8');
  const targeted = /fetch\(\s*config\.intentEndpoint/.test(paymentSource);
  const hardcoded = /fetch\s*\(\s*["'`]https?:\/\//.test(paymentSource);
  targeted && !hardcoded
    ? ok('paiement · requête limitée à l’endpoint configuré (aucune URL tierce en dur)')
    : fail('paiement · StripePayment doit appeler uniquement config.intentEndpoint');
}

// Polices auto-hébergées : la déclaration et les fichiers doivent exister.
const fontCssPath = join(ROOT, 'src', 'styles', 'fonts.css');
if (!existsSync(fontCssPath)) {
  fail('sécurité · src/styles/fonts.css absent (polices non auto-hébergées)');
} else {
  const fontCss = readFileSync(fontCssPath, 'utf8');
  const refs = [...fontCss.matchAll(/url\('\/fonts\/([^']+)'\)/g)].map((m) => m[1]);
  const missing = refs.filter((f) => !existsSync(join(ROOT, 'public', 'fonts', f)));
  refs.length === 0
    ? fail('sécurité · aucune déclaration @font-face auto-hébergée')
    : missing.length
      ? fail(`sécurité · polices manquantes : ${missing.join(', ')}`)
      : ok(`sécurité · ${refs.length} fontes auto-hébergées (0 requête tierce)`);
}

// ─── Shims navigateurs pour le rendu serveur ────────────────────────────────
const storage = new Map();
globalThis.window = {
  location: { origin: 'http://127.0.0.1:4173' },
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

// ─── Phase 1 : états par défaut (panier, favoris et commande vides) ──────────
/**
 * Le store fige son état initial au premier import du module, l'audit se
 * déroule donc en deux phases : d'abord les états vides, puis un second
 * serveur avec le stockage pré-rempli.
 */
const createVite = async () =>
  createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });

const check = (route, expectations, htmlContent, label) => {
  const visible = text(htmlContent);
  const missing = expectations.filter((needle) => !visible.includes(text(needle)));
  if (!/<h1[\s>]/.test(htmlContent)) missing.push('un <h1>');
  missing.length ? fail(`${label} ${route} — manquant : ${missing.join(' | ')}`) : ok(`${label} ${route}`);
};

let vite = await createVite();
try {
  const { render } = await vite.ssrLoadModule('/src/ssr-entry.tsx');
  for (const [route, expectations] of Object.entries(ROUTES)) {
    try {
      check(route, expectations, render(route), 'route');
    } catch (error) {
      fail(`route ${route} — erreur de rendu : ${error.message}`);
    }
  }
} catch (error) {
  fail(`chargement du bundle — ${error.message}`);
} finally {
  await vite.close();
}

// ─── Phase 2 : panier rempli + commande déjà validée ─────────────────────────
vite = await createVite();
try {
  const { PRODUCTS } = await vite.ssrLoadModule('/src/data/products.ts');
  const cartItems = ['nexora-soundmax-headphones', 'nexora-vision-smartwatch']
    .map((slug) => PRODUCTS.find((p) => p.slug === slug))
    .filter(Boolean)
    .map((product) => ({ product, quantity: 2 }));

  storage.set('nexora_cart', JSON.stringify(cartItems));
  storage.set('nexora_promo', JSON.stringify('CYBERWEEK15'));
  storage.set(
    'nexora_order',
    JSON.stringify({
      number: 'NX-2026-123456',
      date: '30 septembre 2026',
      items: cartItems,
      subtotal: 359.6,
      shipping: 0,
      discount: 53.94,
      total: 305.66,
      customer: {
        name: 'Camille Martin',
        email: 'camille@example.fr',
        phone: '0612345678',
        address: '12 rue des Lilas',
        city: 'Lyon',
        country: 'France',
        zip: '69003',
      },
    }),
  );

  const { render } = await vite.ssrLoadModule('/src/ssr-entry.tsx');

  const cartHtml = render('/panier');
  check('/panier', SEEDED_ROUTES['/panier'], cartHtml, 'panier rempli');
  text(cartHtml).includes('Remise')
    ? ok('panier rempli · code promo appliqué et remise calculée')
    : fail('panier rempli · code promo non appliqué (remise absente)');

  check('/checkout', SEEDED_ROUTES['/checkout'], render('/checkout'), 'checkout rempli');
  check('/confirmation', SEEDED_ROUTES['/confirmation'], render('/confirmation'), 'confirmation');
} catch (error) {
  fail(`phase remplie — ${error.message}`);
} finally {
  await vite.close();
}

// ─── Phase 3 : pré-rendu statique, SEO et sitemap ───────────────────────────
const DIST = join(ROOT, 'dist');
vite = await createVite();
try {
  const { prerenderRoutes } = await vite.ssrLoadModule('/src/ssr-entry.tsx');
  const { PRODUCTS, CATEGORIES } = await vite.ssrLoadModule('/src/data/products.ts');
  const routes = prerenderRoutes();

  const routeSeo = new Map();
  const canonicalOwner = new Map();
  const problems = [];

  for (const route of routes) {
    const relative = route === '/' ? 'index.html' : `${route.slice(1)}/index.html`;
    const file = join(DIST, relative);
    if (!existsSync(file)) {
      problems.push(`${route} — fichier ${relative} absent du build`);
      continue;
    }
    const doc = readFileSync(file, 'utf8');
    const where = (issue) => `${route} : ${issue}`;

    const titleCount = (doc.match(/<title[\s>]/g) || []).length;
    if (titleCount !== 1) problems.push(where(`${titleCount} balises <title>`));
    const title = decodeHtml(doc.match(/<title[^>]*>([^<]*)<\/title>/)?.[1]?.trim() ?? '');
    if (title.length < 15) problems.push(where('title trop court'));
    if (title.startsWith('NEXORA — Cyber Week') && route !== '/') problems.push(where('title non personnalisé'));

    const descriptions = doc.match(/name="description" content="([^"]*)"/g) || [];
    if (descriptions.length !== 1) problems.push(where(`${descriptions.length} balises description`));
    const description = descriptions[0]?.match(/content="([^"]*)"/)?.[1] ?? '';
    if (description.length < 50) problems.push(where(`description trop courte (${description.length} car.)`));
    if (!description.toLowerCase().includes('nexora')) problems.push(where('description sans la marque'));

    if (!/<h1[\s>]/.test(doc)) problems.push(where('aucun <h1> dans le HTML statique'));

    const canonical = doc.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const ogUrl = doc.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
    const noindex = /name="robots" content="noindex/.test(doc);
    routeSeo.set(route, { canonical, noindex });

    if (noindex) {
      if (canonical) problems.push(where('noindex mais canonical présente'));
    } else if (!canonical) {
      problems.push(where('canonical absente'));
    } else {
      if (ogUrl !== canonical) problems.push(where('og:url différent de la canonical'));
      if (canonicalOwner.has(canonical)) problems.push(where(`canonical dupliquée (déjà ${canonicalOwner.get(canonical)})`));
      canonicalOwner.set(canonical, route);
    }

    for (const match of doc.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      try {
        JSON.parse(match[1]);
      } catch {
        problems.push(where('JSON-LD illisible'));
      }
    }

    if (route.startsWith('/produit/')) {
      const product = PRODUCTS.find((item) => `/produit/${item.slug}` === route);
      if (product && !title.includes(product.name)) problems.push(where('title sans le nom du produit'));
      if (product && !doc.includes(`"@type":"Product"`)) problems.push(where('données structurées Product absentes'));
    }
    if (route.startsWith('/categorie/')) {
      const category = CATEGORIES.find((item) => `/categorie/${item.slug}` === route);
      if (category && !title.includes(category.name)) problems.push(where('title sans le nom de la catégorie'));
    }
  }

  problems.length
    ? problems.forEach((issue) => fail(`pré-rendu · ${issue}`))
    : ok(`pré-rendu · ${routes.length}/${routes.length} routes — title, description, canonical, h1 et JSON-LD conformes`);

  // ── Prix serveur : source de vérité du PaymentIntent ──────────────────────
  const pricesFile = join(ROOT, 'server', 'prices.json');
  if (!existsSync(pricesFile)) {
    fail('paiement · server/prices.json absent (le serveur ne peut pas calculer le montant)');
  } else {
    const serverPrices = JSON.parse(readFileSync(pricesFile, 'utf8'));
    const drift = [];
    for (const product of PRODUCTS) {
      const expected = Math.round(product.price * 100);
      if (serverPrices[product.id] !== expected) {
        drift.push(`${product.id}: ${serverPrices[product.id]} ≠ ${expected}`);
      }
    }
    for (const id of Object.keys(serverPrices)) {
      if (!PRODUCTS.some((product) => product.id === id)) drift.push(`id inconnu ${id}`);
    }
    drift.length
      ? fail(`paiement · server/prices.json désynchronisé — ${drift.join(', ')}`)
      : ok(`paiement · server/prices.json aligné sur les ${PRODUCTS.length} prix du catalogue`);
  }

  // ── Noindex : les pages applicatives ne doivent pas être indexées ─────────
  const NOINDEX_REQUIRED = ['/panier', '/checkout', '/confirmation', '/compte', '/favoris', '/recherche'];
  const noindexMissing = NOINDEX_REQUIRED.filter((route) => !routeSeo.get(route)?.noindex);
  noindexMissing.length
    ? fail(`pré-rendu · pages applicatives indexables : ${noindexMissing.join(', ')}`)
    : ok(`pré-rendu · ${NOINDEX_REQUIRED.length} pages applicatives en noindex`);

  // ── 404 ────────────────────────────────────────────────────────────────────
  const notFoundFile = join(DIST, '404.html');
  if (!existsSync(notFoundFile)) {
    fail('pré-rendu · 404.html absent');
  } else {
    const notFound = readFileSync(notFoundFile, 'utf8');
    /name="robots" content="noindex/.test(notFound) && !/rel="canonical"/.test(notFound)
      ? ok('pré-rendu · 404.html en noindex et sans canonical')
      : fail('pré-rendu · 404.html mal configuré (noindex/canonical)');
  }

  // ── Sitemap + robots ───────────────────────────────────────────────────────
  const sitemapFile = join(DIST, 'sitemap.xml');
  const robotsFile = join(DIST, 'robots.txt');
  if (!existsSync(sitemapFile) || !existsSync(robotsFile)) {
    fail('pré-rendu · sitemap.xml ou robots.txt absent');
  } else {
    const sitemap = readFileSync(sitemapFile, 'utf8');
    const robots = readFileSync(robotsFile, 'utf8');
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const expected = [...routeSeo.entries()].filter(([, seo]) => !seo.noindex).map(([route]) => route);
    const badLocs = locs.filter((loc) => {
      const route = loc.replace(/^https?:\/\/[^/]+/, '');
      return !expected.includes(route === '/' ? '/' : route.replace(/\/$/, ''));
    });
    const noindexInSitemap = expected.filter((route) => !locs.some((loc) => loc.endsWith(route)));

    badLocs.length ? fail(`sitemap · URL inattendue : ${badLocs.join(', ')}`) : ok(`sitemap · ${locs.length} URL, aucune page noindex`);
    noindexInSitemap.length ? fail(`sitemap · routes indexables absentes : ${noindexInSitemap.join(', ')}`) : ok('sitemap · toutes les routes indexables listées');
    /^User-agent: \*/m.test(robots) && /Sitemap: \S+\/sitemap\.xml/.test(robots)
      ? ok('robots.txt · politique et déclaration du sitemap')
      : fail('robots.txt · format invalide');
    locs.some((loc) => /^https?:\/\/(localhost|127\.0\.0\.1)/.test(loc))
      ? warn('sitemap · URL en localhost — définissez VITE_SITE_URL puis relancez le build avant déploiement')
      : ok('sitemap · URLs absolues sur le domaine de production');
  }
} catch (error) {
  fail(`pré-rendu — ${error.message}`);
} finally {
  await vite.close();
}

console.log(
  failures.length
    ? `\n${failures.length} échec(s) :\n - ${failures.join('\n - ')}`
    : '\nToutes les vérifications passent.',
);
if (warnings.length) {
  console.log(`\n${warnings.length} avertissement(s) :\n - ${warnings.join('\n - ')}`);
}
process.exit(failures.length ? 1 : 0);
