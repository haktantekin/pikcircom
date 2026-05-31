import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconLayoutColumns,
  IconLayoutGrid,
  IconList,
} from "@tabler/icons-react";
import FeedLoadMoreSentinel from "@/components/FeedLoadMoreSentinel";
import MasonryPostCard from "@/components/MasonryPostCard";
import MasonryPostGrid from "@/components/MasonryPostGrid";
import {
  getCollectionLayoutMode,
  setCollectionLayoutMode,
  type CollectionLayoutMode,
} from "@/src/collectionLayoutPrefs";
import { FEED_GRID_PAGE_SIZE } from "@/src/feedPagination";
import {
  estimateMasonryItemHeight,
  useMasonryColumns,
} from "@/src/masonryLayout";
import { useClientPaginatedSlice } from "@/src/useClientPaginatedSlice";
import { usePrefetchPostImages } from "@/src/usePrefetchPostImages";
import { sortCollectionPostsByNewest } from "@/src/sortCollectionPosts";
import {
  applySensitiveMetadataToPosts,
  type PostTagLike,
} from "@/src/sensitiveContent";

export interface CollectionGridPost {
  id: string;
  subject?: string;
  userName?: string;
  createDate?: string;
  addedAt?: string;
  categoryName?: string;
  isSensitive?: boolean;
  image?: string;
  imageUrls?: Record<string, string>;
  tags?: PostTagLike[];
  imageWidth?: number;
  imageHeight?: number;
}

interface CollectionPostsImageGridProps {
  posts: CollectionGridPost[];
  /** Gönderi linki için kullanıcı adı yedeği */
  fallbackUserName: string;
}

function layoutModeToColumnCount(mode: CollectionLayoutMode): number {
  if (mode === "cols2") {
    return 2;
  }
  if (mode === "cols3") {
    return 3;
  }
  return 1;
}

function postHref(post: CollectionGridPost, fallbackUserName: string): string {
  const author = (post.userName || fallbackUserName || "").trim();
  const id = String(post.id ?? "").trim();
  if (!author || !id) {
    return "#";
  }
  return `/${author}/posts/${id}`;
}

function imageSizes(mode: CollectionLayoutMode): string {
  if (mode === "timeline") {
    return "(max-width: 1024px) 100vw, 740px";
  }
  if (mode === "cols2") {
    return "(max-width: 1024px) 50vw, 360px";
  }
  return "(max-width: 1024px) 33vw, 220px";
}

export default function CollectionPostsImageGrid({
  posts,
  fallbackUserName,
}: CollectionPostsImageGridProps) {
  const { t } = useTranslation();
  const [layoutMode, setLayoutMode] = useState<CollectionLayoutMode>("cols3");

  useEffect(() => {
    setLayoutMode(getCollectionLayoutMode());
  }, []);

  const sortedPosts = useMemo(() => {
    const sorted = sortCollectionPostsByNewest(posts);
    return applySensitiveMetadataToPosts(sorted);
  }, [posts]);

  const masonryResetKey = `${fallbackUserName}-${layoutMode}`;

  usePrefetchPostImages(sortedPosts, {
    variant: "thumb",
    resetKey: masonryResetKey,
  });

  const { visibleItems, hasMore, isLoadingMore, sentinelRef } =
    useClientPaginatedSlice({
      items: sortedPosts,
      pageSize: FEED_GRID_PAGE_SIZE,
      resetKey: masonryResetKey,
    });

  const columnCount = layoutModeToColumnCount(layoutMode);

  const getItemId = useCallback((post: CollectionGridPost) => post.id, []);

  const estimateHeight = useCallback(
    (post: CollectionGridPost) => estimateMasonryItemHeight(post),
    [],
  );

  const columns = useMasonryColumns({
    items: visibleItems,
    columnCount,
    getItemId,
    estimateHeight,
    resetKey: masonryResetKey,
  });

  const selectLayout = (mode: CollectionLayoutMode) => {
    setLayoutMode(mode);
    setCollectionLayoutMode(mode);
  };

  const toggleClass = (mode: CollectionLayoutMode) =>
    `rounded-lg p-1.5 transition-colors ${
      layoutMode === mode
        ? "bg-58b4d1/15 text-58b4d1 shadow-sm"
        : "text-gray-500 hover:bg-gray-100"
    }`;

  return (
    <>
      <div className="mb-2 flex justify-end gap-1 px-1 sm:px-0">
        <button
          type="button"
          title={t("collectionViewTimeline")}
          aria-label={t("collectionViewTimeline")}
          onClick={() => selectLayout("timeline")}
          className={toggleClass("timeline")}
        >
          <IconList size={20} stroke={1.2} />
        </button>
        <button
          type="button"
          title={t("collectionViewCols2")}
          aria-label={t("collectionViewCols2")}
          onClick={() => selectLayout("cols2")}
          className={toggleClass("cols2")}
        >
          <IconLayoutColumns size={20} stroke={1.2} />
        </button>
        <button
          type="button"
          title={t("collectionViewCols3")}
          aria-label={t("collectionViewCols3")}
          onClick={() => selectLayout("cols3")}
          className={toggleClass("cols3")}
        >
          <IconLayoutGrid size={20} stroke={1.2} />
        </button>
      </div>

      <MasonryPostGrid
        columns={columns}
        gapClassName="gap-1.5 sm:gap-2"
        renderItem={(post) => (
          <MasonryPostCard
            key={post.id}
            post={post}
            href={postHref(post, fallbackUserName)}
            imageVariant="thumb"
            sizes={imageSizes(layoutMode)}
          />
        )}
      />

      <FeedLoadMoreSentinel
        sentinelRef={sentinelRef}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
    </>
  );
}
