import { readFileSync } from "node:fs";
import { join } from "node:path";

const ASCII_FLOWER = readFileSync(
  join(process.cwd(), "src/content/ascii-flower.txt"),
  "utf8",
);

/** ASCII flower background from Figma node 40:974 — plaintext with color pulse. */
export function AsciiBackground() {
  return (
    <div className="ascii-bg" aria-hidden="true">
      <pre className="ascii-bg__text">{ASCII_FLOWER}</pre>
    </div>
  );
}
