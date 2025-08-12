# Vite Documentation

## Overview

**Vite** (French for "quick") is a next-generation frontend build tool that significantly improves the frontend development experience. It consists of two major parts:

- **Dev Server**: Provides rich feature enhancements over native ES modules, including extremely fast Hot Module Replacement (HMR)
- **Build Command**: Bundles your code with Rollup, pre-configured to output highly optimized static assets for production

**Current version in project**: 6.3.5

## Why Use Vite?

- **Instant Server Start**: Lightning-fast cold start using native ES modules
- **Lightning Fast HMR**: Hot Module Replacement that stays fast regardless of app size
- **Rich Features**: TypeScript, JSX, CSS and more out-of-the-box
- **Optimized Build**: Pre-configured Rollup build with multi-page and library mode support
- **Universal Plugins**: Compatible between dev and build
- **Fully Typed APIs**: Flexible programmatic APIs with full TypeScript typing

## Installation & Setup

```bash
# Create new project with Vite
npm create vite@latest my-app

# Or add to existing project
npm install -D vite

# With specific template
npm create vite@latest my-app -- --template vue
```

## Core Concepts

### 1. Dev Server

Vite's dev server provides:

#### Native ESM Support

```html
<!-- index.html -->
<script type="module" src="/src/main.js"></script>
```

#### Fast HMR

```javascript
// HMR API is always wrapped in conditional
if (import.meta.hot) {
	// Accept the module itself
	import.meta.hot.accept();

	// Accept with callback
	import.meta.hot.accept((newModule) => {
		// Handle the updated module
	});

	// Accept dependencies
	import.meta.hot.accept('./foo.js', (newFoo) => {
		// Update with new foo module
	});
}
```

### 2. Configuration

Create `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],

	// Server options
	server: {
		port: 3000,
		open: true,
		cors: true,
		hmr: {
			overlay: true
		}
	},

	// Build options
	build: {
		outDir: 'dist',
		sourcemap: true,
		minify: 'terser',
		rollupOptions: {
			input: {
				main: '/index.html',
				admin: '/admin.html'
			}
		}
	},

	// Path resolution
	resolve: {
		alias: {
			'@': '/src',
			'~': '/src/components'
		}
	},

	// CSS options
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import "@/styles/variables.scss";`
			}
		}
	}
});
```

### 3. Asset Handling

#### Static Assets

```javascript
// Import as URL
import imgUrl from './img.png';
document.getElementById('hero-img').src = imgUrl;

// Import as string
import workletURL from './shader.worklet.js?url';
const worklet = await CSS.paintWorklet.addModule(workletURL);

// Import as Worker
import Worker from './worker.js?worker';
const worker = new Worker();
```

#### Public Directory

```
public/
  robots.txt      -> /robots.txt
  favicon.ico     -> /favicon.ico
```

### 4. CSS Handling

#### CSS Modules

```javascript
// .module.css files are CSS modules
import styles from './Button.module.css';

export function Button() {
	return <button className={styles.button}>Click me</button>;
}
```

#### PostCSS

```javascript
// postcss.config.js
export default {
	plugins: {
		tailwindcss: {},
		autoprefixer: {}
	}
};
```

#### CSS Pre-processors

```scss
// Direct import of SCSS
import './styles.scss'

// In components
<style lang="scss">
  $primary: #333;

  .button {
    color: $primary;
  }
</style>
```

### 5. TypeScript Support

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### 6. Plugin System

```javascript
// Custom plugin example
function myPlugin() {
	return {
		name: 'my-plugin',

		// Called when server starts
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				// Custom middleware
				next();
			});
		},

		// Transform code
		transform(code, id) {
			if (id.endsWith('.custom')) {
				return {
					code: transformCustom(code),
					map: null
				};
			}
		},

		// Handle HMR
		handleHotUpdate({ file, server }) {
			if (file.endsWith('.custom')) {
				server.ws.send({
					type: 'custom',
					event: 'custom-update',
					data: { file }
				});
			}
		}
	};
}
```

## API Reference

### Config Options

```javascript
export default defineConfig({
	// Project root
	root: process.cwd(),

	// Base public path
	base: '/',

	// Mode
	mode: 'development',

	// Define global constants
	define: {
		__APP_VERSION__: JSON.stringify('1.0.0')
	},

	// Plugins
	plugins: [],

	// Public dir
	publicDir: 'public',

	// Cache dir
	cacheDir: 'node_modules/.vite',

	// Server specific
	server: {
		host: 'localhost',
		port: 5173,
		strictPort: false,
		https: false,
		open: false,
		proxy: {
			'/api': {
				target: 'http://jsonplaceholder.typicode.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		},
		cors: true,
		headers: {},
		hmr: {
			protocol: 'ws',
			host: 'localhost',
			port: 5173,
			clientPort: 5173,
			overlay: true
		},
		watch: {
			ignored: ['!**/node_modules/**']
		},
		middlewareMode: false,
		fs: {
			strict: true,
			allow: ['..'],
			deny: ['.env', '.env.*', '*.pem']
		}
	},

	// Build specific
	build: {
		target: 'modules',
		outDir: 'dist',
		assetsDir: 'assets',
		assetsInlineLimit: 4096,
		cssCodeSplit: true,
		sourcemap: false,
		rollupOptions: {},
		commonjsOptions: {},
		dynamicImportVarsOptions: {},
		lib: false,
		manifest: false,
		ssrManifest: false,
		ssr: false,
		minify: 'esbuild',
		terserOptions: {},
		write: true,
		emptyOutDir: true,
		copyPublicDir: true,
		reportCompressedSize: true,
		chunkSizeWarningLimit: 500,
		watch: null
	},

	// Preview specific
	preview: {
		host: 'localhost',
		port: 4173,
		strictPort: false,
		https: false,
		open: false,
		proxy: {},
		cors: true,
		headers: {}
	},

	// Dep optimization
	optimizeDeps: {
		entries: [],
		exclude: [],
		include: [],
		esbuildOptions: {}
	},

	// SSR specific
	ssr: {
		external: [],
		noExternal: [],
		target: 'node'
	}
});
```

### JavaScript API

```javascript
import { createServer, build, preview } from 'vite';

// Dev server
const server = await createServer({
	// config options
});
await server.listen();
server.printUrls();
server.bindCLIShortcuts({ print: true });

// Build
await build({
	// config options
});

// Preview
const previewServer = await preview({
	// config options
});
previewServer.printUrls();
```

## Code Examples

### Multi-Page App

```javascript
// vite.config.js
export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				main: '/index.html',
				admin: '/admin/index.html',
				user: '/user/index.html'
			}
		}
	}
});
```

### Library Mode

```javascript
// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'lib/main.js'),
			name: 'MyLib',
			fileName: 'my-lib'
		},
		rollupOptions: {
			external: ['vue'],
			output: {
				globals: {
					vue: 'Vue'
				}
			}
		}
	}
});
```

### Environment Variables

```javascript
// .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App

// Usage
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.VITE_APP_TITLE)
console.log(import.meta.env.MODE)
console.log(import.meta.env.DEV)
console.log(import.meta.env.PROD)
console.log(import.meta.env.SSR)
```

### Custom HMR

```javascript
// store.js
let callbacks = [];

export function onChange(cb) {
	callbacks.push(cb);
}

export function notify() {
	callbacks.forEach((cb) => cb());
}

if (import.meta.hot) {
	import.meta.hot.accept((newModule) => {
		// Preserve callbacks through HMR
		callbacks = newModule.callbacks || callbacks;
	});

	import.meta.hot.dispose(() => {
		// Cleanup
	});

	import.meta.hot.data.callbacks = callbacks;
}
```

### Glob Import

```javascript
// Import all modules in a directory
const modules = import.meta.glob('./dir/*.js');

// Eager import
const modules = import.meta.glob('./dir/*.js', { eager: true });

// Import as strings
const modules = import.meta.glob('./dir/*.js', { as: 'raw' });

// Custom queries
const modules = import.meta.glob('./dir/*.js', {
	query: { foo: 'bar', bar: true }
});

// Named imports
const modules = import.meta.glob('./dir/*.js', {
	import: 'setup'
});

// Negative patterns
const modules = import.meta.glob(['./dir/*.js', '!**/bar.js']);
```

## Best Practices

### 1. Performance Optimization

- Use dynamic imports for code splitting
- Leverage browser caching with proper asset naming
- Optimize dependencies with `optimizeDeps`
- Use `build.rollupOptions.output.manualChunks` for vendor splitting

### 2. Development Experience

- Configure aliases for cleaner imports
- Use environment variables for configuration
- Set up proper TypeScript configuration
- Enable source maps for debugging

### 3. Production Build

- Enable minification and compression
- Generate manifest for backend integration
- Configure proper base path for deployment
- Use build.watch for continuous building

### 4. Security

- Configure `server.fs.deny` for sensitive files
- Use HTTPS in development when needed
- Set proper CORS headers
- Validate environment variables

## Troubleshooting

### Common Issues

1. **"Failed to resolve module"**
   - Check import paths and extensions
   - Verify alias configuration
   - Ensure dependencies are installed

2. **HMR not working**
   - Check if behind a proxy
   - Verify WebSocket connection
   - Ensure import.meta.hot guards

3. **Build errors**
   - Clear cache: `rm -rf node_modules/.vite`
   - Check for circular dependencies
   - Verify TypeScript configuration

4. **Large bundle size**
   - Analyze with `rollup-plugin-visualizer`
   - Check for unintended dependencies
   - Configure proper externals

### Debugging Tips

```javascript
// Enable debug logging
DEBUG=vite:* vite

// Specific namespaces
DEBUG=vite:deps vite
DEBUG=vite:transform vite
DEBUG=vite:hmr vite
```

## Quick Reference

### CLI Commands

```bash
vite                    # Start dev server
vite build              # Build for production
vite preview            # Preview production build
vite optimize           # Pre-optimize dependencies
```

### Import Queries

```javascript
// URL imports
import assetUrl from './asset.js?url';

// Raw imports
import assetString from './shader.glsl?raw';

// Worker imports
import Worker from './worker.js?worker';

// Inline workers
import InlineWorker from './worker.js?worker&inline';

// Base64 inline
import base64 from './asset.js?inline';
```

### Special Variables

```javascript
import.meta.url; // Full URL of current module
import.meta.env; // Environment variables
import.meta.hot; // HMR API
import.meta.glob; // Glob imports
```
