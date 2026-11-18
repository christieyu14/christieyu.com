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

export function PortfolioCard({ post, placeholderIndex = 0 }: PortfolioCardProps) {
  const date = formatMonthYear(post.publishedAt);
  const href = `/portfolio/${post.slug}`;
  const theme =
    PORTFOLIO_DITHER_THEMES[placeholderIndex % PORTFOLIO_DITHER_THEMES.length] ??
    PORTFOLIO_DITHER_THEMES[0]!;
  const waves = ditherWaveJitter(placeholderIndex);
  const where = [post.client, post.location].filter(Boolean).join(" / ");
  const showCover = hasRenderableCover(post);

  return (
    <article className="portfolio-card">
      <div className="portfolio-card__meta type-sm">
        {where ? (
          <p className="portfolio-card__where">
            <HazeText as="span" className="haze-text--inline">
              {where}
            </HazeText>
          </p>
        ) : null}
        {date ? (
          <p className="portfolio-card__date">
            <HazeText as="span" className="haze-text--inline">
              {date}
            </HazeText>
          </p>
        ) : null}
      </div>

      <div className="portfolio-card__media">
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
      </div>

      <h2 className="portfolio-card__title type-title">
        <HazeText as="span" className="haze-text--inline">
          {post.title}
        </HazeText>
      </h2>
      {post.summary ? (
        <HazeText as="p" className="portfolio-card__summary type-md">
          {post.summary}
        </HazeText>
      ) : null}
      <Link href={href} className="type-link portfolio-card__link">
        <HazeText as="span" className="haze-text--inline">
          read more
        </HazeText>
        <span className="visually-hidden">: {post.title}</span>
      </Link>
    </article>
  );
}
