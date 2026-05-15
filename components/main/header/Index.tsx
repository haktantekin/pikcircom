import Image from "next/image";
import Link from "next/link";
import ShowProfile from './ShowProfile';
import { IconLetterC, IconLetterI, IconLetterK, IconLetterP, IconLetterR, IconPlus } from '@tabler/icons-react';
import { Menu, Modal, Drawer } from '@mantine/core';
import Notification from "./Notification";
import { useDisclosure } from '@mantine/hooks';
import NewPost from "./NewPost";
import ShowProfileMobile from "./ShowProfileMobile";
import { useEffect, useState } from "react";
import Search from "../Search";
import { useTranslation } from "react-i18next";
import { pickAvatarUrlFromMap } from "@/src/avatarUrl";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";
interface HeaderProps{
  user?: {
    userName?: string;
    avatarUrls?: Record<string, string>;
  } | null;
}

export default function Header({user}: HeaderProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [postModalKey, setPostModalKey] = useState(0);
  const [profile, setProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<HeaderProps['user'] | null>(null);
  const { t } = useTranslation();
  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch(
          `/api/auth/profile?_=${Date.now()}`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setCurrentUser(null);
          return;
        }

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        setCurrentUser({
          userName: data?.userName,
          avatarUrls: data?.avatarUrls ?? {},
        });
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    };

    loadCurrentUser();
    const unsubscribe = subscribeAuthSessionChanged(() => {
      setCurrentUser(null);
      loadCurrentUser();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  /** Oturumdaki kullanıcı — yalnızca /api/auth/profile; `user` prop bazen başka bir profil (ör. ziyaret edilen sayfa). */
  const sessionUser = currentUser;

  /** Köşe avatarı: önce oturum, yoksa sayfanın verdiği `user` (ör. profil yüklenene kadar). */
  const avatarUser = sessionUser ?? user ?? null;

  const handlePostCreated = () => {
    close();
  };

  const openPostModal = () => {
    setPostModalKey((key) => key + 1);
    open();
  };

  return (
    <header className={`h-12 w-full bg-white flex relative`} style={{ boxShadow: 'rgba(33, 35, 38, 0.1) 0px 10px 10px -10px' }}>
      <div className="container">
        <div className="grid grid-cols-12 w-full min-h-full">
          <div className="col-span-12 lg:col-span-2">
            <Link href="/home" className="flex justify-center items-center gap-2 h-full">
              <Image src="/logo.png" alt="Pickup" width={32} height={40} className="w-[32px] h-[40px]" priority></Image>
              <div className="text-sm font-bold text-58b4d1 flex justify-center items-center">
                <IconLetterP size={20} stroke={2.0} />
                <IconLetterI size={15} className="-ml-[6px]" stroke={2.0} />
                <IconLetterK size={15} className="-ml-[2px]" stroke={2.0} />
                <IconLetterC size={15} className="-ml-[2px]" stroke={2.0} />
                <IconLetterI size={15} className="-ml-[2px]" stroke={2.0} />
                <IconLetterR size={15} className="-ml-[2px]" stroke={2.0} />
              </div>
            </Link>
          </div>
          <div className="col-span-6 lg:col-span-7 hidden lg:flex justify-center items-center relative">
            <Search />
          </div>
          <div className="col-span-2 lg:col-span-3 flex justify-end items-center gap-3 h-full absolute lg:relative right-4 lg:right-0 top-0">
            <div className="relative cursor-pointer leading-[0] hidden lg:inline-block" title={t("notification")}>
              <Notification notificationAnchor />
            </div>
            <div className="relative cursor-pointer hidden lg:flex justify-center" title={t("addNew")}>
              <button type="button" onClick={openPostModal}>
                <IconPlus size="1.7rem" stroke={1.0} className="text-58b4d1" />
              </button>
              <Modal
                opened={opened}
                onClose={close}
                centered
                size="lg"
                trapFocus={false}
                title={t("addNew")}
              >
                {opened ? (
                  <NewPost key={postModalKey} onCreated={handlePostCreated} />
                ) : null}
              </Modal>
            </div>
            <div className="relative cursor-pointer justify-center hidden lg:flex" title={t("myProfile")}>
              <Menu shadow="md" width={150} withArrow>
                <Menu.Target>
                  <button className="bg-none hover:bg-transparent px-0 mx-0">
                    <Image alt="profile" src={pickAvatarUrlFromMap(avatarUser?.avatarUrls)} width={400} height={400} className="w-9 h-9 rounded-full border border-white object-cover" />
                  </button>
                </Menu.Target>
                <Menu.Dropdown className="py-2">
                  <ShowProfile user={sessionUser ?? undefined} />
                </Menu.Dropdown>
              </Menu>
            </div>
            <div className="relative cursor-pointer justify-center flex lg:hidden" title={t("myProfile")}>
              <button onClick={() => setProfile(true)}><Image alt="profile" src={pickAvatarUrlFromMap(avatarUser?.avatarUrls)} width={400} height={400} className="w-9 h-9 rounded-full border border-white object-cover" /></button>
              <Drawer opened={profile} onClose={() => setProfile(false)} title={t("menus")}>
                <ShowProfileMobile user={sessionUser ?? undefined} />
              </Drawer>
            </div>
          </div>
        </div>
      </div>
    </header >
  )
}
