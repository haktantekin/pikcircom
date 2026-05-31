import { useCallback, useEffect, useRef, useState } from "react";
import FeedMasonryGrid from "@/components/FeedMasonryGrid";
import Skeleton from "@/components/Skeleton";
import FeedLoadMoreSentinel from "@/components/FeedLoadMoreSentinel";
import { fetchHomeFeedPage } from "@/src/feedApi";
import { explorePostToMasonryCard } from "@/src/feedMasonryHelpers";
import { subscribePostCreated } from "@/src/postCreatedEvent";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";
import { useTranslation } from "react-i18next";
import { prepareExplorePosts, type ExplorePost } from "@/src/feedPostTypes";
import { fetchAuthProfile } from "@/src/fetchAuthProfile";
import { FEED_PAGE_SIZE } from "@/src/feedPagination";
import { useClientPaginatedSlice } from "@/src/useClientPaginatedSlice";
import { useInfiniteScroll } from "@/src/useInfiniteScroll";
import Link from "next/link";

export type HomeFeedScope = "karma" | "followed";

const NEW_PIKS_POLL_MS = 45_000;

function postIdKey(post: ExplorePost): string {
  return post?.id != null ? String(post.id).trim() : "";
}

function postFallbackKey(post: ExplorePost): string {
  const id = postIdKey(post);
  if (id) {
    return `id:${id}`;
  }
  return `${post.userName ?? ""}|${post.createDate ?? ""}|${post.subject ?? ""}|${post.image ?? ""}`;
}

function dedupePostsArray(rawPosts: ExplorePost[]): ExplorePost[] {
  const seen = new Set<string>();
  const deduped = rawPosts.filter((post) => {
    const key = postFallbackKey(post);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
  return prepareExplorePosts(deduped);
}

function appendUniquePosts(
  prev: ExplorePost[],
  batch: ExplorePost[],
): ExplorePost[] {
  const seen = new Set(prev.map((p) => postFallbackKey(p)));
  const next = [...prev];
  for (const post of batch) {
    const key = postFallbackKey(post);
    if (!seen.has(key)) {
      seen.add(key);
      next.push(post);
    }
  }
  return next;
}

function sliceNewPostsFromFresh(
  freshRaw: ExplorePost[],
  current: ExplorePost[],
): ExplorePost[] {
  const fresh = dedupePostsArray(freshRaw);
  const existingIds = new Set(
    current.map((p) => postIdKey(p)).filter(Boolean),
  );

  if (existingIds.size === 0) {
    return fresh;
  }

  const newPosts: ExplorePost[] = [];
  for (const post of fresh) {
    const id = postIdKey(post);
    if (id && existingIds.has(id)) {
      break;
    }
    newPosts.push(post);
  }
  return newPosts;
}

function mergePostsAtTop(
  newer: ExplorePost[],
  current: ExplorePost[],
): ExplorePost[] {
  return dedupePostsArray([...newer, ...current]);
}

interface NewPiksFloatingBarProps {
  count: number;
  onActivate: () => void;
  labelOver: string;
  labelCount: string;
}

function NewPiksFloatingBar({
  count,
  onActivate,
  labelOver,
  labelCount,
}: NewPiksFloatingBarProps) {
  if (count <= 0) {
    return null;
  }
  return (
    <div className="pointer-events-none sticky top-2 z-20 -mb-1 flex justify-center px-2 lg:top-4">
      <button
        type="button"
        onClick={onActivate}
        className="pointer-events-auto rounded-full border border-white/30 bg-58b4d1 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:brightness-105 active:scale-[0.98]"
        aria-live="polite"
      >
        {count > 99 ? labelOver : labelCount}
      </button>
    </div>
  );
}

interface HomeFeedProps {
  scope: HomeFeedScope;
  refreshKey?: number;
  readOnly?: boolean;
}

export default function HomeFeed({
  scope,
  refreshKey = 0,
  readOnly = false,
}: HomeFeedProps) {
  const { t } = useTranslation();
  const isServerPaginated = scope === "karma";
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [authTick, setAuthTick] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [pendingNewCount, setPendingNewCount] = useState(0);

  const postsRef = useRef<ExplorePost[]>([]);
  const pendingNewPostsRef = useRef<ExplorePost[]>([]);
  postsRef.current = posts;

  const listResetKey = `${scope}-${refreshKey}-${authTick}`;

  const {
    visibleItems: followedVisiblePosts,
    hasMore: followedHasMore,
    isLoadingMore: followedLoadingMore,
    sentinelRef: followedSentinelRef,
  } = useClientPaginatedSlice({
    items: posts,
    resetKey: listResetKey,
    pageSize: FEED_PAGE_SIZE,
  });

  const enqueuePendingPosts = useCallback((incoming: ExplorePost[]) => {
    if (incoming.length === 0) {
      return;
    }
    const visibleIds = new Set(
      postsRef.current.map((p) => postIdKey(p)).filter(Boolean),
    );
    const toAdd = incoming.filter((post) => {
      const id = postIdKey(post);
      return !id || !visibleIds.has(id);
    });
    if (toAdd.length === 0) {
      return;
    }
    const merged = mergePostsAtTop(toAdd, pendingNewPostsRef.current);
    pendingNewPostsRef.current = merged;
    setPendingNewCount(merged.length);
  }, []);

  useEffect(
    () =>
      subscribePostCreated((detail) => {
        if (!detail.post) {
          return;
        }
        enqueuePendingPosts([detail.post]);
      }),
    [enqueuePendingPosts],
  );

  useEffect(
    () =>
      subscribeAuthSessionChanged(() => {
        setPosts([]);
        setPage(1);
        setHasMore(false);
        setAuthTick((n) => n + 1);
      }),
    [],
  );

  useEffect(() => {
    setPendingNewCount(0);
    pendingNewPostsRef.current = [];
  }, [listResetKey]);

  const fetchKarmaPage = useCallback(
    async (pageNum: number, refresh = false) => {
      const response = await fetchHomeFeedPage({
        scope: "karma",
        perPage: FEED_PAGE_SIZE,
        page: pageNum,
        refresh,
      });
      const batch = dedupePostsArray(response.data.posts ?? []);
      const more =
        response.data.has_more === true ||
        (response.data.has_more !== false &&
          batch.length >= FEED_PAGE_SIZE);
      return { batch, more };
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");
      setPage(1);
      setHasMore(false);

      if (scope === "followed") {
        try {
          const profileRes = await fetchAuthProfile();
          if (!cancelled) {
            setIsGuest(!profileRes.ok);
          }
        } catch {
          if (!cancelled) {
            setIsGuest(true);
          }
        }
      } else if (!cancelled) {
        setIsGuest(false);
      }

      try {
        if (isServerPaginated) {
          const { batch, more } = await fetchKarmaPage(1);
          if (cancelled) {
            return;
          }
          setPosts(batch);
          setHasMore(more);
        } else {
          const response = await fetchHomeFeedPage({ scope: "followed" });
          if (cancelled) {
            return;
          }
          setPosts(dedupePostsArray(response.data.posts ?? []));
        }
        setPendingNewCount(0);
        pendingNewPostsRef.current = [];
      } catch {
        if (!cancelled) {
          setPosts([]);
          setError(t("homeFeedLoadError"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [scope, listResetKey, t, isServerPaginated, fetchKarmaPage]);

  const loadMoreKarma = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { batch, more } = await fetchKarmaPage(nextPage);
      if (batch.length > 0) {
        setPosts((prev) => appendUniquePosts(prev, batch));
        setPage(nextPage);
      }
      setHasMore(more && batch.length > 0);
    } catch {
      /* sonraki scroll'da tekrar dene */
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, isLoading, page, fetchKarmaPage]);

  const { sentinelRef: karmaSentinelRef } = useInfiniteScroll({
    onLoadMore: () => {
      void loadMoreKarma();
    },
    hasMore: isServerPaginated && hasMore,
    isLoadingMore,
    disabled: isLoading || Boolean(error),
  });

  useEffect(() => {
    if (isLoading || error) {
      return undefined;
    }
    if (scope === "followed" && isGuest) {
      return undefined;
    }

    let cancelled = false;

    const poll = async () => {
      if (typeof document !== "undefined" && document.hidden) {
        return;
      }
      try {
        let fresh: ExplorePost[] = [];
        if (isServerPaginated) {
          const { batch } = await fetchKarmaPage(1, true);
          fresh = batch;
        } else {
          const response = await fetchHomeFeedPage({
            scope: "followed",
            refresh: true,
          });
          fresh = dedupePostsArray(response.data.posts ?? []);
        }
        if (cancelled) {
          return;
        }
        const baseline = mergePostsAtTop(
          pendingNewPostsRef.current,
          postsRef.current,
        );
        const nextNew = sliceNewPostsFromFresh(fresh, baseline);
        if (cancelled || nextNew.length === 0) {
          return;
        }
        const merged = mergePostsAtTop(
          nextNew,
          pendingNewPostsRef.current,
        );
        pendingNewPostsRef.current = merged;
        setPendingNewCount(merged.length);
      } catch {
        /* ignore; next interval retries */
      }
    };

    const interval = setInterval(poll, NEW_PIKS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLoading, error, scope, isGuest, isServerPaginated, fetchKarmaPage]);

  const applyPendingNewPiks = useCallback(() => {
    const incoming = pendingNewPostsRef.current;
    if (incoming.length === 0) {
      setPendingNewCount(0);
      return;
    }
    setPosts((prev) => mergePostsAtTop(incoming, prev));
    pendingNewPostsRef.current = [];
    setPendingNewCount(0);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }, []);

  const displayPosts = isServerPaginated ? posts : followedVisiblePosts;
  const showSentinel = isServerPaginated
    ? hasMore
    : followedHasMore;
  const sentinelRef = isServerPaginated
    ? karmaSentinelRef
    : followedSentinelRef;
  const loadingMore = isServerPaginated
    ? isLoadingMore
    : followedLoadingMore;

  if (isLoading) {
    return (
      <div className="mt-4">
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <section className="mb-4 w-full rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-red-600 shadow-card">
        {error}
      </section>
    );
  }

  if (scope === "followed" && isGuest) {
    return (
      <section className="mb-4 w-full rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-600 shadow-card">
        {t("followedFeedLoginHint")}{" "}
        <Link href="/login" className="font-bold text-58b4d1 hover:underline">
          {t("logIn")}
        </Link>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        <NewPiksFloatingBar
          count={pendingNewCount}
          onActivate={applyPendingNewPiks}
          labelOver={t("feedNewPiksBarOver")}
          labelCount={t("feedNewPiksBar", { count: pendingNewCount })}
        />
        <section className="mb-4 w-full rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-card">
          {scope === "followed" ? t("followedFeedEmpty") : t("karmaFeedEmpty")}
        </section>
      </>
    );
  }

  return (
    <>
      <NewPiksFloatingBar
        count={pendingNewCount}
        onActivate={applyPendingNewPiks}
        labelOver={t("feedNewPiksBarOver")}
        labelCount={t("feedNewPiksBar", { count: pendingNewCount })}
      />
      <FeedMasonryGrid
        posts={displayPosts.map(explorePostToMasonryCard)}
        resetKey={listResetKey}
      />
      <FeedLoadMoreSentinel
        sentinelRef={sentinelRef}
        hasMore={showSentinel}
        isLoadingMore={loadingMore}
      />
    </>
  );
}
