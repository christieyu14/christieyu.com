import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="container" style={{ paddingBlock: "2rem" }}>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <p>
        <Link href="/">Return home</Link>
      </p>
    </main>
  );
}
