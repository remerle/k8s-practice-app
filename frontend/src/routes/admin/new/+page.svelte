<script lang="ts">
  import { goto } from '$app/navigation';
  import { createProduct } from '$lib/api';
  import { getIdToken } from '$lib/stores/auth';
  import { showToast } from '$lib/stores/toast';

  let name = $state('');
  let sku = $state('');
  let price = $state('');
  let description = $state('');
  let imageFile = $state<File | null>(null);
  let error = $state('');
  let saving = $state(false);

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
      await createProduct(token, formData);
      showToast('Product created');
      goto('/admin');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create product';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>New Product - Admin</title>
</svelte:head>

<a href="/admin" class="btn btn-ghost btn-sm mb-6">&larr; Back to products</a>

<div class="card bg-base-100 shadow-md max-w-2xl">
  <div class="card-body">
    <h2 class="card-title text-xl mb-2">New Product</h2>
    <p class="text-sm text-base-content/50 mb-4">Fill in the details to add a new product.</p>

    {#if error}
      <div role="alert" class="alert alert-error mb-4">
        <span>{error}</span>
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-4">
      <label class="input w-full">
        <span class="label">Name</span>
        <input type="text" bind:value={name} required />
      </label>
      <label class="input w-full">
        <span class="label">SKU</span>
        <input type="text" bind:value={sku} required />
      </label>
      <label class="input w-full">
        <span class="label">Price</span>
        <input type="number" step="0.01" min="0" bind:value={price} required />
      </label>
      <label class="floating-label w-full">
        <span>Description</span>
        <textarea placeholder="Description" class="textarea textarea-bordered w-full" rows="4" bind:value={description}></textarea>
      </label>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Image</legend>
        <input type="file" accept="image/*" class="file-input file-input-bordered w-full" onchange={handleFileChange} />
      </fieldset>
      <div class="flex justify-end gap-2 pt-2">
        <a href="/admin" class="btn btn-ghost">Cancel</a>
        <button type="submit" class="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Create Product'}
        </button>
      </div>
    </form>
  </div>
</div>
