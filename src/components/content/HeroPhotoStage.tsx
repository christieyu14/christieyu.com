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
import { useChromeToneOverride } from "@/components/layout/ChromeToneContext";
import { samplePhotoStageMetaTone, type OverlayTone } from "@/lib/image-luminance";

interface HeroPhotoStageProps {
  assets: HeroAlbumAsset[];
  initialAsset: HeroAlbumAsset | null;
  variant: "home" | "resume";
  children: ReactNode;
}

interface ReadyPhoto {
  asset: HeroAlbumAsset;
  url: string;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

export function HeroPhotoStage({
  assets,
  initialAsset,
  variant,
  children,
}: HeroPhotoStageProps) {
  const { setReady } = usePageReveal();
  const setChromeTone = useChromeToneOverride();
  const [current, setCurrent] = useState<ReadyPhoto | null>(() =>
    initialAsset
      ? { asset: initialAsset, url: buildHeroUrl(initialAsset.publicId) }
      : null,
  );
  const [overlay, setOverlay] = useState<ReadyPhoto | null>(null);
  const [overlayOpaque, setOverlayOpaque] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metaTone, setMetaTone] = useState<OverlayTone>("light");
  const headerSampleRef = useRef<HTMLDivElement | null>(null);
  const footerSampleRef = useRef<HTMLDivElement | null>(null);

  const primedRef = useRef<ReadyPhoto | null>(null);
  const primingRef = useRef<Promise<ReadyPhoto | null> | null>(null);
  const currentIdRef = useRef(initialAsset?.publicId ?? "");
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const overlayImageRef = useRef<HTMLImageElement | null>(null);
  const captionRef = useRef<HTMLParagraphElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const sampleUrlRef = useRef<string | null>(null);
  const sampleImageRef = useRef<HTMLImageElement | null>(null);

  const markReady = useCallback(() => {
    setReady(true);
  }, [setReady]);

  const beginPreload = useCallback(
    (excludePublicId: string) => {
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
    },
    [assets],
  );

  useEffect(() => {
    if (initialAsset) {
      beginPreload(initialAsset.publicId);
    } else {
      markReady();
    }
  }, [initialAsset, beginPreload, markReady]);

  useEffect(() => {
    const image = bgImageRef.current;
    if (image?.complete && image.naturalWidth > 0) {
      markReady();
    }
  }, [current?.url, markReady]);

  useEffect(() => {
    if (!overlay) {
      return;
    }
    const frame = requestAnimationFrame(() => setOverlayOpaque(true));
    return () => cancelAnimationFrame(frame);
  }, [overlay]);

  const updateMetaTone = useCallback(async () => {
    const shown = overlayOpaque && overlay ? overlay : current;
    if (!shown?.url) {
      return;
    }
    const textElements: HTMLElement[] = [];
    if (captionRef.current) textElements.push(captionRef.current);
    if (actionsRef.current) textElements.push(actionsRef.current);

    let sampleImage = sampleImageRef.current;
    if (!sampleImage || sampleUrlRef.current !== shown.url) {
      sampleImage = await loadSamplingImage(shown.url);
      sampleUrlRef.current = shown.url;
      sampleImageRef.current = sampleImage;
    }
    if (!sampleImage) return;

    const layoutImage =
      overlayOpaque && overlayImageRef.current
        ? overlayImageRef.current
        : bgImageRef.current;

    if (textElements.length > 0) {
      const tone = samplePhotoStageMetaTone(sampleImage, textElements, layoutImage);
      if (tone) setMetaTone(tone);
    }

    if (variant === "resume") {
      const chromeElements: HTMLElement[] = [];
      if (headerSampleRef.current) chromeElements.push(headerSampleRef.current);
      if (footerSampleRef.current) chromeElements.push(footerSampleRef.current);
      if (chromeElements.length > 0) {
        const chromeTone = samplePhotoStageMetaTone(
          sampleImage,
          chromeElements,
          layoutImage,
        );
        if (chromeTone) setChromeTone(chromeTone);
      }
    }
  }, [current, overlay, overlayOpaque, setChromeTone, variant]);

  useEffect(() => {
    void updateMetaTone();
    const onResize = () => {
      void updateMetaTone();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [current, overlay, overlayOpaque, updateMetaTone]);

  useEffect(() => {
    if (variant !== "resume") {
      setChromeTone(null);
      return;
    }
    return () => setChromeTone(null);
  }, [variant, setChromeTone]);

  function commit(next: ReadyPhoto) {
    setCurrent(next);
    currentIdRef.current = next.asset.publicId;
    setOverlay(null);
    setOverlayOpaque(false);
    setIsRefreshing(false);
    beginPreload(next.asset.publicId);
  }

  async function refreshPhoto() {
    if (isRefreshing || assets.length < 2) return;
    setIsRefreshing(true);
    let next = primedRef.current;
    primedRef.current = null;
    if (!next || next.asset.publicId === currentIdRef.current) {
      next = (await primingRef.current) ?? null;
    }
    if (!next || next.asset.publicId === currentIdRef.current) {
      const asset = selectHeroAsset(assets, currentIdRef.current);
      next = asset ? await preloadPhoto(asset) : null;
    }
    if (!next) {
      setIsRefreshing(false);
      return;
    }
    if (prefersReducedMotion()) {
      commit(next);
      return;
    }
    setOverlayOpaque(false);
    setOverlay(next);
  }

  const shown = overlay ?? current;
  const metaToneClass =
    metaTone === "dark" ? "photo-stage__meta--dark" : "photo-stage__meta--light";
  const panelClass =
    variant === "home" ? "photo-stage__panel frost-panel" : "photo-stage__panel";

  return (
    <div className={`photo-stage photo-stage--${variant}`}>
      {variant === "resume" ? (
        <>
          <div
            ref={headerSampleRef}
            className="photo-stage__chrome-sample photo-stage__chrome-sample--header"
            aria-hidden="true"
          />
          <div
            ref={footerSampleRef}
            className="photo-stage__chrome-sample photo-stage__chrome-sample--footer"
            aria-hidden="true"
          />
        </>
      ) : null}
      {current ? (
        <div className="photo-stage__bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={bgImageRef}
            className="photo-stage__bg-img"
            src={current.url}
            alt=""
            decoding="async"
            fetchPriority="high"
            onLoad={() => {
              markReady();
              void updateMetaTone();
            }}
          />
          {overlay ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={overlayImageRef}
              className={`photo-stage__bg-img photo-stage__bg-img--overlay${
                overlayOpaque ? " is-opaque" : ""
              }`}
              src={overlay.url}
              alt=""
              decoding="async"
              onLoad={() => {
                void updateMetaTone();
              }}
              onTransitionEnd={(event) => {
                if (event.propertyName === "opacity" && overlayOpaque) {
                  commit(overlay);
                }
              }}
            />
          ) : null}
        </div>
      ) : null}

      <div className={panelClass}>{children}</div>

      {shown ? (
        <aside className={`photo-stage__meta ${metaToneClass}`} aria-label="Featured photograph">
          <p ref={captionRef} className="photo-stage__caption type-md">
            <span>{shown.asset.caption}</span>
            <span>{shown.asset.date}</span>
          </p>
          <div ref={actionsRef} className="photo-stage__actions">
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
            <Link href={HERO_ALBUM_PATH} className="type-link photo-stage__all">
              all
              <br />
              photos
            </Link>
          </div>
          <figure className="photo-stage__thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shown.url}
              alt={shown.asset.caption}
              width={shown.asset.width}
              height={shown.asset.height}
              decoding="async"
            />
          </figure>
        </aside>
      ) : null}
    </div>
  );
}
