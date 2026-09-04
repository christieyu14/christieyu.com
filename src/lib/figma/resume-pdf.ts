import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import {
  parseResumeUpdatedLabel,
  RESUME,
  resumeUpdatedLabel,
} from "@/content/resume";
import { getFigmaAccessToken, isFigmaConfigured } from "@/lib/env";

const ONE_DAY = 86_400;
const FIGMA_API = "https://api.figma.com/v1";
const MAX_RENDER_ATTEMPTS = 3;
const RENDER_RETRY_MS = 750;

export type ResumePdfPayload = {
  /** PDF bytes encoded as base64 (stable for Next.js data cache). */
  pdfBase64: string;
  updatedLabel: string;
  /** `figma` = live export; `last-saved` = persisted fallback PDF. */
  source: "figma" | "last-saved";
};

type LastSavedMeta = {
  updatedLabel: string;
  savedAt: string;
};

type FigmaImagesResponse = {
  err?: string | null;
  images?: Record<string, string | null>;
};

type FigmaNodesResponse = {
  lastModified?: string;
  nodes?: Record<
    string,
    {
      document?: { name?: string };
    } | null
  >;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function figmaAuthHeaders(token: string): HeadersInit {
  return { "X-Figma-Token": token };
}

async function figmaGetJson<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    headers: figmaAuthHeaders(token),
    // Token-authenticated; never put this in the public CDN cache.
    cache: "no-store",
  });

  if (response.status === 429) {
    throw new Error("Figma API rate limited (429).");
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Figma API ${response.status} for ${url}${body ? `: ${body.slice(0, 200)}` : ""}`,
    );
  }

  return (await response.json()) as T;
}

async function fetchFrameMeta(
  token: string,
): Promise<{ frameName: string; fileLastModified?: string }> {
  const url = new URL(`${FIGMA_API}/files/${RESUME.figmaFileKey}/nodes`);
  url.searchParams.set("ids", RESUME.figmaNodeId);
  url.searchParams.set("depth", "1");

  const data = await figmaGetJson<FigmaNodesResponse>(url.toString(), token);
  const node = data.nodes?.[RESUME.figmaNodeId];
  const frameName = node?.document?.name?.trim() ?? "";

  return {
    frameName,
    fileLastModified: data.lastModified,
  };
}

function labelFromFileLastModified(iso?: string): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  return `${month}-${year}`;
}

async function resolveUpdatedLabel(token: string): Promise<string> {
  try {
    const { frameName, fileLastModified } = await fetchFrameMeta(token);
    const fromName = parseResumeUpdatedLabel(frameName);
    if (fromName) {
      return fromName;
    }
    const fromFile = labelFromFileLastModified(fileLastModified);
    if (fromFile) {
      return fromFile;
    }
  } catch {
    // Fall through to static / last-saved fallback.
  }
  const saved = await readLastSavedMeta();
  if (saved?.updatedLabel) {
    return saved.updatedLabel;
  }
  return resumeUpdatedLabel();
}

async function fetchPdfRenderUrl(
  token: string,
  attempt: number,
): Promise<string> {
  const url = new URL(`${FIGMA_API}/images/${RESUME.figmaFileKey}`);
  url.searchParams.set("ids", RESUME.figmaNodeId);
  url.searchParams.set("format", "pdf");

  const data = await figmaGetJson<FigmaImagesResponse>(url.toString(), token);

  if (data.err) {
    throw new Error(`Figma images error: ${data.err}`);
  }

  const renderUrl = data.images?.[RESUME.figmaNodeId] ?? null;
  if (renderUrl) {
    return renderUrl;
  }

  if (attempt + 1 < MAX_RENDER_ATTEMPTS) {
    await sleep(RENDER_RETRY_MS * (attempt + 1));
    return fetchPdfRenderUrl(token, attempt + 1);
  }

  throw new Error(
    `Figma returned null PDF render URL for node ${RESUME.figmaNodeId} after ${MAX_RENDER_ATTEMPTS} attempts.`,
  );
}

async function downloadPdfBytes(renderUrl: string): Promise<Buffer> {
  const response = await fetch(renderUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to download Figma PDF (${response.status}).`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function localPdfAbsolutePath(): string {
  return path.join(
    process.cwd(),
    "public",
    RESUME.pdfPath.replace(/^\//, ""),
  );
}

function lastSavedMetaAbsolutePath(): string {
  return path.join(process.cwd(), "public", "resume", "last-saved.json");
}

async function readLastSavedMeta(): Promise<LastSavedMeta | null> {
  try {
    const raw = await readFile(lastSavedMetaAbsolutePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<LastSavedMeta>;
    if (typeof parsed.updatedLabel !== "string" || !parsed.updatedLabel.trim()) {
      return null;
    }
    return {
      updatedLabel: parsed.updatedLabel.trim(),
      savedAt:
        typeof parsed.savedAt === "string" ? parsed.savedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Persist a successful Figma export so expired/missing tokens still serve
 * the last good PDF (commit this file for durable production fallback).
 */
async function persistLastSavedResume(
  bytes: Buffer,
  updatedLabel: string,
): Promise<void> {
  try {
    const pdfPath = localPdfAbsolutePath();
    await mkdir(path.dirname(pdfPath), { recursive: true });
    await writeFile(pdfPath, bytes);
    const meta: LastSavedMeta = {
      updatedLabel: resumeUpdatedLabel(updatedLabel),
      savedAt: new Date().toISOString(),
    };
    await writeFile(
      lastSavedMetaAbsolutePath(),
      `${JSON.stringify(meta, null, 2)}\n`,
      "utf8",
    );
  } catch (error) {
    // Vercel/serverless filesystems are often read-only — ignore.
    console.warn(
      "[resume-pdf] Could not persist last-saved PDF (filesystem may be read-only).",
      error,
    );
  }
}

async function fetchFigmaResumePdfUncached(): Promise<ResumePdfPayload> {
  const token = getFigmaAccessToken();
  if (!token) {
    throw new Error("FIGMA_ACCESS_TOKEN is not configured.");
  }

  const [updatedLabel, renderUrl] = await Promise.all([
    resolveUpdatedLabel(token),
    fetchPdfRenderUrl(token, 0),
  ]);

  const bytes = await downloadPdfBytes(renderUrl);
  await persistLastSavedResume(bytes, updatedLabel);

  return {
    pdfBase64: bytes.toString("base64"),
    updatedLabel,
    source: "figma",
  };
}

const getCachedFigmaResumePdf = unstable_cache(
  async () => fetchFigmaResumePdfUncached(),
  ["figma-resume-pdf-v1", RESUME.figmaFileKey, RESUME.figmaNodeId],
  {
    revalidate: ONE_DAY,
    tags: ["resume-pdf"],
  },
);

export async function lastSavedResumePdfExists(): Promise<boolean> {
  try {
    await access(localPdfAbsolutePath());
    return true;
  } catch {
    return false;
  }
}

async function readLastSavedResumePdf(): Promise<ResumePdfPayload | null> {
  if (!(await lastSavedResumePdfExists())) {
    return null;
  }

  const [bytes, meta] = await Promise.all([
    readFile(localPdfAbsolutePath()),
    readLastSavedMeta(),
  ]);

  return {
    pdfBase64: bytes.toString("base64"),
    updatedLabel: resumeUpdatedLabel(meta?.updatedLabel),
    source: "last-saved",
  };
}

function isLastSavedFresh(meta: LastSavedMeta | null): boolean {
  if (!meta?.savedAt) {
    return false;
  }
  const savedAt = Date.parse(meta.savedAt);
  if (Number.isNaN(savedAt)) {
    return false;
  }
  return Date.now() - savedAt < ONE_DAY * 1000;
}

/**
 * Resume PDF bytes + updated label.
 * Serves a fresh last-saved PDF immediately; refreshes from Figma at most ~daily.
 * On Figma failure (expired token, 429, etc.) falls back to last-saved.
 */
export async function getResumePdf(): Promise<ResumePdfPayload | null> {
  const saved = await readLastSavedResumePdf();
  const meta = await readLastSavedMeta();

  if (saved && isLastSavedFresh(meta)) {
    return saved;
  }

  if (isFigmaConfigured()) {
    try {
      return await getCachedFigmaResumePdf();
    } catch (error) {
      if (saved) {
        console.warn(
          "[resume-pdf] Figma unavailable; serving last-saved PDF.",
          error instanceof Error ? error.message : error,
        );
        return saved;
      }
      console.error(
        "[resume-pdf] Figma export failed and no last-saved PDF.",
        error,
      );
    }
  }

  return saved;
}

/** Prefer last-saved when present so page shells don't hit Figma on every load. */
export async function isResumePdfAvailable(): Promise<boolean> {
  if (await lastSavedResumePdfExists()) {
    return true;
  }
  return isFigmaConfigured();
}

/**
 * Updated label for meta/SEO. Prefer last-saved metadata (fast, no API),
 * then live Figma frame name, then the static content fallback.
 */
export async function getResumeUpdatedLabel(): Promise<string> {
  const saved = await readLastSavedMeta();
  if (saved?.updatedLabel) {
    return resumeUpdatedLabel(saved.updatedLabel);
  }

  if (isFigmaConfigured()) {
    try {
      const payload = await getCachedFigmaResumePdf();
      return resumeUpdatedLabel(payload.updatedLabel);
    } catch {
      // Fall through.
    }
  }

  return resumeUpdatedLabel();
}
