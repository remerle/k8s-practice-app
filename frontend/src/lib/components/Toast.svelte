<script lang="ts">
  import { toasts } from '$lib/stores/toast';

  const alertClass: Record<string, string> = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
  };
</script>

{#if $toasts.length > 0}
  <div class="toast toast-end toast-bottom z-50">
    {#each $toasts as toast (toast.id)}
      <div class="alert {alertClass[toast.type]} shadow-lg">
        <span>{toast.message}</span>
      </div>
    {/each}
  </div>
{/if}
