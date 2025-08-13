// Admin configuration for Picasso Hair Salon
// @ts-expect-error - env variables are not typed correctly
import { env } from '$env/dynamic/private';
import type { User } from '@supabase/supabase-js';

// Default admin emails - these should be overridden by environment variable
const DEFAULT_ADMIN_EMAILS = ['admin@picassosalon.com', 'owner@picassosalon.com'];

// Get admin emails from environment or use defaults
export const ADMIN_EMAILS = env.ADMIN_EMAILS
	? env.ADMIN_EMAILS.split(',').map((email: string) => email.trim().toLowerCase())
	: DEFAULT_ADMIN_EMAILS;

/**
 * Check if an email address has admin privileges
 */
export function isAdmin(email: string | null | undefined): boolean {
	if (!email) return false;
	return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Check if a user has admin privileges
 */
export function isUserAdmin(user: User | null | undefined): boolean {
	return isAdmin(user?.email);
}

/**
 * Verify admin access and throw error if not admin
 */
export function requireAdmin(user: User | null | undefined): void {
	if (!isUserAdmin(user)) {
		throw new Error('Admin access required');
	}
}

/**
 * Get admin status for a user
 */
export function getAdminStatus(user: User | null | undefined) {
	const isAdminUser = isUserAdmin(user);
	return {
		isAdmin: isAdminUser,
		email: user?.email ?? null,
		canManageServices: isAdminUser,
		canManageStylists: isAdminUser,
		canManageAppointments: isAdminUser,
		canManageGallery: isAdminUser,
		canViewAllUsers: isAdminUser
	};
}
