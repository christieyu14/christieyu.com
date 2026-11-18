"use client";

import { HazeText } from "@/components/effects/HazeText";

const COPY = [
  "Right now, I'm shipping bespoke operations solutions with Lenovo for some of the biggest events in the world.",
  "In my additional time, I help steer the unification of Lenovo-Motorola design systems. I also build agentic AI concepts and MVP's for showcase events like Techworld.",
  "In every project, I'm a thinker first and a designer second. I like making things beautiful and I like making things good. Most of all, I like making things happen.",
] as const;

export function HomeIntro() {
  return (
    <section className="home-intro" aria-label="About Christie">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="home-intro__portrait"
        src="/images/home/portrait.jpg"
        alt="Christie Yu"
        width={90}
        height={90}
      />
      <div className="home-intro__copy type-md">
        {COPY.map((paragraph) => (
          <HazeText key={paragraph} as="p" className="home-intro__paragraph">
            {paragraph}
          </HazeText>
        ))}
      </div>
    </section>
  );
}
