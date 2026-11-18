import type { Metadata } from "next";
import { PortfolioCard } from "@/components/content/PortfolioCard";
import { PortfolioAsciiBackground } from "@/components/content/PortfolioAsciiBackground";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getPortfolioPosts, getSiteSettings } from "@/sanity/lib/fetch";
import type { PortfolioPostSummary } from "@/types/content";
import "@/styles/portfolio.css";

const PLACEHOLDER_COUNT = 6;

const PLACEHOLDER_POSTS: PortfolioPostSummary[] = [
  {
    _id: "placeholder-1",
    title: "Generative AI at Lenovo",
    slug: "generative-ai-at-lenovo",
    summary:
      "I defined the product vision for Lenovo IT Assist from day one, pioneering patentable generative AI design patterns.",
    publishedAt: "2025-06-01",
    client: "lenovo",
    location: "remote (chicago)",
  },
  {
    _id: "placeholder-2",
    title: "Generative AI at Lenovo",
    slug: "generative-ai-at-lenovo-2",
    summary:
      "I defined the product vision for Lenovo IT Assist from day one, pioneering patentable generative AI design patterns.",
    publishedAt: "2025-06-01",
    client: "lenovo",
    location: "remote (chicago)",
  },
  {
    _id: "placeholder-3",
    title: "Generative AI at Lenovo",
    slug: "generative-ai-at-lenovo-3",
    summary:
      "I defined the product vision for Lenovo IT Assist from day one, pioneering patentable generative AI design patterns.",
    publishedAt: "2025-06-01",
    client: "lenovo",
    location: "remote (chicago)",
  },
  {
    _id: "placeholder-4",
    title: "Generative AI at Lenovo",
    slug: "generative-ai-at-lenovo-4",
    summary:
      "I defined the product vision for Lenovo IT Assist from day one, pioneering patentable generative AI design patterns.",
    publishedAt: "2025-06-01",
    client: "lenovo",
    location: "remote (chicago)",
  },
  {
    _id: "placeholder-5",
    title: "Generative AI at Lenovo",
    slug: "generative-ai-at-lenovo-5",
    summary:
      "I defined the product vision for Lenovo IT Assist from day one, pioneering patentable generative AI design patterns.",
    publishedAt: "2025-06-01",
    client: "lenovo",
    location: "remote (chicago)",
  },
  {
    _id: "placeholder-6",
    title: "Generative AI at Lenovo",
    slug: "generative-ai-at-lenovo-6",
    summary:
      "I defined the product vision for Lenovo IT Assist from day one, pioneering patentable generative AI design patterns.",
    publishedAt: "2025-06-01",
    client: "lenovo",
    location: "remote (chicago)",
  },
];

function withPlaceholders(posts: PortfolioPostSummary[]): PortfolioPostSummary[] {
  if (posts.length >= PLACEHOLDER_COUNT) {
    return posts;
  }
  return [...posts, ...PLACEHOLDER_POSTS.slice(0, PLACEHOLDER_COUNT - posts.length)];
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: formatPageTitle("Portfolio", settings.siteTitle),
      description: "Selected product design work by Christie Yu.",
      path: "/portfolio",
    },
    settings,
  );
}

export default async function PortfolioPage() {
  const posts = withPlaceholders(await getPortfolioPosts());

  return (
    <main id="main-content" className="portfolio">
      <PortfolioAsciiBackground />
      <div className="portfolio__body">
        <h1 className="visually-hidden">Portfolio</h1>
        <ul className="portfolio__grid">
          {posts.map((post, index) => (
            <li key={post._id}>
              <PortfolioCard
                post={post}
                placeholderIndex={index}
              />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
