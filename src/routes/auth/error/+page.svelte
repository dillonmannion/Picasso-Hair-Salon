<script lang="ts">
  // Page doesn't need any props
</script>

<div class="error-container">
  <h1>Authentication Error</h1>
  <p>There was an error with the authentication process.</p>
  <a href="/auth/login">Back to login</a>
</div>

<style>
  .error-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    text-align: center;
  }

  a {
    color: #007bff;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
