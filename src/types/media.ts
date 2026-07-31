export type MediaKind =
  | "cloudinary-image"
  | "sanity-image"
  | "local-image"
  | "external-video"
  | "prototype-embed";

export type CloudinaryCropMode = "fill" | "fit" | "scale" | "crop" | "thumb" | "limit";

export interface CloudinaryImageMedia {
  kind: "cloudinary-image";
  publicId: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

export interface SanityImageMedia {
  kind: "sanity-image";
  assetRef: string;
  alt?: string;
  caption?: string;
  lqip?: string;
}

export interface LocalImageMedia {
  kind: "local-image";
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ExternalVideoMedia {
  kind: "external-video";
  url: string;
  title?: string;
  poster?: CloudinaryImageMedia | LocalImageMedia;
}

export interface PrototypeEmbedMedia {
  kind: "prototype-embed";
  url: string;
  title?: string;
  aspectRatio?: number;
}

export type NormalizedMedia =
  | CloudinaryImageMedia
  | SanityImageMedia
  | LocalImageMedia
  | ExternalVideoMedia
  | PrototypeEmbedMedia;

export interface MediaTransformOptions {
  width?: number;
  height?: number;
  quality?: number | "auto";
  format?: "auto" | "webp" | "jpg" | "png";
  crop?: CloudinaryCropMode;
  dpr?: number;
}

export interface MediaSrcSetEntry {
  src: string;
  width: number;
}

export interface MediaVariant {
  label: "thumbnail" | "full" | "custom";
  url: string;
  width?: number;
  height?: number;
  srcSet?: MediaSrcSetEntry[];
}
