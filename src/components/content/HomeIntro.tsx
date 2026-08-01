/**
 * Homepage intro copy from Figma Homepage — live (31:2).
 */
import { Reveal } from "@/components/ui/Reveal";
import { SentenceRevealBlock } from "@/components/ui/SentenceRevealBlock";

const INTRO_PARAGRAPHS = [
  "Right now, I'm designing a Lenovo × FIFA platform for the people making real calls during the World Cup, from the COO to service teams in the field. I talk to people every day and figure out how to turn their daily struggles into a product they enjoy reaching for.",
  "Before that, I helped steer the unification of Lenovo-Motorola design systems. I've also built and shipped agentic AI apps at an enterprise level.",
  "In every project, I'm a thinker first and a designer second. I love making things beautiful, but I care even more about making things useful. Most of all, I like making things happen.",
] as const;

export function HomeIntro() {
  return (
    <section className="home__intro" aria-label="Introduction">
      <SentenceRevealBlock
        className="home__intro-copy"
        paragraphs={INTRO_PARAGRAPHS}
        staggerMs={200}
      />
      <Reveal className="home__intro-portrait" delayMs={120} threshold={0.2}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/portrait.jpg"
          alt="Portrait of Christie Yu"
          width={240}
          height={258}
        />
      </Reveal>
    </section>
  );
}
