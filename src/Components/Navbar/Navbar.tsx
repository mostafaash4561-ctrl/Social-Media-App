import { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext/AuthContext";
import useUnreadCount from "../../Hooks/useUnreadCount";
import UserMenu from "../UserMenu/UserMenu";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-4 py-2.5 text-[15px] transition md:py-2 ${
    isActive
      ? "bg-white/20 font-semibold text-white"
      : "font-medium text-brand-100 hover:bg-white/10 hover:text-white"
  }`;

export default function Navbar() {
  const { setuserLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const { data: unread = 0 } = useUnreadCount(true);

  function logOut() {
    localStorage.removeItem("userToken");
    setuserLogin(null);
    navigate("/login", { replace: true });
  }
  return (
    <header className="sticky top-0 z-50 bg-brand-900 font-sans shadow-md">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-3 px-4 py-3 sm:px-6 md:flex-nowrap md:gap-6 lg:px-8"
      >
        {/* Logo (left) */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="font-display text-2xl font-bold text-white">
            Route
          </span>
        </Link>

        {/* Mobile menu toggle (hidden checkbox + label) */}
        <input
          id="nav-toggle"
          type="checkbox"
          className="peer sr-only"
          aria-label="Toggle menu"
        />
        <label
          htmlFor="nav-toggle"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-white transition hover:bg-white/10 peer-focus-visible:ring-4 peer-focus-visible:ring-white/40 md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>

        {/* Collapsible area: links (center) + buttons (right) */}
        <div className="hidden w-full flex-col gap-4 border-t border-white/20 pt-3 peer-checked:flex md:flex md:w-auto md:flex-1 md:flex-row md:items-center md:gap-6 md:border-0 md:pt-0">
          {/* Links (center) */}
          <ul className="flex flex-col gap-1 md:flex-1 md:flex-row md:items-center md:justify-center">
            <li>
              <NavLink to="/home" className={linkCls}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={linkCls}>
                Profile
              </NavLink>
            </li>
            <li>
              <NavLink to="/notifications" className={linkCls}>
                Notifications
                {unread > 0 && (
                  <>
                    <span
                      aria-hidden="true"
                      className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white"
                    >
                      {unread > 9 ? "9+" : unread}
                    </span>
                    <span className="sr-only">{unread} unread</span>
                  </>
                )}
              </NavLink>
            </li>
          </ul>

          {/* Buttons (right) */}
          <div className="flex flex-col gap-2.5 sm:flex-row md:shrink-0">
            <UserMenu onLogout={logOut} />
          </div>
        </div>
      </nav>
    </header>
  );
}
