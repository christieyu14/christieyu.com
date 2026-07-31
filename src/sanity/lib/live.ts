import { draftMode } from "next/headers";
import { client } from "@/sanity/lib/client";
import { getSanityReadToken } from "@/sanity/lib/token";
import type { SanityClient } from "next-sanity";

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
        studioUrl: "/studio",
      },
    });
  }

  return client;
}
