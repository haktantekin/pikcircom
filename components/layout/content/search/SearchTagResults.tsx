import { useTranslation } from "react-i18next";
import SearchTagChip from "./SearchTagChip";
import type { SearchTagItem } from "@/src/searchTypes";

interface SearchTagResultsProps {
  tags: SearchTagItem[];
}

export default function SearchTagResults({ tags }: SearchTagResultsProps) {
  const { t } = useTranslation();

  if (tags.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        {t("searchEmptyTags")}
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {tags.map((tag) => (
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
  );
}
