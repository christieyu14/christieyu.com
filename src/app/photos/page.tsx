import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/content/EmptyState";
import { MediaRenderer } from "@/components/media/MediaRenderer";
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
  const albums = await getPhotoAlbums();

  return (
    <main id="main-content" className="container" style={{ paddingBlock: "2rem" }}>
      <header className="page-header">
        <h1 className="page-title">Photos</h1>
      </header>

      {albums.length === 0 ? (
        <EmptyState
          title="No photo albums yet"
          description="Connect Sanity and publish photo albums to populate this page."
        />
      ) : (
        <ul>
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
