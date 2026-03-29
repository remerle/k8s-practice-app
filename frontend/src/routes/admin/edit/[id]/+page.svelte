<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fetchProduct, updateProduct } from '$lib/api';
  import { getIdToken } from '$lib/stores/auth';

  const apiUrl = $derived($page.data.apiUrl);
  const productId = $derived(parseInt($page.params.id, 10));

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
      const product = await fetchProduct(apiUrl, productId);
      name = product.name;
      sku = product.sku;
      price = product.price;
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
      await updateProduct(apiUrl, token, productId, formData);
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

<a href="/admin" class="back-link">← Back to products</a>

{#if loading}
  <p>Loading product...</p>
{:else}
  <div class="form-card">
    <h2>Edit Product</h2>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <form onsubmit={handleSubmit}>
      <div class="field">
        <label for="name">Name</label>
        <input id="name" type="text" bind:value={name} required />
      </div>
      <div class="field">
        <label for="sku">SKU</label>
        <input id="sku" type="text" bind:value={sku} required />
      </div>
      <div class="field">
        <label for="price">Price</label>
        <input id="price" type="number" step="0.01" min="0" bind:value={price} required />
      </div>
      <div class="field">
        <label for="description">Description</label>
        <textarea id="description" rows="4" bind:value={description}></textarea>
      </div>
      <div class="field">
        <label for="image">Image</label>
        {#if currentImage}
          <div class="current-image">
            <img src="{apiUrl}/images/{currentImage}" alt="Current" />
            <span>Current image</span>
          </div>
        {/if}
        <input id="image" type="file" accept="image/*" onchange={handleFileChange} />
        {#if currentImage}
          <p class="hint">Upload a new file to replace the current image.</p>
        {/if}
      </div>
      <div class="form-actions">
        <a href="/admin" class="btn-secondary" style="text-decoration:none">Cancel</a>
        <button type="submit" class="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Update Product'}
        </button>
      </div>
    </form>
  </div>
{/if}

<style>
  .back-link {
    display: inline-block;
    margin-bottom: 1.5rem;
    color: var(--color-text-muted);
  }

  .form-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 2rem;
    max-width: 600px;
  }

  .form-card h2 {
    margin-bottom: 1.5rem;
  }

  .field {
    margin-bottom: 1rem;
  }

  .field label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
  }

  .current-image {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .current-image img {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid var(--color-border);
  }

  .current-image span {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .hint {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  .error {
    color: var(--color-danger);
    margin-bottom: 1rem;
  }
</style>
