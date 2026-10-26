import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useId } from "react";
import type { IconType } from "react-icons";
import {
  FiAward,
  FiBookmark,
  FiCamera,
  FiMail,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { DEFAULT_AVATAR } from "../../Logic/defaults";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { API_URL, authConfig } from "../../Logic/suggestions";
import type { PublicUser } from "../../Types/userProfile";
import FollowButton from "../FollowButton/FollowButton";
import ViewableImage from "../ImageLightbox/ViewableImage";

const MySwal = withReactContent(Swal);

type UploadKind = "photo" | "cover";


const UPLOADS: Record<
  UploadKind,
  { path: string; field: string; success: string }
> = {
  photo: {
    path: "/users/upload-photo",
    field: "photo",
    success: "Profile photo updated",
  },
  cover: {
    path: "/users/upload-cover",
    field: "cover",
    success: "Cover photo updated",
  },
};

function useUploadImage(kind: UploadKind) {
  const query = useQueryClient();
  const { path, field, success } = UPLOADS[kind];

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append(field, file);
      return axios.put(`${API_URL}${path}`, formData, authConfig());
    },
    onSuccess: async () => {
      MySwal.fire({ title: success, icon: "success", draggable: true });
      await Promise.all([
        query.invalidateQueries({ queryKey: ["getMyProfile"] }),
        query.invalidateQueries({ queryKey: ["getAllPosts"] }),
      ]);
    },
    onError: (err) => {
      MySwal.fire({ icon: "error", title: "Error", text: getErrorMessage(err) });
    },
  });
}

function CameraButton({
  label,
  pending,
  onPick,
  className = "",
}: {
  label: string;
  pending: boolean;
  onPick: (file: File) => void;
  className?: string;
}) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      title={label}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-ink-soft shadow-md transition hover:bg-brand-50 focus-within:ring-4 focus-within:ring-brand-300 ${
        pending ? "pointer-events-none" : ""
      } ${className}`}
    >
      {pending ? (
        <ImSpinner8 className="h-4 w-4 animate-spin" />
      ) : (
        <FiCamera className="h-5 w-5" />
      )}
      <span className="sr-only">{label}</span>
      <input
        id={id}
        type="file"
        accept="image/*"
        disabled={pending}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: IconType;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line-soft bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="font-display text-2xl font-bold leading-tight">
          {value}
        </span>
        <span className="truncate text-sm text-muted">{label}</span>
      </div>
    </div>
  );
}


export default function ProfileCard({
  user,
  readOnly = false,
}: {
  user: PublicUser;
  readOnly?: boolean;
}) {
  const uploadPhoto = useUploadImage("photo");
  const uploadCover = useUploadImage("cover");

  const stats = [
    {
      icon: FiUsers,
      label: "Followers",
      value: user.followersCount,
      tone: "bg-brand-50 text-brand-600",
    },
    {
      icon: FiUserCheck,
      label: "Following",
      value: user.followingCount,
      tone: "bg-brand-50 text-brand-600",
    },
    {
      icon: FiBookmark,
      label: "Bookmarks",
      value: user.bookmarksCount,
      tone: "bg-amber-50 text-amber-600",
    },
  ].filter(
    (stat) =>
      typeof stat.value === "number" &&
      (!readOnly || stat.label !== "Bookmarks"),
  );

  return (
    <section
      aria-label="Profile"
      className="mx-auto my-5 flex w-full max-w-4xl flex-col gap-4 px-4 font-sans text-ink sm:px-0"
    >
      {/* Header card: cover + photo + name */}
      <div className="overflow-hidden rounded-3xl border border-line-soft bg-white shadow-sm">
        {/* Cover image: click to view, camera to change */}
        <div className="relative">
          {user.cover ? (
            <ViewableImage
              src={user.cover}
              alt="Cover photo"
              className="h-40 w-full cursor-pointer object-cover sm:h-56"
            />
          ) : (
            <div
              role="img"
              aria-label="No cover photo"
              className="h-40 w-full bg-linear-to-br from-brand-500 via-brand-600 to-brand-900 sm:h-56"
            />
          )}
          {!readOnly && (
            <CameraButton
              label={user.cover ? "Change cover photo" : "Add cover photo"}
              pending={uploadCover.isPending}
              onPick={(file) => uploadCover.mutate(file)}
              className="absolute top-3 right-3"
            />
          )}
        </div>

        <div className="flex flex-col items-center gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:gap-6 sm:px-8">
          {/* Profile photo overlapping the cover */}
          <div className="relative -mt-16 shrink-0 sm:-mt-20">
            <ViewableImage
              src={user.photo || DEFAULT_AVATAR}
              alt="Profile photo"
              className="h-32 w-32 cursor-pointer rounded-full border-4 border-white bg-brand-900 object-cover shadow-md sm:h-36 sm:w-36"
            />
            {!readOnly && (
              <CameraButton
                label="Change profile photo"
                pending={uploadPhoto.isPending}
                onPick={(file) => uploadPhoto.mutate(file)}
                className="absolute right-1 bottom-1 border border-line-soft"
              />
            )}
          </div>

          <div className="flex min-w-0 flex-col items-center gap-1 text-center sm:mt-6 sm:items-start sm:pb-2 sm:text-left">
            <h1 className="max-w-full truncate font-display text-2xl font-bold sm:text-3xl">
              {user.name}
            </h1>
            {user.username && (
              <span className="text-[15px] text-muted">{user.username}</span>
            )}
          </div>

          {readOnly && (
            <FollowButton user={user} className="sm:mb-2 sm:ml-auto" />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Left column: Route member + About */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-2xl bg-linear-to-br from-brand-600 to-brand-900 p-5 text-white shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <FiAward className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-bold">
              Route member
            </span>
          </div>

          {user.email && (
            <div className="flex flex-col gap-4 rounded-2xl border border-line-soft bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold">About</h2>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
                  <FiMail className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs text-muted">Email</span>
                  <span className="truncate text-sm font-semibold">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: numbers */}
        {stats.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3 md:col-span-2 md:content-start">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value as number}
                tone={stat.tone}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
