"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  // Prefer concrete profile URLs over bare platform homepages from CMS defaults.
  if (
    link.url === "https://github.com" ||
    link.url === "https://www.linkedin.com" ||
    link.url === "https://linkedin.com"
  ) {
    return fallback;
  }
  return link.url;
}

function GitHubIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 0.297C5.37 0.297 0 5.67 0 12.297C0 17.6 3.438 22.097 8.205 23.682C8.805 23.795 9.025 23.424 9.025 23.105C9.025 22.82 9.015 22.065 9.01 21.065C5.672 21.789 4.968 19.455 4.968 19.455C4.422 18.07 3.633 17.7 3.633 17.7C2.546 16.956 3.717 16.971 3.717 16.971C4.922 17.055 5.555 18.207 5.555 18.207C6.625 20.042 8.364 19.512 9.05 19.205C9.158 18.429 9.467 17.9 9.81 17.6C7.145 17.3 4.344 16.268 4.344 11.67C4.344 10.36 4.809 9.29 5.579 8.45C5.444 8.147 5.039 6.927 5.684 5.274C5.684 5.274 6.689 4.952 8.984 6.504C9.944 6.237 10.964 6.105 11.984 6.099C13.004 6.105 14.024 6.237 14.984 6.504C17.264 4.952 18.269 5.274 18.269 5.274C18.914 6.927 18.509 8.147 18.389 8.45C19.154 9.29 19.619 10.36 19.619 11.67C19.619 16.28 16.814 17.295 14.144 17.59C14.564 17.95 14.954 18.686 14.954 19.81C14.954 21.416 14.939 22.706 14.939 23.096C14.939 23.411 15.149 23.786 15.764 23.666C20.565 22.092 24 17.592 24 12.297C24 5.67 18.627 0.297 12 0.297Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill="currentColor"
      />
      <path
        d="M19.1699 12.9656V17.9129H16.3015V13.2972C16.3015 12.1382 15.8874 11.3467 14.8489 11.3467C14.0563 11.3467 13.5855 11.8796 13.3776 12.3955C13.3021 12.5799 13.2826 12.836 13.2826 13.0946V17.9127H10.4141C10.4141 17.9127 10.4526 10.0951 10.4141 9.28589H13.2828V10.5084C13.2771 10.518 13.2689 10.5274 13.2638 10.5366H13.2828V10.5084C13.664 9.92185 14.3438 9.08332 15.8679 9.08332C17.7551 9.08332 19.1699 10.3163 19.1699 12.9656ZM7.41331 5.12746C6.4321 5.12746 5.79015 5.77154 5.79015 6.61778C5.79015 7.44604 6.41349 8.10874 7.37566 8.10874H7.39427C8.39474 8.10874 9.01679 7.44604 9.01679 6.61778C8.99775 5.77154 8.39474 5.12746 7.41331 5.12746ZM5.96064 17.9129H8.82812V9.28589H5.96064V17.9129Z"
        fill="white"
      />
    </svg>
  );
}

function socialIconSupported(platform: string): boolean {
  const key = platform.toLowerCase();
  return key === "github" || key === "linkedin";
}

function SocialIcon({ platform }: { platform: string }) {
  const key = platform.toLowerCase();
  if (key === "github") {
    return <GitHubIcon />;
  }
  if (key === "linkedin") {
    return <LinkedInIcon />;
  }
  return null;
}

export function SiteHeader({ settings }: SiteHeaderProps) {
  const pathname = usePathname();

  const navigation: NavigationItem[] =
    settings.navigation.length > 0 ? settings.navigation : DEFAULT_NAVIGATION;

  const socialLinks: SocialLink[] = settings.socialLinks.filter((link) =>
    socialIconSupported(link.platform),
  );

  return (
    <header className="site-header">
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
              const icon = <SocialIcon platform={link.platform} />;
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
        </nav>
      </div>
    </header>
  );
}
