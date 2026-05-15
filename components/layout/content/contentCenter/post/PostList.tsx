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
  onCollectionsChange?: (collections: {
    id: string;
    name: string;
    link?: string;
    item?: string[];
    count?: number;
    postIds?: number[];
    posts?: { id: string }[];
  }[]) => void
}

export default function PostList({ postId, userName, userLink, postLink, time, image, commentCount, pikCount, isFavorited, admin, postTitle, profileImage, profile, authorIsFollowing = false, collectionItem, tags = [], collections, onCollectionsChange }: PostListProps) {
  const [reportOpened, setReportOpened] = useState(false);
  const [tagOpened, setTagOpened] = useState(false);
  const [opened, { toggle }] = useDisclosure(false);
  const [openDraw, { open, close }] = useDisclosure(false);
  const [liveCommentCount, setLiveCommentCount] = useState(commentCount);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setLiveCommentCount(commentCount);
  }, [commentCount]);
  return (
    <>
      <div className={`bg-white rounded-xl overflow-hidden post-item ${!collectionItem ? 'mb-4' : ''} border border-gray-200`}>
      <Spoiler maxHeight={500} showLabel={t("showAll")} hideLabel={t("hide")}>
        <div className="overflow-hidden relative">
          <Link href={postLink} className=" overflow-hidden block">
            <div className="absolute w-full h-full z-5"></div>
            <Image alt="profile" width={740} height={200} className="m-auto max-h-[1000px] w-full" src={image} />
          </Link>
          <div className="absolute bottom-4 right-4">
            <Popover width={150} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <button>
                  <div className="bg-58b4d1 text-white w-6 h-6 flex justify-center items-center rounded">
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
          <div className="flex flex-row justify-between pb-3 px-4 mt-4 border-b">
            <div className="flex flex-row items-center gap-2">
              <Link href={userLink} className="flex flex-row items-center gap-2">
                <Image alt="profile" src={resolveProfileImageUrl(profileImage)} width={400} height={400} className="w-9 rounded-full object-cover bg-white" style={{ boxShadow: 'rgba(0, 0, 0, 0.15) 0px 5px 15px 0px' }} />
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
              {!profile && userName ? (
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
          />
          <button className="flex items-center gap-1 text-sm" onClick={toggle}>
            <IconMessageCircle size={20} stroke={1.0} />
            <span className="hidden lg:inline-block text-gray-500 font-bold">{liveCommentCount}</span>
          </button>
          <button onClick={open} className="flex items-center gap-1 text-sm">
            <IconBookmarkPlus size={20} stroke={1.0} />
            <span className="hidden lg:inline-block"></span>
          </button>
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
          <div className="ml-auto flex gap-2">
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
            <PostShare postLink={postLink} postTitle={postTitle} imageUrl={image} />
            <button className="flex items-center gap-1 text-sm text-126782" onClick={() => setReportOpened(true)}>
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
        <Collapse in={opened} className="w-full">
          <PostCollapse postId={postId} onCommentCountChange={setLiveCommentCount} />
        </Collapse>
      </div>
    </>
  )
}
