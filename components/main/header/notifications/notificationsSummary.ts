import type { TFunction } from "i18next";
import type { PikNotification } from "@/components/main/header/notifications/types";

export function buildNotificationSummary(notification: PikNotification, t: TFunction): string {
  const atUser = `@${notification.actorUserName}`;

  if (notification.type === "follow") {
    return String(t("notificationFollow", { user: atUser }));
  }

  if (notification.type === "post_collected") {
    const collection = notification.collectionName?.trim() || "";
    const subj = notification.postSubject?.trim();
    if (collection && subj) {
      return String(
        t("notificationPostCollectedWithSubject", {
          user: atUser,
          subject: subj,
          collection,
        }),
      );
    }
    if (collection) {
      return String(t("notificationPostCollectedShort", { user: atUser, collection }));
    }
    return String(t("notificationPostCollectedFallback", { user: atUser }));
  }

  const trimmed = notification.postSubject?.trim();
  if (trimmed) {
    return String(t("notificationPostPikedWithSubject", { user: atUser, subject: trimmed }));
  }
  return String(t("notificationPostPikedShort", { user: atUser }));
}
