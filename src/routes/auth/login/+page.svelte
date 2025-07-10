<script lang="ts">
  import type { PageData } from './$types';
  import { supabase } from '$lib/supabase';

  let { data } = $props<{ data: PageData }>();

  let loading = $state(false);
  let clientError = $state<string | null>(null);

  async function handleGoogleLogin() {
    loading = true;
    clientError = null;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      // Redirect will happen automatically
    } catch (err) {
      clientError = err instanceof Error ? err.message : 'OAuth configuration error';
      loading = false;
    }
  }
</script>

<div class="auth-container">
  <h1>Sign in to Picasso Hair Salon</h1>

  {#if data?.error}
    <div class="error-message">
      {data.error}
    </div>
  {/if}

  {#if clientError}
    <div class="error-message">
      {clientError}
    </div>
  {/if}

  <button onclick={handleGoogleLogin} disabled={loading} class="google-signin-button">
    {#if loading}
      Signing in...
    {:else}
      Sign in with Google
    {/if}
  </button>
</div>

<style>
  .auth-container {
    max-width: 400px;
    margin: 4rem auto;
    padding: 2rem;
    text-align: center;
  }

  h1 {
    margin-bottom: 2rem;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .google-signin-button {
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .google-signin-button:hover:not(:disabled) {
    background-color: #357ae8;
  }

  .google-signin-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    background-color: #fee;
    color: #c33;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
</style>
