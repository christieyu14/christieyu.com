import Link from "next/link";
import { FlowerIcon } from "@/components/icons";
import type { SiteSettings } from "@/types/site";

interface SiteFooterProps {
  settings: SiteSettings;
}

export function SiteFooter({ settings }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link href="/" className="site-footer__brand">
          <span className="site-footer__brand-label">
            {settings.siteTitle || "Christie Yu"}
          </span>
          <FlowerIcon className="site-footer__brand-mark" />
        </Link>
        <p className="site-footer__rights">All rights reserved.</p>
      </div>
    </footer>
  );
}
