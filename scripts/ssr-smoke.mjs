/**
 * Vérification de fumée : rend chaque route côté serveur pour détecter
 * les erreurs runtime (hooks invalides, variables undefined, etc.).
 * Usage : npm run check:routes
 */
import { createServer } from 'vite';

const ROUTES = [
  '/',
  '/boutique',
  '/boutique?deal=cyber',
  '/categorie/smartphones',
  '/categorie/maison-connectee',
  '/produit/nexora-apex-pro-15',
  '/produit/nexora-thermosense',
  '/produit/slug-inconnu',
  '/panier',
  '/checkout',
  '/confirmation',
  '/recherche',
  '/recherche?q=casque',
  '/favoris',
  '/compte',
  '/faq',
  '/contact',
  '/conditions',
  '/confidentialite',
  '/livraison',
  '/retours',
  '/page-inexistante',
];

// Shims navigateurs (le rendu SSR n'exécute pas les effets)
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

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

let failures = 0;
try {
  const { render } = await vite.ssrLoadModule('/src/ssr-entry.tsx');
  for (const route of ROUTES) {
    try {
      const html = render(route);
      const ok = html.length > 500;
      if (!ok) failures += 1;
      console.log(`${ok ? 'OK  ' : 'THIN'} ${route} (${html.length} car.)`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${route}: ${error.message}`);
    }
  }
} catch (error) {
  failures += 1;
  console.error(`FAIL chargement du bundle: ${error.message}`);
} finally {
  await vite.close();
}

console.log(failures ? `\n${failures} échec(s)` : '\nToutes les routes se rendent sans erreur.');
process.exit(failures ? 1 : 0);
