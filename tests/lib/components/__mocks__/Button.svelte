<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'small' | 'default' | 'large';
    href?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  }
  
  let { variant = 'primary', size = 'default', href, onclick, children }: Props = $props();
</script>

{#if href}
  <a 
    href={href} 
    class="button variant-{variant} size-{size}"
  >
    {@render children?.()}
  </a>
{:else}
  <button 
    class="button variant-{variant} size-{size}"
    {onclick}
  >
    {@render children?.()}
  </button>
{/if}