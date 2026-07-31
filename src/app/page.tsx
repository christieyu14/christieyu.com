import type { Metadata } from "next";
import { HomeHero } from "@/components/content/HomeHero";
import { HomeIntro } from "@/components/content/HomeIntro";
import { EmptyState } from "@/components/content/EmptyState";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getRandomFeaturedPhoto } from "@/lib/featured-photos";
import { getSiteSettings } from "@/sanity/lib/fetch";
import "@/styles/home.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: formatPageTitle(undefined, settings.siteTitle),
      description: settings.siteDescription,
      path: "/",
      ogImage: settings.defaultOgImage,
    },
    settings,
  );
}

export default async function HomePage() {
  const featuredPhoto = getRandomFeaturedPhoto();

  return (
    <main id="main-content" className="home">
      {featuredPhoto ? (
        <HomeHero photo={featuredPhoto} />
      ) : (
        <EmptyState
          title="No featured photos yet"
          description="Add entries to FEATURED_PHOTO_POOL in src/content/featured-photos.ts."
        />
      )}
      <HomeIntro />
    </main>
  );
}
