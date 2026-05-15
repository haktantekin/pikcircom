export const POST_CREATED_EVENT = "pikcir:post-created";

export function dispatchPostCreated(detail?: { postId?: string }) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(POST_CREATED_EVENT, { detail }));
}

export function subscribePostCreated(handler: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener(POST_CREATED_EVENT, handler);
  return () => window.removeEventListener(POST_CREATED_EVENT, handler);
}
