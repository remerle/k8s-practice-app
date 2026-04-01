<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchProducts, deleteProduct, formatPrice, type Product } from '$lib/api';
  import { getIdToken } from '$lib/stores/auth';

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
      products = await fetchProducts();
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
      await deleteProduct(token, product.id);
      products = products.filter((p) => p.id !== product.id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete product';
    }
  }
</script>

{#if error}
  <div role="alert" class="alert alert-error mb-4">
    <span>{error}</span>
  </div>
{/if}

<div class="card bg-base-200 shadow-sm">
  <div class="card-body p-0">
    <div class="flex justify-between items-center px-6 pt-5 pb-4">
      <h2 class="card-title text-xl">Products</h2>
      <a href="/admin/new" class="btn btn-primary btn-sm">Add Product</a>
    </div>

    {#if loading}
      <p class="text-center py-12">Loading products...</p>
    {:else if products.length === 0}
      <p class="text-center text-base-content/60 py-12">No products yet. Add your first product!</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th class="w-20">Image</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each products as product (product.id)}
              <tr class="hover">
                <td>
                  {#if product.image_location}
                    <div class="avatar">
                      <div class="w-12 h-12 rounded">
                        <img src="/images/{product.image_location}" alt={product.name} />
                      </div>
                    </div>
                  {:else}
                    <span class="text-base-content/40">--</span>
                  {/if}
                </td>
                <td class="font-medium">{product.name}</td>
                <td><code class="badge badge-ghost font-mono text-xs">{product.sku}</code></td>
                <td class="font-medium">{formatPrice(product.price)}</td>
                <td>
                  <a href="/admin/edit/{product.id}" class="btn btn-outline btn-sm mr-2">Edit</a>
                  <button class="btn btn-error btn-sm" onclick={() => handleDelete(product)}>Delete</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
