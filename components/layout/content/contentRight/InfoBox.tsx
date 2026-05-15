import Image from "next/image";
import Link from "next/link";
import { Tabs, Spoiler } from "@mantine/core";
import { pickAvatarUrlFromMap } from "@/src/avatarUrl";
import { useTranslation } from "react-i18next";

interface MostPopularUsersModel {
  favoriteCount: number;
  id?: string;
  userName: string;
  firstName: string;
  avatarUrls?: Record<string, string>;
}

interface MostProductiveUsersModel {
  userEntryCount: number;
  id?: string;
  userName: string;
  firstName: string;
  avatarUrls?: Record<string, string>;
}

interface InfoBoxProps {
  mostPopularUsers: MostPopularUsersModel[];
  mostProductiveUsers: MostProductiveUsersModel[];
}

export default function InfoBox({
  mostPopularUsers,
  mostProductiveUsers,
}: InfoBoxProps) {
  const { t } = useTranslation();
  return (
    <>
      <div
        className="bg-white rounded w-full h-auto block col-span-2 p-3 mt-3 border border-gray-200">
        <Tabs defaultValue="pik" className="tab-active">
          <Tabs.List className="w-full justify-around border-b-0">
            <Tabs.Tab className="px-0" value="pik">
              {t("mostPiks")}
            </Tabs.Tab>
            <Tabs.Tab className="px-0" value="create">
              {t("mostCreators")}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="pik" pt="xs">
            <Spoiler
              maxHeight={150}
              showLabel={t("showAll")}
              hideLabel={t("hide")}
              className="show-all"
            >
              {mostPopularUsers &&
                mostPopularUsers
                  .filter((x) => x.userName !== null)
                  .map((user, index) => {
                    return (
                      <div
                        className="flex py-2 justify-center items-center"
                        key={index}
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
                            @{user.userName}
                          </Link>
                        </div>
                        <div className="ml-auto text-xs text-58b4d1">
                          <Link href={`/${user.userName}`} className="font-bold text-sm">
                            {user.favoriteCount} Pik
                          </Link>
                        </div>
                      </div>
                    );
                  })}
            </Spoiler>
          </Tabs.Panel>

          <Tabs.Panel value="create" pt="xs">
            <Spoiler
              maxHeight={150}
              showLabel={t("showAll")}
              hideLabel={t("hide")}
              className="show-all"
            >
              {mostProductiveUsers &&
                mostProductiveUsers
                  .filter((x) => x.userName !== null)
                  .map((user, index) => {
                    return (
                      <div
                        className="flex py-2 justify-center items-center"
                        key={index}
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
                        <div className="ml-auto text-xs text-58b4d1">
                          <Link href={`/${user.userName}`} className="font-bold text-sm">
                            {user.userEntryCount} {t("shares")}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
            </Spoiler>
          </Tabs.Panel>
        </Tabs>
      </div>
    </>
  );
}
