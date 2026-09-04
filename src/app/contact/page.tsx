import type { Metadata } from "next";
import { ContactForm } from "@/components/content/ContactForm";
import { AsciiSplash } from "@/components/content/AsciiSplash";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";
import "@/styles/contact.css";
import "@/styles/ascii.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: formatPageTitle("Contact", settings.siteTitle),
      description: "Get in touch with Christie Yu.",
      path: "/contact",
    },
    settings,
  );
}

export default async function ContactPage() {
  return (
    <main id="main-content" className="contact-page">
      <AsciiSplash variant="contact" />
      <div className="contact-page__body">
        <ContactForm />
      </div>
    </main>
  );
}
