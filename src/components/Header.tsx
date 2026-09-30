import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CATEGORIES, PRODUCTS, formatPrice } from '../data/products';
import { useStore } from '../context/StoreContext';
import { SmartImage } from './SmartImage';

const NAV = [
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/boutique' },
  { label: 'Cyber Week', to: '/boutique?deal=cyber' },
  { label: 'Nouveautés', to: '/boutique?sort=new' },
  { label: 'Meilleures ventes', to: '/boutique?sort=popular' },
];

const POPULAR_SEARCHES = ['écouteurs', 'casque', 'smartwatch', 'laptop', 'clavier', 'maison connectée'];

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter((product) =>
      `${product.name} ${product.category} ${product.shortDescription} ${product.tags.join(' ')}`
        .toLowerCase()
        .includes(q),
    ).slice(0, 6);
  }, [query]);

  const submit = (value: string) => {
    onClose();
    navigate(`/recherche?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Recherche produits">
      <div className="search-panel">
        <form
          className="search-field-big"
          onSubmit={(event) => {
            event.preventDefault();
            submit(query);
          }}
        >
          <span aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit, une catégorie…"
            aria-label="Rechercher un produit"
          />
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer la recherche">
            ×
          </button>
        </form>

        {query.trim() === '' ? (
          <div className="search-block">
            <p className="search-block-title">Catégories</p>
            <div className="search-chips">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  to={`/boutique?category=${category.slug}`}
                  onClick={onClose}
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <p className="search-block-title">Recherches populaires</p>
            <div className="search-chips">
              {POPULAR_SEARCHES.map((term) => (
                <button key={term} type="button" onClick={() => submit(term)}>
                  {term}
                </button>
              ))}
            </div>
            <p className="search-block-title">Produits populaires</p>
            <div className="search-suggestions-list">
              {PRODUCTS.filter((product) => product.isFeatured)
                .slice(0, 4)
                .map((product) => (
                  <Link key={product.id} to={`/produit/${product.slug}`} onClick={onClose}>
                    <SmartImage src={product.image} alt={product.name} />
                    <span>
                      <strong>{product.name}</strong>
                      <small>{product.category}</small>
                    </span>
                    <b>{formatPrice(product.price)}</b>
                  </Link>
                ))}
            </div>
          </div>
        ) : results.length ? (
          <div className="search-block">
            <p className="search-block-title">
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </p>
            <div className="search-suggestions-list">
              {results.map((product) => (
                <Link key={product.id} to={`/produit/${product.slug}`} onClick={onClose}>
                  <SmartImage src={product.image} alt={product.name} />
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.category}</small>
                  </span>
                  <b>{formatPrice(product.price)}</b>
                </Link>
              ))}
            </div>
            <button className="button button-quiet" type="button" onClick={() => submit(query)}>
              Voir tous les résultats <span>→</span>
            </button>
          </div>
        ) : (
          <div className="search-empty">
            <span aria-hidden="true">⌕</span>
            <p>
              Aucun résultat pour « {query} »
            </p>
            <small>Essayez un autre mot-clé ou explorez nos catégories.</small>
            <div className="search-chips">
              {POPULAR_SEARCHES.slice(0, 4).map((term) => (
                <button key={term} type="button" onClick={() => setQuery(term)}>
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, state, dispatch } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <>
      <div className="announcement">
        <span>NEXORA CYBER WEEK</span> Jusqu&apos;à -50% sur une sélection exclusive{' '}
        <Link to="/boutique">Découvrir les offres →</Link>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="mobile-menu"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '×' : '☰'}
          </button>
          <Link to="/" className="brand" aria-label="NEXORA — accueil">
            NEXORA<span>®</span>
          </Link>
          <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navigation principale">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={
                  item.to === location.pathname + location.search ||
                  (item.to === location.pathname && item.to !== '/')
                    ? 'is-active'
                    : ''
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon-action"
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
            >
              ⌕
            </button>
            <button
              className="icon-action hide-mobile"
              aria-label="Compte client"
              onClick={() => navigate('/compte')}
            >
              ◉
            </button>
            <button
              className="icon-action hide-mobile"
              aria-label={`Favoris (${state.wishlist.length})`}
              onClick={() => navigate('/favoris')}
            >
              ♡<em>{state.wishlist.length}</em>
            </button>
            <button
              className="icon-action"
              aria-label={`Panier (${cartCount})`}
              onClick={() => navigate('/panier')}
            >
              ▱<em>{cartCount}</em>
            </button>
            <Link className="header-cta hide-tablet" to="/boutique">
              Voir les offres <span>↗</span>
            </Link>
          </div>
        </div>
      </header>
      {searchOpen && (
        <SearchOverlay
          onClose={() => {
            setSearchOpen(false);
            dispatch({ type: 'CLOSE_SEARCH' });
          }}
        />
      )}
    </>
  );
}

export default Header;
