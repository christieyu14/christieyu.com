import type { PortableTextBlock } from "@portabletext/types";
import type { NormalizedMedia } from "./media";
import type { SeoFields } from "./seo";

export interface PortfolioPostSummary {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  publishedAt?: string;
  projectYear?: number;
  client?: string;
  role?: string;
  featured?: boolean;
  coverMedia?: NormalizedMedia;
}

export interface PortfolioPost extends PortfolioPostSummary, SeoFields {
  duration?: string;
  disciplines?: string[];
  body?: PortableTextBlock[];
  relatedProjects?: PortfolioPostSummary[];
}

export interface PhotoAlbumPhoto {
  _key: string;
  publicId: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface PhotoAlbumSummary {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  date?: string;
  dateRange?: { start?: string; end?: string };
  location?: string;
  featured?: boolean;
  coverMedia?: NormalizedMedia;
}

export interface PhotoAlbum extends PhotoAlbumSummary, SeoFields {
  photos: PhotoAlbumPhoto[];
}

export type PortfolioBodyBlockType =
  | "block"
  | "imageGallery"
  | "singleMedia"
  | "cloudinaryAlbumRef"
  | "pullQuote"
  | "projectFacts"
  | "projectMetrics"
  | "prototypeEmbed"
  | "twoColumnEditorial"
  | "beforeAfterComparison";
