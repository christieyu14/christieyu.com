import type { Metadata } from "next";
import { ResumeViewer } from "@/components/content/ResumeViewer";
import { AsciiSplash } from "@/components/content/AsciiSplash";
import { RESUME, resumeUpdatedLabel } from "@/content/resume";
import { getResumeUpdatedLabel, isResumePdfAvailable } from "@/lib/figma/resume-pdf";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";
import "@/styles/resume.css";
import "@/styles/ascii.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const updated = await getResumeUpdatedLabel();
  return buildMetadata(
    {
      title: formatPageTitle("Resume", settings.siteTitle),
      description: updated ? `Resume — last updated ${updated}` : "Resume",
      path: "/resume",
    },
    settings,
  );
}

export default async function ResumePage() {
  const available = await isResumePdfAvailable();
  const updatedLabel = available ? await getResumeUpdatedLabel() : resumeUpdatedLabel();

  const pdfSrc = available ? RESUME.pdfRoute : undefined;

  return (
    <main id="main-content" className="resume-page">
      <AsciiSplash variant="resume" />
      <div className="resume-page__body">
        <ResumeViewer
          pdfSrc={pdfSrc}
          downloadFilename={RESUME.downloadFilename}
          updatedLabel={updatedLabel}
        />
      </div>
    </main>
  );
}
