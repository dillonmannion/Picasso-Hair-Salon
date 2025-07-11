<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { ButtonPropsSchema, type ButtonProps } from '$lib/schemas';

  type Props = Partial<ButtonProps> & HTMLButtonAttributes;

  let {
    variant = 'primary',
    size = 'default',
    disabled = false,
    onclick,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const validateProps = () => {
    if (!import.meta.env.DEV) return;
    
    const result = ButtonPropsSchema.safeParse({
      variant,
      size,
      disabled,
      onclick,
      class: className,
    });
    
    if (!result.success) {
      console.warn('Button props validation failed:', result.error);
    }
  };

  validateProps();

  const variantStyles: Record<NonNullable<typeof variant>, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  const sizeStyles: Record<NonNullable<typeof size>, string> = {
    small: 'h-8 px-3 text-xs',
    default: 'h-10 px-4 py-2',
    large: 'h-12 px-8',
  };

  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const buttonClasses = $derived(
    [baseStyles, variantStyles[variant], sizeStyles[size], className]
      .filter(Boolean)
      .join(' ')
  );
</script>

<button class={buttonClasses} {disabled} {onclick} {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</button>
