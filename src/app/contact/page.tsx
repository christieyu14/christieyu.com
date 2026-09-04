import type { Metadata } from "next";
import { ContactForm } from "@/components/content/ContactForm";
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

export default async function ContactPage() {
  return (
    <main id="main-content" className="contact-page">
      <div className="contact-page__body">
        <div className="contact-page__layout">
          <ContactForm />
          <aside className="contact-page__art" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="contact-page__ascii"
              src="/images/contact/ascii-branch.png"
              alt=""
              width={554}
              height={848}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
