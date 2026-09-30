import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, type Product } from '../data/products';
import { useStore } from '../context/StoreContext';
import { SmartImage } from './SmartImage';
import { Reveal } from './Reveal';

export function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView?: (product: Product) => void;
}) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const [added, setAdded] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    timer.current = window.setTimeout(() => setAdded(false), 1800);
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <article className="product-card">
      <div className="product-visual">
        <Link to={`/produit/${product.slug}`} aria-label={`Voir ${product.name}`}>
          <SmartImage src={product.image} alt={product.name} />
        </Link>
        <span className={`product-badge ${product.badge || ''}`}>
          {product.badgeText || `-${product.discount}%`}
        </span>
        <button
          className={`wishlist-button ${wishlisted ? 'active' : ''}`}
          aria-label={
            wishlisted ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`
          }
          aria-pressed={wishlisted}
          onClick={() => toggleWishlist(product.id)}
        >
          {wishlisted ? '♥' : '♡'}
        </button>
        {onQuickView && (
          <button
            className="quick-view"
            onClick={() => onQuickView(product)}
            aria-label={`Aperçu rapide de ${product.name}`}
          >
            Aperçu rapide
          </button>
        )}
      </div>
      <div className="product-info">
        <div className="product-rating">
          <span aria-hidden="true">{'★'.repeat(Math.round(product.rating))}</span>
          <span className="sr-only">
            Note de {product.rating} sur 5
          </span>
          <span>({product.reviews.toLocaleString('fr-FR')} avis)</span>
        </div>
        <Link to={`/produit/${product.slug}`} className="product-name">
          {product.name}
        </Link>
        <p>{product.shortDescription}</p>
        <div className="product-price">
          <strong>{formatPrice(product.price)}</strong>
          <del>{formatPrice(product.originalPrice)}</del>
          <span>-{product.discount}%</span>
        </div>
        <button
          className={`add-button ${added ? 'is-added' : ''}`}
          onClick={handleAdd}
          disabled={added}
          aria-live="polite"
        >
          {added ? 'Ajouté ✓' : 'Ajouter au panier'} <span aria-hidden="true">{added ? '' : '+'}</span>
        </button>
      </div>
    </article>
  );
}

export function ProductGrid({
  products,
  title,
  eyebrow = 'Sélection NEXORA',
  onQuickView,
  action,
}: {
  products: Product[];
  title?: string;
  eyebrow?: string;
  onQuickView?: (product: Product) => void;
  action?: React.ReactNode;
}) {
  return (
    <section className="section container">
      {title && (
        <div className="section-heading">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          {action ?? (
            <Link to="/boutique" className="text-link">
              Voir tout <span>↗</span>
            </Link>
          )}
        </div>
      )}
      <Reveal>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default ProductCard;
