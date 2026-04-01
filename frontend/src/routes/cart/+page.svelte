<script lang="ts">
  import CartItemComponent from '$lib/components/CartItem.svelte';
  import { cart, cartTotal, cartCount } from '$lib/stores/cart';
</script>

<svelte:head>
  <title>Cart - K8s Shop</title>
</svelte:head>

<h1>Shopping Cart</h1>

{#if $cartCount === 0}
  <div class="empty">
    <p>Your cart is empty.</p>
    <a href="/" class="btn-primary browse-btn"> Browse Products </a>
  </div>
{:else}
  <div class="cart-items">
    {#each $cart as item (item.productId)}
      <CartItemComponent {item} />
    {/each}
  </div>

  <div class="cart-footer">
    <button class="btn-secondary" onclick={() => cart.clear()}>Clear Cart</button>
    <div class="cart-total">
      <span>Total ({$cartCount} items):</span>
      <strong>${$cartTotal.toFixed(2)}</strong>
    </div>
  </div>
{/if}

<style>
  h1 {
    margin-bottom: 1.5rem;
  }

  .empty {
    text-align: center;
    padding: 3rem;
    color: var(--color-text-muted);
  }

  .empty p {
    margin-bottom: 1.5rem;
    font-size: 1.125rem;
  }

  .browse-btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    text-decoration: none;
  }

  .cart-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .cart-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
  }

  .cart-total {
    font-size: 1.25rem;
  }

  .cart-total strong {
    color: var(--color-primary);
    margin-left: 0.5rem;
    font-size: 1.5rem;
  }
</style>
