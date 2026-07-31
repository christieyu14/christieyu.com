import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/content/EmptyState";
import { MediaRenderer } from "@/components/media/MediaRenderer";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getPortfolioPosts, getSiteSettings } from "@/sanity/lib/fetch";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: formatPageTitle("Work", settings.siteTitle),
      description: "Portfolio work",
      path: "/work",
    },
    settings,
  );
}

export default async function WorkPage() {
  const posts = await getPortfolioPosts();

  return (
    <main id="main-content" className="container" style={{ paddingBlock: "2rem" }}>
      <header className="page-header">
        <h1 className="page-title">Work</h1>
      </header>

      {posts.length === 0 ? (
        <EmptyState
          title="No portfolio projects yet"
          description="Connect Sanity and publish portfolio posts to populate this page."
        />
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post._id}>
              <article>
                <h2>
                  <Link href={`/work/${post.slug}`}>{post.title}</Link>
                </h2>
                {post.summary ? <p>{post.summary}</p> : null}
                {post.coverMedia ? (
                  <MediaRenderer media={post.coverMedia} variant="thumbnail" />
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
