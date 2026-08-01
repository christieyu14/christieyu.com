"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { buildCloudinaryUrl } from "@/cloudinary/lib/url";
import {
  HERO_DELIVERY_WIDTH,
  type HeroAlbumAsset,
} from "@/cloudinary/lib/hero-album-shared";

interface HeroAlbumGalleryProps {
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

export function HeroAlbumGallery({ assets }: HeroAlbumGalleryProps) {
  return (
    <ul className="hero-album__grid">
      {assets.map((asset, index) => (
        <Reveal
          key={asset.publicId}
          as="li"
          className="hero-album__reveal"
          delayMs={Math.min(index * 45, 270)}
          threshold={0.08}
        >
          <figure className="hero-album__item">
            <HeroAlbumImage asset={asset} />
            <figcaption className="hero-album__meta">
              <span className="hero-album__caption">{asset.caption}</span>
              <span className="hero-album__date">{asset.date}</span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </ul>
  );
}

function HeroAlbumImage({ asset }: { asset: HeroAlbumAsset }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const src = assetUrl(asset.publicId);

  useEffect(() => {
    setLoaded(false);
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [asset.publicId]);

  if (!src) {
    return null;
  }

  return (
    <div className={`hero-album__frame${loaded ? " hero-album__frame--ready" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
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
