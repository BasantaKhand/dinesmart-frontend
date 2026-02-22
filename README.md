## DineSmart POS Client

Restaurant Management System landing page built with Next.js App Router.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The app entry page is `app/page.tsx`, which composes the feature module in `features/landing`.

## Folder Architecture

```text
app/
	globals.css
	layout.tsx
	page.tsx
features/
	landing/
		components/
			landing-page.tsx
			sections/
				hero-section.tsx
				features-section.tsx
				contact-section.tsx
		data/
			features.ts
public/
```

## Notes

- Development indicator bubble is disabled via `next.config.ts`.
- Removed default starter SVG assets from `public/`.

## Build

```bash
npm run build
```
