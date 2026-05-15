import Image from "next/image";
import { IconBellRinging, IconMail } from '@tabler/icons-react';
import FollowingModal from "./FollowingModal";
import FollowerModal from "./FollowerModal";
import { Modal } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { pickAvatarUrlFromMap } from "@/src/avatarUrl";
import ProfileSettings from "./ProfileSettings";
import { useTranslation } from "react-i18next";
import { followUser, unfollowUser } from "@/configs/client-services";
import { emitFollowChanged } from "@/src/followChangedEvent";

interface FollowingUserModelProps {
  followedId: string;
  followedUserName: string;
  displayName?: string;
  avatarUrls?: Record<string, string>;
  isFollowing: boolean;
}

interface FollowerUserModelProps {
  followerId: string;
  followerUserName: string;
  displayName?: string;
  avatarUrls?: Record<string, string>;
  isFollowed: boolean;
}

interface ProfileUser {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  userName?: string;
  userDescription?: string;
  phoneNumber?: string;
  birthDate?: string;
  avatarUrls?: Record<string, string>;
  coverUrls?: Record<string, string>;
  coverImageUrl?: string | null;
  followedCount?: number;
  followersCount?: number;
  followeds?: unknown[];
  followers?: unknown[];
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  followsYou?: boolean;
}

interface ProfileHeaderProps {
  user?: ProfileUser;
  onProfileUpdated?: () => void;
}

export default function ProfileHeader({ user, onProfileUpdated }: ProfileHeaderProps) {
  const [followingOpened, setFollowingOpened] = useState(false);
  const [followerOpened, setFollowerOpened] = useState(false);
  const [notification, setNotification] = useState(false);
  const [relationState, setRelationState] = useState(() => ({
    followedCount: user?.followedCount,
    followersCount: user?.followersCount,
    followeds: user?.followeds,
    followers: user?.followers,
    isOwnProfile: user?.isOwnProfile,
    isFollowing: user?.isFollowing,
    followsYou: user?.followsYou,
  }));

  useEffect(() => {
    if (!user?.userName) return;
    setRelationState({
      followedCount: user.followedCount,
      followersCount: user.followersCount,
      followeds: user.followeds,
      followers: user.followers,
      isOwnProfile: user.isOwnProfile,
      isFollowing: user.isFollowing,
      followsYou: user.followsYou,
    });
  }, [
    user?.userName,
    user?.followedCount,
    user?.followersCount,
    user?.followeds,
    user?.followers,
    user?.isOwnProfile,
    user?.isFollowing,
    user?.followsYou,
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewerUserName, setViewerUserName] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const { t } = useTranslation();
  const profileUser = {
    ...user,
    ...relationState,
  };

  useEffect(() => {
    if (relationState.isFollowing !== true) {
      setNotification(false);
    }
  }, [relationState.isFollowing]);

  /** Oturum kullanıcısı yüklendikten sonra karşılaştırma en güvenilir; yüklenene kadar API alanı (önbellek hatasına açık) kullanılır. */
  const isOwnProfile = useMemo(() => {
    const pageUser = profileUser?.userName?.trim();
    if (!pageUser) return false;
    if (!viewerReady) {
      return Boolean(profileUser?.isOwnProfile);
    }
    if (!viewerUserName?.trim()) {
      return false;
    }
    return (
      viewerUserName.trim().toLowerCase() === pageUser.toLowerCase()
    );
  }, [
    viewerReady,
    viewerUserName,
    profileUser?.userName,
    profileUser?.isOwnProfile,
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadViewerProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
          cache: "no-store",
        });

        if (!isMounted) return;

        if (!response.ok) {
          setViewerUserName(null);
          setViewerReady(true);
          return;
        }

        const data = await response.json();

        if (!isMounted) return;

        setViewerUserName(
          typeof data?.userName === "string" ? data.userName : null,
        );
        setViewerReady(true);
      } catch {
        if (isMounted) {
          setViewerUserName(null);
          setViewerReady(true);
        }
      }
    };

    void loadViewerProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFollowToggle = async () => {
    if (!profileUser?.userName || isOwnProfile || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = profileUser.isFollowing
        ? await unfollowUser(profileUser.userName)
        : await followUser(profileUser.userName);

      const relation = response.data?.relation;

      if (!relation) {
        return;
      }

      setRelationState((currentState) => ({
          ...currentState,
          followedCount: relation.followedCount,
          followersCount: relation.followersCount,
          followeds: relation.followeds,
          followers: relation.followers,
          isOwnProfile: relation.isOwnProfile,
          isFollowing: relation.isFollowing,
          followsYou: relation.followsYou,
      }));

      if (profileUser?.userName && typeof relation.isFollowing === "boolean") {
        emitFollowChanged(profileUser.userName, relation.isFollowing);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const rawCover =
    typeof profileUser?.coverUrls?.full === "string"
      ? profileUser.coverUrls.full.trim()
      : "";
  const fromFlat =
    typeof profileUser?.coverImageUrl === "string"
      ? profileUser.coverImageUrl.trim()
      : "";
  const coverBgUrl =
    rawCover !== "" ? rawCover : fromFlat !== "" ? fromFlat : "/coverExample.jpg";

  return (
    <>
      <section>
        <div
          key={coverBgUrl}
          className="w-full bg-cover min-h-[200px] bg-center bg-no-repeat mb-4 flex justify-center items-center relative before:w-full before:h-full before:absolute before:top-0 before-left-0 before:bg-opacity-50 before:bg-black z-0 rounded-tr rounded-tl overflow-hidden"
          style={{ backgroundImage: `url(${coverBgUrl})` }}
        >
        </div>
        <div className="flex flex-col relative z-1 justify-center items-start lg:items-center -mt-4 pl-4 lg:pl-0 bg-white pb-2">
          <div className="group relative rounded-full w-28 border-2 border-white -mt-12 overflow-hidden">
            <Image alt="" width={300} height={300} src={pickAvatarUrlFromMap(profileUser?.avatarUrls)} className="w-full h-28 object-cover" />
          </div>
          <div className="w-full text-left lg:text-center font-bold text-base mt-2 text-202124 relative">{profileUser?.displayName || `${profileUser?.firstName || ""} ${profileUser?.lastName || ""}`.trim() || profileUser?.userName}</div>
          <div className="w-full text-left lg:text-center font-bold text-xs mt-0 text-343a40">@{profileUser?.userName}</div>
          {profileUser?.followsYou && !isOwnProfile && (
            <div className="mt-2 inline-flex items-center rounded-full bg-e8f6fb px-3 py-1 text-[11px] font-bold text-58b4d1">
              {t("followedYou")}
            </div>
          )}
          <div className="absolute top-4 right-4 gap-2 justify-center items-center flex">
            {isOwnProfile && (
              <ProfileSettings profileUser={user} onProfileUpdated={onProfileUpdated} />
            )}
            {!isOwnProfile && (
              <>
                {profileUser?.isFollowing === true && (
                  <>
                    {notification ? (
                      <button
                        type="button"
                        onClick={() => setNotification(false)}
                        title={t("closeNotification")}
                        className="flex items-center justify-center rounded text-sm font-bold text-58b4d1"
                      >
                        <IconBellRinging size={20} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setNotification(true)}
                        title={t("openNotification")}
                        className="flex items-center justify-center rounded text-sm font-bold text-202124"
                      >
                        <IconBellRinging size={20} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="flex items-center justify-center rounded text-sm font-bold text-202124"
                      title={t("sendMessage")}
                    >
                      <IconMail size={20} />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => void handleFollowToggle()}
                  disabled={isSubmitting}
                  className={`${profileUser?.isFollowing ? "bg-58b4d1 text-white" : "border border-58b4d1 text-58b4d1 hover:bg-58b4d1 hover:text-white"} flex min-h-[30px] min-w-[110px] items-center justify-center rounded text-sm font-bold disabled:opacity-60`}
                  title={profileUser?.isFollowing ? t("unfollow") : t("follow")}
                >
                  {profileUser?.isFollowing ? t("unfollow") : t("follow")}
                </button>
              </>
            )}
          </div>
          <div className="w-full text-sm mt-2 lg:mt-1 italic text-202124 text-left lg:text-center pr-5 lg:px-5">{profileUser?.userDescription}</div>
          <div className="flex gap-4 mt-2 lg:mt-1">
            <button onClick={() => setFollowingOpened(true)} className="text-sm">
              <span className="font-bold">{profileUser?.followedCount ?? 0}</span> {t("followCount")}
            </button>
            <Modal opened={followingOpened} onClose={() => setFollowingOpened(false)} centered title={t("followModalTitle")}>
              <FollowingModal followeds={(profileUser?.followeds ?? []) as FollowingUserModelProps[]} />
            </Modal>
            <button onClick={() => setFollowerOpened(true)} className="text-sm">
              <span className="font-bold">{profileUser?.followersCount ?? 0}</span> {t("followerCount")}
            </button>
            <Modal opened={followerOpened} onClose={() => setFollowerOpened(false)} centered title={t("followerModalTitle")}>
              <FollowerModal followers={(profileUser?.followers ?? []) as FollowerUserModelProps[]} />
            </Modal>
          </div>
        </div>
      </section>
    </>
  )
}
