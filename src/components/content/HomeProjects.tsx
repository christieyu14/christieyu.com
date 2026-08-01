import Link from "next/link";
import { MOCK_PROJECT_PREVIEWS } from "@/content/project-previews";
import { AsciiBackground } from "@/components/content/AsciiBackground";
import { ProjectPreview } from "@/components/content/ProjectPreview";
import { Reveal } from "@/components/ui/Reveal";

export function HomeProjects() {
  const [left, topRight, bottomRight] = MOCK_PROJECT_PREVIEWS;

  return (
    <section className="home__projects" aria-label="Selected projects">
      <div className="home__projects-stage">
        <AsciiBackground />
        <div className="home__projects-grid">
          {topRight ? (
            <Reveal
              className="home__projects-slot home__projects-slot--top-right"
              delayMs={0}
              threshold={0.08}
            >
              <ProjectPreview project={topRight} />
            </Reveal>
          ) : null}
          {left ? (
            <Reveal
              className="home__projects-slot home__projects-slot--left"
              delayMs={70}
              threshold={0.08}
            >
              <ProjectPreview project={left} />
            </Reveal>
          ) : null}
          {bottomRight ? (
            <Reveal
              className="home__projects-slot home__projects-slot--bottom-right"
              delayMs={120}
              threshold={0.06}
            >
              <ProjectPreview project={bottomRight} />
            </Reveal>
          ) : null}
        </div>
      </div>

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
