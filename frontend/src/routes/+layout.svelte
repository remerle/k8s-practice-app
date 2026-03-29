<script lang="ts">
  import '../app.css';
  import { cartCount } from '$lib/stores/cart';

  let { children } = $props();
</script>

<nav>
  <div class="container nav-inner">
    <a href="/" class="logo">K8s Shop</a>
    <div class="nav-links">
      <a href="/">Products</a>
      <a href="/cart">Cart ({$cartCount})</a>
      <a href="/admin">Admin</a>
    </div>
  </div>
</nav>

<main class="container">
  {@render children()}
</main>

<style>
  nav {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 0;
    margin-bottom: 2rem;
  }

  .nav-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
  }

  .nav-links {
    display: flex;
    gap: 1.5rem;
  }

  main {
    padding-bottom: 2rem;
  }
</style>
