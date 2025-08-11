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

			// Svelte 5 state files (runes not yet supported by ESLint)
			'src/lib/state/**/*.svelte.ts',
			'src/lib/state/**/*.svelte.js',

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
			'e2e/**',

			// Configuration files
			'*.config.{js,ts,mjs}',
			'**/*.config.{js,ts,mjs}',
			'.prettierrc',
			'components.json',
			'project.inlang/**',

			// Documentation
			'**/*.md',
			'docs/**',
			'README.md',
			'CLAUDE.md',
			'REPOSITORY_REVIEW.md',

			// Scripts and database directory
			'scripts/**',
			'database/**',
			'messages/**',

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
			'svelte/no-at-html-tags': 'error',

			// Svelte 5 best practices
			'svelte/no-reactive-reassign': 'error',
			'svelte/valid-prop-names-in-kit-pages': 'error',
			'svelte/prefer-destructured-store-props': 'warn',

			// Component best practices
			'svelte/block-lang': ['error', { script: 'ts', style: null }],
			'svelte/no-immutable-reactive-statements': 'error',
			'svelte/no-reactive-functions': 'error',
			'svelte/no-reactive-literals': 'warn',

			// Accessibility
			'svelte/no-dom-manipulating': 'warn'
		}
	},

	// Svelte 5 state files configuration
	{
		files: ['**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.eslint.json'
			}
		},
		rules: {
			// Disable rules that don't apply to state files
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'warn'
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
