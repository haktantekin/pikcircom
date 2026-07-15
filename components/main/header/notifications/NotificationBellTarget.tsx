import { IconBellRinging } from "@tabler/icons-react";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
} from "react";

export type NotificationBellTargetProps =
  Omit<ComponentPropsWithoutRef<"button">, "children"> & {
    notificationAnchor?: boolean;
    unreadCount: number;
    compact?: boolean;
  };

/** Menu.Target klona yapışan onClick / aria için tüm düğüm props'larını <button>a iletmek gerekir. */
const NotificationBellTarget = forwardRef<HTMLButtonElement, NotificationBellTargetProps>(
  function NotificationBellTarget(
    {
      notificationAnchor,
      unreadCount,
      compact = false,
      className,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const baseClass =
      "relative bg-transparent hover:bg-transparent px-0 mx-0 cursor-pointer border-0 p-0";
    const mergedClass =
      typeof className === "string" && className.trim() !== ""
        ? `${baseClass} ${className}`
        : baseClass;

    return (
      <button ref={ref} type={type} className={mergedClass} {...rest}>
        {notificationAnchor ? (
          <span
            id="show-notification"
            className="absolute left-1/2 top-1/2 h-px w-px -translate-x-1/2 -translate-y-1/2 opacity-0"
            aria-hidden
          />
        ) : null}
        {unreadCount > 0 ? (
          <div className="rounded-3xl bg-58b4d1 border border-58b4d1 p-1 py-0 absolute top-1 lg:-top-1 -right-1 text-white text-center text-[10px] leading-tight min-w-[1.125rem] z-[1]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        ) : null}
        <IconBellRinging
          size={compact ? "1.2rem" : "1.7rem"}
          stroke={compact ? 1.15 : 1.0}
          className="text-343a40"
        />
      </button>
    );
  },
);

export default NotificationBellTarget;
