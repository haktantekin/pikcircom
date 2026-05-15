import { IconBrandMailgun } from "@tabler/icons-react";
import Link from "next/link";
import { ScrollArea } from "@mantine/core";
import { useTranslation } from "react-i18next";
import FollowModalAvatar from "./FollowModalAvatar";

interface FollowingUserModelProps {
  followedId: string;
  followedUserName: string;
  displayName?: string;
  avatarUrls?: Record<string, string>;
  isFollowing: boolean;
}

interface FollowingModalProps {
  followeds: FollowingUserModelProps[];
}

export default function FollowingModal({ followeds }: FollowingModalProps) {
  const { t } = useTranslation();
  return (
    <>
      <ScrollArea h={250}>
        <ul>
          {followeds &&
            followeds.map((followed, index) => {
              return (
                <li
                  className="flex justify-between border-b items-center min-h-[50px]"
                  key={`${followed.followedId}-${followed.followedUserName}`}
                >
                  <Link
                    href={`/${encodeURIComponent(followed.followedUserName)}`}
                    className="flex flex-row items-center gap-2"
                  >
                    <FollowModalAvatar
                      avatarUrls={followed.avatarUrls}
                      userName={followed.followedUserName}
                    />
                    <span className="text-xs font-bold flex items-center text-343a40 gap-[2px]">
                      <IconBrandMailgun size={20} /> {followed.followedUserName} -<span className="italic">{followed.isFollowing && t("followedYou")}</span>
                    </span>
                  </Link>
                  <div className="ml-auto">
                    <button className="bg-58b4d1 p-2 rounded font-bold text-white text-xs">
                     {t("followed")}
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
