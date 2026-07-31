import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

describe("env helpers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it("reports Sanity as not configured without project id", async () => {
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_SANITY_DATASET;
    const { isSanityConfigured } = await import("@/lib/env");
    expect(isSanityConfigured()).toBe(false);
  });

  it("reports Cloudinary as not configured without cloud name", async () => {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const { isCloudinaryConfigured } = await import("@/lib/env");
    expect(isCloudinaryConfigured()).toBe(false);
  });

  it("uses localhost fallback for site url", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const { getSiteUrl } = await import("@/lib/env");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
