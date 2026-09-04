"use client";

import type { ReactNode } from "react";

interface ProjectsParallaxProps {
  ascii: ReactNode;
  children: ReactNode;
}

/**
 * Sticky fish animation on the left; project cards scroll on the right.
 * Sticky is on the column itself so it can pin while the grid row
 * (stretched by the scrolling posts) is taller than the fish.
 */
export function ProjectsParallax({ ascii, children }: ProjectsParallaxProps) {
  return (
    <div className="home__projects-stage">
      <aside className="home__projects-ascii" aria-hidden="true">
        {ascii}
      </aside>
      <div className="home__projects-scroll">{children}</div>
    </div>
  );
}
