import { z } from "zod";

const optionalString = z.string().optional().default("");

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SANITY_PROJECT_ID: optionalString,
  NEXT_PUBLIC_SANITY_DATASET: optionalString,
  NEXT_PUBLIC_SANITY_API_VERSION: optionalString,
  NEXT_PUBLIC_SANITY_STUDIO_URL: optionalString,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: optionalString,
  NEXT_PUBLIC_CLOUDINARY_API_KEY: optionalString,
  NEXT_PUBLIC_SITE_URL: optionalString,
  NEXT_PUBLIC_ADOBE_PDF_CLIENT_ID: optionalString,
});

const serverEnvSchema = z.object({
  SANITY_API_READ_TOKEN: optionalString,
  SANITY_PREVIEW_SECRET: optionalString,
  SANITY_REVALIDATE_SECRET: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  FIGMA_ACCESS_TOKEN: optionalString,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function parsePublicEnv(): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    NEXT_PUBLIC_SANITY_STUDIO_URL: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_API_KEY:
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_ADOBE_PDF_CLIENT_ID: process.env.NEXT_PUBLIC_ADOBE_PDF_CLIENT_ID,
  });
}

function parseServerEnv(): ServerEnv {
  return serverEnvSchema.parse({
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
    SANITY_PREVIEW_SECRET: process.env.SANITY_PREVIEW_SECRET,
    SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    FIGMA_ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN,
  });
}

export const publicEnv = parsePublicEnv();

export function getServerEnv(): ServerEnv {
  return parseServerEnv();
}

export function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
}

export function isCloudinaryAdminConfigured(): boolean {
  const server = getServerEnv();
  return Boolean(
    isCloudinaryConfigured() &&
    server.CLOUDINARY_API_KEY &&
    server.CLOUDINARY_API_SECRET,
  );
}

export function isPreviewConfigured(): boolean {
  const server = getServerEnv();
  return Boolean(isSanityConfigured() && server.SANITY_API_READ_TOKEN);
}

export function hasPreviewSecret(): boolean {
  return Boolean(getServerEnv().SANITY_PREVIEW_SECRET);
}

export function isRevalidateConfigured(): boolean {
  return Boolean(getServerEnv().SANITY_REVALIDATE_SECRET);
}

export function isFigmaConfigured(): boolean {
  return Boolean(getServerEnv().FIGMA_ACCESS_TOKEN);
}

export function getFigmaAccessToken(): string | undefined {
  const token = getServerEnv().FIGMA_ACCESS_TOKEN;
  return token || undefined;
}

export function isProductionEnvRequired(): boolean {
  return process.env.NODE_ENV === "production";
}

export function assertProductionEnv(): void {
  if (!isProductionEnvRequired()) {
    return;
  }

  const missing: string[] = [];

  if (!publicEnv.NEXT_PUBLIC_SITE_URL) {
    missing.push("NEXT_PUBLIC_SITE_URL");
  }
  if (!isSanityConfigured()) {
    missing.push("NEXT_PUBLIC_SANITY_PROJECT_ID", "NEXT_PUBLIC_SANITY_DATASET");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`,
    );
  }
}

export function getSanityApiVersion(): string {
  return publicEnv.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-15";
}

export function getSanityStudioUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ||
    publicEnv.NEXT_PUBLIC_SANITY_STUDIO_URL ||
    "http://localhost:3333"
  );
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    publicEnv.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}
