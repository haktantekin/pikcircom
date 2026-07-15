import { Loader } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { getTags } from "@/configs/client-services";
import { sortTagsByPostCountDesc } from "@/src/sortTags";
import type { ExploreTagItem } from "./TagList";

interface HomeTagBarProps {
  /** Kullanıcının gizlediği etiket slug'ları. Boş array = hepsi görünür. */
  hiddenSlugs: string[];
  /** Bir etiketi gizle/göster. Gizli olan slug listeye eklenir, görünür olan çıkarılır. */
  onToggleTagVisibility: (slug: string) => void;
  /** Tüm gizli etiketleri geri getir. */
  onShowAll: () => void;
  /** Tüm etiketleri gizle. */
  onHideAll: (slugs: string[]) => void;
  /** Misafir: etiket seçimi kapalı */
  readOnly?: boolean;
}

export default function HomeTagBar({
  hiddenSlugs,
  onToggleTagVisibility,
  onShowAll,
  onHideAll,
  readOnly = false,
}: HomeTagBarProps) {
  const { t } = useTranslation();
  const [tags, setTags] = useState<ExploreTagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sortedTags = useMemo(() => sortTagsByPostCountDesc(tags), [tags]);

  // Gizli etiketler de listede görünmeye devam eder; sadece görsel olarak pasif
  // (gri border + soluk yazı) olur. Listeden tamamen çıkarılmaz.
  const hiddenSet = useMemo(() => new Set(hiddenSlugs), [hiddenSlugs]);
  const allTagSlugs = useMemo(() => sortedTags.map((tag) => tag.slug), [sortedTags]);
  const hasAnyHidden = hiddenSlugs.length > 0;
  const isAllHidden =
    allTagSlugs.length > 0 && allTagSlugs.every((slug) => hiddenSet.has(slug));

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

  if (isLoading) {
    return (
      <div className="my-4 flex w-full items-center justify-center">
        <Loader size="sm" />
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="my-4 w-full text-center text-sm text-gray-500">
        {t("exploreTagsEmpty")}
      </div>
    );
  }

  return (
    <div className="my-4 w-full">
      <ul
        className="home-tag-bar flex w-full snap-x snap-mandatory gap-2 overflow-x-scroll whitespace-nowrap py-2"
        aria-label={t("tagsMenu")}
      >
        <li className="shrink-0">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (readOnly) {
                return;
              }
              if (hasAnyHidden) {
                onShowAll();
              } else {
                onHideAll([...allTagSlugs]);
              }
            }}
            title={
              hasAnyHidden
                ? t("homeTagShowAll")
                : t("homeTagHideAll", { defaultValue: "Tümünü gizle" })
            }
            aria-label={
              hasAnyHidden
                ? t("homeTagShowAll")
                : t("homeTagHideAll", { defaultValue: "Tümünü gizle" })
            }
            className={`inline-flex shrink-0 snap-start items-center justify-center rounded-full border bg-white p-2 transition-colors ${
              readOnly
                ? "cursor-not-allowed border-gray-200 text-gray-400 opacity-60"
                : hasAnyHidden
                  ? "border-58b4d1 text-58b4d1 hover:bg-gray-50"
                  : "border-gray-300 text-gray-600 hover:border-58b4d1/40 hover:text-58b4d1"
            }`}
          >
            {hasAnyHidden ? <IconEye size={16} stroke={1.8} /> : <IconEyeOff size={16} stroke={1.8} />}
          </button>
        </li>

        {sortedTags.map((tag) => {
          const isHidden = hiddenSet.has(tag.slug);
          // Arka plan hep beyaz, sadece border ve yazı rengi değişir.
          // Aktif (görünür) = mavi border + gri yazı; Pasif (gizli) = gri border + soluk yazı.
          const baseClass =
            "inline-flex shrink-0 snap-start items-center rounded-full border bg-white px-3.5 py-1.5 text-[13px] font-medium transition-colors";
          let stateClass: string;
          if (readOnly) {
            stateClass = "cursor-not-allowed border-gray-200 text-gray-400 opacity-60";
          } else if (isHidden) {
            stateClass = "border-gray-300 text-gray-400 hover:border-gray-400";
          } else {
            stateClass = "border-58b4d1 text-gray-600 hover:bg-gray-50";
          }

          return (
            <li key={tag.slug} className="shrink-0">
              <button
                type="button"
                disabled={readOnly}
                onClick={() => {
                  if (!readOnly) {
                    onToggleTagVisibility(tag.slug);
                  }
                }}
                title={isHidden ? t("homeTagShowHint") : t("homeTagHideHint")}
                aria-pressed={!isHidden}
                className={`${baseClass} ${stateClass}`}
              >
                {tag.name}
              </button>
            </li>
          );
        })}

        {hiddenSlugs.length > 0 ? (
          <li className="shrink-0">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => {
                if (!readOnly) {
                  onShowAll();
                }
              }}
              className={`inline-flex shrink-0 snap-start items-center rounded-full border bg-white px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                readOnly
                  ? "cursor-not-allowed border-gray-200 text-gray-400 opacity-60"
                  : "border-dashed border-gray-300 text-gray-600 hover:border-58b4d1/40 hover:text-58b4d1"
              }`}
            >
              {t("homeTagShowAll")}
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
