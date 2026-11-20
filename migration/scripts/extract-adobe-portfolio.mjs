/**
 * Snapshot the public Adobe Portfolio site at christieyu.com.
 * Reads published HTML only. Does not write to Sanity or Cloudinary.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ORIGIN = "https://christieyu.com";
const ROOT = path.resolve(import.meta.dirname, "..", "..");
const OUT = path.join(ROOT, "migration", "extracted");
const RAW = path.join(OUT, "raw");
const ASSETS = path.join(OUT, "assets");
const PAGES = path.join(OUT, "pages");
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const fetchedAt = new Date().toISOString();

function decode(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function stripTags(html) {
  return decode(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(div|p|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function meta(html, key) {
  const property = html.match(
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
  );
  if (property) return decode(property[1]);
  const reversed = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${key}["']`, "i"),
  );
  return reversed ? decode(reversed[1]) : "";
}

function assetIdFromUrl(url) {
  const match = url.match(
    /\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:_[a-z0-9]+)?\.(\w+)/i,
  );
  if (!match) return null;
  return { id: match[1].toLowerCase(), ext: match[2].toLowerCase() };
}

function cropFromUrl(url) {
  const match = url.match(/_rwc_(-?\d+)x(-?\d+)x(\d+)x(\d+)x(\d+)\./);
  if (!match) return null;
  return {
    x: Number(match[1]),
    y: Number(match[2]),
    width: Number(match[3]),
    height: Number(match[4]),
    deliveredEdge: Number(match[5]),
  };
}

function bestPublicImage(chunk) {
  const lightbox = chunk.match(/class="js-lightbox"[^>]*data-src="([^"]+)"/);
  if (lightbox && !/_rwc?_/.test(lightbox[1])) {
    const url = decode(lightbox[1]);
    return {
      sourceUrl: url,
      variant: "lightbox-original",
      declaredWidth: null,
      crop: null,
    };
  }

  let best = null;
  const srcsets = [...chunk.matchAll(/(?:data-srcset|srcset)="([^"]+)"/g)].map((match) => match[1]);
  for (const srcset of srcsets) {
    for (const part of srcset.split(",")) {
      const bits = part.trim().split(/\s+/);
      if (!bits[0] || bits[0].startsWith("data:")) continue;
      const declaredWidth = bits[1] ? Number.parseInt(bits[1], 10) : 0;
      if (!best || declaredWidth > best.declaredWidth) {
        best = { sourceUrl: decode(bits[0]), declaredWidth };
      }
    }
  }
  if (best) {
    return {
      sourceUrl: best.sourceUrl,
      variant: /_rwc_/.test(best.sourceUrl) ? "cropped-derivative" : "largest-srcset",
      declaredWidth: Number.isFinite(best.declaredWidth) ? best.declaredWidth : null,
      crop: cropFromUrl(best.sourceUrl),
    };
  }

  const dataSrc = chunk.match(/data-src="(https:\/\/cdn\.myportfolio\.com[^"]+)"/);
  if (dataSrc) {
    const url = decode(dataSrc[1]);
    return {
      sourceUrl: url,
      variant: /_rwc_/.test(url) ? "cropped-derivative" : "data-src",
      declaredWidth: null,
      crop: cropFromUrl(url),
    };
  }
  return null;
}

function linksIn(html) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({
    href: decode(match[1]),
    text: stripTags(match[2]),
  }));
}

function topLevelDivs(html) {
  const marker = html.indexOf('class="rich-text');
  let cursor = marker < 0 ? 0 : html.indexOf(">", marker) + 1;
  const blocks = [];
  while (cursor < html.length) {
    const next = html.indexOf("<div", cursor);
    const close = html.indexOf("</div>", cursor);
    if (next < 0 || (close >= 0 && close < next)) break;
    const tagEnd = html.indexOf(">", next);
    const attrs = html.slice(next + 4, tagEnd);
    let depth = 1;
    let scan = tagEnd + 1;
    while (depth > 0 && scan < html.length) {
      const nextOpen = html.indexOf("<div", scan);
      const nextClose = html.indexOf("</div>", scan);
      if (nextClose < 0) return blocks;
      if (nextOpen >= 0 && nextOpen < nextClose) {
        depth += 1;
        scan = nextOpen + 4;
      } else {
        depth -= 1;
        if (depth === 0) {
          blocks.push({ attrs, html: html.slice(tagEnd + 1, nextClose) });
          cursor = nextClose + 6;
        } else {
          scan = nextClose + 6;
        }
      }
    }
  }
  return blocks;
}

function textBlocks(moduleHtml) {
  return topLevelDivs(moduleHtml)
    .map((block) => ({
      type: /\bclass="[^"]*\bcaption\b/.test(block.attrs)
        ? "caption"
        : /\bclass="[^"]*\btitle\b/.test(block.attrs)
          ? "heading"
          : "paragraph",
      text: stripTags(block.html),
      links: linksIn(block.html),
    }))
    .filter((block) => block.text);
}

function imageRecord(chunk, role) {
  const image = bestPublicImage(chunk);
  if (!image) return null;
  const alt = chunk.match(/\balt="([^"]*)"/);
  const width = chunk.match(/\b(?:data-width|width)="(\d+)"/);
  const height = chunk.match(/\bdata-height="(\d+)"/);
  const identity = assetIdFromUrl(image.sourceUrl);
  return {
    role,
    ...image,
    assetId: identity?.id ?? null,
    ext: identity?.ext ?? null,
    alt: alt ? decode(alt[1]) : "",
    width: width ? Number(width[1]) : image.declaredWidth,
    height: height ? Number(height[1]) : null,
    caption: null,
  };
}

function elementInner(html, openIndex) {
  const tagEnd = html.indexOf(">", openIndex);
  let depth = 1;
  let cursor = tagEnd + 1;
  while (depth > 0 && cursor < html.length) {
    const nextOpen = html.indexOf("<div", cursor);
    const nextClose = html.indexOf("</div>", cursor);
    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + 4;
    } else {
      depth -= 1;
      if (depth === 0) return html.slice(tagEnd + 1, nextClose);
      cursor = nextClose + 6;
    }
  }
  return html.slice(tagEnd + 1);
}

export function parseModules(html) {
  const start = html.indexOf('<div id="project-modules">');
  if (start < 0) return [];
  const slice = elementInner(html, start);
  const starts = [...slice.matchAll(/<div class="project-module module ([a-z0-9_]+)/g)];
  return starts.map((match, index) => {
    const from = match.index;
    const to = index + 1 < starts.length ? starts[index + 1].index : slice.length;
    const chunk = slice.slice(from, to);
    const type = match[1];
    const moduleId = chunk.match(/data-id="([^"]+)"/);
    const base = { index, type, moduleId: moduleId ? moduleId[1] : null };

    if (type === "text") {
      const blocks = textBlocks(chunk);
      return { ...base, blocks, links: blocks.flatMap((block) => block.links) };
    }
    if (type === "image") {
      return { ...base, image: imageRecord(chunk, "content") };
    }
    if (type === "media_collection") {
      const starts = [...chunk.matchAll(/<div class="grid__item-container/g)];
      const images = starts
        .map((item, imageIndex) => {
          const from = item.index;
          const to = imageIndex + 1 < starts.length ? starts[imageIndex + 1].index : chunk.length;
          return imageRecord(chunk.slice(from, to), "content");
        })
        .filter(Boolean);
      return { ...base, images };
    }
    if (type === "form") {
      const fields = [...chunk.matchAll(/<label[^>]*>([\s\S]*?)<\/label>[\s\S]*?<(input|textarea)\b([^>]*)>/gi)].map(
        (match) => ({
          label: stripTags(match[1]),
          control: match[2].toLowerCase(),
          name: match[3].match(/\bname="([^"]+)"/)?.[1] ?? "",
          placeholder: decode(match[3].match(/\bplaceholder="([^"]*)"/)?.[1] ?? ""),
          required: /\brequired\b/.test(match[3]),
        }),
      );
      const success = chunk.match(/class="contact-form-sent">([\s\S]*?)<\/div>/);
      const submit = chunk.match(/class="js-submit-text[^"]*"[^>]*>([\s\S]*?)<\/span>/);
      return {
        ...base,
        fields,
        submitLabel: submit ? stripTags(submit[1]) : "",
        successMessage: success ? stripTags(success[1]) : "",
      };
    }
    if (type === "embed" || type === "video" || type === "audio") {
      const iframes = [...chunk.matchAll(/<iframe\b[^>]*src=["']([^"']+)["']/gi)].map((item) => decode(item[1]));
      const media = [...chunk.matchAll(/(?:src|data-src)=["'](https?:\/\/[^"']+)["']/gi)].map((item) =>
        decode(item[1]),
      );
      return { ...base, embedUrls: [...new Set([...iframes, ...media])] };
    }
    return {
      ...base,
      unrecognized: true,
      embedUrls: [...chunk.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)["']/gi)].map((item) => decode(item[1])),
      text: stripTags(chunk).slice(0, 500),
    };
  });
}

function parseCovers(html) {
  const sectionStart = html.indexOf('<section class="project-covers"');
  if (sectionStart < 0) return [];
  const section = html.slice(sectionStart);
  const starts = [...section.matchAll(/<a class="project-cover\b/g)];
  return starts.map((match, index) => {
    const from = match.index;
    const to = index + 1 < starts.length ? starts[index + 1].index : section.length;
    const chunk = section.slice(from, to);
    const href = chunk.match(/href="([^"]+)"/);
    const identity = chunk.match(/data-identity="id:([^"]+)"/);
    const field = (className) => {
      const found = chunk.match(new RegExp(`<div class="${className}[^"]*"[^>]*>([\\s\\S]*?)<\\/div>`));
      return found ? stripTags(found[1]) : "";
    };
    return {
      order: index,
      href: href ? decode(href[1]) : "",
      adobePageId: identity ? identity[1] : null,
      title: field("title"),
      description: field("description"),
      date: field("date"),
      customField: field("custom1"),
      cover: imageRecord(chunk, "cover"),
    };
  });
}

function parseNav(html) {
  const navs = [...html.matchAll(/<nav\b[\s\S]*?<\/nav>/g)].map((match) => match[0]);
  const nav = navs.sort((a, b) => b.length - a.length)[0] ?? "";
  const groups = [];
  for (const group of nav.matchAll(/<ul class="group">([\s\S]*?)<\/ul>/g)) {
    groups.push(
      [...group[1].matchAll(/<li class="([^"]+)"><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((item) => ({
        kind: item[1],
        href: decode(item[2]),
        label: stripTags(item[3]),
      })),
    );
  }
  const social = [...nav.matchAll(/<a href="(https?:\/\/[^"]+|mailto:[^"]+)"[^>]*target="_blank"/g)].map(
    (item) => decode(item[1]),
  );
  const email = [...nav.matchAll(/href="(mailto:[^"]+)"/g)].map((item) => decode(item[1]));
  return { groups, social: [...new Set(social)], email: [...new Set(email)] };
}

function slugFromUrl(url) {
  const pathname = new URL(url).pathname.replace(/\/+$/, "");
  return pathname === "" ? "home" : pathname.slice(1);
}

function pageMarkdown(page) {
  const lines = [
    `# ${page.title || page.slug}`,
    "",
    `- URL: ${page.url}`,
    `- Canonical: ${page.canonical || "none"}`,
    `- Kind: ${page.kind}`,
    `- Adobe page id: ${page.adobePageId || "none"}`,
    `- Extracted: ${page.extractedAt}`,
    "",
  ];
  if (page.description) {
    lines.push("## Meta description", "", page.description, "");
  }
  if (page.passwordProtected) {
    lines.push("## Access", "", "Password form is present in the public HTML. Body content behind it was not extracted.", "");
  }
  if (page.covers?.length) {
    lines.push("## Projects in this gallery", "");
    for (const cover of page.covers) {
      lines.push(`### ${cover.order + 1}. ${cover.title}`);
      lines.push("");
      lines.push(`- Link: ${cover.href}`);
      if (cover.date) lines.push(`- Date: ${cover.date}`);
      if (cover.customField) lines.push(`- Custom field: ${cover.customField}`);
      if (cover.cover) lines.push(`- Cover image: ${cover.cover.sourceUrl}`);
      lines.push("");
      if (cover.description) lines.push(cover.description, "");
    }
  }
  if (page.modules?.length) {
    lines.push("## Modules", "");
    for (const module of page.modules) {
      lines.push(`### ${module.index + 1}. ${module.type}`, "");
      if (module.blocks) {
        for (const block of module.blocks) {
          if (block.type === "heading") lines.push(`#### ${block.text}`, "");
      else if (block.type === "caption") lines.push(`Caption: ${block.text}`, "");
      else lines.push(block.text, "");
          for (const link of block.links) lines.push(`- Link: ${link.text || "(no text)"} → ${link.href}`);
          if (block.links.length) lines.push("");
        }
      }
      if (module.image) lines.push(`- Image: ${module.image.sourceUrl}`, "");
      if (module.images) {
        module.images.forEach((image, imageIndex) => {
          lines.push(`${imageIndex + 1}. ${image.sourceUrl}`);
        });
        lines.push("");
      }
      if (module.fields) {
        for (const field of module.fields) {
          lines.push(`- ${field.label} (${field.control}, name=${field.name}, required=${field.required})`);
        }
        if (module.submitLabel) lines.push(`- Submit: ${module.submitLabel}`);
        if (module.successMessage) lines.push(`- Success: ${module.successMessage}`);
        lines.push("");
      }
      if (module.embedUrls?.length) {
        for (const url of module.embedUrls) lines.push(`- Embed: ${url}`);
        lines.push("");
      }
      if (module.unrecognized) lines.push("Unrecognized module. Review the raw HTML.", "");
    }
  }
  if (page.notes?.length) {
    lines.push("## Extraction notes", "");
    for (const note of page.notes) lines.push(`- ${note}`);
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

async function downloadAsset(asset) {
  const response = await fetch(asset.sourceUrl, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) {
    return { ...asset, downloadStatus: response.status, bytes: 0, localPath: null };
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "";
  const extFromType = contentType.includes("jpeg") ? "jpg" : contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : contentType.includes("gif") ? "gif" : asset.ext || "bin";
  const filename = `${String(asset.order).padStart(3, "0")}-${asset.assetId || "asset"}.${extFromType}`;
  const relative = path.posix.join("assets", asset.slug, filename);
  const destination = path.join(ASSETS, asset.slug, filename);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return {
    ...asset,
    downloadStatus: response.status,
    bytes: bytes.length,
    contentType,
    localPath: relative.replaceAll("\\", "/"),
  };
}

async function main() {
  await mkdir(RAW, { recursive: true });
  await mkdir(PAGES, { recursive: true });

  const sitemap = await fetchText(`${ORIGIN}/sitemap.xml`);
  await writeFile(path.join(RAW, "sitemap.xml"), sitemap);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  const pages = [];
  for (const url of urls) {
    const slug = slugFromUrl(url);
    const html = await fetchText(url);
    await writeFile(path.join(RAW, `${slug}.html`), html);
    const modules = parseModules(html);
    const covers = parseCovers(html);
    const passwordProtected = /type=["']password["']|class="[^"]*password/i.test(html);
    const adobePageId = html.match(/data-identity="id:([^"]+)"/)?.[1] ?? null;
    const contentImages = modules.flatMap((module) => {
      if (module.image) return [module.image];
      if (module.images) return module.images;
      return [];
    });
    const notes = [];
    if (contentImages.some((image) => image.variant !== "lightbox-original")) {
      notes.push(
        "Some images only expose a resized or cropped CDN derivative. The unsuffixed original URL is not in the public HTML for those assets.",
      );
    }
    const captionCount = modules.reduce(
      (count, module) => count + (module.blocks?.filter((block) => block.type === "caption").length ?? 0),
      0,
    );
    if (captionCount === 0 && contentImages.length > 0) {
      notes.push("This page has images and no elements with class caption.");
    }
    if (captionCount > 0) {
      notes.push(
        "Captions are separate text modules with class caption. They are not attributes on the image tag, and the image alt attribute is empty.",
      );
    }
    if (contentImages.some((image) => !image.alt)) {
      notes.push("One or more content images have no alt text in the public HTML.");
    }
    if (modules.some((module) => module.type === "embed" || module.type === "video")) {
      notes.push("Embed or video content is referenced by URL. The embedded document or player payload was not extracted.");
    }
    if (passwordProtected) {
      notes.push("A password field is in the public HTML. Protected body content was not available.");
    }
    const kind = covers.length ? "gallery" : passwordProtected && modules.length === 0 ? "password-protected" : modules.length ? "project" : "page";
    const page = {
      slug,
      url,
      canonical: html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "",
      title: stripTags(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ""),
      description: meta(html, "description"),
      keywords: meta(html, "keywords"),
      ogImage: meta(html, "og:image"),
      adobePageId,
      kind: passwordProtected && kind === "project" ? "password-protected" : kind,
      passwordProtected,
      extractedAt: fetchedAt,
      covers,
      modules,
      notes,
    };
    pages.push(page);
    await writeFile(path.join(PAGES, `${slug}.json`), `${JSON.stringify(page, null, 2)}\n`);
    await writeFile(path.join(PAGES, `${slug}.md`), pageMarkdown(page));
    console.log(`${slug}: ${page.kind}, modules ${modules.length}, covers ${covers.length}, images ${contentImages.length + covers.length}`);
  }

  const home = pages.find((page) => page.slug === "home");
  const nav = home ? parseNav(await (await import("node:fs/promises")).readFile(path.join(RAW, "home.html"), "utf8")) : { groups: [], social: [], email: [] };

  const usages = [];
  const unique = new Map();
  for (const page of pages) {
    let order = 1;
    const addImage = (image, usage) => {
      if (!image?.sourceUrl) return;
      const entry = { ...image, slug: page.slug, order, pageUrl: page.url, usage };
      usages.push(entry);
      if (!unique.has(image.sourceUrl)) unique.set(image.sourceUrl, entry);
      order += 1;
    };
    for (const cover of page.covers) addImage(cover.cover, `cover:${cover.href}`);
    for (const module of page.modules) {
      if (module.image) addImage(module.image, `module:${module.index}`);
      for (const [imageIndex, image] of (module.images ?? []).entries()) {
        addImage(image, `module:${module.index}:image:${imageIndex}`);
      }
    }
  }

  console.log(`Downloading ${unique.size} unique images (${usages.length} placements)...`);
  const downloaded = await mapPool([...unique.values()], 6, downloadAsset);
  const byUrl = new Map(downloaded.map((asset) => [asset.sourceUrl, asset]));
  const failures = downloaded.filter((asset) => asset.downloadStatus !== 200);

  const inventory = usages.map((usage) => {
    const file = byUrl.get(usage.sourceUrl);
    return {
      assetId: usage.assetId,
      sourceUrl: usage.sourceUrl,
      localPath: file?.localPath ?? null,
      bytes: file?.bytes ?? 0,
      contentType: file?.contentType ?? "",
      downloadStatus: file?.downloadStatus ?? 0,
      variant: usage.variant,
      crop: usage.crop,
      width: usage.width,
      height: usage.height,
      alt: usage.alt,
      caption: usage.caption,
      page: usage.pageUrl,
      order: usage.order,
      usage: usage.usage,
    };
  });

  await writeFile(path.join(OUT, "asset-inventory.json"), `${JSON.stringify(inventory, null, 2)}\n`);
  await writeFile(
    path.join(OUT, "site.json"),
    `${JSON.stringify(
      {
        origin: ORIGIN,
        extractedAt: fetchedAt,
        source: "Public Adobe Portfolio HTML and sitemap. No admin export was available.",
        urls,
        navigation: nav,
        pages: pages.map((page) => ({
          slug: page.slug,
          url: page.url,
          kind: page.kind,
          title: page.title,
          passwordProtected: page.passwordProtected,
          moduleCounts: page.modules.reduce((counts, module) => {
            counts[module.type] = (counts[module.type] ?? 0) + 1;
            return counts;
          }, {}),
          coverCount: page.covers.length,
          notes: page.notes,
        })),
      },
      null,
      2,
    )}\n`,
  );

  const totalBytes = downloaded.reduce((sum, asset) => sum + (asset.bytes || 0), 0);
  console.log(
    JSON.stringify(
      {
        pages: pages.length,
        images: downloaded.length,
        failed: failures.length,
        megabytes: Math.round((totalBytes / 1024 / 1024) * 10) / 10,
        moduleTypes: [...new Set(pages.flatMap((page) => page.modules.map((module) => module.type)))],
      },
      null,
      2,
    ),
  );
  if (failures.length) {
    console.log("Failed downloads:");
    for (const failure of failures) console.log(`${failure.downloadStatus} ${failure.sourceUrl}`);
  }
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  await main();
}
