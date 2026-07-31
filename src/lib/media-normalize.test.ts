import { describe, expect, it } from "vitest";
import {
  normalizeCloudinaryAsset,
  normalizePrototypeEmbed,
  isDecorativeAlt,
} from "@/lib/media-normalize";

describe("media normalization", () => {
  it("normalizes cloudinary assets", () => {
    const media = normalizeCloudinaryAsset({
      publicId: "portfolio/example",
      alt: "Example",
    });

    expect(media).toEqual({
      kind: "cloudinary-image",
      publicId: "portfolio/example",
      alt: "Example",
      caption: undefined,
      width: undefined,
      height: undefined,
    });
  });

  it("returns undefined for incomplete cloudinary assets", () => {
    expect(normalizeCloudinaryAsset({ alt: "Missing id" })).toBeUndefined();
  });

  it("normalizes prototype embeds", () => {
    expect(normalizePrototypeEmbed("https://figma.com/proto", "Demo", 16 / 9)).toEqual({
      kind: "prototype-embed",
      url: "https://figma.com/proto",
      title: "Demo",
      aspectRatio: 16 / 9,
    });
  });

  it("detects decorative alt text", () => {
    expect(isDecorativeAlt("")).toBe(true);
    expect(isDecorativeAlt("decorative")).toBe(true);
    expect(isDecorativeAlt("Meaningful")).toBe(false);
  });
});
