<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements';
  import { onMount } from 'svelte';

  interface Props extends HTMLImgAttributes {
    src: string;
    alt: string;
    srcset?: string;
    sizes?: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    class?: string;
  }

  const OBSERVER_OPTIONS = {
    rootMargin: '50px',
  };

  let {
    src,
    alt,
    srcset,
    sizes,
    width,
    height,
    loading = 'lazy',
    class: className = '',
    ...restProps
  }: Props = $props();

  let imageRef: HTMLImageElement;
  let isIntersecting = $state(false);
  let hasLoaded = $state(false);

  const handleLoad = (): void => {
    hasLoaded = true;
  };

  const handleError = (): void => {
    hasLoaded = true;
  };

  const handleIntersection: IntersectionObserverCallback = (entries, observer) => {
    const entry = entries[0];
    if (entry?.isIntersecting) {
      isIntersecting = true;
      observer.unobserve(entry.target);
    }
  };

  onMount(() => {
    const observer = new IntersectionObserver(handleIntersection, OBSERVER_OPTIONS);

    if (imageRef) {
      observer.observe(imageRef);
    }

    return () => {
      observer.disconnect();
    };
  });
</script>

<div class="transition-opacity duration-300 {hasLoaded ? 'opacity-100' : 'opacity-0'}">
  <img
    bind:this={imageRef}
    src={isIntersecting ? src : undefined}
    {alt}
    {srcset}
    {sizes}
    {width}
    {height}
    {loading}
    class={className}
    onload={handleLoad}
    onerror={handleError}
    {...restProps}
  />
</div>