import { describe, expect, it } from "vitest";
import {
  averageLuminanceInRegion,
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
    // 2x2 image: white, white / black, black
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
});
