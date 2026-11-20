export type ChromeTone = "dark" | "light";

/**
 * Default header/footer text tone from the route.
 * - dark = black text (home, resume until photo samples, portfolio case studies)
 * - light = white text (portfolio index, contact)
 * Resume overrides dynamically via ChromeToneProvider once the hero photo is sampled.
 */
export function getChromeTone(pathname: string): ChromeTone {
  if (pathname === "/portfolio") {
    return "light";
  }
  if (pathname === "/contact" || pathname.startsWith("/contact/")) {
    return "light";
  }
  return "dark";
}

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
