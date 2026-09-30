# NEXORA — Cyber Week

E-commerce **complet et fonctionnel** (SPA React + TypeScript + Vite, CSS sur
mesure, aucun framework UI) pour la campagne Cyber Week. Interface en français,
direction artistique dark premium, accent unique (violet électrique), mobile first.

> Prototype de démonstration : aucun backend, aucune donnée envoyée ailleurs que
> le navigateur. Tout le contenu est **des données de démonstration**, modifiables
> dans `src/data/`.

---

## Aperçu du rendu

```bash
npm install
npm run build
npm run preview        # → http://localhost:4173/
```

Le serveur de prévisualisation sert le build optimisé de `dist/` :

**→ http://localhost:4173/**

En développement avec rechargement à chaud :

```bash
npm run dev            # → http://localhost:5173/
```

## Les 16 pages

| | | | |
| --- | --- | --- | --- |
| `/` Accueil | `/boutique` | `/categorie/:slug` | `/produit/:id` |
| `/panier` | `/checkout` (3 étapes) | `/confirmation` | `/recherche` |
| `/favoris` | `/compte` | `/faq` | `/contact` |
| `/conditions` | `/confidentialite` | `/livraison` | `/retours` |

Fonctions : panier (quantités, code promo, livraison, total), wishlist, recherche,
filtres + tri, aperçu rapide, tunnel d'achat, barre d'ajout au panier fixe sur
mobile, états vides/chargement/erreur, toasts, images avec repli.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | `tsc` + build Vite → `dist/` |
| `npm run preview` | sert `dist/` (port 4173) |
| `npm run lint` | ESLint (zéro warning toléré) |
| `npm run check:routes` | rend les 22 routes en SSR, attrape les erreurs d'exécution |
| `npm run audit` | SEO, intégrité des images, CTA, **5 règles de sécurité**, 16 pages vérifiées |
| `npm run audit:ui` | dans Chrome : polices auto-hébergées + effacement des données locales |
| `npm run audit:deps` | `npm audit` (0 vulnérabilité attendue) |
| `npm run verify` | `lint` + `build` + `check:routes` + `audit` — **le contrôle qualité complet** |
| `npm run fonts` | régénère les polices auto-hébergées (rare) |

## Modifier les données de démonstration

Tout est centralisé dans **`src/data/products.ts`** :

- `PRODUCTS` — 16 articles répartis en 6 catégories (`id`, `name`, `price`,
  `originalPrice`, `rating`, `stock`, `specs`…). Dupliquez une entrée pour
  ajouter un produit : il apparaît automatiquement en boutique, en catégorie,
  en recherche et dans les suggestions.
- `CATEGORIES` — libellé, slug, description et image de catégorie.
- `GIFT_GUIDES`, `TESTIMONIALS` — blocs de la page d'accueil.
- Codes promo : `PROMO_CODES` dans `src/context/StoreContext.tsx`.

Les images sont dans `public/images/` (avec `CREDITS.md` : provenance et licences).
Remplacez un fichier en gardant le même nom → tout le site suit.

## Personnaliser le design

`src/styles/globals.css` → bloc `:root` : couleurs (`--color-accent`), typographie,
rayons, ombres. `src/styles/pages.css` contient les styles de pages. Les tokens
sont commentés en anglais et en français.

## Déploiement

1. `npm run build` → le site est entièrement statique dans `dist/`.
2. Copiez `dist/` sur l'hébergeur (Netlify, Cloudflare Pages, nginx, S3…).
3. `public/_headers` est copié à la racine de `dist/` : il porte la CSP et les
   en-têtes de sécurité. **Hébergeurs qui ne le lisent pas** (Vercel, GitHub
   Pages) : reprenez ces en-têtes dans leur fichier de configuration — voir
   `SECURITY.md` § 3.
4. Activez la redirection HTTP → HTTPS.

## Sécurité et conformité

Voir **[SECURITY.md](./SECURITY.md)** : XSS, en-têtes, données bancaires
(prêtes pour Stripe Elements), vie privée (zéro tiers externe), dépendances,
contrôles automatisés et limites connues.

## Crédits

- Images : `public/images/CREDITS.md` (licences et auteurs — **6 fichiers CC BY-ND
  recadrés** à régler avant une mise en production commerciale).
- Polices : Inter et Space Grotesk, licence SIL Open Font License 1.1,
  hébergées localement dans `public/fonts/`.

## Limites

- Métadonnées SEO injectées côté client : un pré-rendu (`src/ssr-entry.tsx`) est
  nécessaire pour les crawlers sans JavaScript.
- Compte client et commandes de démonstration (aucun serveur, mot de passe jamais
  stocké).
- Produits de marques réelles photographiés pour des articles nommés NEXORA :
  à remplacer avant toute usage commercial.
