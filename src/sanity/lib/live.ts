import { draftMode } from "next/headers";
import { getSanityStudioUrl } from "@/lib/env";
import { client } from "@/sanity/lib/client";
import { getSanityReadToken } from "@/sanity/lib/token";
import type { SanityClient } from "next-sanity";

/** Published-only client — safe for generateStaticParams / sitemap. */
export function getPublishedSanityClient(): SanityClient | null {
  if (!client) {
    return null;
  }

  return client.withConfig({
    useCdn: false,
    perspective: "published",
    stega: { enabled: false },
  });
}

/** Preview-aware client for request-time rendering. */
export async function getSanityFetchClient(): Promise<SanityClient | null> {
  if (!client) {
    return null;
  }

  const { isEnabled } = await draftMode();

  if (isEnabled) {
    const token = getSanityReadToken();
    if (!token) {
      return null;
    }

    return client.withConfig({
      token,
      perspective: "drafts",
      useCdn: false,
      stega: {
        enabled: true,
        studioUrl: getSanityStudioUrl(),
      },
    });
  }

  return client;
}
