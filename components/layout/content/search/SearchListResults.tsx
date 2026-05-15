import { useTranslation } from "react-i18next";
import ListItem from "@/components/layout/content/lists/ListItem";
import type { SearchListItem } from "@/src/searchTypes";

interface SearchListResultsProps {
  lists: SearchListItem[];
}

export default function SearchListResults({ lists }: SearchListResultsProps) {
  const { t } = useTranslation();

  if (lists.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        {t("searchEmptyLists")}
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {lists.map((list) => (
        <ListItem
          key={list.id}
          slug={list.slug}
          name={list.name}
          postCount={list.postCount}
          previewImages={list.previewImages ?? []}
        />
      ))}
    </div>
  );
}
