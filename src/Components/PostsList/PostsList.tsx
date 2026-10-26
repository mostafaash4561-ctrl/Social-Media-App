import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef } from "react";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import type { HomeTab } from "../../Logic/homeTabs";
import { extractPosts } from "../../Logic/posts";
import { API_URL, authConfig } from "../../Logic/suggestions";
import type { PostType } from "../../Types/Post.type";
import Loader from "../Loader/Loader";
import Post from "../Post/Post";

const LIMIT = 40;

type Source = {
  url: string;
  params?: Record<string, string>;
  title?: string;
  empty: string;
};

const SOURCES: Record<HomeTab, Source> = {
  feed: {
    url: `${API_URL}/posts/feed`,
    params: { only: "following" },
    empty: "No posts yet. Follow people to see their posts here.",
  },
  "my-posts": {
    url: `${API_URL}/posts/feed`,
    params: { only: "me" },
    title: "My posts",
    empty: "You haven't posted anything yet.",
  },
  community: {
    url: `${API_URL}/posts`,
    title: "Community",
    empty: "No posts in the community yet.",
  },
  saved: {
    url: `${API_URL}/users/bookmarks`,
    title: "Saved posts",
    empty: "You haven't saved any posts yet.",
  },
};

export default function PostsList({
  tab,
  showTitle = true,
}: {
  tab: HomeTab;
  showTitle?: boolean;
}) {
  const source = SOURCES[tab];
  const loaderRef = useRef<HTMLDivElement | null>(null);

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
    queryKey: ["getAllPosts", tab],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      axios.get(source.url, {
        params: { ...source.params, page: pageParam, limit: LIMIT },
        ...authConfig(),
      }),
    getNextPageParam: (lastPage, allPages) => {
      const last = extractPosts(lastPage);
      if (last.length < LIMIT) return undefined;
      const earlier = new Set(
        allPages.slice(0, -1).flatMap((p) => extractPosts(p).map((x) => x._id)),
      );
      if (last.every((p) => earlier.has(p._id))) return undefined;
      return allPages.length + 1;
    },
  });

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="my-5 flex flex-col items-center gap-3 rounded-3xl border border-line-soft bg-white p-8 text-center font-sans shadow-sm"
      >
        <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="cursor-pointer rounded-full border border-line-soft px-5 py-2 text-sm font-semibold text-ink-soft transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          Try again
        </button>
      </div>
    );
  }

  const posts: PostType[] = [];
  const seen = new Set<string>();
  for (const page of data?.pages ?? []) {
    for (const post of extractPosts(page)) {
      if (!seen.has(post._id)) {
        seen.add(post._id);
        posts.push(post);
      }
    }
  }

  return (
    <>
      {showTitle && source.title && (
        <h2 className="mt-5 font-display text-xl font-bold text-ink">
          {source.title}
        </h2>
      )}

      {posts.length === 0 && (
        <p className="my-5 rounded-3xl border border-line-soft bg-white p-8 text-center font-sans text-sm text-muted shadow-sm">
          {source.empty}
        </p>
      )}

      {posts.map((post) => (
        <Post post={post} key={post._id} isPostDetails={false} />
      ))}

      <div ref={loaderRef} className="py-6 text-center text-sm text-muted">
        {isFetchingNextPage && "Loading more posts..."}
        {!hasNextPage && posts.length > 0 && "No more posts"}
      </div>
    </>
  );
}
