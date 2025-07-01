<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { ButtonPropsSchema, type ButtonProps } from '$lib/schemas';
  
  type Props = ButtonProps & HTMLButtonAttributes;
  
  let {
    variant = 'primary',
    size = 'medium',
    disabled = false,
    onclick,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();
  
  // Validate props at runtime in development
  if (import.meta.env.DEV) {
    const validationResult = ButtonPropsSchema.safeParse({ variant, size, disabled, onclick, class: className });
    if (!validationResult.success) {
      console.warn('Button props validation failed:', validationResult.error);
    }
  }
  
  const buttonClasses = $derived(
    className ? `btn-${variant} btn-${size} ${className}` : `btn-${variant} btn-${size}`
  );
</script>

<button 
  class={buttonClasses} 
  {disabled}
  {onclick}
  {...restProps}
>
  {@render children?.()}
</button>