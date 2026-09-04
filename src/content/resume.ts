/**
 * Resume page source of truth.
 *
 * Primary path: Figma Images API exports the resume frame as PDF
 * (server-only; see `src/lib/figma/resume-pdf.ts` and `GET /resume.pdf`).
 * Successful exports are written to `public/resume/` as a durable fallback
 * when the Figma PAT expires (~90 days) or the API is unreachable.
 */
export const RESUME = {
  /** Figma Resume file key. */
  figmaFileKey: "MTz2WVacz9Unw0fUQT39tB",

  /** Resume frame node id (named e.g. "Resume 03-2025"). */
  figmaNodeId: "1:3",

  /**
   * Fallback label when Figma metadata is unavailable.
   * Prefer the live frame name parsed by the Figma helper.
   */
  updatedLabelFallback: "03-2025",

  /** Same-origin PDF route used for embed + download. */
  pdfRoute: "/resume.pdf",

  /** Public fallback path under /public. */
  pdfPath: "/resume/Christie-Yu-Resume.pdf",

  /** Download filename suggested to the browser. */
  downloadFilename: "Christie-Yu-Resume.pdf",
} as const;

/** Pulls `MM-YYYY` from a frame name like "Resume 03-2025". */
export function parseResumeUpdatedLabel(frameName: string): string {
  const match = frameName.match(/(\d{2}-\d{4})\s*$/);
  return match?.[1] ?? "";
}

export function resumeUpdatedLabel(label?: string): string {
  return (label ?? RESUME.updatedLabelFallback).trim();
}
