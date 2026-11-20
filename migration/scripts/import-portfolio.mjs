/**
 * Upload in-scope Adobe Portfolio images to Cloudinary and create the
 * 11 portfolioPost documents in Sanity. Does not import covers, Other
 * projects, contact, or resume.
 *
 * ADOBE_PORTFOLIO_PASSWORD unlocks /generative-ai for this run only.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { v2 as cloudinary } from "cloudinary";
import { meta, parseModules, stripTags } from "./extract-adobe-portfolio.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const EXTRACTED = path.join(ROOT, "migration", "extracted");
const PAGES = path.join(EXTRACTED, "pages");
const MAP_PATH = path.join(EXTRACTED, "cloudinary-map.json");
const LOG_PATH = path.join(ROOT, "migration", "reports", "import-log.json");
const PROJECT_ID = "hjf5x3d3";
const DATASET = "production";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const PROJECTS = [
  "gridify",
  "generative-ai",
  "red-velvet",
  "cake",
  "artmiesa",
  "senior-thesis-computer-science",
  "senior-thesis-english",
  "amoriem-labs",
  "yale-daily-news",
  "teaching-cs50",
  "mskcc",
];

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line);
    if (!match || process.env[match[1]]) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function readSanityToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;
  const candidates = [
    path.join(os.homedir(), ".config", "sanity", "config.json"),
    path.join(process.env.APPDATA ?? "", "sanity", "config.json"),
    path.join(os.homedir(), "AppData", "Roaming", "sanity", "config.json"),
  ];
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    const config = JSON.parse(readFileSync(candidate, "utf8"));
    if (typeof config.authToken === "string" && config.authToken) return config.authToken;
  }
  throw new Error("No Sanity auth token found. Run npx sanity login in the Studio folder.");
}

function splitContext(value) {
  if (!value) return {};
  const wrapped = /^(.*?)\s*\((.*)\)\s*$/.exec(value);
  if (wrapped) {
    return { client: wrapped[1].trim(), location: wrapped[2].trim() };
  }
  if (value === "Digital space") return { location: value };
  return { client: value };
}

function publishedAtFor(dateLabel, sortIndex) {
  const match = /^(\d{2})\/(\d{4})$/.exec(dateLabel ?? "");
  if (!match) return undefined;
  const month = Number(match[1]);
  const year = Number(match[2]);
  return {
    projectYear: year,
    publishedAt: new Date(Date.UTC(year, month - 1, 1, 12, 0, 40 - sortIndex)).toISOString(),
  };
}

function trimAlt(text, title) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return `${title} image`;
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean;
}

function altFor(modules, index, title) {
  const next = modules[index + 1];
  if (next?.type === "text") {
    const caption = next.blocks?.find((block) => block.type === "caption");
    if (caption?.text) return trimAlt(caption.text, title);
    const paragraph = next.blocks?.find((block) => block.type === "paragraph");
    if (paragraph?.text) return trimAlt(paragraph.text, title);
  }
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const previous = modules[cursor];
    if (previous?.type !== "text") continue;
    const blocks = [...(previous.blocks ?? [])].reverse();
    const paragraph = blocks.find((block) => block.type === "paragraph" || block.type === "heading");
    if (paragraph?.text) return trimAlt(paragraph.text, title);
  }
  return `${title} image`;
}

function spansFromText(text, links, keyPrefix) {
  const ranges = [];
  let cursor = 0;
  for (const link of links ?? []) {
    if (!link.text) continue;
    const at = text.indexOf(link.text, cursor);
    if (at < 0) continue;
    ranges.push({ start: at, end: at + link.text.length, href: link.href });
    cursor = at + link.text.length;
  }
  const merged = [];
  for (const range of ranges) {
    const previous = merged.at(-1);
    const gap = previous ? text.slice(previous.end, range.start) : "";
    if (previous && previous.href === range.href && gap.trim() === "") {
      previous.end = range.end;
    } else {
      merged.push({ ...range });
    }
  }
  if (merged.length === 0) {
    return {
      markDefs: [],
      children: [{ _type: "span", _key: `${keyPrefix}s`, text, marks: [] }],
    };
  }
  const children = [];
  const markDefs = [];
  let position = 0;
  merged.forEach((range, index) => {
    if (range.start > position) {
      children.push({
        _type: "span",
        _key: `${keyPrefix}t${index}`,
        text: text.slice(position, range.start),
        marks: [],
      });
    }
    const markKey = `${keyPrefix}m${index}`;
    markDefs.push({ _key: markKey, _type: "link", href: range.href });
    children.push({
      _type: "span",
      _key: `${keyPrefix}l${index}`,
      text: text.slice(range.start, range.end),
      marks: [markKey],
    });
    position = range.end;
  });
  if (position < text.length) {
    children.push({
      _type: "span",
      _key: `${keyPrefix}end`,
      text: text.slice(position),
      marks: [],
    });
  }
  return { markDefs, children };
}

function textBlock(block, key) {
  const style = block.type === "heading" ? "h2" : block.type === "caption" ? "caption" : "normal";
  const spans = spansFromText(block.text, block.links, key);
  return {
    _type: "block",
    _key: key,
    style,
    markDefs: spans.markDefs,
    children: spans.children,
  };
}

function embedFrame(url) {
  if (url.includes("instagram.com")) {
    return { title: "Instagram", maxWidth: 800, height: 800 };
  }
  if (url.includes("scribd.com")) {
    return { title: "Scribd", height: 1000 };
  }
  return { title: "Embed", height: 600 };
}

function assetRecord(upload, alt, key) {
  const asset = {
    _type: "cloudinary.asset",
    _version: 1,
    public_id: upload.public_id,
    resource_type: upload.resource_type,
    type: upload.type,
    format: upload.format,
    version: upload.version,
    url: upload.url,
    secure_url: upload.secure_url,
    width: upload.width,
    height: upload.height,
  };
  return {
    _key: key,
    _type: "cloudinaryAsset",
    alt,
    asset,
  };
}

function cookieHeader(response) {
  const cookies =
    typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  return cookies.map((entry) => entry.split(";")[0]).filter(Boolean).join("; ");
}

function looksUnlocked(html) {
  return html.includes('id="project-modules"') && !html.includes("js-password-form");
}

async function unlockGenerativeAi(password) {
  const url = "https://christieyu.com/generative-ai";
  const pageId = "p67d74125d2aec6def9d467d2c99db7949281660980e53a77fd42a";
  const gate = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  const gateCookie = cookieHeader(gate);
  await gate.arrayBuffer();
  const response = await fetch("https://christieyu.com/site/password/verify", {
    method: "POST",
    redirect: "manual",
    headers: {
      "user-agent": USER_AGENT,
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
      accept: "*/*",
      origin: "https://christieyu.com",
      referer: url,
      ...(gateCookie ? { cookie: gateCookie } : {}),
    },
    body: new URLSearchParams({ password, page_id: pageId }).toString(),
  });
  const cookie = [gateCookie, cookieHeader(response)].filter(Boolean).join("; ");
  if (!response.ok || !cookieHeader(response)) {
    const failBody = (await response.text()).replaceAll(password, "[redacted]");
    await writeFile(path.join(EXTRACTED, "unlock-error.html"), failBody);
    throw new Error(
      `Could not unlock /generative-ai (${response.status}, ${response.headers.get("content-type") ?? "no content-type"}).`,
    );
  }
  const follow = await fetch(url, { headers: { "user-agent": USER_AGENT, cookie } });
  const html = await follow.text();
  if (!looksUnlocked(html)) {
    throw new Error("The password was accepted, but the project HTML was still locked.");
  }
  return html;
}

async function loadGenerativeAi(password) {
  const html = await unlockGenerativeAi(password);
  const url = "https://christieyu.com/generative-ai";
  const modules = parseModules(html);
  if (modules.length === 0) {
    throw new Error("Unlocked /generative-ai but found no project modules.");
  }
  const page = {
    slug: "generative-ai",
    url,
    title: stripTags(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ""),
    description: meta(html, "description"),
    adobePageId: html.match(/data-identity="id:([^"]+)"/)?.[1] ?? "p67d74125d2aec6def9d467d2c99db7949281660980e53a77fd42a",
    modules,
  };
  await writeFile(path.join(EXTRACTED, "raw", "generative-ai.html"), html);
  await writeFile(path.join(PAGES, "generative-ai.json"), `${JSON.stringify(page, null, 2)}\n`);
  console.log(`generative-ai unlocked: ${modules.length} modules`);
  return page;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function localFileFor(sourceUrl, inventory) {
  const row = inventory.find((item) => item.sourceUrl === sourceUrl && item.localPath);
  if (!row?.localPath) return null;
  const absolute = path.join(EXTRACTED, row.localPath);
  return existsSync(absolute) ? absolute : null;
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

async function uploadImage(image, cache) {
  if (cache.has(image.sourceUrl)) return cache.get(image.sourceUrl);
  const publicId = `portfolio/${image.assetId || createHash("sha1").update(image.sourceUrl).digest("hex").slice(0, 16)}`;
  const localFile = image.localFile;
  const result = await cloudinary.uploader.upload(localFile ?? image.sourceUrl, {
    public_id: publicId,
    resource_type: "image",
    overwrite: true,
    unique_filename: false,
    invalidate: true,
  });
  const stored = {
    public_id: result.public_id,
    resource_type: result.resource_type,
    type: result.type,
    format: result.format,
    version: result.version,
    url: result.url,
    secure_url: result.secure_url,
    width: result.width,
    height: result.height,
  };
  cache.set(image.sourceUrl, stored);
  return stored;
}

function buildDocument(page, cover, sortIndex, uploads, issues) {
  const title = cover?.title || page.title.replace(/^Christie Yu -\s*/, "");
  const context = splitContext(cover?.customField ?? "");
  const dates = publishedAtFor(cover?.date, sortIndex);
  const body = [];

  for (const module of page.modules ?? []) {
    if (module.type === "text") {
      for (const [blockIndex, block] of (module.blocks ?? []).entries()) {
        body.push(textBlock(block, `m${module.index}b${blockIndex}`));
        for (const link of block.links ?? []) {
          if (link.href?.includes("fiddle.jshell.net")) {
            issues.push({ slug: page.slug, href: link.href, text: link.text });
          }
        }
      }
      continue;
    }
    if (module.type === "image" && module.image?.sourceUrl) {
      const upload = uploads.get(module.image.sourceUrl);
      if (!upload) {
        issues.push({ slug: page.slug, missing: module.image.sourceUrl });
        continue;
      }
      body.push({
        _type: "singleMedia",
        _key: `m${module.index}`,
        media: assetRecord(upload, altFor(page.modules, module.index, title), `m${module.index}a`),
      });
      continue;
    }
    if (module.type === "media_collection") {
      const images = [];
      for (const [imageIndex, image] of (module.images ?? []).entries()) {
        const upload = uploads.get(image.sourceUrl);
        if (!upload) {
          issues.push({ slug: page.slug, missing: image.sourceUrl });
          continue;
        }
        const baseAlt = altFor(page.modules, module.index, title);
        const alt =
          (module.images?.length ?? 0) > 1
            ? `${baseAlt} (${imageIndex + 1} of ${module.images.length})`
            : baseAlt;
        images.push(assetRecord(upload, alt, `m${module.index}i${imageIndex}`));
      }
      if (images.length) {
        body.push({ _type: "imageGallery", _key: `m${module.index}`, images });
      }
      continue;
    }
    if (module.type === "embed" || module.type === "video") {
      for (const [embedIndex, url] of (module.embedUrls ?? []).entries()) {
        if (!url.includes("scribd.com") && !url.includes("instagram.com")) continue;
        const frame = embedFrame(url);
        body.push({
          _type: "prototypeEmbed",
          _key: `m${module.index}e${embedIndex}`,
          url,
          ...frame,
        });
      }
    }
  }

  return {
    _id: `portfolioPost.${page.adobePageId || page.slug}`,
    _type: "portfolioPost",
    title,
    slug: { _type: "slug", current: page.slug },
    summary: cover?.description || page.description || undefined,
    ...dates,
    ...context,
    featured: true,
    seoTitle: title,
    seoDescription: page.description || cover?.description || undefined,
    migration: {
      source: "adobe-portfolio",
      sourceId: page.adobePageId,
      legacyPath: `/${page.slug}`,
    },
    body,
  };
}

function stripEmpty(value) {
  if (Array.isArray(value)) return value.map(stripEmpty);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined && entry !== "")
        .map(([key, entry]) => [key, stripEmpty(entry)]),
    );
  }
  return value;
}

async function main() {
  loadEnvFile(path.join(ROOT, ".env.local"));
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET is missing from .env.local");
  }

  const home = readJson(path.join(PAGES, "home.json"));
  const covers = new Map(home.covers.map((cover) => [cover.href, cover]));
  const inventory = readJson(path.join(EXTRACTED, "asset-inventory.json"));
  const pages = [];
  for (const slug of PROJECTS) {
    if (slug === "generative-ai") {
      const password = process.env.ADOBE_PORTFOLIO_PASSWORD;
      if (!password) {
        console.log("Skipping generative-ai until the unlocked page HTML is available.");
        continue;
      }
      try {
        pages.push(await loadGenerativeAi(password));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`Skipping generative-ai: ${message}`);
      }
      continue;
    }
    pages.push(readJson(path.join(PAGES, `${slug}.json`)));
  }

  const cache = new Map(existsSync(MAP_PATH) ? Object.entries(readJson(MAP_PATH)) : []);
  const pending = [];
  for (const page of pages) {
    for (const module of page.modules ?? []) {
      const images = module.image ? [module.image] : (module.images ?? []);
      for (const image of images) {
        if (!image?.sourceUrl || cache.has(image.sourceUrl) || pending.some((item) => item.sourceUrl === image.sourceUrl)) {
          continue;
        }
        pending.push({ ...image, localFile: localFileFor(image.sourceUrl, inventory) });
      }
    }
  }

  console.log(`Uploading ${pending.length} images (${cache.size} already mapped)...`);
  let finished = 0;
  await mapPool(pending, 4, async (image) => {
    await uploadImage(image, cache);
    finished += 1;
    if (finished % 20 === 0 || finished === pending.length) {
      writeFileSync(MAP_PATH, `${JSON.stringify(Object.fromEntries(cache), null, 2)}\n`);
      console.log(`uploaded ${finished}/${pending.length}`);
    }
  });
  writeFileSync(MAP_PATH, `${JSON.stringify(Object.fromEntries(cache), null, 2)}\n`);

  const issues = [];
  const documents = pages.map((page, index) =>
    stripEmpty(buildDocument(page, covers.get(`/${page.slug}`), index, cache, issues)),
  );

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: "2026-05-15",
    token: readSanityToken(),
    useCdn: false,
  });

  for (const document of documents) {
    await client.createOrReplace(document);
    const images = document.body.filter((block) => block._type === "singleMedia" || block._type === "imageGallery").length;
    console.log(`wrote ${document.slug.current}: ${document.body.length} blocks, client=${document.client ?? ""}, location=${document.location ?? ""}`);
    void images;
  }

  await writeFile(LOG_PATH, `${JSON.stringify({ written: documents.map((document) => document.slug.current), issues }, null, 2)}\n`);
  console.log(`Done. ${documents.length} documents. ${issues.length} issues logged.`);
}

await main();
