import { describe, expect, it } from "vitest";
import type { FeaturedPhoto } from "@/content/featured-photos";
import { resolveFeaturedPhotoUrl, selectFeaturedPhoto } from "@/lib/featured-photos";

const samplePool: FeaturedPhoto[] = [
  {
    id: "a",
    src: "/images/a.jpg",
    provider: "local",
    alt: "A",
    caption: "alpha",
    dateLabel: "01.2026",
  },
  {
    id: "b",
    src: "/images/b.jpg",
    provider: "local",
    alt: "B",
    caption: "beta",
    dateLabel: "02.2026",
  },
];

describe("featured photo selection", () => {
  it("returns a photo from the pool", () => {
    const photo = selectFeaturedPhoto(samplePool);
    expect(samplePool.map((entry) => entry.id)).toContain(photo.id);
  });

  it("resolves local paths directly", () => {
    expect(resolveFeaturedPhotoUrl(samplePool[0]!)).toBe("/images/a.jpg");
  });

  it("throws when the pool is empty", () => {
    expect(() => selectFeaturedPhoto([])).toThrow(/empty/i);
  });
});
