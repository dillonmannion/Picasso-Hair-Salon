<script lang="ts">
  import type { Snippet } from 'svelte';

  type ResponsiveConfig<T> = {
    default?: T;
    md?: T;
    lg?: T;
    xl?: T;
  };

  type Props = {
    cols?: number | ResponsiveConfig<number>;
    gap?: number | ResponsiveConfig<number>;
    class?: string;
    children?: Snippet;
  };

  const { cols, gap = 6, class: className = '', children }: Props = $props();

  const DEFAULT_COLUMNS: ResponsiveConfig<number> = {
    default: 1,
    md: 2,
    lg: 3,
  };

  const BREAKPOINT_PREFIXES = {
    default: '',
    md: 'md:',
    lg: 'lg:',
    xl: 'xl:',
  } as const;

  const buildResponsiveClasses = (
    value: number | ResponsiveConfig<number> | undefined,
    classPrefix: string,
    defaultValue?: ResponsiveConfig<number>
  ): string => {
    if (typeof value === 'number') {
      return `${classPrefix}-${value}`;
    }

    const config = value || defaultValue;
    if (!config) return '';

    return Object.entries(BREAKPOINT_PREFIXES)
      .map(([breakpoint, prefix]) => {
        const breakpointValue = config[breakpoint as keyof ResponsiveConfig<number>];
        return breakpointValue !== undefined 
          ? `${prefix}${classPrefix}-${breakpointValue}` 
          : '';
      })
      .filter(Boolean)
      .join(' ');
  };

  const gridClasses = $derived(
    [
      'grid',
      buildResponsiveClasses(cols, 'grid-cols', DEFAULT_COLUMNS),
      buildResponsiveClasses(gap, 'gap'),
      className,
    ]
      .filter(Boolean)
      .join(' ')
  );
</script>

<div class={gridClasses}>
  {#if children}
    {@render children()}
  {/if}
</div>