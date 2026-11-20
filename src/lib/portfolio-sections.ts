import type { PortableTextBlock } from "@portabletext/types";
import type { PortfolioSection } from "@/types/content";

/** Stable DOM id from a heading string. */
export function headingAnchorId(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug ? `section-${slug}` : "section";
}

export function portableBlockPlainText(block: PortableTextBlock): string {
  if (!Array.isArray(block.children)) {
    return "";
  }
  return block.children
    .map((child) => {
      if (child && typeof child === "object" && "text" in child) {
        return String((child as { text?: string }).text ?? "");
      }
      return "";
    })
    .join("");
}

export function extractHeadingTexts(body?: PortableTextBlock[]): string[] {
  if (!body?.length) return [];
  return body
    .filter(
      (block) =>
        block._type === "block" &&
        (block as PortableTextBlock & { style?: string }).style === "h2",
    )
    .map((block) => portableBlockPlainText(block))
    .filter(Boolean);
}

/** Prefer CMS short labels; fall back to truncated heading text. */
export function resolveSidebarSections(
  sections: PortfolioSection[] | undefined,
  body?: PortableTextBlock[],
): PortfolioSection[] {
  if (sections?.length) {
    return sections.filter((section) => section.label && section.headingText);
  }
  return extractHeadingTexts(body).map((headingText) => ({
    label: shortenHeading(headingText),
    headingText,
  }));
}

function shortenHeading(heading: string): string {
  const cleaned = heading.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 28) return cleaned;
  const afterColon = cleaned.split(":").slice(1).join(":").trim();
  if (afterColon && afterColon.length <= 28) return afterColon;
  return `${cleaned.slice(0, 25).trim()}…`;
}
