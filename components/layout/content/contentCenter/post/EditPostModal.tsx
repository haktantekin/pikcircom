import { Modal, Textarea, Checkbox, ScrollArea } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { updatePost, getCollections, getTags } from "@/configs/client-services";

interface CollectionItem {
  id: string;
  name: string;
  postIds?: number[];
}

interface TagItem {
  slug: string;
  name: string;
  imageUrl?: string;
}

interface EditPostModalProps {
  postId: string;
  currentDescription: string;
  currentTags?: TagItem[];
  opened: boolean;
  onClose: () => void;
  onSaved?: (data: { description: string; collectionIds: string[]; tags: TagItem[] }) => void;
}

export default function EditPostModal({
  postId,
  currentDescription,
  currentTags = [],
  opened,
  onClose,
  onSaved,
}: EditPostModalProps) {
  const { t } = useTranslation();
  const [description, setDescription] = useState(currentDescription);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!opened) {
      return;
    }
    setDescription(currentDescription);
    setSelectedTagSlugs(currentTags.map((t) => t.slug));
  }, [opened, currentDescription, currentTags]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    let cancelled = false;

    const loadCollections = async () => {
      setIsLoading(true);
      try {
        const [collRes, tagRes] = await Promise.all([getCollections(), getTags()]);
        if (cancelled) return;

        const items: CollectionItem[] = collRes.data?.collections ?? [];
        setCollections(items);

        const postIdNum = Number(postId);
        const selected = items
          .filter((c) => c.postIds?.includes(postIdNum))
          .map((c) => c.id);
        setSelectedCollectionIds(selected);

        const tags: TagItem[] = tagRes.data?.tags ?? [];
        setAllTags(tags);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadCollections().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [opened, postId]);

  const toggleCollection = useCallback((collId: string) => {
    setSelectedCollectionIds((prev) =>
      prev.includes(collId) ? prev.filter((id) => id !== collId) : [...prev, collId],
    );
  }, []);

  const toggleTag = useCallback((slug: string) => {
    setSelectedTagSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length < 5 ? [...prev, slug] : prev,
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await updatePost(postId, {
        description,
        collectionIds: selectedCollectionIds.map(Number),
        tags: selectedTagSlugs,
      });
      const savedTags = allTags.filter((t) => selectedTagSlugs.includes(t.slug));
      onSaved?.({ description, collectionIds: selectedCollectionIds, tags: savedTags });
      onClose();
    } catch {
      alert(t("postUpdateError"));
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, postId, description, selectedCollectionIds, selectedTagSlugs, allTags, onSaved, onClose, t]);

  return (
    <Modal opened={opened} onClose={onClose} title={t("editPost")} centered size="md">
      <Textarea
        label={t("description")}
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        autosize
        minRows={3}
        maxRows={8}
        mb="md"
      />

      <div className="mb-3">
        <label className="block text-sm font-medium mb-2">{t("collections")}</label>
        {isLoading ? (
          <p className="text-sm text-gray-500">{t("loading")}</p>
        ) : collections.length === 0 ? (
          <p className="text-sm text-gray-500">{t("noCollections")}</p>
        ) : (
          <ScrollArea.Autosize mah={200}>
            {collections.map((coll) => (
              <Checkbox
                key={coll.id}
                label={coll.name}
                checked={selectedCollectionIds.includes(coll.id)}
                onChange={() => toggleCollection(coll.id)}
                mb="xs"
              />
            ))}
          </ScrollArea.Autosize>
        )}
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-2">{t("tags")}</label>
        {isLoading ? (
          <p className="text-sm text-gray-500">{t("loading")}</p>
        ) : allTags.length === 0 ? (
          <p className="text-sm text-gray-500">&mdash;</p>
        ) : (
          <ScrollArea.Autosize mah={200}>
            {allTags.map((tag) => (
              <Checkbox
                key={tag.slug}
                label={tag.name}
                checked={selectedTagSlugs.includes(tag.slug)}
                onChange={() => toggleTag(tag.slug)}
                mb="xs"
              />
            ))}
          </ScrollArea.Autosize>
        )}
        {selectedTagSlugs.length >= 5 && (
          <p className="text-xs text-gray-400 mt-1">{t("maxTagsReached")}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          className="px-4 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          onClick={onClose}
          disabled={isSaving}
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded bg-58b4d1 text-white text-sm font-bold hover:opacity-90 disabled:opacity-50"
          onClick={() => void handleSave()}
          disabled={isSaving}
        >
          {isSaving ? "..." : t("save")}
        </button>
      </div>
    </Modal>
  );
}
