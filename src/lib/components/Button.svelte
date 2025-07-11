<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { ButtonPropsSchema, type ButtonProps } from '$lib/schemas';

  type Props = Partial<ButtonProps> & HTMLButtonAttributes;

  let {
    variant = 'primary',
    size = 'medium',
    disabled = false,
    onclick,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  if (import.meta.env.DEV) {
    const validationResult = ButtonPropsSchema.safeParse({
      variant,
      size,
      disabled,
      onclick,
      class: className,
    });
    if (!validationResult.success) {
      console.warn('Button props validation failed:', validationResult.error);
    }
  }

  const buttonClasses = $derived(
    className ? `btn-${variant} btn-${size} ${className}` : `btn-${variant} btn-${size}`
  );
</script>

<button class={buttonClasses} {disabled} {onclick} {...restProps}>
  {@render children?.()}
</button>

<style>
  button {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background: #0056b3;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background: #545b62;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
  }

  .btn-danger:hover {
    background: #c82333;
  }

  .btn-small {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }

  .btn-medium {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  .btn-large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
