import { NextResponse } from "next/server";
import { RESUME } from "@/content/resume";
import { getResumePdf } from "@/lib/figma/resume-pdf";

export const revalidate = 86_400;

/**
 * Same-origin PDF for the resume iframe + download.
 * `?download=1` sets Content-Disposition: attachment.
 */
export async function GET(request: Request) {
  const payload = await getResumePdf();

  if (!payload) {
    return new NextResponse(
      "Resume PDF is unavailable. Configure FIGMA_ACCESS_TOKEN or ensure a last-saved PDF exists at public/resume/Christie-Yu-Resume.pdf.",
      { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  const wantsDownload =
    new URL(request.url).searchParams.get("download") === "1";
  const bytes = Buffer.from(payload.pdfBase64, "base64");
  const disposition = wantsDownload
    ? `attachment; filename="${RESUME.downloadFilename}"`
    : `inline; filename="${RESUME.downloadFilename}"`;

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": disposition,
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
      "X-Resume-Source": payload.source,
    },
  });
}
