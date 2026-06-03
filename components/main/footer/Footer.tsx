import { useDisclosure } from "@mantine/hooks";

import { useState } from "react";

import { Modal } from "@mantine/core";

import Notification from "../header/Notification";

import {

  IconBellRinging,

  IconHash,

  IconHome2,

  IconListDetails,

  IconPlus,

} from "@tabler/icons-react";

import NewPost from "../header/NewPost";

import Link from "next/link";

import { useRouter } from "next/router";

import { useTranslation } from "react-i18next";

import { useGuestFeedReadOnly } from "@/src/useGuestFeedReadOnly";



const iconSize = 22;

const iconStroke = 1.15;



function tabClass(isActive: boolean) {

  return `flex min-h-[3rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 transition-colors active:bg-gray-100/90 ${

    isActive ? "text-58b4d1" : "text-gray-600 hover:text-202124"

  }`;

}



export default function Footer() {

  const [opened, { open, close }] = useDisclosure(false);

  const [postModalKey, setPostModalKey] = useState(0);

  const { t } = useTranslation();

  const { feedReadOnly } = useGuestFeedReadOnly();

  const router = useRouter();

  const path = router.asPath.split("?")[0] || "";

  const isHome = path === "/" || path === "/home";

  const isLists = path === "/lists" || path.startsWith("/lists/");

  const isTags = path === "/tags" || path.startsWith("/tags/");

  const isLogin = path === "/login" || path.startsWith("/login/");



  const openPostModal = () => {

    setPostModalKey((key) => key + 1);

    open();

  };



  return (

    <>

      <footer

        className="fixed bottom-0 left-0 right-0 z-40 md:border-t-0 md:bg-transparent md:shadow-none md:backdrop-blur-none"

        style={{

          paddingBottom: "max(0.4rem, env(safe-area-inset-bottom, 0px))",

        }}

      >

        <div className="w-full border-t border-gray-100 bg-white/95 shadow-[0_-6px_24px_-8px_rgba(33,35,38,0.12)] backdrop-blur-md supports-[backdrop-filter]:bg-white/88 md:mx-auto md:max-w-[800px] md:rounded-t-2xl">

          <nav

            className="flex w-full items-stretch px-0.5 pt-1"

            aria-label={t("menus")}

          >

          <Link

            href="/"

            className={tabClass(isHome)}

            aria-current={isHome ? "page" : undefined}

            aria-label={t("home")}

            title={t("home")}

          >

            <IconHome2 size={iconSize} stroke={iconStroke} />

            <span className="max-w-full truncate text-[9px] font-semibold leading-tight sm:text-[10px]">

              {t("home")}

            </span>

          </Link>



          <Link

            href="/lists"

            className={tabClass(isLists)}

            aria-current={isLists ? "page" : undefined}

            aria-label={t("lists")}

            title={t("lists")}

          >

            <IconListDetails size={iconSize} stroke={iconStroke} />

            <span className="max-w-full truncate text-[9px] font-semibold leading-tight sm:text-[10px]">

              {t("lists")}

            </span>

          </Link>



          {feedReadOnly ? (

            <Link

              href="/login"

              className={tabClass(isLogin)}

              aria-current={isLogin ? "page" : undefined}

              aria-label={t("footerTabAdd")}

              title={t("footerTabAdd")}

            >

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-58b4d1/12 text-58b4d1 ring-1 ring-58b4d1/25">

                <IconPlus size={19} stroke={iconStroke} />

              </span>

              <span className="max-w-full truncate text-[9px] font-semibold leading-tight sm:text-[10px]">

                {t("footerTabAdd")}

              </span>

            </Link>

          ) : (

            <button

              type="button"

              onClick={openPostModal}

              className={tabClass(false)}

              title={t("footerTabAdd")}

              aria-label={t("footerTabAdd")}

            >

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-58b4d1/12 text-58b4d1 ring-1 ring-58b4d1/25">

                <IconPlus size={19} stroke={iconStroke} />

              </span>

              <span className="max-w-full truncate text-[9px] font-semibold leading-tight sm:text-[10px]">

                {t("footerTabAdd")}

              </span>

            </button>

          )}



          <Link

            href="/tags"

            className={tabClass(isTags)}

            aria-current={isTags ? "page" : undefined}

            aria-label={t("tagsMenu")}

            title={t("tagsMenu")}

          >

            <IconHash size={iconSize} stroke={iconStroke} />

            <span className="max-w-full truncate text-[9px] font-semibold leading-tight sm:text-[10px]">

              {t("tagsMenu")}

            </span>

          </Link>



          {feedReadOnly ? (

            <Link

              href="/login"

              className={tabClass(false)}

              aria-label={t("notification")}

              title={t("notification")}

            >

              <IconBellRinging size={iconSize} stroke={iconStroke} />

              <span className="max-w-full truncate text-[9px] font-semibold leading-tight sm:text-[10px]">

                {t("notification")}

              </span>

            </Link>

          ) : (

            <div className={tabClass(false)}>

              <Notification />

              <span className="max-w-full truncate text-[9px] font-semibold leading-tight sm:text-[10px]">

                {t("notification")}

              </span>

            </div>

          )}

          </nav>

        </div>

      </footer>



      {!feedReadOnly ? (

        <Modal opened={opened} onClose={close} centered size="lg" trapFocus={false} title={t("addNew")}>

          {opened ? <NewPost key={postModalKey} onCreated={close} /> : null}

        </Modal>

      ) : null}

    </>

  );

}

