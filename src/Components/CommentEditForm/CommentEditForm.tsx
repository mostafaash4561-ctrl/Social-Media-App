import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useId, useState } from "react";
import { ImSpinner8 } from "react-icons/im";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { API_URL, authConfig } from "../../Logic/suggestions";
import type { Comment as CommentType } from "../../Types/Post.type";

const MySwal = withReactContent(Swal);

export default function CommentEditForm({
  comment,
  postId,
  onDone,
}: {
  comment: CommentType;
  postId: string;
  onDone: () => void;
}) {
  const textId = useId();
  const query = useQueryClient();
  const [text, setText] = useState(comment.content ?? "");

  const { mutate, isPending } = useMutation({
    mutationFn: (content: string) =>
      axios.put(
        `${API_URL}/posts/${postId}/comments/${comment._id}`,
        { content },
        authConfig(),
      ),
    onSuccess: async () => {
      MySwal.fire({
        title: "Comment updated successfully",
        icon: "success",
        draggable: true,
      });
      await Promise.all([
        query.invalidateQueries({ queryKey: ["getAllPosts"] }),
        query.invalidateQueries({ queryKey: ["getPostComments"] }),
        query.invalidateQueries({ queryKey: ["getPostDetails"] }),
        query.invalidateQueries({ queryKey: ["getCommentReplies"] }),
      ]);
      onDone();
    },
    onError: (err) => {
      MySwal.fire({ icon: "error", title: "Error", text: getErrorMessage(err) });
    },
  });

  function handleSave() {
    const content = text.trim();

    if (content === (comment.content ?? "").trim()) {
      onDone();
      return;
    }
    if (!content && !comment.image) {
      MySwal.fire({
        icon: "warning",
        title: "A comment can't be empty",
      });
      return;
    }
    mutate(content);
  }

  return (
    <div className="mt-1 ml-2 flex flex-col gap-2">
      <label htmlFor={textId} className="sr-only">
        Edit comment
      </label>
      <textarea
        id={textId}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        autoFocus
        className="w-full resize-none rounded-xl border border-line-soft bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          disabled={isPending}
          className="h-8 cursor-pointer rounded-full px-3 text-xs font-semibold text-muted transition hover:bg-brand-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex h-8 min-w-16 cursor-pointer items-center justify-center rounded-full bg-brand-600 px-3 text-xs font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:bg-brand-400"
        >
          {isPending ? <ImSpinner8 className="animate-spin" /> : "Save"}
        </button>
      </div>
    </div>
  );
}
