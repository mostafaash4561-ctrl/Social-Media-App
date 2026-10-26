import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiLogOut, FiSettings, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";

const itemCls =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200";

export default function UserMenu({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative sm:flex-1 md:flex-none">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-white/70 px-5 text-[15px] font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/40 md:h-10 md:w-auto"
      >
        <FiUser className="h-4.5 w-4.5" />
        Account
        <FiChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="mt-2 w-full origin-top-right animate-pop-in rounded-2xl border border-line-soft bg-white p-1.5 shadow-lg md:absolute md:top-full md:right-0 md:w-48"
        >
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={`${itemCls} text-ink-soft hover:bg-brand-50`}
          >
            <FiSettings className="h-4.5 w-4.5" />
            Settings
          </Link>

          <div role="separator" className="mx-2 my-1 h-px bg-surface" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className={`${itemCls} text-red-600 hover:bg-red-50`}
          >
            <FiLogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
