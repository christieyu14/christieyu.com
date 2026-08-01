import { describe, expect, it } from "vitest";
import { selectHeroPhoto, type HeroAlbumPhoto } from "@/cloudinary/lib/hero-album-shared";

const samplePhotos: HeroAlbumPhoto[] = [
  {
    id: "a",
    publicId: "a",
    alt: "A",
    caption: "alpha",
    dateLabel: "01.2026",
    url: "https://res.cloudinary.com/demo/image/upload/a",
  },
  {
    id: "b",
    publicId: "b",
    alt: "B",
    caption: "beta",
    dateLabel: "02.2026",
    url: "https://res.cloudinary.com/demo/image/upload/b",
  },
];

describe("hero album selection", () => {
  it("returns a photo from the pool", () => {
    const photo = selectHeroPhoto(samplePhotos);
    expect(samplePhotos.map((entry) => entry.id)).toContain(photo?.id);
  });

  it("can exclude the current photo when refreshing", () => {
    const photo = selectHeroPhoto(samplePhotos, "a");
    expect(photo?.id).toBe("b");
  });

  it("returns null for an empty pool", () => {
    expect(selectHeroPhoto([])).toBeNull();
  });
});
