import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
} from 'react';
import type { Product } from '../data/products';
import { clearLocalData, loadFromStorage, saveToStorage } from '../utils/storage';

// ─── Types ───────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zip: string;
}

export interface Order {
  number: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  customer: CustomerInfo;
}

export interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  promo: string | null;
  order: Order | null;
  isSearchOpen: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

export type Action =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity?: number; color?: string } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QTY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'TOGGLE_WISHLIST'; payload: string }
  | { type: 'SET_PROMO'; payload: string | null }
  | { type: 'PLACE_ORDER'; payload: Order }
  | { type: 'OPEN_SEARCH' }
  | { type: 'CLOSE_SEARCH' }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'HIDE_TOAST' };

// ─── Promo codes (données de démonstration) ──────────────────
export const PROMO_CODES: Record<string, { percent: number; label: string }> = {
  NEXORA10: { percent: 10, label: '-10% sur le sous-total' },
  CYBERWEEK15: { percent: 15, label: '-15% sur le sous-total' },
};

export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FLAT_RATE = 4.9;

// ─── État initial (restauré depuis le stockage local) ────────
/**
 * localStorage peut contenir une valeur corrompu ou héritée d'une version
 * antérieure du prototype : on valide le type de chaque clé avant usage.
 * Sans cette vérification, un panier qui n'est pas un tableau ferait planter
 * le rendu au montage (page blanche).
 */
function loadList<T>(key: string, isItem: (value: unknown) => boolean): T[] {
  const value = loadFromStorage<unknown>(key, []);
  return Array.isArray(value) ? (value.filter(isItem) as T[]) : [];
}

function loadCart(): CartItem[] {
  return loadList<CartItem>('nexora_cart', (item) => {
    const candidate = item as Partial<CartItem> | null | undefined;
    return (
      typeof candidate?.product?.id === 'string' && typeof candidate.quantity === 'number'
    );
  });
}

function loadWishlist(): string[] {
  return loadList<string>('nexora_wishlist', (id) => typeof id === 'string');
}

function loadPromo(): string | null {
  const value = loadFromStorage<unknown>('nexora_promo', null);
  return typeof value === 'string' ? value : null;
}

function loadOrder(): Order | null {
  const value = loadFromStorage<unknown>('nexora_order', null);
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Order)
    : null;
}

const initialState: StoreState = {
  cart: loadCart(),
  wishlist: loadWishlist(),
  promo: loadPromo(),
  order: loadOrder(),
  isSearchOpen: false,
  toast: null,
};

// ─── Reducer ─────────────────────────────────────────────────
function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity = 1, color } = action.payload;
      const existing = state.cart.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, 10), selectedColor: color ?? item.selectedColor }
              : item,
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { product, quantity: Math.min(quantity, 10), selectedColor: color }],
      };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((item) => item.product.id !== action.payload) };
    case 'UPDATE_QTY':
      return {
        ...state,
        cart:
          action.payload.quantity <= 0
            ? state.cart.filter((item) => item.product.id !== action.payload.id)
            : state.cart.map((item) =>
                item.product.id === action.payload.id
                  ? { ...item, quantity: Math.min(action.payload.quantity, 10) }
                  : item,
              ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [], promo: null };
    case 'CLEAR_ALL_DATA':
      // Effacement complet des données locales (panier, favoris, promo, commande).
      return { ...state, cart: [], wishlist: [], promo: null, order: null };
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist.filter((id) => id !== action.payload)
          : [...state.wishlist, action.payload],
      };
    case 'SET_PROMO':
      return { ...state, promo: action.payload };
    case 'PLACE_ORDER':
      return { ...state, order: action.payload, cart: [], promo: null };
    case 'OPEN_SEARCH':
      return { ...state, isSearchOpen: true };
    case 'CLOSE_SEARCH':
      return { ...state, isSearchOpen: false };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────
interface StoreContextValue {
  state: StoreState;
  dispatch: React.Dispatch<Action>;
  cartTotal: number;
  cartCount: number;
  discount: number;
  shipping: number;
  grandTotal: number;
  addToCart: (product: Product, qty?: number, color?: string) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  placeOrder: (customer: CustomerInfo) => Order;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  /** Efface panier, favoris, code promo et commande du stockage local. */
  clearAllData: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    saveToStorage('nexora_cart', state.cart);
  }, [state.cart]);

  useEffect(() => {
    saveToStorage('nexora_wishlist', state.wishlist);
  }, [state.wishlist]);

  useEffect(() => {
    saveToStorage('nexora_promo', state.promo);
  }, [state.promo]);

  useEffect(() => {
    saveToStorage('nexora_order', state.order);
  }, [state.order]);

  useEffect(() => {
    if (!state.toast) return;
    const timer = window.setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3200);
    return () => window.clearTimeout(timer);
  }, [state.toast]);

  const cartTotal = state.cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const discount = useMemo(() => {
    if (!state.promo) return 0;
    const rule = PROMO_CODES[state.promo];
    return rule ? Math.round(cartTotal * rule.percent) / 100 : 0;
  }, [cartTotal, state.promo]);

  const shipping =
    cartTotal === 0 || cartTotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;

  const grandTotal = Math.max(cartTotal - discount + shipping, 0);

  const addToCart = useCallback(
    (product: Product, qty = 1, color?: string) => {
      dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: qty, color } });
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: `${product.name} ajouté au panier`, type: 'success' },
      });
    },
    [],
  );

  const removeFromCart = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    dispatch({ type: 'SHOW_TOAST', payload: { message: 'Produit retiré du panier', type: 'info' } });
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id, quantity: qty } });
  }, []);

  const toggleWishlist = useCallback(
    (id: string) => {
      const isIn = state.wishlist.includes(id);
      dispatch({ type: 'TOGGLE_WISHLIST', payload: id });
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: isIn ? 'Retiré des favoris' : 'Ajouté aux favoris',
          type: 'info',
        },
      });
    },
    [state.wishlist],
  );

  const isWishlisted = useCallback(
    (id: string) => state.wishlist.includes(id),
    [state.wishlist],
  );

  const applyPromo = useCallback(
    (code: string) => {
      const key = code.trim().toUpperCase();
      if (PROMO_CODES[key]) {
        dispatch({ type: 'SET_PROMO', payload: key });
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: `Code appliqué : ${PROMO_CODES[key].label}`, type: 'success' },
        });
        return true;
      }
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: 'Code promo invalide ou expiré', type: 'error' },
      });
      return false;
    },
    [],
  );

  const removePromo = useCallback(() => {
    dispatch({ type: 'SET_PROMO', payload: null });
  }, []);

  const placeOrder = useCallback(
    (customer: CustomerInfo): Order => {
      const order: Order = {
        number: `NX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`,
        date: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        items: state.cart,
        subtotal: cartTotal,
        shipping,
        discount,
        total: grandTotal,
        customer,
      };
      dispatch({ type: 'PLACE_ORDER', payload: order });
      return order;
    },
    [state.cart, cartTotal, shipping, discount, grandTotal],
  );

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    },
    [],
  );

  const clearAllData = useCallback(() => {
    clearLocalData();
    dispatch({ type: 'CLEAR_ALL_DATA' });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      cartTotal,
      cartCount,
      discount,
      shipping,
      grandTotal,
      addToCart,
      removeFromCart,
      updateQty,
      toggleWishlist,
      isWishlisted,
      applyPromo,
      removePromo,
      placeOrder,
      showToast,
      clearAllData,
    }),
    [
      state,
      cartTotal,
      cartCount,
      discount,
      shipping,
      grandTotal,
      addToCart,
      removeFromCart,
      updateQty,
      toggleWishlist,
      isWishlisted,
      applyPromo,
      removePromo,
      placeOrder,
      showToast,
      clearAllData,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
