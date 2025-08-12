import type { User } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

export class UserState {
	user = $state<User | null>(null);
	profile = $state<UserProfile | null>(null);
	isLoading = $state(false);
	error = $state<string | null>(null);

	// Derived states
	isAuthenticated = $derived(!!this.user);
	isAdmin = $derived(() => {
		const adminEmails = import.meta.env.ADMIN_EMAILS?.split(',') || [];
		return this.user?.email ? adminEmails.includes(this.user.email) : false;
	});

	displayName = $derived(this.profile?.full_name || this.user?.email?.split('@')[0] || 'Guest');

	// Methods
	setUser(user: User | null) {
		this.user = user;
	}

	setProfile(profile: UserProfile | null) {
		this.profile = profile;
	}

	setLoading(loading: boolean) {
		this.isLoading = loading;
	}

	setError(error: string | null) {
		this.error = error;
	}

	async updateProfile(updates: Partial<UserProfile>) {
		if (!this.profile) return;

		this.setLoading(true);
		this.setError(null);

		try {
			// Profile update logic would go here
			// This is just updating local state for now
			this.profile = { ...this.profile, ...updates };
		} catch (err) {
			this.setError(err instanceof Error ? err.message : 'Failed to update profile');
		} finally {
			this.setLoading(false);
		}
	}

	reset() {
		this.user = null;
		this.profile = null;
		this.isLoading = false;
		this.error = null;
	}
}

// Create singleton instance
export const userState = new UserState();

// Export convenience function
export function useUserState() {
	return userState;
}
