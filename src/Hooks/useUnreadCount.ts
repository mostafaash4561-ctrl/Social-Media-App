import { useQuery } from "@tanstack/react-query";
import {
  extractUnreadCount,
  fetchUnreadCount,
  UNREAD_KEY,
} from "../Logic/notifications";

export default function useUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: UNREAD_KEY,
    queryFn: fetchUnreadCount,
    select: extractUnreadCount,
    enabled,
    refetchInterval: 60_000,
  });
}
