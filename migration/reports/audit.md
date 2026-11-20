# Adobe Portfolio audit

Archived on 2026-11-19 from the public site at `https://christieyu.com`. Nothing was uploaded to Sanity or Cloudinary, and the new Next.js app was not changed.

Revised on 2026-11-19 to narrow the migration. The raw archive is unchanged. The import covers 11 Portfolio projects only.

Adobe Portfolio has no public content API. The archive is the published HTML, the site CSS, and the highest-resolution image URL that HTML exposes for each placement. Raw HTML and image files are on disk and gitignored. Structured copies are kept.

| Path | What it is |
| --- | --- |
| `migration/extracted/raw/` | Sitemap, page HTML, site CSS |
| `migration/extracted/assets/` | 219 downloaded images, grouped by page |
| `migration/extracted/pages/` | One JSON and one Markdown file per URL |
| `migration/extracted/site.json` | Navigation, page kinds, module counts |
| `migration/extracted/asset-inventory.json` | Every image placement, source URL, local path, bytes, crop |
| `migration/scripts/extract-adobe-portfolio.mjs` | Repeatable extractor |

Re-run the extractor from the repo root with `node migration/scripts/extract-adobe-portfolio.mjs`.

## Scope

Import these 11 projects, in the published Portfolio order:

| Slug | Title | Date | Custom field | Body |
| --- | --- | --- | --- | --- |
| `gridify` | Gridify: Leading design for a startup | 01/2025 | Gridify (Remote) | 29 images, 1 Scribd embed |
| `generative-ai` | Generative AI at Lenovo | 11/2024 | Lenovo (Chicago/Remote) | Card copy archived. Body still to extract |
| `red-velvet` | Now baking... Red Velvet! | 06/2024 | Lenovo (Chicago/Remote) | 23 images, 10 captions |
| `cake` | Architecting Cake | 10/2023 | Lenovo (Chicago/Remote) | 28 images, 1 caption |
| `artmiesa` | @artmiesa on Instagram | 08/2022 | Digital space | Instagram embed only |
| `senior-thesis-computer-science` | Senior thesis: Computer Science | 05/2022 | Yale University | Long text, 16 images, 9 captions |
| `senior-thesis-english` | Senior thesis: English | 05/2022 | Yale University | 1 image, 1 Scribd embed |
| `amoriem-labs` | Directing Amoriem Labs | 04/2022 | Yale University | 17 images, 6 captions, 7 GIFs |
| `yale-daily-news` | Producing the Yale Daily News | 12/2021 | Yale University | 30 images, 6 captions |
| `teaching-cs50` | Teaching CS50 | 12/2021 | Yale University | 12 images, no caption elements |
| `mskcc` | Tech incubation at MSKCC | 08/2021 | MSKCC (New York City) | 24 images, 8 captions |

The custom field is Adobe's `custom1` value, copied as published. Card descriptions are in the page JSON.

Out of scope, even though the sitemap and raw archive still contain them:

- Other projects: `drassomai`, `student-technology-collaborative`, `certik`, `mt-law-llc`, `broad-institute-of-mit-and-harvard`, `for-fun`, and `/other-projects`.
- Contact and Resume. The Next.js app already has those pages.
- The Adobe menu, social links, and site keyword string.
- Adobe cover crops. Index cards keep the React Bits dither in `src/components/content/PortfolioCard.tsx` until covers are uploaded. `coverMedia` stays empty.

`/generative-ai` is in scope. The public HTML is only a password form (`page id p67d74125d2aec6def9d467d2c99db7949281660980e53a77fd42a`). The password was provided for the next extract. It is not written here. After that extract, the project is a normal public case study. The new site does not get a password gate.

## What the three case studies contain

`/gridify`, `/yale-daily-news`, and `/red-velvet` use the same module stack as the other in-scope projects.

Gridify opens with a full-width image, the heading "Building Gridify: driving brand and product strategy from day one", then paragraphs, image rows, a second heading "Building a brand from nothing", and a Scribd slideshow. It has no elements with `class="caption"`. Nearby paragraphs are body copy.

Yale Daily News opens with an image, the heading "Production and Design at the Yale Daily News", then alternating images, image rows, and captions. A later heading is "Rethinking \"Digital\" at the Yale Daily News". Captions include the production-night photo, the commencement covers, the A-section workflow, section graphics, the mayoral-race graphics, and the SJP poster. Body links: the SPJ award page, and a commencement PDF on GitHub.

Red Velvet opens with the heading "Now baking... Red Velvet!", paragraphs, images, and captions, then "Red Velvet use case 1: Lenovo Device Manager" and "Red Velvet use case 2: Classroom Companion". Ten captions sit directly after an image or an image row. One body link goes to Lenovo Device Manager.

## Content patterns

Project pages are one vertical stack of `text`, `image`, `media_collection`, and `embed`.

- A text module is a `div.title` (section heading), a plain `div` (paragraph), or a `div.caption`.
- An image module is one image. A media collection is one horizontal row, in source order.
- The 11 projects contain 40 caption modules. Each one is the text module immediately after an image or a row. A row caption belongs to the row, not to the last image. Pages without `class="caption"` keep the nearby text as paragraphs.
- Inline font-size and line-height spans in the computer-science bibliography are editor styling, not a separate content type.

Page formatting is deferred. The first build is a readable project page in the current site type: Switzer at 14px, `--type-md-size` in `src/styles/tokens.css`. Do not recreate the Adobe typeface (`tscy`), the Adobe sidebar, or the Adobe card layout.

## Embeds

Leave Scribd and Instagram as remote iframes. Do not download the documents or posts. Use the frame size from the archived HTML.

| Page | URL | Frame |
| --- | --- | --- |
| `gridify` | `https://www.scribd.com/embeds/839917575/content?start_page=1&view_mode=slideshow&access_key=key-iOIM3C0IwWyVWa5Oy3ZW` | max-width 100%, height 1000px |
| `senior-thesis-english` | `https://www.scribd.com/embeds/839714534/content?start_page=1&view_mode=slideshow&access_key=key-5JXu0aBqgWUYVsUXbev3` | max-width 100%, height 1000px |
| `artmiesa` | `https://www.instagram.com/artmiesa/embed/` | 800px square |

## Assets in scope

The download has 230 placements and 219 unique files (141.9 MB): 118 PNG, 94 JPEG, 7 GIF. The import uses body images from the 11 projects only.

- Single-image modules that exposed a lightbox original use that file. Example: the first Gridify image is 2,751,939 bytes as the lightbox original and 1,878,535 bytes as `_rw_1920`.
- Row images use the largest published `srcset` entry. The unsuffixed original is not public.
- Skip every `_rwc_` cover crop. Covers are not imported.
- Skip images that belong only to Other projects.
- The seven GIFs are on `amoriem-labs`. Keep them as GIFs so the animation survives. Do not flatten them to stills.
- No content image has alt text in the HTML. During transform, generate alt from the caption on the following module. If that module is not a caption, use the nearest paragraph. Do not leave alt blank, and do not block the import on hand-written alt.

Upload the chosen files to Cloudinary, one id per unique source URL, matching `cloudinaryAsset`. Do not point production documents at `cdn.myportfolio.com`.

## Sanity model

One `portfolioPost` per project. Suggested `_id`: `portfolioPost.{adobePageId}`, so a re-run replaces the same record. Slugs stay the public slugs.

Fields to fill:

- `title`
- `slug`
- `summary` from the gallery description
- `dateLabel` as the published `MM/YYYY` string. Do not invent `publishedAt` or `projectYear` from it.
- `contextLabel` from `custom1`, kept as one string. Do not split it into `client` and `location`.
- `sortOrder` from the table above
- SEO title and description from the page `<title>` and meta description
- Migration metadata: source `adobe-portfolio`, Adobe page id, legacy path

`coverMedia` stays empty until covers are uploaded.

Body, in published order:

- Headings and paragraphs, with links as annotations.
- `caption` as its own block immediately after the media it describes.
- `singleMedia` for one image, including GIFs.
- `imageGallery` for one media-collection row.
- `embed` for Scribd and Instagram, storing the URL plus the width and height above.

The current `portfolioPost` schema already has title, slug, summary, cover, and a body array. These pages do not have structured values for `role`, `duration`, `disciplines`, `projectFacts`, `projectMetrics`, `pullQuote`, `twoColumnEditorial`, or `beforeAfterComparison`. Leave those unused. Do not add a password field or a second gallery.

`siteSettings` is unchanged. Do not import the Adobe nav, contact form, or resume embed.

## Next.js

Formatting comes later. The first website pass renders the 11 documents with the existing type and leaves `PortfolioCard` as it is. With `coverMedia` empty, the card already shows the React Bits dither.

New rendering, only as needed to show the body:

- `ProjectBody` for the ordered blocks.
- Portable Text for headings, paragraphs, and links, at Switzer 14px.
- `ProjectFigure` for one image.
- `ProjectImageRow` for a media collection.
- `ProjectCaption` under a figure or a row.
- `ProjectEmbed` for the Scribd and Instagram frames above.

Do not add a contact form, a new nav, or a password gate. Keep the Studio in `studio-christieyu.com`.

## Still unresolved inside the 11 projects

1. **MSKCC PDF links** point at `fiddle.jshell.net` paths such as `/_display/images/mskcc/group_ppt.pdf`. That is what the live HTML contains. Check those files during transform and replace them if they do not resolve.
2. **Computer-science bibliography.** Some long URLs are split across adjacent `<a>` tags. Each href is complete; the visible text is a fragment. Join those while converting to Portable Text.

## Migration steps

1. **Extract.** Body images and text for 10 projects are already in `migration/extracted`. On the next pass, unlock `/generative-ai` with the provided password and add that page to the archive. Do not import the password-form HTML as the case study.
2. **Transform.** Read the 11 page files and emit Sanity NDJSON. Ids from the Adobe page id. Body order preserved. Captions stay their own blocks. Scribd and Instagram stay embed URLs with the frame sizes above. Generate alt text as described. Keep GIFs as GIFs. Omit cover images. Log the MSKCC links and the split bibliography anchors.
3. **Assets.** Upload in-scope body images to Cloudinary. One id per unique source URL. Do not upload cover crops or Other-project files.
4. **Load.** Import into dataset `production` on project `hjf5x3d3` after review, with `createOrReplace`. Deploy schema for `dateLabel`, `contextLabel`, `sortOrder`, and `embed` before import.
5. **Validate.** 11 documents, the slugs in the table, image counts matching this report, every caption still immediately after its media block, embeds still remote, `coverMedia` empty, GIFs still GIFs.
6. **Cutover.** Serve the 11 slugs from the Next.js app. Page formatting stays for a later pass.

## Decisions

- Drop Other projects, Contact, Resume, and the Adobe nav.
- Leave index thumbnails on the current dither until covers are uploaded.
- Include Generative AI after the password extract. No password gate on the new site.
- Embed Scribd and Instagram at the archived frame sizes.
- Generate alt text from the following caption, otherwise the nearest paragraph.
- Keep the seven Amoriem Labs GIFs as animations.
- Set project body type in Switzer at 14px. Format the pages later.
- Keep `custom1` as one string.
- Keep captions as following blocks.
- Send body images to Cloudinary, not Sanity image assets.
