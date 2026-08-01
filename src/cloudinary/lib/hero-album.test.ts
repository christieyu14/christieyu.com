import { describe, expect, it } from "vitest";
import {
  selectHeroAsset,
  type HeroAlbumAsset,
} from "@/cloudinary/lib/hero-album-shared";
import { buildCloudinaryUrl } from "@/cloudinary/lib/url";

const sampleAssets: HeroAlbumAsset[] = [
  {
    publicId: "hero/a",
    width: 2000,
    height: 1125,
    caption: "alpha",
    date: "01.2026",
  },
  {
    publicId: "hero/b",
    width: 2000,
    height: 1125,
    caption: "beta",
    date: "02.2026",
  },
];

describe("hero album selection", () => {
  it("returns an asset from the pool", () => {
    const asset = selectHeroAsset(sampleAssets);
    expect(sampleAssets.map((entry) => entry.publicId)).toContain(asset?.publicId);
  });

  it("avoids selecting the same photo twice in a row", () => {
    const asset = selectHeroAsset(sampleAssets, "hero/a");
    expect(asset?.publicId).toBe("hero/b");
  });

  it("returns null for an empty pool", () => {
    expect(selectHeroAsset([])).toBeNull();
  });
});

describe("hero delivery urls", () => {
  it("uses f_auto, q_auto, and a hero-sized width", async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo";
    const url = buildCloudinaryUrl({
      publicId: "hero/a",
      width: 1600,
      quality: "auto",
      format: "auto",
      crop: "limit",
    });
    expect(url).toContain("f_auto");
    expect(url).toContain("q_auto");
    expect(url).toContain("w_1600");
    expect(url).toContain("c_limit");
  });
});
