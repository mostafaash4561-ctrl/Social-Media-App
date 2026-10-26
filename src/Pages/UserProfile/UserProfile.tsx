import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";
import { Helmet } from "react-helmet";
import { Navigate, useLocation, useParams } from "react-router-dom";
import BackToHome from "../../Components/BackToHome/BackToHome";
import Loader from "../../Components/Loader/Loader";
import Post from "../../Components/Post/Post";
import ProfileCard from "../../Components/ProfileCard/ProfileCard";
import { AuthContext } from "../../Context/AuthContext/AuthContext";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import { extractPosts } from "../../Logic/posts";
import { API_URL, authConfig } from "../../Logic/suggestions";
import type { PostType } from "../../Types/Post.type";
import type { PublicUser } from "../../Types/userProfile";

const PAGE_SIZE = 40;
const SCAN_PAGES = 5;


function isMissing(err: unknown) {
  return (
    axios.isAxiosError(err) &&
    err.response !== undefined &&
    err.response.status !== 401 &&
    err.response.status < 500
  );
}

async function fetchPublicProfile(id: string): Promise<PublicUser | null> {
  try {
    const res = await axios.get(`${API_URL}/users/${id}/profile`, authConfig());
    const data = res.data?.data;
    const user = data?.user ?? data;
    return user?._id ? (user as PublicUser) : null;
  } catch (err) {
    if (isMissing(err)) return null;
    throw err;
  }
}


async function fetchUserPosts(
  id: string,
): Promise<{ posts: PostType[]; partial: boolean }> {
  try {
    const res = await axios.get(`${API_URL}/users/${id}/posts`, {
      params: { limit: PAGE_SIZE },
      ...authConfig(),
    });
    return { posts: extractPosts(res), partial: false };
  } catch (err) {
    if (!isMissing(err)) throw err;
  }

  const found: PostType[] = [];
  for (let page = 1; page <= SCAN_PAGES; page++) {
    const res = await axios.get(`${API_URL}/posts`, {
      params: { page, limit: PAGE_SIZE },
      ...authConfig(),
    });
    const list = extractPosts(res);
    found.push(...list.filter((p) => p.user?._id === id));
    if (list.length < PAGE_SIZE) break;
  }
  return { posts: found, partial: true };
}

type RouteState = { user?: PublicUser } | null;

export default function UserProfile() {
  const { id = "" } = useParams();
  const location = useLocation();
  const { userId: myId } = useContext(AuthContext);
  const isMe = id === myId;
  const hint = (location.state as RouteState)?.user;

  const profile = useQuery({
    queryKey: ["getUserProfile", id],
    queryFn: () => fetchPublicProfile(id),
    enabled: Boolean(id) && !isMe,
  });

  const posts = useQuery({
    queryKey: ["getAllPosts", "user", id],
    queryFn: () => fetchUserPosts(id),
    enabled: Boolean(id) && !isMe,
  });

  if (isMe) {
    return <Navigate to="/profile" replace />;
  }

  const user: PublicUser | undefined =
    profile.data ?? hint ?? posts.data?.posts[0]?.user;

  if (!user) {
    if (profile.isLoading || posts.isLoading) {
      return (
        <>
          <BackToHome />
          <Loader />
        </>
      );
    }
    return (
      <>
        <BackToHome />
        <div
          role="alert"
          className="mx-auto my-5 w-full max-w-4xl rounded-3xl border border-line-soft bg-white p-8 text-center font-sans shadow-sm"
        >
          <p className="text-sm text-muted">
            {profile.isError
              ? getErrorMessage(profile.error)
              : "This profile is not available."}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${user.name} | Profile`}</title>
      </Helmet>

      <BackToHome />
      <ProfileCard user={user} readOnly />

      <section
        aria-label={`${user.name}'s posts`}
        className="mx-auto w-full max-w-4xl px-4 pb-8 font-sans text-ink sm:px-0"
      >
        <h2 className="font-display text-xl font-bold">Posts</h2>

        {posts.isLoading && <Loader />}

        {posts.isError && (
          <p
            role="alert"
            className="my-5 rounded-3xl border border-line-soft bg-white p-8 text-center text-sm text-red-700 shadow-sm"
          >
            {getErrorMessage(posts.error)}
          </p>
        )}

        {posts.data?.partial && (
          <p className="mt-2 text-xs text-muted">
            Showing this user's posts found in the community feed.
          </p>
        )}

        {posts.data && posts.data.posts.length === 0 && (
          <p className="my-5 rounded-3xl border border-line-soft bg-white p-8 text-center text-sm text-muted shadow-sm">
            No posts yet.
          </p>
        )}

        {posts.data?.posts.map((post) => (
          <Post key={post._id} post={post} isPostDetails={false} />
        ))}
      </section>
    </>
  );
}
