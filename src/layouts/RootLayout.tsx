import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Toast } from '../components/Toast';

/**
 * Structure commune à toutes les pages : lien d'évitement, en-tête,
 * zone de contenu principale, pied de page, toasts et accès rapide
 * au panier sur mobile.
 */
export function RootLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useStore();
  const [navigating, setNavigating] = useState(false);

  // Les pages produit affichent déjà leur propre barre d'achat collante :
  // on masque l'accès rapide au panier pour éviter deux barres superposées.
  const isProductPage = location.pathname.startsWith('/produit/');

  // Nettoyage des états transitoires à chaque navigation
  useEffect(() => {
    setNavigating(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timer = window.setTimeout(() => setNavigating(false), 260);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Aller au contenu principal
      </a>
      <Header />
      <div id="main-content" tabIndex={-1} className={`page-wrap ${navigating ? 'is-navigating' : ''}`}>
        {children}
      </div>
      <Footer />
      <Toast />
      {!isProductPage && (
        <button type="button" className="mobile-cart-bar" onClick={() => navigate('/panier')}>
          Panier <strong>{cartCount} article{cartCount > 1 ? 's' : ''}</strong>
          <span>Voir le panier ↗</span>
        </button>
      )}
    </>
  );
}

export default RootLayout;
