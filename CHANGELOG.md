# Changelog

Toutes les modifications notables de NEXORA sont documentées dans ce fichier.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnage suivant le [sémantique](https://semver.org/lang/fr/).

## [Unreleased]

## [0.1.0] - 2026-09-30

Première version publique : base du projet NEXORA, boutique de démonstration
cyber-week entièrement statique et fonctionnelle.

### Added

- **Architecture statique** — pré-rendu SSG de 39 fichiers HTML couvrant 30
  routes indexables (`/`, `/boutique`, `/categorie/*`, `/produit/*`, `/faq`,
  `/contact`, `/livraison`, `/retours`, `/confidentialite`, `/conditions`,
  `/recherche`, `/panier`, `/checkout`), avec titre, description, canonique,
  Open Graph et `lang="fr"` par route.
- **Catalogue** — 16 produits, pages catégorie avec tri et filtres, fiche
  produit avec galerie, avis de démonstration et produits associés.
- **Parcours d'achat** — panier persistant, code promo, checkout en 3 étapes,
  page de confirmation, espace compte, favoris et recherche.
- **Paiement** — architecture Stripe Elements / Payment Intent en double mode :
  `MODE DEMO` par défaut (aucun champ bancaire, aucune transaction) et
  `MODE STRIPE` activé uniquement par clé publique. Serveur de référence
  (`server/create-payment-intent.example.mjs`) avec montants recalculés côté
  serveur (`server/prices.json`).
- **Sécurité du déploiement** — en-têtes CSP/HSTS/X-Frame-Options dans
  `public/_headers`, miroir `vercel.json`, `.env.example` sans secret réel,
  `STRIPE_SECRET_KEY` strictement côté serveur.
- **Chaîne d'audits** — `npm run verify` = lint + build + routes + audit SEO,
  secret scan, contrôle des champs bancaires, audit UI et audit visuel
  responsive (1440/1280/1024/390/375 px) avec contrôle des contrastes WCAG AA,
  des erreurs console et du parcours utilisateur complet.
- **Documentation** — `README.md`, `SECURITY.md`, `public/images/CREDITS.md`.

### Fixed

- Contrastes WCAG AA insuffisants : jeton `--color-text-muted` éclairci
  (3,2:1 → 5:1 sur les fonds sombres), mots accentués lime rendus illisibles
  sur les bandes lime (`.flash-band`, `.newsletter`), texte hérité du noir sur
  carte sombre dans `.flash-offer`.
- Robustesse du stockage local : les valeurs de `nexora_cart`,
  `nexora_wishlist`, `nexora_promo` et `nexora_order` sont désormais validées
  par type avant usage (un panier corrompu provoquait une page blanche).
- Placeholder d'exemple `sk_test_…` rejeté par le secret scanning de GitHub,
  remplacé par un libellé non malléable.

[Unreleased]: https://github.com/sergegbetin/Nexora/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sergegbetin/Nexora/releases/tag/v0.1.0
