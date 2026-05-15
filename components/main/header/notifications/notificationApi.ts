import type { NotificationsApiResponse } from "@/components/main/header/notifications/types";
import {
  normalizeNotification,
  type PikNotification,
} from "@/components/main/header/notifications/types";

export async function fetchNotificationsApi(
  limit = 50,
): Promise<{ items: PikNotification[]; unreadCount: number; status: number } | null> {
  const res = await fetch(`/api/notifications?limit=${encodeURIComponent(String(limit))}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401) return null;

  if (!res.ok) {
    return { items: [], unreadCount: 0, status: res.status };
  }

  const data = (await res.json()) as NotificationsApiResponse;
  const rawList = Array.isArray(data.notifications) ? data.notifications : [];
  const items: PikNotification[] = [];

  for (const row of rawList) {
    if (row !== null && typeof row === "object") {
      const n = normalizeNotification(row as Record<string, unknown>);
      if (n) items.push(n);
    }
  }

  const unreadCount =
    typeof data.unreadCount === "number" && Number.isFinite(data.unreadCount)
      ? data.unreadCount
      : items.filter((i) => !i.read).length;

  return { items, unreadCount, status: 200 };
}

export async function markNotificationsReadApi(body: {
  ids?: string[];
  markAllRead?: boolean;
}): Promise<void> {
  const qs =
    body.markAllRead === true
      ? `?${new URLSearchParams({ markAllRead: "1" }).toString()}`
      : "";

  const res = await fetch(`/api/notifications${qs}`, {
    // PATCH govdesini dusuren proxy/CDN nedeniyle WP tarafinda da POST ile ayni endpoint acik.
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`notifications_patch_${res.status}`);
  }
}
