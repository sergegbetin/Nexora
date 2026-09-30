import { useEffect, useRef, useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Chargement différé (lazy) — désactivé pour les images au-dessus de la ligne de flottaison */
  eager?: boolean;
}

/**
 * Image produit avec état de chargement (skeleton), fallback graphique en cas
 * d'échec et chargement différé pour la performance.
 */
export function SmartImage({ src, alt, className = '', eager = false }: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    const node = ref.current;
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, [src]);

  if (failed) {
    return (
      <div className={`image-fallback ${className}`} role="img" aria-label={alt}>
        <span aria-hidden="true">✦</span>
      </div>
    );
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={`${className} ${loaded ? 'is-loaded' : 'is-loading'}`.trim()}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
}

export default SmartImage;
