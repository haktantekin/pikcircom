import { useCallback, useEffect, useRef, useState } from "react";
import { getProfilePosts } from "@/configs/client-services";
import { FEED_GRID_PAGE_SIZE } from "@/src/feedPagination";
import { applySensitiveMetadataToPosts } from "@/src/sensitiveContent";
import { useInfiniteScroll } from "@/src/useInfiniteScroll";

export interface ProfileFeedPost {
  id: string;
  subject?: string;
  userName?: string;
  createDate?: string;
  image?: string;
  imageUrls?: Record<string, string>;
  tags?: { slug: string; name: string }[];
  categoryName?: string;
  isSensitive?: boolean;
}

function postKey(post: ProfileFeedPost): string {
  return String(post.id ?? "").trim();
}

function appendUniquePosts(
  prev: ProfileFeedPost[],
  batch: ProfileFeedPost[],
): ProfileFeedPost[] {
  const seen = new Set(prev.map((post) => postKey(post)));
  const next = [...prev];

  for (const post of batch) {
    const key = postKey(post);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    next.push(post);
  }

  return next;
}

interface UseProfilePostsFeedOptions {
  userName: string;
  postCount?: number;
  enabled?: boolean;
}

export function useProfilePostsFeed({
  userName,
  postCount,
  enabled = true,
}: UseProfilePostsFeedOptions) {
  const [posts, setPosts] = useState<ProfileFeedPost[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const loadVersionRef = useRef(0);

  useEffect(() => {
    if (!enabled || !userName.trim()) {
      setPosts([]);
      setPage(0);
      setHasMore(false);
      setIsLoading(false);
      setError("");
      return undefined;
    }

    const version = loadVersionRef.current + 1;
    loadVersionRef.current = version;
    let cancelled = false;

    const loadFirstPage = async () => {
      setIsLoading(true);
      setError("");
      setPage(0);
      setHasMore(false);

      try {
        const response = await getProfilePosts(userName, {
          page: 1,
          perPage: FEED_GRID_PAGE_SIZE,
        });

        if (cancelled || loadVersionRef.current !== version) {
          return;
        }

        const batch = (response.data?.posts ?? []) as ProfileFeedPost[];
        applySensitiveMetadataToPosts(batch);

        const total =
          typeof response.data?.post_count === "number"
            ? response.data.post_count
            : postCount;

        const more =
          response.data?.has_more === true ||
          (total != null && batch.length < total) ||
          (response.data?.has_more !== false &&
            batch.length >= FEED_GRID_PAGE_SIZE);

        setPosts(batch);
        setPage(1);
        setHasMore(more);
      } catch {
        if (!cancelled && loadVersionRef.current === version) {
          setPosts([]);
          setError("profilePostsLoadError");
        }
      } finally {
        if (!cancelled && loadVersionRef.current === version) {
          setIsLoading(false);
        }
      }
    };

    void loadFirstPage();

    return () => {
      cancelled = true;
    };
  }, [enabled, userName, postCount]);

  const loadMore = useCallback(async () => {
    if (!enabled || !userName.trim() || !hasMore || isLoadingMore || isLoading) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const response = await getProfilePosts(userName, {
        page: nextPage,
        perPage: FEED_GRID_PAGE_SIZE,
      });
      const batch = (response.data?.posts ?? []) as ProfileFeedPost[];
      applySensitiveMetadataToPosts(batch);

      if (batch.length === 0) {
        setHasMore(false);
        return;
      }

      let mergedLength = 0;
      setPosts((prev) => {
        const merged = appendUniquePosts(prev, batch);
        mergedLength = merged.length;
        return merged;
      });
      setPage(nextPage);

      const total =
        typeof response.data?.post_count === "number"
          ? response.data.post_count
          : postCount;

      const more =
        response.data?.has_more === true ||
        (total != null && mergedLength < total) ||
        (response.data?.has_more !== false &&
          batch.length >= FEED_GRID_PAGE_SIZE);

      setHasMore(more);
    } catch {
      /* sonraki scroll'da tekrar dene */
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    enabled,
    userName,
    hasMore,
    isLoadingMore,
    isLoading,
    page,
    postCount,
  ]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: () => {
      void loadMore();
    },
    hasMore,
    isLoadingMore,
    disabled: isLoading || Boolean(error),
  });

  const prependPost = useCallback((post: ProfileFeedPost) => {
    if (!post.id) {
      return;
    }
    applySensitiveMetadataToPosts([post]);
    setPosts((prev) => {
      const key = postKey(post);
      if (prev.some((item) => postKey(item) === key)) {
        return prev;
      }
      return [post, ...prev];
    });
  }, []);

  return {
    posts,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    sentinelRef,
    prependPost,
  };
}
