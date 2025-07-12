<script lang="ts">
  interface Props {
    href: string;
    text: string;
    class?: string;
    target?: string;
    rel?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
  }

  const { 
    href, 
    text, 
    class: className = '', 
    target,
    rel,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    ...restProps 
  }: Props = $props();
</script>

<a 
  {href} 
  class="relative inline-block text-atelier-gold hover:text-atelier-gold-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-atelier-gold group {className}"
  {target}
  {rel}
  aria-label={ariaLabel}
  aria-describedby={ariaDescribedBy}
  {...restProps}
>
  {text}
  <span class="absolute bottom-0 left-0 h-0.5 bg-atelier-gold w-0 group-hover:w-full transition-all duration-300"></span>
</a>