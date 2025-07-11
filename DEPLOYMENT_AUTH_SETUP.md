# Authentication Setup for Local and Vercel Deployment

This guide helps you configure authentication to work both locally and on Vercel.

## Overview

The application uses Supabase for authentication with Google OAuth. The authentication flow is already configured to dynamically use the current domain (`window.location.origin`), so it works on any deployment URL without code changes.

## Steps to Configure

### 1. Supabase Dashboard Configuration

Log into your Supabase project dashboard and configure the following:

1. Go to **Authentication > URL Configuration**
2. Add these URLs to the **Redirect URLs** (one per line):
   ```
   http://localhost:5173/auth/callback
   http://localhost:5174/auth/callback
   https://your-app-name.vercel.app/auth/callback
   https://your-custom-domain.com/auth/callback
   ```
   
   Also add any preview deployment URLs:
   ```
   https://*.vercel.app/auth/callback
   ```

3. Set the **Site URL** to your production domain:
   ```
   https://your-app-name.vercel.app
   ```

### 2. Google OAuth Configuration (if using Google)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to **APIs & Services > Credentials**
4. Configure your OAuth 2.0 Client ID with these Authorized redirect URIs:
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
   ```

5. Copy the Client ID and Client Secret

6. In Supabase Dashboard:
   - Go to **Authentication > Providers**
   - Enable Google
   - Add your Google Client ID and Secret

### 3. Vercel Environment Variables

In your Vercel project settings, add these environment variables:

```bash
# Required Supabase variables
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional but recommended
PUBLIC_APP_URL=https://your-app-name.vercel.app
PUBLIC_APP_NAME=Picasso Hair Salon

# Vercel KV for rate limiting (if using)
KV_URL=your-kv-url
KV_REST_API_URL=your-kv-rest-api-url
KV_REST_API_TOKEN=your-kv-rest-api-token
KV_REST_API_READ_ONLY_TOKEN=your-kv-read-only-token
```

**Note**: Vercel automatically provides these environment variables:
- `VERCEL_URL`: The deployment URL (e.g., `your-app.vercel.app` or `your-app-git-branch.vercel.app`)
- `VERCEL_ENV`: The environment (`production`, `preview`, or `development`)

The authentication system uses these to automatically detect the correct URLs.

### 4. Local Development

For local development, create a `.env` file:

```bash
# Copy from .env.example and fill in your values
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PUBLIC_APP_URL=http://localhost:5173
```

### 5. Testing Authentication

1. **Local Testing**:
   ```bash
   pnpm dev
   ```
   Visit http://localhost:5173/auth/login

2. **Vercel Preview**:
   - Push your changes to trigger a preview deployment
   - Visit the preview URL at `/auth/login`

3. **Production**:
   - Deploy to production
   - Visit https://your-app-name.vercel.app/auth/login

## Troubleshooting

### "Redirect URL mismatch" Error

This means the callback URL isn't configured in Supabase:
1. Check the browser's network tab for the exact redirect URL being used
2. Add that exact URL to Supabase Dashboard > Authentication > URL Configuration

### Authentication works locally but not on Vercel

1. Verify environment variables are set in Vercel dashboard
2. Check that the Vercel URL is added to Supabase redirect URLs
3. Ensure Google OAuth (if used) has the correct Supabase callback URL

### User redirected to localhost from Vercel

This shouldn't happen with the current setup since we use `window.location.origin`. If it does:
1. Clear browser cache and cookies
2. Check for any hardcoded URLs in the codebase
3. Verify PUBLIC_APP_URL environment variable (though it's not used in auth flow)

## Security Notes

- The `PUBLIC_SUPABASE_ANON_KEY` is safe to expose in client-side code
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- The callback handler validates redirect URLs to prevent open redirect vulnerabilities
- CSP headers are configured to allow necessary Supabase and Vercel scripts