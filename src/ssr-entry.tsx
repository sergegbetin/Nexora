/**
 * Point d'entrée serveur.
 *
 * - `render(url)`       : rendu nu d'une route (fumée + audit : détecte les erreurs runtime).
 * - `renderPage(url)`   : rendu + balises `<head>` de la même page (pré-rendu statique).
 * - `prerenderRoutes()` : liste exhaustive des routes publiques à pré-rendre.
 *
 * Le même code s'exécute donc pour l'audit, le pré-rendu et la SPA : impossible
 * d'avoir des métadonnées différentes selon la façon dont la page est servie.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { StoreProvider } from './context/StoreContext';
import App from './App';
import { CATEGORIES, PRODUCTS } from './data/products';
import { readSeoSnapshot, resetSeoSnapshot } from './hooks/useSeo';
import { buildSeoTags, serializeSeoTags, type SeoOptions } from './seo/seo';

export { siteOrigin } from './seo/seo';

export function render(url: string): string {
  resetSeoSnapshot();
  return renderToString(
    <StaticRouter location={url}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </StaticRouter>,
  );
}

export interface RenderedPage {
  /** Balises du corps pré-rendues (à injecter dans `#root`). */
  html: string;
  /** Balises `<head>` de la page (title, meta, canonical, JSON-LD…). */
  head: string;
  /** Métadonnées brutes (robots, canonical…) utilisées par le sitemap. */
  seo: SeoOptions | null;
}

export function renderPage(url: string): RenderedPage {
  const html = render(url);
  const seo = readSeoSnapshot();
  return {
    html,
    head: seo ? serializeSeoTags(buildSeoTags(seo)) : '',
    seo,
  };
}

/** Routes publiques générées en HTML statique à chaque build. */
export function prerenderRoutes(): string[] {
  return [
    '/',
    '/boutique',
    ...CATEGORIES.map((category) => `/categorie/${category.slug}`),
    ...PRODUCTS.map((product) => `/produit/${product.slug}`),
    '/recherche',
    '/favoris',
    '/compte',
    '/panier',
    '/checkout',
    '/confirmation',
    '/faq',
    '/contact',
    '/conditions',
    '/confidentialite',
    '/livraison',
    '/retours',
  ];
}
