import { Textarea, Tooltip, MultiSelect, Loader } from "@mantine/core";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IconAlertCircle } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { getCollections, getLists, getTags } from "@/configs/client-services";
import { profileCollectionsPath } from "@/src/profilePaths";
import { fetchAuthProfile } from "@/src/fetchAuthProfile";
import { sortTagsByPostCountDesc } from "@/src/sortTags";
import TagOptionRow from "./TagOptionRow";

interface CatalogTag {
  slug: string;
  name: string;
  imageUrl?: string;
  postCount?: number;
}

interface TagsInputProps {
  description?: string;
  onDescriptionChange?: (value: string) => void;
  tags?: string[];
  onTagsChange?: (value: string[]) => void;
  collectionIds?: string[];
  onCollectionIdsChange?: (value: string[]) => void;
  listIds?: string[];
  onListIdsChange?: (value: string[]) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  compact?: boolean;
  hideSubmit?: boolean;
  hideDescription?: boolean;
  hideLists?: boolean;
  hideCollections?: boolean;
  sideBySideTaxonomy?: boolean;
  tagPickerAsChips?: boolean;
  lockedList?: { id: string; name: string };
}

interface TagSelectOption {
  value: string;
  label: string;
  imageUrl?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

type TagSelectItemProps = ComponentPropsWithoutRef<"div"> & TagSelectOption;

function TagSelectItem({ label, imageUrl, ...others }: TagSelectItemProps) {
  return (
    <div {...others}>
      <TagOptionRow name={label} imageUrl={imageUrl} />
    </div>
  );
}

const MAX_TAGS = 5;

export default function TagsInput({
  description,
  onDescriptionChange,
  tags,
  onTagsChange,
  collectionIds,
  onCollectionIdsChange,
  listIds,
  onListIdsChange,
  onSubmit,
  isSubmitting = false,
  compact = false,
  hideSubmit = false,
  hideDescription = false,
  hideLists = false,
  hideCollections = false,
  sideBySideTaxonomy = false,
  tagPickerAsChips = false,
  lockedList,
}: TagsInputProps) {
  const { t } = useTranslation();
  const [internalTags, setInternalTags] = useState<string[]>([]);
  const [internalCollectionIds, setInternalCollectionIds] = useState<string[]>([]);
  const [internalListIds, setInternalListIds] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<TagSelectOption[]>([]);
  const [collectionOptions, setCollectionOptions] = useState<SelectOption[]>([]);
  const [listOptions, setListOptions] = useState<SelectOption[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [profileCollectionsHref, setProfileCollectionsHref] = useState("/home");
  const tagSelectRef = useRef<HTMLInputElement>(null);
  const collectionSelectRef = useRef<HTMLInputElement>(null);
  const listSelectRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAuthProfile()
      .then((result) => {
        if (result.ok && result.data?.userName) {
          setProfileCollectionsHref(profileCollectionsPath(result.data.userName));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;

    getTags()
      .then((response) => {
        if (cancelled) {
          return;
        }
        const catalog: CatalogTag[] = response.data.exploreTags ?? response.data.tags ?? [];
        const sorted = sortTagsByPostCountDesc(catalog);
        setTagOptions(
          sorted.map((item) => ({
            value: item.slug,
            label: item.name,
            imageUrl: item.imageUrl || "",
          })),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setTagOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTagsLoading(false);
        }
      });

    Promise.all([
      getCollections().catch(() => ({ data: { collections: [] } })),
      getLists({ period: "all" }).catch(() => ({ data: { lists: [] } })),
    ])
      .then(([collectionsRes, listsRes]) => {
        if (cancelled) {
          return;
        }
        const collections = collectionsRes.data?.collections ?? [];
        setCollectionOptions(
          collections.map((item: { id: string; name: string }) => ({
            value: String(item.id),
            label: item.name,
          })),
        );
        const lists = listsRes.data?.lists ?? [];
        setListOptions(
          lists.map((item: { id: string; name: string }) => ({
            value: String(item.id),
            label: item.name,
          })),
        );
      })
      .finally(() => {
        if (!cancelled) {
          setDestinationsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function updateTags(value: string[]) {
    const allowed = new Set(tagOptions.map((option) => option.value));
    const next = value.filter((slug) => allowed.has(slug)).slice(0, MAX_TAGS);
    if (onTagsChange) {
      onTagsChange(next);
    } else {
      setInternalTags(next);
    }
    // Etiket seçilince dropdown'ı kapat
    tagSelectRef.current?.blur();
  }

  function updateCollectionIds(value: string[]) {
    if (onCollectionIdsChange) {
      onCollectionIdsChange(value);
    } else {
      setInternalCollectionIds(value);
    }
    collectionSelectRef.current?.blur();
  }

  function updateListIds(value: string[]) {
    if (onListIdsChange) {
      onListIdsChange(value);
    } else {
      setInternalListIds(value);
    }
    listSelectRef.current?.blur();
  }

  const tagData = tags ?? internalTags;
  const collectionData = collectionIds ?? internalCollectionIds;
  const listData = listIds ?? internalListIds;

  useEffect(() => {
    if (!lockedList?.id) {
      return;
    }
    updateListIds([lockedList.id]);
  }, [lockedList?.id]);

  // Dropdown sırası: postCount varsa ona göre azalan, yoksa alfabetik (TR).
  const sortedTagOptions = useMemo(
    () =>
      sortTagsByPostCountDesc(
        tagOptions.map((option) => ({
          ...option,
          postCount: undefined as number | undefined,
        })),
      ),
    [tagOptions],
  );

  const canSubmit = tagData.length > 0 && !isSubmitting;

  function toggleTag(slug: string) {
    const exists = tagData.includes(slug);
    if (exists) {
      updateTags(tagData.filter((item) => item !== slug));
      return;
    }
    if (tagData.length >= MAX_TAGS) {
      return;
    }
    updateTags([...tagData, slug]);
  }

  const rootClass = compact
    ? "grid grid-cols-12 w-full gap-1"
    : "grid grid-cols-12 w-full gap-3 rounded-2xl bg-white";

  return (
    <div className={rootClass}>
      {!hideDescription ? (
      <div className="col-span-12">
        <Textarea
          className={
            compact
              ? "border-0 px-0 text-base min-h-[52px]"
              : "rounded-xl"
          }
          placeholder={t("enterDescription")}
          maxLength={160}
          minRows={compact ? 2 : undefined}
          autosize={compact}
          radius="md"
          size={compact ? "sm" : "md"}
          value={description ?? ""}
          onChange={(event) =>
            onDescriptionChange?.(event.currentTarget.value.slice(0, 160))
          }
          rightSection={
            compact ? undefined : (
              <Tooltip label={t("char160")} position="top-end" withArrow>
                <div>
                  <IconAlertCircle size="1rem" style={{ display: "block", opacity: 0.5 }} />
                </div>
              </Tooltip>
            )
          }
        />
      </div>
      ) : null}
      <div
        className={`w-full ${
          sideBySideTaxonomy && !hideCollections
            ? "col-span-12 sm:col-span-6"
            : "col-span-12"
        }`}
      >
        {tagsLoading ? (
          <div className="flex justify-center py-2">
            <Loader size="sm" />
          </div>
        ) : sortedTagOptions.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">{t("tagsCatalogEmpty")}</p>
        ) : tagPickerAsChips ? (
          <div className="space-y-1.5">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {sortedTagOptions.map((option) => {
                const selected = tagData.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleTag(option.value)}
                    aria-pressed={selected}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      selected
                        ? "border-58b4d1 bg-58b4d1 text-white"
                        : "border-gray-300 text-202124 hover:bg-gray-100"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <MultiSelect
            ref={tagSelectRef}
            data={sortedTagOptions}
            itemComponent={TagSelectItem}
            label={compact ? undefined : t("tags")}
            placeholder={t("selectTagsPlaceholder")}
            description={compact ? undefined : t("tagsSelectAdminOnly")}
            radius="md"
            size={compact ? "sm" : "md"}
            searchable
            nothingFound={t("selectTagsError")}
            value={tagData}
            onChange={updateTags}
            clearable
          />
        )}
      </div>
      {!hideCollections ? (
        <div className={`w-full ${sideBySideTaxonomy ? "col-span-12 sm:col-span-6" : "col-span-12"}`}>
          {destinationsLoading ? (
            <div className="flex justify-center py-2">
              <Loader size="sm" />
            </div>
          ) : collectionOptions.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">
              {t("noCollectionsForPost")} {" "}
              <Link href={profileCollectionsHref} className="text-58b4d1 font-bold">
                {t("collection")}
              </Link>
            </p>
          ) : (
            <MultiSelect
              ref={collectionSelectRef}
              data={collectionOptions}
              label={compact ? undefined : t("selectCollectionsLabel")}
              placeholder={t("selectCollectionsPlaceholder")}
              radius="md"
              size={compact ? "sm" : "md"}
              searchable
              nothingFound={t("selectTagsError")}
              value={collectionData}
              onChange={updateCollectionIds}
              clearable
            />
          )}
        </div>
      ) : null}
      {!hideLists ? (
        <div className="w-full col-span-12">
          {lockedList ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("selectListsLabel")}
              </label>
              <div
                className="flex min-h-[36px] items-center rounded border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-202124"
                aria-readonly
              >
                {lockedList.name}
              </div>
              <p className="mt-1 text-xs text-gray-500">{t("listLockedHint")}</p>
            </div>
          ) : destinationsLoading ? null : listOptions.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">
              {t("noListsForPost")} {" "}
              <Link href="/lists" className="text-58b4d1 font-bold">
                {t("lists")}
              </Link>
            </p>
          ) : (
            <MultiSelect
              ref={listSelectRef}
              data={listOptions}
              label={compact ? undefined : t("selectListsLabel")}
              placeholder={t("selectListsPlaceholder")}
              searchable
              nothingFound={t("selectTagsError")}
              value={listData}
              onChange={updateListIds}
              clearable
            />
          )}
        </div>
      ) : null}
      {!hideSubmit && (
        <div className="col-span-12 flex justify-end pt-1">
          <button
            type="button"
            onClick={onSubmit}
            className={`inline-flex min-h-[40px] min-w-[120px] items-center justify-center rounded-full px-5 text-sm font-semibold tracking-tight transition-colors ${!canSubmit ? "cursor-not-allowed bg-gray-200 text-gray-400" : "bg-58b4d1 text-white hover:bg-[#4aa3c4]"}`}
            disabled={!canSubmit}
          >
            {isSubmitting ? "..." : t("share")}
          </button>
        </div>
      )}
    </div>
  );
}
