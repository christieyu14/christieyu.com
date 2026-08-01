/**
 * Relative luminance helpers for choosing light vs dark overlay text.
 * Based on WCAG relative luminance (sRGB).
 */

export type OverlayTone = "light" | "dark";

/** Bright backgrounds need dark text; dark backgrounds need light text. */
export function overlayToneFromLuminance(
  luminance: number,
  threshold = 0.55,
): OverlayTone {
  return luminance > threshold ? "dark" : "light";
}

export function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(r: number, g: number, b: number): number {
  const R = channelToLinear(r);
  const G = channelToLinear(g);
  const B = channelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export interface ImageRegion {
  /** 0–1 from left */
  x: number;
  /** 0–1 from top */
  y: number;
  /** 0–1 of image width */
  width: number;
  /** 0–1 of image height */
  height: number;
}

export function averageLuminanceInRegion(
  data: Uint8ClampedArray,
  imageWidth: number,
  imageHeight: number,
  region: ImageRegion,
): number {
  const startX = Math.max(0, Math.floor(region.x * imageWidth));
  const startY = Math.max(0, Math.floor(region.y * imageHeight));
  const endX = Math.min(
    imageWidth,
    Math.ceil((region.x + region.width) * imageWidth),
  );
  const endY = Math.min(
    imageHeight,
    Math.ceil((region.y + region.height) * imageHeight),
  );

  let total = 0;
  let count = 0;

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = (y * imageWidth + x) * 4;
      const r = data[index] ?? 0;
      const g = data[index + 1] ?? 0;
      const b = data[index + 2] ?? 0;
      total += relativeLuminance(r, g, b);
      count += 1;
    }
  }

  return count === 0 ? 0 : total / count;
}

export interface HeroMetadataTones {
  /** Caption + date cluster (bottom-left) */
  left: OverlayTone;
  /** See more + refresh cluster (bottom-right) */
  right: OverlayTone;
}

/**
 * Sample bottom-left and bottom-right regions of a loaded image
 * for overlay text contrast.
 */
export function sampleHeroMetadataTones(
  image: CanvasImageSource & { naturalWidth: number; naturalHeight: number },
): HeroMetadataTones | null {
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  if (!width || !height) {
    return null;
  }

  const canvas = document.createElement("canvas");
  const maxWidth = 320;
  const scale = Math.min(1, maxWidth / width);
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return null;
  }

  try {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

    const bandHeight = 0.12;
    const bandY = 1 - bandHeight;
    const sideWidth = 0.36;

    const leftLuma = averageLuminanceInRegion(data, canvas.width, canvas.height, {
      x: 0.02,
      y: bandY,
      width: sideWidth,
      height: bandHeight,
    });
    const rightLuma = averageLuminanceInRegion(data, canvas.width, canvas.height, {
      x: 1 - sideWidth - 0.02,
      y: bandY,
      width: sideWidth,
      height: bandHeight,
    });

    return {
      left: overlayToneFromLuminance(leftLuma),
      right: overlayToneFromLuminance(rightLuma),
    };
  } catch {
    return null;
  }
}
