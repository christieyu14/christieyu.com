export type ChromeTone = "dark" | "light";

/** Pages with dark/coloured backdrops use light (white) chrome text. */
const LIGHT_TONE_PREFIXES = ["/portfolio", "/contact"];

/**
 * Default header/footer text tone from the route.
 * - dark = black text (home / light Terminal Rain, resume until photo samples)
 * - light = white text (portfolio, contact)
 * Resume overrides dynamically via ChromeToneProvider once the hero photo is sampled.
 */
export function getChromeTone(pathname: string): ChromeTone {
  return LIGHT_TONE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
    ? "light"
    : "dark";
}

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
