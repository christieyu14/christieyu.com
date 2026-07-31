/**
 * Homepage intro copy from Figma Desktop - 1 (17:103).
 * Move to Sanity siteSettings / homepage singleton when editorial CMS is ready.
 */
export function HomeIntro() {
  return (
    <section className="home__intro" aria-label="Introduction">
      <div className="home__intro-copy">
        <p>
          Hi! I&apos;m Christie, a product designer with 8+ years of experience.
          Right now, I&apos;m working on projects with{" "}
          <span className="home__intro-emphasis">Lenovo and FIFA</span>, specifically
          an application that drives real-time decision making for the World Cup.
        </p>
        <p>
          I&apos;m a thinker more than I am a designer. I&apos;m good at making things
          beautiful, but I am even better at making things useful—and best at making
          things happen. I pour myself into details and I pour myself into my team,
          driving us to be more efficient, imaginative, and ambitious together.
        </p>
      </div>
    </section>
  );
}
