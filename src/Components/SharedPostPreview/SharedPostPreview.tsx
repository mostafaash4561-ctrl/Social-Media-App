import { Link } from "react-router-dom";
import { DEFAULT_AVATAR } from "../../Logic/defaults";
import { formatDate } from "../../Logic/formateDate";
import type { SharedPost } from "../../Types/Post.type";

export default function SharedPostPreview({
  sharedPost,
}: {
  sharedPost: SharedPost | null;
}) {
  if (!sharedPost) {
    return (
      <div className="mx-5 mb-4 rounded-2xl border border-dashed border-line bg-canvas p-4 text-center text-sm text-muted">
        This post is no longer available.
      </div>
    );
  }

  const { _id, user, body, image, createdAt } = sharedPost;

  return (
    <Link
      to={`/postdetails/${_id}`}
      className="mx-5 mb-4 block overflow-hidden rounded-2xl border border-line-soft transition hover:bg-canvas focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
    >
      <div className="flex items-center gap-3 p-4 pb-2">
        <img
          src={user?.photo || DEFAULT_AVATAR}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full bg-brand-900 object-cover"
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">{user?.name}</span>
          <span className="truncate text-xs text-muted">
            {user?.username}
            {createdAt && ` · ${formatDate(createdAt)}`}
          </span>
        </div>
      </div>

      {body && (
        <p className="px-4 pb-3 text-sm leading-relaxed wrap-break-word">
          {body}
        </p>
      )}

      {image && (
        <img
          src={image}
          alt="shared post"
          className="max-h-96 w-full object-cover"
        />
      )}
    </Link>
  );
}
