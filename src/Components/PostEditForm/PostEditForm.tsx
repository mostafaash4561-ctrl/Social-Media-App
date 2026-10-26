import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useId, useState } from "react";
import { FiImage } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import useImagePicker from "../../Hooks/useImagePicker";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { API_URL, authConfig } from "../../Logic/suggestions";
import type { PostType } from "../../Types/Post.type";
import ImagePreview from "../ImagePreview/ImagePreview";

const MySwal = withReactContent(Swal);

export default function PostEditForm({
  post,
  onDone,
}: {
  post: PostType;
  onDone: () => void;
}) {
  const uid = useId();
  const bodyId = `${uid}-edit-body`;
  const imageId = `${uid}-edit-image`;

  const query = useQueryClient();
  const [text, setText] = useState(post.body ?? "");
  const [removeCurrent, setRemoveCurrent] = useState(false);
  const { image: newImage, inputRef, onChange, clear } = useImagePicker();

  const canEditImage = !post.isShare;
  const currentImage = canEditImage && !removeCurrent ? post.image : undefined;
  const previewSrc = newImage?.url ?? currentImage;

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormData) =>
      axios.put(`${API_URL}/posts/${post._id}`, formData, authConfig()),
    onSuccess: async () => {
      MySwal.fire({
        title: "Post updated successfully",
        icon: "success",
        draggable: true,
      });
      await Promise.all([
        query.invalidateQueries({ queryKey: ["getAllPosts"] }),
        query.invalidateQueries({ queryKey: ["getPostDetails", post._id] }),
      ]);
      onDone();
    },
    onError: (err) => {
      MySwal.fire({ icon: "error", title: "Error", text: getErrorMessage(err) });
    },
  });

  function handleSave() {
    const body = text.trim();
    const bodyChanged = body !== (post.body ?? "").trim();
    const imageRemoved = removeCurrent && Boolean(post.image);

    if (!bodyChanged && !newImage && !imageRemoved) {
      onDone();
      return;
    }

    if (!body && !previewSrc) {
      MySwal.fire({
        icon: "warning",
        title: "A post can't be empty",
        text: "Write something or keep a photo.",
      });
      return;
    }

    const formData = new FormData();
    if (bodyChanged) formData.append("body", body);
    if (newImage) {
      formData.append("image", newImage.file);
    } else if (imageRemoved) {
      formData.append("removeImage", "true");
    }
    mutate(formData);
  }

  return (
    <div className="px-5 pb-4">
      <label htmlFor={bodyId} className="sr-only">
        Edit post
      </label>
      <textarea
        id={bodyId}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="What's on your mind?"
        className="w-full resize-none rounded-2xl border border-line-soft px-4 py-2 text-[15px] leading-relaxed outline-none placeholder:text-subtle focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      />

      {previewSrc && (
        <div className="mt-2 flex items-center justify-center">
          <ImagePreview
            src={previewSrc}
            onRemove={() => (newImage ? clear() : setRemoveCurrent(true))}
          />
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        {canEditImage && (
          <label
            htmlFor={imageId}
            aria-label={previewSrc ? "Change photo" : "Add photo"}
            title={previewSrc ? "Change photo" : "Add photo"}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition focus-within:ring-4 focus-within:ring-brand-200 hover:bg-brand-50 hover:text-brand-700"
          >
            <FiImage className="h-5 w-5" />
            <input
              ref={inputRef}
              type="file"
              id={imageId}
              accept="image/*"
              onChange={onChange}
              className="sr-only"
            />
          </label>
        )}

        <button
          type="button"
          onClick={onDone}
          disabled={isPending}
          className="ml-auto h-9 cursor-pointer rounded-full px-4 text-sm font-semibold text-muted transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex h-9 min-w-20 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:bg-brand-400"
        >
          {isPending ? <ImSpinner8 className="animate-spin" /> : "Save"}
        </button>
      </div>
    </div>
  );
}
