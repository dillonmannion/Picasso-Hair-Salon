import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

export const currentUser = writable<User | null>(null);

export function setUser(user: User | null) {
  currentUser.set(user);
}

export function clearUser() {
  currentUser.set(null);
}
