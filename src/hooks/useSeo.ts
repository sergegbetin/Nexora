import { useEffect } from 'react';
import { applySeoTags, buildSeoTags, type SeoOptions } from '../seo/seo';

export type { SeoOptions };

/**
 * Métadonnées de la page en cours de rendu.
 *
 * `useSeo()` écrit dans ce pendant le rendu (et non dans un effet) : le
 * pré-rendu (`scripts/prerender.mjs`) lit la valeur juste après `renderToString()`,
 * ce qui donne un `<head>` statique strictement identique à celui que la SPA
 * pose ensuite dans `document.head`.
 */
let snapshot: SeoOptions | null = null;

export function readSeoSnapshot(): SeoOptions | null {
  return snapshot;
}

export function resetSeoSnapshot(): void {
  snapshot = null;
}

/**
 * Définit le title, la meta description, Open Graph, Twitter Card, la canonical
 * et les données structurées de chaque page (la SPA les recalcule à chaque
 * navigation, le pré-rendu les fige dans le HTML).
 */
export function useSeo(options: SeoOptions): void {
  snapshot = options;

  const { title, description, path, image, robots } = options;
  const jsonLdString = options.jsonLd ? JSON.stringify(options.jsonLd) : '';

  useEffect(() => {
    applySeoTags(
      buildSeoTags({
        title,
        description,
        path,
        image,
        robots,
        jsonLd: jsonLdString
          ? (JSON.parse(jsonLdString) as Record<string, unknown> | Record<string, unknown>[])
          : undefined,
      }),
    );
  }, [title, description, path, image, robots, jsonLdString]);
}
