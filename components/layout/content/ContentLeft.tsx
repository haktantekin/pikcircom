import { Menu } from '@mantine/core';
import { IconBellRinging, IconHome2, IconPackage, IconListDetails, IconUserCircle, IconHash, IconMoodWink } from "@tabler/icons-react";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import {
  profileCollectionsPath,
  profileLikedPath,
  profilePath,
} from "@/src/profilePaths";
import { useRouter } from "next/router";

interface SessionUser {
  userName?: string;
}

export default function ContentLeft() {
  const [disabled, setDisabled] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
          cache: "no-store",
        });

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setSessionUser(null);
          return;
        }

        const data = await response.json();
        if (!isMounted) {
          return;
        }

        setSessionUser({
          userName: data?.userName,
        });
      } catch {
        if (isMounted) {
          setSessionUser(null);
        }
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [router.asPath]);

  function linkClick(value: boolean) {
    if (value === true) {
      document.getElementById('show-notification')?.click();
      setTimeout(() => {
        document.getElementById('show-all')?.click();
        setDisabled(false);
      }, 100);
    }
    else {
      setDisabled(true);
    }
  }

  const userName = sessionUser?.userName?.trim() ?? "";
  const profileHref = userName ? profilePath(userName) : "/home";
  const likedHref = userName ? profileLikedPath(userName) : "/home";
  const collectionsHref = userName ? profileCollectionsPath(userName) : "/home";

  return (
    <>
      <div className='hidden lg:block relative col-span-2'>
        <div className='absolute left-0 w-full'>
          <div className="bg-white rounded w-full border border-gray-200 pb-3" style={{ gridAutoRows: "min-content"}}>
            <div className='home-left w-full'>
              <Menu>
                <Menu.Item href={"/home"} component="a" icon={<IconHome2 size={25} stroke={0.5} />} className="text-sm pb-0">
                  {t("home")}
                </Menu.Item>
                <Menu.Item icon={<IconBellRinging size={25} stroke={0.5} />} className="text-sm pb-0" onClick={() => linkClick(disabled === false ? true : false)}>
                  {t("notification")}
                </Menu.Item>
                <Menu.Item href={profileHref} component="a" icon={<IconUserCircle size={25} stroke={0.5} />} className="text-sm pb-0">
                  {t("profile")}
                </Menu.Item>
                <Menu.Item href={likedHref} component="a" icon={<IconMoodWink size={25} stroke={0.5} />} className="text-sm pb-0">
                  {t("profileMyLikes")}
                </Menu.Item>
                <Menu.Item href={collectionsHref} component="a" icon={<IconPackage size={25} stroke={0.5} />} className="text-sm">
                  {t("profileMyCollection")}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item href={"/lists"} component="a" icon={<IconListDetails size={25} stroke={0.5} />} className="text-sm pb-0">
                  {t("lists")}
                </Menu.Item>
                <Menu.Item href={"/tags"} component="a" icon={<IconHash size={25} stroke={0.5} />} className="text-sm pb-0">
                  {t("tagsMenu")}
                </Menu.Item>
              </Menu>
            </div>
          </div>
          <div className="flex flex-col gap-2 justify-around mt-3 w-full pl-3 text-left">
            <Link href="javascript:;" className="text-xs">{t("termofServices")}</Link>
            <Link href="javascript:;" className="text-xs">  {t("confidentialityAgreement")}</Link>
            <Link href="javascript:;" className="text-xs">{t("cookiePolicy")}</Link>
          </div>
        </div>
      </div>
    </>
  )
}
