import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import { Link } from "react-router-dom";
import SuggestedUserRow from "../../Components/SuggestedUserRow/SuggestedUserRow";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { fetchSuggestions } from "../../Logic/suggestions";
import type { SuggestedUser } from "../../Types/User.type";

const LIMIT = 20;

export default function Suggestions() {
  const [search, setSearch] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["friendSuggestions", "all"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchSuggestions(pageParam, LIMIT),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LIMIT) return undefined;
      const earlier = new Set(
        allPages.slice(0, -1).flatMap((p) => p.map((u) => u._id)),
      );
      if (lastPage.every((u) => earlier.has(u._id))) return undefined;
      return allPages.length + 1;
    },
  });

  const users: SuggestedUser[] = [];
  const seen = new Set<string>();
  for (const page of data?.pages ?? []) {
    for (const user of page) {
      if (!seen.has(user._id)) {
        seen.add(user._id);
        users.push(user);
      }
    }
  }

  const term = search.trim().toLowerCase();
  const visible = term
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(term) ||
          u.username?.toLowerCase().includes(term),
      )
    : users;

  return (
    <>
      <Helmet>
        <title>Friend suggestions</title>
      </Helmet>

      <div className="mx-auto my-5 w-full max-w-5xl font-sans text-ink">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          <FiArrowLeft className="h-4.5 w-4.5" />
          Back to home
        </Link>

        <div className="mt-3 flex flex-col gap-4 rounded-3xl border border-line-soft bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="font-display text-2xl font-bold">
              Friend suggestions
            </h1>

            <div className="relative sm:w-72">
              <label htmlFor="suggestions-search" className="sr-only">
                Search friends
              </label>
              <FiSearch
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-subtle"
              />
              <input
                id="suggestions-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search friends..."
                className="h-10 w-full rounded-full border border-line-soft bg-canvas pr-4 pl-10 text-sm outline-none transition placeholder:text-subtle focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
              <ImSpinner8 className="h-5 w-5 animate-spin" />
              Loading...
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="cursor-pointer rounded-full border border-line-soft px-5 py-2 text-sm font-semibold text-ink-soft transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              >
                Try again
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">
              {term
                ? "No friends match your search."
                : "No suggestions right now."}
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((user) => (
                <li
                  key={user._id}
                  className="rounded-2xl border border-line-soft p-4"
                >
                  <SuggestedUserRow user={user} showUsername />
                </li>
              ))}
            </ul>
          )}

          {hasNextPage && !isLoading && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mx-auto flex h-11 min-w-40 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:bg-brand-400"
            >
              {isFetchingNextPage ? (
                <>
                  <ImSpinner8 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
