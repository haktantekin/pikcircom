import type { PikNotification } from "@/components/main/header/notifications/types";
import { formatNotificationTime } from "@/components/main/header/notifications/formatNotificationTime";
import { IconBookmarkPlus, IconHeart, IconUserPlus } from "@tabler/icons-react";

type NotificationDrawerRowProps = {
  notification: PikNotification;
  summary: string;
  locale: string;
  onNavigate: () => void;
  onHoverRead?: (id: string) => void;
};

export default function NotificationDrawerRow({
  notification,
  summary,
  locale,
  onNavigate,
  onHoverRead,
}: NotificationDrawerRowProps) {
  const timeLabel = formatNotificationTime(notification.createdAt, locale);

  const icon =
    notification.type === "follow" ? (
      <IconUserPlus size={20} stroke={1.0} className="shrink-0 text-58b4d1" />
    ) : notification.type === "post_collected" ? (
      <IconBookmarkPlus size={20} stroke={1.0} className="shrink-0 text-58b4d1" />
    ) : (
      <IconHeart size={20} stroke={1.0} className="shrink-0 text-58b4d1" />
    );

  const tryMarkSeen = () => {
    if (!notification.read && notification.id && onHoverRead) {
      onHoverRead(notification.id);
    }
  };

  return (
    <button
      type="button"
      onClick={onNavigate}
      onPointerEnter={tryMarkSeen}
      onTouchStart={tryMarkSeen}
      className={`flex w-full gap-3 border-b border-gray-100 px-1 py-3 text-left last:border-b-0 ${
        !notification.read ? "bg-f5f3f4" : ""
      }`}
    >
      <span className="mt-0.5">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-202124">{summary}</span>
        {timeLabel ? (
          <span className="mt-0.5 block text-xs text-gray-500">{timeLabel}</span>
        ) : null}
      </span>
    </button>
  );
}
