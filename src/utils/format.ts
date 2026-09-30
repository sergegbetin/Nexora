/** Formatage des valeurs affichées à l'écran (prix, dates). */

/** Prix en euros, format français (ex. : 129,00 €). */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(price);
}
