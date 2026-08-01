import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/content/EmptyState";
import { HeroAlbumGallery } from "@/components/content/HeroAlbumGallery";
import { getHeroAlbumAssets } from "@/cloudinary/lib/hero-album";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";
import "@/styles/hero-album.css";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: formatPageTitle("Hero", settings.siteTitle),
      description: "Featured photographs from the Hero album",
      path: "/photos/hero",
    },
    settings,
  );
}

export default async function HeroAlbumPage() {
  const assets = await getHeroAlbumAssets();

  return (
    <main id="main-content" className="hero-album">
      <header className="hero-album__header">
        <p className="hero-album__eyebrow">
          <Link href="/photos">Photos</Link>
        </p>
        <h1 className="hero-album__title">Hero</h1>
        <p className="hero-album__summary">
          Photographs used on the homepage. Each image includes a caption and date.
        </p>
      </header>

      {assets.length === 0 ? (
        <EmptyState
          title="No hero photos yet"
          description="Add images to the Cloudinary hero folder with caption and date context metadata."
        />
      ) : (
        <HeroAlbumGallery assets={assets} />
      )}
    </main>
  );
}
