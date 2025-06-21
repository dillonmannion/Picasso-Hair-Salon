import type { User } from '@supabase/supabase-js';

/**
 * Get user display name from user metadata
 */
export function getUserDisplayName(user: User | null): string {
	if (!user) return 'User';
	return (user.user_metadata?.full_name as string) ?? user.email ?? 'User';
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(user: User | null): string {
	if (!user) return 'U';

	const fullName = user.user_metadata?.full_name as string | undefined;
	if (fullName) {
		return fullName
			.split(' ')
			.map((name: string) => name[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	if (user.email) {
		return user.email.slice(0, 2).toUpperCase();
	}

	return 'U';
}

/**
 * Get user avatar URL from metadata
 */
export function getUserAvatarUrl(user: User | null): string | null {
	if (!user) return null;
	return (user.user_metadata?.avatar_url as string) ?? null;
}
