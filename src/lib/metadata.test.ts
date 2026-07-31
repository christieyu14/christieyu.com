import { describe, expect, it } from "vitest";
import { buildMetadata, resolveMetadata } from "@/lib/metadata";
import { DEFAULT_SITE_SETTINGS } from "@/types/site";

describe("metadata helpers", () => {
  it("resolves canonical metadata with defaults", () => {
    const resolved = resolveMetadata({ path: "/work" }, DEFAULT_SITE_SETTINGS);

    expect(resolved.title).toBe(DEFAULT_SITE_SETTINGS.defaultSeoTitle);
    expect(resolved.canonicalUrl).toBe("http://localhost:3000/work");
  });

  it("builds Next metadata object", () => {
    const metadata = buildMetadata(
      {
        title: "Work",
        description: "Portfolio work",
        path: "/work",
      },
      DEFAULT_SITE_SETTINGS,
    );

    expect(metadata.title).toBe("Work");
    expect(metadata.description).toBe("Portfolio work");
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/work");
  });
});
