import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";
import type { PageMetadataInput, ResolvedMetadata } from "@/types/seo";
import type { SiteSettings } from "@/types/site";
import { DEFAULT_SITE_SETTINGS } from "@/types/site";

function joinUrl(base: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalizedPath}`;
}

export function resolveMetadata(
  input: PageMetadataInput,
  site: SiteSettings = DEFAULT_SITE_SETTINGS,
): ResolvedMetadata {
  const title = input.title ?? site.defaultSeoTitle;
  const description = input.description ?? site.defaultSeoDescription;
  const path = input.path ?? "/";
  const canonicalUrl = joinUrl(getSiteUrl(), path);

  return {
    title,
    description,
    canonicalUrl,
    ogImage: input.ogImage ?? site.defaultOgImage,
    noIndex: input.noIndex ?? false,
  };
}

export function buildMetadata(
  input: PageMetadataInput,
  site: SiteSettings = DEFAULT_SITE_SETTINGS,
): Metadata {
  const resolved = resolveMetadata(input, site);

  return {
    title: resolved.title,
    description: resolved.description,
    alternates: {
      canonical: resolved.canonicalUrl,
    },
    openGraph: {
      title: resolved.title,
      description: resolved.description,
      url: resolved.canonicalUrl,
      siteName: site.siteTitle,
      ...(resolved.ogImage ? { images: [{ url: resolved.ogImage }] } : {}),
    },
    twitter: {
      card: resolved.ogImage ? "summary_large_image" : "summary",
      title: resolved.title,
      description: resolved.description,
      ...(resolved.ogImage ? { images: [resolved.ogImage] } : {}),
    },
    ...(resolved.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export function formatPageTitle(
  pageTitle: string | undefined,
  siteTitle: string,
): string {
  if (!pageTitle || pageTitle === siteTitle) {
    return siteTitle;
  }
  return `${pageTitle} | ${siteTitle}`;
}
