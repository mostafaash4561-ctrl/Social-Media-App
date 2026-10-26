import { NavLink } from "react-router-dom";

const tabCls = ({ isActive }: { isActive: boolean }) =>
  `flex h-11 flex-1 items-center justify-center rounded-xl text-[15px] font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 ${
    isActive
      ? "bg-brand-600 text-white"
      : "text-muted hover:bg-brand-50"
  }`;

export default function AuthSwitch() {
  return (
    <nav
      aria-label="Authentication"
      className="flex w-full max-w-115 gap-1 rounded-2xl border-[1.5px] border-line bg-white p-1"
    >
      <NavLink to="/login" className={tabCls}>
        Login
      </NavLink>
      <NavLink to="/register" className={tabCls}>
        Register
      </NavLink>
    </nav>
  );
}
