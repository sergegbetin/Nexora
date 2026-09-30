/**
 * Configuration de paiement — deux modes, jamais de confusion entre eux.
 *
 * MODE DEMO (défaut) — aucune variable configurée :
 *   aucun champ bancaire, aucune transaction, le bouton « Confirmer la commande »
 *   valide un panier de démonstration. Le texte affiché le dit explicitement.
 *
 * MODE STRIPE — `VITE_STRIPE_PUBLISHABLE_KEY` + `VITE_STRIPE_INTENT_ENDPOINT` :
 *   le Payment Element de Stripe s'affiche, le `client_secret` provient
 *   exclusivement du serveur (voir `server/create-payment-intent.example.mjs`).
 *
 * Sécurité : une clé SECRÈTE (`sk_…`) envoyée par erreur par variable d'env est
 * refusée — elle ne doit jamais atteindre le bundle JavaScript. `STRIPE_SECRET_KEY`
 * n'est lue que par le serveur.
 */

export interface StripeConfig {
  /** Clé PUBLIQUE Stripe (pk_test_… / pk_live_…) — seule cette clé est exposable. */
  publishableKey: string;
  /** Endpoint same-origin qui crée le PaymentIntent et renvoie `clientSecret`. */
  intentEndpoint: string;
}

/** Configuration invalide (clé secrète, tronquée…) — affichée à l'administrateur. */
let configError: string | null = null;
/** Mise en cache : l'objet doit être identique d'un rendu à l'autre (effets). */
let cached: StripeConfig | null = null;
let resolved = false;

const PUBLIC_KEY = /^pk_(test|live)_[A-Za-z0-9]{8,}$/;
const ENDPOINT = /^(\/(?!\/)|https:\/\/)/;

function resolve(): StripeConfig | null {
  const rawKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const endpoint = import.meta.env.VITE_STRIPE_INTENT_ENDPOINT;

  if (!rawKey && !endpoint) {
    configError = null;
    return null;
  }
  if (!rawKey || !endpoint) {
    configError =
      'Configuration de paiement incomplète : VITE_STRIPE_PUBLISHABLE_KEY et VITE_STRIPE_INTENT_ENDPOINT doivent être définies ensemble.';
    return null;
  }
  if (rawKey.trim().startsWith('sk_')) {
    configError =
      'Configuration de paiement refusée : une clé secrète (sk_…) ne doit jamais être exposée au navigateur. Utilisez la clé publique (pk_…) côté front et conservez la clé secrète sur le serveur uniquement.';
    return null;
  }
  if (!PUBLIC_KEY.test(rawKey.trim())) {
    configError =
      'Configuration de paiement invalide : VITE_STRIPE_PUBLISHABLE_KEY doit commencer par pk_test_ ou pk_live_.';
    return null;
  }
  if (!ENDPOINT.test(endpoint.trim())) {
    configError =
      'Configuration de paiement invalide : VITE_STRIPE_INTENT_ENDPOINT doit être un chemin (/api/…) ou une URL HTTPS.';
    return null;
  }

  configError = null;
  return { publishableKey: rawKey.trim(), intentEndpoint: endpoint.trim() };
}

export function getStripeConfig(): StripeConfig | null {
  if (!resolved) {
    cached = resolve();
    resolved = true;
  }
  return cached;
}

export function isStripeConfigured(): boolean {
  return getStripeConfig() !== null;
}

/** Raison pour laquelle le mode Stripe n'est pas actif (null = mode démo assumé). */
export function getStripeConfigError(): string | null {
  getStripeConfig();
  return configError;
}
