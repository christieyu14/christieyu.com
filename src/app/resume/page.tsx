import type { Metadata } from "next";
import { HeroPhotoStage } from "@/components/content/HeroPhotoStage";
import { ResumeViewer } from "@/components/content/ResumeViewer";
import { getHeroAlbumAssets, selectHeroAsset } from "@/cloudinary/lib/hero-album";
import { RESUME } from "@/content/resume";
import { getResumeUpdatedLabel, isResumePdfAvailable } from "@/lib/figma/resume-pdf";
import { buildMetadata, formatPageTitle } from "@/lib/metadata";
import { getSiteSettings } from "@/sanity/lib/fetch";
import "@/styles/photo-stage.css";
import "@/styles/resume.css";

export const dynamic = "force-dynamic";

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
  const [available, assets] = await Promise.all([
    isResumePdfAvailable(),
    getHeroAlbumAssets(),
  ]);
  const initialAsset = selectHeroAsset(assets);

  return (
    <main id="main-content">
      <HeroPhotoStage assets={assets} initialAsset={initialAsset} variant="resume">
        <h1 className="visually-hidden">Resume</h1>
        <div className="resume-box">
          <ResumeViewer
            pdfSrc={available ? RESUME.pdfRoute : undefined}
            downloadFilename={RESUME.downloadFilename}
          />
        </div>
      </HeroPhotoStage>
    </main>
  );
}
