/// <reference types="vite/client" />

/**
 * Variables d'environnement exposées au bundle.
 * Seules celles listées ici sont lisibles depuis le code (Vite remplace les
 * accès par une valeur cuitée au build — aucun accès dynamique possible).
 */
interface ImportMetaEnv {
  /** Origine canonique du site en production (ex. https://www.nexora.fr). */
  readonly VITE_SITE_URL?: string;
  /** Clé publique Stripe (mode paiement réel). Jamais de clé secrète ici. */
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  /** Endpoint serveur qui renvoie le client_secret d'un PaymentIntent. */
  readonly VITE_STRIPE_INTENT_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
