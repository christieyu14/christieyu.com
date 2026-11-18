import type { Metadata } from "next";
import { ContactForm } from "@/components/content/ContactForm";
import { ContactTideOverlay } from "@/components/content/ContactTideOverlay";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";
import "@/styles/contact.css";

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

export default function ContactPage() {
  return (
    <main id="main-content" className="contact">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="contact__bg"
        src="/images/contact/fishies.jpg"
        alt=""
        width={1920}
        height={1080}
        fetchPriority="high"
      />
      <ContactTideOverlay />
      <div className="contact__body">
        <div className="contact__welcome">
          <p className="contact__welcome-title type-display" aria-hidden="true">
            contact me...
          </p>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
