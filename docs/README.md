# Picasso Hair Salon - Dependencies Documentation

This directory contains comprehensive documentation for all dependencies used in the Picasso Hair Salon project. The documentation has been generated using context7 to ensure up-to-date information.

## Documentation Structure

### Core Frameworks

- **[SvelteKit](./SvelteKit/)** - Full-stack framework for building web applications
- **[Svelte](./Svelte.md)** - Component framework with compiler
- **[Vite](./Vite.md)** - Build tool and dev server
- **[TailwindCSS](./TailwindCSS.md)** - Utility-first CSS framework

### Backend & Services

- **[Supabase](./Supabase.md)** - Backend-as-a-service with PostgreSQL
- **[Stripe](./Stripe.md)** - Payment processing platform

### UI Components

- **[bits-ui](./bits-ui.md)** - Headless component library for Svelte
- **[lucide-svelte](./lucide-svelte.md)** - Icon library
- **[UI Components Misc](./ui-components-misc.md)** - Additional UI libraries (mode-watcher, svelte-sonner, embla-carousel, cmdk-sv)

### Testing

- **[Vitest](./Vitest.md)** - Unit testing framework
- **[Playwright](./Playwright.md)** - End-to-end testing framework

### Development Tools

- **[Development Tools](./development-tools.md)** - ESLint, Prettier, TypeScript, and utilities

## Quick Start

1. **New to the project?** Start with the [Learning Path](./learning-path.md)
2. **Looking for something specific?** Check the [Search Index](./search-index.md)
3. **Setting up development?** Follow the guides in order:
   - SvelteKit setup
   - Supabase configuration
   - Stripe integration
   - Testing setup

## Key Technologies

### Frontend Stack

- **Framework**: SvelteKit 2.22.0 + Svelte 5.34.7
- **Styling**: TailwindCSS 4.1.10
- **Build Tool**: Vite 6.3.5
- **Language**: TypeScript 5.7.3

### Backend Services

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **File Storage**: Supabase Storage

### Testing & Quality

- **Unit Tests**: Vitest 3.0.1
- **E2E Tests**: Playwright 1.49.1
- **Linting**: ESLint 9.17.0
- **Formatting**: Prettier 3.4.2

## Common Tasks

### Running Tests

```bash
pnpm test          # Run Vitest tests
pnpm test:e2e      # Run Playwright tests
pnpm test:unit:ui  # Open Vitest UI
```

### Code Quality

```bash
pnpm lint          # Run ESLint
pnpm format        # Format with Prettier
pnpm check         # Run svelte-check
```

### Development

```bash
pnpm dev           # Start dev server
pnpm build         # Build for production
pnpm preview       # Preview production build
```

## Documentation Generation

This documentation was generated using context7 to fetch the latest information for each dependency. To regenerate:

1. Each major dependency has context7 queries logged
2. Documentation follows a consistent format
3. Code examples are from official sources
4. Version numbers match package.json

## Contributing

When adding new dependencies:

1. Create documentation following the existing format
2. Include: Overview, Installation, Core Concepts, Examples
3. Add to appropriate section in this README
4. Update learning-path.md if it's a major dependency

## Resources

- [Project Repository](../)
- [Context7 Queries Log](./context7-queries.log)
- [Package.json](../package.json)
- [CLAUDE.md](../CLAUDE.md) - AI assistant instructions
