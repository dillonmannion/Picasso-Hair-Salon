<script lang="ts">
  import type { Snippet } from 'svelte';

  type AnimationType = 'fade' | 'fly' | 'scale';

  interface Props {
    animation?: AnimationType;
    delay?: number;
    duration?: number;
    threshold?: number;
    class?: string;
    children?: Snippet;
  }

  const {
    animation = 'fade',
    delay = 0,
    duration = 1000,
    threshold = 0.1,
    class: className = '',
    children
  }: Props = $props();

  let element = $state<HTMLElement>();
  let isVisible = $state(false);
  
  const animationClass = $derived(
    isVisible ? `animate-${animation}` : ''
  );
  
  const opacityClass = $derived(
    isVisible ? '' : 'opacity-0'
  );
  
  const classes = $derived(
    `${className} ${opacityClass} ${animationClass}`.trim()
  );

  $effect(() => {
    if (!element) return;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting && !isVisible) {
        isVisible = true;
        observer.unobserve(entry.target);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin: '0px',
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  });
</script>

<div
  bind:this={element}
  data-animated
  data-testid="animated-element"
  class={classes}
  style:animation-delay="{isVisible ? delay : 0}ms"
  style:animation-duration="{isVisible ? duration : 0}ms"
>
  {@render children?.()}
</div>