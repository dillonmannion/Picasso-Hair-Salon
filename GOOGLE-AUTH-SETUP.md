# Google Authentication Setup Guide

This guide explains how to configure Google OAuth authentication for the Picasso Hair Salon application using Supabase.

## Overview

The application uses Supabase for authentication, which handles the OAuth flow with Google. You need to configure both the Google Cloud Console and Supabase to enable Google authentication.

## Prerequisites

- A Google Cloud Platform account
- A Supabase project set up
- Your application deployed or running locally

## Google Cloud Console Setup

### 1. Create a Google Cloud Project (if you don't have one)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select an existing project
3. Give your project a name (e.g., "Picasso Hair Salon")

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - **App name**: Picasso Hair Salon
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add your domain to "Authorized domains" if your app is deployed
5. Click "Save and Continue"
6. Add scopes (you can skip this for basic auth)
7. Add test users if needed during development
8. Review and submit

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the name: "Picasso Hair Salon Web Client"
5. Add Authorized JavaScript origins:
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`
6. Add Authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - Replace `your-project-ref` with your actual Supabase project reference

### 5. Get Your Credentials

After creating the OAuth client, you'll get:
- **Client ID**: A long string ending in `.apps.googleusercontent.com`
- **Client Secret**: A shorter secret string

**Keep these secure and never commit them to version control!**

## Supabase Configuration

### 1. Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Authentication" > "Providers"

### 2. Configure Google Provider

1. Find "Google" in the list of providers
2. Toggle it ON
3. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Click "Save"

### 3. Verify Redirect URLs

In Supabase, go to "Authentication" > "Settings":
- **Site URL**: Your production domain (e.g., `https://yourdomain.com`)
- **Redirect URLs**: Should include:
  - `http://localhost:5173/auth/callback` (for development)
  - `https://yourdomain.com/auth/callback` (for production)

## Application Configuration

### 1. Environment Variables

Make sure your `.env` file contains:

```env
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under "API".

### 2. Verify Auth Flow

The application's Google auth flow works as follows:

1. User clicks "Sign in with Google" button
2. App redirects to Supabase Auth endpoint
3. Supabase redirects to Google OAuth
4. User grants permissions on Google
5. Google redirects back to Supabase
6. Supabase processes the OAuth callback
7. Supabase redirects to your app's callback URL (`/auth/callback`)
8. Your app exchanges the auth code for a session
9. User is logged in and redirected to home page

## Troubleshooting Common Issues

### 1. "Error 400: redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match what's configured in Google Cloud Console.

**Solution**: 
- Check that the redirect URI in Google Cloud Console exactly matches: `https://your-project-ref.supabase.co/auth/v1/callback`
- Make sure you're using the correct Supabase project reference

### 2. "Error 403: access_blocked"

**Problem**: Your OAuth consent screen is not approved, or the user's email is not in the test users list.

**Solution**:
- During development, add test user emails in Google Cloud Console > OAuth consent screen > Test users
- For production, submit your app for verification

### 3. Authentication works but user gets stuck on loading

**Problem**: The callback handler might not be processing correctly.

**Solution**:
- Check that `/auth/callback` route exists and is properly configured
- Verify the callback URL in both Google Cloud Console and Supabase matches your app's callback route

### 4. "Invalid client: no application name"

**Problem**: OAuth consent screen is not properly configured.

**Solution**:
- Complete the OAuth consent screen configuration in Google Cloud Console
- Make sure all required fields are filled out

## Security Best Practices

1. **Never expose Client Secret**: Keep it secure and only use it server-side
2. **Use HTTPS in production**: Google OAuth requires HTTPS for production apps
3. **Validate redirect URIs**: Only allow your own domains in the authorized redirect URIs
4. **Regular token rotation**: Consider implementing token refresh mechanisms
5. **Monitor auth logs**: Check Supabase auth logs for suspicious activity

## Testing

### Development Testing
1. Start your local dev server (`npm run dev`)
2. Navigate to `/auth/login`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. Verify you're redirected back and logged in

### Production Testing
1. Deploy your application
2. Update Google Cloud Console with production URLs
3. Update Supabase with production redirect URLs
4. Test the complete flow on your live site

## Additional Resources

- [Supabase Auth with Google Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://supabase.com/dashboard)