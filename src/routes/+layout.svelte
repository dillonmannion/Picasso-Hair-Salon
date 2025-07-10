<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';
  import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
  import '../app.css';

  let { children, data }: { children: Snippet; data: LayoutData } = $props();

  let { supabase, session } = $derived(data);

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession: Session | null) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    return () => subscription.unsubscribe();
  });
</script>

{@render children()}
