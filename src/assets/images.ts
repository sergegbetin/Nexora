/**
 * Gestionnaire des chemins d'images du site.
 * Toutes les images produit / catégorie / éditorial sont servies depuis
 * `public/images` (attribution : `public/images/CREDITS.md`).
 */
export const IMAGES_ROOT = '/images';

/** Construit le chemin public d'une image à partir de son nom de fichier. */
export function image(fileName: string): string {
  return `${IMAGES_ROOT}/${fileName}`;
}
