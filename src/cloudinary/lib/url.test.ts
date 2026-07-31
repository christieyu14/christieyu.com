import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

describe("cloudinary url builder", () => {
  const originalCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo-cloud";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = originalCloudName;
    vi.resetModules();
  });

  it("builds transformed cloudinary urls", async () => {
    const { buildCloudinaryUrl } = await import("@/cloudinary/lib/url");
    const url = buildCloudinaryUrl({
      publicId: "portfolio/example",
      width: 800,
      quality: "auto",
      format: "auto",
      crop: "limit",
    });

    expect(url).toBe(
      "https://res.cloudinary.com/demo-cloud/image/upload/c_limit,w_800,q_auto,f_auto/portfolio/example",
    );
  });

  it("builds srcset entries for multiple widths", async () => {
    const { buildCloudinarySrcSet } = await import("@/cloudinary/lib/url");
    const srcSet = buildCloudinarySrcSet("portfolio/example", [400, 800], {
      quality: "auto",
      format: "auto",
      crop: "limit",
    });

    expect(srcSet).toHaveLength(2);
    expect(srcSet[0]?.width).toBe(400);
    expect(srcSet[1]?.src).toContain("w_800");
  });

  it("returns undefined when cloud name is missing", async () => {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    vi.resetModules();
    const { buildCloudinaryUrl } = await import("@/cloudinary/lib/url");
    expect(
      buildCloudinaryUrl({ publicId: "portfolio/example", width: 400 }),
    ).toBeUndefined();
  });
});
