/** Format a Cloudinary tag slug for display, e.g. iceland-2026 → #ICELAND 2026 */
export function formatTagLabel(tag: string): string {
  const normalized = tag.trim().replace(/[-_]+/g, " ");
  return `#${normalized.toUpperCase()}`;
}

/** URL-safe slug from a Cloudinary tag. */
export function tagToSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Best-effort reverse of tagToSlug for filtering (exact match on slug form). */
export function slugMatchesTag(slug: string, tag: string): boolean {
  return tagToSlug(tag) === slug.trim().toLowerCase();
}
