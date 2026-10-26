import type { AxiosResponse } from "axios";
import type { PostType } from "../Types/Post.type";

type RawPost = PostType & { post?: PostType };

export function extractPosts(res: AxiosResponse): PostType[] {
  const payload = res.data?.data;
  const list =
    payload?.posts ??
    payload?.bookmarks ??
    (Array.isArray(payload) ? payload : []);
  if (!Array.isArray(list)) return [];
  return list
    .map((item: RawPost) => item?.post ?? item)
    .filter((p: PostType) => Boolean(p?._id));
}
