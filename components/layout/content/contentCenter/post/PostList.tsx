import { IconAdFilled, IconAlarm, IconInfoTriangle, IconMessageCircle, IconBrandMailgun, IconBookmarkPlus, IconTags, IconWriting } from "@tabler/icons-react";
import TagModal, { type PostTagItem } from "./TagModal";
import Image from "next/image";
import Link from "next/link";
import { Tooltip, Modal, Collapse, Drawer, Popover, Spoiler, Tabs } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import PostCollapse from "./PostCollapse";
import CollapseCollectionList from "./CollapseCollectionList";
import AddToListDrawer from "./AddToListDrawer";
import PostShare from "./PostShare";
import ReportModal from "./ReportModal";
import PostPikiToggle from "./PostPikiToggle";
import { useTranslation } from "react-i18next";
import { resolveProfileImageUrl } from "@/src/avatarUrl";
import { formatRelativeTime } from "@/src/formatRelativeTime";
import FollowToggle from "@/components/shared/FollowToggle";
import SensitivePostMedia from "@/components/SensitivePostMedia";
import { shouldGatePost } from "@/src/sensitiveContent";

interface PostListProps {
  postId?: string,
  userName: string,
  userLink: string,
  profileImage: string,
  postLink: string,
  time: string | number,
  image: string,
  commentCount: number
  pikCount: number
  isFavorited?: boolean
  admin: boolean
  postTitle?: string
  profile: boolean
  authorIsFollowing?: boolean
  collectionItem: boolean
  collections?: {
    id: string;
    name: string;
    link?: string;
    item?: string[];
    count?: number;
    postIds?: number[];
    posts?: { id: string }[];
  }[]
  tags?: PostTagItem[]
  categoryName?: string
  isSensitive?: boolean
  onCollectionsChange?: (collections: {
    id: string;
    name: string;
    link?: string;
    item?: string[];
    count?: number;
    postIds?: number[];
    posts?: { id: string }[];
  }[]) => void
  /** Misafir: beğeni, yorum, koleksiyon vb. kapalı */
  readOnly?: boolean
  onDeleted?: () => void
}

export default function PostList({ postId, userName, userLink, postLink, time, image, commentCount, pikCount, isFavorited, admin, postTitle, profileImage, profile, authorIsFollowing = false, collectionItem, tags = [], categoryName, isSensitive, collections, onCollectionsChange, readOnly = false, onDeleted }: PostListProps) {
  const [reportOpened, setReportOpened] = useState(false);
  const [tagOpened, setTagOpened] = useState(false);
  const [opened, { toggle }] = useDisclosure(false);
  const [openDraw, { open, close }] = useDisclosure(false);
  const [liveCommentCount, setLiveCommentCount] = useState(commentCount);
  const [shareUnlocked, setShareUnlocked] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setLiveCommentCount(commentCount);
  }, [commentCount]);

  useEffect(() => {
    setShareUnlocked(false);
  }, [postId]);

  const shareImageUrl =
    shareUnlocked ||
    !shouldGatePost(postId, { tags, categoryName, isSensitive })
      ? image
      : undefined;

  return (
    <>
      <div className={`post-item overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover ${!collectionItem ? 'mb-5' : ''}`}>
      <Spoiler maxHeight={510} showLabel={t("showAll")} hideLabel={t("hide")}>
        <div className="overflow-hidden relative">
          <SensitivePostMedia
            postId={postId}
            tags={tags}
            categoryName={categoryName}
            isSensitive={isSensitive}
            variant="feed"
            onRevealed={() => setShareUnlocked(true)}
          >
            <Link href={postLink} className="overflow-hidden block">
              <div className="absolute w-full h-full z-5" />
              <Image
                alt="profile"
                width={740}
                height={200}
                sizes="(max-width: 1024px) 100vw, 740px"
                className="m-auto max-h-[1000px] w-full"
                src={image}
              />
            </Link>
          </SensitivePostMedia>
          <div className="absolute top-3 right-3 z-10">
            <Popover width={150} position="bottom-end" withArrow shadow="md">
              <Popover.Target>
                <button>
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-58b4d1 text-white shadow-sm">
                    <IconWriting size={16} stroke={1.5} />
                  </div>
                </button>
              </Popover.Target>
              <Popover.Dropdown>
                {postTitle}
              </Popover.Dropdown>
            </Popover>
          </div>
        </div>
        </Spoiler>
        {!collectionItem &&
          <div className="mt-4 flex flex-row justify-between border-b border-gray-100 px-4 pb-3">
            <div className="flex flex-row items-center gap-2">
              <Link href={userLink} className="flex flex-row items-center gap-2">
                <Image alt="profile" src={resolveProfileImageUrl(profileImage)} width={400} height={400} className="h-9 w-9 shrink-0 rounded-full border border-gray-100 bg-white object-cover shadow-sm ring-2 ring-white" />
                <span className="text-xs font-bold flex items-center text-58b4d1">
                  <IconBrandMailgun size={20} />
                  {userName}
                </span>
              </Link>
              {admin &&
                <Tooltip label="Yönetici">
                  <IconAdFilled size={15} className="-ml-1 text-202124" />
                </Tooltip>
              }
              {!profile && userName && !readOnly ? (
                <FollowToggle
                  userName={userName}
                  initialIsFollowing={authorIsFollowing}
                  variant="inline"
                />
              ) : null}
            </div>
            <Link href={postLink} className="text-343a40 font-light flex items-center text-xs gap-1">&nbsp; <IconAlarm size={12} /> {formatRelativeTime(time, i18n.language)}</Link>
          </div>
        }

        {postTitle && (
          <div className="px-4 pt-3 text-sm leading-6 text-202124 break-words">
            {postTitle}
          </div>
        )}

        <div className="flex gap-3 p-2 justify-start min-h-[30px] lg:min-h-[40px] items-center px-4 pb-2 pt-3">
          <PostPikiToggle
            postId={postId}
            favoriteCount={pikCount}
            isFavorited={isFavorited}
            variant="compact"
            readOnly={readOnly}
          />
          <button type="button" className={`flex items-center gap-1 text-sm ${readOnly ? "cursor-not-allowed opacity-50" : ""}`} disabled={readOnly} onClick={readOnly ? undefined : toggle}>
            <IconMessageCircle size={20} stroke={1.0} />
            <span className="hidden lg:inline-block text-gray-500 font-bold">{liveCommentCount}</span>
          </button>
          {readOnly ? null : (
          <button type="button" onClick={open} className="flex items-center gap-1 text-sm">
            <IconBookmarkPlus size={20} stroke={1.0} />
            <span className="hidden lg:inline-block"></span>
          </button>
          )}
          {readOnly ? null : (
          <Drawer opened={openDraw} onClose={close} title={t("profileMyCollection")} size="md">
            <Tabs defaultValue="collection">
              <Tabs.List className="mb-3">
                <Tabs.Tab value="collection">{t("collection")}</Tabs.Tab>
                <Tabs.Tab value="list">{t("lists")}</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="collection">
                <CollapseCollectionList postId={postId} collections={collections} onCollectionsChange={onCollectionsChange} opened={openDraw} />
              </Tabs.Panel>
              <Tabs.Panel value="list">
                <AddToListDrawer postId={postId} opened={openDraw} />
              </Tabs.Panel>
            </Tabs>
          </Drawer>
          )}
          <div className={`ml-auto flex gap-2 ${readOnly ? "hidden" : ""}`}>
            {tags.length > 0 && (
              <>
                <button type="button" onClick={() => setTagOpened(true)} className="flex items-center gap-1 text-sm" aria-label={t("tags")}>
                  <IconTags size={20} stroke={1.0} />
                </button>
                <Modal opened={tagOpened} onClose={() => setTagOpened(false)} centered title={t("tags")}>
                  <TagModal tags={tags} />
                </Modal>
              </>
            )}
            <PostShare
              postLink={postLink}
              postTitle={postTitle}
              imageUrl={shareImageUrl}
              postId={postId}
              authorUserName={userName}
              onDeleted={onDeleted}
            />
            <button type="button" className="flex items-center gap-1 text-sm text-126782" onClick={() => setReportOpened(true)}>
              <IconInfoTriangle size={20} stroke={1.0} />
            </button>
            <Modal opened={reportOpened} onClose={() => setReportOpened(false)} centered title={t("Report")}>
              <ReportModal
                postId={postId}
                postLink={postLink}
                onSubmitted={() => setReportOpened(false)}
              />
            </Modal>
          </div>
        </div>
        <Collapse in={readOnly ? false : opened} className="w-full">
          <PostCollapse postId={postId} onCommentCountChange={setLiveCommentCount} />
        </Collapse>
      </div>
    </>
  )
}
