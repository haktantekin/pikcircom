import { useCallback, useEffect, useMemo, useState } from "react";
import { FEED_PAGE_SIZE } from "@/src/feedPagination";
import { useInfiniteScroll } from "@/src/useInfiniteScroll";

export interface UseClientPaginatedSliceOptions<T> {
  items: T[];
  pageSize?: number;
  /** Değişince visibleCount sıfırlanır */
  resetKey?: string | number;
}

export function useClientPaginatedSlice<T>({
  items,
  pageSize = FEED_PAGE_SIZE,
  resetKey = "",
}: UseClientPaginatedSliceOptions<T>) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setVisibleCount(pageSize);
    setIsLoadingMore(false);
  }, [resetKey, pageSize]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    if (!hasMore) {
      return;
    }
    setIsLoadingMore(true);
    setVisibleCount((count) => Math.min(count + pageSize, items.length));
    setIsLoadingMore(false);
  }, [hasMore, pageSize, items.length]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoadingMore,
  });

  return {
    visibleItems,
    hasMore,
    isLoadingMore,
    loadMore,
    sentinelRef,
  };
}
