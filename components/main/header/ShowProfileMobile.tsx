import { Menu } from '@mantine/core';
import { IconHome2, IconListDetails, IconUserCircle, IconMoodWink, IconPackage, IconLogout2 } from "@tabler/icons-react";
import { logout } from '@/configs/client-services';
import { clearUser } from '@/src/store/UserSlices';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/src/store/types';
import { dispatchAuthSessionChanged } from '@/src/authSessionEvent';
import {
  profileCollectionsPath,
  profileLikedPath,
  profilePath,
} from "@/src/profilePaths";
import router from 'next/router';
import { useTranslation } from "react-i18next";

interface HeaderUser {
  userName?: string;
}

interface ShowProfileMobileProps {
  user?: HeaderUser;
}

export default function ShowProfileMobile({ user }: ShowProfileMobileProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const userName = user?.userName?.trim() ?? "";
  const profileHref = userName ? profilePath(userName) : "/login";
  const likedHref = userName ? profileLikedPath(userName) : "/login";
  const collectionsHref = userName ? profileCollectionsPath(userName) : "/login";

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      dispatch(clearUser());
      dispatchAuthSessionChanged();
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.replace('/');
      } else {
        router.push('/');
      }
    }
  };

  return (
    <>
      <Menu>
        <Menu.Item href={"/"} component="a" icon={<IconHome2 size={25} stroke={1.0} />} className="text-sm pb-0">
          {t("home")}
        </Menu.Item>
        <Menu.Item href={profileHref} component="a" icon={<IconUserCircle size={25} stroke={1.0} />} className="text-sm pb-0">
          {t("profile")}
        </Menu.Item>
        <Menu.Item href={likedHref} component="a" icon={<IconMoodWink size={25} stroke={1.0} />} className="text-sm pb-0">
          {t("profileMyLikes")}
        </Menu.Item>
        <Menu.Item href={collectionsHref} component="a" icon={<IconPackage size={25} stroke={1.0} />} className="text-sm pb-0">
          {t("profileMyCollection")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item href={"/lists"} component="a" icon={<IconListDetails size={25} stroke={1.0} />} className="text-sm pb-0">
          {t("lists")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item onClick={handleLogout} color="red" icon={<IconLogout2 size={25} stroke={1.0} />} className="text-sm">
          {t("signOut")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item href={"/"} component="a" className="text-sm">
          {t("termofServices")}
        </Menu.Item>
        <Menu.Item href={"/"} component="a" className="text-sm">
          {t("confidentialityAgreement")}
        </Menu.Item>
        <Menu.Item href={"/"} component="a" className="text-sm">
          {t("cookiePolicy")}
        </Menu.Item>
      </Menu>
    </>
  )
}
