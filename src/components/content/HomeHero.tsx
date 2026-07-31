"use client";

import { useEffect, useRef, useState } from "react";
import type { ResolvedFeaturedPhoto } from "@/lib/featured-photos";
import {
  sampleHeroMetadataTones,
  type OverlayTone,
} from "@/lib/image-luminance";

interface HomeHeroProps {
  photo: ResolvedFeaturedPhoto;
}

export function HomeHero({ photo }: HomeHeroProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [captionTone, setCaptionTone] = useState<OverlayTone>("light");
  const [dateTone, setDateTone] = useState<OverlayTone>("light");

  useEffect(() => {
    const image = imageRef.current;
    if (!image) {
      return;
    }

    const applyTones = () => {
      const tones = sampleHeroMetadataTones(image);
      if (!tones) {
        return;
      }
      setCaptionTone(tones.caption);
      setDateTone(tones.date);
    };

    if (image.complete && image.naturalWidth > 0) {
      applyTones();
    }

    image.addEventListener("load", applyTones);
    return () => image.removeEventListener("load", applyTones);
  }, [photo.url]);

  return (
    <figure className="home__hero">
      <div className="home__hero-media">
        {/* Featured pool images — Cloudinary CDN or local public assets */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={photo.url}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          decoding="async"
          fetchPriority="high"
          crossOrigin="anonymous"
        />
        <figcaption className="home__hero-meta">
          <span className="home__hero-caption" data-tone={captionTone}>
            {photo.caption}
          </span>
          <span className="home__hero-date" data-tone={dateTone}>
            {photo.dateLabel}
          </span>
        </figcaption>
      </div>
    </figure>
  );
}
