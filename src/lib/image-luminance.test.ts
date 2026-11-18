import { describe, expect, it } from "vitest";
import {
  averageLuminanceInRegion,
  coverSourceRect,
  maxLuminanceInRegion,
  overlayToneFromLuminance,
  relativeLuminance,
} from "@/lib/image-luminance";

describe("image luminance", () => {
  it("treats pure white as bright and pure black as dark", () => {
    expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 2);
    expect(relativeLuminance(0, 0, 0)).toBeCloseTo(0, 2);
  });

  it("chooses dark overlay text on bright backgrounds", () => {
    expect(overlayToneFromLuminance(0.8)).toBe("dark");
    expect(overlayToneFromLuminance(0.2)).toBe("light");
  });

  it("averages luminance inside a region", () => {
    const data = new Uint8ClampedArray([
      255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255,
    ]);
    const top = averageLuminanceInRegion(data, 2, 2, {
      x: 0,
      y: 0,
      width: 1,
      height: 0.5,
    });
    const bottom = averageLuminanceInRegion(data, 2, 2, {
      x: 0,
      y: 0.5,
      width: 1,
      height: 0.5,
    });
    expect(top).toBeGreaterThan(0.9);
    expect(bottom).toBeLessThan(0.1);
  });

  it("maps a cover-fitted viewport rect back into natural image space", () => {
    const region = coverSourceRect(
      2000,
      1000,
      1000,
      1000,
      { left: 500, top: 0, width: 500, height: 200 },
      { left: 0, top: 0, width: 1000, height: 1000 },
    );
    expect(region).not.toBeNull();
    expect(region?.x).toBeCloseTo(0.5, 2);
    expect(region?.width).toBeCloseTo(0.25, 2);
  });

  it("reports peak luminance so a bright patch forces dark text", () => {
    const data = new Uint8ClampedArray([
      0, 0, 0, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255,
    ]);
    const peak = maxLuminanceInRegion(data, 2, 2, {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });
    expect(peak).toBeGreaterThan(0.9);
    expect(overlayToneFromLuminance(peak)).toBe("dark");
  });
});
