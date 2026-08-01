import type { NormalizedMedia } from "./media";

export interface NavigationItem {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  label?: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  navigation: NavigationItem[];
  socialLinks: SocialLink[];
  contactEmail?: string;
  resumeAsset?: NormalizedMedia;
  defaultOgImage?: string;
}

export const DEFAULT_NAVIGATION: NavigationItem[] = [
  { label: "resume", href: "/resume" },
  { label: "portfolio", href: "/work" },
  { label: "album", href: "/photos" },
  { label: "contact", href: "/contact" },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: "Christie Yu",
  siteDescription: "Product designer",
  defaultSeoTitle: "Christie Yu",
  defaultSeoDescription: "Product designer",
  navigation: DEFAULT_NAVIGATION,
  socialLinks: [
    {
      platform: "github",
      url: "https://github.com/christieyu14",
      label: "GitHub",
    },
    {
      platform: "linkedin",
      url: "https://www.linkedin.com/in/christieyu/",
      label: "LinkedIn",
    },
  ],
};
