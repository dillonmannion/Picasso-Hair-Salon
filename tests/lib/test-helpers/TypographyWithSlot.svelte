<script lang="ts">
  import Typography from '$lib/components/Typography.svelte';

  type TypographyVariant = 'hero' | 'display' | 'heading' | 'body' | 'caption';
  type TypographyTag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';

  interface Props {
    typographyProps?: {
      variant?: TypographyVariant;
      as?: TypographyTag;
      class?: string;
    };
    slotContent?: string;
  }

  let { typographyProps = {}, slotContent = '' }: Props = $props();
</script>

<Typography {...typographyProps}>
  {slotContent}
</Typography>