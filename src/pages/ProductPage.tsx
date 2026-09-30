import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PRODUCTS,
  TESTIMONIALS,
  formatPrice,
  productSeoDescription,
  type Product,
} from '../data/products';
import { useStore } from '../context/StoreContext';
import { useSeo } from '../hooks/useSeo';
import { absoluteUrl } from '../seo/seo';
import { SmartImage } from '../components/SmartImage';
import { ProductGrid } from '../components/ProductCard';

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'specs', label: 'Caractéristiques' },
  { id: 'reviews', label: 'Avis' },
  { id: 'faq', label: 'FAQ produit' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function ProductPage({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView: (product: Product) => void;
}) {
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const navigate = useNavigate();
  const gallery = useMemo(() => [product.image, ...product.gallery], [product]);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState(product.colors?.[0]);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<TabId>('description');
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedImage(product.image);
    setQuantity(1);
    setColor(product.colors?.[0]);
    setTab('description');
  }, [product]);

  useSeo({
    title: `${product.name} — ${formatPrice(product.price)} | NEXORA`,
    description: productSeoDescription(product),
    path: `/produit/${product.slug}`,
    image: product.image,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.shortDescription,
      image: gallery.map((item) => absoluteUrl(item)),
      brand: { '@type': 'Brand', name: 'NEXORA' },
      url: absoluteUrl(`/produit/${product.slug}`),
      // Pas d'aggregateRating : le catalogue est une démonstration, afficher une
      // note ou un nombre d'avis dans les données structurées tromperait les
      // moteurs de recherche (voir PRODUCTION_READY.md § SEO).
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: product.price,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    },
  });

  const reviews = useMemo(() => {
    const exact = TESTIMONIALS.filter((item) => item.product === product.name);
    return exact.length ? exact : TESTIMONIALS.slice(0, 2);
  }, [product]);

  const related = PRODUCTS.filter(
    (item) => item.categorySlug === product.categorySlug && item.id !== product.id,
  ).slice(0, 4);

  const handleAdd = () => {
    addToCart(product, quantity, color);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, color);
    navigate('/checkout');
  };

  const onZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const saving = product.originalPrice - product.price;

  return (
    <main className="product-page container">
      <nav className="breadcrumbs" aria-label="Fil d'ariane">
        <Link to="/">Accueil</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/categorie/${product.categorySlug}`}>{product.category}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="product-detail">
        <div className="product-gallery">
          <div
            className={`gallery-main ${zoom ? 'is-zooming' : ''}`}
            ref={mainRef}
            onMouseMove={onZoomMove}
            onMouseLeave={() => setZoom(null)}
          >
            <SmartImage src={selectedImage} alt={product.name} eager />
            {zoom && (
              <span
                className="gallery-lens"
                aria-hidden="true"
                style={{
                  backgroundImage: `url(${selectedImage})`,
                  backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                }}
              />
            )}
          </div>
          <div className="gallery-thumbs" role="tablist" aria-label="Vues du produit">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={selectedImage === image ? 'active' : ''}
                aria-label={`Vue ${index + 1} de ${product.name}`}
                aria-selected={selectedImage === image}
                onClick={() => setSelectedImage(image)}
              >
                <SmartImage src={image} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="product-detail-copy">
          <span className={`product-badge static ${product.badge || ''}`}>
            {product.badgeText || `-${product.discount}%`}
          </span>
          <h1>{product.name}</h1>
          <div className="detail-rating">
            <span aria-hidden="true">{'★'.repeat(Math.round(product.rating))}</span>{' '}
            <strong>{product.rating}</strong> <u>{product.reviews.toLocaleString('fr-FR')} avis</u>
            <span className="demo-note">Avis de démonstration</span>
          </div>
          <p className="detail-description">{product.description}</p>

          <div className="detail-price">
            <strong>{formatPrice(product.price)}</strong>
            <del>{formatPrice(product.originalPrice)}</del>
            <span>
              Économisez {formatPrice(saving)} (-{product.discount}%)
            </span>
          </div>

          {product.colors && product.colors.length > 0 && (
            <div className="color-choice">
              <span>Coloris</span>
              <div>
                {product.colors.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    style={{ background: swatch }}
                    className={color === swatch ? 'active' : ''}
                    aria-label={`Choisir la couleur ${swatch}`}
                    aria-pressed={color === swatch}
                    onClick={() => setColor(swatch)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="buy-row">
            <div className="quantity">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Diminuer la quantité"
              >
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className={`button button-dark grow ${added ? 'is-added' : ''}`}
              onClick={handleAdd}
              aria-live="polite"
            >
              {added ? 'Ajouté ✓' : 'Ajouter au panier'} <span aria-hidden="true">{added ? '' : '↗'}</span>
            </button>
            <button
              type="button"
              className={`heart-detail ${isWishlisted(product.id) ? 'active' : ''}`}
              aria-label={isWishlisted(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-pressed={isWishlisted(product.id)}
              onClick={() => toggleWishlist(product.id)}
            >
              {isWishlisted(product.id) ? '♥' : '♡'}
            </button>
          </div>

          <button type="button" className="button button-quiet full buy-now" onClick={handleBuyNow}>
            Acheter maintenant <span aria-hidden="true">→</span>
          </button>

          <div className="delivery-notes">
            <div>
              <span aria-hidden="true">⌁</span>
              <p>
                <strong>Livraison estimée</strong>2 à 5 jours ouvrés
              </p>
            </div>
            <div>
              <span aria-hidden="true">↺</span>
              <p>
                <strong>Retours simples</strong>Selon notre politique de retour
              </p>
            </div>
            <div>
              <span aria-hidden="true">◉</span>
              <p>
                <strong>Paiement sécurisé</strong>Vos données sont protégées
              </p>
            </div>
          </div>

          <p className="stock-line">
            {product.stock > 0 ? (
              <>
                <span className="stock-dot" aria-hidden="true" />
                Disponible ({product.stock} en stock — donnée de démonstration)
              </>
            ) : (
              <>
                <span className="stock-dot out" aria-hidden="true" />
                Rupture de stock
              </>
            )}
          </p>
        </div>
      </div>

      <section className="product-tabs">
        <div className="tab-list" role="tablist" aria-label="Informations produit">
          {TABS.map((item) => (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={tab === item.id}
              className={tab === item.id ? 'active' : ''}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="tab-panel" role="tabpanel">
          {tab === 'description' && (
            <div className="tab-content description-content">
              <p>{product.description}</p>
              <p>
                Chaque produit NEXORA est sélectionné pour son utilité quotidienne, son design et sa
                durabilité. Les caractéristiques, prix et disponibilités affichés sur ce prototype
                sont des données de démonstration.
              </p>
            </div>
          )}

          {tab === 'specs' && (
            <div className="tab-content">
              <div className="specs-grid">
                {product.specifications.map((spec) => (
                  <div key={spec.label}>
                    <span>{spec.label}</span>
                    <strong>{spec.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="tab-content">
              <div className="reviews-grid">
                {reviews.map((review) => (
                  <article className="review" key={review.id}>
                    <div className="review-top">
                      <span className="avatar" style={{ background: review.avatarColor }}>
                        {review.avatar}
                      </span>
                      <div>
                        <strong>{review.name}</strong>
                        <small>Achat vérifié · {review.date}</small>
                      </div>
                      <span className="review-stars" aria-label={`Note ${review.rating} sur 5`}>
                        {'★'.repeat(review.rating)}
                      </span>
                    </div>
                    <p>“{review.comment}”</p>
                    <footer>{review.product}</footer>
                  </article>
                ))}
              </div>
              <p className="demo-note inline">Avis de démonstration — aucun avis client réel.</p>
            </div>
          )}

          {tab === 'faq' && (
            <div className="tab-content faq-list">
              <details>
                <summary>La livraison de ce produit est-elle suivie ?</summary>
                <p>
                  Oui. Chaque commande reçoit un numéro de suivi. Délai estimé : 2 à 5 jours ouvrés
                  (données de démonstration).
                </p>
              </details>
              <details>
                <summary>Puis-je retourner le produit s&apos;il ne me convient pas ?</summary>
                <p>
                  Les retours suivent notre politique de retour : retour initié depuis votre compte,
                  remboursement une fois le produit réceptionné.
                </p>
              </details>
              <details>
                <summary>Quels moyens de paiement sont acceptés ?</summary>
                <p>
                  Carte bancaire, Apple Pay et PayPal. Le paiement est traité par un prestataire
                  externe : aucune donnée bancaire n&apos;est stockée par ce site.
                </p>
              </details>
              <details>
                <summary>La garantie est-elle incluse ?</summary>
                <p>
                  Les conditions de garantie dépendent du fabricant et sont détaillées dans nos
                  conditions générales de vente. Aucune garantie légale n&apos;est inventée sur ce
                  prototype.
                </p>
              </details>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <ProductGrid
          products={related}
          title="Vous aimerez aussi"
          eyebrow="Dans le même univers"
          onQuickView={onQuickView}
        />
      )}

      <div className="sticky-cart" role="region" aria-label="Ajout rapide au panier">
        <div className="sticky-cart-info">
          <strong>{product.name}</strong>
          <span>
            {formatPrice(product.price)} <del>{formatPrice(product.originalPrice)}</del>
          </span>
        </div>
        <button type="button" className="button button-light" onClick={handleAdd}>
          {added ? 'Ajouté ✓' : 'Ajouter au panier'}
        </button>
        <button
          type="button"
          className="icon-action"
          aria-label="Revenir en haut de la page"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑
        </button>
      </div>
    </main>
  );
}

export default ProductPage;
