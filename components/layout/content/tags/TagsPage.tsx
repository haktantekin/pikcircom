import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ExploreFeed from "@/components/layout/content/contentCenter/ExploreFeed";
import TagList, {
  type TagSelectMeta,
} from "@/components/layout/content/contentCenter/TagList";
import { getTags } from "@/configs/client-services";
import { IconChevronLeft } from "@tabler/icons-react";

export default function TagsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedTagName, setSelectedTagName] = useState("");

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const tag = typeof router.query.tag === "string" ? router.query.tag.trim() : "";
    setSelectedTag(tag);
    if (!tag) {
      setSelectedTagName("");
    }
  }, [router.isReady, router.query.tag]);

  useEffect(() => {
    if (!selectedTag || selectedTagName) {
      return;
    }

    let cancelled = false;

    getTags()
      .then((response) => {
        if (cancelled) {
          return;
        }
        const match = (response.data.exploreTags ?? []).find(
          (tag: { slug?: string; name?: string }) => tag.slug === selectedTag,
        );
        if (match?.name) {
          setSelectedTagName(match.name);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [selectedTag, selectedTagName]);

  const handleTagSelect = useCallback(
    (slug: string, meta?: TagSelectMeta) => {
      const trimmed = slug.trim();
      setSelectedTag(trimmed);
      setSelectedTagName(meta?.name?.trim() || trimmed);

      if (!router.isReady) {
        return;
      }

      if (trimmed) {
        router.push(
          { pathname: "/tags", query: { tag: trimmed } },
          undefined,
          { shallow: true },
        );
      } else {
        router.push("/tags", undefined, { shallow: true });
      }
    },
    [router],
  );

  const inTagView = selectedTag.length > 0;
  const tagHeading = selectedTagName || selectedTag;

  return (
    <div className="col-span-12 relative mb-4 mt-4 lg:mt-0">

      {!inTagView ? (
        <TagList
          layout="grid"
          selectedTag={selectedTag}
          onTagSelect={handleTagSelect}
        />
      ) : (
        <>
          <section
            className="mb-4 w-full rounded border border-gray-200 bg-white"
            style={{ boxShadow: "rgba(33, 35, 38, 0.1) 0px 10px 10px -10px" }}
          >
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={() => handleTagSelect("")}
                className="inline-flex items-center gap-1 text-sm font-bold text-58b4d1 hover:underline"
              >
                <IconChevronLeft size={18} stroke={2} />
                {t("exploreAllTags")}
              </button>
              <h2 className="text-sm font-bold text-202124">#{tagHeading}</h2>
            </div>
          </section>

          <ExploreFeed selectedTag={selectedTag} />
        </>
      )}
    </div>
  );
}
