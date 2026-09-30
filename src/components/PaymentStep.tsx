import { lazy, Suspense } from 'react';
import { getStripeConfigError, isStripeConfigured } from '../utils/payment';

/**
 * Étape 3 du checkout.
 *
 * Charge le Payment Element **uniquement** si Stripe est configuré : en mode
 * démo, le module Stripe n'est même pas téléchargé (chunk dynamique) et aucun
 * champ bancaire n'est proposé à l'écran.
 */
const StripePayment = lazy(() => import('./StripePayment'));

interface PaymentStepProps {
  /** Total à payer (affichage). Le montant réel est recalculé par le serveur. */
  amount: number;
  /** Email du client, transmis au serveur pour le reçu Stripe. */
  email: string;
  /** Appelé après un paiement confirmé pour enregistrer et afficher la commande. */
  onSuccess: () => void;
}

function DemoPayment() {
  return (
    <div className="payment-demo" role="note">
      <span className="eyebrow">Mode démonstration</span>
      <p>
        <strong>Aucune transaction ne sera effectuée.</strong> Cette boutique de démonstration
        n'accepte aucun paiement : aucun champ de carte n'est présenté, et aucun numéro de carte,
        cryptogramme ni date d'expiration n'est demandé, transmis ou enregistré à aucun moment.
      </p>
      <small>
        Paiement réel prêt à être activé via Stripe Elements — variables
        <code> VITE_STRIPE_PUBLISHABLE_KEY</code> et <code>VITE_STRIPE_INTENT_ENDPOINT</code> (voir
        README → « Paiement »).
      </small>
    </div>
  );
}

function ConfigError({ message }: { message: string }) {
  return (
    <p className="form-error" role="alert">
      {message}
    </p>
  );
}

export function PaymentStep({ amount, email, onSuccess }: PaymentStepProps) {
  if (isStripeConfigured()) {
    return (
      <Suspense
        fallback={
          <p className="form-note" role="status">
            <span className="spinner" aria-hidden="true" /> Chargement du paiement sécurisé…
          </p>
        }
      >
        <StripePayment amount={amount} email={email} onSuccess={onSuccess} />
      </Suspense>
    );
  }

  const configError = getStripeConfigError();
  if (configError) return <ConfigError message={configError} />;

  return <DemoPayment />;
}

export default PaymentStep;
