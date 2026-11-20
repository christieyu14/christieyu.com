"use client";

import { buildCloudinaryUrl } from "@/cloudinary/lib/url";
import { isCloudinaryMedia, isDecorativeAlt } from "@/lib/media-normalize";
import type { NormalizedMedia } from "@/types/media";

interface MediaRendererProps {
  media: NormalizedMedia;
  variant?: "thumbnail" | "full";
  className?: string;
}

export function MediaRenderer({
  media,
  variant = "full",
  className,
}: MediaRendererProps) {
  if (media.kind === "cloudinary-image") {
    const animated = media.format === "gif";
    const width = variant === "thumbnail" ? 400 : 1600;
    const height = variant === "thumbnail" ? 300 : undefined;
    const src = buildCloudinaryUrl({
      publicId: media.publicId,
      width,
      height: animated ? undefined : height,
      crop: variant === "thumbnail" && !animated ? "fill" : "limit",
      quality: "auto",
      format: animated ? "gif" : "auto",
    });

    if (!src) {
      return <div className={className} role="img" aria-label="Image unavailable" />;
    }

    const alt = isDecorativeAlt(media.alt) ? "" : (media.alt ?? "");

    return (
      <figure className={className}>
        {/* Cloudinary CDN URLs use plain img — not Next Image optimizer */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={media.width ?? width}
          height={media.height ?? height}
          loading="lazy"
          decoding="async"
        />
        {media.caption ? <figcaption>{media.caption}</figcaption> : null}
      </figure>
    );
  }

  if (media.kind === "local-image") {
    const alt = isDecorativeAlt(media.alt) ? "" : (media.alt ?? "");

    return (
      <figure className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.src}
          alt={alt}
          width={media.width}
          height={media.height}
          loading="lazy"
          decoding="async"
        />
        {media.caption ? <figcaption>{media.caption}</figcaption> : null}
      </figure>
    );
  }

  if (media.kind === "sanity-image") {
    return (
      <figure className={className} aria-label="Sanity image placeholder">
        <figcaption>{media.caption ?? "Sanity image"}</figcaption>
      </figure>
    );
  }

  if (media.kind === "external-video") {
    return (
      <figure className={className}>
        <figcaption>{media.title ?? "External video"}</figcaption>
      </figure>
    );
  }

  if (media.kind === "prototype-embed") {
    const height =
      typeof media.aspectRatio === "number" && media.aspectRatio > 0
        ? undefined
        : 600;

    return (
      <iframe
        className={className}
        src={media.url}
        title={media.title ?? "Embedded content"}
        style={{
          width: "100%",
          border: 0,
          height,
          aspectRatio:
            typeof media.aspectRatio === "number" && media.aspectRatio > 0
              ? String(media.aspectRatio)
              : undefined,
        }}
        loading="lazy"
        allowFullScreen
      />
    );
  }

  if (isCloudinaryMedia(media)) {
    return null;
  }

  return null;
}
