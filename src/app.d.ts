import { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession(): Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			adminStatus: {
				isAdmin: boolean;
				email: string | null;
				canManageServices: boolean;
				canManageStylists: boolean;
				canManageAppointments: boolean;
				canManageGallery: boolean;
				canViewAllUsers: boolean;
			};
		}
		interface PageData {
			session: Session | null;
			user: User | null;
			adminStatus?: {
				isAdmin: boolean;
				email: string | null;
				canManageServices: boolean;
				canManageStylists: boolean;
				canManageAppointments: boolean;
				canManageGallery: boolean;
				canViewAllUsers: boolean;
			};
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
