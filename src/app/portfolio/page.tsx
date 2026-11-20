import type { Metadata } from "next";
import { PortfolioCard } from "@/components/content/PortfolioCard";
import { PortfolioAsciiBackground } from "@/components/content/PortfolioAsciiBackground";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getPortfolioPosts, getSiteSettings } from "@/sanity/lib/fetch";
import type { PortfolioPostSummary } from "@/types/content";
import "@/styles/portfolio.css";

const PLACEHOLDER_POSTS: PortfolioPostSummary[] = [
  {
    _id: "placeholder-gridify",
    title: "Gridify: Leading design for a startup",
    slug: "gridify",
    summary:
      "I was the 3rd teammate to join Gridify, a climate tech startup transforming the Renewable Energy Certificate market.",
    publishedAt: "2025-06-01",
    client: "Gridify",
    location: "Remote",
  },
  {
    _id: "placeholder-red-velvet",
    title: "Now baking... Red Velvet",
    slug: "red-velvet",
    summary:
      "I owned Red Velvet, a B2B sub-language of Lenovo's Cake UI, for which I created 200+ components from scratch.",
    publishedAt: "2025-06-01",
    client: "Lenovo",
    location: "Chicago (Remote)",
  },
  {
    _id: "placeholder-cake",
    title: "Architecting Cake",
    slug: "architecting-cake",
    summary:
      "I co-created Cake UI, Lenovo’s PC design language. I used Cake to redesign Lenovo Vantage, a consumer app with 3mil+ daily usership.",
    publishedAt: "2025-06-01",
    client: "Lenovo",
    location: "Chicago (Remote)",
  },
  {
    _id: "placeholder-artmiesa",
    title: "@artmiesa on Instagram",
    slug: "artmiesa",
    summary:
      "I'm a bit of a digital artist in my free time - I used to do a lot of mixed media, from oil paints to jewelry-making, but these days I mostly just use Procreate on the iPad.",
    publishedAt: "2024-01-01",
    client: "@artmiesa",
  },
  {
    _id: "placeholder-thesis-cs",
    title: "Senior thesis: Computer Science",
    slug: "senior-thesis-computer-science",
    summary:
      "For my capstone project for the CS dept, I investigated how to digitize the museum experience, attempting to recreate one of the most intangible yet powerful user experiences.",
    publishedAt: "2022-05-01",
    client: "Yale University",
    location: "New Haven",
  },
  {
    _id: "placeholder-thesis-english",
    title: "Senior thesis: English",
    slug: "senior-thesis-english",
    summary:
      "For my capstone project for the English department, I examined Virginia Woolf's views on consciousness and its daily demands of our personae.",
    publishedAt: "2022-05-01",
    client: "Yale University",
    location: "New Haven",
  },
  {
    _id: "placeholder-amoriem",
    title: "Directing Amoriem Labs",
    slug: "amoriem-labs",
    summary:
      "In January of 2019, I founded Amoriem Labs, Yale's only undergraduate video game development studio. I directed it until I graduated in 2022.",
    publishedAt: "2022-05-01",
    client: "Yale University",
    location: "New Haven",
  },
  {
    _id: "placeholder-ydn",
    title: "Producing the Yale Daily News",
    slug: "yale-daily-news",
    summary:
      "I served as an inaugural Digital Desk editor in 2021, and a Production & Design Editor/staffer for the daily print paper from 2018-2020.",
    publishedAt: "2021-05-01",
    client: "Yale University",
    location: "New Haven",
  },

  {
    _id: "placeholder-mskcc",
    title: "Tech incubation at MSKCC",
    slug: "mskcc",
    summary:
      "I was an intern for the Tech Incubation team at MSKCC in summers of 2020 and 2021, working on projects exploring ambient computing, conversational interfaces, and digital therapeutics.",
    publishedAt: "2021-08-01",
    client: "MSKCC",
    location: "New York City",
  },
];

function withPlaceholders(posts: PortfolioPostSummary[]): PortfolioPostSummary[] {
  if (posts.length > 0) {
    return posts;
  }
  return PLACEHOLDER_POSTS;
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
