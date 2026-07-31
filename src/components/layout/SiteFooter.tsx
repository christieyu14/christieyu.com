"use client";

import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/types/site";

interface SiteFooterProps {
  settings: SiteSettings;
}

export function SiteFooter({ settings }: SiteFooterProps) {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (pathname === "/") {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          © {year} {settings.siteTitle}
        </p>
        {settings.contactEmail ? (
          <p>
            <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          </p>
        ) : null}
      </div>
    </footer>
  );
}
