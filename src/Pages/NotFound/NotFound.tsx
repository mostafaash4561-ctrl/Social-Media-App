import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>NotFound</title>
      </Helmet>
      <main className="relative my-5 flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden rounded-2xl border border-line-soft bg-canvas px-4 py-16 font-sans text-ink">
        {/* soft decorative glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-accent-400/30 blur-3xl"
        />

        <section className="animate-fade-up relative flex w-full max-w-xl flex-col items-center gap-8 text-center">
          {/* 404 */}
          <div
            role="img"
            aria-label="404"
            className="flex select-none items-center justify-center font-display text-[7rem] leading-none font-bold text-brand-900 sm:text-[10rem] md:text-[12rem]"
          >
            <span aria-hidden="true">4</span>
            <span
              aria-hidden="true"
              className="bg-linear-to-br from-brand-500 to-accent-500 bg-clip-text text-transparent"
            >
              0
            </span>
            <span aria-hidden="true">4</span>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              Looks like you took a wrong turn
            </h1>
            <p className="mx-auto max-w-md text-base leading-relaxed text-muted">
              The page you are looking for does not exist or has been moved. Let
              us get you back on the route.
            </p>
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/"
              className="flex h-12 items-center justify-center rounded-xl bg-brand-600 px-8 text-[15px] font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 active:translate-y-0"
            >
              Back to home
            </Link>
            <Link
              to="/profile"
              className="flex h-12 items-center justify-center rounded-xl border-2 border-line bg-white px-8 text-[15px] font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:border-brand-600 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 active:translate-y-0"
            >
              Go to profile
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
