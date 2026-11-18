"use client";

import { HazeText } from "@/components/effects/HazeText";
import type { SiteSettings, SocialLink } from "@/types/site";
import { DEFAULT_SITE_SETTINGS } from "@/types/site";
import { useChromeTone } from "./ChromeToneContext";

interface SiteFooterProps {
  settings: SiteSettings;
}

const SOCIAL_ICONS: Record<string, { file: string; width: number; height: number }> = {
  github: { file: "github", width: 24, height: 24 },
  linkedin: { file: "linkedin", width: 25.03, height: 24.31 },
};

const PLACEHOLDER_SOCIAL_URLS = new Set([
  "https://github.com",
  "https://www.linkedin.com",
  "https://linkedin.com",
]);

function resolveSocialLinks(settings: SiteSettings): SocialLink[] {
  const fromSettings = settings.socialLinks.filter(
    (link) => link.platform.toLowerCase() in SOCIAL_ICONS,
  );
  if (fromSettings.length === 0) {
    return DEFAULT_SITE_SETTINGS.socialLinks;
  }
  return fromSettings.map((link) => {
    if (!PLACEHOLDER_SOCIAL_URLS.has(link.url)) {
      return link;
    }
    const fallback = DEFAULT_SITE_SETTINGS.socialLinks.find(
      (entry) => entry.platform === link.platform.toLowerCase(),
    );
    return fallback ? { ...link, url: fallback.url } : link;
  });
}

export function SiteFooter({ settings }: SiteFooterProps) {
  const tone = useChromeTone();
  const iconSuffix = tone === "light" ? "-light" : "";
  const socialLinks = resolveSocialLinks(settings);

  return (
    <footer className={`site-footer site-footer--${tone}`}>
      <div className="site-footer__bar">
        <p className="site-footer__rights type-sm">
          <HazeText as="span" className="haze-text--inline">
            all rights reserved.
          </HazeText>
        </p>
        <ul className="site-social" aria-label="Social">
          {socialLinks.map((link) => {
            const icon = SOCIAL_ICONS[link.platform.toLowerCase()];
            if (!icon) {
              return null;
            }
            return (
              <li key={link.platform}>
                <a
                  className="site-social__link"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label ?? link.platform}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="site-social__icon"
                    src={`/icons/${icon.file}${iconSuffix}.svg`}
                    alt=""
                    width={icon.width}
                    height={icon.height}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </footer>
  );
}
