import axios from "axios";
import type { SuggestedUser } from "../Types/User.type";

export const API_URL = "https://route-posts.routemisr.com";

export function authConfig() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  };
}

function followersOf(raw: Record<string, unknown>): number | undefined {
  const value = raw.followersCount ?? raw.followers_count ?? raw.followers;
  if (typeof value === "number") return value;
  if (Array.isArray(value)) return value.length;
  return undefined;
}

export async function fetchSuggestions(
  page: number,
  limit: number,
): Promise<SuggestedUser[]> {
  const res = await axios.get(`${API_URL}/users/suggestions`, {
    params: { page, limit },
    ...authConfig(),
  });

  const payload = res.data?.data ?? res.data;
  const list =
    payload?.suggestions ??
    payload?.users ??
    (Array.isArray(payload) ? payload : []);
  if (!Array.isArray(list)) return [];

  return list
    .filter((raw: Record<string, unknown>) => raw && raw._id)
    .map((raw: Record<string, unknown>) => ({
      _id: String(raw._id),
      name: String(raw.name ?? ""),
      username: typeof raw.username === "string" ? raw.username : undefined,
      photo: typeof raw.photo === "string" ? raw.photo : undefined,
      followersCount: followersOf(raw),
    }));
}
