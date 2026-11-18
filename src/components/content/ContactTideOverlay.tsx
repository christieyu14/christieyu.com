"use client";

import GlyphTide from "@/components/effects/GlyphTide";

/** Lagoon Glyph Tide over contact fish photo (Figma uses screen blend). */
const LAGOON_OVERLAY = {
  colors: ["#0E9FB5", "#C8FFF6"] as string[],
  backgroundColor: "#034072",
  cursorRadius: 30,
  cursorStrength: 0.2,
  wakeLength: 0.5,
  rippleSize: 0.7,
  clickRipples: false,
  interactive: true,
};

export function ContactTideOverlay() {
  return (
    <div className="contact__tide" aria-hidden="true">
      <GlyphTide className="contact__tide-inner" {...LAGOON_OVERLAY} />
    </div>
  );
}
