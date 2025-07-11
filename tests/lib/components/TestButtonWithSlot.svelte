<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  
  let { props = {} } = $props();
</script>

<Button {...props}>Click me</Button>