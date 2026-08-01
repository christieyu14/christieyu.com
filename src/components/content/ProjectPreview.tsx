import Link from "next/link";
import type { ProjectPreviewData } from "@/content/project-previews";

interface ProjectPreviewProps {
  project: ProjectPreviewData;
  /** Denser layout for the 4×4 homepage grid. */
  compact?: boolean;
}

/** Inline so Turbopack/LightningCSS cannot drop the standard backdrop-filter. */
const CARD_SURFACE_STYLE = {
  background: "rgba(255, 255, 255, 0.1)",
  WebkitBackdropFilter: "blur(100px)",
  backdropFilter: "blur(100px)",
} as const;

export function ProjectPreview({ project, compact = false }: ProjectPreviewProps) {
  const media = (
    <div className="project-preview__media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="project-preview__blur"
        src="/images/home/project-blur.png"
        alt=""
        aria-hidden="true"
      />
      <div className="project-preview__placeholder" />
    </div>
  );

  return (
    <article
      className={`project-preview${compact ? " project-preview--compact" : ""}`}
      style={CARD_SURFACE_STYLE}
    >
      {project.href ? (
        <Link href={project.href} className="project-preview__media-link">
          {media}
        </Link>
      ) : (
        media
      )}
      <div className="project-preview__body">
        <div className="project-preview__meta">
          <h3 className="project-preview__title">{project.title}</h3>
          <p className="project-preview__client">{project.client}</p>
          <p className="project-preview__date">{project.dateLabel}</p>
        </div>
        <p className="project-preview__summary">{project.summary}</p>
      </div>
    </article>
  );
}
