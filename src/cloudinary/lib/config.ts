import { isCloudinaryConfigured } from "@/lib/env";

export function getCloudinaryCloudName(): string | undefined {
  if (!isCloudinaryConfigured()) {
    return undefined;
  }

  const name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  return name || undefined;
}

export function getCloudinaryBaseUrl(cloudName?: string): string | undefined {
  const name = cloudName ?? getCloudinaryCloudName();
  if (!name) {
    return undefined;
  }
  return `https://res.cloudinary.com/${name}`;
}
