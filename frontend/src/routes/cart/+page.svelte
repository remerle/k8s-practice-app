<script lang="ts">
  import CartItemComponent from '$lib/components/CartItem.svelte';
  import { cart, cartTotal, cartCount } from '$lib/stores/cart';
</script>

<svelte:head>
  <title>Cart - K8s Shop</title>
</svelte:head>

<h1 class="text-3xl font-bold mb-6">Shopping Cart</h1>

{#if $cartCount === 0}
  <div class="text-center py-16">
    <p class="text-lg text-base-content/60 mb-6">Your cart is empty.</p>
    <a href="/" class="btn btn-primary">Browse Products</a>
  </div>
{:else}
  <div class="flex flex-col gap-3 mb-6">
    {#each $cart as item (item.productId)}
      <CartItemComponent {item} />
    {/each}
  </div>

  <div class="flex justify-between items-center p-6 bg-base-100 shadow rounded-xl">
    <button class="btn btn-outline btn-sm" onclick={() => cart.clear()}>Clear Cart</button>
    <div class="text-xl">
      <span class="text-base-content/70">Total ({$cartCount} items):</span>
      <strong class="text-primary text-2xl ml-2">${$cartTotal.toFixed(2)}</strong>
    </div>
  </div>
{/if}
