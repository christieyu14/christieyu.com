import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/content/EmptyState";
import { MediaRenderer } from "@/components/media/MediaRenderer";
import { getHeroAlbumPhotos } from "@/cloudinary/lib/hero-album";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getPhotoAlbums, getSiteSettings } from "@/sanity/lib/fetch";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: formatPageTitle("Photos", settings.siteTitle),
      description: "Photo albums",
      path: "/photos",
    },
    settings,
  );
}

export default async function PhotosPage() {
  const [albums, heroPhotos] = await Promise.all([
    getPhotoAlbums(),
    getHeroAlbumPhotos(),
  ]);
  const hasHeroAlbum = heroPhotos.length > 0;
  const hasAnyAlbums = hasHeroAlbum || albums.length > 0;

  return (
    <main id="main-content" className="container" style={{ paddingBlock: "2rem" }}>
      <header className="page-header">
        <h1 className="page-title">Photos</h1>
      </header>

      {!hasAnyAlbums ? (
        <EmptyState
          title="No photo albums yet"
          description="Add Cloudinary hero images or publish Sanity photo albums."
        />
      ) : (
        <ul>
          {hasHeroAlbum ? (
            <li>
              <article>
                <h2>
                  <Link href="/photos/hero">Hero</Link>
                </h2>
                <p>Homepage featured photographs from Cloudinary.</p>
              </article>
            </li>
          ) : null}
          {albums.map((album) => (
            <li key={album._id}>
              <article>
                <h2>
                  <Link href={`/photos/${album.slug}`}>{album.title}</Link>
                </h2>
                {album.summary ? <p>{album.summary}</p> : null}
                {album.coverMedia ? (
                  <MediaRenderer media={album.coverMedia} variant="thumbnail" />
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
