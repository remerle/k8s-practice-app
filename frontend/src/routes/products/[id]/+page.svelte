<script lang="ts">
  import { page } from '$app/stores';
  import { cart } from '$lib/stores/cart';

  let { data } = $props();
  const product = $derived(data.product);
  const apiUrl = $derived($page.data.apiUrl);

  let added = $state(false);

  function addToCart() {
    cart.addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      imageLocation: product.image_location,
    });
    added = true;
    setTimeout(() => {
      added = false;
    }, 2000);
  }
</script>

<svelte:head>
  <title>{product.name} - K8s Shop</title>
</svelte:head>

<a href="/" class="back-link">← Back to products</a>

<div class="product-detail">
  <div class="product-image">
    {#if product.image_location}
      <img src="{apiUrl}/images/{product.image_location}" alt={product.name} />
    {:else}
      <div class="placeholder">No Image</div>
    {/if}
  </div>
  <div class="product-info">
    <h1>{product.name}</h1>
    <p class="sku">SKU: {product.sku}</p>
    <p class="price">${parseFloat(product.price).toFixed(2)}</p>
    {#if product.description}
      <p class="description">{product.description}</p>
    {/if}
    <button class="btn-primary add-btn" onclick={addToCart}>
      {added ? 'Added!' : 'Add to Cart'}
    </button>
  </div>
</div>

<style>
  .back-link {
    display: inline-block;
    margin-bottom: 1.5rem;
    color: var(--color-text-muted);
  }

  .product-detail {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .product-image {
    aspect-ratio: 1;
    background: var(--color-bg);
  }

  .product-image img {
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
    color: var(--color-text-muted);
  }

  .product-info {
    padding: 2rem;
  }

  .product-info h1 {
    margin-bottom: 0.5rem;
  }

  .sku {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .price {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 1rem;
  }

  .description {
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .add-btn {
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }
</style>
