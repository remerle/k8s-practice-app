import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { cart, cartTotal, cartCount } from '$lib/stores/cart';

describe('cart store', () => {
  beforeEach(() => {
    cart.clear();
  });

  it('starts empty', () => {
    expect(get(cart)).toEqual([]);
    expect(get(cartTotal)).toBe(0);
    expect(get(cartCount)).toBe(0);
  });

  it('adds an item', () => {
    cart.addItem({ productId: 1, name: 'Widget', price: 9.99, imageLocation: null });
    const items = get(cart);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ productId: 1, name: 'Widget', quantity: 1 });
  });

  it('increments quantity when adding the same item', () => {
    cart.addItem({ productId: 1, name: 'Widget', price: 9.99, imageLocation: null });
    cart.addItem({ productId: 1, name: 'Widget', price: 9.99, imageLocation: null });
    const items = get(cart);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it('removes an item', () => {
    cart.addItem({ productId: 1, name: 'Widget', price: 9.99, imageLocation: null });
    cart.addItem({ productId: 2, name: 'Gadget', price: 19.99, imageLocation: null });
    cart.removeItem(1);
    const items = get(cart);
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe(2);
  });

  it('updates quantity', () => {
    cart.addItem({ productId: 1, name: 'Widget', price: 9.99, imageLocation: null });
    cart.updateQuantity(1, 5);
    expect(get(cart)[0].quantity).toBe(5);
  });

  it('removes item when quantity set to 0', () => {
    cart.addItem({ productId: 1, name: 'Widget', price: 9.99, imageLocation: null });
    cart.updateQuantity(1, 0);
    expect(get(cart)).toHaveLength(0);
  });

  it('calculates total correctly', () => {
    cart.addItem({ productId: 1, name: 'Widget', price: 9.99, imageLocation: null });
    cart.addItem({ productId: 2, name: 'Gadget', price: 19.99, imageLocation: null });
    cart.updateQuantity(1, 2);
    // 9.99 * 2 + 19.99 * 1 = 39.97
    expect(get(cartTotal)).toBeCloseTo(39.97);
  });

  it('calculates item count correctly', () => {
    cart.addItem({ productId: 1, name: 'Widget', price: 9.99, imageLocation: null });
    cart.addItem({ productId: 2, name: 'Gadget', price: 19.99, imageLocation: null });
    cart.updateQuantity(1, 3);
    expect(get(cartCount)).toBe(4);
  });

  it('clears the cart', () => {
    cart.addItem({ productId: 1, name: 'Widget', price: 9.99, imageLocation: null });
    cart.clear();
    expect(get(cart)).toEqual([]);
  });
});
