<script lang="ts">
  import { formatPrice, type Product } from '$lib/api';

  let { product, apiUrl }: { product: Product; apiUrl: string } = $props();
</script>

<a href="/products/{product.id}" class="card">
  <div class="card-image">
    {#if product.image_location}
      <img src="{apiUrl}/images/{product.image_location}" alt={product.name} />
    {:else}
      <div class="placeholder">No Image</div>
    {/if}
  </div>
  <div class="card-body">
    <h3>{product.name}</h3>
    <p class="price">{formatPrice(product.price)}</p>
  </div>
</a>

<style>
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
    transition:
      transform 0.15s,
      box-shadow 0.15s;
    display: block;
    color: inherit;
    text-decoration: none;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-decoration: none;
  }

  .card-image {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--color-bg);
  }

  .card-image img {
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

  .card-body {
    padding: 1rem;
  }

  .card-body h3 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .price {
    color: var(--color-primary);
    font-weight: 600;
  }
</style>
