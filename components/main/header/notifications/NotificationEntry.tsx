import type { PikNotification } from "@/components/main/header/notifications/types";
import { formatNotificationTime } from "@/components/main/header/notifications/formatNotificationTime";
import { IconBookmarkPlus, IconHeart, IconUserPlus } from "@tabler/icons-react";
import { Menu } from "@mantine/core";

type NotificationEntryProps = {
  notification: PikNotification;
  summary: string;
  locale: string;
  compact?: boolean;
  onNavigate: () => void;
  /** İlk hover’da tek seferlik okundu */
  onHoverRead?: (id: string) => void;
};

export default function NotificationEntry({
  notification,
  summary,
  locale,
  compact,
  onNavigate,
  onHoverRead,
}: NotificationEntryProps) {
  const timeLabel = formatNotificationTime(notification.createdAt, locale);

  const icon =
    notification.type === "follow" ? (
      <IconUserPlus size={20} stroke={1.0} />
    ) : notification.type === "post_collected" ? (
      <IconBookmarkPlus size={20} stroke={1.0} />
    ) : (
      <IconHeart size={20} stroke={1.0} />
    );

  const tryMarkSeen = () => {
    if (!notification.read && notification.id && onHoverRead) {
      onHoverRead(notification.id);
    }
  };

  return (
    <Menu.Item
      onClick={onNavigate}
      onPointerEnter={tryMarkSeen}
      onTouchStart={tryMarkSeen}
      className={`leading-snug ${!notification.read ? "bg-f5f3f4" : ""} ${compact ? "py-2" : "py-3"}`}
      icon={icon}
    >
      <span className="block text-sm text-202124">{summary}</span>
      {timeLabel ? (
        <span className="mt-0.5 block text-xs text-gray-500">{timeLabel}</span>
      ) : null}
    </Menu.Item>
  );
}
