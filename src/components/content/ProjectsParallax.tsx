"use client";

import type { ReactNode } from "react";

interface ProjectsParallaxProps {
  ascii: ReactNode;
  children: ReactNode;
}

/**
 * Sticky fish animation on the left; project cards scroll on the right.
 */
export function ProjectsParallax({ ascii, children }: ProjectsParallaxProps) {
  return (
    <div className="home__projects-stage">
      <aside className="home__projects-ascii" aria-hidden="true">
        <h2 className="home__projects-heading">My latest work</h2>
        {ascii}
      </aside>
      <div className="home__projects-scroll">{children}</div>
    </div>
  );
}
