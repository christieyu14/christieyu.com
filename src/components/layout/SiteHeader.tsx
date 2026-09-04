"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FlowerIcon,
  GitHubStarIcon,
  LinkedInStarIcon,
} from "@/components/icons";
import type { NavigationItem, SiteSettings, SocialLink } from "@/types/site";
import { DEFAULT_NAVIGATION, DEFAULT_SITE_SETTINGS } from "@/types/site";

interface SiteHeaderProps {
  settings: SiteSettings;
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const SOCIAL_DEFAULTS: Record<string, string> = Object.fromEntries(
  DEFAULT_SITE_SETTINGS.socialLinks.map((link) => [
    link.platform.toLowerCase(),
    link.url,
  ]),
);

function resolveSocialUrl(link: SocialLink): string {
  const key = link.platform.toLowerCase();
  const fallback = SOCIAL_DEFAULTS[key];
  if (!fallback) {
    return link.url;
  }
  if (
    link.url === "https://github.com" ||
    link.url === "https://www.linkedin.com" ||
    link.url === "https://linkedin.com"
  ) {
    return fallback;
  }
  return link.url;
}

function SocialIcon({ platform }: { platform: string }) {
  const key = platform.toLowerCase();
  if (key === "github") {
    return <GitHubStarIcon size={24} />;
  }
  if (key === "linkedin") {
    return <LinkedInStarIcon size={24} />;
  }
  return null;
}

function socialIconSupported(platform: string): boolean {
  const key = platform.toLowerCase();
  return key === "github" || key === "linkedin";
}

const HEADER_STAGGER_MS = 140;

function itemClass(visible: boolean): string {
  return `site-header__item${visible ? " is-visible" : ""}`;
}

export function SiteHeader({ settings }: SiteHeaderProps) {
  const pathname = usePathname();

  const navigation: NavigationItem[] =
    settings.navigation.length > 0 ? settings.navigation : DEFAULT_NAVIGATION;

  const socialLinks: SocialLink[] = settings.socialLinks.filter((link) =>
    socialIconSupported(link.platform),
  );

  const totalItems = 1 + navigation.length + socialLinks.length;
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealedCount(totalItems);
      return;
    }

    setRevealedCount(0);
    let count = 0;
    let timer = 0;

    const scheduleNext = (delay: number) => {
      timer = window.setTimeout(() => {
        count += 1;
        setRevealedCount(count);
        if (count < totalItems) {
          scheduleNext(HEADER_STAGGER_MS);
        }
      }, delay);
    };

    scheduleNext(40);
    return () => window.clearTimeout(timer);
  }, [totalItems]);

  return (
    <header className="site-header">
      <div className="site-header__inner page-frame">
        <Link
          href="/"
          className={`site-header__brand ${itemClass(revealedCount > 0)}`}
        >
          <span className="site-header__brand-label">Christie Yu</span>
          <FlowerIcon className="site-header__brand-mark" />
        </Link>
        <nav className="site-header__nav-wrap" aria-label="Primary">
          <ul className="site-nav__list">
            {navigation.map((item, index) => {
              const isActive = isActivePath(pathname, item.href);
              return (
                <li
                  key={item.href}
                  className={itemClass(revealedCount > 1 + index)}
                >
                  <Link
                    href={item.href}
                    className="site-nav__link"
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <ul className="site-header__social" aria-label="Social">
          {socialLinks.map((link, index) => {
            const icon = <SocialIcon platform={link.platform} />;
            if (!icon) {
              return null;
            }
            return (
              <li
                key={`${link.platform}-${link.url}`}
                className={itemClass(
                  revealedCount > 1 + navigation.length + index,
                )}
              >
                <a
                  className="site-nav__social-link"
                  href={resolveSocialUrl(link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label ?? link.platform}
                >
                  {icon}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
