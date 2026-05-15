import { IconBrandMailgun } from "@tabler/icons-react";
import Link from "next/link";
import { ScrollArea } from "@mantine/core";
import { useTranslation } from "react-i18next";
import FollowModalAvatar from "./FollowModalAvatar";

interface FollowerUserModelProps {
  followerId: string;
  followerUserName: string;
  displayName?: string;
  avatarUrls?: Record<string, string>;
  isFollowed: boolean;
}

interface FollowerModalProps {
  followers: FollowerUserModelProps[];
}

export default function FollowerModal({ followers }: FollowerModalProps) {
  const { t } = useTranslation();
  return (
    <>
      <ScrollArea h={250}>
        <ul>
          {followers &&
            followers.map((follower, index) => {
              return (
                <li
                  className="flex justify-between border-b items-center min-h-[50px]"
                  key={`${follower.followerId}-${follower.followerUserName}`}
                >
                  <Link
                    href={`/${encodeURIComponent(follower.followerUserName)}`}
                    className="flex flex-row items-center gap-2"
                  >
                    <FollowModalAvatar
                      avatarUrls={follower.avatarUrls}
                      userName={follower.followerUserName}
                    />
                    <span className="text-xs font-bold flex items-center text-343a40 gap-[2px]">
                      <IconBrandMailgun size={20} /> {follower.followerUserName}
                    </span>
                  </Link>
                  <div className="ml-auto">
                    <button className="bg-58b4d1 p-2 rounded font-bold text-white text-xs">
                      {follower.isFollowed ? t("followed") : t("followYou")}
                    </button>
                  </div>
                </li>
              );
            })}
        </ul>
      </ScrollArea>
    </>
  );
}
