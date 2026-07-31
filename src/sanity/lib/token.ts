import { getServerEnv, isPreviewConfigured } from "@/lib/env";

export function getSanityReadToken(): string | undefined {
  const token = getServerEnv().SANITY_API_READ_TOKEN;
  return token || undefined;
}

export function hasSanityReadToken(): boolean {
  return Boolean(getSanityReadToken());
}

export function getPreviewSecret(): string | undefined {
  const secret = getServerEnv().SANITY_PREVIEW_SECRET;
  return secret || undefined;
}

export function canUsePreview(): boolean {
  return isPreviewConfigured();
}
