import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';

/* ─────────────────────────  FAQ  ───────────────────────── */
const FAQ_GROUPS = [
  {
    title: 'Commandes & paiement',
    items: [
      {
        q: 'Quels moyens de paiement sont acceptés ?',
        a: 'Carte bancaire (Visa, Mastercard), Apple Pay et PayPal. Le paiement est traité par un prestataire externe : ce site ne stocke aucune donnée bancaire.',
      },
      {
        q: 'Mes données de paiement sont-elles enregistrées ?',
        a: 'Non. Le formulaire de paiement est conçu pour être relié à un prestataire type Stripe : le numéro de carte n\'est jamais transmis ni conservé par le frontend.',
      },
      {
        q: 'Les prix affichés sont-ils définitifs ?',
        a: 'Les prix, remises et stocks de ce site sont des données de démonstration, modifiables directement dans le fichier de données produits.',
      },
    ],
  },
  {
    title: 'Livraison',
    items: [
      {
        q: 'Quels sont les délais de livraison ?',
        a: 'Livraison estimée sous 2 à 5 jours ouvrés en France métropolitaine (donnée de démonstration). Un numéro de suivi est communiqué à l\'expédition.',
      },
      {
        q: 'La livraison est-elle offerte ?',
        a: 'La livraison est offerte dès 100 € d\'achat après remise. En dessous, un forfait de 4,90 € s\'applique.',
      },
    ],
  },
  {
    title: 'Retours & suivi',
    items: [
      {
        q: 'Comment retourner un article ?',
        a: 'Depuis votre compte, sélectionnez la commande puis « Initier un retour ». Le produit doit être complet et dans son emballage d\'origine.',
      },
      {
        q: 'Quand suis-je remboursé ?',
        a: 'Le remboursement intervient une fois le retour réceptionné et contrôlé, sous quelques jours ouvrés (délais de démonstration).',
      },
      {
        q: 'Puis-je suivre ma commande ?',
        a: 'Oui, la page « Mon compte » affiche le statut et le lien de suivi dès l\'expédition.',
      },
    ],
  },
  {
    title: 'Compte & données',
    items: [
      {
        q: 'Où sont enregistrés mes favoris et mon panier ?',
        a: 'Uniquement dans le stockage local de votre navigateur. Ils disparaissent si vous videz les données du site.',
      },
      {
        q: 'Comment supprimer mes données ?',
        a: 'Depuis la page Compte : bouton « Effacer toutes mes données locales » (confirmation requise). Vider manuellement le stockage local du site produit le même résultat.',
      },
    ],
  },
];

export function FaqPage() {
  useSeo({
    title: 'FAQ — NEXORA | Questions fréquentes',
    description: 'Commandes, paiement, livraison, retours et compte : toutes les réponses NEXORA.',
    path: '/faq',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_GROUPS.flatMap((group) =>
        group.items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      ),
    },
  });

  return (
    <main className="content-page container">
      <div className="page-intro">
        <span className="eyebrow">NEXORA / FAQ</span>
        <h1>
          Tout ce qu&apos;il faut <em>savoir.</em>
        </h1>
        <p>
          Une question qui n&apos;apparaît pas ici ? Notre équipe vous répond depuis la page contact.
        </p>
      </div>

      <div className="faq-grid">
        {FAQ_GROUPS.map((group) => (
          <section key={group.title}>
            <h2>{group.title}</h2>
            <div className="faq-list">
              {group.items.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="content-cta">
        <p>Vous ne trouvez pas votre réponse ?</p>
        <Link className="button button-dark" to="/contact">
          Contacter le support <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </main>
  );
}

/* ────────────────────────  CONTACT  ─────────────────────── */
export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: 'Question produit', message: '' });
  const [error, setError] = useState('');

  useSeo({
    title: 'Contact — NEXORA',
    description: 'Contactez le service client NEXORA : questions produits, commandes, livraison et retours.',
    path: '/contact',
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      setError('Merci de renseigner un nom et un email valides.');
      return;
    }
    if (form.message.trim().length < 10) {
      setError('Votre message doit contenir au moins 10 caractères.');
      return;
    }
    setError('');
    setSent(true);
  };

  return (
    <main className="content-page container">
      <div className="page-intro">
        <span className="eyebrow">NEXORA / Contact</span>
        <h1>
          Parlons de <em>votre projet.</em>
        </h1>
        <p>Questions produit, suivi de commande, livraison ou retour : notre équipe vous répond.</p>
      </div>

      <div className="contact-layout">
        <form className="account-form" onSubmit={submit} noValidate>
          <fieldset>
            <legend>
              Votre message <span>— réponse sous 24 à 48 h</span>
            </legend>
            <div className="form-two">
              <label className="form-group">
                Nom
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  autoComplete="name"
                />
              </label>
              <label className="form-group">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  autoComplete="email"
                />
              </label>
            </div>
            <label className="form-group">
              Sujet
              <select
                className="form-select"
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
              >
                <option>Question produit</option>
                <option>Suivi de commande</option>
                <option>Livraison</option>
                <option>Retour ou remboursement</option>
                <option>Autre</option>
              </select>
            </label>
            <label className="form-group">
              Message
              <textarea
                rows={6}
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                placeholder="Décrivez votre demande…"
              />
            </label>
            {error && (
              <small className="form-error" role="alert">
                {error}
              </small>
            )}
            <button className="button button-dark full" type="submit">
              Envoyer le message <span aria-hidden="true">↗</span>
            </button>
            {sent && (
              <p className="form-success" role="status">
                Message envoyé (démo). Nous vous répondrons à {form.email}.
              </p>
            )}
          </fieldset>
        </form>

        <aside className="contact-aside">
          <div>
            <span className="eyebrow">Service client</span>
            <strong>support@nexora.demo</strong>
            <small>Du lundi au vendredi · 9h – 18h</small>
          </div>
          <div>
            <span className="eyebrow">Commandes</span>
            <strong>commandes@nexora.demo</strong>
            <small>Suivi, facturation, retours</small>
          </div>
          <div>
            <span className="eyebrow">Adresse (démo)</span>
            <strong>12 rue du Faubourg, 75008 Paris</strong>
            <small>Adresse fictive pour la démonstration</small>
          </div>
          <Link className="text-link" to="/faq">
            Consulter la FAQ <span>↗</span>
          </Link>
        </aside>
      </div>
    </main>
  );
}

/* ────────────────────────  LÉGAL  ───────────────────────── */
function LegalLayout({
  title,
  intro,
  sections,
  updated = '29 septembre 2026',
}: {
  title: string;
  intro: string;
  sections: { h: string; p: string[] }[];
  updated?: string;
}) {
  return (
    <main className="content-page container">
      <div className="page-intro">
        <span className="eyebrow">NEXORA / Informations légales</span>
        <h1>{title}</h1>
        <p>{intro}</p>
        <small className="legal-updated">Dernière mise à jour : {updated} · Document de démonstration</small>
      </div>
      <div className="legal-content">
        {sections.map((section) => (
          <section key={section.h}>
            <h2>{section.h}</h2>
            {section.p.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}

export function ConditionsPage() {
  useSeo({
    title: 'Conditions générales de vente — NEXORA',
    description: 'Conditions générales de vente du prototype NEXORA : commande, prix, paiement, livraison et litiges.',
    path: '/conditions',
  });
  return (
    <LegalLayout
      title="Conditions générales"
      intro="Les présentes conditions encadrent l'utilisation du site NEXORA et les modalités de commande. Ce site est un prototype de démonstration."
      sections={[
        {
          h: '1. Objet',
          p: [
            'NEXORA est une boutique en ligne de produits tech et lifestyle. La validation d\'un commande vaut acceptation des présentes conditions dans leur version en vigueur au moment de l\'achat.',
            'Les produits, prix, stocks et avis présentés sur ce prototype sont des données de démonstration et ne constituent pas une offre contractuelle réelle.',
          ],
        },
        {
          h: '2. Prix et paiement',
          p: [
            'Les prix sont indiqués en euros, toutes taxes comprises. Les frais de livraison sont affichés avant validation de la commande : livraison offerte à partir de 100 € d\'achat après remise, sinon forfait de 4,90 €.',
            'Le paiement est assuré par un prestataire externe. Aucune donnée bancaire n\'est collectée ni stockée par le frontend de ce site.',
          ],
        },
        {
          h: '3. Livraison',
          p: [
            'Les délais indiqués sont estimatifs (2 à 5 jours ouvrés en France métropolitaine pour cette démonstration). Un numéro de suivi est communiqué à l\'expédition.',
          ],
        },
        {
          h: '4. Droit de rétractation et retours',
          p: [
            'Conformément à la législation applicable, le client dispose d\'un délai de rétractation. Les modalités de retour sont détaillées dans la politique de retour.',
            'Le remboursement intervient après réception et contrôle du produit retourné.',
          ],
        },
        {
          h: '5. Responsabilité et litiges',
          p: [
            'NEXORA ne saurait être tenu responsable des dommages résultant d\'un usage non conforme des produits. En cas de litige, une solution amiable est recherchée avant toute action judiciaire.',
          ],
        },
      ]}
    />
  );
}

export function PrivacyPage() {
  useSeo({
    title: 'Politique de confidentialité — NEXORA',
    description: 'Comment NEXORA traite vos données personnelles : finalités, conservation et droits.',
    path: '/confidentialite',
  });
  return (
    <LegalLayout
      title="Politique de confidentialité"
      intro="Cette politique décrit les données traitées par NEXORA lors de la navigation et de la commande."
      sections={[
        {
          h: '1. Données collectées',
          p: [
            'Lors de la commande : nom, email, téléphone, adresse de livraison. Lors de la navigation : préférences d\'affichage, contenus du panier et de la wishlist.',
            'Ce prototype ne transmet aucune donnée à un serveur : panier, favoris et dernière commande sont conservés dans le stockage local du navigateur.',
          ],
        },
        {
          h: '2. Finalités',
          p: [
            'Traitement des commandes, suivi client, envoi des offres commerciales (avec consentement) et amélioration de l\'expérience d\'achat.',
          ],
        },
        {
          h: '3. Base légale et conservation',
          p: [
            'Exécution du contrat, intérêt légitime et consentement. Les données sont conservées pendant la durée nécessaire aux finalités, puis archivées selon les obligations applicables.',
          ],
        },
        {
          h: '4. Vos droits',
          p: [
            'Vous disposez de droits d\'accès, de rectification, d\'effacement, de limitation et d\'opposition. Pour les exercer : privacy@nexora.demo.',
            'Dans ce prototype, l\'effacement est immédiat et autonome : bouton « Effacer toutes mes données locales » sur la page Compte. Aucune donnée n\'étant envoyée à un serveur, rien n\'a d\'ailleurs à être supprimé ailleurs.',
          ],
        },
        {
          h: '5. Stockage local et cookies',
          p: [
            'Aucun cookie n\'est utilisé : le panier, les favoris, le code promo et la dernière commande sont enregistrés dans le stockage local de votre navigateur (clés « nexora_ »). La suppression de ces valeurs vide le panier et efface la commande.',
            'Aucun outil de mesure d\'audience, aucun traceur publicitaire et aucun service tiers ne sont chargés (polices, images et scripts sont hébergés avec le site).',
            'Vous pouvez supprimer ces données à tout moment depuis la page Compte ou depuis les réglages de votre navigateur (« Confidentialité et sécurité » → « Données des sites »).',
          ],
        },
      ]}
    />
  );
}

export function ShippingPage() {
  useSeo({
    title: 'Politique de livraison — NEXORA',
    description:
      'Délais, frais de port, zones desservies et suivi de commande : toute la politique de livraison NEXORA, de la préparation du colis à sa remise.',
    path: '/livraison',
  });
  return (
    <LegalLayout
      title="Politique de livraison"
      intro="Délais, tarifs et suivi : tout ce qu'il faut savoir avant de commander."
      sections={[
        {
          h: '1. Délais estimés',
          p: [
            'France métropolitaine : 2 à 5 jours ouvrés. Union européenne : 4 à 8 jours ouvrés. Ces délais sont indicatifs et correspondent à des données de démonstration.',
          ],
        },
        {
          h: '2. Tarifs',
          p: [
            'Livraison offerte dès 100 € d\'achat après remise, sinon forfait de 4,90 € en France métropolitaine. Le montant exact est affiché dans le panier avant paiement.',
          ],
        },
        {
          h: '3. Suivi de commande',
          p: [
            'Un numéro de suivi est disponible dans « Mon compte » dès l\'expédition. Un email de confirmation récapitule également la commande.',
          ],
        },
        {
          h: '4. Absence ou retard',
          p: [
            'En cas de retard supérieur au délai annoncé, contactez le service client : une enquête est ouverte auprès du transporteur.',
          ],
        },
      ]}
    />
  );
}

export function ReturnsPage() {
  useSeo({
    title: 'Politique de retour — NEXORA',
    description:
      'Retour NEXORA sous 30 jours en trois étapes : demande depuis votre compte, envoi du colis, puis remboursement après contrôle. Conditions et exceptions.',
    path: '/retours',
  });
  return (
    <LegalLayout
      title="Politique de retour"
      intro="Un retour simple, clair et suivi, sans mauvaise surprise."
      sections={[
        {
          h: '1. Délai de retour',
          p: [
            'Vous pouvez demander un retour dans les 14 jours suivant la réception (délai de démonstration aligné sur le droit de rétractation applicable).',
          ],
        },
        {
          h: '2. État du produit',
          p: [
            'Le produit doit être complet, non utilisé et dans son emballage d\'origine, avec les accessoires et la notice.',
          ],
        },
        {
          h: '3. Procédure',
          p: [
            'Depuis « Mon compte », sélectionnez la commande puis « Initier un retour ». Un étiquette de retour et les instructions vous sont envoyées par email.',
          ],
        },
        {
          h: '4. Remboursement',
          p: [
            'Le remboursement intervient sur le moyen de paiement d\'origine une fois le retour réceptionné et contrôlé, sous quelques jours ouvrés.',
            'Les frais de retour sont à la charge du client, sauf produit défectueux ou erreur d\'expédition.',
          ],
        },
      ]}
    />
  );
}

export function NotFoundPage() {
  useSeo({
    title: 'Page introuvable — NEXORA',
    description: 'Cette page n\'existe pas ou a été déplacée.',
    robots: 'noindex, nofollow',
  });
  return (
    <main className="empty-state container">
      <span aria-hidden="true">404</span>
      <h2>Cette page n&apos;existe pas.</h2>
      <p>Le lien est peut-être obsolète. Explorez plutôt nos offres du moment.</p>
      <div className="empty-suggestions">
        <Link className="button button-dark" to="/">
          Accueil
        </Link>
        <Link className="button button-quiet" to="/boutique">
          Boutique
        </Link>
        <Link className="button button-quiet" to="/faq">
          FAQ
        </Link>
      </div>
    </main>
  );
}
