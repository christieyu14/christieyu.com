import type { Metadata } from "next";
import { HomeHero } from "@/components/content/HomeHero";
import { HomeIntro } from "@/components/content/HomeIntro";
import { HomeProjects } from "@/components/content/HomeProjects";
import { EmptyState } from "@/components/content/EmptyState";
import {
  getHeroAlbumAssets,
  selectHeroAsset,
} from "@/cloudinary/lib/hero-album";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
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
  const assets = await getHeroAlbumAssets();
  const initialAsset = selectHeroAsset(assets);

  return (
    <main id="main-content" className="home">
      <div className="home__top page-frame">
        {initialAsset ? (
          <HomeHero assets={assets} initialAsset={initialAsset} />
        ) : (
          <EmptyState
            title="No hero photos yet"
            description="Add images to the Cloudinary hero folder with caption and date context metadata."
          />
        )}
        <HomeIntro />
      </div>
      <HomeProjects />
    </main>
  );
}
