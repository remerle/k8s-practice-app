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

<div class="card bg-base-100 shadow-md">
  <div class="card-body p-0">
    <div class="flex justify-between items-center px-6 pt-5 pb-4">
      <div class="flex items-center gap-3">
        <h2 class="card-title text-xl">Products</h2>
        {#if !loading}
          <span class="badge badge-neutral">{products.length} total</span>
        {/if}
      </div>
      <a href="/admin/new" class="btn btn-primary btn-sm gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-4 h-4"
          ><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg
        >
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
                  <a href="/admin/edit/{product.id}">
                    {#if product.image_location}
                      <div class="avatar">
                        <div class="w-12 h-12 rounded">
                          <img src="/images/{product.image_location}" alt={product.name} />
                        </div>
                      </div>
                    {:else}
                      <span class="text-base-content/40">--</span>
                    {/if}
                  </a>
                </td>
                <td class="font-medium">
                  <a href="/admin/edit/{product.id}" class="link link-hover">{product.name}</a>
                </td>
                <td><code class="badge badge-ghost font-mono text-xs">{product.sku}</code></td>
                <td class="font-medium">{formatPrice(product.price)}</td>
                <td class="whitespace-nowrap">
                  <a
                    href="/admin/edit/{product.id}"
                    class="btn btn-ghost btn-sm btn-square"
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-4 h-4"
                      ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      /></svg
                    >
                  </a>
                  <button
                    class="btn btn-ghost btn-sm btn-square text-error"
                    title="Delete"
                    onclick={() => openDeleteModal(product)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-4 h-4"
                      ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      /></svg
                    >
                  </button>
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
      Are you sure you want to delete <strong>{deleteTarget?.name ?? ''}</strong>? This cannot be
      undone.
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
