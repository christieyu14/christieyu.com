import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { getPhotoAlbumSlugs, getPortfolioPostSlugs } from "@/sanity/lib/fetch";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const [portfolioSlugs, photoSlugs] = await Promise.all([
    getPortfolioPostSlugs(),
    getPhotoAlbumSlugs(),
  ]);

  const staticRoutes = ["", "/work", "/photos", "/about", "/resume", "/contact"];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path || "/"}`,
    lastModified: new Date(),
  }));

  for (const slug of portfolioSlugs) {
    entries.push({
      url: `${baseUrl}/work/${slug}`,
      lastModified: new Date(),
    });
  }

  for (const slug of photoSlugs) {
    entries.push({
      url: `${baseUrl}/photos/${slug}`,
      lastModified: new Date(),
    });
  }

  return entries;
}
