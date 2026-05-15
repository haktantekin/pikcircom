import Image from "next/image";
import Link from "next/link";
import { pickAvatarUrlFromMap } from "@/src/avatarUrl";
import FollowToggle from "@/components/shared/FollowToggle";
import { useTranslation } from "react-i18next";

interface RecentRegisteredUsersModel {
  id?: string;
  userName: string;
  firstName: string;
  avatarUrls?: Record<string, string>;
  createdDate?: string;
  isFollowing?: boolean;
}
interface FollowBoxProps {
  recentRegisteredUsers: RecentRegisteredUsersModel[];
}

export default function FollowBox({ recentRegisteredUsers }: FollowBoxProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="bg-white rounded w-full h-auto block col-span-2 p-3 border border-gray-200">
        <h2 className="fony-bold text-sm">{t("newUsers")}</h2>
        {recentRegisteredUsers &&
          recentRegisteredUsers
            .filter((x) => x.userName !== null)
            .map((user) => {
              return (
                <div
                  className="flex py-2 justify-center items-center"
                  key={user.id ?? user.userName}
                >
                  <div>
                    <Link href={`/${user.userName}`}>
                      <Image
                        alt="profile"
                        src={pickAvatarUrlFromMap(user?.avatarUrls)}
                        width={400}
                        height={400}
                        className="w-9 h-9 rounded-full border border-white object-cover"
                      />
                    </Link>
                  </div>
                  <div className="ml-3">
                    <Link
                      href={`/${user.userName}`}
                      className="font-bold text-sm"
                    >
                      {user?.firstName}
                    </Link>
                    <Link
                      href={`/${user.userName}`}
                      className="font-normal text-xs block -mt-1 text-343a40"
                    >
                      @{user?.userName}
                    </Link>
                  </div>
                  <div className="ml-auto">
                    <FollowToggle
                      key={`${user.userName}-${user.isFollowing ? "following" : "not"}`}
                      userName={user.userName}
                      initialIsFollowing={user.isFollowing === true}
                      variant="sidebar"
                    />
                  </div>
                </div>
              );
            })}
      </div>
    </>
  );
}
