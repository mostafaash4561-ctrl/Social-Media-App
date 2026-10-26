import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FiEdit2, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { AuthContext } from "../../Context/AuthContext/AuthContext";
import { formatDate } from "../../Logic/formateDate";
import type { Comment as CommentType } from "../../Types/Post.type";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import ViewableImage from "../ImageLightbox/ViewableImage";
import CommentEditForm from "../CommentEditForm/CommentEditForm";
import UserLink from "../UserLink/UserLink";
import CommentReplies, {
  ReplyForm,
  useCommentReplies,
} from "../CommentReplies/CommentReplies";

export default function Comment({
  comment,
  postId: postIdProp,
  isReply = false,
  parentId,
}: {
  comment: CommentType;
  postId?: string;
  isReply?: boolean;
  parentId?: string;
}) {
  const MySwal = withReactContent(Swal);

  const itemCls =
    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200";

  const { userId: loginUserId } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const replyTargetId = parentId ?? comment._id;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const postId = postIdProp ?? comment.post;
  const { replies: fetchedReplies } = useCommentReplies(
    postId,
    comment._id,
    !isReply && comment.repliesCount === undefined,
  );
  const repliesCount = comment.repliesCount ?? fetchedReplies.length;
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function run(action?: () => void) {
    setOpen(false);
    action?.();
  }

  function handleDeleteComment() {
    return axios.delete(
      `https://route-posts.routemisr.com/posts/${postId}/comments/${comment._id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      },
    );
  }
  const query = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: handleDeleteComment,
    onSuccess: () => {
      MySwal.fire({
        title: "Comment deleted successfully",
        icon: "success",
        draggable: true,
      });
      query.invalidateQueries({ queryKey: ["getAllPosts"] });
      query.invalidateQueries({ queryKey: ["getPostComments"] });
      query.invalidateQueries({ queryKey: ["getPostDetails"] });
      query.invalidateQueries({ queryKey: ["getCommentReplies"] });
    },
    onError: (err) => {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err),
      });
    },
  });

  const [likeOverride, setLikeOverride] = useState<boolean | null>(null);
  const liked = likeOverride ?? comment.likes.includes(loginUserId);

  const { mutate: mutateLike } = useMutation({
    mutationFn: () =>
      axios.put(
        `https://route-posts.routemisr.com/posts/${postId}/comments/${comment._id}/like`,
        null,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      ),
    onMutate: () => setLikeOverride(!liked),
    onSuccess: () =>
      Promise.all([
        query.invalidateQueries({ queryKey: ["getAllPosts"] }),
        query.invalidateQueries({ queryKey: ["getPostComments"] }),
        query.invalidateQueries({ queryKey: ["getPostDetails"] }),
        query.invalidateQueries({ queryKey: ["getCommentReplies"] }),
      ]),
    onError: (err) => {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err),
      });
    },
    onSettled: () => setLikeOverride(null),
  });

  return (
    <>
      <section
        aria-label={isReply ? "Reply" : "Top comment"}
        className={`flex flex-col gap-3 font-sans text-ink ${
          isReply ? "mt-2" : "mt-3 px-5 pb-4"
        }`}
      >
        <div className="flex gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {/* Bubble */}
            <div className="relative mb-2 rounded-2xl rounded-tl-md bg-surface px-4 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <UserLink
                    user={comment?.commentCreator}
                    label={`${comment?.commentCreator.name}'s profile`}
                    className="shrink-0"
                  >
                    <img
                      src={comment?.commentCreator.photo}
                      alt="comment Creator image"
                      className="h-9 w-9 rounded-full bg-brand-900 object-cover"
                    />
                  </UserLink>
                  <UserLink
                    user={comment?.commentCreator}
                    className="truncate text-[13px] font-semibold hover:underline"
                  >
                    {comment?.commentCreator.name}
                  </UserLink>
                </div>
                <div className="-mr-2 flex shrink-0 items-center gap-1">
                  <span className="text-xs text-muted">
                    {formatDate(comment?.createdAt)}
                  </span>
                  {loginUserId !== comment.commentCreator._id ? (
                    ""
                  ) : (
                    <>
                      <div ref={wrapperRef} className="relative">
                        <button
                          type="button"
                          aria-label="More options"
                          aria-haspopup="menu"
                          aria-expanded={open}
                          onClick={() => setOpen((prev) => !prev)}
                          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 ${
                            open ? "bg-surface" : ""
                          }`}
                        >
                          <FiMoreHorizontal className="h-5 w-5" />
                        </button>

                        {open && (
                          <div
                            role="menu"
                            className="absolute top-full right-0 z-20 mt-2 w-52 origin-top-right animate-pop-in rounded-2xl border border-line-soft bg-white p-1.5 shadow-lg"
                          >
                            <>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => run(() => setEditing(true))}
                                className={`${itemCls} text-ink-soft hover:bg-brand-50`}
                              >
                                <FiEdit2 className="h-4.5 w-4.5" />
                                Edit Comment
                              </button>

                              <div
                                role="separator"
                                className="mx-2 my-1 h-px bg-surface"
                              />

                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => run(mutate)}
                                className={`${itemCls} text-red-600 hover:bg-red-50`}
                              >
                                <FiTrash2 className="h-4.5 w-4.5" />
                                Delete Comment
                              </button>
                            </>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {editing ? (
                <CommentEditForm
                  comment={comment}
                  postId={postId}
                  onDone={() => setEditing(false)}
                />
              ) : (
                comment?.content && (
                  <p className="mt-0.5 ml-2 wrap-break-word text-sm leading-relaxed">
                    {comment?.content}
                  </p>
                )
              )}
              {comment?.image && (
                <ViewableImage
                  src={comment?.image}
                  alt="comment image"
                  className="mt-2 block h-auto max-h-60 w-auto max-w-full cursor-pointer rounded-2xl object-contain"
                />
              )}

              {/* Like count badge */}
              {comment?.likes.length > 0 ? (
                <>
                  {" "}
                  <button className="absolute cursor-pointer -bottom-3 right-3 flex items-center gap-1 rounded-full border border-line-soft bg-white px-2 py-0.5 text-xs font-semibold text-muted shadow-sm">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white">
                      <FaHeart className="h-2 w-2" />
                    </span>
                    {comment?.likes.length}
                  </button>
                </>
              ) : (
                ""
              )}
            </div>

            {/* Comment actions */}
            <div className="flex items-center gap-4 px-2 pt-1 text-xs font-semibold text-muted">
              {/* Like / Unlike */}
              <button
                type="button"
                onClick={() => mutateLike()}
                aria-pressed={liked}
                className={`flex cursor-pointer items-center gap-1.5 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 ${
                  liked ? "text-red-500" : "hover:text-red-500"
                }`}
              >
                {liked ? (
                  <FaHeart className="h-3.5 w-3.5" />
                ) : (
                  <FaRegHeart className="h-3.5 w-3.5" />
                )}
                {liked ? "Liked" : "Like"}
              </button>
              <button
                type="button"
                onClick={() => setShowReplyForm((prev) => !prev)}
                aria-expanded={showReplyForm}
                className="transition hover:text-brand-700 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              >
                Reply
              </button>
              {!isReply && repliesCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowReplies((prev) => !prev)}
                  aria-expanded={showReplies}
                  className="transition hover:text-brand-700 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
                >
                  {showReplies
                    ? "Hide replies"
                    : `View ${repliesCount} ${repliesCount === 1 ? "reply" : "replies"}`}
                </button>
              )}
            </div>

            {showReplyForm && (
              <div className="mt-1 ml-2">
                <ReplyForm
                  postId={postId}
                  commentId={replyTargetId}
                  onCancel={() => setShowReplyForm(false)}
                  onDone={() => {
                    setShowReplyForm(false);
                    setShowReplies(true);
                  }}
                />
              </div>
            )}

            {!isReply && showReplies && repliesCount > 0 && (
              <div className="mt-1 ml-3 border-l-2 border-line-soft pl-3">
                <CommentReplies postId={postId} commentId={comment._id} />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
