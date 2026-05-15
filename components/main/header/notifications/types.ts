export type PikNotificationType = "post_piked" | "post_collected" | "follow";

export type PikNotification = {
  id: string;
  type: PikNotificationType;
  actorUserName: string;
  actorDisplayName: string;
  read: boolean;
  createdAt: string;
  postId?: string;
  postAuthorUserName?: string;
  postSubject?: string;
  collectionId?: string;
  collectionName?: string;
  link: string;
};

export type NotificationsApiResponse = {
  notifications?: unknown;
  unreadCount?: unknown;
};

function notificationReadTruthy(raw: Record<string, unknown>): boolean {
  if (typeof raw.seen === "number") {
    return raw.seen !== 0;
  }
  if (typeof raw.seen === "boolean") {
    return raw.seen;
  }
  if (typeof raw.read === "number") {
    return raw.read !== 0;
  }
  if (typeof raw.read === "boolean") {
    return raw.read;
  }

  return Boolean(raw.read);
}

export function normalizeNotification(raw: Record<string, unknown>): PikNotification | null {
  let type: PikNotificationType | null = null;
  if (raw.type === "follow") type = "follow";
  else if (raw.type === "post_piked") type = "post_piked";
  else if (raw.type === "post_collected") type = "post_collected";
  if (!type || typeof raw.id !== "string" || typeof raw.actorUserName !== "string") {
    return null;
  }
  return {
    id: raw.id,
    type,
    actorUserName: raw.actorUserName,
    actorDisplayName:
      typeof raw.actorDisplayName === "string" ? raw.actorDisplayName : raw.actorUserName,
    read: notificationReadTruthy(raw),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
    postId: typeof raw.postId === "string" ? raw.postId : "",
    postAuthorUserName:
      typeof raw.postAuthorUserName === "string" ? raw.postAuthorUserName : "",
    postSubject: typeof raw.postSubject === "string" ? raw.postSubject : "",
    collectionId: typeof raw.collectionId === "string" ? raw.collectionId : "",
    collectionName: typeof raw.collectionName === "string" ? raw.collectionName : "",
    link: typeof raw.link === "string" ? raw.link : "",
  };
}
