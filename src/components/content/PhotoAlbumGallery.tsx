"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { formatTagLabel, tagToSlug } from "@/cloudinary/lib/album-tags";
import { buildCloudinaryUrl } from "@/cloudinary/lib/url";
import {
  HERO_DELIVERY_WIDTH,
  type HeroAlbumAsset,
} from "@/cloudinary/lib/hero-album-shared";

interface PhotoAlbumGalleryProps {
  assets: HeroAlbumAsset[];
}

function assetUrl(publicId: string): string | undefined {
  return buildCloudinaryUrl({
    publicId,
    width: HERO_DELIVERY_WIDTH,
    quality: "auto",
    format: "auto",
    crop: "limit",
  });
}

export function PhotoAlbumGallery({ assets }: PhotoAlbumGalleryProps) {
  return (
    <ul className="photos__grid">
      {assets.map((asset, index) => (
        <Reveal
          key={asset.publicId}
          as="li"
          className="photos__item"
          delayMs={Math.min(index * 45, 270)}
          threshold={0.08}
        >
          <figure className="photos__figure">
            <PhotoAlbumImage asset={asset} />
            <figcaption className="photos__overlay type-sm">
              <span className="photos__caption">{asset.caption}</span>
              <span className="photos__meta-right">
                <span>{asset.date}</span>
                {asset.tags[0] ? (
                  <Link
                    className="type-link"
                    href={`/photos/tags/${tagToSlug(asset.tags[0])}`}
                  >
                    {formatTagLabel(asset.tags[0])}
                  </Link>
                ) : null}
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </ul>
  );
}

function PhotoAlbumImage({ asset }: { asset: HeroAlbumAsset }) {
  const [loaded, setLoaded] = useState(false);
  const src = assetUrl(asset.publicId);

  function markCachedImage(image: HTMLImageElement | null) {
    if (image?.complete && image.naturalWidth > 0) {
      setLoaded(true);
    }
  }

  if (!src) {
    return null;
  }

  return (
    <div className={`photos__frame${loaded ? " photos__frame--ready" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={markCachedImage}
        src={src}
        alt={asset.caption}
        width={asset.width}
        height={asset.height}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
