<script lang="ts">
  import { formatPrice } from '$lib/api';
  import { cart } from '$lib/stores/cart';
  import { showToast } from '$lib/stores/toast';

  let { data } = $props();
  const product = $derived(data.product);

  function addToCart() {
    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageLocation: product.image_location,
    });
    showToast(`${product.name} added to cart`);
  }
</script>

<svelte:head>
  <title>{product.name} - Ye Olde Shoppe</title>
</svelte:head>

<a href="/" class="btn btn-ghost btn-sm mb-6">&larr; Back to products</a>

<div class="grid grid-cols-1 md:grid-cols-2 gap-0 bg-base-100 shadow rounded-2xl shadow-sm overflow-hidden max-w-4xl">
  <figure class="aspect-square bg-base-300">
    {#if product.image_location}
      <img src="/images/{product.image_location}" alt={product.name} class="w-full h-full object-cover" />
    {:else}
      <div class="w-full h-full flex items-center justify-center text-base-content/40 text-lg">No Image</div>
    {/if}
  </figure>
  <div class="p-8 flex flex-col gap-4">
    <div>
      <h1 class="text-2xl font-bold">{product.name}</h1>
      <p class="text-sm text-base-content/50 mt-1">SKU: {product.sku}</p>
    </div>
    <p class="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
    {#if product.description}
      <p class="text-base-content/80 leading-relaxed">{product.description}</p>
    {/if}
    <div class="mt-auto pt-4">
      <button class="btn btn-primary btn-lg" onclick={addToCart}>
        Add to Cart
      </button>
    </div>
  </div>
</div>
