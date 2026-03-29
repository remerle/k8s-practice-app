import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageLocation: string | null;
  quantity: number;
}

const STORAGE_KEY = 'k8s-shop-cart';

function loadCart(): CartItem[] {
  if (!browser) return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function createCart() {
  const { subscribe, set, update } = writable<CartItem[]>(loadCart());

  if (browser) {
    subscribe((items) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    });
  }

  return {
    subscribe,
    addItem(product: Omit<CartItem, 'quantity'>) {
      update((items) => {
        const existing = items.find((i) => i.productId === product.productId);
        if (existing) {
          return items.map((i) =>
            i.productId === product.productId ? { ...i, quantity: i.quantity + 1 } : i,
          );
        }
        return [...items, { ...product, quantity: 1 }];
      });
    },
    removeItem(productId: number) {
      update((items) => items.filter((i) => i.productId !== productId));
    },
    updateQuantity(productId: number, quantity: number) {
      if (quantity <= 0) {
        update((items) => items.filter((i) => i.productId !== productId));
        return;
      }
      update((items) => items.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
    },
    clear() {
      set([]);
    },
  };
}

export const cart = createCart();

export const cartTotal = derived(cart, ($cart) =>
  $cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

export const cartCount = derived(cart, ($cart) =>
  $cart.reduce((sum, item) => sum + item.quantity, 0),
);
