import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto bg-brand-900 font-sans text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex max-w-sm flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="font-display text-2xl font-bold">Route</span>
            </Link>
            <p className="text-[15px] leading-relaxed text-brand-100">
              Share your world with people who get it. Post, follow and chat
              with friends in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-sm text-brand-100 sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p>© 2026 Route. All rights reserved.</p>
          <p>
            Made by <span className="font-extrabold fs-5">Mustafa Ashraf</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
