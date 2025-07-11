<script lang="ts">
  type TypographyVariant = 'hero' | 'display' | 'heading' | 'body' | 'caption';
  type TypographyTag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';

  interface Props {
    variant?: TypographyVariant;
    as?: TypographyTag;
    class?: string;
  }

  let { 
    variant = 'body', 
    as,
    class: className = '',
    ...restProps
  }: Props = $props();

  const variantConfig = {
    hero: {
      tag: 'h1' as const,
      classes: 'font-zen-old-mincho text-7xl lg:text-8xl xl:text-9xl'
    },
    display: {
      tag: 'h2' as const,
      classes: 'font-prata text-5xl lg:text-6xl xl:text-7xl'
    },
    heading: {
      tag: 'h3' as const,
      classes: 'font-prata text-3xl lg:text-4xl'
    },
    body: {
      tag: 'p' as const,
      classes: 'font-montserrat text-base lg:text-lg'
    },
    caption: {
      tag: 'p' as const,
      classes: 'font-montserrat text-sm text-gray-600'
    }
  } as const;

  const config = $derived(variantConfig[variant]);
  const Element = $derived(as || config.tag);
  const classes = $derived(`${config.classes} ${className}`.trim());
</script>

<svelte:element this={Element} class={classes} {...restProps}>
  <slot />
</svelte:element>