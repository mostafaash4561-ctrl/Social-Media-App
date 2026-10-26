import { useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { fetchSuggestions } from "../../Logic/suggestions";
import SuggestedUserRow from "../SuggestedUserRow/SuggestedUserRow";

const SHOWN = 5;
const FETCH_LIMIT = 20;

export default function FriendSuggestions() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const uid = useId();
  const bodyId = `${uid}-body`;
  const searchId = `${uid}-search`;

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["friendSuggestions", "card"],
    queryFn: () => fetchSuggestions(1, FETCH_LIMIT),
  });

  const term = search.trim().toLowerCase();
  const filtered = term
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.username?.toLowerCase().includes(term),
      )
    : users;
  const shown = term ? filtered : filtered.slice(0, SHOWN);
  const showViewMore =
    !term && (filtered.length > SHOWN || filtered.length >= FETCH_LIMIT);

  return (
    <section
      aria-label="Friend suggestions"
      className="my-5 rounded-3xl border border-line-soft bg-white p-5 font-sans text-ink shadow-sm"
    >
      {/* Header: title + (small screens only) Show / Hide */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Friend suggestions</h2>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 xl:hidden"
        >
          {open ? "Hide" : "Show"}
          <FiChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Body: collapsed on small screens, always visible on xl */}
      <div id={bodyId} className={`${open ? "block" : "hidden"} mt-4 xl:block`}>
        {/* Search */}
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            Search friends
          </label>
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-subtle"
          />
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friends..."
            className="h-10 w-full rounded-full border border-line-soft bg-canvas pr-4 pl-10 text-sm outline-none transition placeholder:text-subtle focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
        </div>

        {/* List */}
        <div className="mt-3">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
              <ImSpinner8 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="cursor-pointer rounded-full border border-line-soft px-4 py-1.5 text-sm font-semibold text-ink-soft transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              >
                Try again
              </button>
            </div>
          ) : shown.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              {term
                ? "No friends match your search."
                : "No suggestions right now."}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {shown.map((user) => (
                <li key={user._id} className="py-2">
                  <SuggestedUserRow user={user} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* View more: opens the full list on another page */}
        {showViewMore && (
          <Link
            to="/suggestions"
            className="mt-2 flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold text-brand-700 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
          >
            View more
          </Link>
        )}
      </div>
    </section>
  );
}
