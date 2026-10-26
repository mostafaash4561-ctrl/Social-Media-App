export type HomeTab = "feed" | "my-posts" | "community" | "saved";

export const HOME_TABS: { id: HomeTab; label: string }[] = [
  { id: "feed", label: "Feed" },
  { id: "my-posts", label: "My Posts" },
  { id: "community", label: "Community" },
  { id: "saved", label: "Saved" },
];

export function parseTab(value: string | null): HomeTab {
  return HOME_TABS.some((t) => t.id === value) ? (value as HomeTab) : "feed";
}

export function tabPath(tab: HomeTab) {
  return tab === "feed" ? "/" : `/?tab=${tab}`;
}
