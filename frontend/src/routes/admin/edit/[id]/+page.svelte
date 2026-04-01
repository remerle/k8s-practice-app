<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fetchProduct, updateProduct } from '$lib/api';
  import { getIdToken } from '$lib/stores/auth';
  import { showToast } from '$lib/stores/toast';

  const productId = $derived(parseInt($page.params.id ?? '', 10));

  let name = $state('');
  let sku = $state('');
  let price = $state('');
  let description = $state('');
  let currentImage = $state<string | null>(null);
  let imageFile = $state<File | null>(null);
  let error = $state('');
  let saving = $state(false);
  let loading = $state(true);

  onMount(async () => {
    try {
      const product = await fetchProduct('', productId);
      name = product.name;
      sku = product.sku;
      price = String(product.price);
      description = product.description ?? '';
      currentImage = product.image_location;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load product';
    } finally {
      loading = false;
    }
  });

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    imageFile = input.files?.[0] ?? null;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    try {
      saving = true;
      error = '';
      const token = await getIdToken();
      const formData = new FormData();
      formData.append('name', name);
      formData.append('sku', sku);
      formData.append('price', price);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }
      await updateProduct(token, productId, formData);
      showToast('Product updated');
      goto('/admin');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update product';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Edit Product - Admin</title>
</svelte:head>

<a href="/admin" class="btn btn-ghost btn-sm mb-6">&larr; Back to products</a>

{#if loading}
  <p class="text-center py-8">Loading product...</p>
{:else}
  <div class="card bg-base-100 shadow-md max-w-2xl">
    <div class="card-body">
      <h2 class="card-title text-xl mb-2">Edit Product</h2>
      <p class="text-sm text-base-content/50 mb-4">Update product details below.</p>

      {#if error}
        <div role="alert" class="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      {/if}

      <form onsubmit={handleSubmit} class="space-y-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Name</legend>
          <input type="text" class="input w-full" bind:value={name} required />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">SKU</legend>
          <input type="text" class="input w-full" bind:value={sku} required />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Price</legend>
          <input type="number" step="0.01" min="0" class="input w-full" bind:value={price} required />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Description</legend>
          <textarea class="textarea w-full" rows="4" bind:value={description}></textarea>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Image</legend>
          {#if currentImage}
            <div class="flex items-center gap-3 mb-2">
              <div class="avatar">
                <div class="w-16 h-16 rounded">
                  <img src="/images/{currentImage}" alt="Current" />
                </div>
              </div>
              <span class="text-sm text-base-content/60">Current image</span>
            </div>
          {/if}
          <input type="file" accept="image/*" class="file-input file-input-bordered w-full" onchange={handleFileChange} />
          {#if currentImage}
            <p class="text-xs text-base-content/50 mt-1">Upload a new file to replace the current image.</p>
          {/if}
        </fieldset>
        <div class="flex justify-end gap-2 pt-2">
          <a href="/admin" class="btn btn-ghost">Cancel</a>
          <button type="submit" class="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
