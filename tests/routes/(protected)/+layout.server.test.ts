import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from '@sveltejs/kit';
import { load } from '../../../src/routes/(protected)/+layout.server';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { RouteParams } from '../../../src/routes/(protected)/$types';

vi.mock('@sveltejs/kit', () => ({
  redirect: vi.fn(() => {
    throw new Error('Redirect');
  })
}));

const createMockEvent = (overrides: Record<string, unknown> = {}) => {
  return {
    locals: {},
    url: new URL('http://localhost'),
    route: { id: '' },
    parent: vi.fn(),
    depends: vi.fn(),
    untrack: vi.fn(),
    ...overrides
  } as unknown as ServerLoadEvent<RouteParams, object, '/(protected)'>;
};

describe('Protected Route Load Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect unauthorized users to login', async () => {
    const mockEvent = createMockEvent({
      url: new URL('http://localhost/protected/dashboard?foo=bar')
    });

    await expect(load(mockEvent)).rejects.toThrow('Redirect');

    expect(redirect).toHaveBeenCalledWith(307, '/login?redirectTo=%2Fprotected%2Fdashboard%3Ffoo%3Dbar');
  });

  it('should redirect users without required role to login', async () => {
    const mockEvent = createMockEvent({
      locals: {
        user: {
          id: 'user_123',
          email: 'user@example.com',
          role: 'user'
        }
      },
      url: new URL('http://localhost/protected/admin'),
      route: {
        id: '/(protected)/admin'
      }
    });

    await expect(load(mockEvent)).rejects.toThrow('Redirect');

    expect(redirect).toHaveBeenCalledWith(307, '/login?redirectTo=%2Fprotected%2Fadmin');
  });

  it('should pass user data to layout for authorized users', async () => {
    const mockUser = {
      id: 'user_123',
      email: 'user@example.com',
      role: 'user'
    };

    const mockEvent = createMockEvent({
      locals: {
        user: mockUser
      },
      url: new URL('http://localhost/protected/dashboard'),
      route: {
        id: '/(protected)/dashboard'
      }
    });

    const result = await load(mockEvent);

    expect(result).toEqual({ user: mockUser });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should allow admin users to access admin routes', async () => {
    const mockUser = {
      id: 'admin_123',
      email: 'admin@example.com',
      role: 'admin'
    };

    const mockEvent = createMockEvent({
      locals: {
        user: mockUser
      },
      url: new URL('http://localhost/protected/admin/users'),
      route: {
        id: '/(protected)/admin/users'
      }
    });

    const result = await load(mockEvent);

    expect(result).toEqual({ user: mockUser });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should allow employee users to access employee routes', async () => {
    const mockUser = {
      id: 'emp_123',
      email: 'employee@example.com',
      role: 'employee'
    };

    const mockEvent = createMockEvent({
      locals: {
        user: mockUser
      },
      url: new URL('http://localhost/protected/employee/schedule'),
      route: {
        id: '/(protected)/employee/schedule'
      }
    });

    const result = await load(mockEvent);

    expect(result).toEqual({ user: mockUser });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should preserve query parameters in redirect URL', async () => {
    const mockEvent = createMockEvent({
      url: new URL('http://localhost/protected/settings?tab=security&theme=dark')
    });

    await expect(load(mockEvent)).rejects.toThrow('Redirect');

    expect(redirect).toHaveBeenCalledWith(307, '/login?redirectTo=%2Fprotected%2Fsettings%3Ftab%3Dsecurity%26theme%3Ddark');
  });

  it('should handle empty search params correctly', async () => {
    const mockEvent = createMockEvent({
      url: new URL('http://localhost/protected/profile')
    });

    await expect(load(mockEvent)).rejects.toThrow('Redirect');

    expect(redirect).toHaveBeenCalledWith(307, '/login?redirectTo=%2Fprotected%2Fprofile');
  });

  it('should block user role from accessing employee routes', async () => {
    const mockEvent = createMockEvent({
      locals: {
        user: {
          id: 'user_123',
          email: 'user@example.com',
          role: 'user'
        }
      },
      url: new URL('http://localhost/protected/employee/dashboard'),
      route: {
        id: '/(protected)/employee/dashboard'
      }
    });

    await expect(load(mockEvent)).rejects.toThrow('Redirect');

    expect(redirect).toHaveBeenCalledWith(307, '/login?redirectTo=%2Fprotected%2Femployee%2Fdashboard');
  });

  it('should block employee role from accessing admin routes', async () => {
    const mockEvent = createMockEvent({
      locals: {
        user: {
          id: 'emp_123',
          email: 'employee@example.com',
          role: 'employee'
        }
      },
      url: new URL('http://localhost/protected/admin/settings'),
      route: {
        id: '/(protected)/admin/settings'
      }
    });

    await expect(load(mockEvent)).rejects.toThrow('Redirect');

    expect(redirect).toHaveBeenCalledWith(307, '/login?redirectTo=%2Fprotected%2Fadmin%2Fsettings');
  });

  it('should handle root protected route', async () => {
    const mockUser = {
      id: 'user_123',
      email: 'user@example.com',
      role: 'user'
    };

    const mockEvent = createMockEvent({
      locals: {
        user: mockUser
      },
      url: new URL('http://localhost/protected'),
      route: {
        id: '/(protected)'
      }
    });

    const result = await load(mockEvent);

    expect(result).toEqual({ user: mockUser });
    expect(redirect).not.toHaveBeenCalled();
  });
});