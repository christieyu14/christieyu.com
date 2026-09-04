import type { Metadata } from "next";
import { ResumeViewer } from "@/components/content/ResumeViewer";
import { RESUME, resumeUpdatedLabel } from "@/content/resume";
import {
  getResumeUpdatedLabel,
  isResumePdfAvailable,
} from "@/lib/figma/resume-pdf";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";
import "@/styles/resume.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const updated = await getResumeUpdatedLabel();
  return buildMetadata(
    {
      title: formatPageTitle("Resume", settings.siteTitle),
      description: updated
        ? `Resume — last updated ${updated}`
        : "Resume",
      path: "/resume",
    },
    settings,
  );
}

export default async function ResumePage() {
  const available = await isResumePdfAvailable();
  const updatedLabel = available
    ? await getResumeUpdatedLabel()
    : resumeUpdatedLabel();

  const pdfSrc = available ? RESUME.pdfRoute : undefined;
  const pdfDownloadUrl = available
    ? `${RESUME.pdfRoute}?download=1`
    : undefined;

  return (
    <main id="main-content" className="resume-page">
      <div className="resume-page__body">
        <div className="resume-page__layout">
          <ResumeViewer
            pdfSrc={pdfSrc}
            pdfDownloadUrl={pdfDownloadUrl}
            downloadFilename={RESUME.downloadFilename}
            updatedLabel={updatedLabel}
          />
          <aside className="resume__art" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="resume__clovers"
              src="/images/resume/clovers.png"
              alt=""
              width={328}
              height={437}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
