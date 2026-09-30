import { useEffect, useState, type MouseEvent } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../data/products';
import { getStripeConfig } from '../utils/payment';

/**
 * Paiement réel via Stripe Elements.
 *
 * Ce module ne voit **jamais** de donnée bancaire : les champs de carte sont
 * rendus dans une iframe isolée par Stripe (SAQ A). Le frontend n'envoie au
 * serveur que les identifiants de produits ; c'est le serveur qui calcule le
 * montant, charge `STRIPE_SECRET_KEY` et renvoie le `client_secret`.
 */

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(publishableKey: string): Promise<Stripe | null> {
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

interface Props {
  amount: number;
  email: string;
  onSuccess: () => void;
}

function PaymentForm({ amount, onSuccess }: { amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = Boolean(stripe && elements);

  // Bouton autonome (type=button) : la soumission n'est pas déléguée au
  // formulaire du checkout, ce qui évite tout envoi accidentel de l'état démo.
  const pay = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!stripe || !elements) {
      setError('Le module de paiement n’est pas encore prêt.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: failure, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/confirmation` },
        redirect: 'if_required',
      });
      if (failure) {
        setError(failure.message ?? 'Le paiement n’a pas abouti. Aucun montant n’a été débité.');
        setBusy(false);
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        onSuccess();
        return;
      }
      // Statuts intermédiaires (ex. redirection vers une authentification 3-D Secure).
      setBusy(false);
    } catch {
      setError('Le paiement n’a pas pu être finalisé. Réessayez.');
      setBusy(false);
    }
  };

  return (
    <div className="payment-secure">
      <span className="eyebrow">Paiement sécurisé — Stripe</span>
      <PaymentElement id="nexora-payment-element" />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button button-dark full" type="button" onClick={pay} disabled={busy || !ready}>
        {busy ? (
          <>
            <span className="spinner" aria-hidden="true" /> Traitement…
          </>
        ) : (
          <>
            Payer {formatPrice(amount)} <span aria-hidden="true">↗</span>
          </>
        )}
      </button>
      <p className="form-note">
        {ready
          ? 'Champs traités directement par Stripe : aucune donnée bancaire ne transite par ce site ni par son stockage local.'
          : 'Initialisation du module de paiement…'}
      </p>
    </div>
  );
}

export default function StripePayment({ amount, email, onSuccess }: Props) {
  const { state } = useStore();
  const config = getStripeConfig();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  // Demande du client_secret : le serveur seul connaît le montant réel.
  useEffect(() => {
    if (!config) return undefined;
    let cancelled = false;
    setFailure(null);

    (async () => {
      try {
        const response = await fetch(config.intentEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currency: 'eur',
            email,
            promo: state.promo ?? null,
            items: state.cart.map((item) => ({ id: item.product.id, quantity: item.quantity })),
          }),
        });
        if (!response.ok) throw new Error(`Serveur de paiement (HTTP ${response.status})`);
        const data: unknown = await response.json();
        const secret = (data as { clientSecret?: unknown })?.clientSecret;
        if (typeof secret !== 'string' || !secret) throw new Error('Réponse invalide');
        if (!cancelled) setClientSecret(secret);
      } catch (error) {
        if (!cancelled) {
          setFailure(
            error instanceof Error
              ? `Paiement indisponible : ${error.message}.`
              : 'Paiement indisponible pour le moment.',
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [config, email, state.cart, state.promo]);

  if (failure) {
    return (
      <div className="payment-secure" role="alert">
        <span className="eyebrow">Paiement indisponible</span>
        <p className="form-error">{failure}</p>
        <p className="form-note">
          Aucun débit n'a eu lieu. Le serveur de paiement est introuvable ou n'a pas accepté la
          commande : vérifiez la configuration serveur (README → « Paiement »).
        </p>
      </div>
    );
  }

  if (!config || !clientSecret) {
    return (
      <p className="form-note" role="status">
        <span className="spinner" aria-hidden="true" /> Préparation du paiement sécurisé…
      </p>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#7c5cfc',
        colorBackground: '#111120',
        colorText: '#f0f0f8',
        colorDanger: '#ef4444',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSizeBase: '15px',
        borderRadius: '12px',
      },
      rules: {
        '.Input': {
          border: '1px solid rgba(255, 255, 255, 0.14)',
          backgroundColor: '#0d0d18',
          color: '#f0f0f8',
        },
        '.Input:focus': { borderColor: '#7c5cfc', boxShadow: '0 0 0 1px #7c5cfc' },
        '.Tab': { color: '#9999b3' },
        '.Tab--selected': { color: '#f0f0f8', borderColor: '#7c5cfc' },
      },
    },
  };

  return (
    <Elements stripe={getStripe(config.publishableKey)} options={options}>
      <PaymentForm amount={amount} onSuccess={onSuccess} />
    </Elements>
  );
}
