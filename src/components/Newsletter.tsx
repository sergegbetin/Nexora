import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  return (
    <section className="newsletter" aria-labelledby="newsletter-title">
      <div className="container newsletter-inner">
        <div>
          <span className="eyebrow light">La sélection, directement dans votre boîte mail</span>
          <h2 id="newsletter-title">
            Ne manquez aucune <em>offre.</em>
          </h2>
          <p className="newsletter-text">
            Recevez nos meilleures offres et nos nouveautés directement dans votre boîte mail.
          </p>
        </div>
        {sent ? (
          <p className="newsletter-success" role="status">
            Merci, votre inscription est confirmée (démo).
          </p>
        ) : (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                setError('Merci de saisir une adresse email valide.');
                return;
              }
              setError('');
              setSent(true);
            }}
          >
            <label htmlFor="newsletter-email">Votre adresse email</label>
            <div>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="vous@exemple.fr"
                value={email}
                aria-invalid={Boolean(error)}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit">
                Je m&apos;inscris <span aria-hidden="true">↗</span>
              </button>
            </div>
            {error ? (
              <small className="form-error" role="alert">
                {error}
              </small>
            ) : (
              <small>Pas de spam. Seulement les offres qui valent le détour.</small>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

export default Newsletter;
