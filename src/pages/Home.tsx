import { Link } from 'react-router-dom';
import { CATEGORIES, GIFT_GUIDES, PRODUCTS, TESTIMONIALS, formatPrice, type Product } from '../data/products';
import { useCountdown } from '../hooks/useCountdown';
import { useSeo } from '../hooks/useSeo';
import { siteOrigin } from '../seo/seo';
import { SmartImage } from '../components/SmartImage';
import { Reveal } from '../components/Reveal';
import { ProductGrid } from '../components/ProductCard';
import { Newsletter } from '../components/Newsletter';
import { image } from '../assets/images';

function CountdownBlocks({ compact = false }: { compact?: boolean }) {
  const countdown = useCountdown();
  const blocks = [
    { value: countdown.days, label: 'Jours' },
    { value: countdown.hours, label: 'Heures' },
    { value: countdown.minutes, label: 'Min' },
    { value: countdown.seconds, label: 'Sec' },
  ];
  return (
    <div className={`countdown ${compact ? 'countdown-compact' : ''}`} aria-label="Temps restant avant la fin de l'offre">
      {blocks.map((block) => (
        <span key={block.label}>
          <strong>{block.value}</strong>
          <small>{block.label}</small>
        </span>
      ))}
    </div>
  );
}

function Hero() {
  const countdown = useCountdown();
  return (
    <section className="hero">
      <div className="hero-grid container">
        <div className="hero-copy">
          <span className="eyebrow light">
            NEXORA CYBER WEEK <i>●</i>
          </span>
          <h1>
            Les offres Q4 que vous <em>attendiez.</em>
          </h1>
          <p>
            Découvrez une sélection de produits tech et lifestyle à prix exceptionnel pendant une
            durée limitée.
          </p>
          <div className="hero-offer">
            <span>Jusqu&apos;à</span>
            <strong>-50%</strong>
          </div>
          <div className="hero-actions">
            <Link className="button button-light" to="/boutique?deal=cyber">
              Acheter maintenant <span>↗</span>
            </Link>
            <Link className="button button-quiet" to="/boutique">
              Découvrir les offres <span>→</span>
            </Link>
          </div>
          <div className="hero-count">
            <span>OFFRES ACTIVES PENDANT ENCORE</span>
            <strong>{countdown.label}</strong>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-product hero-phone">
            <SmartImage src={PRODUCTS[3].image} alt="" eager />
          </div>
          <div className="hero-product hero-headphones">
            <SmartImage src={PRODUCTS[1].image} alt="" eager />
          </div>
          <div className="hero-product hero-watch">
            <SmartImage src={PRODUCTS[9].image} alt="" eager />
          </div>
          <span className="hero-sticker">
            UP
            <br />
            <strong>TO</strong>
            <br />
            <b>-50%</b>
          </span>
          <span className="hero-index">
            01 <i>/</i> 04
          </span>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: '◉', title: 'Paiement sécurisé', text: 'Transactions protégées' },
    { icon: '⌁', title: 'Livraison fiable', text: 'Suivi de commande' },
    { icon: '↺', title: 'Retours simples', text: 'Processus clair et documenté' },
    { icon: '✦', title: 'Support client', text: 'Assistance disponible' },
  ];
  return (
    <section className="trust-strip" aria-label="Nos engagements">
      <div className="container trust-grid">
        {items.map((item) => (
          <div key={item.title}>
            <span aria-hidden="true">{item.icon}</span>
            <strong>{item.title}</strong>
            <small>{item.text}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategorySection() {
  return (
    <section className="section container">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Explorer par univers</span>
          <h2>
            Explorez nos <em>catégories.</em>
          </h2>
        </div>
      </div>
      <Reveal>
        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <Link to={`/categorie/${category.slug}`} className="category-tile" key={category.id}>
              <SmartImage src={category.image} alt={category.name} />
              <div className="category-overlay">
                <span aria-hidden="true">{category.icon}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <b>
                  Explorer <i>↗</i>
                </b>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function FlashDeal({ onQuickView }: { onQuickView: (product: Product) => void }) {
  const flashProducts = PRODUCTS.filter((product) => product.isFlashDeal).slice(0, 4);
  return (
    <section className="flash-band">
      <div className="container flash-inner">
        <div>
          <span className="eyebrow">Offre flash · Jusqu&apos;à -50%</span>
          <h2>
            Le bon moment
            <br />
            <em>pour se faire plaisir.</em>
          </h2>
          <p>
            Des essentiels choisis pour leur design, leur utilité et leur capacité à durer. Les
            prix affichés sont figés jusqu&apos;à la fin du compte à rebours.
          </p>
          <div className="flash-timer">
            <span>Fin de l&apos;offre dans</span>
            <CountdownBlocks compact />
          </div>
          <Link className="button button-light" to="/boutique?deal=cyber">
            Voir les offres <span>↗</span>
          </Link>
        </div>
        <div className="flash-offers">
          {flashProducts.map((product) => (
            <article className="flash-offer" key={product.id}>
              <Link to={`/produit/${product.slug}`} className="flash-offer-media">
                <SmartImage src={product.image} alt={product.name} />
                <span className="product-badge">-{product.discount}%</span>
              </Link>
              <div className="flash-offer-body">
                <Link to={`/produit/${product.slug}`}>{product.name}</Link>
                <div className="product-price">
                  <strong>{formatPrice(product.price)}</strong>
                  <del>{formatPrice(product.originalPrice)}</del>
                </div>
                <small className="stock-note">Disponible · données de démonstration</small>
                <div className="flash-offer-actions">
                  <button
                    className="button button-dark"
                    onClick={() => onQuickView(product)}
                    type="button"
                  >
                    Aperçu rapide
                  </button>
                  <Link className="text-link" to={`/produit/${product.slug}`}>
                    Voir le produit ↗
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Home({ onQuickView }: { onQuickView: (product: Product) => void }) {
  useSeo({
    title: 'NEXORA — Cyber Week | Tech & Lifestyle Deals',
    description:
      "NEXORA Cyber Week : smartphones, audio, gaming et maison connectée à prix exceptionnels. Jusqu'à -50% pendant une durée limitée. Smart deals. Better living.",
    path: '/',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'NEXORA',
        url: siteOrigin(),
        slogan: 'Smart deals. Better living.',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'NEXORA — Cyber Week',
        url: siteOrigin(),
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteOrigin()}/recherche?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  });

  const bestSellers = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 8);

  return (
    <main>
      <Hero />
      <TrustStrip />
      <CategorySection />

      <ProductGrid
        products={bestSellers}
        title="Les plus populaires"
        eyebrow="Best sellers"
        onQuickView={onQuickView}
      />

      <FlashDeal onQuickView={onQuickView} />

      <Reveal>
        <section className="editorial container">
          <div className="editorial-image">
            <SmartImage
              src={image('editorial.jpg')}
              alt="Bureau premium équipé d'un ordinateur et d'accessoires NEXORA"
            />
          </div>
          <div className="editorial-copy">
            <span className="eyebrow">Le choix NEXORA</span>
            <h2>
              Votre prochaine bonne affaire est <em>ici.</em>
            </h2>
            <p>
              Des produits sélectionnés. Des prix exceptionnels. Une expérience d&apos;achat simple.
            </p>
            <Link className="button button-light" to="/boutique">
              Découvrir NEXORA <span>↗</span>
            </Link>
          </div>
        </section>
      </Reveal>

      <section className="section container gift-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Guide cadeaux</span>
            <h2>
              Trouvez le cadeau <em>parfait.</em>
            </h2>
          </div>
          <Link to="/boutique" className="text-link">
            Tout le guide <span>↗</span>
          </Link>
        </div>
        <Reveal>
          <div className="gift-grid">
            {GIFT_GUIDES.map((gift) => (
              <Link to="/boutique" className="gift-tile" key={gift.id}>
                <SmartImage src={gift.image} alt={gift.label} />
                <div>
                  <span aria-hidden="true">{gift.icon}</span>
                  <strong>{gift.label}</strong>
                  <b aria-hidden="true">→</b>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="reviews-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Ils ont choisi NEXORA</span>
              <h2>
                Des choix qui <em>comptent.</em>
              </h2>
            </div>
            <span className="demo-note">Avis de démonstration</span>
          </div>
          <Reveal>
            <div className="reviews-grid">
              {TESTIMONIALS.slice(0, 3).map((review) => (
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
          </Reveal>
        </div>
      </section>

      <Newsletter />
    </main>
  );
}

export default Home;
