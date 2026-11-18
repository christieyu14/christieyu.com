# christieyu.com

Personal portfolio foundation built with Next.js 16 App Router, Sanity CMS, and Cloudinary media.

The visual design is implemented from the Figma file `personal` (section "New draft").

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

No Tailwind. Plain CSS lives in `src/styles/` (tokens in `tokens.css`, type utilities in `typography.css`, one file per page).

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

RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
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
| `RESEND_API_KEY`                    | Server | No (contact form returns 503) | Yes (contact form)      |
| `CONTACT_TO_EMAIL`                  | Server | No                            | Yes (contact form)      |
| `CONTACT_FROM_EMAIL`                | Server | No                            | Yes (contact form)      |

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
├── cloudinary/           # URL builder and hero album (Admin API)
├── content/              # Static content (ASCII art)
├── lib/                  # Env, metadata, slugs, revalidation, contact
├── styles/               # Tokens, typography, per-page CSS
├── types/                # Shared TypeScript types
└── fonts/                # next/font/local definitions
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
- `getPortfolioPosts`
- `getPortfolioPostBySlug`
- `getPortfolioPostSlugs`
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
GET /api/draft-mode/enable?secret=<SANITY_PREVIEW_SECRET>&redirect=/portfolio/my-slug
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

| Type            | Paths                             |
| --------------- | --------------------------------- |
| `portfolioPost` | `/portfolio`, `/portfolio/[slug]` |
| `photoAlbum`    | `/photos`, `/photos/[slug]`       |
| `siteSettings`  | `/`, all main pages               |

Configure a Sanity webhook pointing to this endpoint in production.

## Cloudinary

Delivery uses Cloudinary CDN URLs via `src/cloudinary/lib/url.ts` (cloud name from `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`).

- Studio picks assets with `sanity-plugin-cloudinary` (`cloudinary.asset` nested under our `cloudinaryAsset` object)
- `MediaRenderer` uses plain `<img>` for Cloudinary URLs (not Next.js Image optimizer)
- Server Admin SDK: `src/cloudinary/lib/admin.ts`
- Signed upload helper: `POST /api/cloudinary/sign`
- Home and resume backgrounds are picked at random from the Cloudinary `hero` folder (`src/cloudinary/lib/hero-album.ts`); each image needs `caption` and `date` context metadata
- API secret stays server-side only; API key may also be exposed as `NEXT_PUBLIC_CLOUDINARY_API_KEY` for client upload widgets
- `next.config.ts` includes `res.cloudinary.com` in `images.remotePatterns`

On first Studio launch after installing the plugin, open any Cloudinary field and configure the cloud name + API key when prompted (stored as a private dataset document).

## Fonts

`src/fonts/local.ts` loads, via `next/font/local`:

- Switzer Regular and Bold (`public/fonts/switzer/`) for all text. Body copy is Regular; links are Bold and underlined; card titles are Bold uppercase.
- Inconsolata variable (`public/fonts/inconsolata/`) for the portfolio ASCII art only.

Figma color/type tokens live in `src/styles/tokens.css`.

## Contact form

`POST /api/contact` validates with Zod, drops honeypot submissions, rate-limits per IP (best effort, in memory), and sends through Resend using the published template `contact-form` (variables `SENDER_NAME`, `SENDER_EMAIL`, `MESSAGE`). The visitor's address is set as reply-to. Each variable is capped at 2,000 characters by Resend, so messages are limited to 2,000 characters.

Use a **sending-only** Resend API key restricted to `christieyu.com`. Without the three env vars the endpoint returns `503`.

## Routes

| Route                    | Purpose                                |
| ------------------------ | -------------------------------------- |
| `/`                      | Home                                   |
| `/portfolio`             | Portfolio index (ASCII header + cards) |
| `/portfolio/[slug]`      | Case study detail                      |
| `/photos`                | Photo album (Cloudinary `hero` folder) |
| `/photos/tags/[tagSlug]` | Photos by tag                          |
| `/photos/[slug]`         | Sanity album detail                    |
| `/resume`                | Resume (Adobe PDF Embed)               |
| `/contact`               | Contact form                           |

`/work` and `/work/[slug]` permanently redirect to `/portfolio`; `/about` redirects to `/`.

Also: `sitemap.ts`, `robots.ts`, `loading.tsx`, `not-found.tsx`.

## SEO

`src/lib/metadata.ts` provides `buildMetadata()` and `resolveMetadata()`. Each page exports `generateMetadata`. Canonical URLs use `NEXT_PUBLIC_SITE_URL`.

## Accessibility

- Skip link to `#main-content`
- Landmarks: `header`, `nav`, `main`, `footer`
- Focus-visible styles in `src/styles/focus.css`
- Reduced motion in `src/styles/reduced-motion.css`
- Contact message resize handle is a keyboard-operable `separator` (arrow keys)

## Figma implementation

1. Map components to `src/components/layout`, `content`, `media`, `ui`
2. Do not invent design when specs are missing
3. Preserve data-driven architecture and accessibility landmarks

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
