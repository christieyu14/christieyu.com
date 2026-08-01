"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import type { HeroAlbumPhoto } from "@/cloudinary/lib/hero-album-shared";

interface HeroAlbumGalleryProps {
  photos: HeroAlbumPhoto[];
}

export function HeroAlbumGallery({ photos }: HeroAlbumGalleryProps) {
  return (
    <ul className="hero-album__grid">
      {photos.map((photo, index) => (
        <Reveal
          key={photo.id}
          as="li"
          className="hero-album__reveal"
          delayMs={Math.min(index * 45, 270)}
          threshold={0.08}
        >
          <figure className="hero-album__item">
            <HeroAlbumImage photo={photo} />
            <figcaption className="hero-album__meta">
              <span className="hero-album__caption">{photo.caption}</span>
              <span className="hero-album__date">{photo.dateLabel}</span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </ul>
  );
}

function HeroAlbumImage({ photo }: { photo: HeroAlbumPhoto }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [photo.id]);

  return (
    <div className={`hero-album__frame${loaded ? " hero-album__frame--ready" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={photo.url}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
