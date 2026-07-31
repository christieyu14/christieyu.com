import { getSanityApiVersion, isSanityConfigured, publicEnv } from "@/lib/env";
import { createClient, type SanityClient } from "next-sanity";

export function createSanityClient(): SanityClient | null {
  if (!isSanityConfigured()) {
    return null;
  }

  return createClient({
    projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: getSanityApiVersion(),
    useCdn: true,
    perspective: "published",
    stega: {
      enabled: false,
      studioUrl: "/studio",
    },
  });
}

export const client = createSanityClient();
