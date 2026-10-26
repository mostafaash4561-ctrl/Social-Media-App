import { useState } from "react";
import type { IconType } from "react-icons";
import { FiBookmark, FiFileText } from "react-icons/fi";
import type { HomeTab } from "../../Logic/homeTabs";
import PostsList from "../PostsList/PostsList";

type ProfileTab = Extract<HomeTab, "my-posts" | "saved">;

const TABS: { id: ProfileTab; label: string; icon: IconType }[] = [
  { id: "my-posts", label: "My posts", icon: FiFileText },
  { id: "saved", label: "Saved", icon: FiBookmark },
];

export default function ProfilePosts() {
  const [tab, setTab] = useState<ProfileTab>("my-posts");

  return (
    <section
      aria-label="Posts"
      className="mx-auto w-full max-w-4xl px-4 pb-8 font-sans text-ink sm:px-0"
    >
      <div
        role="tablist"
        aria-label="Profile posts"
        className="flex gap-1 rounded-3xl border border-line-soft bg-white p-1.5 shadow-sm"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`profile-tab-${id}`}
              aria-selected={active}
              aria-controls="profile-posts-panel"
              onClick={() => setTab(id)}
              className={`flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 ${
                active
                  ? "bg-brand-600 text-white"
                  : "text-muted hover:bg-brand-50"
              }`}
            >
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="profile-posts-panel"
        aria-labelledby={`profile-tab-${tab}`}
      >
        <PostsList key={tab} tab={tab} showTitle={false} />
      </div>
    </section>
  );
}
