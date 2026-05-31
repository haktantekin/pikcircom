import FeedMasonryGrid from "@/components/FeedMasonryGrid";
import { profilePostToMasonryCard } from "@/src/feedMasonryHelpers";
import { useResponsiveMasonryColumnCount } from "@/src/useResponsiveMasonryColumnCount";
import type { PostTagLike } from "@/src/sensitiveContent";

export interface ListDetailPost {
  id: string;
  userName?: string;
  image?: string;
  imageUrls?: Record<string, string>;
  subject?: string;
  tags?: PostTagLike[];
  categoryName?: string;
  isSensitive?: boolean;
  imageWidth?: number;
  imageHeight?: number;
}

interface ListDetailGridProps {
  posts: ListDetailPost[];
  resetKey?: string;
}

export default function ListDetailGrid({
  posts,
  resetKey = "list-detail",
}: ListDetailGridProps) {
  const columnCount = useResponsiveMasonryColumnCount(2, 2);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="w-full rounded bg-white p-4">
      <FeedMasonryGrid
        posts={posts.map((post) => profilePostToMasonryCard(post))}
        resetKey={`${resetKey}-${columnCount}`}
        columnCount={columnCount}
      />
    </section>
  );
}
