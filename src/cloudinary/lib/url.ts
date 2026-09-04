import type { CloudinaryCropMode, MediaTransformOptions } from "@/types/media";
import { getCloudinaryBaseUrl } from "./config";

export interface CloudinaryUrlOptions extends MediaTransformOptions {
  publicId: string;
  cloudName?: string;
}

function buildTransformationSegment(options: MediaTransformOptions): string {
  const parts: string[] = [];

  if (options.crop) {
    parts.push(`c_${options.crop}`);
  }
  if (options.width) {
    parts.push(`w_${options.width}`);
  }
  if (options.height) {
    parts.push(`h_${options.height}`);
  }
  if (options.quality !== undefined) {
    parts.push(`q_${options.quality}`);
  } else {
    parts.push("q_auto");
  }
  if (options.format) {
    parts.push(`f_${options.format}`);
  } else {
    parts.push("f_auto");
  }
  if (options.dpr) {
    parts.push(`dpr_${options.dpr}`);
  }

  return parts.join(",");
}

export function buildCloudinaryUrl(options: CloudinaryUrlOptions): string | undefined {
  const baseUrl = getCloudinaryBaseUrl(options.cloudName);
  if (!baseUrl) {
    return undefined;
  }

  const transformation = buildTransformationSegment(options);
  const publicId = options.publicId.replace(/^\//, "");

  return `${baseUrl}/image/upload/${transformation}/${publicId}`;
}

/** Force-download URL for a Cloudinary-hosted resume PDF (or other file). */
export function buildCloudinaryAttachmentUrl(
  publicId: string,
  filename = "Christie-Yu-Resume.pdf",
  cloudName?: string,
): string | undefined {
  const baseUrl = getCloudinaryBaseUrl(cloudName);
  if (!baseUrl) {
    return undefined;
  }

  const id = publicId.replace(/^\//, "");
  const safeName = encodeURIComponent(filename);
  return `${baseUrl}/image/upload/fl_attachment:${safeName}/${id}`;
}

export function buildCloudinarySrcSet(
  publicId: string,
  widths: number[],
  options: Omit<CloudinaryUrlOptions, "publicId" | "width"> = {},
): { src: string; width: number }[] {
  return widths
    .map((width) => {
      const src = buildCloudinaryUrl({ ...options, publicId, width });
      if (!src) {
        return null;
      }
      return { src, width };
    })
    .filter((entry): entry is { src: string; width: number } => entry !== null);
}

export const THUMBNAIL_TRANSFORM: MediaTransformOptions = {
  width: 400,
  height: 300,
  crop: "fill" as CloudinaryCropMode,
  quality: "auto",
  format: "auto",
};

export const FULL_TRANSFORM: MediaTransformOptions = {
  width: 1600,
  quality: "auto",
  format: "auto",
  crop: "limit" as CloudinaryCropMode,
};
