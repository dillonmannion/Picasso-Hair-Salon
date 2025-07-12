<script lang="ts">
  export interface GalleryImage {
    src: string;
    alt: string;
  }

  interface Props {
    images: GalleryImage[];
    class?: string;
  }

  let { images, class: className = '' }: Props = $props();
</script>

<section aria-label="Gallery" class="masonry-gallery {className}">
  <div class="masonry-container columns-2 md:columns-3 lg:columns-4 gap-4">
    {#each images as image, index (index)}
      <figure class="group mb-4 break-inside-avoid overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg">
        <img
          src={image.src}
          alt={image.alt}
          class="w-full h-auto"
          loading="lazy"
        />
      </figure>
    {/each}
  </div>
</section>

<style>
  .masonry-gallery {
    @apply w-full;
  }
</style>