<script lang="ts">
  import '../app.css';
  import { cartCount } from '$lib/stores/cart';

  let { children } = $props();
</script>

<div class="navbar bg-base-100 border-b border-base-300 mb-8 px-4">
  <div class="flex-1">
    <a href="/" class="btn btn-ghost text-xl font-bold">K8s Shop</a>
  </div>
  <div class="flex gap-2">
    <a href="/" class="btn btn-ghost btn-sm">Products</a>
    <a href="/cart" class="btn btn-ghost btn-sm">Cart ({$cartCount})</a>
    <a href="/admin" class="btn btn-ghost btn-sm">Admin</a>
  </div>
</div>

<main class="max-w-7xl mx-auto px-4 pb-8">
  {@render children()}
</main>
