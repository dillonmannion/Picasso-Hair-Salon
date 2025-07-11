<script lang="ts">
  import type { Component } from 'svelte';

  interface Props {
    component: Component<Record<string, unknown>>;
    content?: string;
    props?: Record<string, unknown>;
  }

  let { component: Comp, content = '', props = {} }: Props = $props();
</script>

<Comp {...props}>
  {content}
</Comp>