import Link from "next/link";
import { MOCK_PROJECT_PREVIEWS } from "@/content/project-previews";
import { AsciiBackground } from "@/components/content/AsciiBackground";
import { ProjectPreview } from "@/components/content/ProjectPreview";
import { ProjectsParallax } from "@/components/content/ProjectsParallax";
import { Reveal } from "@/components/ui/Reveal";

/** Diagonal placement on a 2×4 grid: right, left, right, left. */
const SCATTER_SLOTS = ["end", "start", "end", "start"] as const;

export function HomeProjects() {
  return (
    <section className="home__projects" aria-label="Selected projects">
      <ProjectsParallax ascii={<AsciiBackground />}>
        <div className="home__projects-ascii-lead" aria-hidden="true" />
        <div className="home__projects-grid">
          {MOCK_PROJECT_PREVIEWS.map((project, index) => (
            <Reveal
              key={project.id}
              className={`home__projects-cell home__projects-cell--${SCATTER_SLOTS[index]}`}
              delayMs={Math.min(index * 110, 360)}
              threshold={0.06}
            >
              <ProjectPreview project={project} />
            </Reveal>
          ))}
        </div>
      </ProjectsParallax>

      <Reveal as="nav" className="home__cta" delayMs={40} aria-label="Next steps">
        <Link href="/work" className="home__cta-link">
          View the rest of my portfolio →
        </Link>
        <div className="home__cta-row">
          <Link href="/resume" className="home__cta-link">
            Read my resume →
          </Link>
          <Link href="/contact" className="home__cta-link">
            Or contact me →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
