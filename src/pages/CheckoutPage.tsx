import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, type CustomerInfo } from '../context/StoreContext';
import { formatPrice } from '../data/products';
import { useSeo } from '../hooks/useSeo';
import { PaymentStep } from '../components/PaymentStep';
import { isStripeConfigured } from '../utils/payment';

const STEPS = [
  { id: 1, label: 'Informations' },
  { id: 2, label: 'Livraison' },
  { id: 3, label: 'Paiement' },
];

export function CheckoutPage() {
  const { state, cartTotal, discount, shipping, grandTotal, placeOrder } = useStore();
  const navigate = useNavigate();
  // Mode de paiement réel uniquement si la configuration Stripe est présente.
  const stripeReady = isStripeConfigured();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Aucun champ bancaire dans l'état : ni numéro, ni cryptogramme, ni expiration.
  const [form, setForm] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'France',
    zip: '',
  });

  useSeo({
    title: 'Checkout sécurisé — NEXORA',
    description: 'Finalisez votre commande NEXORA en trois étapes : informations, livraison, paiement.',
    robots: 'noindex, follow',
  });

  const update = (field: keyof CustomerInfo) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const validate = (currentStep: number) => {
    const next: Record<string, string> = {};
    if (currentStep === 1) {
      if (form.name.trim().length < 2) next.name = 'Indiquez votre nom complet.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = 'Email invalide.';
      if (form.phone.replace(/\D/g, '').length < 8) next.phone = 'Numéro de téléphone invalide.';
    }
    if (currentStep === 2) {
      if (form.address.trim().length < 5) next.address = 'Adresse invalide.';
      if (form.city.trim().length < 2) next.city = 'Ville invalide.';
      if (form.zip.trim().length < 4) next.zip = 'Code postal invalide.';
      if (form.country.trim().length < 2) next.country = 'Pays invalide.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const nextStep = () => {
    if (validate(step)) {
      setStep((value) => Math.min(value + 1, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const summary = useMemo(
    () => (
      <aside className="summary">
        <span className="eyebrow">Votre commande</span>
        {state.cart.map((item) => (
          <div className="summary-product" key={item.product.id}>
            <span>{item.quantity} ×</span>
            <p>{item.product.name}</p>
            <strong>{formatPrice(item.product.price * item.quantity)}</strong>
          </div>
        ))}
        <hr />
        <div>
          <span>Sous-total</span>
          <strong>{formatPrice(cartTotal)}</strong>
        </div>
        {discount > 0 && (
          <div className="summary-discount">
            <span>Remise</span>
            <strong>-{formatPrice(discount)}</strong>
          </div>
        )}
        <div>
          <span>Livraison</span>
          <strong>{shipping ? formatPrice(shipping) : 'Offerte'}</strong>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <strong>{formatPrice(grandTotal)}</strong>
        </div>
        <small>
          <span aria-hidden="true">◉</span> Paiement chiffré · Aucune donnée bancaire stockée par
          cette interface
        </small>
      </aside>
    ),
    [state.cart, cartTotal, discount, shipping, grandTotal],
  );

  if (!state.cart.length) {
    return (
      <main className="empty-state container">
        <span aria-hidden="true">▱</span>
        <h1>Votre panier est vide.</h1>
        <p>Ajoutez un produit avant de passer au paiement.</p>
        <Link className="button button-dark" to="/boutique">
          Retour à la boutique
        </Link>
      </main>
    );
  }

  /** Enregistre la commande locale et ouvre la confirmation. */
  const completeOrder = () => {
    const order = placeOrder({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      country: form.country,
      zip: form.zip,
    });
    setProcessing(false);
    navigate('/confirmation', { state: { orderNumber: order.number } });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    // Mode Stripe : la confirmation bancaire est pilotée par le Payment Element
    // (bouton dédié). Ce formulaire ne valide plus que le parcours démonstration.
    if (stripeReady) return;
    if (!validate(3)) return;
    setProcessing(true);
    window.setTimeout(completeOrder, 900);
  };

  return (
    <main className="checkout-page container">
      <div className="page-intro compact">
        <span className="eyebrow">NEXORA / Checkout sécurisé</span>
        <h1>
          Finaliser votre <em>commande.</em>
        </h1>
      </div>

      <ol className="steps" aria-label="Étapes de commande">
        {STEPS.map((item) => (
          <li key={item.id} className={`step ${step === item.id ? 'active' : ''} ${step > item.id ? 'done' : ''}`}>
            <span
              className={`step-dot ${step === item.id ? 'active' : ''} ${step > item.id ? 'completed' : ''}`}
            >
              {step > item.id ? '✓' : item.id}
            </span>
            <span className="step-label">{item.label}</span>
            {item.id < STEPS.length && <span className="step-line active" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="checkout-layout">
        <form
          className="checkout-form"
          onSubmit={submit}
          noValidate
        >
          {step === 1 && (
            <fieldset>
              <legend>
                01 <span>Vos informations</span>
              </legend>
              <label className="form-group">
                Nom complet
                <input
                  required
                  value={form.name}
                  onChange={update('name')}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <small className="form-error">{errors.name}</small>}
              </label>
              <div className="form-two">
                <label className="form-group">
                  Email
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <small className="form-error">{errors.email}</small>}
                </label>
                <label className="form-group">
                  Téléphone
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={update('phone')}
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <small className="form-error">{errors.phone}</small>}
                </label>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset>
              <legend>
                02 <span>Livraison</span>
              </legend>
              <label className="form-group">
                Adresse
                <input
                  required
                  value={form.address}
                  onChange={update('address')}
                  autoComplete="street-address"
                  aria-invalid={Boolean(errors.address)}
                />
                {errors.address && <small className="form-error">{errors.address}</small>}
              </label>
              <div className="form-two">
                <label className="form-group">
                  Ville
                  <input
                    required
                    value={form.city}
                    onChange={update('city')}
                    autoComplete="address-level2"
                    aria-invalid={Boolean(errors.city)}
                  />
                  {errors.city && <small className="form-error">{errors.city}</small>}
                </label>
                <label className="form-group">
                  Code postal
                  <input
                    required
                    value={form.zip}
                    onChange={update('zip')}
                    autoComplete="postal-code"
                    aria-invalid={Boolean(errors.zip)}
                  />
                  {errors.zip && <small className="form-error">{errors.zip}</small>}
                </label>
              </div>
              <label className="form-group">
                Pays
                <input
                  required
                  value={form.country}
                  onChange={update('country')}
                  autoComplete="country-name"
                  aria-invalid={Boolean(errors.country)}
                />
                {errors.country && <small className="form-error">{errors.country}</small>}
              </label>
              <p className="form-note">Livraison estimée : 2 à 5 jours ouvrés (donnée de démonstration).</p>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset>
              <legend>
                03 <span>Paiement</span>
              </legend>

              <PaymentStep amount={grandTotal} email={form.email} onSuccess={completeOrder} />

              {!stripeReady && (
                <button className="button button-dark full" type="submit" disabled={processing}>
                  {processing ? (
                    <>
                      <span className="spinner" aria-hidden="true" /> Traitement…
                    </>
                  ) : (
                    <>
                      Confirmer la commande (démo) <span aria-hidden="true">↗</span>
                    </>
                  )}
                </button>
              )}
            </fieldset>
          )}

          <div className="checkout-nav">
            {step > 1 ? (
              <button type="button" className="button button-quiet" onClick={() => setStep(step - 1)}>
                ← Étape précédente
              </button>
            ) : (
              <Link className="button button-quiet" to="/panier">
                ← Retour au panier
              </Link>
            )}
            {step < 3 && (
              <button type="button" className="button button-dark" onClick={nextStep}>
                Continuer <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </form>

        {summary}
      </div>
    </main>
  );
}

export default CheckoutPage;
