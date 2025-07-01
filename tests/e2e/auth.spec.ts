import { test, expect } from '@playwright/test';

test.describe('OAuth Authentication', () => {
  test('should display OAuth login page', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page.getByRole('heading', { name: /sign in to picasso hair salon/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
    
    // Ensure no email/password inputs are present
    await expect(page.getByLabel(/email/i)).not.toBeVisible();
    await expect(page.getByLabel(/password/i)).not.toBeVisible();
  });

  test('should display error message from URL parameter', async ({ page }) => {
    await page.goto('/auth/login?error=access_denied');
    
    await expect(page.getByText(/access_denied/i)).toBeVisible();
  });

  test('should handle OAuth callback errors', async ({ page }) => {
    // Test callback with no code
    await page.goto('/auth/callback');
    await expect(page.url()).toContain('/auth/login?error=no_code');
    
    // Test callback with OAuth error
    await page.goto('/auth/callback?error=access_denied');
    await expect(page.url()).toContain('/auth/login?error=access_denied');
  });

  test.skip('should complete OAuth flow', async ({ page }) => {
    // This test would require mocking the OAuth provider
    // which is complex in E2E tests
    // For production, this would be tested manually or with integration tests
  });
});