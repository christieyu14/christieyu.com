"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ConcaveCarousel } from "@/components/concave-carousel";
import { buildCloudinaryUrl } from "@/cloudinary/lib/url";
import {
  HERO_DELIVERY_WIDTH,
  type HeroAlbumAsset,
} from "@/cloudinary/lib/hero-album-shared";

interface PhotosCarouselProps {
  assets: HeroAlbumAsset[];
}

interface CarouselItem {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
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

function shuffleAssets(assets: HeroAlbumAsset[]): HeroAlbumAsset[] {
  const next = [...assets];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const left = next[i]!;
    next[i] = next[j]!;
    next[j] = left;
  }
  return next;
}

function toItems(assets: HeroAlbumAsset[]): CarouselItem[] {
  return assets
    .map((asset) => {
      const src = assetUrl(asset.publicId);
      if (!src) return null;
      return {
        src,
        alt: asset.caption,
        title: asset.caption,
        subtitle: asset.date,
      };
    })
    .filter((item): item is CarouselItem => item !== null);
}

function matchesQuery(asset: HeroAlbumAsset, query: string): boolean {
  if (!query) return true;
  if (asset.caption.toLowerCase().includes(query)) return true;
  if (asset.date.toLowerCase().includes(query)) return true;
  return asset.tags.some((tag) => tag.toLowerCase().includes(query));
}

export function PhotosCarousel({ assets }: PhotosCarouselProps) {
  const [order] = useState(() => shuffleAssets(assets));
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return order.filter((asset) => matchesQuery(asset, needle));
  }, [order, query]);

  const items = useMemo(() => toItems(filtered), [filtered]);
  const carouselKey = useMemo(
    () => `${query.trim().toLowerCase()}|${items.map((item) => item.src).join(",")}`,
    [items, query],
  );

  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
  }, [searchOpen]);

  return (
    <div className="photos-carousel">
      {items.length === 0 ? (
        <p className="photos-carousel__empty type-md" role="status">
          No photos match that search.
        </p>
      ) : (
        <div className="photos-carousel__viewport">
          <ConcaveCarousel
            key={carouselKey}
            items={items}
            aspect={1.78}
            size={0.5}
            curvature={0.4}
            distance={3.2}
            gap={4}
            radius={0}
            reflection={0}
            dim={0.1}
            inertia={0.7}
            backgroundColor="#f2f1f0"
            className="photos-carousel__stage"
          />
        </div>
      )}

      <div className="photos-carousel__search">
        {searchOpen ? (
          <label className="photos-carousel__search-field contact-field">
            <span className="visually-hidden">Search photos</span>
            <span className="contact-field__shell">
              <input
                ref={inputRef}
                className="contact-field__control type-sm"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onBlur={() => {
                  if (query.trim() === "") {
                    setSearchOpen(false);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setQuery("");
                    setSearchOpen(false);
                  }
                }}
                placeholder="Search"
                autoComplete="off"
                spellCheck={false}
              />
            </span>
          </label>
        ) : (
          <button
            type="button"
            className="type-link photos-carousel__search-toggle"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </button>
        )}
      </div>
    </div>
  );
}
