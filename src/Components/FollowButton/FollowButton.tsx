import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext, useState } from "react";
import { FiUserCheck, FiUserPlus } from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { AuthContext } from "../../Context/AuthContext/AuthContext";
import useMyProfile from "../../Hooks/useMyProfile";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { API_URL, authConfig } from "../../Logic/suggestions";
import type { PublicUser } from "../../Types/userProfile";

const MySwal = withReactContent(Swal);

export default function FollowButton({
  user,
  className = "",
}: {
  user: PublicUser;
  className?: string;
}) {
  const { userId: myId } = useContext(AuthContext);
  const { data: me } = useMyProfile();
  const query = useQueryClient();

  const serverFollowing =
    me?.following?.includes(user._id) ??
    user.followers?.includes(myId) ??
    false;

  const [override, setOverride] = useState<boolean | null>(null);
  const following = override ?? serverFollowing;

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axios.put(`${API_URL}/users/${user._id}/follow`, null, authConfig()),
    onSuccess: async () => {
      setOverride(!following);
      MySwal.fire({
        title: following
          ? `You unfollowed ${user.name}`
          : `You're now following ${user.name}`,
        icon: "success",
        draggable: true,
      });
      await Promise.all([
        query.invalidateQueries({ queryKey: ["getMyProfile"] }),
        query.invalidateQueries({ queryKey: ["getUserProfile", user._id] }),
        // the Feed only shows the people you follow
        query.invalidateQueries({ queryKey: ["getAllPosts"] }),
      ]);
      setOverride(null);
    },
    onError: (err) => {
      MySwal.fire({ icon: "error", title: "Error", text: getErrorMessage(err) });
    },
  });

  return (
    <button
      type="button"
      onClick={() => mutate()}
      disabled={isPending}
      aria-pressed={following}
      className={`flex h-10 min-w-32 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-70 ${
        following
          ? "border border-line bg-white text-ink-soft hover:bg-brand-50"
          : "bg-brand-600 text-white hover:bg-brand-700"
      } ${className}`}
    >
      {isPending ? (
        <ImSpinner8 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <FiUserCheck className="h-4.5 w-4.5" />
      ) : (
        <FiUserPlus className="h-4.5 w-4.5" />
      )}
      {following ? "Following" : "Follow"}
    </button>
  );
}
