import type { Metadata } from "next";
import { SkipLink } from "@/components/ui/SkipLink";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteFrame } from "@/components/layout/SiteFrame";
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
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>
        <SkipLink />
        <SiteFrame>
          <SiteHeader />
          {children}
          <SiteFooter settings={settings} />
        </SiteFrame>
      </body>
    </html>
  );
}
