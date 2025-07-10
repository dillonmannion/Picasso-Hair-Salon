import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'stylist' | 'customer';

export type ValidationResult = {
  session: Session | null;
  user: User | null;
  isValid: boolean;
};

export type UserWithRole = User & {
  role: UserRole;
};

type Profile = {
  id: string;
  is_admin?: boolean;
  role?: string;
};

const INVALID_SESSION: ValidationResult = {
  session: null,
  user: null,
  isValid: false
};

export const validateSession = async (supabase: SupabaseClient): Promise<ValidationResult> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (!session || sessionError) {
    return INVALID_SESSION;
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    return INVALID_SESSION;
  }

  return { session, user, isValid: true };
};

export const clearInvalidSession = async (supabase: SupabaseClient): Promise<void> => {
  await supabase.auth.signOut();
};

const determineUserRole = (profile: Profile | null): UserRole => {
  if (!profile) {
    return 'customer';
  }

  if (profile.is_admin === true) {
    return 'admin';
  }

  if (profile.role === 'stylist') {
    return 'stylist';
  }

  return 'customer';
};

export const getUserWithRole = async (
  supabase: SupabaseClient,
  user: User | null
): Promise<UserWithRole | null> => {
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, is_admin, role')
    .eq('id', user.id)
    .single();

  const role = determineUserRole(profile);

  return {
    ...user,
    role
  };
};