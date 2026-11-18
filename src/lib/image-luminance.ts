/**
 * Relative luminance helpers for choosing light vs dark overlay text.
 * Based on WCAG relative luminance (sRGB).
 */

export type OverlayTone = "light" | "dark";

/** Bright backgrounds need dark text; dark backgrounds need light text. */
export function overlayToneFromLuminance(
  luminance: number,
  threshold = 0.45,
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
  x: number;
  y: number;
  width: number;
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
  const endX = Math.min(imageWidth, Math.ceil((region.x + region.width) * imageWidth));
  const endY = Math.min(imageHeight, Math.ceil((region.y + region.height) * imageHeight));

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

/** Peak luminance in a region ? catches bright sky patches under mixed text. */
export function maxLuminanceInRegion(
  data: Uint8ClampedArray,
  imageWidth: number,
  imageHeight: number,
  region: ImageRegion,
): number {
  const startX = Math.max(0, Math.floor(region.x * imageWidth));
  const startY = Math.max(0, Math.floor(region.y * imageHeight));
  const endX = Math.min(imageWidth, Math.ceil((region.x + region.width) * imageWidth));
  const endY = Math.min(imageHeight, Math.ceil((region.y + region.height) * imageHeight));

  let peak = 0;
  const stepX = Math.max(1, Math.floor((endX - startX) / 24));
  const stepY = Math.max(1, Math.floor((endY - startY) / 12));

  for (let y = startY; y < endY; y += stepY) {
    for (let x = startX; x < endX; x += stepX) {
      const index = (y * imageWidth + x) * 4;
      const r = data[index] ?? 0;
      const g = data[index + 1] ?? 0;
      const b = data[index + 2] ?? 0;
      peak = Math.max(peak, relativeLuminance(r, g, b));
    }
  }

  return peak;
}

export interface HeroMetadataTones {
  left: OverlayTone;
  right: OverlayTone;
}

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

export function coverSourceRect(
  naturalWidth: number,
  naturalHeight: number,
  elementWidth: number,
  elementHeight: number,
  viewportRect: { left: number; top: number; width: number; height: number },
  elementRect: { left: number; top: number; width: number; height: number },
): ImageRegion | null {
  if (
    !naturalWidth ||
    !naturalHeight ||
    !elementWidth ||
    !elementHeight ||
    !viewportRect.width ||
    !viewportRect.height
  ) {
    return null;
  }

  const scale = Math.max(elementWidth / naturalWidth, elementHeight / naturalHeight);
  const drawnWidth = naturalWidth * scale;
  const drawnHeight = naturalHeight * scale;
  const offsetX = (elementWidth - drawnWidth) / 2;
  const offsetY = (elementHeight - drawnHeight) / 2;
  const localLeft = viewportRect.left - elementRect.left;
  const localTop = viewportRect.top - elementRect.top;
  const sourceX = (localLeft - offsetX) / scale;
  const sourceY = (localTop - offsetY) / scale;
  const sourceWidth = viewportRect.width / scale;
  const sourceHeight = viewportRect.height / scale;

  return {
    x: sourceX / naturalWidth,
    y: sourceY / naturalHeight,
    width: sourceWidth / naturalWidth,
    height: sourceHeight / naturalHeight,
  };
}

function readPixels(
  image: HTMLImageElement,
): { data: Uint8ClampedArray; width: number; height: number } | null {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) {
    return null;
  }

  const canvas = document.createElement("canvas");
  const maxWidth = 360;
  const scale = Math.min(1, maxWidth / width);
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return null;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  return { data, width: canvas.width, height: canvas.height };
}

/**
 * Sample only the caption/actions band (not the thumbnail) using peak luminance,
 * so bright sky under any part of the text forces dark text.
 * `layoutImage` supplies the on-screen cover box; `image` supplies pixels (CORS decode).
 */
export function samplePhotoStageMetaTone(
  image: HTMLImageElement,
  textElements: HTMLElement[],
  layoutImage?: HTMLElement | null,
): OverlayTone | null {
  if (textElements.length === 0) {
    return null;
  }

  let pixels: { data: Uint8ClampedArray; width: number; height: number } | null = null;
  try {
    pixels = readPixels(image);
  } catch {
    return null;
  }
  if (!pixels) {
    return null;
  }

  const layout = layoutImage ?? image;
  const imageRect = layout.getBoundingClientRect();
  let peak = 0;

  for (const element of textElements) {
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      continue;
    }
    const region = coverSourceRect(
      image.naturalWidth,
      image.naturalHeight,
      imageRect.width,
      imageRect.height,
      { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      imageRect,
    );
    if (!region) {
      continue;
    }
    peak = Math.max(
      peak,
      maxLuminanceInRegion(pixels.data, pixels.width, pixels.height, region),
    );
  }

  if (peak <= 0) {
    return null;
  }

  return overlayToneFromLuminance(peak);
}
