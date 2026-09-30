import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../data/products';
import { useSeo } from '../hooks/useSeo';
import { SmartImage } from '../components/SmartImage';

export function ConfirmationPage() {
  const { state } = useStore();
  const order = state.order;

  useSeo({
    title: `Commande confirmée${order ? ` ${order.number}` : ''} — NEXORA`,
    description: 'Votre commande NEXORA est confirmée. Récapitulatif et prochaines étapes.',
    robots: 'noindex, follow',
  });

  if (!order) {
    return (
      <main className="empty-state container">
        <span aria-hidden="true">✓</span>
        <h1>Aucune commande récente.</h1>
        <p>Cette page affiche le récapitulatif après validation du paiement.</p>
        <Link className="button button-dark" to="/boutique">
          Retour à la boutique
        </Link>
      </main>
    );
  }

  return (
    <main className="confirmation container">
      <div className="confirmation-mark" aria-hidden="true">
        ✓
      </div>
      <span className="eyebrow">Merci pour votre confiance</span>
      <h1>
        Commande <em>confirmée.</em>
      </h1>
      <p className="confirmation-lead">
        Commande <strong>#{order.number}</strong> · {order.date} — un récapitulatif de démonstration
        a été préparé pour {order.customer.email || 'votre adresse email'}.
      </p>

      <div className="confirmation-layout">
        <div className="confirmation-items">
          <span className="eyebrow">Produits</span>
          {order.items.map((item) => (
            <div className="summary-product" key={item.product.id}>
              <SmartImage src={item.product.image} alt={item.product.name} />
              <span>
                <strong>{item.product.name}</strong>
                <small>
                  {item.quantity} × {formatPrice(item.product.price)}
                </small>
              </span>
              <b>{formatPrice(item.product.price * item.quantity)}</b>
            </div>
          ))}
        </div>

        <aside className="summary">
          <span className="eyebrow">Récapitulatif</span>
          <div>
            <span>Sous-total</span>
            <strong>{formatPrice(order.subtotal)}</strong>
          </div>
          {order.discount > 0 && (
            <div className="summary-discount">
              <span>Remise</span>
              <strong>-{formatPrice(order.discount)}</strong>
            </div>
          )}
          <div>
            <span>Livraison</span>
            <strong>{order.shipping ? formatPrice(order.shipping) : 'Offerte'}</strong>
          </div>
          <hr />
          <div className="summary-total">
            <span>Total payé</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
          <div className="confirmation-address">
            <span>Livré à</span>
            <p>
              {order.customer.name}
              <br />
              {order.customer.address}
              <br />
              {order.customer.zip} {order.customer.city}, {order.customer.country}
            </p>
          </div>
          <small>Numéro de suivi : communiqué à l&apos;expédition (démonstration).</small>
        </aside>
      </div>

      <div className="confirmation-actions">
        <Link className="button button-dark" to="/boutique">
          Continuer mes achats <span aria-hidden="true">↗</span>
        </Link>
        <Link className="button button-quiet" to="/compte">
          Voir mon compte
        </Link>
      </div>
    </main>
  );
}

export default ConfirmationPage;
