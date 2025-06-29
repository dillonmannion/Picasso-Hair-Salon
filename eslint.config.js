import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	// Linter options
	{
		linterOptions: {
			reportUnusedDisableDirectives: 'warn'
		}
	},

	// Enhanced ignore patterns
	includeIgnoreFile(gitignorePath),
	{
		ignores: [
			// Build outputs and dependencies
			'build/**',
			'.svelte-kit/**',
			'dist/**',
			'coverage/**',
			'node_modules/**',
			'*.d.ts',

			// Version control systems (industry standard)
			'**/.git/**',
			'**/.svn/**',
			'**/.hg/**',

			// Auto-generated files from libraries/plugins
			'src/lib/paraglide/**', // Paraglide-JS i18n auto-generated
			'src/lib/components/ui/**', // shadcn-svelte UI components
			'src/lib/types/database.types.ts', // Supabase auto-generated types
			'src/app.d.ts', // SvelteKit auto-generated

			// Package manager artifacts
			'**/package-lock.json',
			'**/pnpm-lock.yaml',
			'**/yarn.lock',
			'**/bun.lock*',

			// Environment and IDE files
			'**/.env*',
			'!**/.env.example',
			'**/.vscode/**',
			'**/.idea/**',
			'**/*.log',
			'**/npm-debug.log*',
			'**/yarn-debug.log*',
			'**/yarn-error.log*',

			// Framework/bundler specific (industry standard)
			'**/.next/**',
			'**/.nuxt/**',
			'**/.cache/**',
			'**/public/build/**',
			'**/.vercel/**',
			'**/.netlify/**',

			// Documentation and assets often auto-generated
			'**/CHANGELOG.md',
			'**/changelog.md',
			'**/*.min.{js,css}',
			'**/*.bundle.{js,css}',

			// Testing files
			'**/*.{test,spec}.{js,ts,svelte}',
			'tests/**',
			'test-results/**',
			'vitest-setup-client.ts',

			// Configuration files
			'eslint.config.js',
			'svelte.config.js',
			'vite.config.ts',
			'vitest.config.ts',
			'playwright.config.ts',
			'tailwind.config.js',
			'postcss.config.js',

			// Scripts directory (utility scripts don't need strict linting)
			'scripts/**',

			// Common auto-generated patterns
			'**/.generated/**',
			'**/generated/**',
			'**/__generated__/**',
			'**/*.generated.{js,ts,svelte}',
			'**/*.gen.{js,ts,svelte}'
		]
	},

	// Base configurations
	js.configs.recommended,
	...ts.configs.recommendedTypeChecked,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,

	// Configuration files - disable type checking
	{
		files: ['**/*.config.{js,ts,mjs}'],
		languageOptions: {
			globals: {
				...globals.node
			},
			parserOptions: {
				project: null
			}
		}
	},

	// JavaScript files - disable type checking
	{
		files: ['**/*.js', '**/*.mjs'],
		languageOptions: {
			parserOptions: {
				project: null
			}
		},
		rules: {
			// Basic security rules for JS
			'no-eval': 'error',
			'no-implied-eval': 'error',
			'no-new-func': 'error',
			'no-script-url': 'error'
		}
	},

	// Global language options with explicit project path
	{
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2024
			},
			parserOptions: {
				project: './tsconfig.eslint.json',
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.svelte']
			}
		},
		rules: {
			// Core correctness rules
			'no-undef': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true
				}
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
			'@typescript-eslint/no-import-type-side-effects': 'warn',
			'@typescript-eslint/prefer-nullish-coalescing': 'warn',

			// Security rules
			'@typescript-eslint/no-implied-eval': 'error',
			'@typescript-eslint/no-unsafe-argument': 'error',
			'@typescript-eslint/no-unsafe-assignment': 'warn',
			'@typescript-eslint/no-unsafe-call': 'error',
			'@typescript-eslint/no-unsafe-member-access': 'warn',
			'@typescript-eslint/no-unsafe-return': 'error'
		}
	},

	// Svelte-specific configuration
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				extraFileExtensions: ['.svelte'],
				svelteConfig
			}
		},
		rules: {
			'svelte/no-unused-svelte-ignore': 'warn',
			'svelte/require-store-reactive-access': 'warn',
			'svelte/no-at-html-tags': 'error'
		}
	},

	// Gradually add unicorn rules (selective approach)
	{
		plugins: {
			unicorn
		},
		rules: {
			// High-value security rules from unicorn
			'unicorn/no-abusive-eslint-disable': 'error',
			'unicorn/no-instanceof-builtins': 'error',
			'unicorn/prefer-structured-clone': 'error',
			'unicorn/no-hex-escape': 'error',
			'unicorn/consistent-existence-index-check': 'error',

			// Performance and modern practices
			'unicorn/explicit-length-check': 'warn',
			'unicorn/prefer-array-some': 'warn',
			'unicorn/prefer-includes': 'warn',
			'unicorn/prefer-modern-math-apis': 'warn',
			'unicorn/prefer-number-properties': 'warn',
			'unicorn/prefer-at': 'warn',
			'unicorn/prefer-regexp-test': 'warn',
			'unicorn/no-useless-fallback-in-spread': 'warn',
			'unicorn/prefer-array-flat-map': 'warn'
		}
	}
);
