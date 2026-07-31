import type { Metadata } from "next";
import { SkipLink } from "@/components/ui/SkipLink";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { fontClassNames } from "@/fonts/local";
import { buildMetadata } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";
import "@/styles/globals.css";
import "@/styles/focus.css";
import "@/styles/reduced-motion.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildMetadata(
    {
      title: settings.defaultSeoTitle,
      description: settings.defaultSeoDescription,
      path: "/",
      ogImage: settings.defaultOgImage,
    },
    settings,
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={fontClassNames}>
      <body>
        <SkipLink />
        <SiteHeader settings={settings} />
        {children}
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}
