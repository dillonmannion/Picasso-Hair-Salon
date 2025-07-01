import { 
  ProfileSchema, 
  OAuthCallbackParamsSchema, 
  OAuthErrorParamsSchema,
  ButtonPropsSchema, 
  type Profile, 
  type OAuthCallbackParams, 
  type OAuthErrorParams,
  type ButtonProps 
} from '$lib/schemas';

export const createMockProfile = (overrides?: Partial<Profile>): Profile => {
  const baseProfile = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const profileData = { ...baseProfile, ...overrides };
  
  return ProfileSchema.parse(profileData);
};

export const createMockOAuthCallback = (overrides?: Partial<OAuthCallbackParams>): OAuthCallbackParams => {
  const baseParams = {
    code: 'test_auth_code_123'
  };

  const paramsData = { ...baseParams, ...overrides };
  
  return OAuthCallbackParamsSchema.parse(paramsData);
};

export const createMockButtonProps = (overrides?: Partial<ButtonProps>): ButtonProps => {
  const baseProps = {
    variant: 'primary' as const,
    size: 'medium' as const
  };

  const propsData = { ...baseProps, ...overrides };
  
  return ButtonPropsSchema.parse(propsData);
};

export const createMockOAuthError = (overrides?: Partial<OAuthErrorParams>): OAuthErrorParams => {
  const baseError = {
    error: 'access_denied',
    error_code: 'AUTH001',
    error_description: 'User denied access'
  };

  const errorData = { ...baseError, ...overrides };
  
  return OAuthErrorParamsSchema.parse(errorData);
};