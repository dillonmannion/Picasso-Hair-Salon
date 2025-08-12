
# Atelier — SvelteKit + Tailwind Starter

This repo mirrors the homepage layout you shared: split hero with overlay menu, serif display type, floating tool art, polaroid photos, and a 4×2 services grid with vertical guide lines.

## Quick start
```bash
pnpm i  # or npm i / bun install
pnpm dev
```

Open http://localhost:5173

## What’s inside
- **SvelteKit** (Svelte 5)
- **TailwindCSS** (via PostCSS)
- Global tokens & utilities in `src/app.css`
- Components in `src/lib`:
  - `Header.svelte`, `Footer.svelte`
  - `HeroSplit.svelte` (split hero w/ overlay menu + polaroid + floating art)
  - `SectionHeader.svelte`
  - `ServicesGrid.svelte` (4×2 grid; vertical line background)
- Homepage in `src/routes/+page.svelte`

## Assets
Place brand images in `static/images/` and update the file names if needed. Temporary placeholders are included.

## Fonts
Update `tailwind.config.cjs` fonts to match production (e.g., Cormorant/Playfair + Inter). Load via `<link rel="preconnect" href="https://fonts.googleapis.com">` etc., or self-host.
