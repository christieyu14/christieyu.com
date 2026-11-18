import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content">
      <div className="content-page">
        <header className="content-page__header">
          <h1 className="type-title">Page not found</h1>
          <p className="content-page__description type-md">
            The page you requested does not exist.
          </p>
        </header>
        <Link className="type-link type-md" href="/">
          return home
        </Link>
      </div>
    </main>
  );
}
