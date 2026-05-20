import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconLayoutColumns,
  IconLayoutGrid,
  IconList,
} from "@tabler/icons-react";
import FeedLoadMoreSentinel from "@/components/FeedLoadMoreSentinel";
import SensitivePostMedia from "@/components/SensitivePostMedia";
import {
  getCollectionLayoutMode,
  setCollectionLayoutMode,
  type CollectionLayoutMode,
} from "@/src/collectionLayoutPrefs";
import { pickPostImageUrl } from "@/src/postImageUrl";
import { FEED_GRID_PAGE_SIZE } from "@/src/feedPagination";
import { useClientPaginatedSlice } from "@/src/useClientPaginatedSlice";
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
}

interface CollectionPostsImageGridProps {
  posts: CollectionGridPost[];
  /** Gönderi linki için kullanıcı adı yedeği */
  fallbackUserName: string;
}

const GRID_CLASS: Record<CollectionLayoutMode, string> = {
  timeline: "grid-cols-1",
  cols2: "grid-cols-2",
  cols3: "grid-cols-3",
};

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

  const { visibleItems, hasMore, isLoadingMore, sentinelRef } =
    useClientPaginatedSlice({
      items: sortedPosts,
      pageSize: FEED_GRID_PAGE_SIZE,
      resetKey: `${fallbackUserName}-${layoutMode}`,
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

      <section
        className={`grid w-full gap-1.5 sm:gap-2 ${GRID_CLASS[layoutMode]}`}
      >
        {visibleItems.map((post) => {
          const href = postHref(post, fallbackUserName);
          const src =
            pickPostImageUrl(post.image, post.imageUrls, "grid") ||
            "/postExample/F5Z00CEaEAAFPgi.jpg";
          const label = post.subject?.trim() || `post ${post.id}`;
          return (
            <SensitivePostMedia
              key={post.id}
              postId={post.id}
              tags={post.tags}
                categoryName={post.categoryName}
                isSensitive={post.isSensitive}
                variant="grid"
            >
              <Link
                href={href}
                className="relative block aspect-square overflow-hidden rounded-sm border border-gray-100 outline-none ring-58b4d1 transition hover:opacity-95 focus-visible:ring-2"
                aria-label={label}
                title={label}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes={imageSizes(layoutMode)}
                />
              </Link>
            </SensitivePostMedia>
          );
        })}
      </section>

      <FeedLoadMoreSentinel
        sentinelRef={sentinelRef}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
    </>
  );
}
