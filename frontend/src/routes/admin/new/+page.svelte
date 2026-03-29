<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { createProduct } from '$lib/api';
  import { getIdToken } from '$lib/stores/auth';

  const apiUrl = $derived($page.data.apiUrl);

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
      await createProduct(apiUrl, token, formData);
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

<a href="/admin" class="back-link">← Back to products</a>

<div class="form-card">
  <h2>New Product</h2>

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
      <input id="image" type="file" accept="image/*" onchange={handleFileChange} />
    </div>
    <div class="form-actions">
      <a href="/admin" class="btn-secondary" style="text-decoration:none">Cancel</a>
      <button type="submit" class="btn-primary" disabled={saving}>
        {saving ? 'Saving...' : 'Create Product'}
      </button>
    </div>
  </form>
</div>

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
