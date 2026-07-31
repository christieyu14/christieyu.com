import { buildCloudinaryUrl } from "@/cloudinary/lib/url";
import { FEATURED_PHOTO_POOL, type FeaturedPhoto } from "@/content/featured-photos";

export interface ResolvedFeaturedPhoto extends FeaturedPhoto {
  /** Ready-to-render image URL */
  url: string;
}

/**
 * Uniform random selection from the featured photo pool.
 * Runs on the server so each request/navigation can yield a new photo.
 */
export function selectFeaturedPhoto(
  pool: readonly FeaturedPhoto[] = FEATURED_PHOTO_POOL,
): FeaturedPhoto {
  if (pool.length === 0) {
    throw new Error("FEATURED_PHOTO_POOL is empty.");
  }

  const index = Math.floor(Math.random() * pool.length);
  return pool[index]!;
}

export function resolveFeaturedPhotoUrl(photo: FeaturedPhoto): string | undefined {
  if (photo.provider === "local") {
    return photo.src;
  }

  return buildCloudinaryUrl({
    publicId: photo.src,
    width: 2400,
    quality: "auto",
    format: "auto",
    crop: "limit",
  });
}

export function getRandomFeaturedPhoto(
  pool: readonly FeaturedPhoto[] = FEATURED_PHOTO_POOL,
): ResolvedFeaturedPhoto | null {
  if (pool.length === 0) {
    return null;
  }

  const photo = selectFeaturedPhoto(pool);
  const url = resolveFeaturedPhotoUrl(photo);

  if (!url) {
    return null;
  }

  return { ...photo, url };
}
