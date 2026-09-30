import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../data/products';
import { useSeo } from '../hooks/useSeo';
import { SmartImage } from '../components/SmartImage';

export function AccountPage() {
  const { state, clearAllData, showToast } = useStore();
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  useSeo({
    title: 'Mon compte — NEXORA',
    description: 'Espace client NEXORA : commandes, favoris et informations personnelles.',
    robots: 'noindex, follow',
  });

  const signIn = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('Adresse email invalide.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setError('');
    setSignedIn(true);
  };

  if (!signedIn) {
    return (
      <main className="account-page container">
        <div className="page-intro compact">
          <span className="eyebrow">NEXORA / Compte</span>
          <h1>
            Bon retour <em>chez vous.</em>
          </h1>
          <p>Interface de démonstration : aucune donnée n&apos;est transmise ni enregistrée.</p>
        </div>

        <div className="account-layout">
          <form className="account-form" onSubmit={signIn} noValidate>
            <fieldset>
              <legend>
                Connexion <span>à votre espace</span>
              </legend>
              <label className="form-group">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="vous@exemple.fr"
                />
              </label>
              <label className="form-group">
                Mot de passe
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </label>
              {error && (
                <small className="form-error" role="alert">
                  {error}
                </small>
              )}
              <button className="button button-dark full" type="submit">
                Se connecter <span aria-hidden="true">↗</span>
              </button>
              <small className="form-note">
                Prototype : la connexion est simulée côté navigateur pour la démonstration.
              </small>
            </fieldset>
          </form>

          <aside className="account-aside">
            <span className="eyebrow">Pas encore de compte ?</span>
            <h2>Créez votre espace NEXORA.</h2>
            <p>
              Suivez vos commandes, retrouvez vos favoris et accédez à votre historique d&apos;achats.
            </p>
            <button className="button button-quiet" type="button" onClick={() => setSignedIn(true)}>
              Créer un compte (démo)
            </button>
            <Link className="text-link" to="/faq">
              Questions fréquentes <span>↗</span>
            </Link>
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page container">
      <div className="page-intro compact">
        <span className="eyebrow">NEXORA / Compte</span>
        <h1>
          Votre <em>espace.</em>
        </h1>
        <p>Session de démonstration — {email || 'client@nexora.demo'}</p>
      </div>

      <div className="account-dashboard">
        <section className="account-card">
          <header>
            <span className="eyebrow">Commande récente</span>
            <button type="button" className="text-link" onClick={() => setSignedIn(false)}>
              Se déconnecter
            </button>
          </header>
          {state.order ? (
            <>
              <div className="summary-product">
                <span>{state.order.number}</span>
                <p>{state.order.date}</p>
                <strong>{formatPrice(state.order.total)}</strong>
              </div>
              <div className="account-order-items">
                {state.order.items.map((item) => (
                  <SmartImage key={item.product.id} src={item.product.image} alt={item.product.name} />
                ))}
              </div>
              <Link className="text-link" to="/confirmation">
                Voir le récapitulatif <span>↗</span>
              </Link>
            </>
          ) : (
            <div className="empty-state compact">
              <span aria-hidden="true">⌁</span>
              <h2>Aucune commande pour l&apos;instant.</h2>
              <Link className="button button-dark" to="/boutique">
                Commencer mes achats
              </Link>
            </div>
          )}
        </section>

        <section className="account-card">
          <header>
            <span className="eyebrow">Favoris</span>
          </header>
          <p>
            {state.wishlist.length} produit{state.wishlist.length > 1 ? 's' : ''} enregistré
            {state.wishlist.length > 1 ? 's' : ''}.
          </p>
          <Link className="text-link" to="/favoris">
            Ouvrir ma wishlist <span>↗</span>
          </Link>
        </section>

        <section className="account-card">
          <header>
            <span className="eyebrow">Informations</span>
          </header>
          <dl className="account-info">
            <div>
              <dt>Email</dt>
              <dd>{email || 'client@nexora.demo'}</dd>
            </div>
            <div>
              <dt>Statut</dt>
              <dd>Client (démo)</dd>
            </div>
            <div>
              <dt>Newsletter</dt>
              <dd>Inscrit · offre de bienvenue</dd>
            </div>
          </dl>
        </section>

        <section className="account-card danger-zone">
          <header>
            <span className="eyebrow">Données locales</span>
          </header>
          <p>
            Panier, favoris, code promo et dernière commande restent uniquement dans ce
            navigateur : rien n&apos;est envoyé à un serveur.
          </p>
          <p className="danger-zone-count">
            {state.cart.length} article{state.cart.length > 1 ? 's' : ''} au panier ·{' '}
            {state.wishlist.length} favori{state.wishlist.length > 1 ? 's' : ''} ·{' '}
            {state.order ? '1 commande enregistrée' : 'aucune commande'}
          </p>
          {confirmClear ? (
            <div className="danger-zone-actions">
              <p>Toutes ces données seront supprimées de ce navigateur. Action définitive.</p>
              <div className="danger-zone-buttons">
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    clearAllData();
                    setConfirmClear(false);
                    showToast('Données locales effacées', 'success');
                  }}
                >
                  Confirmer l&apos;effacement
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setConfirmClear(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setConfirmClear(true)}
            >
              Effacer toutes mes données locales
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

export default AccountPage;
