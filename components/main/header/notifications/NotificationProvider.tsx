import { useRouter } from "next/router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { PikNotification } from "@/components/main/header/notifications/types";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";
import {
  fetchNotificationsApi,
  markNotificationsReadApi,
} from "@/components/main/header/notifications/notificationApi";

const PREVIEW_LIMIT = 50;
const DRAWER_LIMIT = 100;

type NotificationContextValue = {
  items: PikNotification[];
  unreadCount: number;
  busy: boolean;
  unauthorized: boolean;
  fetchError: boolean;
  previewItems: PikNotification[];
  load: (limit: number, quiet?: boolean) => Promise<void>;
  loadDrawerQuiet: () => void;
  handleHoverMarkRead: (id: string) => void;
  handleMarkAllRead: () => Promise<void>;
  selectNotificationItem: (
    notification: PikNotification,
    closeDrawer?: () => void,
  ) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [unauthorized, setUnauthorized] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [items, setItems] = useState<PikNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [busy, setBusy] = useState(true);

  const hoverMarkedIdsRef = useRef<Set<string>>(new Set());
  const itemsRef = useRef<PikNotification[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const load = useCallback(async (limit: number, quiet = false) => {
    if (!quiet) {
      setBusy(true);
    }

    try {
      const payload = await fetchNotificationsApi(limit);
      if (payload === null) {
        setUnauthorized(true);
        setItems([]);
        setUnreadCount(0);
        setFetchError(false);
        return;
      }
      setUnauthorized(false);
      if (payload.status !== 200) {
        setFetchError(true);
        setItems([]);
        setUnreadCount(0);
        return;
      }
      setFetchError(false);
      const rawItems = payload.items;
      for (const row of rawItems) {
        if (row.read && hoverMarkedIdsRef.current.has(row.id)) {
          hoverMarkedIdsRef.current.delete(row.id);
        }
      }
      const mergedItems = rawItems.map((row) =>
        hoverMarkedIdsRef.current.has(row.id) ? { ...row, read: true } : row,
      );
      const staleUnreadStillInResponse = rawItems.filter(
        (row) => hoverMarkedIdsRef.current.has(row.id) && !row.read,
      ).length;
      const adjustedUnread = Math.max(0, payload.unreadCount - staleUnreadStillInResponse);
      setItems(mergedItems);
      setUnreadCount(adjustedUnread);
    } catch {
      setFetchError(true);
    } finally {
      if (!quiet) setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load(PREVIEW_LIMIT, false);
  }, [load, router.asPath]);

  useEffect(() => {
    const refresh = () => {
      hoverMarkedIdsRef.current.clear();
      setItems([]);
      setUnreadCount(0);
      setUnauthorized(false);
      setFetchError(false);
      void load(PREVIEW_LIMIT, false);
    };
    return subscribeAuthSessionChanged(refresh);
  }, [load]);

  const loadDrawerQuiet = useCallback(() => {
    void load(DRAWER_LIMIT, true);
  }, [load]);

  const handleHoverMarkRead = useCallback(
    (id: string) => {
      if (hoverMarkedIdsRef.current.has(id)) {
        return;
      }
      const row = itemsRef.current.find((r) => r.id === id);
      if (!row || row.read) {
        return;
      }
      hoverMarkedIdsRef.current.add(id);
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)));
      setUnreadCount((c) => Math.max(0, c - 1));
      void markNotificationsReadApi({ ids: [id] }).catch(() => {
        hoverMarkedIdsRef.current.delete(id);
        void load(DRAWER_LIMIT, true);
      });
    },
    [load],
  );

  const handleMarkAllRead = useCallback(async () => {
    if (unauthorized || unreadCount <= 0) {
      return;
    }
    const snapshot = itemsRef.current;
    for (const r of snapshot) {
      if (r.id) {
        hoverMarkedIdsRef.current.add(r.id);
      }
    }
    setItems((prev) => prev.map((row) => ({ ...row, read: true })));
    setUnreadCount(0);
    try {
      await markNotificationsReadApi({ markAllRead: true });
    } catch {
      for (const r of snapshot) {
        if (r.id) {
          hoverMarkedIdsRef.current.delete(r.id);
        }
      }
      void load(DRAWER_LIMIT, true);
    }
  }, [unauthorized, unreadCount, load]);

  const selectNotificationItem = useCallback(
    async (notification: PikNotification, closeDrawer?: () => void) => {
      const link = notification.link?.trim() ?? "";

      closeDrawer?.();

      if (link) {
        await router.push(link);
      }

      const current = itemsRef.current.find((r) => r.id === notification.id) ?? notification;
      if (!current.read && current.id) {
        hoverMarkedIdsRef.current.add(current.id);
        setItems((prev) =>
          prev.map((row) => (row.id === current.id ? { ...row, read: true } : row)),
        );
        setUnreadCount((count) => Math.max(0, count - 1));
        try {
          await markNotificationsReadApi({ ids: [current.id] });
        } catch {
          void load(DRAWER_LIMIT, true);
        }
      }
    },
    [router, load],
  );

  const previewItems = useMemo(() => items.slice(0, 5), [items]);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      busy,
      unauthorized,
      fetchError,
      previewItems,
      load,
      loadDrawerQuiet,
      handleHoverMarkRead,
      handleMarkAllRead,
      selectNotificationItem,
    }),
    [
      items,
      unreadCount,
      busy,
      unauthorized,
      fetchError,
      previewItems,
      load,
      loadDrawerQuiet,
      handleHoverMarkRead,
      handleMarkAllRead,
      selectNotificationItem,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}
