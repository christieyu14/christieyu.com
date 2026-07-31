import type { Metadata } from "next";
import { EmptyState } from "@/components/content/EmptyState";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: formatPageTitle("About", settings.siteTitle),
      description: "About",
      path: "/about",
    },
    settings,
  );
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <main id="main-content" className="container" style={{ paddingBlock: "2rem" }}>
      <header className="page-header">
        <h1 className="page-title">About</h1>
      </header>
      <EmptyState
        title="About content coming soon"
        description={`Site description: ${settings.siteDescription}`}
      />
    </main>
  );
}
