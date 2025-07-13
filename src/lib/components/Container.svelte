<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Size = 'full' | 'default' | 'narrow';

  interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
    size?: Size;
    class?: string;
    children?: Snippet;
  }

  let { size = 'default', class: className = '', children, ...restProps }: ContainerProps = $props();

  const sizeClasses: Record<Size, string> = {
    full: 'max-w-[1600px]',
    default: 'max-w-7xl',
    narrow: 'max-w-4xl'
  };

  const containerClasses = `mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`;
</script>

<div class={containerClasses} data-testid="container" {...restProps}>
  {#if children}
    {@render children()}
  {/if}
</div>