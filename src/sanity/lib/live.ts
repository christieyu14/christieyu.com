import { draftMode } from "next/headers";
import { getSanityStudioUrl } from "@/lib/env";
import { client } from "@/sanity/lib/client";
import { getSanityReadToken } from "@/sanity/lib/token";
import type { SanityClient } from "next-sanity";

/**
 * The production dataset is marked public, but unauthenticated queries currently
 * omit every document. Server reads send the viewer token when it is configured.
 */
function withPublishedRead(sanityClient: SanityClient): SanityClient {
  const token = getSanityReadToken();
  return sanityClient.withConfig({
    useCdn: !token,
    perspective: "published",
    stega: { enabled: false },
    ...(token ? { token } : {}),
  });
}

/** Published-only client — safe for generateStaticParams / sitemap. */
export function getPublishedSanityClient(): SanityClient | null {
  if (!client) {
    return null;
  }

  return withPublishedRead(client);
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

  return withPublishedRead(client);
}
