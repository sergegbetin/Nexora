import { Link } from 'react-router-dom';
import { PRODUCTS, type Product } from '../data/products';
import { useStore } from '../context/StoreContext';
import { useSeo } from '../hooks/useSeo';
import { ProductCard } from '../components/ProductCard';

export function WishlistPage({ onQuickView }: { onQuickView?: (product: Product) => void }) {
  const { state, dispatch } = useStore();
  const products = PRODUCTS.filter((product) => state.wishlist.includes(product.id));

  useSeo({
    title: 'Mes favoris — NEXORA',
    description:
      'Retrouvez vos produits NEXORA mis de côté : comparez vos favoris, partagez votre sélection et passez au panier en un clic.',
    robots: 'noindex, follow',
  });

  return (
    <main className="container wishlist-page">
      <div className="page-intro compact">
        <span className="eyebrow">NEXORA / Wishlist</span>
        <h1>
          Vos envies, <em>au chaud.</em>
        </h1>
        <p>
          {products.length} produit{products.length > 1 ? 's' : ''} enregistré
          {products.length > 1 ? 's' : ''} — enregistré localement dans votre navigateur.
        </p>
      </div>

      {products.length ? (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
            ))}
          </div>
          <div className="wishlist-actions">
            <button
              type="button"
              className="button button-quiet"
              onClick={() =>
                products.forEach((product) => dispatch({ type: 'TOGGLE_WISHLIST', payload: product.id }))
              }
            >
              Vider la wishlist
            </button>
            <Link className="button button-dark" to="/boutique">
              Découvrir d&apos;autres produits
            </Link>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">♡</span>
          <h2>Votre wishlist est vide.</h2>
          <p>Gardez de côté les produits qui vous ressemblent : cliquez sur le cœur d&apos;une carte produit.</p>
          <Link to="/boutique" className="button button-dark">
            Explorer la boutique
          </Link>
        </div>
      )}
    </main>
  );
}

export default WishlistPage;
