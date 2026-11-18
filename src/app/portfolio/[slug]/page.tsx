import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableBody } from "@/components/content/PortableBody";
import { MediaRenderer } from "@/components/media/MediaRenderer";
import { formatMonthYear } from "@/lib/format-date";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { isValidSlug } from "@/lib/slugs";
import {
  getPortfolioPostBySlug,
  getPortfolioPostSlugs,
  getSiteSettings,
} from "@/sanity/lib/fetch";
import "@/styles/portfolio.css";

interface PortfolioDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPortfolioPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PortfolioDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [settings, post] = await Promise.all([
    getSiteSettings(),
    getPortfolioPostBySlug(slug),
  ]);

  if (!post) {
    return buildMetadata(
      {
        title: formatPageTitle("Project not found", settings.siteTitle),
        path: `/portfolio/${slug}`,
        noIndex: true,
      },
      settings,
    );
  }

  return buildMetadata(
    {
      title: formatPageTitle(post.seoTitle ?? post.title, settings.siteTitle),
      description: post.seoDescription ?? post.summary,
      path: `/portfolio/${slug}`,
      ogImage: post.ogImage,
    },
    settings,
  );
}

export default async function PortfolioDetailPage({
  params,
}: PortfolioDetailPageProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  const post = await getPortfolioPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const meta = [post.client, post.location, formatMonthYear(post.publishedAt)].filter(
    Boolean,
  );

  return (
    <main id="main-content" className="project">
      <article className="content-page">
        <header className="content-page__header">
          {meta.length > 0 ? <p className="type-sm">{meta.join(" / ")}</p> : null}
          <h1 className="type-title">{post.title}</h1>
          {post.summary ? (
            <p className="content-page__description type-md">{post.summary}</p>
          ) : null}
        </header>

        {post.coverMedia ? (
          <MediaRenderer
            media={post.coverMedia}
            variant="full"
            className="project__cover"
          />
        ) : null}

        <div className="project__body type-md">
          <PortableBody value={post.body} />
        </div>
      </article>
    </main>
  );
}
