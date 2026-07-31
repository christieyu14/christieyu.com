/**
 * Featured homepage photo pool.
 *
 * Each page load picks one entry at random (server-side).
 * Replace or extend this pool; later wire to Sanity + Cloudinary.
 */

export type FeaturedPhotoProvider = "local" | "cloudinary";

export interface FeaturedPhoto {
  id: string;
  /** Local public path or Cloudinary public ID */
  src: string;
  provider: FeaturedPhotoProvider;
  alt: string;
  caption: string;
  /** Display label such as `07.2026` */
  dateLabel: string;
  width?: number;
  height?: number;
}

/**
 * Seed pool. Add more entries as photos become available.
 * For Cloudinary entries, set provider: "cloudinary" and src to the public ID.
 */
export const FEATURED_PHOTO_POOL: FeaturedPhoto[] = [
  {
    id: "puffins-reykjavik",
    src: "/images/featured/puffins-iceland.jpg",
    provider: "local",
    alt: "Three puffins standing on a grassy cliff near Reykjavik",
    caption: "puffins in reykjavik",
    dateLabel: "06.2026",
    width: 3968,
    height: 2232,
  },
];
