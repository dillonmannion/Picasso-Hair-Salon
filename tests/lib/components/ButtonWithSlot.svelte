<script lang="ts">
  import Button from '$lib/components/ButtonSchema.svelte';
  import type { ButtonProps } from '$lib/schemas';
  
  let { buttonProps = {} }: { buttonProps?: Partial<ButtonProps> } = $props();
</script>

<Button {...buttonProps}>
  Click me!
</Button>