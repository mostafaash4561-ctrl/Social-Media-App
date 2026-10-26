import { useInfiniteQuery } from "@tanstack/react-query";
import axios, { type AxiosResponse } from "axios";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaHeart } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import useLockBodyScroll from "../../Hooks/useLockBodyScroll";
import { DEFAULT_AVATAR } from "../../Logic/defaults";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { API_URL, authConfig } from "../../Logic/suggestions";
import UserLink from "../UserLink/UserLink";

const LIMIT = 20;

type LikeUser = {
  _id: string;
  name: string;
  username?: string;
  photo?: string;
};


function extractLikeUsers(res: AxiosResponse): LikeUser[] {
  const payload = res.data?.data;
  const list =
    payload?.likes ?? payload?.users ?? (Array.isArray(payload) ? payload : []);
  if (!Array.isArray(list)) return [];
  return list
    .map(
      (item: Record<string, unknown>) =>
        (item?.user ?? item?.likedBy ?? item) as LikeUser,
    )
    .filter((u: LikeUser) => Boolean(u?._id));
}

export default function LikesModal({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["postLikes", postId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      axios.get(`${API_URL}/posts/${postId}/likes`, {
        params: { page: pageParam, limit: LIMIT },
        ...authConfig(),
      }),
    getNextPageParam: (lastPage, allPages) => {
      const last = extractLikeUsers(lastPage);
      if (last.length < LIMIT) return undefined;
      const earlier = new Set(
        allPages.slice(0, -1).flatMap((p) => extractLikeUsers(p).map((u) => u._id)),
      );
      if (last.every((u) => earlier.has(u._id))) return undefined;
      return allPages.length + 1;
    },
  });

  useLockBodyScroll();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const users: LikeUser[] = [];
  const seen = new Set<string>();
  for (const page of data?.pages ?? []) {
    for (const u of extractLikeUsers(page)) {
      if (!seen.has(u._id)) {
        seen.add(u._id);
        users.push(u);
      }
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="People who liked this post"
      onClick={onClose}
      className="animate-fade-in fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 font-sans text-ink backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line-soft px-5 py-4">
          <h2 className="font-display text-lg font-bold">Likes</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
          >
            <FiX className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto p-3 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {isLoading && (
            <p className="flex items-center justify-center gap-2 p-6 text-sm text-muted">
              <ImSpinner8 className="animate-spin" /> Loading...
            </p>
          )}

          {isError && (
            <p role="alert" className="p-6 text-center text-sm text-red-700">
              {getErrorMessage(error)}
            </p>
          )}

          {!isLoading && !isError && users.length === 0 && (
            <p className="p-6 text-center text-sm text-muted">
              No likes yet.
            </p>
          )}

          {users.length > 0 && (
            <ul className="flex flex-col">
              {users.map((u) => (
                <li key={u._id}>
                  <UserLink
                    user={u}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
                  >
                    <img
                      src={u.photo || DEFAULT_AVATAR}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-full bg-brand-900 object-cover"
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold">
                        {u.name}
                      </span>
                      {u.username && (
                        <span className="truncate text-xs text-muted">
                          {u.username}
                        </span>
                      )}
                    </span>
                    <FaHeart
                      className="ml-auto h-4 w-4 shrink-0 text-red-500"
                      aria-label="Liked"
                    />
                  </UserLink>
                </li>
              ))}
            </ul>
          )}

          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mx-auto mt-3 flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line-soft px-5 text-sm font-semibold text-ink-soft transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFetchingNextPage && <ImSpinner8 className="animate-spin" />}
              Load more
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}