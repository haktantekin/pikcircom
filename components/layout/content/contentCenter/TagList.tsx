import { Spoiler, Loader } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTags } from "@/configs/client-services";
import TagOptionRow from "./TagOptionRow";
import { sortTagsByPostCountDesc } from "@/src/sortTags";

export interface ExploreTagItem {
  slug: string;
  name: string;
  postCount: number;
  imageUrl?: string;
}

export interface TagSelectMeta {
  name?: string;
}

interface TagListProps {
  selectedTag?: string;
  onTagSelect?: (slug: string, meta?: TagSelectMeta) => void;
  layout?: "list" | "grid";
  showAllTagsButton?: boolean;
  /** Misafir: etiket seçimi kapalı */
  readOnly?: boolean;
}

export default function TagList({
  selectedTag = "",
  onTagSelect,
  layout = "list",
  showAllTagsButton = true,
  readOnly = false,
}: TagListProps) {
  const { t } = useTranslation();
  const [tags, setTags] = useState<ExploreTagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isGrid = layout === "grid";

  // Post sayısına göre azalan, eşitlikte Türkçe alfabetik sırala.
  const sortedTags = useMemo(
    () => sortTagsByPostCountDesc(tags),
    [tags],
  );

  useEffect(() => {
    let cancelled = false;

    getTags()
      .then((response) => {
        if (cancelled) {
          return;
        }
        setTags(response.data.exploreTags ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setTags([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const tagButtonClass = (isActive: boolean) =>
    isGrid
      ? `flex h-full min-h-[72px] w-full items-center rounded-lg border p-3 text-left transition-colors ${
          isActive
            ? "border-58b4d1 bg-58b4d1/10 ring-1 ring-58b4d1"
            : "border-gray-200 bg-white hover:border-58b4d1/40 hover:bg-gray-50"
        }`
      : `w-full rounded py-2 px-2 text-left ${
          isActive
            ? "bg-58b4d1/15 font-semibold text-58b4d1"
            : "text-202124 hover:bg-gray-50"
        }`;

  const renderAllTagsButton = () => (
    <button
      type="button"
      disabled={readOnly}
      onClick={() => {
        if (!readOnly) {
          onTagSelect?.("");
        }
      }}
      className={`${tagButtonClass(selectedTag === "")} ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
    >
      {isGrid ? (
        <span className="text-sm font-semibold text-58b4d1">{t("exploreAllTags")}</span>
      ) : (
        <span className="flex w-full items-center gap-2 text-sm">{t("exploreAllTags")}</span>
      )}
    </button>
  );

  const renderTagButton = (tag: ExploreTagItem) => {
    const isActive = selectedTag === tag.slug;
    return (
      <button
        key={tag.slug}
        type="button"
        disabled={readOnly}
        onClick={() => {
          if (!readOnly) {
            onTagSelect?.(tag.slug, { name: tag.name });
          }
        }}
        className={`${tagButtonClass(isActive)} ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <TagOptionRow
          name={tag.name}
          imageUrl={tag.imageUrl}
          showCount={tag.postCount}
          variant={isGrid ? "stacked" : "inline"}
        />
      </button>
    );
  };

  return (
    <section className="mb-4 mt-4 w-full rounded-xl border border-gray-100 bg-white shadow-card lg:mt-0">
      <h2 className="border-b border-gray-100 px-4 py-3 text-sm font-bold text-58b4d1">
        {t("tagsMenu")}
      </h2>

      <div className="p-3 sm:p-4">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Loader size="sm" />
          </div>
        )}

        {!isLoading && sortedTags.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">{t("exploreTagsEmpty")}</p>
        )}

        {!isLoading && sortedTags.length > 0 && isGrid && (
          <ul className="grid grid-cols-2 gap-2 sm:gap-3">
            {showAllTagsButton ? (
              <li className="col-span-2">{renderAllTagsButton()}</li>
            ) : null}
            {sortedTags.map((tag) => (
              <li key={tag.slug}>{renderTagButton(tag)}</li>
            ))}
          </ul>
        )}

        {!isLoading && sortedTags.length > 0 && !isGrid && (
          <Spoiler
            maxHeight={220}
            showLabel={t("showAll")}
            hideLabel={t("hide")}
            className="show-all"
          >
            <ul className="flex flex-col gap-1">
              {showAllTagsButton ? <li>{renderAllTagsButton()}</li> : null}
              {sortedTags.map((tag) => (
                <li key={tag.slug}>{renderTagButton(tag)}</li>
              ))}
            </ul>
          </Spoiler>
        )}
      </div>
    </section>
  );
}
