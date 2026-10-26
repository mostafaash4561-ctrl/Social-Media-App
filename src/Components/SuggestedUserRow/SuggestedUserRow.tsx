import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { ImSpinner8 } from "react-icons/im";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { API_URL, authConfig } from "../../Logic/suggestions";
import type { SuggestedUser } from "../../Types/User.type";
import UserLink from "../UserLink/UserLink";

const MySwal = withReactContent(Swal);
const compact = new Intl.NumberFormat("en", { notation: "compact" });

function Avatar({ user }: { user: SuggestedUser }) {
  const [failed, setFailed] = useState(false);

  if (!user.photo || failed) {
    return (
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-white"
      >
        {user.name?.charAt(0).toUpperCase() || "?"}
      </span>
    );
  }
  return (
    <img
      src={user.photo}
      alt=""
      onError={() => setFailed(true)}
      className="h-10 w-10 shrink-0 rounded-full bg-brand-900 object-cover"
    />
  );
}

export default function SuggestedUserRow({
  user,
  showUsername = false,
}: {
  user: SuggestedUser;
  showUsername?: boolean;
}) {
  const [following, setFollowing] = useState(false);
  const query = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axios.put(`${API_URL}/users/${user._id}/follow`, null, authConfig()),
    onSuccess: () => {
      setFollowing((prev) => !prev);
      MySwal.fire({
        title: following
          ? `You unfollowed ${user.name}`
          : `You're now following ${user.name}`,
        icon: "success",
        draggable: true,
      });
      query.invalidateQueries({ queryKey: ["getAllPosts"] });
    },
    onError: (err) => {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err),
      });
    },
  });

  const followers =
    user.followersCount === undefined
      ? undefined
      : user.followersCount + (following ? 1 : 0);

  return (
    <div className="flex items-center gap-3">
      <UserLink user={user} label={`${user.name}'s profile`} className="shrink-0">
        <Avatar user={user} />
      </UserLink>

      <div className="flex min-w-0 flex-1 flex-col">
        <UserLink
          user={user}
          className="block w-fit max-w-full truncate text-sm font-semibold hover:underline"
        >
          {user.name}
        </UserLink>
        {showUsername && user.username && (
          <span className="truncate text-xs text-muted">
            @{user.username}
          </span>
        )}
        {followers !== undefined && (
          <span className="truncate text-xs text-muted">
            {compact.format(followers)}{" "}
            {followers === 1 ? "follower" : "followers"}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => mutate()}
        disabled={isPending}
        aria-pressed={following}
        aria-label={`${following ? "Unfollow" : "Follow"} ${user.name}`}
        className={`flex h-8 min-w-21 shrink-0 cursor-pointer items-center justify-center rounded-full px-3.5 text-[13px] font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed ${
          following
            ? "border border-line bg-white text-ink-soft hover:bg-brand-50"
            : "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-400"
        }`}
      >
        {isPending ? (
          <ImSpinner8 className="h-3.5 w-3.5 animate-spin" />
        ) : following ? (
          "Following"
        ) : (
          "Follow"
        )}
      </button>
    </div>
  );
}
