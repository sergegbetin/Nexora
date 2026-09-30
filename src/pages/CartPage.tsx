import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PROMO_CODES, useStore } from '../context/StoreContext';
import { formatPrice } from '../data/products';
import { useSeo } from '../hooks/useSeo';
import { SmartImage } from '../components/SmartImage';

export function CartPage() {
  const {
    state,
    cartTotal,
    discount,
    shipping,
    grandTotal,
    updateQty,
    removeFromCart,
    applyPromo,
    removePromo,
  } = useStore();
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  useSeo({
    title: 'Votre panier — NEXORA',
    description: 'Récapitulatif de votre panier NEXORA : produits, code promo, livraison et total.',
    robots: 'noindex, follow',
  });

  const remainingForFreeShipping = Math.max(100 - (cartTotal - discount), 0);

  return (
    <main className="cart-page container">
      <div className="page-intro compact">
        <span className="eyebrow">NEXORA / Panier</span>
        <h1>
          Votre <em>panier.</em>
        </h1>
      </div>

      {state.cart.length ? (
        <div className="cart-layout">
          <div className="cart-items">
            {state.cart.map((item) => (
              <article className="cart-item" key={item.product.id}>
                <Link to={`/produit/${item.product.slug}`} aria-label={item.product.name}>
                  <SmartImage src={item.product.image} alt={item.product.name} />
                </Link>
                <div>
                  <Link to={`/produit/${item.product.slug}`}>
                    <h2>{item.product.name}</h2>
                  </Link>
                  <p>{item.product.shortDescription}</p>
                  {item.selectedColor && <small className="variant-line">Coloris : {item.selectedColor}</small>}
                  <strong>{formatPrice(item.product.price)}</strong>
                </div>
                <div className="quantity">
                  <button
                    type="button"
                    onClick={() => updateQty(item.product.id, item.quantity - 1)}
                    aria-label={`Diminuer la quantité de ${item.product.name}`}
                  >
                    −
                  </button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.product.id, item.quantity + 1)}
                    aria-label={`Augmenter la quantité de ${item.product.name}`}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="remove-item"
                  onClick={() => removeFromCart(item.product.id)}
                  aria-label={`Retirer ${item.product.name} du panier`}
                >
                  ×
                </button>
              </article>
            ))}

            <form
              className="promo-row"
              onSubmit={(event) => {
                event.preventDefault();
                if (applyPromo(code)) setCode('');
              }}
            >
              <label htmlFor="promo-code">Code promo</label>
              <div>
                <input
                  id="promo-code"
                  value={code}
                  placeholder="Ex. NEXORA10"
                  onChange={(event) => setCode(event.target.value)}
                  aria-describedby="promo-hint"
                />
                <button type="submit" className="button button-dark">
                  Appliquer
                </button>
              </div>
              <small id="promo-hint">
                Codes de démonstration : {Object.keys(PROMO_CODES).join(' · ')}
              </small>
            </form>

            <Link className="text-link continue-link" to="/boutique">
              ← Continuer mes achats
            </Link>
          </div>

          <aside className="summary">
            <span className="eyebrow">Résumé</span>
            <div>
              <span>Sous-total</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>
            {discount > 0 && (
              <div className="summary-discount">
                <span>
                  Remise {state.promo}{' '}
                  <button type="button" onClick={removePromo} aria-label="Retirer le code promo">
                    retirer
                  </button>
                </span>
                <strong>-{formatPrice(discount)}</strong>
              </div>
            )}
            <div>
              <span>Livraison</span>
              <strong>{shipping ? formatPrice(shipping) : 'Offerte'}</strong>
            </div>
            {remainingForFreeShipping > 0 && (
              <p className="shipping-hint">
                Plus que {formatPrice(remainingForFreeShipping)} pour la livraison offerte.
              </p>
            )}
            <hr />
            <div className="summary-total">
              <span>Total</span>
              <strong>{formatPrice(grandTotal)}</strong>
            </div>
            <button
              type="button"
              className="button button-dark full"
              onClick={() => navigate('/checkout')}
            >
              Passer au paiement <span aria-hidden="true">↗</span>
            </button>
            <small>
              <span aria-hidden="true">◉</span> Paiement sécurisé · Retours simples · Données de
              démonstration
            </small>
          </aside>
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">▱</span>
          <h2>Votre panier est vide.</h2>
          <p>Les belles choses commencent par une première découverte.</p>
          <Link className="button button-dark" to="/boutique">
            Explorer la boutique
          </Link>
        </div>
      )}
    </main>
  );
}

export default CartPage;
