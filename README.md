# christieyu.com

Personal portfolio foundation built with Next.js 16 App Router, Sanity CMS, and Cloudinary media.

This repository contains the **architecture foundation** — data layers, content models, API routes, accessibility scaffolding, and minimal page shells. Final visual design will be implemented from Figma specs in a later pass.

## Stack

| Package     | Version |
| ----------- | ------- |
| Next.js     | 16.2.12 |
| React       | 19.2.4  |
| TypeScript  | 5.x     |
| Sanity      | 6.x     |
| next-sanity | 13.x    |
| Zod         | 4.x     |
| Vitest      | 4.x     |
| Prettier    | 3.x     |

No Tailwind. Minimal temporary CSS lives in `src/styles/`.

## Prerequisites

- Node.js 20+
- npm
- (Optional) Sanity project and dataset
- (Optional) Cloudinary account
- (Optional) Vercel project for deployment

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site builds and runs **without credentials**. Pages show empty states until Sanity content is connected.

## Environment variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
NEXT_PUBLIC_SANITY_API_VERSION=
SANITY_API_READ_TOKEN=
SANITY_PREVIEW_SECRET=
SANITY_REVALIDATE_SECRET=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

NEXT_PUBLIC_SITE_URL=
```

### Variable groups

| Variable                            | Scope  | Required for local dev        | Required for production |
| ----------------------------------- | ------ | ----------------------------- | ----------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`     | Public | No (empty states)             | Yes                     |
| `NEXT_PUBLIC_SANITY_DATASET`        | Public | No                            | Yes                     |
| `NEXT_PUBLIC_SANITY_API_VERSION`    | Public | No (defaults to `2024-01-01`) | Recommended             |
| `SANITY_API_READ_TOKEN`             | Server | No                            | Yes (preview)           |
| `SANITY_PREVIEW_SECRET`             | Server | No                            | Manual preview URLs     |
| `SANITY_REVALIDATE_SECRET`          | Server | No                            | Yes (webhooks)          |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Public | No                            | Yes (media URLs)        |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY`    | Public | No                            | Upload widgets          |
| `CLOUDINARY_API_KEY`                | Server | No                            | Server uploads / sign   |
| `CLOUDINARY_API_SECRET`             | Server | No                            | Server uploads / sign   |
| `NEXT_PUBLIC_SITE_URL`              | Public | No (defaults to localhost)    | Yes                     |

Helpers in `src/lib/env.ts`:

- `isSanityConfigured()`
- `isCloudinaryConfigured()`
- `isPreviewConfigured()`
- `isRevalidateConfigured()`

Secrets are never exposed to client bundles.

## Project structure

```
src/
├── app/                  # Routes, API handlers, metadata
├── components/           # Presentational UI (no data fetching)
├── sanity/               # Schemas, queries, client, fetch layer
├── cloudinary/           # URL builder and transforms
├── lib/                  # Env, metadata, slugs, revalidation
├── styles/               # Global, focus, reduced-motion CSS
├── types/                # Shared TypeScript types
└── fonts/                # Font placeholder (system fallbacks)
```

## Sanity CMS

### Content types

- **portfolioPost** — work case studies with portable body blocks
- **photoAlbum** — ordered Cloudinary photo collections
- **siteSettings** — singleton for navigation, SEO defaults, contact, resume

### Body blocks (portfolio)

`block`, `imageGallery`, `singleMedia`, `cloudinaryAlbumRef`, `pullQuote`, `projectFacts`, `projectMetrics`, `prototypeEmbed`, `twoColumnEditorial`, `beforeAfterComparison`

### Studio

Standalone Studio lives in the sibling folder `studio-christieyu.com` (not embedded in Next.js).

```bash
cd ../studio-christieyu.com
npm run dev   # http://localhost:3333
```

Content types (source of truth in the Studio repo):

- `portfolioPost`, `photoAlbum`, `siteSettings` (+ portable body blocks)

Config:

- `studio-christieyu.com/sanity.config.ts`
- `studio-christieyu.com/sanity.cli.ts`
- `studio-christieyu.com/schemaTypes/`
- `studio-christieyu.com/structure.ts` (siteSettings singleton)

Set `NEXT_PUBLIC_SANITY_PROJECT_ID=g25dm52w` and `NEXT_PUBLIC_SANITY_DATASET=production` in the Next app `.env.local`.

### Data access

All GROQ lives in `src/sanity/queries/`. Fetch functions in `src/sanity/lib/fetch.ts`:

- `getSiteSettings`
- `getFeaturedPortfolioPosts`
- `getPortfolioPosts`
- `getPortfolioPostBySlug`
- `getPortfolioPostSlugs`
- `getPhotoAlbums`
- `getPhotoAlbumBySlug`
- `getPhotoAlbumSlugs`

Returns empty arrays or defaults when Sanity is not configured.

## Draft mode & preview

Requires `SANITY_API_READ_TOKEN`. Two entry paths:

**Sanity Presentation / preview-url-secret** (Studio Presentation tool):

```
GET /api/draft-mode/enable
```

Configure in the standalone Studio via `presentationTool({ previewUrl: { … } })` in `studio-christieyu.com/sanity.config.ts`.

**Manual shared-secret preview** (requires `SANITY_PREVIEW_SECRET`):

```
GET /api/draft-mode/enable?secret=<SANITY_PREVIEW_SECRET>&redirect=/work/my-slug
```

Disable and redirect:

```
GET /api/draft-mode/disable?redirect=/
```

When credentials are missing, enable returns `503`. Invalid manual secrets return `401`. Build does not fail.

## Revalidation webhook

```
POST /api/revalidate
Header: x-sanity-revalidate-secret: <SANITY_REVALIDATE_SECRET>
Body: { "_type": "portfolioPost", "slug": { "current": "my-project" } }
```

Revalidates paths based on document type:

| Type            | Paths                            |
| --------------- | -------------------------------- |
| `portfolioPost` | `/`, `/work`, `/work/[slug]`     |
| `photoAlbum`    | `/`, `/photos`, `/photos/[slug]` |
| `siteSettings`  | `/`, all main pages              |

Configure a Sanity webhook pointing to this endpoint in production.

## Cloudinary

Delivery uses Cloudinary CDN URLs via `src/cloudinary/lib/url.ts` (cloud name from `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`).

- Studio picks assets with `sanity-plugin-cloudinary` (`cloudinary.asset` nested under our `cloudinaryAsset` object)
- `MediaRenderer` uses plain `<img>` for Cloudinary URLs (not Next.js Image optimizer)
- Server Admin SDK: `src/cloudinary/lib/admin.ts`
- Signed upload helper: `POST /api/cloudinary/sign` (for `next-cloudinary` upload widgets)
- API secret stays server-side only; API key may also be exposed as `NEXT_PUBLIC_CLOUDINARY_API_KEY` for client upload widgets
- `next.config.ts` includes `res.cloudinary.com` in `images.remotePatterns`

On first Studio launch after installing the plugin, open any Cloudinary field and configure the cloud name + API key when prompted (stored as a private dataset document).

## Fonts

Place files in:

- `public/fonts/manrope/`
- `public/fonts/switzer/`
- `public/fonts/tabular/`

`src/fonts/local.ts` loads Manrope SemiBold, Switzer Regular/Medium, and Tabular Regular via `next/font/local`. Figma color/type tokens live in `src/styles/tokens.css`.

## Homepage featured photos

The hero image, caption, and date are chosen at random on each request from `FEATURED_PHOTO_POOL` in `src/content/featured-photos.ts`.

```ts
{
  id: "puffins-iceland",
  src: "/images/featured/puffins-iceland.jpg", // or Cloudinary public ID
  provider: "local", // or "cloudinary"
  alt: "...",
  caption: "puffins in iceland",
  dateLabel: "07.2026",
}
```

Helpers are in `src/lib/featured-photos.ts`. Add pool entries as photos become available; later this can be Sanity + Cloudinary driven without changing `HomeHero`.

## Routes

| Route            | Purpose                 |
| ---------------- | ----------------------- |
| `/`              | Home (Figma homepage)   |
| `/work`          | Portfolio index         |
| `/work/[slug]`   | Case study detail       |
| `/photos`        | Photo albums index      |
| `/photos/[slug]` | Album detail            |
| `/about`         | About shell             |
| `/resume`        | Resume shell            |
| `/contact`       | Contact shell           |

Also: `sitemap.ts`, `robots.ts`, `loading.tsx`, `not-found.tsx`.

## SEO

`src/lib/metadata.ts` provides `buildMetadata()` and `resolveMetadata()`. Each page exports `generateMetadata`. Canonical URLs use `NEXT_PUBLIC_SITE_URL`.

## Accessibility

- Skip link to `#main-content`
- Landmarks: `header`, `nav`, `main`, `footer`
- Focus-visible styles in `src/styles/focus.css`
- Reduced motion in `src/styles/reduced-motion.css`
- `PhotoLightbox` typed placeholder with `role="dialog"` architecture

## Figma implementation (future)

Current shells are intentionally minimal. When Figma specs are available:

1. Map components to `src/components/layout`, `content`, `media`, `ui`
2. Replace temporary CSS in `src/styles/`
3. Do not invent design when specs are missing
4. Preserve data-driven architecture and accessibility landmarks

See `.cursor/rules/figma-implementation.mdc`.

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run format       # Prettier write
npm run format:check # Prettier check
npm run typecheck    # TypeScript
npm run test         # Vitest
npm run test:watch   # Vitest watch
npm run validate     # format:check + lint + typecheck + test
```

## Vercel deployment

1. Connect the repository
2. Set environment variables from `.env.example`
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain
4. Configure Sanity webhook → `POST /api/revalidate`
5. Configure Sanity preview URL → `/api/draft-mode/enable`

## What works without credentials

- `npm run dev`, `npm run build`, `npm run test`, `npm run validate`
- All routes render with empty states when content is missing
- Draft mode and revalidate endpoints return `503` without secrets

## What requires credentials

- Live Sanity content
- Draft preview mode
- On-demand revalidation webhook
- Cloudinary image URLs (without cloud name, images show unavailable placeholders)

## Cursor rules

Architecture, content modeling, accessibility, code quality, and Figma guidance live in `.cursor/rules/*.mdc`.

## License

Private — personal portfolio.
