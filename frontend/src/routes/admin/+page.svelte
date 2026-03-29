<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fetchProducts, deleteProduct, type Product } from '$lib/api';
  import { getIdToken } from '$lib/stores/auth';

  const apiUrl = $derived($page.data.apiUrl);
  let products = $state<Product[]>([]);
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    await loadProducts();
  });

  async function loadProducts() {
    try {
      loading = true;
      error = '';
      products = await fetchProducts(apiUrl);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load products';
    } finally {
      loading = false;
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"?`)) return;
    try {
      const token = await getIdToken();
      await deleteProduct(apiUrl, token, product.id);
      products = products.filter((p) => p.id !== product.id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete product';
    }
  }
</script>

<div class="admin-toolbar">
  <h2>Products</h2>
  <a href="/admin/new" class="btn-primary" style="text-decoration:none">Add Product</a>
</div>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p>Loading products...</p>
{:else if products.length === 0}
  <p class="empty">No products yet. Add your first product!</p>
{:else}
  <table>
    <thead>
      <tr>
        <th>Image</th>
        <th>Name</th>
        <th>SKU</th>
        <th>Price</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each products as product (product.id)}
        <tr>
          <td class="img-cell">
            {#if product.image_location}
              <img src="{apiUrl}/images/{product.image_location}" alt={product.name} />
            {:else}
              <span class="no-img">--</span>
            {/if}
          </td>
          <td>{product.name}</td>
          <td><code>{product.sku}</code></td>
          <td>${parseFloat(product.price).toFixed(2)}</td>
          <td class="actions">
            <a href="/admin/edit/{product.id}" class="btn-secondary" style="text-decoration:none"
              >Edit</a
            >
            <button class="btn-danger" onclick={() => handleDelete(product)}>Delete</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  .admin-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  th,
  td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }

  th {
    background: var(--color-bg);
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .img-cell img {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 4px;
  }

  .no-img {
    color: var(--color-text-muted);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .error {
    color: var(--color-danger);
    margin-bottom: 1rem;
  }

  .empty {
    color: var(--color-text-muted);
    text-align: center;
    padding: 2rem;
  }

  code {
    font-size: 0.875rem;
    background: var(--color-bg);
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
  }
</style>
