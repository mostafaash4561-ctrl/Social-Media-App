import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import type { Comment as CommentType } from "../../Types/Post.type";
import Comment from "../Comment/Comment";
import { getErrorMessage } from "../../Logic/getErrorMessage";

const MySwal = withReactContent(Swal);
const LIMIT = 20;

export default function PostComments({ postId }: { postId: string }) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["getPostComments", postId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      axios.get(`https://route-posts.routemisr.com/posts/${postId}/comments`, {
        params: { page: pageParam, limit: LIMIT },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }),
    getNextPageParam: (lastPage, allPages) => {
      const last: CommentType[] = lastPage.data?.data?.comments ?? [];
      if (last.length < LIMIT) return undefined;

      const prevIds = new Set(
        allPages
          .slice(0, -1)
          .flatMap((p) => p.data?.data?.comments ?? [])
          .map((c: CommentType) => c._id),
      );
      if (last.every((c) => prevIds.has(c._id))) return undefined;

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

  useEffect(() => {
    if (isError) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(error),
      });
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <p className="px-5 pb-4 text-sm text-muted">Loading comments...</p>
    );
  }

  const all: CommentType[] =
    data?.pages.flatMap((page) => page.data?.data?.comments ?? []) ?? [];
  // replies are shown under their parent comment, not in the main list
  const comments = Array.from(
    new Map(
      all.filter((c) => !c.parentComment).map((c) => [c._id, c]),
    ).values(),
  );

  if (comments.length === 0) {
    return (
      <p className="px-5 pb-5 text-center text-sm text-muted">
        No comments yet
      </p>
    );
  }

  return (
    <>
      {comments.map((comment) => (
        <Comment key={comment._id} comment={comment} postId={postId} />
      ))}

      <div ref={loaderRef} className="py-3 text-center text-sm text-muted">
        {isFetchingNextPage && "Loading more comments..."}
        {!hasNextPage && comments.length > 0 && "No more comments"}
      </div>
    </>
  );
}
