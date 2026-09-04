import { readFileSync } from "node:fs";
import { join } from "node:path";

const ASCII_FLOWER = readFileSync(
  join(process.cwd(), "src/content/ascii-flower.txt"),
  "utf8",
);

export type AsciiSplashVariant = "resume" | "contact";

interface AsciiSplashProps {
  variant: AsciiSplashVariant;
}

/** Background art splashes — resume: ASCII flower; contact: clover composite. */
export function AsciiSplash({ variant }: AsciiSplashProps) {
  if (variant === "contact") {
    return (
      <div className="ascii-splash ascii-splash--contact" aria-hidden="true" />
    );
  }

  return (
    <div className="ascii-splash ascii-splash--resume" aria-hidden="true">
      <pre className="ascii-splash__flower">{ASCII_FLOWER}</pre>
    </div>
  );
}
