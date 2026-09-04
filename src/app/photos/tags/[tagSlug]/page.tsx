import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoAlbumGallery } from "@/components/content/PhotoAlbumGallery";
import { formatTagLabel, slugMatchesTag } from "@/cloudinary/lib/album-tags";
import {
  getHeroAlbumAssetsByTag,
  getHeroAlbumTagSlugs,
} from "@/cloudinary/lib/hero-album";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";
import "@/styles/photos.css";

export const revalidate = 3600;

interface PhotoTagPageProps {
  params: Promise<{ tagSlug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getHeroAlbumTagSlugs();
  return slugs.map((tagSlug) => ({ tagSlug }));
}

export async function generateMetadata({
  params,
}: PhotoTagPageProps): Promise<Metadata> {
  const { tagSlug } = await params;
  const settings = await getSiteSettings();
  const assets = await getHeroAlbumAssetsByTag(tagSlug);
  const label =
    assets[0]?.tags.find((tag) => slugMatchesTag(tagSlug, tag)) ?? tagSlug;

  return buildMetadata(
    {
      title: formatPageTitle(formatTagLabel(label), settings.siteTitle),
      description: `Photos tagged ${formatTagLabel(label)}`,
      path: `/photos/tags/${tagSlug}`,
    },
    settings,
  );
}

export default async function PhotoTagPage({ params }: PhotoTagPageProps) {
  const { tagSlug } = await params;
  const assets = await getHeroAlbumAssetsByTag(tagSlug);

  if (assets.length === 0) {
    notFound();
  }

  const matchedTag =
    assets[0]?.tags.find((tag) => slugMatchesTag(tagSlug, tag)) ?? tagSlug;
  const tagLabel = formatTagLabel(matchedTag);

  return (
    <main id="main-content" className="photos-page">
      <div className="photos-page__body">
        <header className="photos-page__header">
          <p className="photos-page__breadcrumb">
            <Link className="photos-page__breadcrumb-link" href="/photos">
              My photo album
            </Link>
            <span className="photos-page__breadcrumb-sep" aria-hidden="true">
              {" "}
              &gt;{" "}
            </span>
            <span className="photos-page__breadcrumb-tag">{tagLabel}</span>
          </p>
        </header>

        <PhotoAlbumGallery assets={assets} />
      </div>
    </main>
  );
}
