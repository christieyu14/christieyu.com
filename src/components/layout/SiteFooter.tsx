import Link from "next/link";
import { BrandLogo } from "@/components/icons";
import type { SiteSettings } from "@/types/site";

interface SiteFooterProps {
  settings: SiteSettings;
}

export function SiteFooter({ settings }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link href="/" className="site-footer__brand">
          <BrandLogo
            className="site-footer__brand-logo"
            title={settings.siteTitle || "Christie Yu"}
          />
        </Link>
        <p className="site-footer__rights">All rights reserved.</p>
      </div>
    </footer>
  );
}
