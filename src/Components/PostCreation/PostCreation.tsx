import { useId } from "react";
import { FiImage, FiSend } from "react-icons/fi";
import useImagePicker from "../../Hooks/useImagePicker";
import ImagePreview from "../ImagePreview/ImagePreview";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import axios from "axios";
import { ImSpinner8 } from "react-icons/im";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { DEFAULT_AVATAR } from "../../Logic/defaults";
import useMyProfile from "../../Hooks/useMyProfile";
import UserLink from "../UserLink/UserLink";

export default function PostCreation() {
  const MySwal = withReactContent(Swal);
  const uid = useId();
  const imageId = `${uid}-post-image`;
  const { image, inputRef, onChange, clear } = useImagePicker();
  const { data: profile } = useMyProfile();

  function createPost(formData: FormData) {
    return axios.post(`https://route-posts.routemisr.com/posts`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    });
  }

  const query = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      MySwal.fire({
        title: "Post created Successfully",
        icon: "success",
        draggable: true,
      });
      query.invalidateQueries({
        queryKey: ["getAllPosts"],
      });
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

  const form = useForm({
    defaultValues: {
      body: "",
    },
  });

  const { handleSubmit, register, reset } = form;

  function handleCreatePost(values: { body: string }) {
    if (!values.body.trim() && !image) return;

    const formData = new FormData();

    if (values.body.trim()) {
      formData.append("body", values.body);
    }
    if (image) {
      formData.append("image", image.file);
    }
    mutate(formData);
  }

  return (
    <>
      <section
        aria-label="Create post"
        className="mx-auto my-5 w-full max-w-4xl py-3 overflow-hidden rounded-3xl border border-line-soft bg-white font-sans text-ink shadow-sm"
      >
        <form onSubmit={handleSubmit(handleCreatePost)}>
          {/* Header: who is posting + privacy */}
          <header className="flex items-center gap-3 p-5 pb-3">
            <UserLink user={profile} label="Your profile" className="shrink-0">
              <img
                src={profile?.photo || DEFAULT_AVATAR}
                alt={profile?.name ? `${profile.name}'s photo` : "Your photo"}
                onError={(e) => {
                  if (e.currentTarget.src !== DEFAULT_AVATAR) {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }
                }}
                className="h-12 w-12 rounded-full bg-brand-900 object-cover"
              />
            </UserLink>
            <div className="flex min-w-0 flex-1 flex-col">
              <UserLink
                user={profile}
                className="block w-fit max-w-full truncate text-[15px] font-semibold hover:underline"
              >
                {profile?.name ?? "You"}
              </UserLink>
              {profile?.username && (
                <span className="truncate text-[13px] text-muted">
                  {profile.username}
                </span>
              )}

              {/* Privacy */}
            </div>
          </header>

          {/* Text */}
          <div className="px-5">
            <label htmlFor="post-body" className="sr-only">
              What is on your mind?
            </label>
            <textarea
              {...register("body")}
              id="post-body"
              rows={4}
              placeholder="What's on your mind?"
              className="peer w-full resize-none rounded-2xl border-line-soft  bg-transparent  py-2 px-4 text-[17px] leading-relaxed outline-none placeholder:text-subtle"
            />

            {/* Selected image preview */}
            {image && (
              <div className="mt-2 flex items-center justify-center">
                <ImagePreview src={image.url} onRemove={clear} />
              </div>
            )}

            {/* Tools */}
            <div className="mt-2 flex items-center justify-between ">
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
                    Post
                    <FiSend className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </>
  );
}
