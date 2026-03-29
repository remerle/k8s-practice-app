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

<div class="login-page">
  <div class="login-card">
    <h1>Admin Login</h1>
    <p>Sign in with your Google account to manage products.</p>
    {#if error}
      <p class="error">{error}</p>
    {/if}
    <button class="btn-primary login-btn" onclick={handleLogin}>
      Sign in with Google
    </button>
  </div>
</div>

<style>
  .login-page {
    display: flex;
    justify-content: center;
    padding-top: 4rem;
  }

  .login-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 2rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
  }

  .login-card h1 {
    margin-bottom: 0.5rem;
  }

  .login-card p {
    color: var(--color-text-muted);
    margin-bottom: 1.5rem;
  }

  .login-btn {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
  }

  .error {
    color: var(--color-danger);
    margin-bottom: 1rem;
  }
</style>
