/** Cloudinary folder that feeds the homepage hero rotation. */
export const HERO_ALBUM_FOLDER = "hero";
export const HERO_ALBUM_PATH = "/photos/hero";

/** Delivery width near the rendered hero (~888 CSS px at 1080 frame, 2× DPR). */
export const HERO_DELIVERY_WIDTH = 1600;

/**
 * Slim asset record returned from the server-cached Cloudinary album list.
 * Delivery URLs are built from `publicId` using the public cloud name only.
 */
export interface HeroAlbumAsset {
  publicId: string;
  width: number;
  height: number;
  caption: string;
  date: string;
}

export function selectHeroAsset(
  assets: readonly HeroAlbumAsset[],
  excludePublicId?: string,
): HeroAlbumAsset | null {
  if (assets.length === 0) {
    return null;
  }

  const pool =
    excludePublicId && assets.length > 1
      ? assets.filter((asset) => asset.publicId !== excludePublicId)
      : assets;

  if (pool.length === 0) {
    return assets[0] ?? null;
  }

  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? null;
}
