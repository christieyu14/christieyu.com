import Link from "next/link";
import { MOCK_PROJECT_PREVIEWS } from "@/content/project-previews";
import AsciiMotionAnimation from "@/components/content/AsciiMotionAnimation";
import { ProjectPreview } from "@/components/content/ProjectPreview";
import { ProjectsParallax } from "@/components/content/ProjectsParallax";
import { ArrowForwardIcon } from "@/components/icons";
import { Reveal } from "@/components/ui/Reveal";

export function HomeProjects() {
  return (
    <section className="home__projects" aria-label="Selected projects">
      <ProjectsParallax
        ascii={
          <AsciiMotionAnimation
            autoPlay
            speed={0.5}
            scale={0.72}
            opacity={1}
            showControls={false}
          />
        }
      >
        <div className="home__projects-list">
          {MOCK_PROJECT_PREVIEWS.map((project, index) => (
            <Reveal
              key={project.id}
              className="home__projects-item"
              delayMs={Math.min(index * 90, 280)}
              threshold={0.06}
            >
              <ProjectPreview project={project} />
            </Reveal>
          ))}
        </div>
      </ProjectsParallax>

      <Reveal as="nav" className="home__cta" delayMs={40} aria-label="Next steps">
        <Link href="/work" className="home__cta-link">
          <span className="home__cta-link-text">View the rest of my portfolio</span>
          <ArrowForwardIcon size={20} />
        </Link>
        <div className="home__cta-row">
          <Link href="/resume" className="home__cta-link">
            <span className="home__cta-link-text">Read my resume</span>
            <ArrowForwardIcon size={20} />
          </Link>
          <Link href="/contact" className="home__cta-link">
            <span className="home__cta-link-text">Or contact me</span>
            <ArrowForwardIcon size={20} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
