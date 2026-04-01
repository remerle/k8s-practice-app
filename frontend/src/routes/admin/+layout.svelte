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
  <p class="text-center py-8">Loading...</p>
{:else if $user}
  <div class="flex justify-between items-center mb-6 pb-4 border-b border-base-300">
    <h1 class="text-3xl font-bold">Admin</h1>
    <div class="flex items-center gap-4">
      <span class="text-sm text-base-content/60">{$user.email}</span>
      <button class="btn btn-outline btn-sm" onclick={handleLogout}>Sign Out</button>
    </div>
  </div>
  {@render children()}
{/if}
