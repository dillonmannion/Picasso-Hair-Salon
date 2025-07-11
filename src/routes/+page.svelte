<script lang="ts">
  import type { PageData } from './$types';
  import Button from '$lib/components/Button.svelte';

  let { data } = $props<{ data: PageData }>();
</script>

<div class="container">
  <h1 class="text-4xl font-bold text-blue-600">Welcome to Picasso Hair Salon</h1>

  {#if data.user}
    <p>Hello, {data.user.email}!</p>
    <div class="actions">
      <Button>
        <a href="/protected">Go to Protected Page</a>
      </Button>
      <form method="POST" action="/auth/logout" style="display: inline;">
        <Button variant="outline" type="submit">Logout</Button>
      </form>
    </div>
  {:else}
    <p>Please log in to access all features.</p>
    <div class="actions">
      <Button>
        <a href="/auth/login">Login / Sign Up</a>
      </Button>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    text-align: center;
  }

  .actions {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
</style>
