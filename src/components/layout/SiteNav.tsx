"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/types/site";
import { DEFAULT_NAVIGATION } from "@/types/site";

interface SiteNavProps {
  items?: NavigationItem[];
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({ items = DEFAULT_NAVIGATION }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary">
      <ul className="site-nav__list">
        {items.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="site-nav__link"
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
