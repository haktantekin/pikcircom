import { Menu } from "@mantine/core";
import {
  IconUserCircle,
  IconMoodWink,
  IconPackage,
  IconLogout2,
} from "@tabler/icons-react";
import { logout } from "@/configs/client-services";
import { clearUser } from "@/src/store/UserSlices";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/src/store/types";
import { dispatchAuthSessionChanged } from "@/src/authSessionEvent";
import {
  profileCollectionsPath,
  profileLikedPath,
  profilePath,
} from "@/src/profilePaths";
import router from "next/router";
import { useTranslation } from "react-i18next";

interface HeaderUser {
  userName?: string;
}

interface ShowProfileProps {
  user?: HeaderUser;
}

export default function ShowProfile({ user }: ShowProfileProps) {
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
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.replace("/");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <>
      <Menu.Label>Merhaba @{user?.userName}</Menu.Label>
      <Menu.Item
        href={profileHref}
        component="a"
        icon={<IconUserCircle size={17} stroke={1.0} />}
      >
        {t("myProfile")}
      </Menu.Item>
      <Menu.Item
        href={likedHref}
        component="a"
        icon={<IconMoodWink size={17} stroke={1.0} />}
      >
        {t("profileMyLikes")}
      </Menu.Item>
      <Menu.Item
        href={collectionsHref}
        component="a"
        icon={<IconPackage size={17} stroke={1.0} />}
      >
        {t("profileMyCollection")}
      </Menu.Item>
      <Menu.Item
        onClick={handleLogout}
        color="red"
        icon={<IconLogout2 size={17} stroke={1.0} />}
      >
        {t("signOut")}
      </Menu.Item>
    </>
  );
}
