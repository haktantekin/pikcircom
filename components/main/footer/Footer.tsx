import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Modal} from '@mantine/core';
import Notification from "../header/Notification";
import { IconBrandHipchat, IconHome2, IconPlus } from "@tabler/icons-react";
import NewPost from "../header/NewPost";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const [opened, { open, close }] = useDisclosure(false);
  const [postModalKey, setPostModalKey] = useState(0);
  const { t } = useTranslation();

  const openPostModal = () => {
    setPostModalKey((key) => key + 1);
    open();
  };
  return (
    <>
      <footer className="flex lg:hidden fixed bottom-0 w-full h-12 bg-white border-t-2 border-58b4d1 justify-between px-4">
        <Link href="/home" className="flex justify-center items-center">
          <IconHome2 size={"1.7rem"} stroke={1.0} />
        </Link>

        <div className="relative cursor-pointer flex justify-center" title={t("addNew")}>
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
            {opened ? <NewPost key={postModalKey} onCreated={close} /> : null}
          </Modal>
        </div>
        <div className="relative cursor-pointer leading-none flex justify-center items-center" title={t("messages")}>
          <div className="rounded-3xl bg-58b4d1 border border-58b4d1 p-1 py-0 absolute top-1 -right-1 text-white text-center text-xs">2</div>
          <IconBrandHipchat size="1.7rem" stroke={1.0} className="text-343a40" />
        </div>
        <div className="relative cursor-pointer leading-none flex items-center" title={t("notification")}>
          <Notification />
        </div>
        <div className="relative cursor-pointer hidden lg:flex justify-center items-center" title={t("addNew")}>
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
            {opened ? <NewPost key={postModalKey} onCreated={close} /> : null}
          </Modal>
        </div>
      </footer>
    </>
  )
}
