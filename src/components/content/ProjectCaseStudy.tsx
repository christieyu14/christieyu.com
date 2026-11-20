"use client";

import { useEffect, useMemo, useState } from "react";
import AnimatedContent from "@/components/AnimatedContent";
import LineSidebar from "@/components/LineSidebar";
import { PortableBody } from "@/components/content/PortableBody";
import { MediaRenderer } from "@/components/media/MediaRenderer";
import { formatMonthYear } from "@/lib/format-date";
import {
  headingAnchorId,
  resolveSidebarSections,
} from "@/lib/portfolio-sections";
import type { PortfolioPost } from "@/types/content";

interface ProjectCaseStudyProps {
  post: PortfolioPost;
}

/** Matches sticky header + section scroll-margin. */
const SECTION_OFFSET_PX = 96;

export function ProjectCaseStudy({ post }: ProjectCaseStudyProps) {
  const sections = useMemo(
    () => resolveSidebarSections(post.sections, post.body),
    [post.sections, post.body],
  );
  const meta = [post.client, post.location, formatMonthYear(post.publishedAt)].filter(
    Boolean,
  );

  const sidebarItems = useMemo(
    () => ["Title", ...sections.map((section) => section.label)],
    [sections],
  );
  const anchors = useMemo(
    () => [
      "project-title",
      ...sections.map((section) => headingAnchorId(section.headingText)),
    ],
    [sections],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    function updateActiveFromScroll() {
      let next = 0;
      for (let i = 0; i < anchors.length; i += 1) {
        const el = document.getElementById(anchors[i] ?? "");
        if (!el) continue;
        if (el.getBoundingClientRect().top <= SECTION_OFFSET_PX) {
          next = i;
        }
      }
      setActiveIndex((current) => (current === next ? current : next));
    }

    updateActiveFromScroll();
    window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    window.addEventListener("resize", updateActiveFromScroll);
    return () => {
      window.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
    };
  }, [anchors]);

  function scrollToSection(index: number) {
    setActiveIndex(index);
    const id = anchors[index];
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="project__layout">
      {sidebarItems.length > 1 ? (
        <aside className="project__sidebar" aria-label="On this page">
          <LineSidebar
            items={sidebarItems}
            accentColor="#b0b46c"
            textColor="#6c6c6c"
            markerColor="#6c6c6c"
            showIndex
            showMarker
            proximityRadius={40}
            maxShift={12}
            falloff="sharp"
            markerLength={50}
            markerGap={4}
            tickScale={0}
            scaleTick
            itemGap={4}
            fontSize={1}
            smoothing={100}
            defaultActive={0}
            activeIndex={activeIndex}
            onItemClick={scrollToSection}
          />
        </aside>
      ) : null}

      <article className="project__article">
        <AnimatedContent
          distance={100}
          direction="vertical"
          duration={0.8}
          ease="power3.out"
          blur={0}
          stagger={0.08}
          threshold={0.1}
        >
          <header id="project-title" className="project__header">
            {meta.length > 0 ? <p className="project__meta type-sm">{meta.join(" / ")}</p> : null}
            <h1 className="project__title type-title">{post.title}</h1>
            {post.summary ? (
              <p className="project__summary type-md">{post.summary}</p>
            ) : null}
          </header>

          {post.coverMedia ? (
            <MediaRenderer
              media={post.coverMedia}
              variant="full"
              className="project__cover"
            />
          ) : null}

          <div className="project__body type-md">
            <PortableBody value={post.body} />
          </div>
        </AnimatedContent>
      </article>
    </div>
  );
}
