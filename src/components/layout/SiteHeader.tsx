"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavigationItem, SiteSettings, SocialLink } from "@/types/site";
import { DEFAULT_NAVIGATION } from "@/types/site";

interface SiteHeaderProps {
  settings: SiteSettings;
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function socialIconSrc(platform: string): string | undefined {
  const key = platform.toLowerCase();
  if (key === "github") {
    return "/icons/github.svg";
  }
  if (key === "linkedin") {
    return "/icons/linkedin.svg";
  }
  return undefined;
}

export function SiteHeader({ settings }: SiteHeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolledPastTop, setScrolledPastTop] = useState(false);

  useEffect(() => {
    if (!isHome) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    /**
     * Tall top sentinel + only commit when the boolean actually changes.
     * Avoids threshold flicker and the old scrollY ↔ header-height feedback loop.
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }
        const next = !entry.isIntersecting;
        setScrolledPastTop((prev) => (prev === next ? prev : next));
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px",
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isHome]);

  const compact = !isHome || scrolledPastTop;

  const navigation: NavigationItem[] =
    settings.navigation.length > 0 ? settings.navigation : DEFAULT_NAVIGATION;

  const socialLinks: SocialLink[] = settings.socialLinks.filter((link) =>
    Boolean(socialIconSrc(link.platform)),
  );

  return (
    <>
      <div ref={sentinelRef} className="site-header-sentinel" aria-hidden="true" />
      <header className="site-header" data-compact={compact ? "true" : "false"}>
        <div className="site-header__inner page-frame">
          <Link href="/" className="site-header__brand">
            <span className="site-header__brand-label">Christie Yu</span>
          </Link>
          <nav className="site-header__nav-wrap" aria-label="Primary">
            <ul className="site-nav__list">
              {navigation.map((item) => {
                const isActive = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
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
              {socialLinks.map((link) => {
                const icon = socialIconSrc(link.platform);
                if (!icon) {
                  return null;
                }
                return (
                  <li
                    key={`${link.platform}-${link.url}`}
                    className="site-nav__social-item"
                  >
                    <a
                      className="site-nav__social-link"
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label ?? link.platform}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={icon} alt="" width={24} height={24} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
