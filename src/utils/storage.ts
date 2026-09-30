/**
 * Accès au stockage local de la boutique (panier, favoris, promo, commande).
 * Les données sont des données de démonstration, stockées uniquement
 * dans le navigateur du client.
 */

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Clés écrites par la boutique dans le stockage local du navigateur. */
export const NEXORA_STORAGE_KEYS = [
  'nexora_cart',
  'nexora_wishlist',
  'nexora_promo',
  'nexora_order',
] as const;

/** Une valeur vide (tableau ou objet sans entrée) ne doit pas laisser de trace. */
function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
}

export function saveToStorage(key: string, value: unknown): void {
  try {
    // Une valeur vide (panier vidé, commande expirée, promo retirée) ne laisse
    // aucune trace : la clé est supprimée plutôt que réécrite.
    if (isEmptyValue(value)) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage indisponible (mode privé, quota…) : on ignore silencieusement.
  }
}

/**
 * Efface définitivement toutes les données de la boutique conservées localement
 * (panier, favoris, code promo, dernière commande). Aucune donnée n'est envoyée
 * ailleurs : rien à supprimer côté serveur.
 */
export function clearLocalData(): void {
  try {
    for (const key of NEXORA_STORAGE_KEYS) localStorage.removeItem(key);
  } catch {
    // Stockage indisponible : rien à effacer.
  }
}
