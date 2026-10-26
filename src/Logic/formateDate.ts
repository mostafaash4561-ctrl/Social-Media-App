import type { PostType } from "../Types/Post.type";

export const formatDate = (iso: PostType["createdAt"]): string =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
