<script lang="ts">
  import type { CartItem } from '$lib/stores/cart';
  import { cart } from '$lib/stores/cart';

  let { item }: { item: CartItem } = $props();

  function handleQuantityChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value, 10);
    cart.updateQuantity(item.productId, value);
  }
</script>

<div class="flex items-center gap-4 p-4 bg-base-200 rounded-xl">
  <div class="w-20 h-20 rounded-lg overflow-hidden bg-base-300 shrink-0">
    {#if item.imageLocation}
      <img src="/images/{item.imageLocation}" alt={item.name} class="w-full h-full object-cover" />
    {:else}
      <div class="w-full h-full flex items-center justify-center text-xs text-base-content/40">No Image</div>
    {/if}
  </div>
  <div class="flex-1">
    <h3 class="font-semibold">{item.name}</h3>
    <p class="text-sm text-base-content/60">${item.price.toFixed(2)}</p>
  </div>
  <div class="flex items-center gap-2">
    <input type="number" min="1" value={item.quantity} onchange={handleQuantityChange}
      class="input input-bordered input-sm w-16 text-center" />
    <button class="btn btn-error btn-sm" onclick={() => cart.removeItem(item.productId)}>Remove</button>
  </div>
  <div class="font-bold text-lg min-w-[80px] text-right">
    ${(item.price * item.quantity).toFixed(2)}
  </div>
</div>
