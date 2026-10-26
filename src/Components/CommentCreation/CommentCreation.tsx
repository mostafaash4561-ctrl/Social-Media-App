import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { FiImage, FiSend } from "react-icons/fi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ImSpinner8 } from "react-icons/im";
import useImagePicker from "../../Hooks/useImagePicker";
import ImagePreview from "../ImagePreview/ImagePreview";
import { getErrorMessage } from "../../Logic/getErrorMessage";

const MySwal = withReactContent(Swal);
export default function CommentCreation({
  postId,
  queryKey,
}: {
  postId: string;
  queryKey: string[];
}) {
  const form = useForm({
    defaultValues: {
      content: "",
    },
  });

  const query = useQueryClient();

  const { handleSubmit, register, reset } = form;

  const uid = useId();
  const textId = `${uid}-comment`;
  const imageId = `${uid}-image`;

  const { image, inputRef, onChange, clear } = useImagePicker();

  function createComment(formData: FormData) {
    return axios.post(
      `https://route-posts.routemisr.com/posts/${postId}/comments`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      },
    );
  }

  const { isPending, mutate } = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      MySwal.fire({
        title: "Comment created Successfully",
        icon: "success",
        draggable: true,
      });
      query.invalidateQueries({
        queryKey: queryKey,
      });
      query.invalidateQueries({ queryKey: ["getAllPosts"] });
      query.invalidateQueries({ queryKey: ["getPostDetails"] });
      reset();
      clear();
    },
    onError: (err) => {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err),
      });
    },
  });

  function handleCreateComment(values: { content: string }) {
    if (!values.content.trim() && !image) return;

    const formData = new FormData();
    if (values.content.trim()) {
      formData.append("content", values.content);
    }
    if (image) {
      formData.append("image", image.file);
    }

    mutate(formData);
  }

  return (
    <section
      aria-label="Write a comment"
      className="flex items-start gap-3 border-t border-line-soft bg-canvas px-5 py-4 font-sans text-ink"
    >
      {/* Input box */}
      <form
        onSubmit={handleSubmit(handleCreateComment)}
        className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-line-soft bg-white px-4 py-2.5 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100"
      >
        <label htmlFor={textId} className="sr-only">
          Write a comment
        </label>
        <textarea
          {...register("content")}
          id={textId}
          rows={2}
          placeholder="Write a comment..."
          className="peer w-full resize-none bg-transparent text-sm leading-relaxed outline-none rounded-2xl border border-line-soft placeholder:text-subtle"
        />

        {/* Selected image preview */}
        {image && (
          <div className="w-full py-1 flex items-center justify-center">
            <ImagePreview src={image.url} onRemove={clear} />
          </div>
        )}

        {/* Tools */}

        <label
          htmlFor={imageId}
          aria-label="Add photo"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          <FiImage className="h-5 w-5" />
          <input
            ref={inputRef}
            type="file"
            id={imageId}
            accept="image/*"
            onChange={onChange}
            hidden
          />
        </label>

        {/* Send: grey while empty, blue once there is text */}
        <button
          disabled={isPending}
          type="submit"
          className="ml-auto disabled:bg-brand-300 flex h-9 items-center gap-2 cursor-pointer rounded-full bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <ImSpinner8 className="animate-spin" />
            </>
          ) : (
            <>
              {" "}
              Send
              <FiSend className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </section>
  );
}
