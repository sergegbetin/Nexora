import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, type Product } from '../data/products';
import { useStore } from '../context/StoreContext';
import { SmartImage } from './SmartImage';

export function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="quick-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Aperçu rapide — ${product.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Fermer l'aperçu rapide">
          ×
        </button>
        <div className="quick-modal-media">
          <SmartImage src={product.image} alt={product.name} eager />
          <span className={`product-badge ${product.badge || ''}`}>
            {product.badgeText || `-${product.discount}%`}
          </span>
        </div>
        <div>
          <span className="eyebrow">{product.category}</span>
          <h2>{product.name}</h2>
          <div className="detail-rating">
            <span aria-hidden="true">{'★'.repeat(Math.round(product.rating))}</span> {product.rating}{' '}
            <u>{product.reviews.toLocaleString('fr-FR')} avis</u>
          </div>
          <p>{product.shortDescription}</p>
          <div className="detail-price">
            <strong>{formatPrice(product.price)}</strong>
            <del>{formatPrice(product.originalPrice)}</del>
            <span>-{product.discount}%</span>
          </div>
          <div className="buy-row">
            <div className="quantity">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Diminuer la quantité"
              >
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>
            <button
              className={`button button-dark grow ${added ? 'is-added' : ''}`}
              onClick={() => {
                addToCart(product, quantity);
                setAdded(true);
                window.setTimeout(() => {
                  setAdded(false);
                  onClose();
                }, 900);
              }}
              aria-live="polite"
            >
              {added ? 'Ajouté ✓' : 'Ajouter au panier'} <span aria-hidden="true">{added ? '' : '↗'}</span>
            </button>
            <button
              className={`heart-detail ${wishlisted ? 'active' : ''}`}
              aria-label={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-pressed={wishlisted}
              onClick={() => toggleWishlist(product.id)}
            >
              {wishlisted ? '♥' : '♡'}
            </button>
          </div>
          <Link className="text-link quick-view-link" to={`/produit/${product.slug}`} onClick={onClose}>
            Voir la fiche produit <span>↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default QuickView;
