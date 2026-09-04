import type { Metadata } from "next";
import { EmptyState } from "@/components/content/EmptyState";
import { PhotoAlbumGallery } from "@/components/content/PhotoAlbumGallery";
import { getHeroAlbumAssets } from "@/cloudinary/lib/hero-album";
import { isCloudinaryAdminConfigured } from "@/lib/env";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";
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
      <div className="photos-page__body">
        <header className="photos-page__header">
          <h1 className="photos-page__title">My photo album</h1>
        </header>

        {!cloudinaryReady ? (
          <EmptyState
            title="Cloudinary not configured"
            description="Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local. Images must live in the hero folder with caption and date context metadata."
          />
        ) : assets.length === 0 ? (
          <EmptyState
            title="No photos yet"
            description="Add images to the Cloudinary hero folder with caption, date context, and tags."
          />
        ) : (
          <PhotoAlbumGallery assets={assets} />
        )}
      </div>
    </main>
  );
}
