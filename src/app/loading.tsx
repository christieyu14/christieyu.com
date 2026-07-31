export default function Loading() {
  return (
    <main id="main-content" className="container" style={{ paddingBlock: "2rem" }}>
      <p role="status" aria-live="polite">
        Loading…
      </p>
    </main>
  );
}
