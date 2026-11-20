"use client";

import Link from "next/link";
import Dither from "@/components/effects/Dither";
import { HazeText } from "@/components/effects/HazeText";
import { MediaRenderer } from "@/components/media/MediaRenderer";
import {
  DITHER_BASE,
  ditherWaveJitter,
  PORTFOLIO_DITHER_THEMES,
} from "@/content/portfolio-dither";
import { formatMonthYear } from "@/lib/format-date";
import type { PortfolioPostSummary } from "@/types/content";

interface PortfolioCardProps {
  post: PortfolioPostSummary;
  placeholderIndex?: number;
}

function hasRenderableCover(post: PortfolioPostSummary): boolean {
  const media = post.coverMedia;
  if (!media) return false;
  if (media.kind === "cloudinary-image") return Boolean(media.publicId);
  if (media.kind === "local-image") return Boolean(media.src);
  return false;
}

/** Display as "Lenovo / Chicago (Remote)" instead of "lenovo / remote (chicago)". */
function formatWhere(client?: string, location?: string): string | null {
  const brand = client?.trim();
  const place = location?.trim();
  if (!brand && !place) return null;

  const remoteCity = place?.match(/^remote\s*\((.+)\)$/i);
  if (brand && remoteCity) {
    return `${titleCase(brand)} / ${titleCase(remoteCity[1]!.trim())} (Remote)`;
  }

  const cityRemote = place?.match(/^(.+?)\s*\/\s*remote$/i);
  if (brand && cityRemote) {
    return `${titleCase(brand)} / ${titleCase(cityRemote[1]!.trim())} (Remote)`;
  }

  return [brand, place].filter(Boolean).join(" / ");
}

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

export function PortfolioCard({ post, placeholderIndex = 0 }: PortfolioCardProps) {
  const date = formatMonthYear(post.publishedAt);
  const href = `/portfolio/${post.slug}`;
  const theme =
    PORTFOLIO_DITHER_THEMES[placeholderIndex % PORTFOLIO_DITHER_THEMES.length] ??
    PORTFOLIO_DITHER_THEMES[0]!;
  const waves = ditherWaveJitter(placeholderIndex);
  const where = formatWhere(post.client, post.location);
  const showCover = hasRenderableCover(post);

  return (
    <article className="portfolio-card">
      <div className="portfolio-card__meta type-sm">
        {where ? <p className="portfolio-card__where">{where}</p> : null}
        {date ? <p className="portfolio-card__date">{date}</p> : null}
      </div>

      <Link
        href={href}
        className="portfolio-card__media"
        aria-label={`Open project: ${post.title}`}
      >
        {showCover && post.coverMedia ? (
          <MediaRenderer media={post.coverMedia} variant="full" />
        ) : (
          <Dither
            className="portfolio-card__dither"
            waveColor={theme.waveColor}
            backgroundColor={theme.backgroundColor}
            ditherMode={DITHER_BASE.ditherMode}
            colorNum={DITHER_BASE.colorNum}
            pixelSize={DITHER_BASE.pixelSize}
            waveSpeed={DITHER_BASE.waveSpeed}
            waveFrequency={waves.waveFrequency}
            waveAmplitude={waves.waveAmplitude}
            mouseEffect={DITHER_BASE.mouseEffect}
            mouseRadius={DITHER_BASE.mouseRadius}
            mouseStrength={DITHER_BASE.mouseStrength}
            trail={DITHER_BASE.trail}
            enableMouseInteraction={DITHER_BASE.enableMouseInteraction}
            intro={false}
            aria-hidden
          />
        )}
      </Link>

      <h2 className="portfolio-card__title type-title">
        <Link href={href} className="portfolio-card__title-link">
          {post.title}
        </Link>
      </h2>
      {post.summary ? (
        <HazeText as="p" className="portfolio-card__summary type-md">
          {post.summary}
        </HazeText>
      ) : null}
      <Link href={href} className="type-link portfolio-card__link">
        read more
        <span className="visually-hidden">: {post.title}</span>
      </Link>
    </article>
  );
}
