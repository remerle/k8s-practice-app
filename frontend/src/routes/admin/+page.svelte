<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchProducts, deleteProduct, formatPrice, type Product } from '$lib/api';
  import { getIdToken } from '$lib/stores/auth';
  import { showToast } from '$lib/stores/toast';

  let products = $state<Product[]>([]);
  let loading = $state(true);
  let error = $state('');
  let deleteTarget = $state<Product | null>(null);
  let deleting = $state(false);

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

  function openDeleteModal(product: Product) {
    deleteTarget = product;
    (document.getElementById('delete-modal') as HTMLDialogElement)?.showModal();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      deleting = true;
      const token = await getIdToken();
      await deleteProduct(token, deleteTarget.id);
      products = products.filter((p) => p.id !== deleteTarget!.id);
      showToast(`"${deleteTarget.name}" deleted`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'error');
    } finally {
      deleting = false;
      deleteTarget = null;
      (document.getElementById('delete-modal') as HTMLDialogElement)?.close();
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
      <div class="flex items-center gap-3">
        <h2 class="card-title text-xl">Products</h2>
        {#if !loading}
          <span class="badge badge-neutral">{products.length} total</span>
        {/if}
      </div>
      <a href="/admin/new" class="btn btn-primary btn-sm gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        Add Product
      </a>
    </div>

    {#if loading}
      <div class="px-6 pb-6 space-y-4">
        {#each [1, 2, 3] as _}
          <div class="flex items-center gap-4">
            <div class="skeleton w-12 h-12 rounded"></div>
            <div class="flex-1 space-y-2">
              <div class="skeleton h-4 w-1/3"></div>
              <div class="skeleton h-3 w-1/5"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if products.length === 0}
      <div class="text-center py-16 px-6">
        <p class="text-base-content/60 text-lg mb-2">No products yet</p>
        <p class="text-base-content/40 text-sm">Click "Add Product" to get started.</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th class="w-20">Image</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th class="w-28">Actions</th>
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
                  <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-square">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"></path></svg>
                    </div>
                    <ul tabindex="0" class="dropdown-content menu bg-base-300 rounded-box z-10 w-40 p-2 shadow-lg">
                      <li><a href="/admin/edit/{product.id}">Edit</a></li>
                      <li><button class="text-error" onclick={() => openDeleteModal(product)}>Delete</button></li>
                    </ul>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<dialog id="delete-modal" class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Delete Product</h3>
    <p class="py-4">
      Are you sure you want to delete <strong>{deleteTarget?.name ?? ''}</strong>? This cannot be undone.
    </p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn btn-ghost">Cancel</button>
      </form>
      <button class="btn btn-error" disabled={deleting} onclick={confirmDelete}>
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
