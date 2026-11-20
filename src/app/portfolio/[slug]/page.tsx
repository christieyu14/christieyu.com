import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCaseStudy } from "@/components/content/ProjectCaseStudy";
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

  return (
    <main id="main-content" className="project">
      <ProjectCaseStudy post={post} />
    </main>
  );
}
