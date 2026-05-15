import Link from "next/link";
import { Modal, ScrollArea } from '@mantine/core';
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from 'react';
import NewCollectionModal from '../../profile/NewCollectionModal';
import { addPostToCollection, createCollection, getCollections } from '@/configs/client-services';

interface CollectionPostItem {
  id: string;
}

interface CollectionItem {
  id: string;
  name: string;
  link?: string;
  item?: string[];
  count?: number;
  postIds?: number[];
  posts?: CollectionPostItem[];
}

interface CollapseCollectionListProps {
  postId?: string;
  collections?: CollectionItem[];
  onCollectionsChange?: (collections: CollectionItem[]) => void;
  opened?: boolean;
}

export default function CollapseCollectionList({ postId, collections, onCollectionsChange, opened = true }: CollapseCollectionListProps) {
  const { t } = useTranslation();
  const [internalCollections, setInternalCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [submittingCollectionId, setSubmittingCollectionId] = useState<string | null>(null);

  const collectionItems = useMemo(
    () => (collections !== undefined ? collections : internalCollections),
    [collections, internalCollections],
  );

  const syncCollections = useCallback((nextCollections: CollectionItem[]) => {
    if (collections === undefined) {
      setInternalCollections(nextCollections);
    }

    onCollectionsChange?.(nextCollections);
  }, [collections, onCollectionsChange]);

  const loadCollections = useCallback(async () => {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await getCollections();
      syncCollections(response.data?.collections ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, syncCollections]);

  useEffect(() => {
    if (!opened) {
      return;
    }

    loadCollections().catch(() => {
      return;
    });
  }, [loadCollections, opened]);

  const handleCreateCollection = async (name: string) => {
    try {
      setIsCreating(true);
      const response = await createCollection(name);
      const createdCollection = response.data?.collection;

      if (!createdCollection) {
        return;
      }

      syncCollections([createdCollection, ...collectionItems]);
      setIsCreateOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddPost = async (collectionId: string) => {
    if (!postId || submittingCollectionId) {
      return;
    }

    try {
      setSubmittingCollectionId(collectionId);
      const response = await addPostToCollection(collectionId, postId);
      const updatedCollection = response.data?.collection;

      if (!updatedCollection) {
        return;
      }

      syncCollections(
        collectionItems.map((collection) =>
          collection.id === updatedCollection.id ? updatedCollection : collection,
        ),
      );
    } finally {
      setSubmittingCollectionId(null);
    }
  };

  const handleOpenCreateModal = async () => {
    setIsCreateOpen(true);

    try {
      await loadCollections();
    } catch {
      return;
    }
  };

  return (
    <>
      <Modal opened={isCreateOpen} onClose={() => setIsCreateOpen(false)} centered title={t("createNewCollection")}>
        <NewCollectionModal onCreate={handleCreateCollection} isSubmitting={isCreating} />
      </Modal>
      <ScrollArea h={700}>
        <ul>
          {opened && collectionItems.length === 0 && !isLoading && (
            <li className="border-b py-4 text-sm text-343a40">{t("createNewCollection")}</li>
          )}
          {collectionItems.map((collection) => {
            const collectionPostIds = collection.postIds ?? collection.posts?.map((post) => Number(post.id)) ?? [];
            const alreadyAdded = postId ? collectionPostIds.includes(Number(postId)) : false;

            return (
              <li className="flex justify-between border-b items-center min-h-[50px]" key={collection.id}>
                <Link href={"javascript:;"} className="flex flex-row items-center text-sm font-bold gap-2">
                  {collection.name}
                </Link>
                <div className="ml-auto">
                  <button
                    onClick={() => handleAddPost(collection.id)}
                    disabled={!postId || alreadyAdded || submittingCollectionId === collection.id}
                    className={`${alreadyAdded ? 'bg-003049' : 'bg-58b4d1'} p-2 rounded font-bold text-white text-xs disabled:opacity-70`}>
                    {alreadyAdded ? t("alreadyAdded") : submittingCollectionId === collection.id ? '...' : t("add")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <button onClick={handleOpenCreateModal} className="font-bold text-58b4d1 text-sm mt-2 w-full text-center">{t("createNewCollection")}</button>
      </ScrollArea>
    </>
  )
}
