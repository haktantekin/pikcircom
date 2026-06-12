import { useCallback, useEffect, useMemo, useState } from "react";
import FeedMasonryGrid from "@/components/FeedMasonryGrid";
import Skeleton from "@/components/Skeleton";
import FeedLoadMoreSentinel from "@/components/FeedLoadMoreSentinel";
import { fetchExplorePostsPage } from "@/src/feedApi";
import { explorePostToMasonryCard } from "@/src/feedMasonryHelpers";
import { useTranslation } from "react-i18next";
import { prepareExplorePosts, type ExplorePost } from "@/src/feedPostTypes";
import { FEED_PAGE_SIZE } from "@/src/feedPagination";
import { useInfiniteScroll } from "@/src/useInfiniteScroll";
import { subscribePostCreated } from "@/src/postCreatedEvent";

export type { ExplorePost };

interface ExploreFeedProps {
  selectedTag?: string;
  readOnly?: boolean;
  /**
   * Ana sayfadaki etiket barında kullanıcının gizlediği etiket slug'ları.
   * Bu slug'lardan birini taşıyan gönderiler feed'de gösterilmez.
   * Boş array veya tanımsız = filtre uygulanmaz.
   */
  hiddenSlugs?: string[];
}

function postFallbackKey(post: ExplorePost): string {
  const id = post?.id != null ? String(post.id).trim() : "";
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
  for (const post of prepareExplorePosts(batch)) {
    const key = postFallbackKey(post);
    if (!seen.has(key)) {
      seen.add(key);
      next.push(post);
    }
  }
  return next;
}

export default function ExploreFeed({
  selectedTag = "",
  readOnly = false,
  hiddenSlugs = [],
}: ExploreFeedProps) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const tagKey = selectedTag || "";

  // Gizli etiket slug'larını Set'e çevir (lookup performansı).
  const hiddenSet = useMemo(() => {
    const set = new Set<string>();
    for (const slug of hiddenSlugs ?? []) {
      if (typeof slug === "string" && slug.trim()) {
        set.add(slug.trim());
      }
    }
    return set;
  }, [hiddenSlugs]);

  // hiddenSet'e göre postları client-side filtrele. Liste, server'dan gelen ham
  // listenin bir türevidir; kullanıcı bir etiketi gizlediğinde / gösterdiğinde
  // sayfa yenilenmeden anlık olarak feed'den çıkar / geri gelir.
  const visiblePosts = useMemo(() => {
    if (hiddenSet.size === 0) {
      return posts;
    }
    return posts.filter((post) => {
      const tags = post.tags ?? [];
      for (const tag of tags) {
        if (tag && typeof tag.slug === "string" && hiddenSet.has(tag.slug)) {
          return false;
        }
      }
      return true;
    });
  }, [posts, hiddenSet]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");
      setPage(1);
      setHasMore(false);

      try {
        const response = await fetchExplorePostsPage({
          tag: tagKey || undefined,
          perPage: FEED_PAGE_SIZE,
          page: 1,
        });
        if (cancelled) {
          return;
        }
        const batch = dedupePostsArray(response.data.posts ?? []);
        const more =
          response.data.has_more === true ||
          (response.data.has_more !== false &&
            batch.length >= FEED_PAGE_SIZE);
        setPosts(batch);
        setHasMore(more);
      } catch {
        if (!cancelled) {
          setPosts([]);
          setError(t("exploreLoadError"));
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
  }, [tagKey, t]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await fetchExplorePostsPage({
        tag: tagKey || undefined,
        perPage: FEED_PAGE_SIZE,
        page: nextPage,
      });
      const batch = dedupePostsArray(response.data.posts ?? []);
      if (batch.length > 0) {
        setPosts((prev) => appendUniquePosts(prev, batch));
        setPage(nextPage);
      }
      const more =
        response.data.has_more === true ||
        (response.data.has_more !== false &&
          batch.length >= FEED_PAGE_SIZE);
      setHasMore(more && batch.length > 0);
    } catch {
      /* sonraki scroll'da tekrar dene */
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, isLoading, page, tagKey]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: () => {
      void loadMore();
    },
    hasMore,
    isLoadingMore,
    disabled: isLoading || Boolean(error),
  });

  /**
   * Yeni oluşturulan postu feed'in başına anında ekle.
   * - `selectedTag` varsa: yeni post o etiketi taşımıyorsa feed'e sokma (filtre bütünlüğü).
   * - Aynı id'ye sahip post zaten varsa: yenisi ile değiştir (dedupe).
   * - `hiddenSlugs` filtresine dokunma; `visiblePosts` `useMemo`'su bunu zaten yönetiyor,
   *   kullanıcı etiketi geri açtığında post tekrar görünsün.
   */
  useEffect(() => {
    return subscribePostCreated((detail) => {
      const newPost = detail?.post;
      if (!newPost || !newPost.id) {
        return;
      }
      if (tagKey) {
        const slug = tagKey.trim().toLowerCase();
        const matches = (newPost.tags ?? []).some(
          (tag) => typeof tag?.slug === "string" && tag.slug.toLowerCase() === slug,
        );
        if (!matches) {
          return;
        }
      }
      setPosts((prev) => {
        const filtered = prev.filter(
          (p) => String(p.id) !== String(newPost.id),
        );
        return [newPost, ...filtered];
      });
      setHasMore(true);
    });
  }, [tagKey]);

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

  if (visiblePosts.length === 0) {
    const hasHiddenFilter = hiddenSet.size > 0;
    return (
      <section className="mb-4 w-full rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-card">
        {hasHiddenFilter
          ? t("exploreHiddenAllEmpty")
          : selectedTag
            ? t("exploreTagEmpty")
            : t("exploreEmpty")}
      </section>
    );
  }

  return (
    <>
      <FeedMasonryGrid
        posts={visiblePosts.map(explorePostToMasonryCard)}
        resetKey={`${tagKey}|${hiddenSlugs.join(",")}`}
      />
      <FeedLoadMoreSentinel
        sentinelRef={sentinelRef}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
    </>
  );
}
