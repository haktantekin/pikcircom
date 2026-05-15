export const FOLLOW_CHANGED_EVENT = "pikcir:follow-changed";

export function emitFollowChanged(userName: string, isFollowing: boolean) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(FOLLOW_CHANGED_EVENT, {
      detail: { userName, isFollowing },
    }),
  );
}

export function subscribeFollowChanged(
  handler: (userName: string, isFollowing: boolean) => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const detail = (event as CustomEvent<{ userName?: string; isFollowing?: boolean }>)
      .detail;
    if (typeof detail?.userName === "string") {
      handler(detail.userName, Boolean(detail.isFollowing));
    }
  };

  window.addEventListener(FOLLOW_CHANGED_EVENT, listener);
  return () => window.removeEventListener(FOLLOW_CHANGED_EVENT, listener);
}
