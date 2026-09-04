import Link from "next/link";
import type { ProjectPreviewData } from "@/content/project-previews";

interface ProjectPreviewProps {
  project: ProjectPreviewData;
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
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
    <article className="project-preview">
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
          <div>
            <p className="project-preview__client">{project.client}</p>
            <p className="project-preview__date">{project.dateLabel}</p>
          </div>
        </div>
        <p className="project-preview__summary">{project.summary}</p>
      </div>
    </article>
  );
}
