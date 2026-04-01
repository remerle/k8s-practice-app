<script lang="ts">
  import { formatPrice, type Product } from '$lib/api';

  let { product }: { product: Product } = $props();
</script>

<a href="/products/{product.id}" class="card bg-base-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden">
  <figure class="aspect-[4/3] bg-base-300">
    {#if product.image_location}
      <img src="/images/{product.image_location}" alt={product.name} class="w-full h-full object-cover" />
    {:else}
      <div class="w-full h-full flex items-center justify-center text-base-content/40">No Image</div>
    {/if}
  </figure>
  <div class="card-body p-4">
    <h3 class="card-title text-base">{product.name}</h3>
    <p class="text-primary font-bold text-lg">{formatPrice(product.price)}</p>
  </div>
</a>
