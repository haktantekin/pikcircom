import { IconAdFilled, IconAlarm, IconInfoTriangle, IconBrandMailgun, IconBookmarkPlus } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { Tooltip, Modal, Drawer } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import PikModal from "../contentCenter/post/PikModal";
import CollapseCollectionList from "../contentCenter/post/CollapseCollectionList";
import PostShare from "../contentCenter/post/PostShare";
import ReportModal from "../contentCenter/post/ReportModal";
import PostCollapse from "../contentCenter/post/PostCollapse";
import PostPikiToggle from "../contentCenter/post/PostPikiToggle";
import { useTranslation } from "react-i18next";
import { resolveProfileImageUrl } from "@/src/avatarUrl";
import { formatRelativeTime } from "@/src/formatRelativeTime";


interface PostItemProps {
  postId?: string,
  userName: string,
  userLink: string,
  profileImage: string,
  time: string | number,
  image: string,
  commentCount: number
  pikCount: number
  isFavorited?: boolean
  admin: boolean
  postTitle?: string
  collections?: {
    id: string;
    name: string;
    link?: string;
    item?: string[];
    count?: number;
    postIds?: number[];
    posts?: { id: string }[];
  }[]
  onCollectionsChange?: (collections: {
    id: string;
    name: string;
    link?: string;
    item?: string[];
    count?: number;
    postIds?: number[];
    posts?: { id: string }[];
  }[]) => void
  postLink?: string;
}

export default function PostItem({ postId, userName, userLink, postLink, time, image, commentCount, pikCount, isFavorited, admin, postTitle, profileImage, collections, onCollectionsChange }: PostItemProps) {
  const [pikOpened, setPikOpened] = useState(false);
  const [reportOpened, setReportOpened] = useState(false);
  const [openDraw, { open, close }] = useDisclosure(false);
  const [liveCommentCount, setLiveCommentCount] = useState(commentCount);
  const [livePikCount, setLivePikCount] = useState(pikCount);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setLiveCommentCount(commentCount);
  }, [commentCount]);

  useEffect(() => {
    setLivePikCount(pikCount);
  }, [postId, pikCount]);
  return (
    <>
      <div className={`bg-white rounded mt-3 border border-gray-200`}>
        <div className="flex flex-row justify-between border-b p-4 mt-0">
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
            <Link href={"javascript:;"} className="flex flex-row ml-0 text-343a40 text-xs">{t("followUp")}</Link>
          </div>
          <div className="text-343a40 font-light flex items-center text-sm gap-1">
            <IconAlarm size={10} /> {formatRelativeTime(time, i18n.language)}
          </div>
        </div>

        <div className="overflow-hidden relative post-item">
          <div className="overflow-hidden block">
            <div className="absolute w-full h-full z-5"></div>
            <Image alt="profile" width={740} height={200} className="w-full m-auto max-h-[1000px]" src={image} />
          </div>
        </div>
        <div className={`flex flex-col items-start p-4`}>
          {postTitle && <div className={`flex flex-col items-start text-sm text-343a40 lowercase`}>{postTitle}</div>}
        </div>
        <div className="flex gap-5 p-4 justify-start min-h-[30px] lg:min-h-[40px] items-center border-t ">
          <div className="flex justify-between gap-2 lg:gap-4 items-center flex-col lg:flex-row ">
            <div className="flex gap-2 border-b border-58b4d1 border-dashed">
              <button type="button" className="flex gap-1 items-center text-sm" onClick={() => setPikOpened(true)}>
                <span className="font-bold text-58b4d1">{livePikCount}</span>{" "}
                <span className="font-bold text-58b4d1">Pik</span>
              </button>
              <Modal opened={pikOpened} onClose={() => setPikOpened(false)} centered title={t("picker")}>
                <PikModal postId={postId} opened={pikOpened} />
              </Modal>
            </div>
          </div>
          <PostPikiToggle
            postId={postId}
            favoriteCount={livePikCount}
            isFavorited={isFavorited}
            variant="labeled"
            onFavoriteMetaChange={({ favoriteCount }) => setLivePikCount(favoriteCount)}
          />
          <button onClick={open} className="flex items-center gap-1 text-sm">
            <IconBookmarkPlus size={20} stroke={1.0} />
            <span className="hidden lg:inline-block">{t("addCollection")}</span>
          </button>
          <Drawer opened={openDraw} onClose={close} title={t("collection")}>
            <CollapseCollectionList postId={postId} collections={collections} onCollectionsChange={onCollectionsChange} opened={openDraw} />
          </Drawer>
          <div className="ml-auto flex gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-500 font-bold">
              {liveCommentCount}
            </div>
            <PostShare
              postLink={postLink ?? userLink}
              postTitle={postTitle}
              imageUrl={image}
            />
            <button className="flex items-center gap-1 text-sm text-126782" onClick={() => setReportOpened(true)}>
              <IconInfoTriangle size={20} stroke={1.0} />
            </button>
            <Modal opened={reportOpened} onClose={() => setReportOpened(false)} centered title={t("report")}>
              <ReportModal
                postId={postId}
                postLink={postLink ?? userLink}
                onSubmitted={() => setReportOpened(false)}
              />
            </Modal>
          </div>
        </div>

        <PostCollapse postId={postId} onCommentCountChange={setLiveCommentCount} />
      </div>
    </>
  )
}
