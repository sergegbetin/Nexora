import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES, PRODUCTS, formatPrice, type Product } from '../data/products';
import { useSeo } from '../hooks/useSeo';
import { ProductCard } from '../components/ProductCard';

type SortKey = 'relevance' | 'new' | 'price-asc' | 'price-desc' | 'popular' | 'bestseller';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'new', label: 'Nouveautés' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'popular', label: 'Popularité' },
  { value: 'bestseller', label: 'Meilleures ventes' },
];

const PRICE_MAX = 900;

export function Shop({
  onQuickView,
  fixedCategory,
  heading,
  eyebrow = 'NEXORA / Boutique',
}: {
  onQuickView?: (product: Product) => void;
  fixedCategory?: string;
  heading?: ReactNode;
  eyebrow?: string;
}) {
  const [params, setParams] = useSearchParams();
  const dealOnly = params.get('deal') === 'cyber';

  const [query, setQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState(fixedCategory || params.get('category') || 'all');
  const [sort, setSort] = useState<SortKey>((params.get('sort') as SortKey) || 'popular');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [minRating, setMinRating] = useState(0);
  const [discountOnly, setDiscountOnly] = useState(dealOnly);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setCategory(fixedCategory || params.get('category') || 'all');
    setSort((params.get('sort') as SortKey) || 'popular');
    setDiscountOnly(params.get('deal') === 'cyber');
    setQuery(params.get('q') || '');
  }, [params, fixedCategory]);

  // Tiroir de filtres : fermeture au clavier + verrouillage du défilement
  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

  // Catégorie figée : utilisée pour le filtre et les métadonnées de la page
  const fixedCategoryData = fixedCategory
    ? CATEGORIES.find((item) => item.slug === fixedCategory)
    : undefined;

  useSeo({
    title: fixedCategoryData
      ? `${fixedCategoryData.name} — ${fixedCategoryData.description} | NEXORA`
      : 'Boutique — NEXORA | Tous les produits tech & lifestyle',
    description:
      'Explorez le catalogue NEXORA : smartphones, audio, gaming, informatique, maison connectée et idées cadeaux. Filtres, prix transparents et avis de démonstration.',
    path: fixedCategory ? `/categorie/${fixedCategory}` : '/boutique',
  });

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) +
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < PRICE_MAX ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (discountOnly ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (query ? 1 : 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = PRODUCTS.filter((product) => {
      if (fixedCategory && product.categorySlug !== fixedCategory) return false;
      if (!fixedCategory && category !== 'all' && product.categorySlug !== category) return false;
      if (product.price < minPrice || product.price > maxPrice) return false;
      if (product.rating < minRating) return false;
      if (discountOnly && product.discount < 20) return false;
      if (inStockOnly && product.stock <= 0) return false;
      if (
        q &&
        !`${product.name} ${product.category} ${product.shortDescription} ${product.tags.join(' ')}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'new':
          return b.id.localeCompare(a.id);
        case 'popular':
          return b.reviews - a.reviews;
        case 'bestseller':
          return b.rating * b.reviews - a.rating * a.reviews;
        default: {
          if (!q) return b.reviews - a.reviews;
          const score = (product: Product) =>
            product.name.toLowerCase().includes(q) ? 2 : product.tags.join(' ').includes(q) ? 1 : 0;
          return score(b) - score(a);
        }
      }
    });

    return result;
  }, [category, discountOnly, fixedCategory, inStockOnly, maxPrice, minPrice, minRating, query, sort]);

  const resetFilters = () => {
    setQuery('');
    if (!fixedCategory) setCategory('all');
    setMinPrice(0);
    setMaxPrice(PRICE_MAX);
    setMinRating(0);
    setDiscountOnly(false);
    setInStockOnly(false);
    setParams({});
  };

  const filterControls = (
    <>
      <div className="filter-group">
        <div className="filter-group-title">
          <span>Budget</span>
          <strong>
            {formatPrice(minPrice)} – {formatPrice(maxPrice)}
          </strong>
        </div>
        <label className="range-field">
          <span className="sr-only">Prix minimum</span>
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={10}
            value={minPrice}
            onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice))}
          />
        </label>
        <label className="range-field">
          <span className="sr-only">Prix maximum</span>
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={10}
            value={maxPrice}
            onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice))}
          />
        </label>
      </div>

      <div className="filter-group">
        <div className="filter-group-title">
          <span>Notation minimale</span>
        </div>
        <div className="rating-pills">
          {[0, 4, 4.5].map((rating) => (
            <button
              key={rating}
              type="button"
              className={minRating === rating ? 'active' : ''}
              aria-pressed={minRating === rating}
              onClick={() => setMinRating(rating)}
            >
              {rating === 0 ? 'Toutes' : `${rating === 4.5 ? '4,5+' : '4+'} ★`}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group-title">
          <span>Disponibilité & promos</span>
        </div>
        <label className="check-field">
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(event) => setDiscountOnly(event.target.checked)}
          />
          <span>Promotions (-20% et plus)</span>
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
          />
          <span>En stock uniquement</span>
        </label>
      </div>

      <button type="button" className="button button-quiet" onClick={resetFilters}>
        Réinitialiser les filtres
      </button>
    </>
  );

  return (
    <main className="shop-page container">
      <div className="page-intro">
        <span className="eyebrow">{eyebrow}</span>
        <h1>
          {heading ? (
            heading
          ) : (
            <>
              Tout ce qui rend le quotidien <em>meilleur.</em>
            </>
          )}
        </h1>
        <p>
          {PRODUCTS.length} essentiels tech et lifestyle, sélectionnés pour leur impact réel dans
          votre quotidien. Prix et avis : données de démonstration.
        </p>
      </div>

      <div className="shop-toolbar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit"
            aria-label="Rechercher dans le catalogue"
          />
        </label>
        {!fixedCategory && (
          <div className="category-pills" role="group" aria-label="Filtrer par catégorie">
            <button
              type="button"
              className={category === 'all' ? 'active' : ''}
              aria-pressed={category === 'all'}
              onClick={() => setCategory('all')}
            >
              Tout
            </button>
            {CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={category === item.slug ? 'active' : ''}
                aria-pressed={category === item.slug}
                onClick={() => setCategory(item.slug)}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
        <label className="sort-field">
          Trier par
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label="Trier les produits"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="filters-toggle"
          onClick={() => setFiltersOpen(true)}
          aria-expanded={filtersOpen}
        >
          Filtres {activeFilterCount ? `(${activeFilterCount})` : ''} <span aria-hidden="true">⚙</span>
        </button>
      </div>

      <aside className="filters-panel" aria-label="Filtres avancés">
        <div className="filter-group-title">
          <span>Filtres</span>
          {activeFilterCount > 0 && <strong>{activeFilterCount} actif(s)</strong>}
        </div>
        {filterControls}
      </aside>

      {filtersOpen && (
        <div className="filter-drawer-backdrop" onClick={() => setFiltersOpen(false)}>
          <aside
            className="filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Filtres"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <strong>Filtres</strong>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Fermer les filtres">
                ×
              </button>
            </header>
            <div className="filter-drawer-body">{filterControls}</div>
            <footer>
              <button
                type="button"
                className="button button-dark full"
                onClick={() => setFiltersOpen(false)}
              >
                Voir {filtered.length} produit{filtered.length > 1 ? 's' : ''}
              </button>
            </footer>
          </aside>
        </div>
      )}

      <div className="results-line">
        <span>
          {filtered.length} produit{filtered.length > 1 ? 's' : ''}
        </span>
        <span>Prix transparents · Avis de démonstration</span>
      </div>

      {filtered.length ? (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <h2>Aucun résultat</h2>
          <p>Essayez une autre recherche ou élargissez votre sélection de filtres.</p>
          <div className="empty-suggestions">
            {CATEGORIES.slice(0, 3).map((item) => (
              <button
                key={item.id}
                type="button"
                className="button button-quiet"
                onClick={() => {
                  setCategory(item.slug);
                  setQuery('');
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
          <button type="button" className="button button-dark" onClick={resetFilters}>
            Réinitialiser
          </button>
        </div>
      )}
    </main>
  );
}

export default Shop;
