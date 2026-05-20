import { Modal, Tabs } from "@mantine/core";
import PostList from "./../contentCenter/post/PostList";
import CollectionListItem from "../profile/CollectionListItem";
import NewCollectionModal from "./NewCollectionModal";
import {
  IconArrowNarrowLeft,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import FeedLoadMoreSentinel from "@/components/FeedLoadMoreSentinel";
import { resolveProfileImageUrl } from "@/src/avatarUrl";
import { pickPostImageUrl } from "@/src/postImageUrl";
import { useClientPaginatedSlice } from "@/src/useClientPaginatedSlice";
import {
  profileCollectionsPath,
  profileLikedPath,
  profilePath,
  resolveCollectionHref,
  type ProfileTab,
} from "@/src/profilePaths";
import { useTranslation } from "react-i18next";
import { createCollection, deleteCollection, updateCollection } from "@/configs/client-services";
import { applySensitiveMetadataToPosts } from "@/src/sensitiveContent";

interface EntryProps {
  category?: number;
  categoryName?: string;
  isSensitive?: boolean;
  commentCount?: number;
  favoriteCount?: number;
  isFavorited?: boolean;
  id: string;
  subject?: string;
  userName?: string;
  createDate?: string;
  image?: string;
  imageUrls?: Record<string, string>;
  profileImage?: string;
  tags?: { slug: string; name: string }[];
}

interface CollectionPostProps {
  id: string;
  category?: number;
  categoryName?: string;
  isSensitive?: boolean;
  commentCount?: number;
  favoriteCount?: number;
  isFavorited?: boolean;
  subject?: string;
  userName?: string;
  createDate?: string;
  image?: string;
  imageUrls?: Record<string, string>;
  profileImage?: string;
  tags?: { slug: string; name: string }[];
}

interface CollectionProps {
  id: string;
  name: string;
  slug?: string;
  link?: string;
  item?: string[];
  count?: number;
  postIds?: number[];
  posts?: CollectionPostProps[];
}

interface ProfileContentProps {
  user?: {
    userName?: string;
    isOwnProfile?: boolean;
    posts?: EntryProps[];
    favoritePosts?: EntryProps[];
    collections?: CollectionProps[];
  };
  activeTab?: ProfileTab;
  readOnly?: boolean;
}

export default function ProfileContent({ user, activeTab = "piklerim", readOnly = false }: ProfileContentProps) {
  const [collectionsOverride, setCollectionsOverride] = useState<CollectionProps[] | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [createCollectionOpened, setCreateCollectionOpened] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [removedPostIds, setRemovedPostIds] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) {
      return;
    }
    applySensitiveMetadataToPosts(user.posts ?? []);
    applySensitiveMetadataToPosts(user.favoritePosts ?? []);
    for (const collection of user.collections ?? []) {
      applySensitiveMetadataToPosts(collection.posts ?? []);
    }
  }, [user]);

  const markPostDeleted = useCallback((postId: string) => {
    setRemovedPostIds((prev) =>
      prev.includes(postId) ? prev : [...prev, postId],
    );
  }, []);

  const withoutRemoved = useCallback(
    <T extends { id: string }>(items: T[]) =>
      items.filter((item) => !removedPostIds.includes(item.id)),
    [removedPostIds],
  );

  const userEntries = useMemo(
    () => withoutRemoved(user?.posts ?? []),
    [user?.posts, withoutRemoved],
  );
  const userFavoriteEntries = useMemo(() => {
    const owner = user?.userName?.trim().toLowerCase() ?? "";
    return withoutRemoved(user?.favoritePosts ?? []).filter((entry) => {
      const author = entry.userName?.trim().toLowerCase() ?? "";
      return author !== owner;
    });
  }, [user?.favoritePosts, user?.userName, withoutRemoved]);
  const userCollections = useMemo(
    () => collectionsOverride ?? user?.collections ?? [],
    [collectionsOverride, user?.collections],
  );
  const selectedCollection = useMemo(
    () => userCollections.find((collection) => collection.id === selectedCollectionId) ?? null,
    [selectedCollectionId, userCollections],
  );

  const profileUserName = user?.userName?.trim() ?? "";
  const collectionPosts = useMemo(
    () => withoutRemoved(selectedCollection?.posts ?? []),
    [selectedCollection?.posts, withoutRemoved],
  );

  const piklerimPaginated = useClientPaginatedSlice({
    items: userEntries,
    resetKey: `piklerim-${profileUserName}`,
  });
  const likedPaginated = useClientPaginatedSlice({
    items: userFavoriteEntries,
    resetKey: `piklediklerim-${profileUserName}`,
  });
  const collectionPaginated = useClientPaginatedSlice({
    items: collectionPosts,
    resetKey: `collection-${selectedCollectionId ?? ""}`,
  });

  const postsHref = profileUserName ? profilePath(profileUserName) : "/";
  const likedHref = profileUserName ? profileLikedPath(profileUserName) : "/";
  const collectionsHref = profileUserName ? profileCollectionsPath(profileUserName) : "/";
  const canManageCollections = Boolean(user?.isOwnProfile && !readOnly);

  const getErrorMessage = (error: unknown, fallback: string) =>
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
      ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || fallback
      : fallback;

  const handleCreateCollection = async (name: string) => {
    try {
      setIsCreatingCollection(true);
      const response = await createCollection(name);
      const collection = response.data?.collection;

      if (!collection) {
        return;
      }

      setCollectionsOverride((currentCollections) => [collection, ...(currentCollections ?? user?.collections ?? [])]);
      setCreateCollectionOpened(false);
    } catch (error) {
      alert(getErrorMessage(error, 'Koleksiyon olusturulamadi.'));
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const handleUpdateCollection = async (collectionId: string, name: string) => {
    try {
      const response = await updateCollection(collectionId, name);
      const updatedCollection = response.data?.collection;

      if (!updatedCollection) {
        return;
      }

      setCollectionsOverride((currentCollections) =>
        (currentCollections ?? user?.collections ?? []).map((collection) =>
          collection.id === updatedCollection.id ? updatedCollection : collection,
        ),
      );
    } catch (error) {
      alert(getErrorMessage(error, 'Koleksiyon guncellenemedi.'));
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await deleteCollection(collectionId);
      setCollectionsOverride((currentCollections) =>
        (currentCollections ?? user?.collections ?? []).filter((collection) => collection.id !== collectionId),
      );
      setSelectedCollectionId((currentId) => (currentId === collectionId ? null : currentId));
    } catch (error) {
      alert(getErrorMessage(error, 'Koleksiyon silinemedi.'));
    }
  };

  return (
    <>
      <Modal opened={createCollectionOpened} onClose={() => setCreateCollectionOpened(false)} centered title={t("createNewCollection")}>
        <NewCollectionModal onCreate={handleCreateCollection} isSubmitting={isCreatingCollection} />
      </Modal>
      <Tabs value={activeTab} className="tab-active mb-4">
        <Tabs.List
          className="w-full justify-around border-b-0 bg-white py-2 font-bold rounded"
          style={{ boxShadow: "rgba(0, 0, 0, 0.15) 0px 5px 15px 0px" }}
        >
          <Tabs.Tab className="px-0 text-58b4d1" value="piklerim">
            <Link href={postsHref} className="block">
              {t("profileMyPiks")}
            </Link>
          </Tabs.Tab>
          <Tabs.Tab className="px-0 text-58b4d1" value="piklediklerim">
            <Link href={likedHref} className="block">
              {t("profileMyLikes")}
            </Link>
          </Tabs.Tab>
          {user?.isOwnProfile && (
            <Tabs.Tab className="px-0 text-58b4d1" value="collection">
              <Link href={collectionsHref} className="block">
                {t("profileMyCollection")}
              </Link>
            </Tabs.Tab>
          )}
        </Tabs.List>
        <Tabs.Panel value="piklerim" pt="lg">
          {piklerimPaginated.visibleItems.map((x) => {
            return (
              <React.Fragment key={x.id}>
                <PostList
                  postId={x.id}
                  userName={x.userName || user?.userName || ''}
                  userLink={`/${x.userName || user?.userName || ''}`}
                  postLink={`/${x.userName || user?.userName || ''}/posts/${x.id}`}
                  profileImage={resolveProfileImageUrl(x.profileImage)}
                  time={x.createDate || ''}
                  image={
                    pickPostImageUrl(x.image, x.imageUrls, "feed") ||
                    `/postExample/Dp-lP3mWkAAinKk.jpg`
                  }
                  commentCount={x.commentCount ?? 0}
                  pikCount={x.favoriteCount ?? 0}
                  isFavorited={x.isFavorited}
                  admin={false}
                  postTitle={x.subject}
                  tags={x.tags}
                  categoryName={x.categoryName}
                  isSensitive={x.isSensitive}
                  profile={true}
                  collectionItem={false}
                  collections={userCollections}
                  onCollectionsChange={setCollectionsOverride}
                  readOnly={readOnly}
                  onDeleted={() => markPostDeleted(x.id)}
                />
              </React.Fragment>
            );
          })}
          <FeedLoadMoreSentinel
            sentinelRef={piklerimPaginated.sentinelRef}
            hasMore={piklerimPaginated.hasMore}
            isLoadingMore={piklerimPaginated.isLoadingMore}
          />
        </Tabs.Panel>
        <Tabs.Panel value="piklediklerim" pt="lg">
        {likedPaginated.visibleItems.map((x) => {
            const authorSlug = x.userName?.trim() || "";
            return (
              <React.Fragment key={x.id}>
                <PostList
                  postId={x.id}
                  userName={authorSlug}
                  userLink={authorSlug ? `/${authorSlug}` : "#"}
                  postLink={authorSlug ? `/${authorSlug}/posts/${x.id}` : "#"}
                  profileImage={resolveProfileImageUrl(x.profileImage)}
                  time={x.createDate || ''}
                  image={
                    pickPostImageUrl(x.image, x.imageUrls, "feed") ||
                    `/postExample/Dp-lP3mWkAAinKk.jpg`
                  }
                  commentCount={x.commentCount ?? 0}
                  pikCount={x.favoriteCount ?? 0}
                  isFavorited={x.isFavorited ?? true}
                  admin={false}
                  postTitle={x.subject}
                  tags={x.tags}
                  categoryName={x.categoryName}
                  isSensitive={x.isSensitive}
                  profile={true}
                  collectionItem={false}
                  collections={userCollections}
                  onCollectionsChange={setCollectionsOverride}
                  readOnly={readOnly}
                  onDeleted={() => markPostDeleted(x.id)}
                />
              </React.Fragment>
            );
          })}
          <FeedLoadMoreSentinel
            sentinelRef={likedPaginated.sentinelRef}
            hasMore={likedPaginated.hasMore}
            isLoadingMore={likedPaginated.isLoadingMore}
          />
        </Tabs.Panel>
        {user?.isOwnProfile && (
          <Tabs.Panel value="collection" pt="lg">
          {!selectedCollection ? (
            <>
              {canManageCollections && (
                <div className="mb-4 flex justify-end">
                  <button onClick={() => setCreateCollectionOpened(true)} className="flex items-center gap-2 rounded bg-58b4d1 px-4 py-2 text-sm font-bold text-white">
                    <IconPlus size={16} />
                    {t("createNewCollection")}
                  </button>
                </div>
              )}
              {userCollections.length === 0 && canManageCollections && (
                <button
                  onClick={() => setCreateCollectionOpened(true)}
                  className="bg-white rounded border border-gray-200 p-5 text-sm text-58b4d1 font-bold w-full text-left"
                >
                  {t("createNewCollection")}
                </button>
              )}
              {userCollections.map((collection) => {
                const postCount =
                  collection.count ??
                  collection.posts?.length ??
                  collection.postIds?.length ??
                  collection.item?.length ??
                  0;
                return (
                <CollectionListItem
                  key={collection.id}
                  canManage={canManageCollections}
                  name={collection.name}
                  link={resolveCollectionHref(profileUserName, collection)}
                  item={collection.item ?? []}
                  count={postCount}
                  onUpdate={(name) => handleUpdateCollection(collection.id, name)}
                  onDelete={() => handleDeleteCollection(collection.id)}
                />
              );
              })}
            </>
          ) : (
            <>
              <div
                className="w-full bg-white rounded mb-4 text-sm text-center min-h-[40px] flex justify-center items-center relative"
                style={{
                  boxShadow: "rgba(33, 35, 38, 0.1) 0px 10px 10px -10px",
                }}
              >
                <button
                  className="absolute left-4 top-2"
                  onClick={() => setSelectedCollectionId(null)}
                >
                  <IconArrowNarrowLeft />
                </button>
                <span className="font-bold text-sm text-126782">
                  {selectedCollection.name}
                </span>
                &nbsp;{t("collectionNameTitle")}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {collectionPaginated.visibleItems.map((post) => (
                  <PostList
                    key={post.id}
                    postId={post.id}
                    userName={post.userName || user?.userName || ''}
                    userLink={`/${post.userName || user?.userName || ''}`}
                    postLink={`/${post.userName || user?.userName || ''}/posts/${post.id}`}
                    profileImage={resolveProfileImageUrl(post.profileImage)}
                    time={post.createDate || ''}
                    image={
                      pickPostImageUrl(post.image, post.imageUrls, "feed") ||
                      `/postExample/F5Z00CEaEAAFPgi.jpg`
                    }
                    commentCount={post.commentCount ?? 0}
                    pikCount={post.favoriteCount ?? 0}
                    isFavorited={post.isFavorited}
                    admin={false}
                    postTitle={post.subject}
                    tags={post.tags}
                    categoryName={post.categoryName}
                    isSensitive={post.isSensitive}
                    profile={true}
                    collectionItem={true}
                    collections={userCollections}
                    onCollectionsChange={setCollectionsOverride}
                    readOnly={readOnly}
                    onDeleted={() => markPostDeleted(post.id)}
                  />
                ))}
                <FeedLoadMoreSentinel
                  sentinelRef={collectionPaginated.sentinelRef}
                  hasMore={collectionPaginated.hasMore}
                  isLoadingMore={collectionPaginated.isLoadingMore}
                />
              </div>
            </>
          )}
          </Tabs.Panel>
        )}
      </Tabs>
    </>
  );
}
