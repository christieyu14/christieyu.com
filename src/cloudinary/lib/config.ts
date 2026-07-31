import { publicEnv, isCloudinaryConfigured } from "@/lib/env";

export function getCloudinaryCloudName(): string | undefined {
  if (!isCloudinaryConfigured()) {
    return undefined;
  }
  return publicEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
}

export function getCloudinaryBaseUrl(cloudName?: string): string | undefined {
  const name = cloudName ?? getCloudinaryCloudName();
  if (!name) {
    return undefined;
  }
  return `https://res.cloudinary.com/${name}`;
}
