<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    animation?: 'fade' | 'fly' | 'scale';
    delay?: number;
    duration?: number;
    children?: Snippet;
  }
  
  let { animation = 'fade', delay = 0, duration = 500, children }: Props = $props();
</script>

<div class="animated-element" data-animation={animation} data-delay={delay} data-duration={duration}>
  {@render children?.()}
</div>