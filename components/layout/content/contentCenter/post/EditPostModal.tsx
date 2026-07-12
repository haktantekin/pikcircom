import { Modal, Textarea, Checkbox, Button, ScrollArea } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { updatePost, getCollections } from "@/configs/client-services";

interface CollectionItem {
  id: string;
  name: string;
  postIds?: number[];
}

interface EditPostModalProps {
  postId: string;
  currentDescription: string;
  opened: boolean;
  onClose: () => void;
  onSaved?: (data: { description: string; collectionIds: string[] }) => void;
}

export default function EditPostModal({
  postId,
  currentDescription,
  opened,
  onClose,
  onSaved,
}: EditPostModalProps) {
  const { t } = useTranslation();
  const [description, setDescription] = useState(currentDescription);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!opened) {
      return;
    }
    setDescription(currentDescription);
  }, [opened, currentDescription]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    let cancelled = false;

    const loadCollections = async () => {
      setIsLoading(true);
      try {
        const res = await getCollections();
        const items: CollectionItem[] = res.data?.collections ?? [];
        if (cancelled) return;
        setCollections(items);

        const postIdNum = Number(postId);
        const selected = items
          .filter((c) => c.postIds?.includes(postIdNum))
          .map((c) => c.id);
        setSelectedCollectionIds(selected);
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

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await updatePost(postId, {
        description,
        collectionIds: selectedCollectionIds.map(Number),
      });
      onSaved?.({ description, collectionIds: selectedCollectionIds });
      onClose();
    } catch {
      alert(t("postUpdateError"));
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, postId, description, selectedCollectionIds, onSaved, onClose, t]);

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

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="default" onClick={onClose} disabled={isSaving}>
          {t("cancel")}
        </Button>
        <Button onClick={() => void handleSave()} loading={isSaving}>
          {t("save")}
        </Button>
      </div>
    </Modal>
  );
}
