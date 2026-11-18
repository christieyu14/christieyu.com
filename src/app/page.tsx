import type { Metadata } from "next";
import { HomeIntro } from "@/components/content/HomeIntro";
import { HomeRainStage } from "@/components/content/HomeRainStage";
import { getHeroAlbumAssets, selectHeroAsset } from "@/cloudinary/lib/hero-album";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";
import "@/styles/photo-stage.css";
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
    <main id="main-content">
      <HomeRainStage assets={assets} initialAsset={initialAsset}>
        <HomeIntro />
      </HomeRainStage>
    </main>
  );
}
