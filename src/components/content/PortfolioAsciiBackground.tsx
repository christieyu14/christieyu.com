"use client";

import GradientASCII from "@/components/effects/GradientASCII";

/** Lagoon Gradient ASCII preset from React Bits (portfolio backdrop). */
const LAGOON = {
  colors: ["#08889e", "#3ca087", "#bab1c6"] as string[],
  shape: "pinch" as const,
  characters: " .:-=+*#%@",
  cellSize: 15,
  density: 0.8,
  glyphOpacity: 0.64,
  softness: 0.4,
  scale: 1.5,
  speed: 0.2,
  variation: 4,
  scrambleRadius: 0.05,
  mouseInteraction: true,
  intro: false,
};

export function PortfolioAsciiBackground() {
  return (
    <div className="portfolio__ascii" aria-hidden="true">
      <GradientASCII className="portfolio__ascii-inner" {...LAGOON} />
    </div>
  );
}
