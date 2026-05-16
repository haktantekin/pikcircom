import type { ExplorePost } from "@/components/layout/content/contentCenter/ExploreFeed";

export const POST_CREATED_EVENT = "pikcir:post-created";

export type PostCreatedDetail = {
  postId: string;
  post?: ExplorePost;
};

export function dispatchPostCreated(detail: PostCreatedDetail) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(POST_CREATED_EVENT, { detail }));
}

export function subscribePostCreated(
  handler: (detail: PostCreatedDetail) => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const listener = (event: Event) => {
    const custom = event as CustomEvent<PostCreatedDetail>;
    const detail = custom.detail;
    if (!detail?.postId) {
      return;
    }
    handler(detail);
  };
  window.addEventListener(POST_CREATED_EVENT, listener);
  return () => window.removeEventListener(POST_CREATED_EVENT, listener);
}
