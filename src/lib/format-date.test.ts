import { describe, expect, it } from "vitest";
import { formatMonthYear } from "@/lib/format-date";

describe("formatMonthYear", () => {
  it("formats ISO datetimes as MM.YYYY", () => {
    expect(formatMonthYear("2025-06-14T12:00:00Z")).toBe("06.2025");
  });

  it("formats plain ISO dates", () => {
    expect(formatMonthYear("2024-11-01")).toBe("11.2024");
  });

  it("returns undefined for missing or malformed input", () => {
    expect(formatMonthYear(undefined)).toBeUndefined();
    expect(formatMonthYear("June 2025")).toBeUndefined();
  });
});
