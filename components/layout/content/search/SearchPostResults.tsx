import FeedMasonryGrid from "@/components/FeedMasonryGrid";
import { explorePostToMasonryCard } from "@/src/feedMasonryHelpers";
import type { SearchPostItem } from "@/src/searchTypes";
import { useTranslation } from "react-i18next";

interface SearchPostResultsProps {
  posts: SearchPostItem[];
  readOnly?: boolean;
  onPostDeleted?: (postId: string) => void;
}

export default function SearchPostResults({
  posts,
}: SearchPostResultsProps) {
  const { t } = useTranslation();

  if (posts.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        {t("searchEmptyPosts")}
      </p>
    );
  }

  return (
    <FeedMasonryGrid
      posts={posts.map((post) => explorePostToMasonryCard(post))}
      resetKey="search-posts"
    />
  );
}
