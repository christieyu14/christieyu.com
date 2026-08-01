"use client";

import type { ReactNode } from "react";

interface ProjectsParallaxProps {
  ascii: ReactNode;
  children: ReactNode;
}

/**
 * Sticky ASCII flower behind a tall project stage.
 * Cards scroll over it; the flower stays fixed in the viewport while the section is in view.
 */
export function ProjectsParallax({ ascii, children }: ProjectsParallaxProps) {
  return (
    <div className="home__projects-stage">
      <div className="home__projects-ascii" aria-hidden="true">
        <div className="home__projects-ascii-sticky">{ascii}</div>
      </div>
      <div className="home__projects-scroll">{children}</div>
    </div>
  );
}
