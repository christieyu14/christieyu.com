import { normalizeCloudinaryAsset } from "@/lib/media-normalize";
import { slugFromSanity } from "@/lib/slugs";
import type {
  PhotoAlbum,
  PhotoAlbumSummary,
  PortfolioPost,
  PortfolioPostSummary,
} from "@/types/content";
import type { SiteSettings } from "@/types/site";
import { DEFAULT_NAVIGATION, DEFAULT_SITE_SETTINGS } from "@/types/site";
import { getPublishedSanityClient, getSanityFetchClient } from "@/sanity/lib/live";
import {
  featuredPortfolioPostsQuery,
  photoAlbumBySlugQuery,
  photoAlbumSlugsQuery,
  photoAlbumsQuery,
  portfolioPostBySlugQuery,
  portfolioPostSlugsQuery,
  portfolioPostsQuery,
  siteSettingsQuery,
} from "@/sanity/queries";
import type { PortableTextBlock } from "@portabletext/types";

interface SanitySiteSettingsResponse {
  siteTitle?: string;
  siteDescription?: string;
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  navigation?: { label?: string; href?: string }[];
  socialLinks?: { platform?: string; url?: string; label?: string }[];
  contactEmail?: string;
  resumeAsset?: Parameters<typeof normalizeCloudinaryAsset>[0];
  defaultOgImage?: string;
}

interface SanityPortfolioSummaryResponse {
  _id: string;
  title?: string;
  slug?: string;
  summary?: string;
  publishedAt?: string;
  projectYear?: number;
  client?: string;
  role?: string;
  featured?: boolean;
  coverMedia?: Parameters<typeof normalizeCloudinaryAsset>[0];
}

interface SanityPortfolioPostResponse extends SanityPortfolioSummaryResponse {
  duration?: string;
  disciplines?: string[];
  body?: PortableTextBlock[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  relatedProjects?: SanityPortfolioSummaryResponse[];
}

interface SanityPhotoAlbumSummaryResponse {
  _id: string;
  title?: string;
  slug?: string;
  summary?: string;
  date?: string;
  dateRange?: { start?: string; end?: string };
  location?: string;
  featured?: boolean;
  coverMedia?: Parameters<typeof normalizeCloudinaryAsset>[0];
}

interface SanityPhotoAlbumResponse extends SanityPhotoAlbumSummaryResponse {
  seoTitle?: string;
  seoDescription?: string;
  photos?: {
    _key: string;
    publicId?: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  }[];
}

function mapSiteSettings(data: SanitySiteSettingsResponse | null): SiteSettings {
  if (!data) {
    return DEFAULT_SITE_SETTINGS;
  }

  const navigation =
    data.navigation
      ?.filter((item) => item.label && item.href)
      .map((item) => ({
        label: item.label as string,
        href: item.href as string,
      })) ?? DEFAULT_NAVIGATION;

  return {
    siteTitle: data.siteTitle ?? DEFAULT_SITE_SETTINGS.siteTitle,
    siteDescription: data.siteDescription ?? DEFAULT_SITE_SETTINGS.siteDescription,
    defaultSeoTitle: data.defaultSeoTitle ?? DEFAULT_SITE_SETTINGS.defaultSeoTitle,
    defaultSeoDescription:
      data.defaultSeoDescription ?? DEFAULT_SITE_SETTINGS.defaultSeoDescription,
    navigation,
    socialLinks:
      data.socialLinks
        ?.filter((link) => link.platform && link.url)
        .map((link) => ({
          platform: link.platform as string,
          url: link.url as string,
          label: link.label,
        })) ?? [],
    contactEmail: data.contactEmail,
    resumeAsset: normalizeCloudinaryAsset(data.resumeAsset),
    defaultOgImage: data.defaultOgImage,
  };
}

function mapPortfolioSummary(
  data: SanityPortfolioSummaryResponse,
): PortfolioPostSummary {
  return {
    _id: data._id,
    title: data.title ?? "Untitled",
    slug: slugFromSanity(data.slug ?? ""),
    summary: data.summary,
    publishedAt: data.publishedAt,
    projectYear: data.projectYear,
    client: data.client,
    role: data.role,
    featured: data.featured,
    coverMedia: normalizeCloudinaryAsset(data.coverMedia),
  };
}

function mapPortfolioPost(data: SanityPortfolioPostResponse): PortfolioPost {
  return {
    ...mapPortfolioSummary(data),
    duration: data.duration,
    disciplines: data.disciplines,
    body: data.body,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    ogImage: data.ogImage,
    relatedProjects: data.relatedProjects?.map(mapPortfolioSummary),
  };
}

function mapPhotoAlbumSummary(
  data: SanityPhotoAlbumSummaryResponse,
): PhotoAlbumSummary {
  return {
    _id: data._id,
    title: data.title ?? "Untitled",
    slug: slugFromSanity(data.slug ?? ""),
    summary: data.summary,
    date: data.date,
    dateRange: data.dateRange,
    location: data.location,
    featured: data.featured,
    coverMedia: normalizeCloudinaryAsset(data.coverMedia),
  };
}

function mapPhotoAlbum(data: SanityPhotoAlbumResponse): PhotoAlbum {
  return {
    ...mapPhotoAlbumSummary(data),
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    photos:
      data.photos
        ?.filter((photo) => photo.publicId)
        .map((photo) => ({
          _key: photo._key,
          publicId: photo.publicId as string,
          alt: photo.alt,
          caption: photo.caption,
          width: photo.width,
          height: photo.height,
        })) ?? [],
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const sanityClient = await getSanityFetchClient();
  if (!sanityClient) {
    return DEFAULT_SITE_SETTINGS;
  }

  const data = await sanityClient.fetch<SanitySiteSettingsResponse | null>(
    siteSettingsQuery,
  );

  return mapSiteSettings(data);
}

export async function getFeaturedPortfolioPosts(): Promise<PortfolioPostSummary[]> {
  const sanityClient = await getSanityFetchClient();
  if (!sanityClient) {
    return [];
  }

  const data = await sanityClient.fetch<SanityPortfolioSummaryResponse[]>(
    featuredPortfolioPostsQuery,
  );

  return data.map(mapPortfolioSummary);
}

export async function getPortfolioPosts(): Promise<PortfolioPostSummary[]> {
  const sanityClient = await getSanityFetchClient();
  if (!sanityClient) {
    return [];
  }

  const data =
    await sanityClient.fetch<SanityPortfolioSummaryResponse[]>(portfolioPostsQuery);

  return data.map(mapPortfolioSummary);
}

export async function getPortfolioPostBySlug(
  slug: string,
): Promise<PortfolioPost | null> {
  const sanityClient = await getSanityFetchClient();
  if (!sanityClient) {
    return null;
  }

  const data = await sanityClient.fetch<SanityPortfolioPostResponse | null>(
    portfolioPostBySlugQuery,
    { slug },
  );

  if (!data) {
    return null;
  }

  return mapPortfolioPost(data);
}

export async function getPortfolioPostSlugs(): Promise<string[]> {
  const sanityClient = getPublishedSanityClient();
  if (!sanityClient) {
    return [];
  }

  const data = await sanityClient.fetch<{ slug?: string }[]>(portfolioPostSlugsQuery);

  return data
    .map((entry) => entry.slug)
    .filter((slug): slug is string => Boolean(slug));
}

export async function getPhotoAlbums(): Promise<PhotoAlbumSummary[]> {
  const sanityClient = await getSanityFetchClient();
  if (!sanityClient) {
    return [];
  }

  const data =
    await sanityClient.fetch<SanityPhotoAlbumSummaryResponse[]>(photoAlbumsQuery);

  return data.map(mapPhotoAlbumSummary);
}

export async function getPhotoAlbumBySlug(slug: string): Promise<PhotoAlbum | null> {
  const sanityClient = await getSanityFetchClient();
  if (!sanityClient) {
    return null;
  }

  const data = await sanityClient.fetch<SanityPhotoAlbumResponse | null>(
    photoAlbumBySlugQuery,
    { slug },
  );

  if (!data) {
    return null;
  }

  return mapPhotoAlbum(data);
}

export async function getPhotoAlbumSlugs(): Promise<string[]> {
  const sanityClient = getPublishedSanityClient();
  if (!sanityClient) {
    return [];
  }

  const data = await sanityClient.fetch<{ slug?: string }[]>(photoAlbumSlugsQuery);

  return data
    .map((entry) => entry.slug)
    .filter((slug): slug is string => Boolean(slug));
}
