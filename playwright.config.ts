import { defineConfig, devices } from '@playwright/test';
// import process from 'node:process';

export default defineConfig({
	// Test directory
	testDir: 'e2e',

	// Performance optimizations
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	...(process.env.CI && { workers: 2 }),

	// Advanced failure handling for CI
	...(process.env.CI && { maxFailures: 10 }),
	failOnFlakyTests: !!process.env.CI,

	// Reporter configuration optimized for CI/local
	reporter: [
		process.env.CI ? ['blob'] : ['html', { open: 'never' }],
		['list'],
		['json', { outputFile: 'test-results/results.json' }]
	],

	// Global test configuration
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		actionTimeout: 10 * 1000, // 10 seconds
		navigationTimeout: 30 * 1000 // 30 seconds
	},

	// Browser projects optimized for CI
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] }
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] }
		},
		// Mobile testing
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] }
		},
		{
			name: 'Mobile Safari',
			use: { ...devices['iPhone 12'] }
		}
	],

	// Optimized web server configuration
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000, // 2 minutes
		stdout: 'pipe',
		stderr: 'pipe'
	},

	// Output configuration
	outputDir: 'test-results',

	// Build configuration for faster transpilation
	build: {
		external: ['**/*bundle.js']
	},

	// Test timeout configurations
	timeout: 30 * 1000, // 30 seconds per test
	expect: {
		timeout: 10 * 1000 // 10 seconds for assertions
	}
});
