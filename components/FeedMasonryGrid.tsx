import { useCallback } from "react";
import MasonryPostCard, {
  type MasonryPostCardData,
} from "@/components/MasonryPostCard";
import MasonryPostGrid from "@/components/MasonryPostGrid";
import { postDetailPath } from "@/src/feedMasonryHelpers";
import {
  estimateMasonryItemHeight,
  useMasonryColumns,
} from "@/src/masonryLayout";
import { useFeedMasonryColumnCount } from "@/src/useFeedMasonryColumnCount";
import { usePrefetchPostImages } from "@/src/usePrefetchPostImages";

interface FeedMasonryGridProps {
  posts: MasonryPostCardData[];
  resetKey?: string | number;
  columnCount?: number;
  showMeta?: boolean;
  imageSizes?: string;
}

export default function FeedMasonryGrid({
  posts,
  resetKey = "feed",
  columnCount: columnCountOverride,
  showMeta = true,
  imageSizes = "(max-width: 1024px) 50vw, 50vw",
}: FeedMasonryGridProps) {
  const responsiveColumns = useFeedMasonryColumnCount();
  const columnCount = columnCountOverride ?? responsiveColumns;

  const getItemId = useCallback((post: MasonryPostCardData) => post.id, []);

  const estimateHeight = useCallback(
    (post: MasonryPostCardData) => estimateMasonryItemHeight(post),
    [],
  );

  const masonryResetKey = `${resetKey}-${columnCount}`;

  usePrefetchPostImages(posts, {
    variant: "feed",
    resetKey: masonryResetKey,
  });

  const columns = useMasonryColumns({
    items: posts,
    columnCount,
    getItemId,
    estimateHeight,
    resetKey: masonryResetKey,
  });

  if (posts.length === 0) {
    return null;
  }

  return (
    <MasonryPostGrid
      columns={columns}
      gapClassName="gap-2 sm:gap-3"
      renderItem={(post) => (
        <MasonryPostCard
          key={post.id}
          post={post}
          href={postDetailPath(post)}
          imageVariant="feed"
          sizes={imageSizes}
          showMeta={showMeta}
          roundedClassName="rounded-xl"
          linkClassName="group relative block w-full overflow-hidden rounded-xl bg-gray-100 outline-none ring-58b4d1 transition hover:opacity-95 focus-visible:ring-2"
        />
      )}
    />
  );
}
