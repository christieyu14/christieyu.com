import type { Metadata } from "next";
import { EmptyState } from "@/components/content/EmptyState";
import { PhotosCarousel } from "@/components/content/PhotosCarousel";
import { getHeroAlbumAssets } from "@/cloudinary/lib/hero-album";
import { isCloudinaryAdminConfigured } from "@/lib/env";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";
import "@/styles/contact.css";
import "@/styles/photos.css";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: formatPageTitle("Photos", settings.siteTitle),
      description: "Photo album",
      path: "/photos",
    },
    settings,
  );
}

export default async function PhotosPage() {
  const cloudinaryReady = isCloudinaryAdminConfigured();
  const assets = cloudinaryReady ? await getHeroAlbumAssets() : [];

  return (
    <main id="main-content" className="photos-page">
      <h1 className="visually-hidden">My photo album</h1>

      {!cloudinaryReady ? (
        <div className="content-page">
          <EmptyState
            title="Cloudinary not configured"
            description="Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local. Images must live in the hero folder with caption and date context metadata."
          />
        </div>
      ) : assets.length === 0 ? (
        <div className="content-page">
          <EmptyState
            title="No photos yet"
            description="Add images to the Cloudinary hero folder with caption, date context, and tags."
          />
        </div>
      ) : (
        <PhotosCarousel assets={assets} />
      )}
    </main>
  );
}
