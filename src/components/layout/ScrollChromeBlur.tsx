"use client";

import GradualBlur from "@/components/effects/GradualBlur";
import { useChromeTone } from "./ChromeToneContext";

const SHARED = {
  target: "page" as const,
  height: "4.5rem",
  strength: 1.5,
  layers: 8,
  curve: "linear" as const,
  exponential: true,
  autoHide: true,
  zIndex: 20,
};

export function ScrollChromeBlur() {
  const tone = useChromeTone();
  const tint =
    tone === "light" ? "rgba(0, 0, 0, 0.6)" : "rgba(242, 241, 240, 0.55)";

  return (
    <>
      <GradualBlur {...SHARED} position="top" tint={tint} />
      <GradualBlur {...SHARED} position="bottom" tint={tint} />
    </>
  );
}
