# NEXORA — Revue de sécurité

Périmètre : **SPA statique sans backend**. Aucune donnée ne quitte le navigateur
(aucun `fetch`, `XMLHttpRequest`, `axios`, `sendBeacon`, aucun tier).
Document mis à jour après la revue — `npm run verify` rejoue automatiquement
les contrôles listés en section 6.

---

## 1. Injections (XSS)

| État | Détail |
| --- | --- |
| ✅ | Aucun `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write` |
| ✅ | JSON-LD injecté via `script.textContent` (pas de concaténation de HTML) |
| ✅ | Tout contenu utilisateur (terme de recherche, messages d'erreur) rendu comme **enfants React** → échappement automatique |
| ✅ | Aucune `target="_blank"` sans `rel="noopener"` (aucun lien externe ouvert) |
| ✅ | Pas de `style=` alimenté par une saisie utilisateur (les couleurs proviennent des données produit internes) |
| ✅ | Aucune URL de redirection issue du paramètre d'entrée (pas de `navigate(userInput)`) |

Contrôlé par la règle **« sink XSS »** de `npm run audit`.

## 2. Données bancaires (PCI-DSS)

| État | Détail |
| --- | --- |
| ✅ | Le store persistant (`StoreContext.tsx`) **ne contient aucun champ `card`** : vérifié par audit |
| ✅ | `placeOrder()` ne transmet que nom, email, téléphone et adresse de livraison |
| ✅ | Le numéro de carte reste en mémoire React éphémère : jamais écrit dans `localStorage`, jamais transmis |
| ✅ | `autocomplete="off"` sur tous les champs de paiement |
| ✅ | Le checkout affiche explicitement que le paiement est traité par un prestataire |

**À faire avant la production :** remplacer le bloc de saisie par Stripe
Elements / Payment Element. Aucun composant maison ne doit jamais recevoir ni
stocker un PAN.

## 3. En-têtes de sécurité

Fichier : `public/_headers` (lu par Netlify et Cloudflare Pages ; copié dans
`dist/` à chaque build).

```
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none';
  frame-ancestors 'none'; form-action 'self'; img-src 'self' data:;
  style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self';
  connect-src 'self'; manifest-src 'self'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Point d'attention :

- `script-src 'self'` est tenable car **le bundle ne contient aucun script inline**.
- `style-src 'unsafe-inline'` est requis par les styles inline de React (`style={{}}`) ;
  il ne touche pas les scripts, ce qui reste le verrou principal.
- `index.html` porte en complément `<meta name="referrer">` (utile si l'hébergeur
  n'applique pas `_headers`).
- **Vercel, GitHub Pages, S3, nginx** : `_headers` est ignoré — reprenez ces
  en-têtes dans `vercel.json`, `_headers`/meta ou la config du serveur.
- `frame-ancestors`, `HSTS` et `Permissions-Policy` ne fonctionnent **que** via
  un en-tête HTTP (jamais via `<meta>`).

## 4. Vie privée

| État | Détail |
| --- | --- |
| ✅ | **Zéro tiers externe** : polices Inter et Space Grotesk auto-hébergées (`public/fonts/`, licence SIL OFL 1.1), images et scripts locaux |
| ✅ | Aucun analytics, tag manager, pixel publicitaire, cookie tiers, beacon |
| ✅ | Aucune donnée collectée côté serveur (il n'y en a pas) |
| ✅ | Usage du stockage local documenté sur `/confidentialite` et `/faq` |
| ✅ | Bouton **« Effacer toutes mes données locales »** (page Compte, double confirmation) : vide panier, favoris, promo et commande en une action |
| ✅ | Une valeur vidée **supprime sa clé** au lieu de la réécrire (plus de résidu dans le stockage) |
| ✅ | `Referrer-Policy: strict-origin-when-cross-origin` : pas de fuite d'URL internes |

Régénérer les polices (rare) : `npm run fonts` → `scripts/fetch-fonts.mjs`.

## 5. Dépendances

`npm audit` → **0 vulnérabilité** après les montées de version suivantes :

| Avant | Après | Advisory |
| --- | --- | --- |
| `react-router-dom` 6.x | **7.18.4** | Open redirect via `<Link>`/`useNavigate` (CVE-2025-68470) |
| `vite` 5.x (`esbuild` ≤0.24) | **8.3.1** | Serveur de dev exposé à n'importe quel site (GHSA-67mh-4wv8-2f99) |
| `@typescript-eslint/*` 6.x (`minimatch` 9.0.3) | **8.71.0** | ReDoS dans `minimatch` (3 advisories) |

Le correctif de `react-router` a nécessité un ajustement d'import :
`StaticRouter` vient désormais de `react-router` (plus de `react-router-dom/server`).

Vérification reproductible (nécessite le réseau) : `npm run audit:deps`.

## 6. Contrôles automatisés

`npm run verify` = `lint` + `build` (tsc) + rendu des **22 routes** en SSR +
`audit` (script maison) qui vérifie :

1. `<head>` : `lang`, `title`, description, Open Graph, viewport, **aucune ressource externe** ;
2. Intégrité des **57 images** référencées présentes sur le disque ;
3. Présence des **8 CTA** principaux (ajout au panier, achat, checkout…) ;
4. **5 règles de sécurité** dans le code source (XSS, réseau, `target=_blank`,
   champ bancaire dans le store, service tiers) + absence de `http://` ;
5. Les **7 en-têtes** de `public/_headers`, la meta referrer et les **22 fontes**
   auto-hébergées ;
6. Le texte visible de **16 pages** + scénarios panier → checkout → confirmation.

Deux commandes complémentaires :

| Commande | Ce qu'elle vérifie | Prérequis |
| --- | --- | --- |
| `npm run audit:ui` | Dans un vrai navigateur (~15 s) : les polices auto-hébergées se chargent, et l'effacement des données locales vide réellement le stockage (connexion → carte → confirmation) | `npm run build` + Chrome/Chromium (`CHROME_PATH` sinon) |
| `npm run audit:deps` | `npm audit` : 0 vulnérabilité dans l'arbre des dépendances | réseau |

## 7. Exactitude des contenus (pas de pratique trompeuse)

| État | Détail |
| --- | --- |
| ✅ | La politique de confidentialité ne promet plus un « bandeau de consentement » qui n'existe pas : elle décrit le stockage local **réellement** utilisé (aucun cookie, aucun traceur) |
| ✅ | Pas de fausse urgence : le compte à rebours reflète une date réelle, aucune mention de stock qui s'épuise |
| ✅ | Aucune certification ou garantie inventée (« paiement sécurisé », « retours 30 jours » sont décrits comme des informations de démonstration) |
| ✅ | Les avis clients sont explicitement étiquetés « Avis de démonstration » |
| ✅ | Les prix barrés sont justifiés par un prix initial conservé dans les données produit |
| ✅ | Aucun logo de marque tierce utilisé pour suggérer une affiliation ou un partenariat |

## 8. Limites connues (à traiter avant mise en production)

1. **SEO** : métadonnées injectées côté client. Pour les crawlers sans JavaScript,
   il faut activer le pré-rendu (`src/ssr-entry.tsx` existe, à brancher sur le build).
2. **Pas de backend** : le compte client est une démo (le mot de passe n'est ni
   haché ni stocké — il n'est même pas conservé), les commandes vivent en `localStorage`.
3. **Pas de contrôle d'abus** : aucun rate limiting ni protection anti-bot,
   ce qui n'a pas de sens sans serveur.
4. **`og:url` est relatif** : à rendre absolu dès que le domaine de production est fixé.
5. **Images** : licences et marques à revoir — `public/images/CREDITS.md`
   (6 fichiers CC BY-ND recadrés, produits de marques réelles photographiés pour
   des articles nommés NEXORA).
6. **HTTPS** et HSTS dépendent de l'hébergeur (redirection HTTP → HTTPS à activer).

## 9. Signalement

Pas de programme de bug bounty sur ce prototype : ouvrez une issue en décrivant
la reproduite, l'impact et la correction proposée.
