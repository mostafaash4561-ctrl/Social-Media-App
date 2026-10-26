import type { IconType } from "react-icons";
import { FiBookmark, FiFileText, FiHome, FiUsers } from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";
import {
  HOME_TABS,
  parseTab,
  tabPath,
  type HomeTab,
} from "../../Logic/homeTabs";

const icons: Record<HomeTab, IconType> = {
  feed: FiHome,
  "my-posts": FiFileText,
  community: FiUsers,
  saved: FiBookmark,
};

export default function SidebarNav() {
  const [searchParams] = useSearchParams();
  const current = parseTab(searchParams.get("tab"));

  return (
    <nav
      aria-label="Shortcuts"
      className="my-5 rounded-3xl border border-line-soft bg-white p-3 font-sans text-ink shadow-sm"
    >
      <ul className="grid grid-cols-2 gap-2 xl:grid-cols-1 xl:gap-1">
        {HOME_TABS.map(({ id, label }) => {
          const Icon = icons[id];
          const active = id === current;
          return (
            <li key={id}>
              <Link
                to={tabPath(id)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-muted hover:bg-brand-50"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
