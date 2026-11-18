/** Cloudinary folder that feeds the homepage hero rotation. */
export const HERO_ALBUM_FOLDER = "hero";
export const HERO_ALBUM_PATH = "/photos";

/**
 * Hero delivery width used by the previous fast homepage.
 * Full-bleed looks sharp at 1600 with Cloudinary c_limit.
 */
export const HERO_DELIVERY_WIDTH = 1600;

/** Alias kept for older call sites. */
export const HERO_LCP_WIDTH = HERO_DELIVERY_WIDTH;

export interface HeroAlbumAsset {
  publicId: string;
  width: number;
  height: number;
  caption: string;
  date: string;
  tags: string[];
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
