<script lang="ts">
  import type { SupabaseClient } from '@supabase/supabase-js';
  import { ProfileSchema, type Profile } from '$lib/schemas';

  interface Props {
    userId: string;
    supabase: SupabaseClient;
  }

  let { userId, supabase }: Props = $props();

  let profile = $state<Profile | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let saving = $state(false);
  let successMessage = $state<string | null>(null);
  let validationError = $state<string | null>(null);

  let formData = $state({
    username: '',
    full_name: '',
    avatar_url: '',
  });

  let originalData = $state({
    username: '',
    full_name: '',
    avatar_url: '',
  });

  const isDirty = $derived(() => {
    return (
      formData.username !== originalData.username ||
      formData.full_name !== originalData.full_name ||
      formData.avatar_url !== originalData.avatar_url
    );
  });

  const loadProfile = async () => {
    loading = true;
    error = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        error = fetchError.message;
        return;
      }

      profile = data;
      formData = {
        username: data.username || '',
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || '',
      };
      originalData = { ...formData };
    } finally {
      loading = false;
    }
  };

  const saveProfile = async () => {
    validationError = null;
    successMessage = null;

    const profileUpdate = {
      ...profile,
      username: formData.username || null,
      full_name: formData.full_name || null,
      avatar_url: formData.avatar_url || null,
      updated_at: new Date().toISOString(),
    };

    const validationResult = ProfileSchema.safeParse(profileUpdate);
    if (!validationResult.success) {
      validationError = validationResult.error.issues[0]?.message || 'Validation failed';
      return;
    }

    saving = true;

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          username: formData.username || null,
          full_name: formData.full_name || null,
          avatar_url: formData.avatar_url || null,
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        error = updateError.message;
        return;
      }

      profile = data;
      originalData = { ...formData };
      successMessage = 'Profile updated successfully!';
    } finally {
      saving = false;
    }
  };

  $effect(() => {
    loadProfile();
  });
</script>

{#if loading}
  <div>Loading profile...</div>
{:else if error}
  <div>Error loading profile: {error}</div>
{:else}
  <form
    onsubmit={(e) => {
      e.preventDefault();
      saveProfile();
    }}
  >
    <div>
      <label for="username">Username</label>
      <input
        id="username"
        type="text"
        bind:value={formData.username}
        placeholder="Enter username"
      />
    </div>

    <div>
      <label for="full_name">Full Name</label>
      <input
        id="full_name"
        type="text"
        bind:value={formData.full_name}
        placeholder="Enter full name"
      />
    </div>

    <div>
      <label for="avatar_url">Avatar URL</label>
      <input
        id="avatar_url"
        type="url"
        bind:value={formData.avatar_url}
        placeholder="Enter avatar URL"
      />
    </div>

    {#if validationError}
      <div>{validationError}</div>
    {/if}

    {#if successMessage}
      <div>{successMessage}</div>
    {/if}

    <button type="submit" disabled={!isDirty() || saving}> Save Profile </button>
  </form>
{/if}
