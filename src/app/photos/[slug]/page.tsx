import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/content/EmptyState";
import { MediaRenderer } from "@/components/media/MediaRenderer";
import { buildCloudinaryUrl } from "@/cloudinary/lib/url";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { isValidSlug } from "@/lib/slugs";
import {
  getPhotoAlbumBySlug,
  getPhotoAlbumSlugs,
  getSiteSettings,
} from "@/sanity/lib/fetch";

interface PhotoAlbumPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPhotoAlbumSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PhotoAlbumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [settings, album] = await Promise.all([
    getSiteSettings(),
    getPhotoAlbumBySlug(slug),
  ]);

  if (!album) {
    return buildMetadata(
      {
        title: formatPageTitle("Album not found", settings.siteTitle),
        path: `/photos/${slug}`,
        noIndex: true,
      },
      settings,
    );
  }

  return buildMetadata(
    {
      title: formatPageTitle(album.seoTitle ?? album.title, settings.siteTitle),
      description: album.seoDescription ?? album.summary,
      path: `/photos/${slug}`,
    },
    settings,
  );
}

export default async function PhotoAlbumPage({ params }: PhotoAlbumPageProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  const album = await getPhotoAlbumBySlug(slug);

  if (!album) {
    notFound();
  }

  return (
    <main id="main-content" className="container" style={{ paddingBlock: "2rem" }}>
      <article>
        <header className="page-header">
          <h1 className="page-title">{album.title}</h1>
          {album.summary ? <p className="page-description">{album.summary}</p> : null}
        </header>

        {album.coverMedia ? (
          <MediaRenderer media={album.coverMedia} variant="full" />
        ) : null}

        {album.photos.length === 0 ? (
          <EmptyState title="This album has no photos yet" />
        ) : (
          <ul>
            {album.photos.map((photo) => {
              const src = buildCloudinaryUrl({
                publicId: photo.publicId,
                width: 1200,
                quality: "auto",
                format: "auto",
                crop: "limit",
              });

              return (
                <li key={photo._key}>
                  <figure>
                    {src ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={src}
                        alt={photo.alt ?? ""}
                        width={photo.width}
                        height={photo.height}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
                  </figure>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </main>
  );
}
