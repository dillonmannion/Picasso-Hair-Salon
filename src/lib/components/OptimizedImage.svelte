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
    fallbackSrc?: string;
  }

  const OBSERVER_OPTIONS = {
    rootMargin: '50px',
  };

  const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80';

  let {
    src,
    alt,
    srcset,
    sizes,
    width,
    height,
    loading = 'lazy',
    class: className = '',
    fallbackSrc,
    ...restProps
  }: Props = $props();

  let imageRef: HTMLImageElement;
  let isIntersecting = $state(false);
  let hasLoaded = $state(false);
  let currentSrc = $state(src);
  let hasFailed = $state(false);

  $effect(() => {
    if (src !== currentSrc && !hasFailed) {
      currentSrc = src;
      hasLoaded = false;
    }
  });

  const handleLoad = (): void => {
    hasLoaded = true;
  };

  const handleError = (): void => {
    if (!hasFailed && fallbackSrc && currentSrc !== fallbackSrc) {
      // User explicitly provided a fallback - try to load it
      hasFailed = true;
      currentSrc = fallbackSrc;
      // Don't mark as loaded yet - wait for fallback to load
    } else {
      // No fallback provided or fallback failed - mark as loaded to avoid infinite loading state
      hasLoaded = true;
      // If no explicit fallback was provided, use default for display purposes
      if (!fallbackSrc && !hasFailed) {
        hasFailed = true;
        currentSrc = DEFAULT_FALLBACK;
      }
    }
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
    src={isIntersecting ? currentSrc : undefined}
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