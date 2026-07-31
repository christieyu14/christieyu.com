import type { Metadata } from "next";
import { EmptyState } from "@/components/content/EmptyState";
import { MediaRenderer } from "@/components/media/MediaRenderer";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: formatPageTitle("Resume", settings.siteTitle),
      description: "Resume",
      path: "/resume",
    },
    settings,
  );
}

export default async function ResumePage() {
  const settings = await getSiteSettings();

  return (
    <main id="main-content" className="container" style={{ paddingBlock: "2rem" }}>
      <header className="page-header">
        <h1 className="page-title">Resume</h1>
      </header>
      {settings.resumeAsset ? (
        <MediaRenderer media={settings.resumeAsset} variant="full" />
      ) : (
        <EmptyState
          title="Resume not available"
          description="Upload a resume asset in Sanity site settings."
        />
      )}
    </main>
  );
}
