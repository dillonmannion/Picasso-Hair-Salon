<script lang="ts">
  interface Props {
    src: string;
    alt: string;
    icon?: string;
    class?: string;
    loading?: 'lazy' | 'eager';
  }

  const { src, alt, icon, class: className = '', loading }: Props = $props();
</script>

<div class="relative overflow-hidden group {className}">
  <img
    {src}
    {alt}
    {loading}
    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
  
  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300"></div>
  
  {#if icon}
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {icon}
      </span>
    </div>
  {/if}
}</div>