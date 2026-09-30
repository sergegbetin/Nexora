import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { getProductBySlug, type Product } from './data/products';
import { RootLayout } from './layouts/RootLayout';
import { QuickView } from './components/QuickView';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { SearchPage } from './pages/SearchPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import {
  ConditionsPage,
  ContactPage,
  FaqPage,
  NotFoundPage,
  PrivacyPage,
  ReturnsPage,
  ShippingPage,
} from './pages/InfoPages';

export default function App() {
  const location = useLocation();
  const [quickView, setQuickView] = useState<Product | null>(null);

  // Ferme l'aperçu rapide à chaque navigation
  useEffect(() => {
    setQuickView(null);
  }, [location.pathname, location.search]);

  const productSlug = location.pathname.startsWith('/produit/')
    ? location.pathname.split('/')[2]
    : undefined;
  const product = productSlug ? getProductBySlug(productSlug) : undefined;

  return (
    <>
      <RootLayout>
        <Routes>
          <Route path="/" element={<Home onQuickView={setQuickView} />} />
          <Route path="/boutique" element={<Shop onQuickView={setQuickView} />} />
          <Route path="/categorie/:slug" element={<CategoryRoute onQuickView={setQuickView} />} />
          <Route
            path="/produit/:slug"
            element={
              product ? (
                <ProductPage product={product} onQuickView={setQuickView} />
              ) : (
                <NotFoundPage />
              )
            }
          />
          <Route path="/panier" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/recherche" element={<SearchPage />} />
          <Route path="/favoris" element={<WishlistPage onQuickView={setQuickView} />} />
          <Route path="/compte" element={<AccountPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/conditions" element={<ConditionsPage />} />
          <Route path="/confidentialite" element={<PrivacyPage />} />
          <Route path="/livraison" element={<ShippingPage />} />
          <Route path="/retours" element={<ReturnsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </RootLayout>

      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
    </>
  );
}

function CategoryRoute({ onQuickView }: { onQuickView: (product: Product) => void }) {
  const { pathname } = useLocation();
  const slug = pathname.split('/')[2];
  const labels: Record<string, string> = {
    smartphones: 'Smartphones & accessoires',
    audio: 'Audio',
    gaming: 'Gaming',
    informatique: 'Informatique',
    'maison-connectee': 'Maison connectée',
    lifestyle: 'Lifestyle & cadeaux',
  };
  const label = labels[slug] || 'Catégorie';

  return (
    <Shop
      onQuickView={onQuickView}
      fixedCategory={slug}
      eyebrow={`NEXORA / Catégorie / ${label}`}
      heading={
        <>
          {label.split(' ')[0]} <em>{label.split(' ').slice(1).join(' ') || 'collection'}.</em>
        </>
      }
    />
  );
}
