import { describe, expect, it } from "vitest";
import { formatTagLabel, slugMatchesTag, tagToSlug } from "@/cloudinary/lib/album-tags";

describe("album tag helpers", () => {
  it("formats tag labels for display", () => {
    expect(formatTagLabel("iceland-2026")).toBe("#ICELAND 2026");
  });

  it("creates URL slugs from tags", () => {
    expect(tagToSlug("Iceland 2026")).toBe("iceland-2026");
  });

  it("matches slugs to tags", () => {
    expect(slugMatchesTag("iceland-2026", "iceland-2026")).toBe(true);
    expect(slugMatchesTag("iceland-2026", "Iceland 2026")).toBe(true);
  });
});
