"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  HERO_ALBUM_PATH,
  selectHeroPhoto,
  type HeroAlbumPhoto,
} from "@/cloudinary/lib/hero-album-shared";

interface HomeHeroProps {
  initialPhoto: HeroAlbumPhoto;
  photos: HeroAlbumPhoto[];
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HomeHero({ initialPhoto, photos }: HomeHeroProps) {
  const [photo, setPhoto] = useState(initialPhoto);
  const [overlay, setOverlay] = useState<HeroAlbumPhoto | null>(null);
  const [overlayOpaque, setOverlayOpaque] = useState(false);
  const [baseOpaque, setBaseOpaque] = useState(false);
  const [metaPhoto, setMetaPhoto] = useState(initialPhoto);
  const [metaVisible, setMetaVisible] = useState(false);
  const baseImageRef = useRef<HTMLImageElement>(null);
  const swapTimeoutRef = useRef<number | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPhoto(initialPhoto);
    setMetaPhoto(initialPhoto);
    setOverlay(null);
    setOverlayOpaque(false);
    setBaseOpaque(false);
    setMetaVisible(false);

    const image = baseImageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      revealInitial();
    }
  }, [initialPhoto]);

  useEffect(() => {
    return () => {
      if (swapTimeoutRef.current !== null) {
        window.clearTimeout(swapTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!overlay) {
      return;
    }

    if (prefersReducedMotion()) {
      setPhoto(overlay);
      setMetaPhoto(overlay);
      setOverlay(null);
      setOverlayOpaque(false);
      setBaseOpaque(true);
      setMetaVisible(true);
      return;
    }

    const frame = requestAnimationFrame(() => {
      setOverlayOpaque(true);
      setMetaPhoto(overlay);
      setMetaVisible(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [overlay]);

  function revealInitial() {
    if (prefersReducedMotion()) {
      setBaseOpaque(true);
      setMetaVisible(true);
      return;
    }
    requestAnimationFrame(() => {
      setBaseOpaque(true);
      setMetaVisible(true);
    });
  }

  function refreshPhoto() {
    const next = selectHeroPhoto(photos, overlay?.id ?? photo.id);
    if (!next || next.id === photo.id || next.id === overlay?.id) {
      return;
    }

    startTransition(() => {
      if (prefersReducedMotion()) {
        setPhoto(next);
        setMetaPhoto(next);
        setBaseOpaque(true);
        setMetaVisible(true);
        return;
      }

      setMetaVisible(false);
      if (swapTimeoutRef.current !== null) {
        window.clearTimeout(swapTimeoutRef.current);
      }
      swapTimeoutRef.current = window.setTimeout(() => {
        setOverlayOpaque(false);
        setOverlay(next);
      }, 140);
    });
  }

  function finishCrossfade() {
    if (!overlay || !overlayOpaque) {
      return;
    }
    setPhoto(overlay);
    setBaseOpaque(true);
    setOverlay(null);
    setOverlayOpaque(false);
  }

  return (
    <section className="home__hero" aria-label="Featured photograph">
      <div className="home__hero-panel">
        <div className="home__hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={baseImageRef}
            className={`home__hero-frame${baseOpaque ? " is-opaque" : ""}`}
            src={photo.url}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            decoding="async"
            fetchPriority="high"
            onLoad={revealInitial}
          />
          {overlay ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={`home__hero-frame home__hero-frame--overlay${
                overlayOpaque ? " is-opaque" : ""
              }`}
              src={overlay.url}
              alt={overlay.alt}
              width={overlay.width}
              height={overlay.height}
              decoding="async"
              onTransitionEnd={(event) => {
                if (event.propertyName === "opacity") {
                  finishCrossfade();
                }
              }}
            />
          ) : null}
        </div>
        <div className="home__hero-meta">
          <div className="home__hero-meta-primary">
            <p
              className={`home__meta-line home__meta-dissolve${
                metaVisible ? " is-visible" : ""
              }`}
            >
              {metaPhoto.caption}
            </p>
          </div>
          <div className="home__hero-meta-date">
            <p
              className={`home__meta-line home__meta-dissolve${
                metaVisible ? " is-visible" : ""
              }`}
            >
              {metaPhoto.dateLabel}
            </p>
          </div>
          <div className="home__hero-meta-actions">
            <button
              type="button"
              className="home__meta-action"
              onClick={refreshPhoto}
            >
              see another photo →
            </button>
            <Link href={HERO_ALBUM_PATH} className="home__meta-action">
              or see all my photos →
            </Link>
            <p className="home__meta-fine">(do not distribute)</p>
          </div>
        </div>
      </div>
    </section>
  );
}
