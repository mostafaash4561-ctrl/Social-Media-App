import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function BackToHome() {
  return (
    <div className="mx-auto mt-5 w-full max-w-4xl px-4 sm:px-0">
      <Link
        to="/home"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line-soft bg-white px-4 font-sans text-sm font-semibold text-ink-soft shadow-sm transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
      >
        <FiArrowLeft className="h-4.5 w-4.5" aria-hidden="true" />
        Back to home
      </Link>
    </div>
  );
}
