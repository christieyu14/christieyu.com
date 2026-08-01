import type {
  CloudinaryImageMedia,
  ExternalVideoMedia,
  LocalImageMedia,
  NormalizedMedia,
  PrototypeEmbedMedia,
  SanityImageMedia,
} from "@/types/media";

interface SanityCloudinaryPluginAsset {
  public_id?: string;
  width?: number;
  height?: number;
  resource_type?: string;
  format?: string;
  version?: number;
  context?: { custom?: { alt?: string } };
  derived?: Array<{ raw_transformation?: string; secure_url?: string }>;
}

interface SanityCloudinaryAsset {
  publicId?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  resourceType?: string;
  format?: string;
  version?: number;
  derived?: SanityCloudinaryPluginAsset["derived"];
  /** Nested plugin shape when queried without projection flattening */
  asset?: SanityCloudinaryPluginAsset;
}

interface SanityImageAsset {
  asset?: { _ref?: string };
  alt?: string;
  caption?: string;
  lqip?: string;
}

export function normalizeCloudinaryAsset(
  asset: SanityCloudinaryAsset | null | undefined,
): CloudinaryImageMedia | undefined {
  if (!asset) {
    return undefined;
  }

  const publicId = asset.publicId ?? asset.asset?.public_id;
  if (!publicId) {
    return undefined;
  }

  return {
    kind: "cloudinary-image",
    publicId,
    alt: asset.alt ?? asset.asset?.context?.custom?.alt,
    caption: asset.caption,
    width: asset.width ?? asset.asset?.width,
    height: asset.height ?? asset.asset?.height,
  };
}

export function normalizeSanityImage(
  image: SanityImageAsset | null | undefined,
): SanityImageMedia | undefined {
  if (!image?.asset?._ref) {
    return undefined;
  }

  return {
    kind: "sanity-image",
    assetRef: image.asset._ref,
    alt: image.alt,
    caption: image.caption,
    lqip: image.lqip,
  };
}

export function normalizeLocalImage(src: string, alt?: string): LocalImageMedia {
  return {
    kind: "local-image",
    src,
    alt,
  };
}

export function normalizeExternalVideo(
  url: string,
  title?: string,
): ExternalVideoMedia {
  return {
    kind: "external-video",
    url,
    title,
  };
}

export function normalizePrototypeEmbed(
  url: string,
  title?: string,
  aspectRatio?: number,
): PrototypeEmbedMedia {
  return {
    kind: "prototype-embed",
    url,
    title,
    aspectRatio,
  };
}

export function isCloudinaryMedia(
  media: NormalizedMedia,
): media is CloudinaryImageMedia {
  return media.kind === "cloudinary-image";
}

export function isDecorativeAlt(alt?: string): boolean {
  return alt === "" || alt === "decorative";
}
