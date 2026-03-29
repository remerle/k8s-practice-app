<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { initFirebase } from '$lib/firebase';
  import { user, authLoading, initAuthListener, logout } from '$lib/stores/auth';

  let { children } = $props();

  const parentData = $derived($page.data);

  $effect(() => {
    if (browser && parentData.firebase) {
      initFirebase(parentData.firebase);
      initAuthListener();
    }
  });

  $effect(() => {
    if (browser && !$authLoading && !$user && !$page.url.pathname.endsWith('/login')) {
      goto('/admin/login');
    }
  });

  async function handleLogout() {
    await logout();
    goto('/admin/login');
  }
</script>

{#if $page.url.pathname.endsWith('/login')}
  {@render children()}
{:else if $authLoading}
  <p>Loading...</p>
{:else if $user}
  <div class="admin-header">
    <h1>Admin</h1>
    <div class="admin-user">
      <span>{$user.email}</span>
      <button class="btn-secondary" onclick={handleLogout}>Sign Out</button>
    </div>
  </div>
  {@render children()}
{/if}

<style>
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .admin-user {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--color-text-muted);
  }
</style>
