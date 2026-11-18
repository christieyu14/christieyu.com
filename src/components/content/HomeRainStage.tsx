"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { buildCloudinaryUrl } from "@/cloudinary/lib/url";
import {
  HERO_ALBUM_PATH,
  HERO_DELIVERY_WIDTH,
  selectHeroAsset,
  type HeroAlbumAsset,
} from "@/cloudinary/lib/hero-album-shared";
import { usePageReveal } from "@/components/content/page-reveal";
import TerminalRain from "@/components/effects/TerminalRain";
import { samplePhotoStageMetaTone, type OverlayTone } from "@/lib/image-luminance";

/** Mono / Ink preset from React Bits Pro Terminal Rain controls. */
const MONO_INK = {
  colors: ["#cfbb93", "#fff99b"] as [string, string],
  backgroundColor: "#eaf4cb",
  mode: "ink" as const,
  glyphSize: 14,
  spacing: 1.2,
  density: 0.4,
  speed: 0.7,
  variance: 0.65,
  shuffle: 0.4,
  mirror: true,
  glow: 0.5,
  intensity: 0.7,
  // Hover: turbulence (speed-up) + soft parting wake — not bullet-time slowdown.
  slowRadius: 260,
  slowStrength: 1,
  burstSize: 2,
  bulletTime: true,
  clickBurst: true,
  interactive: true,
};

interface HomeRainStageProps {
  assets: HeroAlbumAsset[];
  initialAsset: HeroAlbumAsset | null;
  children: ReactNode;
}

interface ReadyPhoto {
  asset: HeroAlbumAsset;
  url: string;
}

function buildHeroUrl(publicId: string): string {
  return (
    buildCloudinaryUrl({
      publicId,
      width: HERO_DELIVERY_WIDTH,
      quality: "auto",
      format: "auto",
      crop: "limit",
    }) ?? ""
  );
}

function preloadPhoto(asset: HeroAlbumAsset): Promise<ReadyPhoto | null> {
  const url = buildHeroUrl(asset.publicId);
  if (!url) return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve({ asset, url });
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function loadSamplingImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

export function HomeRainStage({
  assets,
  initialAsset,
  children,
}: HomeRainStageProps) {
  const { setReady } = usePageReveal();
  const [current, setCurrent] = useState<ReadyPhoto | null>(() =>
    initialAsset
      ? { asset: initialAsset, url: buildHeroUrl(initialAsset.publicId) }
      : null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metaTone, setMetaTone] = useState<OverlayTone>("dark");
  const primedRef = useRef<ReadyPhoto | null>(null);
  const currentIdRef = useRef(initialAsset?.publicId ?? "");
  const thumbRef = useRef<HTMLImageElement | null>(null);
  const captionRef = useRef<HTMLParagraphElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const sampleUrlRef = useRef<string | null>(null);
  const sampleImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [setReady]);

  const beginPreload = useCallback(
    (excludePublicId: string) => {
      const nextAsset = selectHeroAsset(assets, excludePublicId);
      if (!nextAsset) {
        primedRef.current = null;
        return;
      }
      void preloadPhoto(nextAsset).then((ready) => {
        primedRef.current = ready;
      });
    },
    [assets],
  );

  useEffect(() => {
    if (initialAsset) beginPreload(initialAsset.publicId);
  }, [initialAsset, beginPreload]);

  const updateMetaTone = useCallback(async () => {
    if (!current?.url) return;
    const textElements: HTMLElement[] = [];
    if (captionRef.current) textElements.push(captionRef.current);
    if (actionsRef.current) textElements.push(actionsRef.current);
    if (textElements.length === 0) return;

    let sampleImage = sampleImageRef.current;
    if (!sampleImage || sampleUrlRef.current !== current.url) {
      sampleImage = await loadSamplingImage(current.url);
      sampleUrlRef.current = current.url;
      sampleImageRef.current = sampleImage;
    }
    if (!sampleImage) return;

    const tone = samplePhotoStageMetaTone(
      sampleImage,
      textElements,
      thumbRef.current,
    );
    if (tone) setMetaTone(tone);
  }, [current]);

  useEffect(() => {
    void updateMetaTone();
  }, [updateMetaTone]);

  async function refreshPhoto() {
    if (isRefreshing || assets.length < 2) return;
    setIsRefreshing(true);
    let next = primedRef.current;
    primedRef.current = null;
    if (!next || next.asset.publicId === currentIdRef.current) {
      const asset = selectHeroAsset(assets, currentIdRef.current);
      next = asset ? await preloadPhoto(asset) : null;
    }
    if (!next) {
      setIsRefreshing(false);
      return;
    }
    setCurrent(next);
    currentIdRef.current = next.asset.publicId;
    setIsRefreshing(false);
    beginPreload(next.asset.publicId);
  }

  return (
    <div className="home">
      <div className="home__rain" aria-hidden="true" data-haze-skip>
        <TerminalRain className="home__rain-inner" {...MONO_INK} />
      </div>
      <div className="home__body">
        <div className="home__welcome">
          <p className="home__welcome-title type-display" aria-hidden="true">
            welcome...
          </p>
          <div className="home__panel">{children}</div>
        </div>
        {current ? (
          <aside
            className={`home__meta home__meta--${metaTone}`}
            aria-label="Featured photograph"
          >
            <p ref={captionRef} className="home__meta-caption type-md">
              <span>{current.asset.caption}</span>
              <span>{current.asset.date}</span>
            </p>
            <div ref={actionsRef} className="home__meta-actions">
              <button
                type="button"
                className="type-link"
                onClick={() => {
                  void refreshPhoto();
                }}
                disabled={isRefreshing || assets.length < 2}
              >
                refresh
              </button>
              <Link href={HERO_ALBUM_PATH} className="type-link home__meta-all">
                all
                <br />
                photos
              </Link>
            </div>
            <figure className="home__meta-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={thumbRef}
                src={current.url}
                alt={current.asset.caption}
                width={current.asset.width}
                height={current.asset.height}
                decoding="async"
                onLoad={() => {
                  void updateMetaTone();
                }}
              />
            </figure>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
