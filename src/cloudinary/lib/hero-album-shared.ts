/** Cloudinary folder that feeds the homepage hero rotation. */
export const HERO_ALBUM_FOLDER = "hero";
export const HERO_ALBUM_PATH = "/photos/hero";

export interface HeroAlbumPhoto {
  id: string;
  publicId: string;
  alt: string;
  caption: string;
  dateLabel: string;
  width?: number;
  height?: number;
  /** Delivery URL for the homepage / album listing */
  url: string;
}

export function selectHeroPhoto(
  photos: readonly HeroAlbumPhoto[],
  excludeId?: string,
): HeroAlbumPhoto | null {
  if (photos.length === 0) {
    return null;
  }

  const pool =
    excludeId && photos.length > 1
      ? photos.filter((photo) => photo.id !== excludeId)
      : photos;

  if (pool.length === 0) {
    return photos[0] ?? null;
  }

  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? null;
}
