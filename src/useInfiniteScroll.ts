import { useCallback, useEffect, useRef } from "react";

const ROOT_MARGIN = "500px";

export interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  disabled?: boolean;
  isLoadingMore?: boolean;
}

/**
 * Liste altındaki sentinel görünür olunca onLoadMore çağırır.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  disabled = false,
  isLoadingMore = false,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  onLoadMoreRef.current = onLoadMore;

  const tryLoadMore = useCallback(() => {
    if (disabled || isLoadingMore || !hasMore) {
      return;
    }
    onLoadMoreRef.current();
  }, [disabled, isLoadingMore, hasMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || disabled || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          tryLoadMore();
        }
      },
      { root: null, rootMargin: ROOT_MARGIN, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [disabled, hasMore, tryLoadMore]);

  return { sentinelRef };
}
