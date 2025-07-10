# Picasso Hair Salon

A modern web application built with SvelteKit 5, Supabase, and Vercel using Test-Driven Development practices.

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (Runes mode enabled)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel Edge Functions
- **Package Manager**: pnpm v10.12.1
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Language**: TypeScript

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 10.0.0
- Docker (for local Supabase development)

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd picasso-hair-salon
pnpm install
```

### 2. Environment Setup

Create a `.env` file:

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup

```bash
# Start Supabase locally (requires Docker)
pnpm db:start

# Run database migrations
pnpm db:migrate

# Generate TypeScript types from database schema
pnpm db:types
```

### 4. Start Development

```bash
pnpm dev
```

Visit [http://localhost:5173](http://localhost:5173)

## Available Scripts

### Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally

### Testing

- `pnpm test` - Run all tests
- `pnpm test:unit` - Run unit tests
- `pnpm test:unit:watch` - Run unit tests in watch mode (TDD workflow)
- `pnpm test:e2e` - Run E2E tests with Playwright
- `pnpm test:coverage` - Generate test coverage report

### Database

- `pnpm db:start` - Start Supabase locally
- `pnpm db:stop` - Stop local Supabase
- `pnpm db:reset` - Reset database to initial state
- `pnpm db:migrate` - Run database migrations
- `pnpm db:types` - Generate TypeScript types from Supabase

### Code Quality

- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm check` - Type check with TypeScript

## Project Structure

```
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable Svelte components
│   │   ├── stores/        # Svelte stores for state management
│   │   ├── utils/         # Utility functions
│   │   └── supabase.ts    # Supabase client initialization
│   ├── routes/            # SvelteKit routes and pages
│   ├── hooks.server.ts    # Server hooks for auth
│   ├── hooks.client.ts    # Client hooks
│   ├── app.d.ts          # TypeScript app definitions
│   └── app.html          # HTML template
├── supabase/
│   ├── migrations/        # Database migrations
│   └── config.toml       # Supabase local config
├── tests/
│   └── e2e/              # End-to-end tests
├── static/               # Static assets
├── svelte.config.js      # SvelteKit configuration
├── vite.config.ts        # Vite configuration
└── vitest.config.ts      # Vitest configuration
```

## Test-Driven Development

This project follows TDD practices:

1. **Write tests first** - Tests are written before implementation
2. **RED-GREEN-REFACTOR** cycle:
   - RED: Write a failing test
   - GREEN: Write minimal code to pass
   - REFACTOR: Improve code while keeping tests green
3. **Test files** are co-located with source files (`.test.ts` extension)
4. **Watch mode** for rapid feedback: `pnpm test:unit:watch`

### Testing Stack

- **Vitest**: Fast unit testing with jsdom environment
- **Playwright**: E2E testing across browsers
- **Coverage**: Configured to exclude config files and focus on application code

## Authentication

Authentication is handled by Supabase with server-side session management:

- Session validation in `src/hooks.server.ts`
- JWT validation using `safeGetSession` helper
- Protected routes check for authenticated users
- OAuth providers configurable in Supabase dashboard

## Deployment

### Vercel

The project is configured for Vercel deployment with Edge Functions:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy (automatic on push to main)

### CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:

- Node.js version matrix (18.x, 20.x)
- Linting and type checking
- Unit and E2E tests
- Build verification
- Supabase local testing

## Key Features

- **Svelte 5 Runes**: Modern reactive programming with `$state`, `$derived`, etc.
- **Server-Side Rendering**: Full SSR support with SvelteKit
- **Type Safety**: Full TypeScript support with generated Supabase types
- **Edge Deployment**: Optimized for Vercel Edge Functions
- **Real-time Ready**: Supabase real-time subscriptions support
- **Row Level Security**: Database-level security policies

## Performance Optimization

- **pnpm**: 3x faster installations with strict dependency management
- **Vite**: Lightning-fast HMR and builds
- **Edge Functions**: Globally distributed for low latency
- **Svelte Compilation**: No runtime overhead

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests first (TDD approach)
4. Implement your feature
5. Ensure all tests pass (`pnpm test`)
6. Commit your changes
7. Push to the branch
8. Open a Pull Request

## License

[Your License Here]
