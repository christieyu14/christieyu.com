"use client";

import Link from "next/link";
import { buildCloudinaryUrl } from "@/cloudinary/lib/url";
import {
  HERO_ALBUM_PATH,
  HERO_DELIVERY_WIDTH,
  selectHeroAsset,
  type HeroAlbumAsset,
} from "@/cloudinary/lib/hero-album-shared";
import { ArrowForwardIcon } from "@/components/icons";
import { useCallback, useEffect, useRef, useState } from "react";

interface HomeHeroProps {
  assets: HeroAlbumAsset[];
  initialAsset: HeroAlbumAsset;
}

interface ReadyPhoto {
  asset: HeroAlbumAsset;
  url: string;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function buildHeroUrl(publicId: string): string | undefined {
  return buildCloudinaryUrl({
    publicId,
    width: HERO_DELIVERY_WIDTH,
    quality: "auto",
    format: "auto",
    crop: "limit",
  });
}

function preloadPhoto(asset: HeroAlbumAsset): Promise<ReadyPhoto | null> {
  const url = buildHeroUrl(asset.publicId);
  if (!url) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve({ asset, url });
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

export function HomeHero({ assets, initialAsset }: HomeHeroProps) {
  const initialUrl = buildHeroUrl(initialAsset.publicId) ?? "";
  const [current, setCurrent] = useState<ReadyPhoto>({
    asset: initialAsset,
    url: initialUrl,
  });
  const [overlay, setOverlay] = useState<ReadyPhoto | null>(null);
  const [overlayOpaque, setOverlayOpaque] = useState(false);
  const [baseOpaque, setBaseOpaque] = useState(false);
  const [metaAsset, setMetaAsset] = useState(initialAsset);
  const [metaVisible, setMetaVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const primedRef = useRef<ReadyPhoto | null>(null);
  const primingRef = useRef<Promise<ReadyPhoto | null> | null>(null);
  const currentIdRef = useRef(initialAsset.publicId);
  const baseImageRef = useRef<HTMLImageElement>(null);
  const swapTimeoutRef = useRef<number | null>(null);

  const beginPreload = useCallback((excludePublicId: string) => {
    const nextAsset = selectHeroAsset(assets, excludePublicId);
    if (!nextAsset) {
      primedRef.current = null;
      primingRef.current = null;
      return;
    }

    const task = preloadPhoto(nextAsset).then((ready) => {
      if (primingRef.current === task) {
        primedRef.current = ready;
        primingRef.current = null;
      }
      return ready;
    });
    primingRef.current = task;
  }, [assets]);

  useEffect(() => {
    currentIdRef.current = initialAsset.publicId;
    const url = buildHeroUrl(initialAsset.publicId) ?? "";
    setCurrent({ asset: initialAsset, url });
    setMetaAsset(initialAsset);
    setOverlay(null);
    setOverlayOpaque(false);
    setBaseOpaque(false);
    setMetaVisible(false);
    setIsRefreshing(false);
    primedRef.current = null;
    primingRef.current = null;
    beginPreload(initialAsset.publicId);

    const image = baseImageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      revealInitial();
    }
  }, [initialAsset, beginPreload]);

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
      setCurrent(overlay);
      currentIdRef.current = overlay.asset.publicId;
      setMetaAsset(overlay.asset);
      setOverlay(null);
      setOverlayOpaque(false);
      setBaseOpaque(true);
      setMetaVisible(true);
      setIsRefreshing(false);
      beginPreload(overlay.asset.publicId);
      return;
    }

    const frame = requestAnimationFrame(() => {
      setOverlayOpaque(true);
      setMetaAsset(overlay.asset);
      setMetaVisible(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [overlay, beginPreload]);

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

  async function refreshPhoto() {
    if (isRefreshing || assets.length < 2) {
      return;
    }

    setIsRefreshing(true);

    let next = primedRef.current;
    primedRef.current = null;

    if (!next || next.asset.publicId === currentIdRef.current) {
      const pending = primingRef.current;
      if (pending) {
        next = await pending;
      }
    }

    if (!next || next.asset.publicId === currentIdRef.current) {
      const asset = selectHeroAsset(assets, currentIdRef.current);
      next = asset ? await preloadPhoto(asset) : null;
    }

    if (!next) {
      setIsRefreshing(false);
      return;
    }

    // Ensure the bitmap is fully ready before swapping — keep current visible.
    if (prefersReducedMotion()) {
      setCurrent(next);
      currentIdRef.current = next.asset.publicId;
      setMetaAsset(next.asset);
      setBaseOpaque(true);
      setMetaVisible(true);
      setIsRefreshing(false);
      beginPreload(next.asset.publicId);
      return;
    }

    setMetaVisible(false);
    if (swapTimeoutRef.current !== null) {
      window.clearTimeout(swapTimeoutRef.current);
    }
    swapTimeoutRef.current = window.setTimeout(() => {
      setOverlayOpaque(false);
      setOverlay(next);
    }, 120);
  }

  function finishCrossfade() {
    if (!overlay || !overlayOpaque) {
      return;
    }
    setCurrent(overlay);
    currentIdRef.current = overlay.asset.publicId;
    setBaseOpaque(true);
    setOverlay(null);
    setOverlayOpaque(false);
    setIsRefreshing(false);
    beginPreload(overlay.asset.publicId);
  }

  return (
    <section className="home__hero" aria-label="Featured photograph">
      <div className="home__hero-panel">
        <div className="home__hero-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={baseImageRef}
            className={`home__hero-frame${baseOpaque ? " is-opaque" : ""}`}
            src={current.url}
            alt={current.asset.caption}
            width={current.asset.width}
            height={current.asset.height}
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
              alt={overlay.asset.caption}
              width={overlay.asset.width}
              height={overlay.asset.height}
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
              {metaAsset.caption}
            </p>
          </div>
          <div className="home__hero-meta-date">
            <p
              className={`home__meta-line home__meta-dissolve${
                metaVisible ? " is-visible" : ""
              }`}
            >
              {metaAsset.date}
            </p>
          </div>
          <div className="home__hero-meta-actions">
            <button
              type="button"
              className="home__meta-action"
              onClick={() => {
                void refreshPhoto();
              }}
              disabled={isRefreshing || assets.length < 2}
            >
              <span className="home__meta-action-text">see another photo</span>
              <ArrowForwardIcon size={20} />
            </button>
            <Link href={HERO_ALBUM_PATH} className="home__meta-action">
              <span className="home__meta-action-text">or see all my photos</span>
              <ArrowForwardIcon size={20} />
            </Link>
            <p className="home__meta-fine">(do not distribute)</p>
          </div>
        </div>
      </div>
    </section>
  );
}
