import { image } from '../assets/images';

// Formatage partagé (re-exporté ici pour compatibilité avec les pages existantes)
export { formatPrice } from '../utils/format';

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  gallery: string[];
  stock: number;
  badge: 'promo' | 'new' | 'bestseller' | 'cyber' | null;
  badgeText?: string;
  specifications: ProductSpec[];
  tags: string[];
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  colors?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  icon: string;
}

// ─── Visuels produits NEXORA (public/images) ───
// Chaque image possède un fichier de crédits : public/images/CREDITS.md

export const PRODUCTS: Product[] = [
  // ── AUDIO ──
  {
    id: 'p001',
    name: 'NEXORA AirPods Pro X',
    slug: 'nexora-airpods-pro-x',
    category: 'Audio',
    categorySlug: 'audio',
    shortDescription: 'True wireless avec réduction de bruit active adaptative',
    description: 'Plongez dans un son d\'exception avec les NEXORA AirPods Pro X. Réduction de bruit active de nouvelle génération, autonomie jusqu\'à 36h avec le boîtier, résistance IPX4 et son spatial immersif pour une expérience audio sans compromis.',
    price: 89.90,
    originalPrice: 129.90,
    discount: 31,
    rating: 4.8,
    reviews: 2847,
    image: image('product-airpods.jpg'),
    gallery: [image('gallery-earbuds-2.jpg'), image('gallery-earbuds-3.jpg')],
    stock: 47,
    badge: 'cyber',
    badgeText: 'Cyber Week',
    specifications: [
      { label: 'Connectivité', value: 'Bluetooth 5.3' },
      { label: 'Autonomie', value: '8h + 28h (boîtier)' },
      { label: 'Réduction de bruit', value: 'Active adaptative (ANC)' },
      { label: 'Résistance', value: 'IPX4' },
      { label: 'Codec', value: 'AAC, SBC, LDAC' },
      { label: 'Poids', value: '5.4g par écouteur' },
    ],
    tags: ['audio', 'sans-fil', 'anc', 'sport'],
    isFeatured: true,
    isFlashDeal: true,
    colors: ['#1a1a1a', '#f5f5f5', '#8B4513'],
  },
  {
    id: 'p002',
    name: 'NEXORA SoundMax Headphones',
    slug: 'nexora-soundmax-headphones',
    category: 'Audio',
    categorySlug: 'audio',
    shortDescription: 'Casque over-ear haut de gamme, 40h d\'autonomie',
    description: 'Le NEXORA SoundMax redéfinit l\'expérience d\'écoute avec ses drivers planar magnétiques de 50mm, sa réduction de bruit active 3D et son design ergonomique en aluminium brossé. Pour les audiophiles exigeants.',
    price: 99.90,
    originalPrice: 149.90,
    discount: 33,
    rating: 4.9,
    reviews: 1632,
    image: image('product-soundmax.jpg'),
    gallery: [image('gallery-headphones-2.jpg'), image('gallery-headphones-3.jpg')],
    stock: 23,
    badge: 'bestseller',
    badgeText: 'Best Seller',
    specifications: [
      { label: 'Drivers', value: 'Planar magnétique 50mm' },
      { label: 'Autonomie', value: '40h avec ANC' },
      { label: 'Réduction de bruit', value: 'Active 3D' },
      { label: 'Réponse en fréquence', value: '4Hz – 40kHz' },
      { label: 'Matériaux', value: 'Aluminium brossé + cuir synthétique' },
      { label: 'Charge', value: 'USB-C, charge rapide 15min = 4h' },
    ],
    tags: ['audio', 'casque', 'premium', 'audiophile'],
    isFeatured: true,
    isFlashDeal: false,
    colors: ['#1a1a1a', '#2c2c3e'],
  },
  {
    id: 'p003',
    name: 'NEXORA BoomBox Mini',
    slug: 'nexora-boombox-mini',
    category: 'Audio',
    categorySlug: 'audio',
    shortDescription: 'Enceinte portable 360° avec son panoramique',
    description: 'Musique partout avec l\'enceinte NEXORA BoomBox Mini. Son 360° avec 2 woofers de 5W chacun, basses profondes, résistance IP67 et 24h d\'autonomie. Parfaite pour les aventures indoor et outdoor.',
    price: 59.90,
    originalPrice: 89.90,
    discount: 33,
    rating: 4.6,
    reviews: 3201,
    image: image('product-boombox.jpg'),
    gallery: [image('gallery-speaker-2.jpg')],
    stock: 89,
    badge: 'promo',
    badgeText: '-33%',
    specifications: [
      { label: 'Puissance', value: '2 × 5W' },
      { label: 'Son', value: '360° panoramique' },
      { label: 'Autonomie', value: '24h' },
      { label: 'Résistance', value: 'IP67' },
      { label: 'Connectivité', value: 'Bluetooth 5.0, NFC' },
      { label: 'Poids', value: '480g' },
    ],
    tags: ['audio', 'enceinte', 'portable', 'outdoor'],
    isFeatured: false,
    isFlashDeal: true,
    colors: ['#1a1a1a', '#2d4a3e', '#4a2d2d'],
  },

  // ── SMARTPHONES ──
  {
    id: 'p004',
    name: 'NEXORA Apex Pro 15',
    slug: 'nexora-apex-pro-15',
    category: 'Smartphones',
    categorySlug: 'smartphones',
    shortDescription: 'Smartphone flagship 6.7" AMOLED 144Hz, IA avancée',
    description: 'Le NEXORA Apex Pro 15 repousse les limites avec son écran AMOLED 6.7" 144Hz, son processeur neural de 4nm et son triple capteur caméra 200MP. Performance ultime, recharge 100W et batterie 5000mAh pour tenir toute la journée et plus.',
    price: 549.00,
    originalPrice: 799.00,
    discount: 31,
    rating: 4.9,
    reviews: 5420,
    image: image('product-apex.jpg'),
    gallery: [image('gallery-phone-2.jpg'), image('gallery-phone-3.jpg')],
    stock: 31,
    badge: 'cyber',
    badgeText: 'Cyber Week',
    specifications: [
      { label: 'Écran', value: '6.7" AMOLED 144Hz, 2K' },
      { label: 'Processeur', value: 'NEXORA Neural 4nm' },
      { label: 'RAM', value: '12 Go LPDDR5X' },
      { label: 'Stockage', value: '256 Go UFS 4.0' },
      { label: 'Caméra', value: '200MP + 50MP + 12MP' },
      { label: 'Batterie', value: '5000mAh, charge 100W' },
    ],
    tags: ['smartphone', 'flagship', '5G', 'IA'],
    isFeatured: true,
    isFlashDeal: false,
    colors: ['#1a1a2e', '#2e1a1a', '#1a2e1a'],
  },
  {
    id: 'p005',
    name: 'NEXORA Slim X12',
    slug: 'nexora-slim-x12',
    category: 'Smartphones',
    categorySlug: 'smartphones',
    shortDescription: 'Smartphone ultra-fin 6.1", design signature en verre',
    description: 'Élégance et performance avec le NEXORA Slim X12. Le smartphone le plus fin de sa génération (5.8mm) avec un écran AMOLED 6.1" cristallin, batterie 4200mAh et un design en verre poli satiné qui attire tous les regards.',
    price: 349.00,
    originalPrice: 499.00,
    discount: 30,
    rating: 4.7,
    reviews: 2180,
    image: image('product-slim.jpg'),
    gallery: [image('gallery-slim-2.jpg'), image('gallery-slim-3.jpg')],
    stock: 55,
    badge: 'new',
    badgeText: 'Nouveau',
    specifications: [
      { label: 'Écran', value: '6.1" AMOLED 90Hz, Full HD+' },
      { label: 'Épaisseur', value: '5.8mm' },
      { label: 'RAM', value: '8 Go' },
      { label: 'Stockage', value: '128 Go' },
      { label: 'Caméra', value: '64MP + 12MP' },
      { label: 'Batterie', value: '4200mAh, charge 65W' },
    ],
    tags: ['smartphone', 'slim', 'design', 'premium'],
    isFeatured: false,
    isFlashDeal: true,
    colors: ['#f5f5f5', '#1a1a2e', '#c9a96e'],
  },

  // ── INFORMATIQUE ──
  {
    id: 'p006',
    name: 'NEXORA UltraBook 14',
    slug: 'nexora-ultrabook-14',
    category: 'Informatique',
    categorySlug: 'informatique',
    shortDescription: 'Laptop ultraportable 14" OLED, 18h d\'autonomie',
    description: 'Productivité maximale avec le NEXORA UltraBook 14. Écran OLED 14" 100% DCI-P3, processeur dernière génération, 18h d\'autonomie et moins de 1.2kg. Conçu pour les professionnels mobiles les plus exigeants.',
    price: 699.00,
    originalPrice: 899.00,
    discount: 22,
    rating: 4.8,
    reviews: 1876,
    image: image('product-ultrabook.jpg'),
    gallery: [image('gallery-laptop-2.jpg'), image('gallery-laptop-3.jpg')],
    stock: 18,
    badge: 'cyber',
    badgeText: 'Cyber Week',
    specifications: [
      { label: 'Écran', value: '14" OLED 2.8K, 120Hz' },
      { label: 'Processeur', value: 'Intel Core Ultra 7 155H' },
      { label: 'RAM', value: '16 Go LPDDR5X' },
      { label: 'Stockage', value: '512 Go NVMe Gen5' },
      { label: 'GPU', value: 'Intel Arc + NVIDIA RTX 4060' },
      { label: 'Autonomie', value: '18h, charge 100W' },
    ],
    tags: ['laptop', 'ultrabook', 'professionnel', 'portable'],
    isFeatured: true,
    isFlashDeal: false,
    colors: ['#2c2c2c', '#f0f0f0'],
  },
  {
    id: 'p007',
    name: 'NEXORA MechKey Pro',
    slug: 'nexora-mechkey-pro',
    category: 'Gaming',
    categorySlug: 'gaming',
    shortDescription: 'Clavier mécanique TKL RGB, switches optiques',
    description: 'Précision de frappe ultime avec le NEXORA MechKey Pro. Switches optiques à 0.2ms de latence, rétroéclairage RGB par touche, châssis en aluminium anodisé et logiciel de personnalisation avancé. Le clavier gaming qui ne fait aucun compromis.',
    price: 119.00,
    originalPrice: 159.00,
    discount: 25,
    rating: 4.7,
    reviews: 943,
    image: image('product-mechkey.jpg'),
    gallery: [image('gallery-keyboard-2.jpg'), image('gallery-keyboard-3.jpg')],
    stock: 62,
    badge: 'promo',
    badgeText: '-25%',
    specifications: [
      { label: 'Format', value: 'TKL (80%)' },
      { label: 'Switches', value: 'Optique NEXORA Red / Blue / Brown' },
      { label: 'Latence', value: '0.2ms' },
      { label: 'Rétroéclairage', value: 'RGB par touche, 16.8M couleurs' },
      { label: 'Châssis', value: 'Aluminium anodisé' },
      { label: 'Connexion', value: 'USB-C + Bluetooth 5.0' },
    ],
    tags: ['gaming', 'clavier', 'mécanique', 'rgb'],
    isFeatured: false,
    isFlashDeal: false,
    colors: ['#1a1a1a', '#2c1a2e'],
  },

  // ── GAMING ──
  {
    id: 'p008',
    name: 'NEXORA VisionPad Pro',
    slug: 'nexora-visionpad-pro',
    category: 'Gaming',
    categorySlug: 'gaming',
    shortDescription: 'Manette gaming pro, retour haptique avancé',
    description: 'Prenez le contrôle total avec la NEXORA VisionPad Pro. Retour haptique ultra-précis, gâchettes adaptatives 8 niveaux, autonomie 30h et compatibilité multi-plateforme (PC, console, mobile). Gaming à son meilleur.',
    price: 79.90,
    originalPrice: 99.90,
    discount: 20,
    rating: 4.6,
    reviews: 1542,
    image: image('product-visionpad.jpg'),
    gallery: [image('gallery-pad-2.jpg'), image('gallery-pad-3.jpg')],
    stock: 74,
    badge: 'promo',
    badgeText: '-20%',
    specifications: [
      { label: 'Compatibilité', value: 'PC, PS4/5, Xbox, Mobile' },
      { label: 'Haptique', value: 'HD Rumble + retour haptique' },
      { label: 'Gâchettes', value: 'Adaptatives 8 niveaux' },
      { label: 'Autonomie', value: '30h' },
      { label: 'Connexion', value: 'Bluetooth 5.1 + USB-C filaire' },
      { label: 'Latence', value: '<1ms filaire' },
    ],
    tags: ['gaming', 'manette', 'console', 'multi-plateforme'],
    isFeatured: false,
    isFlashDeal: true,
    colors: ['#1a1a1a', '#2d1a3e', '#1a2e3e'],
  },
  {
    id: 'p009',
    name: 'NEXORA ProMouse X',
    slug: 'nexora-promouse-x',
    category: 'Gaming',
    categorySlug: 'gaming',
    shortDescription: 'Souris gaming 26000 DPI, 60h sans-fil',
    description: 'La NEXORA ProMouse X offre la précision dont vous avez besoin pour dominer. Capteur optique 26000 DPI, technologie sans-fil ultra-faible latence, 60h d\'autonomie et design ergonomique profilé pour des sessions longues.',
    price: 69.90,
    originalPrice: 99.90,
    discount: 30,
    rating: 4.8,
    reviews: 2104,
    image: image('product-promouse.jpg'),
    gallery: [image('gallery-mouse-2.jpg'), image('gallery-mouse-3.jpg')],
    stock: 41,
    badge: 'bestseller',
    badgeText: 'Best Seller',
    specifications: [
      { label: 'Capteur', value: 'Optique 26000 DPI' },
      { label: 'Connexion', value: 'Sans-fil 2.4GHz + USB-C' },
      { label: 'Latence', value: '1ms' },
      { label: 'Autonomie', value: '60h' },
      { label: 'Poids', value: '63g' },
      { label: 'Boutons', value: '7 programmables' },
    ],
    tags: ['gaming', 'souris', 'esport', 'sans-fil'],
    isFeatured: true,
    isFlashDeal: false,
    colors: ['#1a1a1a', '#2d1a1a'],
  },

  // ── SMARTWATCH ──
  {
    id: 'p010',
    name: 'NEXORA Vision Smartwatch',
    slug: 'nexora-vision-smartwatch',
    category: 'Lifestyle',
    categorySlug: 'lifestyle',
    shortDescription: 'Smartwatch AMOLED 1.5", santé avancée et GPS',
    description: 'Votre compagnon santé et connectivité avec la NEXORA Vision Smartwatch. Écran AMOLED 1.5" Always-On, suivi santé avancé (ECG, SpO2, stress), GPS intégré, 150+ modes sport et jusqu\'à 14 jours d\'autonomie.',
    price: 79.90,
    originalPrice: 119.90,
    discount: 33,
    rating: 4.7,
    reviews: 3841,
    image: image('product-smartwatch.jpg'),
    gallery: [image('gallery-watch-2.jpg'), image('gallery-watch-3.jpg')],
    stock: 93,
    badge: 'cyber',
    badgeText: 'Cyber Week',
    specifications: [
      { label: 'Écran', value: '1.5" AMOLED Always-On' },
      { label: 'Autonomie', value: '14 jours' },
      { label: 'Santé', value: 'ECG, SpO2, stress, sommeil' },
      { label: 'GPS', value: 'Intégré 5 systèmes' },
      { label: 'Sport', value: '150+ modes' },
      { label: 'Résistance', value: '5ATM + IP68' },
    ],
    tags: ['smartwatch', 'santé', 'sport', 'GPS'],
    isFeatured: true,
    isFlashDeal: true,
    colors: ['#1a1a1a', '#c9a96e', '#2d2d4e'],
  },

  // ── MAISON CONNECTÉE ──
  {
    id: 'p011',
    name: 'NEXORA SmartHub 4K',
    slug: 'nexora-smarthub-4k',
    category: 'Maison connectée',
    categorySlug: 'maison-connectee',
    shortDescription: 'Hub domotique central, compatible Matter & Thread',
    description: 'Centralisez toute votre maison intelligente avec le NEXORA SmartHub 4K. Compatible Matter, Thread, Zigbee, Z-Wave et Wi-Fi 6E, il connecte jusqu\'à 200 appareils simultanément avec une interface tactile 4" intégrée.',
    price: 129.00,
    originalPrice: 179.00,
    discount: 28,
    rating: 4.5,
    reviews: 728,
    image: image('product-smarthub.jpg'),
    gallery: [image('gallery-hub-2.jpg')],
    stock: 35,
    badge: 'new',
    badgeText: 'Nouveau',
    specifications: [
      { label: 'Protocoles', value: 'Matter, Thread, Zigbee, Z-Wave, Wi-Fi 6E' },
      { label: 'Appareils', value: 'Jusqu\'à 200 simultanés' },
      { label: 'Écran', value: 'Tactile 4" Full HD' },
      { label: 'Processeur', value: 'Quad-Core 2.0GHz' },
      { label: 'Assistant', value: 'NEXORA AI + compatible Alexa, Google' },
      { label: 'Connexion', value: 'Wi-Fi 6E, Ethernet, USB' },
    ],
    tags: ['smarthome', 'domotique', 'hub', 'matter'],
    isFeatured: false,
    isFlashDeal: false,
    colors: ['#f0f0f0', '#1a1a1a'],
  },
  {
    id: 'p012',
    name: 'NEXORA LightStrip Pro',
    slug: 'nexora-lightstrip-pro',
    category: 'Maison connectée',
    categorySlug: 'maison-connectee',
    shortDescription: 'Ruban LED RGBWW 5m, sync musique, IA adaptatif',
    description: 'Transformez votre intérieur avec le NEXORA LightStrip Pro. 5 mètres de LED RGBWW haute densité, synchronisation musicale en temps réel, IA d\'ambiance adaptative et 16 millions de couleurs pour une atmosphère sur mesure.',
    price: 39.90,
    originalPrice: 59.90,
    discount: 33,
    rating: 4.6,
    reviews: 5632,
    image: image('product-lightstrip.jpg'),
    gallery: [image('gallery-strip-2.jpg'), image('gallery-strip-3.jpg')],
    stock: 147,
    badge: 'bestseller',
    badgeText: 'Best Seller',
    specifications: [
      { label: 'Longueur', value: '5m (extensible jusqu\'à 30m)' },
      { label: 'LEDs', value: 'RGBWW haute densité 60 LED/m' },
      { label: 'Couleurs', value: '16 millions' },
      { label: 'Sync', value: 'Musicale temps réel' },
      { label: 'Compatibilité', value: 'Wi-Fi, Matter, Alexa, Google, Apple' },
      { label: 'IA', value: 'Ambiance adaptative selon heure/activité' },
    ],
    tags: ['smarthome', 'lumière', 'ambiance', 'décoration'],
    isFeatured: false,
    isFlashDeal: true,
    colors: [],
  },
  {
    id: 'p013',
    name: 'NEXORA ThermoSense',
    slug: 'nexora-thermosense',
    category: 'Maison connectée',
    categorySlug: 'maison-connectee',
    shortDescription: 'Thermostat connecté, pilotage IA et app NEXORA',
    description: 'Gérez le confort de votre logement avec le NEXORA ThermoSense. Écran tactile rétrodéclairé, apprentissage automatique de vos habitudes, pilotage à distance depuis l\'app NEXORA et compatibilité Matter, Alexa et Google Home. Installation sur support existant en quelques minutes.',
    price: 149.00,
    originalPrice: 199.00,
    discount: 25,
    rating: 4.6,
    reviews: 964,
    image: image('product-thermo.jpg'),
    gallery: [image('gallery-thermo-2.jpg')],
    stock: 29,
    badge: 'promo',
    badgeText: '-25%',
    specifications: [
      { label: 'Écran', value: 'Tactile couleur 2.4", luminosité auto' },
      { label: 'Connexion', value: 'Wi-Fi 6 + Bluetooth 5.2 + Matter' },
      { label: 'Pilotage', value: 'App NEXORA, voix, programme horaire' },
      { label: 'Capteurs', value: 'Température, humidité, présence' },
      { label: 'Autonomie', value: 'Batterie 18 mois' },
      { label: 'Installation', value: 'Compatible supports standards' },
    ],
    tags: ['smarthome', 'thermostat', 'chauffage', 'économie'],
    isFeatured: false,
    isFlashDeal: false,
    colors: ['#f0f0f0', '#1a1a1a'],
  },

  // ── INFORMATIQUE SUITE ──
  {
    id: 'p014',
    name: 'NEXORA Monitor 27 QHD',
    slug: 'nexora-monitor-27-qhd',
    category: 'Informatique',
    categorySlug: 'informatique',
    shortDescription: 'Moniteur IPS 27" QHD 165Hz, 1ms, sRGB 99%',
    description: 'Boostez votre productivité et gaming avec le NEXORA Monitor 27 QHD. Dalle IPS 27" ultra-précise en résolution QHD 2560×1440, 165Hz pour une fluidité gaming, 1ms GtG et couverture sRGB 99% pour des couleurs parfaites.',
    price: 279.00,
    originalPrice: 379.00,
    discount: 26,
    rating: 4.7,
    reviews: 892,
    image: image('product-monitor.jpg'),
    gallery: [image('gallery-monitor-2.jpg'), image('gallery-monitor-3.jpg')],
    stock: 41,
    badge: 'cyber',
    badgeText: 'Cyber Week',
    specifications: [
      { label: 'Taille', value: '27" IPS' },
      { label: 'Résolution', value: '2560×1440 QHD' },
      { label: 'Taux de rafraîchissement', value: '165Hz' },
      { label: 'Temps de réponse', value: '1ms GtG' },
      { label: 'Couverture couleur', value: 'sRGB 99%, DCI-P3 90%' },
      { label: 'Connectiques', value: '2× HDMI 2.1, 1× DisplayPort 1.4, 4× USB' },
    ],
    tags: ['moniteur', 'écran', 'gaming', 'design'],
    isFeatured: false,
    isFlashDeal: false,
    colors: ['#1a1a1a'],
  },

  // ── LIFESTYLE ──
  {
    id: 'p015',
    name: 'NEXORA PowerBank Ultra',
    slug: 'nexora-powerbank-ultra',
    category: 'Lifestyle',
    categorySlug: 'lifestyle',
    shortDescription: 'Batterie 26800mAh, charge 140W, 5 appareils',
    description: 'Ne manquez plus jamais de batterie. Le NEXORA PowerBank Ultra 26800mAh offre une charge 140W GaN pour tous vos appareils simultanément — laptop, smartphone, écouteurs et plus — avec un design compact en aluminium brossé.',
    price: 79.90,
    originalPrice: 109.90,
    discount: 27,
    rating: 4.7,
    reviews: 4219,
    image: image('product-powerbank.jpg'),
    gallery: [image('gallery-power-2.jpg'), image('gallery-power-3.jpg')],
    stock: 118,
    badge: 'bestseller',
    badgeText: 'Best Seller',
    specifications: [
      { label: 'Capacité', value: '26800mAh' },
      { label: 'Charge', value: '140W GaN' },
      { label: 'Ports', value: '3× USB-C PD, 2× USB-A QC5' },
      { label: 'Charge simultanée', value: '5 appareils' },
      { label: 'Poids', value: '490g' },
      { label: 'Matériaux', value: 'Aluminium brossé' },
    ],
    tags: ['accessoire', 'batterie', 'charge', 'voyage'],
    isFeatured: false,
    isFlashDeal: true,
    colors: ['#2c2c2c', '#f0f0f0', '#c9a96e'],
  },
  {
    id: 'p016',
    name: 'NEXORA Wellness Ring',
    slug: 'nexora-wellness-ring',
    category: 'Lifestyle',
    categorySlug: 'lifestyle',
    shortDescription: 'Bague connectée santé, 7j autonomie, titane',
    description: 'Discret et puissant. Le NEXORA Wellness Ring en titane grade 5 surveille en permanence votre santé — fréquence cardiaque, SpO2, sommeil, stress et activité — sans écran intrusif. 7 jours d\'autonomie, résistance IP68.',
    price: 249.00,
    originalPrice: 329.00,
    discount: 24,
    rating: 4.8,
    reviews: 1087,
    image: image('product-ring.jpg'),
    gallery: [image('gallery-ring-2.jpg'), image('gallery-ring-3.jpg')],
    stock: 67,
    badge: 'new',
    badgeText: 'Nouveau',
    specifications: [
      { label: 'Matériau', value: 'Titane Grade 5' },
      { label: 'Capteurs', value: 'PPG, SpO2, température, accéléromètre' },
      { label: 'Autonomie', value: '7 jours' },
      { label: 'Charge', value: 'Sans fil, 80min charge complète' },
      { label: 'Résistance', value: 'IP68' },
      { label: 'Tailles', value: '6 à 13' },
    ],
    tags: ['lifestyle', 'santé', 'bague', 'discret'],
    isFeatured: true,
    isFlashDeal: false,
    colors: ['#2c2c2c', '#c9a96e', '#f0f0f0'],
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'cat1',
    name: 'Smartphones & Accessoires',
    slug: 'smartphones',
    description: 'Nouveautés mobiles',
    image: image('cat-smartphones.jpg'),
    productCount: 24,
    icon: '📱',
  },
  {
    id: 'cat2',
    name: 'Audio',
    slug: 'audio',
    description: 'Son haute fidélité pour tous',
    image: image('cat-audio.jpg'),
    productCount: 31,
    icon: '🎧',
  },
  {
    id: 'cat3',
    name: 'Gaming',
    slug: 'gaming',
    description: 'Équipement pro pour gamers exigeants',
    image: image('cat-gaming.jpg'),
    productCount: 18,
    icon: '🎮',
  },
  {
    id: 'cat4',
    name: 'Informatique',
    slug: 'informatique',
    description: 'Laptops, moniteurs, périphériques',
    image: image('cat-informatique.jpg'),
    productCount: 22,
    icon: '💻',
  },
  {
    id: 'cat5',
    name: 'Maison Connectée',
    slug: 'maison-connectee',
    description: 'Domotique et smart home',
    image: image('cat-maison.jpg'),
    productCount: 15,
    icon: '🏠',
  },
  {
    id: 'cat6',
    name: 'Lifestyle & Cadeaux',
    slug: 'lifestyle',
    description: 'Idées cadeaux high-tech',
    image: image('cat-lifestyle.jpg'),
    productCount: 27,
    icon: '🎁',
  },
];

export const GIFT_GUIDES = [
  { id: 'g1', label: 'Pour lui', icon: '👨', slug: 'pour-lui', image: image('gift-him.jpg') },
  { id: 'g2', label: 'Pour elle', icon: '👩', slug: 'pour-elle', image: image('gift-her.jpg') },
  { id: 'g3', label: 'Pour les gamers', icon: '🎮', slug: 'pour-les-gamers', image: image('gift-gamers.jpg') },
  { id: 'g4', label: 'Pour les passionnés de tech', icon: '🔬', slug: 'pour-tech', image: image('gift-tech.jpg') },
  { id: 'g5', label: 'Pour la maison', icon: '🏡', slug: 'pour-maison', image: image('gift-home.jpg') },
];

export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Maxime D.',
    avatar: 'M',
    avatarColor: '#7c5cfc',
    rating: 5,
    comment: 'Les écouteurs NEXORA AirPods Pro X sont absolument incroyables. La réduction de bruit est bluffante, le son est cristallin et l\'autonomie dépasse mes attentes. Je recommande chaudement !',
    product: 'NEXORA AirPods Pro X',
    date: 'Il y a 3 jours',
  },
  {
    id: 't2',
    name: 'Sophie L.',
    avatar: 'S',
    avatarColor: '#00d4ff',
    rating: 5,
    comment: 'Ma smartwatch NEXORA Vision est parfaite. Elle suit mon sommeil avec précision, le GPS est très fiable pour mes runs et le design est élégant. Ravie de mon achat !',
    product: 'NEXORA Vision Smartwatch',
    date: 'Il y a 1 semaine',
  },
  {
    id: 't3',
    name: 'Thomas B.',
    avatar: 'T',
    avatarColor: '#22c55e',
    rating: 5,
    comment: 'L\'UltraBook 14 est un monstre de performance dans un format ultra-compact. 18h d\'autonomie réelles, l\'écran OLED est magnifique. Mon meilleur investissement tech.',
    product: 'NEXORA UltraBook 14',
    date: 'Il y a 2 semaines',
  },
  {
    id: 't4',
    name: 'Camille R.',
    avatar: 'C',
    avatarColor: '#f59e0b',
    rating: 4,
    comment: 'Le SmartHub 4K a révolutionné ma maison connectée. Installation super simple, compatible avec tout. L\'appli NEXORA est intuitive et réactive.',
    product: 'NEXORA SmartHub 4K',
    date: 'Il y a 1 mois',
  },
  {
    id: 't5',
    name: 'Lucas M.',
    avatar: 'L',
    avatarColor: '#ff6b35',
    rating: 5,
    comment: 'La souris ProMouse X est exceptionnelle. 60h de batterie, capteur ultra-précis, légère comme une plume. Passage au niveau supérieur pour mes sessions FPS compétitives.',
    product: 'NEXORA ProMouse X',
    date: 'Il y a 5 jours',
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return PRODUCTS.filter(p => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter(p => p.isFeatured);
}

export function getFlashDeals(): Product[] {
  return PRODUCTS.filter(p => p.isFlashDeal);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS
    .filter(p => p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, limit);
}

/**
 * Meta description d'une fiche produit, bornée à `max` caractères (Google
 * tronque au-delà de ~160). On part du raccourci produit, puis on complète avec
 * la description, en coupant sur une frontière de mot.
 */
export function productSeoDescription(product: Product, max = 155): string {
  const full = `${product.shortDescription}. ${product.description}`
    .replace(/\s+/g, ' ')
    .trim();
  if (full.length <= max) return full;
  const cut = full.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  const kept = space > max * 0.6 ? cut.slice(0, space) : cut;
  return `${kept.replace(/[ ,;:.]+$/, '')}…`;
}
