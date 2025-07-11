<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import type { ButtonProps } from '$lib/schemas';

  let { buttonProps = {} }: { buttonProps?: Partial<ButtonProps> } = $props();

  // Ensure required props have values
  const mergedProps: ButtonProps = {
    variant: 'primary',
    size: 'default',
    ...buttonProps,
  };
</script>

<Button {...mergedProps}>Click me!</Button>
