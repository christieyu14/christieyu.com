import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableBody } from "@/components/content/PortableBody";
import { MediaRenderer } from "@/components/media/MediaRenderer";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { isValidSlug } from "@/lib/slugs";
import {
  getPortfolioPostBySlug,
  getPortfolioPostSlugs,
  getSiteSettings,
} from "@/sanity/lib/fetch";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPortfolioPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [settings, post] = await Promise.all([
    getSiteSettings(),
    getPortfolioPostBySlug(slug),
  ]);

  if (!post) {
    return buildMetadata(
      {
        title: formatPageTitle("Project not found", settings.siteTitle),
        path: `/work/${slug}`,
        noIndex: true,
      },
      settings,
    );
  }

  return buildMetadata(
    {
      title: formatPageTitle(post.seoTitle ?? post.title, settings.siteTitle),
      description: post.seoDescription ?? post.summary,
      path: `/work/${slug}`,
      ogImage: post.ogImage,
    },
    settings,
  );
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  const post = await getPortfolioPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main id="main-content" className="container" style={{ paddingBlock: "2rem" }}>
      <article>
        <header className="page-header">
          <h1 className="page-title">{post.title}</h1>
          {post.summary ? <p className="page-description">{post.summary}</p> : null}
        </header>

        {post.coverMedia ? (
          <MediaRenderer media={post.coverMedia} variant="full" />
        ) : null}

        <PortableBody value={post.body} />
      </article>
    </main>
  );
}
