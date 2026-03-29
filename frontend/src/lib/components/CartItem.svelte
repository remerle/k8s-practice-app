<script lang="ts">
  import type { CartItem } from '$lib/stores/cart';
  import { cart } from '$lib/stores/cart';
  import { page } from '$app/stores';

  let { item }: { item: CartItem } = $props();
  const apiUrl = $derived($page.data.apiUrl);

  function handleQuantityChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value, 10);
    cart.updateQuantity(item.productId, value);
  }
</script>

<div class="cart-item">
  <div class="item-image">
    {#if item.imageLocation}
      <img src="{apiUrl}/images/{item.imageLocation}" alt={item.name} />
    {:else}
      <div class="placeholder">No Image</div>
    {/if}
  </div>
  <div class="item-details">
    <h3>{item.name}</h3>
    <p class="item-price">${item.price.toFixed(2)}</p>
  </div>
  <div class="item-controls">
    <input
      type="number"
      min="1"
      value={item.quantity}
      onchange={handleQuantityChange}
    />
    <button class="btn-danger" onclick={() => cart.removeItem(item.productId)}>
      Remove
    </button>
  </div>
  <div class="item-subtotal">
    ${(item.price * item.quantity).toFixed(2)}
  </div>
</div>

<style>
  .cart-item {
    display: grid;
    grid-template-columns: 80px 1fr auto auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
  }

  .item-image {
    width: 80px;
    height: 80px;
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--color-bg);
  }

  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .item-details h3 {
    font-size: 1rem;
  }

  .item-price {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .item-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .item-controls input {
    width: 60px;
    text-align: center;
  }

  .item-subtotal {
    font-weight: 600;
    font-size: 1.125rem;
    min-width: 80px;
    text-align: right;
  }
</style>
