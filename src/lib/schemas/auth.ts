import { z } from 'zod';

// ============================================================================
// User Roles
// ============================================================================

export const UserRoleSchema = z.enum(['customer', 'staff', 'owner']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// ============================================================================
// Permissions
// ============================================================================
export const PermissionSchema = z.enum([
  'appointments.create',
  'appointments.read',
  'appointments.update',
  'appointments.delete',
  'customers.create',
  'customers.read',
  'customers.update',
  'customers.delete',
  'services.manage',
  'products.manage',
  'staff.manage',
  'reports.view',
  'analytics.view',
  'settings.manage'
]);
export type Permission = z.infer<typeof PermissionSchema>;

// ============================================================================
// Role-Permission Mappings
// ============================================================================
export const RolePermissionsSchema = {
  customer: [
    'appointments.create',
    'appointments.read',
    'appointments.update',
    'appointments.delete'
  ] as Permission[],
  staff: [
    'appointments.create',
    'appointments.read',
    'appointments.update',
    'appointments.delete',
    'customers.create',
    'customers.read',
    'customers.update',
    'services.manage',
    'products.manage',
    'reports.view'
  ] as Permission[],
  owner: [
    'appointments.create',
    'appointments.read',
    'appointments.update',
    'appointments.delete',
    'customers.create',
    'customers.read',
    'customers.update',
    'customers.delete',
    'services.manage',
    'products.manage',
    'staff.manage',
    'reports.view',
    'analytics.view',
    'settings.manage'
  ] as Permission[]
} as const;

// ============================================================================
// User & Session Schemas
// ============================================================================
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: UserRoleSchema,
  metadata: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string()
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});
export type User = z.infer<typeof UserSchema>;

// Session schema
export const SessionSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  expires_at: z.number(),
  refresh_token: z.string(),
  user: UserSchema
});
export type Session = z.infer<typeof SessionSchema>;

// ============================================================================
// Authentication State
// ============================================================================
export const AuthStateSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('authenticated'),
    user: UserSchema,
    session: SessionSchema
  }),
  z.object({
    status: z.literal('unauthenticated'),
    redirectTo: z.string().optional()
  }),
  z.object({
    status: z.literal('loading')
  })
]);
export type AuthState = z.infer<typeof AuthStateSchema>;

// ============================================================================
// Authentication Requests
// ============================================================================
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional().default(false)
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ============================================================================
// OAuth Configuration
// ============================================================================
export const OAuthProviderSchema = z.enum(['google']);
export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;

// OAuth callback schema
export const OAuthCallbackSchema = z.object({
  code: z.string(),
  state: z.string().uuid(),
  provider: OAuthProviderSchema
});
export type OAuthCallback = z.infer<typeof OAuthCallbackSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  const rolePermissions = RolePermissionsSchema[role];
  return rolePermissions.includes(permission);
};

export const getUserPermissions = (role: UserRole): readonly Permission[] => {
  return RolePermissionsSchema[role];
};