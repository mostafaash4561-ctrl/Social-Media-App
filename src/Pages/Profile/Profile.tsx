import { Helmet } from "react-helmet";
import Loader from "../../Components/Loader/Loader";
import ProfileCard from "../../Components/ProfileCard/ProfileCard";
import ProfilePosts from "../../Components/ProfilePosts/ProfilePosts";
import useMyProfile from "../../Hooks/useMyProfile";
import { getErrorMessage } from "../../Logic/getErrorMessage";

export default function Profile() {
  const { data: user, isLoading, isError, error, refetch } = useMyProfile();

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !user) {
    return (
      <div
        role="alert"
        className="mx-auto my-5 flex w-full max-w-4xl flex-col items-center gap-3 rounded-3xl border border-line-soft bg-white p-8 text-center font-sans shadow-sm"
      >
        <p className="text-sm text-red-700">
          {isError ? getErrorMessage(error) : "Profile not found."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="cursor-pointer rounded-full border border-line-soft px-5 py-2 text-sm font-semibold text-ink-soft transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <ProfileCard user={user} />
      <ProfilePosts />
    </>
  );
}
