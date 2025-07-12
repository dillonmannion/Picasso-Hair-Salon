import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  UserRoleSchema,
  UserSchema,
  SessionSchema,
  AuthStateSchema,
  PermissionSchema,
  RolePermissionsSchema,
  LoginRequestSchema,
  OAuthProviderSchema,
  OAuthCallbackSchema,
  RouteProtectionSchema,
  hasPermission,
  getUserPermissions,
  canAccessRoute,
} from '$lib/schemas/auth';

describe('Authentication Schemas', () => {
  describe('UserRoleSchema', () => {
    it('should validate valid user roles', () => {
      expect(UserRoleSchema.parse('customer')).toBe('customer');
      expect(UserRoleSchema.parse('staff')).toBe('staff');
      expect(UserRoleSchema.parse('owner')).toBe('owner');
    });

    it('should reject invalid roles', () => {
      expect(() => UserRoleSchema.parse('admin')).toThrow();
      expect(() => UserRoleSchema.parse('superuser')).toThrow();
      expect(() => UserRoleSchema.parse('')).toThrow();
    });

    it('should provide enum values for type-safe access', () => {
      expect(UserRoleSchema.enum.customer).toBe('customer');
      expect(UserRoleSchema.enum.staff).toBe('staff');
      expect(UserRoleSchema.enum.owner).toBe('owner');
    });
  });

  describe('PermissionSchema', () => {
    it('should validate permission strings', () => {
      expect(PermissionSchema.parse('appointments.create')).toBe('appointments.create');
      expect(PermissionSchema.parse('customers.read')).toBe('customers.read');
      expect(PermissionSchema.parse('staff.manage')).toBe('staff.manage');
      expect(PermissionSchema.parse('analytics.view')).toBe('analytics.view');
    });

    it('should validate all expected permissions', () => {
      const validPermissions = [
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
        'settings.manage',
      ];

      validPermissions.forEach((permission) => {
        expect(() => PermissionSchema.parse(permission)).not.toThrow();
      });
    });

    it('should reject invalid permissions', () => {
      expect(() => PermissionSchema.parse('invalid.permission')).toThrow();
      expect(() => PermissionSchema.parse('appointments')).toThrow();
      expect(() => PermissionSchema.parse('')).toThrow();
    });
  });

  describe('RolePermissionsSchema', () => {
    it('should define permissions for customer role', () => {
      const customerPerms = RolePermissionsSchema.customer;
      expect(customerPerms).toContain('appointments.create');
      expect(customerPerms).toContain('appointments.read');
      expect(customerPerms).not.toContain('staff.manage');
      expect(customerPerms).not.toContain('settings.manage');
    });

    it('should define permissions for staff role', () => {
      const staffPerms = RolePermissionsSchema.staff;
      expect(staffPerms).toContain('appointments.create');
      expect(staffPerms).toContain('appointments.read');
      expect(staffPerms).toContain('appointments.update');
      expect(staffPerms).toContain('customers.read');
      expect(staffPerms).not.toContain('settings.manage');
    });

    it('should define permissions for owner role', () => {
      const ownerPerms = RolePermissionsSchema.owner;
      expect(ownerPerms).toContain('appointments.create');
      expect(ownerPerms).toContain('staff.manage');
      expect(ownerPerms).toContain('settings.manage');
      expect(ownerPerms).toContain('analytics.view');
      // Owner should have all permissions
      expect(ownerPerms.length).toBeGreaterThan(10);
    });
  });

  describe('UserSchema', () => {
    it('should validate a complete user object', () => {
      const validUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        role: 'customer',
        metadata: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = UserSchema.parse(validUser);
      expect(result.id).toBe(validUser.id);
      expect(result.email).toBe(validUser.email);
      expect(result.role).toBe('customer');
    });

    it('should reject invalid email formats', () => {
      const invalidUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'not-an-email',
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(() => UserSchema.parse(invalidUser)).toThrow();
    });

    it('should handle optional metadata', () => {
      const userWithoutMetadata = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        role: 'staff',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = UserSchema.parse(userWithoutMetadata);
      expect(result.metadata).toBeUndefined();
    });
  });

  describe('SessionSchema', () => {
    it('should validate a complete session object', () => {
      const validSession = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'refresh_token_value',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      const result = SessionSchema.parse(validSession);
      expect(result.access_token).toBe(validSession.access_token);
      expect(result.user.email).toBe(validSession.user.email);
    });

    it('should validate token type as bearer', () => {
      const session = {
        access_token: 'token',
        token_type: 'Bearer', // Should be case-insensitive
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'refresh',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          role: 'staff',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      const result = SessionSchema.parse(session);
      expect(result.token_type.toLowerCase()).toBe('bearer');
    });
  });

  describe('AuthStateSchema', () => {
    it('should validate authenticated state', () => {
      const authState = {
        status: 'authenticated',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        session: {
          access_token: 'token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: 'refresh',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            role: 'customer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      };

      const result = AuthStateSchema.parse(authState);
      expect(result.status).toBe('authenticated');
      if (result.status === 'authenticated') {
        expect(result.user).toBeDefined();
        expect(result.session).toBeDefined();
      }
    });

    it('should validate unauthenticated state', () => {
      const unauthState = {
        status: 'unauthenticated',
        redirectTo: '/login',
      };

      const result = AuthStateSchema.parse(unauthState);
      expect(result.status).toBe('unauthenticated');
      if (result.status === 'unauthenticated') {
        expect(result.redirectTo).toBe('/login');
      }
    });

    it('should validate loading state', () => {
      const loadingState = {
        status: 'loading',
      };

      const result = AuthStateSchema.parse(loadingState);
      expect(result.status).toBe('loading');
    });
  });

  describe('LoginRequestSchema', () => {
    it('should validate valid login requests', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        rememberMe: true,
      };

      const result = LoginRequestSchema.parse(validLogin);
      expect(result.email).toBe(validLogin.email);
      expect(result.rememberMe).toBe(true);
    });

    it('should provide default for rememberMe', () => {
      const loginWithoutRemember = {
        email: 'user@example.com',
        password: 'SecurePass123!',
      };

      const result = LoginRequestSchema.parse(loginWithoutRemember);
      expect(result.rememberMe).toBe(false);
    });

    it('should validate password requirements', () => {
      const weakPassword = {
        email: 'user@example.com',
        password: 'weak',
      };

      expect(() => LoginRequestSchema.parse(weakPassword)).toThrow();
    });
  });

  describe('OAuthProviderSchema', () => {
    it('should validate Google as OAuth provider', () => {
      expect(OAuthProviderSchema.parse('google')).toBe('google');
    });

    it('should reject unsupported providers', () => {
      expect(() => OAuthProviderSchema.parse('facebook')).toThrow();
      expect(() => OAuthProviderSchema.parse('github')).toThrow();
    });
  });

  describe('OAuthCallbackSchema', () => {
    it('should validate OAuth callback parameters', () => {
      const validCallback = {
        code: 'auth_code_123456',
        state: '123e4567-e89b-12d3-a456-426614174000',
        provider: 'google',
      };

      const result = OAuthCallbackSchema.parse(validCallback);
      expect(result.code).toBe(validCallback.code);
      expect(result.state).toBe(validCallback.state);
      expect(result.provider).toBe('google');
    });

    it('should reject invalid state format', () => {
      const invalidCallback = {
        code: 'auth_code_123456',
        state: 'not-a-uuid',
        provider: 'google',
      };

      expect(() => OAuthCallbackSchema.parse(invalidCallback)).toThrow();
    });
  });

  describe('RouteProtectionSchema', () => {
    it('should validate public route protection', () => {
      const protection = {
        requiresAuth: false,
        allowedRoles: [],
      };
      const result = RouteProtectionSchema.parse(protection);
      expect(result.requiresAuth).toBe(false);
      expect(result.allowedRoles).toEqual([]);
      expect(result.redirectTo).toBe('/');
    });

    it('should validate protected route with single role', () => {
      const protection = {
        requiresAuth: true,
        allowedRoles: ['customer'],
        redirectTo: '/login',
      };
      const result = RouteProtectionSchema.parse(protection);
      expect(result.requiresAuth).toBe(true);
      expect(result.allowedRoles).toEqual(['customer']);
      expect(result.redirectTo).toBe('/login');
    });

    it('should validate protected route with multiple roles', () => {
      const protection = {
        requiresAuth: true,
        allowedRoles: ['staff', 'owner'],
        redirectTo: '/login',
      };
      const result = RouteProtectionSchema.parse(protection);
      expect(result.requiresAuth).toBe(true);
      expect(result.allowedRoles).toHaveLength(2);
      expect(result.allowedRoles).toContain('staff');
      expect(result.allowedRoles).toContain('owner');
    });

    it('should provide default values', () => {
      const minimalProtection = {
        requiresAuth: true,
      };
      const result = RouteProtectionSchema.parse(minimalProtection);
      expect(result.allowedRoles).toEqual([]);
      expect(result.redirectTo).toBe('/');
    });

    it('should reject invalid roles in allowedRoles', () => {
      const protection = {
        requiresAuth: true,
        allowedRoles: ['admin'], // Not a valid role
        redirectTo: '/login',
      };
      expect(() => RouteProtectionSchema.parse(protection)).toThrow();
    });
  });

  describe('Helper Functions', () => {
    describe('hasPermission', () => {
      it('should return true for valid role-permission combinations', () => {
        expect(hasPermission('customer', 'appointments.create')).toBe(true);
        expect(hasPermission('staff', 'services.manage')).toBe(true);
        expect(hasPermission('owner', 'settings.manage')).toBe(true);
      });

      it('should return false for invalid role-permission combinations', () => {
        expect(hasPermission('customer', 'staff.manage')).toBe(false);
        expect(hasPermission('staff', 'settings.manage')).toBe(false);
      });
    });

    describe('getUserPermissions', () => {
      it('should return correct permissions for each role', () => {
        const customerPerms = getUserPermissions('customer');
        expect(customerPerms).toContain('appointments.create');
        expect(customerPerms).not.toContain('staff.manage');

        const staffPerms = getUserPermissions('staff');
        expect(staffPerms).toContain('services.manage');
        expect(staffPerms).not.toContain('settings.manage');

        const ownerPerms = getUserPermissions('owner');
        expect(ownerPerms).toContain('settings.manage');
        expect(ownerPerms).toContain('staff.manage');
      });
    });

    describe('canAccessRoute', () => {
      it('should allow access to public routes', () => {
        const publicRoute = RouteProtectionSchema.parse({
          requiresAuth: false,
        });
        
        expect(canAccessRoute(null, publicRoute)).toBe(true);
        expect(canAccessRoute('customer', publicRoute)).toBe(true);
        expect(canAccessRoute('staff', publicRoute)).toBe(true);
      });

      it('should deny unauthenticated access to protected routes', () => {
        const protectedRoute = RouteProtectionSchema.parse({
          requiresAuth: true,
          allowedRoles: ['customer'],
        });
        
        expect(canAccessRoute(null, protectedRoute)).toBe(false);
      });

      it('should allow any authenticated user when no roles specified', () => {
        const anyAuthRoute = RouteProtectionSchema.parse({
          requiresAuth: true,
          allowedRoles: [],
        });
        
        expect(canAccessRoute('customer', anyAuthRoute)).toBe(true);
        expect(canAccessRoute('staff', anyAuthRoute)).toBe(true);
        expect(canAccessRoute('owner', anyAuthRoute)).toBe(true);
      });

      it('should respect role restrictions', () => {
        const staffOnlyRoute = RouteProtectionSchema.parse({
          requiresAuth: true,
          allowedRoles: ['staff', 'owner'],
        });
        
        expect(canAccessRoute('customer', staffOnlyRoute)).toBe(false);
        expect(canAccessRoute('staff', staffOnlyRoute)).toBe(true);
        expect(canAccessRoute('owner', staffOnlyRoute)).toBe(true);
      });
    });
  });

  describe('Type inference', () => {
    it('should correctly infer types from schemas', () => {
      type UserRole = z.infer<typeof UserRoleSchema>;
      type User = z.infer<typeof UserSchema>;

      // These should compile without errors
      const role: UserRole = 'customer';
      const user: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(role).toBe('customer');
      expect(user.email).toBe('test@example.com');
    });
  });
});
