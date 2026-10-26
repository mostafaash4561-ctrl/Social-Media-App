import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Helmet } from "react-helmet";
import type { IconType } from "react-icons";
import {
  FiAtSign,
  FiBell,
  FiCheck,
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiUserPlus,
} from "react-icons/fi";
import { ImSpinner8 } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Loader from "../../Components/Loader/Loader";
import useUnreadCount from "../../Hooks/useUnreadCount";
import { DEFAULT_AVATAR } from "../../Logic/defaults";
import { formatDate } from "../../Logic/formateDate";
import { getErrorMessage } from "../../Logic/getErrorMessage";
import {
  extractNotifications,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_KEY,
  UNREAD_KEY,
  type AppNotification,
  type NotificationKind,
} from "../../Logic/notifications";

const MySwal = withReactContent(Swal);
const LIMIT = 20;

const KIND_ICON: Record<NotificationKind, { icon: IconType; tone: string }> = {
  like: { icon: FiHeart, tone: "bg-red-500" },
  comment: { icon: FiMessageCircle, tone: "bg-brand-600" },
  reply: { icon: FiMessageCircle, tone: "bg-brand-600" },
  follow: { icon: FiUserPlus, tone: "bg-emerald-600" },
  share: { icon: FiShare2, tone: "bg-amber-600" },
  mention: { icon: FiAtSign, tone: "bg-brand-600" },
  other: { icon: FiBell, tone: "bg-muted" },
};

function showError(err: unknown) {
  MySwal.fire({ icon: "error", title: "Error", text: getErrorMessage(err) });
}

function NotificationRow({
  notification,
  onOpen,
  onMarkRead,
  marking,
}: {
  notification: AppNotification;
  onOpen: (n: AppNotification) => void;
  onMarkRead: (id: string) => void;
  marking: boolean;
}) {
  const { id, kind, isRead, actorName, actorPhoto, text, createdAt } =
    notification;
  const { icon: Icon, tone } = KIND_ICON[kind];

  return (
    <li
      className={`flex items-center gap-1 rounded-2xl border transition ${
        isRead ? "border-line-soft bg-white" : "border-brand-200 bg-brand-50"
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-2xl p-4 text-left transition hover:bg-black/3 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
      >
        <span className="relative shrink-0">
          <img
            src={actorPhoto || DEFAULT_AVATAR}
            alt=""
            className="h-12 w-12 rounded-full bg-brand-900 object-cover"
          />
          <span
            className={`absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-white ${tone}`}
          >
            <Icon className="h-2.5 w-2.5" aria-hidden="true" />
          </span>
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm leading-snug wrap-break-word">
            {actorName && <strong className="font-semibold">{actorName} </strong>}
            {text}
          </span>
          {createdAt && (
            <span className="text-xs text-muted">
              {formatDate(createdAt)}
            </span>
          )}
        </span>
      </button>

      {!isRead && (
        <button
          type="button"
          onClick={() => onMarkRead(id)}
          disabled={marking}
          aria-label="Mark as read"
          title="Mark as read"
          className="mr-3 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-brand-700 transition hover:bg-brand-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {marking ? (
            <ImSpinner8 className="h-4 w-4 animate-spin" />
          ) : (
            <FiCheck className="h-5 w-5" />
          )}
        </button>
      )}
    </li>
  );
}

type Filter = "all" | "unread";

export default function Notifications() {
  const navigate = useNavigate();
  const query = useQueryClient();
  const { data: unread = 0 } = useUnreadCount(true);
  const [filter, setFilter] = useState<Filter>("all");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: NOTIFICATIONS_KEY,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchNotifications(pageParam, LIMIT),
    getNextPageParam: (lastPage, allPages) => {
      const last = extractNotifications(lastPage);
      if (last.length < LIMIT) return undefined;
      const earlier = new Set(
        allPages.slice(0, -1).flatMap((p) => extractNotifications(p).map((n) => n.id)),
      );
      if (last.every((n) => earlier.has(n.id))) return undefined;
      return allPages.length + 1;
    },
  });

  function refresh() {
    return Promise.all([
      query.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
      query.invalidateQueries({ queryKey: UNREAD_KEY }),
    ]);
  }

  const readOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: refresh,
    onError: showError,
  });

  const readAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: refresh,
    onError: showError,
  });

  function openNotification(n: AppNotification) {
    if (!n.isRead) readOne.mutate(n.id);
    if (n.postId) navigate(`/postdetails/${n.postId}`);
  }

  const notifications: AppNotification[] = [];
  const seen = new Set<string>();
  for (const page of data?.pages ?? []) {
    for (const n of extractNotifications(page)) {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        notifications.push(n);
      }
    }
  }

  const visible =
    filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  let content: ReactNode;
  if (isLoading) {
    content = <Loader />;
  } else if (isError) {
    content = (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-3xl border border-line-soft bg-white p-8 text-center shadow-sm"
      >
        <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="cursor-pointer rounded-full border border-line-soft px-5 py-2 text-sm font-semibold text-ink-soft transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
        >
          Try again
        </button>
      </div>
    );
  } else if (visible.length === 0) {
    content = (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-line-soft bg-white p-10 text-center shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
          <FiBell className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted">
          {filter === "unread"
            ? "You're all caught up."
            : "No notifications yet."}
        </p>
      </div>
    );
  } else {
    content = (
      <>
        <ul className="flex flex-col gap-2.5">
          {visible.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onOpen={openNotification}
              onMarkRead={(id) => readOne.mutate(id)}
              marking={readOne.isPending && readOne.variables === n.id}
            />
          ))}
        </ul>

        {hasNextPage && (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="mx-auto mt-4 flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line-soft bg-white px-6 text-sm font-semibold text-ink-soft transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFetchingNextPage && <ImSpinner8 className="animate-spin" />}
            Load more
          </button>
        )}
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{unread > 0 ? `(${unread}) Notifications` : "Notifications"}</title>
      </Helmet>

      <section
        aria-label="Notifications"
        className="mx-auto my-5 w-full max-w-3xl px-4 font-sans text-ink sm:px-0"
      >
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">
              Notifications
            </h1>
          </div>

          {unread > 0 && (
            <button
              type="button"
              onClick={() => readAll.mutate()}
              disabled={readAll.isPending}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line-soft bg-white px-4 text-sm font-semibold text-ink-soft transition hover:bg-brand-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {readAll.isPending ? (
                <ImSpinner8 className="animate-spin" />
              ) : (
                <FiCheck className="h-4.5 w-4.5" />
              )}
              Mark all as read
            </button>
          )}
        </header>

        <div
          role="tablist"
          aria-label="Filter notifications"
          className="mb-4 flex gap-1 rounded-2xl border border-line-soft bg-white p-1 shadow-sm"
        >
          {(
            [
              { id: "all", label: "All" },
              { id: "unread", label: unread > 0 ? `Unread (${unread})` : "Unread" },
            ] as { id: Filter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`h-10 flex-1 cursor-pointer rounded-xl text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 ${
                filter === tab.id
                  ? "bg-brand-600 text-white"
                  : "text-muted hover:bg-brand-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {content}
      </section>
    </>
  );
}
