import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main container">
        <div className="footer-brand">
          <Link to="/" className="brand" aria-label="NEXORA — accueil">
            NEXORA<span>®</span>
          </Link>
          <p>
            Smart deals.
            <br />
            Better living.
          </p>
          <div className="socials">
            <a href="#instagram" aria-label="NEXORA sur Instagram">
              ig
            </a>
            <a href="#tiktok" aria-label="NEXORA sur TikTok">
              tk
            </a>
            <a href="#youtube" aria-label="NEXORA sur YouTube">
              yt
            </a>
          </div>
        </div>

        <div>
          <h3>Boutique</h3>
          <Link to="/boutique">Tous les produits</Link>
          <Link to="/boutique?sort=new">Nouveautés</Link>
          <Link to="/boutique?sort=popular">Best sellers</Link>
          <Link to="/boutique?deal=cyber">Cyber Week</Link>
        </div>

        <div>
          <h3>Catégories</h3>
          {CATEGORIES.map((category) => (
            <Link key={category.id} to={`/categorie/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </div>

        <div>
          <h3>Service client</h3>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/livraison">Livraison</Link>
          <Link to="/retours">Retours</Link>
        </div>

        <div>
          <h3>Informations</h3>
          <Link to="/confidentialite">Confidentialité</Link>
          <Link to="/conditions">Conditions</Link>
          <Link to="/confidentialite#cookies">Cookies</Link>
          <Link to="/compte">Mon compte</Link>
        </div>
      </div>

      <div className="footer-bottom container">
        <span>
          © {new Date().getFullYear()} NEXORA — Prototype de démonstration. Produits, prix et avis
          fictifs.
        </span>
        <span className="footer-payments">
          Paiement sécurisé
          <i>Visa</i>
          <i>Mastercard</i>
          <i>Apple Pay</i>
          <i>PayPal</i>
        </span>
      </div>
    </footer>
  );
}

export default Footer;
