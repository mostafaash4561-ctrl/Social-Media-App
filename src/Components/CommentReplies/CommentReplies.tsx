import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { FiSend } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import type { Comment as CommentType } from "../../Types/Post.type";
import Comment from "../Comment/Comment";

const MySwal = withReactContent(Swal);
const API = "https://route-posts.routemisr.com";

export function ReplyForm({
  postId,
  commentId,
  onDone,
  onCancel,
}: {
  postId: string;
  commentId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const query = useQueryClient();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { content: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormData) =>
      axios.post(
        `${API}/posts/${postId}/comments/${commentId}/replies`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      ),
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ["getCommentReplies"] });
      query.invalidateQueries({ queryKey: ["getPostComments"] });
      query.invalidateQueries({ queryKey: ["getAllPosts"] });
      query.invalidateQueries({ queryKey: ["getPostDetails"] });
      reset();
      onDone();
    },
    onError: (err) => {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err),
      });
    },
  });

  function submit(values: { content: string }) {
    if (!values.content.trim()) return;
    const formData = new FormData();
    formData.append("content", values.content);
    mutate(formData);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="animate-fade-up flex flex-col gap-2 rounded-2xl border border-line-soft bg-white p-3 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100"
    >
      <label className="sr-only" htmlFor={`reply-${commentId}`}>
        Write a reply
      </label>
      <textarea
        {...register("content")}
        id={`reply-${commentId}`}
        rows={2}
        autoFocus
        placeholder="Write a reply..."
        className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-subtle"
      />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 rounded-full px-3 text-xs font-semibold text-muted hover:bg-surface focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex h-8 min-w-18 items-center justify-center gap-1.5 rounded-full bg-brand-600 px-3.5 text-xs font-semibold text-white hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:bg-brand-300"
        >
          {isPending ? (
            <ImSpinner8 className="animate-spin" />
          ) : (
            <>
              Reply
              <FiSend className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}


export function useCommentReplies(
  postId: string,
  commentId: string,
  enabled = true,
) {
  const result = useQuery({
    queryKey: ["getCommentReplies", postId, commentId],
    enabled,
    queryFn: () =>
      axios.get(`${API}/posts/${postId}/comments/${commentId}/replies`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }),
  });

  const payload = result.data?.data?.data;
  const replies: CommentType[] = payload?.replies ?? payload?.comments ?? [];
  return { ...result, replies };
}

export default function CommentReplies({
  postId,
  commentId,
}: {
  postId: string;
  commentId: string;
}) {
  const { replies, isLoading, isError } = useCommentReplies(postId, commentId);

  if (isLoading) {
    return <p className="py-2 text-xs text-muted">Loading replies...</p>;
  }
  if (isError) {
    return <p className="py-2 text-xs text-red-600">Could not load replies.</p>;
  }
  if (replies.length === 0) {
    return <p className="py-2 text-xs text-muted">No replies yet</p>;
  }

  return (
    <div className="animate-fade-up flex flex-col">
      {replies.map((reply) => (
        <Comment
          key={reply._id}
          comment={reply}
          postId={postId}
          isReply
          parentId={commentId}
        />
      ))}
    </div>
  );
}
