import { Menu } from "@mantine/core";
import {
  IconBellRinging,
  IconHash,
  IconHome2,
  IconListDetails,
  IconMoodWink,
  IconPackage,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  profileCollectionsPath,
  profileLikedPath,
  profilePath,
} from "@/src/profilePaths";
import { authNavHref, useAuthSession } from "@/src/useAuthSession";

export default function ContentLeft() {
  const [disabled, setDisabled] = useState(false);
  const { userName, sessionResolved, isLoggedIn } = useAuthSession();
  const router = useRouter();
  const { t } = useTranslation();

  const loginHref = "/login";
  const name = userName ?? "";
  const profileHref = authNavHref(sessionResolved, name, profilePath(name));
  const likedHref = authNavHref(sessionResolved, name, profileLikedPath(name));
  const collectionsHref = authNavHref(
    sessionResolved,
    name,
    profileCollectionsPath(name),
  );
  const listsHref = authNavHref(sessionResolved, name, "/lists");
  const path = router.asPath.split("?")[0];

  const navItemClass = (active: boolean) =>
    `text-sm rounded-lg mx-1.5 mb-0.5 pb-0 transition-colors duration-150 ${
      active
        ? "bg-58b4d1/12 font-semibold text-58b4d1"
        : "text-343a40 hover:bg-gray-50/90"
    }`;

  function onAuthNavClick(event: MouseEvent, href: string) {
    if (href !== "#") {
      return;
    }
    event.preventDefault();
    if (!sessionResolved) {
      return;
    }
    if (!isLoggedIn) {
      void router.push(loginHref);
    }
  }

  function linkClick(value: boolean) {
    if (!sessionResolved) {
      return;
    }
    if (!isLoggedIn) {
      void router.push(loginHref);
      return;
    }
    if (value === true) {
      document.getElementById("show-notification")?.click();
      setTimeout(() => {
        document.getElementById("show-all")?.click();
        setDisabled(false);
      }, 100);
    } else {
      setDisabled(true);
    }
  }

  return (
    <div className="relative col-span-2 hidden lg:block">
      <div className="absolute left-0 w-full">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white pb-2 shadow-card">
          <div className="home-left w-full px-1.5 pt-1">
            <Menu>
              <Menu.Item
                href="/"
                component="a"
                icon={<IconHome2 size={25} stroke={0.5} />}
                className={navItemClass(path === "/home" || path === "/")}
              >
                {t("home")}
              </Menu.Item>
              <Menu.Item
                icon={<IconBellRinging size={25} stroke={0.5} />}
                className={navItemClass(false)}
                onClick={() => linkClick(disabled === false)}
              >
                {t("notification")}
              </Menu.Item>
              <Menu.Item
                href={profileHref}
                component="a"
                icon={<IconUserCircle size={25} stroke={0.5} />}
                className={navItemClass(Boolean(name) && path === profilePath(name))}
                onClick={(e) => onAuthNavClick(e, profileHref)}
              >
                {t("profile")}
              </Menu.Item>
              <Menu.Item
                href={likedHref}
                component="a"
                icon={<IconMoodWink size={25} stroke={0.5} />}
                className={navItemClass(Boolean(name) && path === profileLikedPath(name))}
                onClick={(e) => onAuthNavClick(e, likedHref)}
              >
                {t("profileMyLikes")}
              </Menu.Item>
              <Menu.Item
                href={collectionsHref}
                component="a"
                icon={<IconPackage size={25} stroke={0.5} />}
                className={navItemClass(
                  Boolean(name) &&
                    (path.startsWith(`${profileCollectionsPath(name)}/`) ||
                      path === profileCollectionsPath(name)),
                )}
                onClick={(e) => onAuthNavClick(e, collectionsHref)}
              >
                {t("profileMyCollection")}
              </Menu.Item>
              <Menu.Divider className="my-1 border-gray-100" />
              <Menu.Item
                href={listsHref}
                component="a"
                icon={<IconListDetails size={25} stroke={0.5} />}
                className={navItemClass(
                  path === "/lists" || path.startsWith("/lists/"),
                )}
                onClick={(e) => onAuthNavClick(e, listsHref)}
              >
                {t("lists")}
              </Menu.Item>
              <Menu.Item
                href="/tags"
                component="a"
                icon={<IconHash size={25} stroke={0.5} />}
                className={navItemClass(
                  path === "/tags" || path.startsWith("/tags"),
                )}
              >
                {t("tagsMenu")}
              </Menu.Item>
            </Menu>
          </div>
        </div>
        <div className="mt-4 flex w-full flex-col gap-1.5 pl-0.5 text-left">
          <Link
            href="javascript:;"
            className="text-xs text-gray-500 transition-colors hover:text-58b4d1"
          >
            {t("termofServices")}
          </Link>
          <Link
            href="javascript:;"
            className="text-xs text-gray-500 transition-colors hover:text-58b4d1"
          >
            {t("confidentialityAgreement")}
          </Link>
          <Link
            href="javascript:;"
            className="text-xs text-gray-500 transition-colors hover:text-58b4d1"
          >
            {t("cookiePolicy")}
          </Link>
        </div>
      </div>
    </div>
  );
}
