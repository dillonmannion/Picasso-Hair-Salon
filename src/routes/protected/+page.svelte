<script lang="ts">
  import type { PageData } from './$types';
  
  let { data } = $props<{ data: PageData }>();
</script>

<div class="container">
  <h1>Protected Page</h1>
  <p>Welcome, {data.user?.email}!</p>
  
  <div class="user-info">
    <h2>User Information</h2>
    <pre>{JSON.stringify(data.user, null, 2)}</pre>
  </div>
  
  <form method="POST" action="/auth/logout">
    <button type="submit">Logout</button>
  </form>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
  }
  
  .user-info {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    margin: 2rem 0;
  }
  
  pre {
    overflow-x: auto;
  }
  
  button {
    padding: 0.5rem 1rem;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background: #c82333;
  }
</style>