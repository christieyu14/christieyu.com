import type { Metadata } from "next";
import { EmptyState } from "@/components/content/EmptyState";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: formatPageTitle("Contact", settings.siteTitle),
      description: "Contact",
      path: "/contact",
    },
    settings,
  );
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <main id="main-content" className="container" style={{ paddingBlock: "2rem" }}>
      <header className="page-header">
        <h1 className="page-title">Contact</h1>
      </header>
      {settings.contactEmail ? (
        <p>
          Email: <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
        </p>
      ) : (
        <EmptyState
          title="Contact details not configured"
          description="Add a contact email in Sanity site settings."
        />
      )}
    </main>
  );
}
