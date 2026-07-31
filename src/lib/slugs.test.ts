import { describe, expect, it } from "vitest";
import { isValidSlug, normalizeSlug, slugFromSanity } from "@/lib/slugs";

describe("slug helpers", () => {
  it("validates slug format", () => {
    expect(isValidSlug("my-project")).toBe(true);
    expect(isValidSlug("My Project")).toBe(false);
    expect(isValidSlug("bad_slug")).toBe(false);
  });

  it("normalizes arbitrary strings", () => {
    expect(normalizeSlug(" Hello World! ")).toBe("hello-world");
  });

  it("reads slug from sanity slug object", () => {
    expect(slugFromSanity({ current: "project-one" })).toBe("project-one");
  });
});
