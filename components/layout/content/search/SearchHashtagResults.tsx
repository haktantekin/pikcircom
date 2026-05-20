import { useTranslation } from "react-i18next";
import SearchTagChip from "./SearchTagChip";
import SearchPostResults from "./SearchPostResults";
import type { SearchPostItem, SearchTagItem } from "@/src/searchTypes";

interface SearchHashtagResultsProps {
  hashtags: SearchTagItem[];
  posts: SearchPostItem[];
  readOnly?: boolean;
  onPostDeleted?: (postId: string) => void;
}

export default function SearchHashtagResults({
  hashtags,
  posts,
  readOnly = false,
  onPostDeleted,
}: SearchHashtagResultsProps) {
  const { t } = useTranslation();

  if (hashtags.length === 0 && posts.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        {t("searchEmptyHashtags")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {hashtags.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-126782">{t("searchHashtagsSection")}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {hashtags.map((tag) => (
              <SearchTagChip
                key={tag.slug}
                tag={tag}
                href={`/tags?tag=${encodeURIComponent(tag.slug)}`}
                subtitle={
                  typeof tag.postCount === "number"
                    ? t("searchTagPostCount", { count: tag.postCount })
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {posts.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-126782">{t("searchHashtagPostsSection")}</h2>
          <SearchPostResults
            posts={posts}
            readOnly={readOnly}
            onPostDeleted={onPostDeleted}
          />
        </section>
      ) : null}
    </div>
  );
}
