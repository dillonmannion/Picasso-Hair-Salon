# -------- REPO IS NOT UPDATE TO DATE WITH LOCAL CHANGES (DIR CLEAN UP + REFACTORING) --------

# Picasso Hair Salon - SvelteKit Application

A modern hair salon booking application built with SvelteKit, TypeScript, and modern web technologies.

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Continuous Integration (CI) Pipeline

This project includes a comprehensive GitHub Actions CI pipeline that ensures code quality and technical soundness. The pipeline automatically runs on every push to the `main` branch and on all pull requests targeting `main`.

### Pipeline Overview

The CI pipeline is designed to maintain high code quality standards and catch issues early in the development process. It performs the following critical checks:

### Pipeline Steps

1. **Code Checkout**: Retrieves the latest code from the repository
2. **Node.js Setup**: Configures Node.js 20.x with npm caching for faster builds
3. **Dependency Caching**: Caches `node_modules` based on `package-lock.json` to speed up subsequent runs
4. **Dependency Installation**: Installs project dependencies using `npm ci` for reliable, clean installs
5. **Code Linting**: Runs ESLint to enforce coding standards and catch potential errors
6. **Format Checking**: Uses Prettier to ensure consistent code formatting across the project
7. **Type Checking**: Performs TypeScript and Svelte type checking to catch type-related issues
8. **Production Build**: Compiles the application to ensure it builds without errors
9. **Test Execution**: Runs all automated tests including unit tests (Vitest) and end-to-end tests (Playwright)

### Why Each Step Matters

- **Linting**: Catches common programming errors, enforces consistent coding style, and identifies potential security issues
- **Format Checking**: Ensures all code follows consistent formatting rules, improving readability and reducing merge conflicts
- **Type Checking**: Leverages TypeScript's static analysis to catch type errors before runtime, improving code reliability
- **Build Verification**: Confirms the application compiles successfully for production deployment
- **Testing**: Validates that all features work as expected and prevents regressions

This automated pipeline ensures that every code change maintains the project's technical standards and reduces the likelihood of bugs reaching production.
