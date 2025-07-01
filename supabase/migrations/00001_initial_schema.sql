-- Enable RLS
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create test helpers (only in test environment)
-- Note: OAuth-only authentication - no password-based user creation
CREATE OR REPLACE FUNCTION public.create_oauth_test_user(
  email TEXT,
  provider TEXT DEFAULT 'google'
) RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Only allow in test environment
  IF current_setting('app.environment', true) != 'test' THEN
    RAISE EXCEPTION 'Test helpers only available in test environment';
  END IF;
  
  -- Create user for OAuth provider
  INSERT INTO auth.users (email, email_confirmed_at)
  VALUES (email, NOW())
  RETURNING id INTO user_id;
  
  -- Create identity for OAuth provider
  INSERT INTO auth.identities (user_id, identity_data, provider, last_sign_in_at)
  VALUES (
    user_id, 
    jsonb_build_object('email', email, 'email_verified', true),
    provider,
    NOW()
  );
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;