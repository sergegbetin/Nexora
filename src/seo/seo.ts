/**
 * Métadonnées SEO — source unique de vérité.
 *
 * Les mêmes balises sont produites de deux façons :
 *  - au pré-rendu (`scripts/prerender.mjs`) : sérialisées dans le HTML statique,
 *  - côté SPA (`src/hooks/useSeo.ts`) : écrites dans `document.head`.
 *
 * Les deux chemins passent par `buildSeoTags()`, donc le `<head>` servi aux
 * crawlers et celui obtenu après navigation sont identiques (aucune URL ni
 * aucun titre incohérent).
 */

export interface SeoOptions {
  /** Titre de la page (unique par route). */
  title: string;
  /** Meta description (unique par route, 120 à 160 caractères). */
  description: string;
  /** Chemin relatif de la page (ex. `/boutique`). Absent = pas de canonical (404). */
  path?: string;
  /** Image Open Graph (chemin relatif ou URL absolue). */
  image?: string;
  /** Directive robots — `index, follow` par défaut. */
  robots?: string;
  /** Données structurées JSON-LD. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export type SeoTag =
  | { key: string; tag: 'title'; content: string }
  | { key: string; tag: 'meta'; attribute: 'name' | 'property'; name: string; content: string }
  | { key: string; tag: 'link'; rel: string; href: string }
  | { key: string; tag: 'script'; content: string };

const DEFAULT_IMAGE = '/og-image.jpg';
const DEFAULT_ROBOTS = 'index, follow';
/** Repli uniquement local : voir README « Deployment security » (VITE_SITE_URL). */
const LOCAL_ORIGIN = 'http://localhost:4173';

function readEnv(): string | undefined {
  // Accès statique obligatoire : le module runner de Vite interdit tout accès
  // dynamique à `import.meta.env` (voir src/vite-env.d.ts pour le typage).
  return import.meta.env.VITE_SITE_URL;
}

/** Origine absolue utilisée pour canonical, Open Graph et JSON-LD. */
export function siteOrigin(): string {
  const configured = readEnv();
  if (configured) return configured.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return LOCAL_ORIGIN;
}

/** `true` quand le site est construit sans `VITE_SITE_URL` (URLs non définitives). */
export function isLocalOrigin(): boolean {
  return siteOrigin() === LOCAL_ORIGIN;
}

/** Transforme un chemin relatif en URL absolue (les URL complètes sont conservées). */
export function absoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteOrigin()}${value.startsWith('/') ? '' : '/'}${value}`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** JSON-LD sûr à insérer dans une balise `<script>` (aucune fermeture anticipée). */
export function toJsonLd(value: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** Construit la liste normalisée des balises `<head>` d'une page. */
export function buildSeoTags(seo: SeoOptions): SeoTag[] {
  const { title, description, path, image, jsonLd } = seo;
  const robots = seo.robots ?? DEFAULT_ROBOTS;
  const imageUrl = absoluteUrl(image ?? DEFAULT_IMAGE);
  const url = path ? absoluteUrl(path) : undefined;

  const tags: SeoTag[] = [
    { key: 'title', tag: 'title', content: title },
    { key: 'meta-description', tag: 'meta', attribute: 'name', name: 'description', content: description },
    { key: 'meta-robots', tag: 'meta', attribute: 'name', name: 'robots', content: robots },
    { key: 'meta-og:title', tag: 'meta', attribute: 'property', name: 'og:title', content: title },
    {
      key: 'meta-og:description',
      tag: 'meta',
      attribute: 'property',
      name: 'og:description',
      content: description,
    },
    { key: 'meta-og:type', tag: 'meta', attribute: 'property', name: 'og:type', content: 'website' },
    { key: 'meta-og:site_name', tag: 'meta', attribute: 'property', name: 'og:site_name', content: 'NEXORA' },
    { key: 'meta-og:image', tag: 'meta', attribute: 'property', name: 'og:image', content: imageUrl },
    { key: 'meta-og:image:alt', tag: 'meta', attribute: 'property', name: 'og:image:alt', content: title },
    {
      key: 'meta-twitter:card',
      tag: 'meta',
      attribute: 'name',
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    { key: 'meta-twitter:title', tag: 'meta', attribute: 'name', name: 'twitter:title', content: title },
    {
      key: 'meta-twitter:description',
      tag: 'meta',
      attribute: 'name',
      name: 'twitter:description',
      content: description,
    },
    { key: 'meta-twitter:image', tag: 'meta', attribute: 'name', name: 'twitter:image', content: imageUrl },
  ];

  if (url) {
    tags.push({ key: 'meta-og:url', tag: 'meta', attribute: 'property', name: 'og:url', content: url });
    tags.push({ key: 'link-canonical', tag: 'link', rel: 'canonical', href: url });
  }

  if (jsonLd) {
    tags.push({ key: 'jsonld', tag: 'script', content: toJsonLd(jsonLd) });
  }

  return tags;
}

/** Sert au pré-rendu : les balises deviennent du HTML statique. */
export function serializeSeoTags(tags: SeoTag[]): string {
  return tags
    .map((tag) => {
      switch (tag.tag) {
        case 'title':
          return `<title data-seo="${tag.key}">${escapeHtml(tag.content)}</title>`;
        case 'meta':
          return `<meta ${tag.attribute}="${tag.name}" content="${escapeHtml(tag.content)}" data-seo="${tag.key}" />`;
        case 'link':
          return `<link rel="${tag.rel}" href="${escapeHtml(tag.href)}" data-seo="${tag.key}" />`;
        case 'script':
          return `<script type="application/ld+json" id="page-jsonld" data-seo="${tag.key}">${tag.content}</script>`;
      }
    })
    .join('\n    ');
}

/**
 * Sert à la SPA : met à jour `document.head` sans jamais dupliquer une balise
 * (recherche par `data-seo`, puis par sélecteur sémantique) et supprime les
 * balises SEO de la page précédente.
 */
export function applySeoTags(tags: SeoTag[]): void {
  if (typeof document === 'undefined') return;
  const head = document.head;
  const seen = new Set<string>();

  for (const tag of tags) {
    seen.add(tag.key);

    if (tag.tag === 'title') {
      document.title = tag.content;
      head.querySelector('title')?.setAttribute('data-seo', tag.key);
      continue;
    }

    const selector =
      tag.tag === 'meta'
        ? `meta[${tag.attribute}="${tag.name}"]`
        : tag.tag === 'link'
          ? `link[rel="${tag.rel}"]`
          : 'script[data-seo="jsonld"]';

    let element =
      head.querySelector(`[data-seo="${tag.key}"]`) ?? head.querySelector(selector);

    if (!element) {
      element = document.createElement(
        tag.tag === 'link' ? 'link' : tag.tag === 'script' ? 'script' : 'meta',
      );
      if (tag.tag === 'script') {
        element.setAttribute('type', 'application/ld+json');
        element.setAttribute('id', 'page-jsonld');
      }
      head.appendChild(element);
    }

    if (tag.tag === 'meta') {
      element.setAttribute(tag.attribute, tag.name);
      element.setAttribute('content', tag.content);
    } else if (tag.tag === 'link') {
      element.setAttribute('rel', tag.rel);
      element.setAttribute('href', tag.href);
    } else {
      element.textContent = tag.content;
    }
    element.setAttribute('data-seo', tag.key);
  }

  head.querySelectorAll('[data-seo]').forEach((element) => {
    if (!seen.has(element.getAttribute('data-seo') ?? '')) element.remove();
  });
}
