<script lang="ts">
  import ProductCard from '$lib/components/ProductCard.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title>PractiKube</title>
</svelte:head>

<h1 class="text-3xl font-bold mb-6">Products</h1>

{#if data.products.length === 0}
  <p class="text-center text-base-content/60 py-12">No products yet. Check back soon!</p>
{:else}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {#each data.products as product (product.id)}
      <ProductCard {product} />
    {/each}
  </div>
{/if}
