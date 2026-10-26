import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import FriendSuggestions from "../../Components/FriendSuggestions/FriendSuggestions";
import PostCreation from "../../Components/PostCreation/PostCreation";
import PostsList from "../../Components/PostsList/PostsList";
import SidebarNav from "../../Components/SidebarNav/SidebarNav";
import { HOME_TABS, parseTab } from "../../Logic/homeTabs";

export default function Home() {
  const [searchParams] = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const label = HOME_TABS.find((t) => t.id === tab)?.label;

  return (
    <>
      <Helmet>
        <title>{tab === "feed" ? "Home" : `${label} | Home`}</title>
      </Helmet>

      <div className="grid grid-cols-1 items-start gap-x-6 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        <aside className="xl:sticky xl:top-20 xl:col-start-1 xl:row-start-1">
          <SidebarNav />
        </aside>

        <aside className="xl:sticky xl:top-20 xl:col-start-3 xl:row-start-1">
          <FriendSuggestions />
        </aside>

        <section
          aria-label={label}
          className="min-w-0 xl:col-start-2 xl:row-start-1"
        >
          <PostCreation />
          <PostsList key={tab} tab={tab} />
        </section>
      </div>
    </>
  );
}
