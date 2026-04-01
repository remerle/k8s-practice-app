<script lang="ts">
  import type { CartItem } from '$lib/stores/cart';
  import { cart } from '$lib/stores/cart';

  let { item }: { item: CartItem } = $props();

  function decrement() {
    if (item.quantity > 1) {
      cart.updateQuantity(item.productId, item.quantity - 1);
    }
  }

  function increment() {
    cart.updateQuantity(item.productId, item.quantity + 1);
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
    <p class="text-sm text-base-content/60">${item.price.toFixed(2)} each</p>
  </div>
  <div class="join">
    <button class="btn btn-sm join-item" onclick={decrement} disabled={item.quantity <= 1}>-</button>
    <span class="btn btn-sm join-item no-animation pointer-events-none tabular-nums w-12">{item.quantity}</span>
    <button class="btn btn-sm join-item" onclick={increment}>+</button>
  </div>
  <div class="font-bold text-lg min-w-[80px] text-right tabular-nums">
    ${(item.price * item.quantity).toFixed(2)}
  </div>
  <button class="btn btn-ghost btn-sm btn-square text-error" onclick={() => cart.removeItem(item.productId)} title="Remove">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  </button>
</div>
