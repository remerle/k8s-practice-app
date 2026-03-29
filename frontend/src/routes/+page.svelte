<script lang="ts">
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { page } from '$app/stores';

  let { data } = $props();
</script>

<svelte:head>
  <title>K8s Shop</title>
</svelte:head>

<h1>Products</h1>

{#if data.products.length === 0}
  <p class="empty">No products yet. Check back soon!</p>
{:else}
  <div class="grid">
    {#each data.products as product (product.id)}
      <ProductCard {product} apiUrl={$page.data.apiUrl} />
    {/each}
  </div>
{/if}

<style>
  h1 {
    margin-bottom: 1.5rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .empty {
    color: var(--color-text-muted);
    text-align: center;
    padding: 3rem;
  }
</style>
