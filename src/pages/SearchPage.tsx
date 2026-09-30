import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CATEGORIES, PRODUCTS, formatPrice } from '../data/products';
import { useSeo } from '../hooks/useSeo';
import { SmartImage } from '../components/SmartImage';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';

  useSeo({
    title: query ? `Recherche « ${query} » — NEXORA` : 'Recherche — NEXORA',
    description: 'Recherchez un produit, une catégorie ou une idée cadeau dans le catalogue NEXORA.',
    robots: 'noindex, follow',
  });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter((product) =>
      `${product.name} ${product.category} ${product.shortDescription} ${product.tags.join(' ')}`.toLowerCase().includes(q),
    );
  }, [query]);

  const popular = PRODUCTS.filter((product) => product.isFeatured).slice(0, 4);

  return (
    <main className="search-page container">
      <div className="page-intro">
        <span className="eyebrow">NEXORA / Recherche</span>
        <h1>
          Quel sera votre <em>prochain essentiel ?</em>
        </h1>
      </div>

      <label className="big-search">
        <span aria-hidden="true">⌕</span>
        <input
          autoFocus
          value={query}
          onChange={(event) => setParams(event.target.value ? { q: event.target.value } : {})}
          placeholder="Rechercher un produit, une catégorie..."
          aria-label="Rechercher un produit"
        />
      </label>

      {query.trim() === '' && (
        <>
          <div className="search-suggestions">
            <span>Catégories</span>
            <div>
              {CATEGORIES.map((category) => (
                <Link to={`/categorie/${category.slug}`} key={category.id}>
                  {category.name} ↗
                </Link>
              ))}
            </div>
          </div>
          <div className="search-suggestions">
            <span>Produits populaires</span>
            <div className="search-suggestions-list">
              {popular.map((product) => (
                <Link to={`/produit/${product.slug}`} key={product.id}>
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
        </>
      )}

      {query.trim() !== '' && results.length > 0 && (
        <div className="search-results">
          <span>
            {results.length} résultat{results.length > 1 ? 's' : ''}
          </span>
          {results.map((product) => (
            <Link to={`/produit/${product.slug}`} key={product.id}>
              <SmartImage src={product.image} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <small>{product.category}</small>
              </div>
              <b>{formatPrice(product.price)}</b>
            </Link>
          ))}
        </div>
      )}

      {query.trim() !== '' && results.length === 0 && (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <h2>Aucun résultat</h2>
          <p>
            Rien ne correspond à « {query} ». Essayez une autre formulation ou explorez ces
            suggestions.
          </p>
          <div className="empty-suggestions">
            {CATEGORIES.slice(0, 4).map((category) => (
              <Link key={category.id} className="button button-quiet" to={`/categorie/${category.slug}`}>
                {category.name}
              </Link>
            ))}
          </div>
          <Link className="button button-dark" to="/boutique">
            Voir tout le catalogue
          </Link>
        </div>
      )}
    </main>
  );
}

export default SearchPage;
