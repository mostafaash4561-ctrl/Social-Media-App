import { useContext, useEffect, useRef, useState } from "react";
import { FaBookmark, FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import {
  FiBookmark,
  FiEdit2,
  FiMoreHorizontal,
  FiShare2,
  FiTrash2,
} from "react-icons/fi";
import { formatDate } from "../../Logic/formateDate";
import type { PostType } from "../../Types/Post.type";
import Comment from "../Comment/Comment";
import { Link, useNavigate } from "react-router-dom";
import PostComments from "../PostComments/PostComments";
import CommentCreation from "../CommentCreation/CommentCreation";
import ViewableImage from "../ImageLightbox/ViewableImage";
import PostEditForm from "../PostEditForm/PostEditForm";
import SharedPostPreview from "../SharedPostPreview/SharedPostPreview";
import LikesModal from "../LikesModal/LikesModal";
import UserLink from "../UserLink/UserLink";
import { AuthContext } from "./../../Context/AuthContext/AuthContext";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { getErrorMessage } from "../../Logic/getErrorMessage";

const itemCls =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200";

const actionCls =
  "flex flex-1 items-center justify-center cursor-pointer gap-2 rounded-xl py-2.5 text-sm font-semibold transition duration-200 hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200";
export default function Post({
  post,
  isPostDetails,
}: {
  post: PostType;
  isPostDetails: boolean;
}) {
  const MySwal = withReactContent(Swal);

  const {
    body,
    image,
    user,
    createdAt,
    commentsCount,
    sharesCount,
    likesCount,
    topComment,
    bookmarked,
    likes,
    isShare,
    sharedPost,
    _id,
  } = post;
  const { name, photo, username, _id: userId } = user;
  const { userId: loginUserId } = useContext(AuthContext);
  const [likeOverride, setLikeOverride] = useState<boolean | null>(null);
  const liked = likeOverride ?? likes.includes(loginUserId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [likesOpen, setLikesOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
  const query = useQueryClient();
  const navigate = useNavigate();

  const API = "https://route-posts.routemisr.com/posts";

  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });

  function refreshPosts() {
    return Promise.all([
      query.invalidateQueries({ queryKey: ["getAllPosts"] }),
      query.invalidateQueries({ queryKey: ["getPostDetails", _id] }),
    ]);
  }

  function showError(err: unknown) {
    MySwal.fire({ icon: "error", title: "Error", text: getErrorMessage(err) });
  }

  const { mutate } = useMutation({
    mutationFn: () => axios.delete(`${API}/${_id}`, authConfig()),
    onSuccess: () => {
      MySwal.fire({
        title: "Post deleted successfully",
        icon: "success",
        draggable: true,
      });
      if (isPostDetails) navigate("/home");
      query.invalidateQueries({ queryKey: ["getAllPosts"] });
    },
    onError: showError,
  });

  const { mutate: mutateSavePost } = useMutation({
    mutationFn: () => axios.put(`${API}/${_id}/bookmark`, null, authConfig()),
    onSuccess: () => {
      MySwal.fire({
        title: bookmarked
          ? "Removed from saved posts"
          : "Post saved successfully",
        icon: "success",
        draggable: true,
      });
      return refreshPosts();
    },
    onError: showError,
  });

  const { mutate: mutateShare } = useMutation({
    mutationFn: () => axios.post(`${API}/${_id}/share`, {}, authConfig()),
    onSuccess: () => {
      MySwal.fire({
        title: "Post shared successfully",
        icon: "success",
        draggable: true,
      });
      return refreshPosts();
    },
    onError: showError,
  });

  const { mutate: mutateLike } = useMutation({
    mutationFn: () => axios.put(`${API}/${_id}/like`, null, authConfig()),
    onMutate: () => setLikeOverride(!liked),
    onSuccess: () => refreshPosts(),
    onError: showError,
    onSettled: () => setLikeOverride(null),
  });

  return (
    <article className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-line-soft bg-white font-sans text-ink shadow-sm my-5 transition-shadow duration-300 hover:shadow-md">
      {/* Header */}
      <header className="flex items-center gap-3 p-5 pb-3 ">
        <UserLink user={user} label={`${name}'s profile`} className="shrink-0">
          <img
            src={photo}
            alt="user image"
            className="h-12 w-12 rounded-full bg-brand-900 object-cover"
          />
        </UserLink>

        <div className="flex min-w-0 flex-1 flex-col">
          <UserLink
            user={user}
            className="block w-fit max-w-full truncate text-[15px] font-semibold hover:underline"
          >
            {name}
          </UserLink>
          <div className="truncate text-[13px] text-muted">
            <div className="flex gap-2.5">
              <div>{username} </div>

              <div>{formatDate(createdAt)}</div>
              {isShare && <div>· shared a post</div>}
            </div>
          </div>
        </div>
        {bookmarked && (
          <span
            title="Saved"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"
          >
            <FaBookmark className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Saved</span>
          </span>
        )}
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
              {loginUserId !== userId ? (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => run(mutateSavePost)}
                    className={`${itemCls} text-ink-soft hover:bg-brand-50`}
                  >
                    {bookmarked ? (
                      <FaBookmark className="h-4.5 w-4.5 text-brand-600" />
                    ) : (
                      <FiBookmark className="h-4.5 w-4.5" />
                    )}
                    {bookmarked ? "Unsave post" : "Save post"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => run(mutateSavePost)}
                    className={`${itemCls} text-ink-soft hover:bg-brand-50`}
                  >
                    {bookmarked ? (
                      <FaBookmark className="h-4.5 w-4.5 text-brand-600" />
                    ) : (
                      <FiBookmark className="h-4.5 w-4.5" />
                    )}
                    {bookmarked ? "Unsave Post" : "Save Post"}
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => run(() => setEditing(true))}
                    className={`${itemCls} text-ink-soft hover:bg-brand-50`}
                  >
                    <FiEdit2 className="h-4.5 w-4.5" />
                    Edit Post
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
                    Delete Post
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content (or the editor) */}
      {editing ? (
        <PostEditForm post={post} onDone={() => setEditing(false)} />
      ) : (
        <>
          {body && (
            <p className="px-5 pb-4 text-[15px] leading-relaxed wrap-break-word">
              {body}
            </p>
          )}
          {image && (
            <ViewableImage
              src={image}
              alt="post image"
              className=" w-full cursor-pointer"
            />
          )}
        </>
      )}

      {/* The original post, when this post is a share of it */}
      {isShare && <SharedPostPreview sharedPost={sharedPost} />}

      {/* Counts */}
      <div className="flex items-center justify-between px-5 pt-4 text-[13px] text-muted">
        <span className="flex items-center gap-1.5">
          {likesCount > 0 && (
            <button
              type="button"
              onClick={() => setLikesOpen(true)}
              aria-label={`See who liked this post (${likesCount})`}
              className="flex cursor-pointer items-center gap-1.5 rounded-full py-0.5 pr-2 transition hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
                <FaHeart className="h-2.5 w-2.5" />
              </span>
              {likesCount}
            </button>
          )}
          {likesOpen && (
            <LikesModal postId={_id} onClose={() => setLikesOpen(false)} />
          )}
        </span>
        <span>
          {commentsCount} comments · {sharesCount} shares
        </span>
      </div>

      {/* Actions */}
      <div className="mx-5 mt-3 flex gap-1 border-t border-line-soft py-2">
        <button
          type="button"
          onClick={() => mutateLike()}
          aria-pressed={liked}
          className={`${actionCls} ${
            liked ? "text-red-500 hover:bg-red-50" : "text-muted hover:bg-red-50 hover:text-red-500"
          }`}
        >
          {liked ? (
            <FaHeart className="h-5 w-5 text-red-500" />
          ) : (
            <FaRegHeart className="h-5 w-5" />
          )}
          Like
        </button>
        <Link to={`/postdetails/${_id}`}>
          <button
            type="button"
            className={`${actionCls} text-muted  hover:text-brand-700`}
          >
            <FaRegComment className="h-5 w-5" />
            Comment
          </button>
        </Link>
        <button
          type="button"
          onClick={() => mutateShare()}
          className={`${actionCls} text-muted  hover:text-brand-700 duration-200 `}
        >
          <FiShare2 className="h-5 w-5" />
          Share
        </button>
      </div>

      {/* Comment box */}

      {!isPostDetails && commentsCount > 0 && (
        <div className="flex flex-col gap-3 px-5 pb-4 font-sans text-ink mt-1.5">
          <div className="flex items-center justify-between">
            {topComment && (
              <span className="text-xs font-semibold tracking-wide text-yellow-600">
                Top comment
              </span>
            )}
            <Link to={`/postdetails/${_id}`} className="ml-auto">
              <button
                type="button"
                className="text-[13px] font-semibold text-brand-600 transition hover:text-brand-800 hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              >
                View all comments
              </button>
            </Link>
          </div>
        </div>
      )}

      {isPostDetails ? (
        <PostComments postId={_id} />
      ) : (
        topComment && <Comment postId={_id} comment={topComment} />
      )}
      <CommentCreation
        postId={_id}
        queryKey={isPostDetails ? ["getPostComments"] : ["getAllPosts"]}
      />
    </article>
  );
}
