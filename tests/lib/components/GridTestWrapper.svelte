<script lang="ts">
  import Grid from '$lib/components/Grid.svelte';
  
  type Props = {
    cols?: number | {
      default?: number;
      md?: number;
      lg?: number;
      xl?: number;
    };
    gap?: number | {
      default?: number;
      md?: number;
      lg?: number;
    };
    itemCount?: number;
  };

  const { cols, gap, itemCount = 3 }: Props = $props();
</script>

<Grid {cols} {gap}>
  {#if itemCount === 3}
    <div data-testid="child-1">Child 1</div>
    <div data-testid="child-2">Child 2</div>
    <div data-testid="child-3">Child 3</div>
  {:else}
    {#each Array(itemCount) as _, i (i)}
      <div data-testid="item-{i}">Item {i}</div>
    {/each}
  {/if}
</Grid>