import { useEffect, useRef } from "react";
import {
  prefetchPostImages,
  scheduleIdleWork,
  type PrefetchPostLike,
} from "@/src/prefetchPostImages";
import type { PostImageVariant } from "@/src/postImageUrl";

interface UsePrefetchPostImagesOptions {
  variant?: PostImageVariant;
  enabled?: boolean;
  resetKey?: string | number;
}

export function usePrefetchPostImages(
  posts: PrefetchPostLike[],
  {
    variant = "thumb",
    enabled = true,
    resetKey = "",
  }: UsePrefetchPostImagesOptions = {},
) {
  const seenPostIdsRef = useRef<Set<string>>(new Set());
  const lastResetKeyRef = useRef<string | number>(resetKey);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return undefined;
    }

    if (lastResetKeyRef.current !== resetKey) {
      seenPostIdsRef.current = new Set();
      lastResetKeyRef.current = resetKey;
    }

    const newPostIds: string[] = [];

    for (const post of posts) {
      const postId = String(post.id ?? "").trim();
      if (!postId || seenPostIdsRef.current.has(postId)) {
        continue;
      }
      seenPostIdsRef.current.add(postId);
      newPostIds.push(postId);
    }

    if (newPostIds.length === 0) {
      return undefined;
    }

    let cancelled = false;

    scheduleIdleWork(() => {
      void prefetchPostImages(posts, {
        variant,
        onlyPostIds: newPostIds,
      }).catch(() => {
        if (cancelled) {
          return;
        }
        for (const postId of newPostIds) {
          seenPostIdsRef.current.delete(postId);
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, posts, resetKey, variant]);
}
