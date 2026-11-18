"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HazeText } from "@/components/effects/HazeText";
import { DEFAULT_NAVIGATION } from "@/types/site";
import { useChromeTone } from "./ChromeToneContext";
import { isActivePath } from "./chrome";

export function SiteHeader() {
  const pathname = usePathname();
  const tone = useChromeTone();

  return (
    <header className={`site-header site-header--${tone}`}>
      <div className="site-header__bar">
        <Link href="/" className="site-header__brand type-lg">
          <HazeText as="span" className="haze-text--inline">
            Christie Yu
          </HazeText>
        </Link>
        <nav aria-label="Primary">
          <ul className="site-nav__list">
            {DEFAULT_NAVIGATION.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="type-link"
                  aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
