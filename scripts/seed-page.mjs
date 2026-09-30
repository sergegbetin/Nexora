/**
 * Génère une page d'amorçage qui pré-remplit le panier (données de
 * démonstration) puis redirige vers la page cible.
 * Utilisé par `npm run shots` pour inspecter visuellement panier/checkout.
 * Usage : node scripts/seed-page.mjs <route> [slug1,slug2]
 */
import { createServer } from 'vite';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const route = process.argv[2] || '/panier';
const slugs = (process.argv[3] || 'nexora-soundmax-headphones,nexora-vision-smartwatch').split(',');

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const { PRODUCTS } = await vite.ssrLoadModule('/src/data/products.ts');
  const items = slugs
    .map((slug) => PRODUCTS.find((product) => product.slug === slug))
    .filter(Boolean)
    .map((product) => ({ product, quantity: product.slug.includes('ultrabook') ? 1 : 2 }));

  const cart = JSON.stringify(items);
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>seed</title></head>
<body style="background:#0a0a0a;color:#fff;font-family:sans-serif">Amorçage du panier…<script>
try {
  localStorage.setItem('nexora_cart', ${JSON.stringify(cart)});
  localStorage.setItem('nexora_promo', ${JSON.stringify(JSON.stringify('CYBERWEEK15'))});
} catch (e) { document.body.textContent = 'seed error: ' + e.message; }
location.replace(${JSON.stringify(route)});
</script></body></html>`;

  // Généré uniquement dans `dist` (artefact éphémère pour les captures) :
  // `vite build` le remet à zéro, rien n'est versionné dans `public/`.
  mkdirSync('dist', { recursive: true });
  writeFileSync(resolve('dist', '__seed.html'), html);
  console.log(`OK seed -> ${route} avec ${items.map((i) => i.product.slug).join(', ')}`);
} finally {
  await vite.close();
}
