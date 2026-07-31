import { describe, expect, it } from "vitest";
import {
  getRevalidationPaths,
  isValidRevalidateSecret,
  parseRevalidatePayload,
} from "@/lib/revalidate-paths";

describe("revalidation webhook helpers", () => {
  it("returns portfolio paths including slug", () => {
    expect(getRevalidationPaths("portfolioPost", "sample")).toEqual([
      "/",
      "/work",
      "/work/sample",
    ]);
  });

  it("returns layout paths for site settings", () => {
    expect(getRevalidationPaths("siteSettings")).toEqual([
      "/",
      "/work",
      "/photos",
      "/about",
      "/resume",
      "/contact",
    ]);
  });

  it("parses supported webhook payloads", () => {
    expect(
      parseRevalidatePayload({
        _type: "photoAlbum",
        slug: { current: "summer" },
      }),
    ).toEqual({
      documentType: "photoAlbum",
      slug: "summer",
    });
  });

  it("rejects unsupported document types", () => {
    expect(parseRevalidatePayload({ _type: "unknown" })).toBeNull();
  });

  it("validates webhook secrets", () => {
    expect(isValidRevalidateSecret("abc", "abc")).toBe(true);
    expect(isValidRevalidateSecret("wrong", "abc")).toBe(false);
    expect(isValidRevalidateSecret(null, "abc")).toBe(false);
    expect(isValidRevalidateSecret("abc", "")).toBe(false);
  });
});
