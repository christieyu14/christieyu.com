import {
  buildCloudinarySrcSet,
  buildCloudinaryUrl,
  FULL_TRANSFORM,
  THUMBNAIL_TRANSFORM,
} from "./url";
import type { CloudinaryImageMedia, MediaVariant } from "@/types/media";

const DEFAULT_SRCSET_WIDTHS = [400, 800, 1200, 1600];

export function getCloudinaryThumbnail(
  media: CloudinaryImageMedia,
): MediaVariant | undefined {
  const url = buildCloudinaryUrl({
    publicId: media.publicId,
    ...THUMBNAIL_TRANSFORM,
  });

  if (!url) {
    return undefined;
  }

  return {
    label: "thumbnail",
    url,
    width: THUMBNAIL_TRANSFORM.width,
    height: THUMBNAIL_TRANSFORM.height,
  };
}

export function getCloudinaryFull(
  media: CloudinaryImageMedia,
): MediaVariant | undefined {
  const url = buildCloudinaryUrl({
    publicId: media.publicId,
    ...FULL_TRANSFORM,
  });

  if (!url) {
    return undefined;
  }

  const srcSet = buildCloudinarySrcSet(media.publicId, DEFAULT_SRCSET_WIDTHS, {
    ...FULL_TRANSFORM,
  });

  return {
    label: "full",
    url,
    width: FULL_TRANSFORM.width,
    srcSet,
  };
}

export function getCloudinaryVariant(
  media: CloudinaryImageMedia,
  label: MediaVariant["label"],
): MediaVariant | undefined {
  switch (label) {
    case "thumbnail":
      return getCloudinaryThumbnail(media);
    case "full":
      return getCloudinaryFull(media);
    default:
      return getCloudinaryFull(media);
  }
}
