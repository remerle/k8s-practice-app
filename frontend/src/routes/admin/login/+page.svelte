<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { initFirebase } from '$lib/firebase';
  import { signInWithGoogle, user, initAuthListener } from '$lib/stores/auth';

  const parentData = $derived($page.data);

  $effect(() => {
    if (browser && parentData.firebase) {
      initFirebase(parentData.firebase);
      initAuthListener();
    }
  });

  $effect(() => {
    if ($user) {
      goto('/admin');
    }
  });

  let error = $state('');

  async function handleLogin() {
    try {
      error = '';
      await signInWithGoogle();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Login failed';
    }
  }
</script>

<div class="flex justify-center pt-16">
  <div class="card bg-base-100 shadow-sm border border-base-300 max-w-sm w-full">
    <div class="card-body text-center">
      <h1 class="card-title justify-center text-2xl">Admin Login</h1>
      <p class="text-base-content/60 mb-4">Sign in with your Google account to manage products.</p>
      {#if error}
        <div role="alert" class="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      {/if}
      <button class="btn btn-primary w-full" onclick={handleLogin}>Sign in with Google</button>
    </div>
  </div>
</div>
