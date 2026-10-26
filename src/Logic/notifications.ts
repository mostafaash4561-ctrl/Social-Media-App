import axios, { type AxiosResponse } from "axios";
import { API_URL, authConfig } from "./suggestions";

export const NOTIFICATIONS_KEY = ["notifications"] as const;
export const UNREAD_KEY = ["notificationsUnread"] as const;

export type NotificationKind =
  | "like"
  | "comment"
  | "reply"
  | "follow"
  | "share"
  | "mention"
  | "other";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  isRead: boolean;
  actorName: string;
  actorPhoto?: string;
  text: string;
  postId?: string;
  createdAt: string;
}


type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

function idOf(v: unknown): string | undefined {
  if (typeof v === "string" && v) return v;
  if (isObj(v)) return str(v._id) ?? str(v.id);
  return undefined;
}

function kindOf(type: string): NotificationKind {
  const t = type.toLowerCase();
  if (t.includes("reply")) return "reply";
  if (t.includes("mention")) return "mention";
  if (t.includes("follow")) return "follow";
  if (t.includes("share")) return "share";
  if (t.includes("like")) return "like";
  if (t.includes("comment")) return "comment";
  return "other";
}

function phraseOf(kind: NotificationKind, type: string): string {
  const onComment = type.toLowerCase().includes("comment");
  switch (kind) {
    case "like":
      return onComment ? "liked your comment" : "liked your post";
    case "comment":
      return "commented on your post";
    case "reply":
      return "replied to your comment";
    case "follow":
      return "started following you";
    case "share":
      return "shared your post";
    case "mention":
      return onComment ? "mentioned you in a comment" : "mentioned you in a post";
    default:
      return "sent you a notification";
  }
}

function findPostId(raw: Raw): string | undefined {
  const entity = isObj(raw.entity) ? raw.entity : undefined;
  const entityType = (
    str(raw.entityType) ??
    str(raw.entity_type) ??
    str(entity?.type) ??
    ""
  ).toLowerCase();

  return (
    idOf(raw.post) ??
    idOf(raw.postId) ??
    idOf(entity?.post) ??
    idOf(entity?.postId) ??
    (entityType.includes("post")
      ? (idOf(entity) ?? idOf(raw.entityId))
      : undefined) ??
    (isObj(raw.comment) ? idOf(raw.comment.post) : undefined)
  );
}

function normalizeNotification(raw: Raw): AppNotification | null {
  const id = idOf(raw);
  if (!id) return null;

  const type = str(raw.type) ?? str(raw.action) ?? "";
  const kind = kindOf(type);

  const actor = [raw.actor, raw.sender, raw.from, raw.fromUser, raw.user].find(
    isObj,
  );
  const actorName = str(actor?.name) ?? str(actor?.username) ?? "";
  const apiText =
    str(raw.message) ?? str(raw.text) ?? str(raw.content) ?? str(raw.title);

  const useApiText = kind === "other" || !actorName;

  const read = raw.isRead ?? raw.read ?? raw.seen;

  return {
    id,
    kind,
    isRead: typeof read === "boolean" ? read : Boolean(raw.readAt),
    actorName: useApiText ? "" : actorName,
    actorPhoto: str(actor?.photo),
    text: useApiText ? (apiText ?? phraseOf(kind, type)) : phraseOf(kind, type),
    postId: findPostId(raw),
    createdAt: str(raw.createdAt) ?? str(raw.created_at) ?? "",
  };
}

export function extractNotifications(res: AxiosResponse): AppNotification[] {
  const payload = res.data?.data;
  const list = payload?.notifications ?? (Array.isArray(payload) ? payload : []);
  if (!Array.isArray(list)) return [];
  return list
    .filter(isObj)
    .map(normalizeNotification)
    .filter((n): n is AppNotification => n !== null);
}

export function extractUnreadCount(res: AxiosResponse): number {
  const data = res.data?.data ?? res.data;
  if (typeof data === "number") return data;
  if (!isObj(data)) return 0;

  const known = data.unreadCount ?? data.count ?? data.unread ?? data.total;
  if (typeof known === "number") return known;

  const numbers = Object.values(data).filter(
    (v): v is number => typeof v === "number",
  );
  return numbers.length === 1 ? numbers[0] : 0;
}

export function fetchNotifications(page: number, limit: number) {
  return axios.get(`${API_URL}/notifications`, {
    params: { page, limit },
    ...authConfig(),
  });
}

export function fetchUnreadCount() {
  return axios.get(`${API_URL}/notifications/unread-count`, authConfig());
}

export function markNotificationRead(id: string) {
  return axios.patch(
    `${API_URL}/notifications/${id}/read`,
    null,
    authConfig(),
  );
}

export function markAllNotificationsRead() {
  return axios.patch(`${API_URL}/notifications/read-all`, null, authConfig());
}
