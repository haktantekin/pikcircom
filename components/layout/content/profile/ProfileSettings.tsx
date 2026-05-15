import { Menu, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDotsVertical, IconLink, IconSettings } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useCallback, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import ProfileSettingsModal, {
  type ProfileSettingsPublicSlice,
} from "./ProfileSettingsModal";

interface ProfileSettingsProps {
  profileUser?: ProfileSettingsPublicSlice;
  onProfileUpdated?: () => void;
}

function buildCanonicalProfileUrl(
  origin: string,
  pathname: string,
  routerSlug: string | undefined,
  fallbackUserName?: string,
): string {
  const pathOnly = pathname.split("#")[0].split("?")[0];
  if (pathOnly && pathOnly !== "/") {
    return `${origin}${pathOnly}`;
  }
  const slug =
    (typeof routerSlug === "string" && routerSlug.trim() !== "" ? routerSlug.trim() : "") ||
    (fallbackUserName?.trim() ?? "");
  if (!slug) {
    return `${origin}/`;
  }
  return `${origin}/${encodeURIComponent(slug)}`;
}

export default function ProfileSettings({
  profileUser,
  onProfileUpdated,
}: ProfileSettingsProps) {
  const [profileSettingsModal, setprofileSettingsModal] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  const handleCopyProfileLink = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      if (typeof window === "undefined") return;

      const slug = typeof router.query.profile === "string" ? router.query.profile : undefined;
      const url = buildCanonicalProfileUrl(
        window.location.origin,
        window.location.pathname,
        slug,
        profileUser?.userName,
      );

      void navigator.clipboard.writeText(url).then(
        () => {
          notifications.show({
            message: t("profileLinkCopied"),
            color: "teal",
          });
        },
        () => {
          notifications.show({
            message: t("profileLinkCopyFailed"),
            color: "red",
          });
        },
      );
    },
    [router.query.profile, profileUser?.userName, t],
  );

  return (
    <>
      <Menu shadow="md" width={150} withArrow>
        <Menu.Target>
          <button
            type="button"
            className="text-202124 rounded text-sm font-bold justify-center items-center"
            title={t("sendMessage")}
          >
            <IconDotsVertical size={20} />
          </button>
        </Menu.Target>
        <Menu.Dropdown className="py-2">
          <Menu.Item
            icon={<IconSettings size={17} stroke={1} />}
            onClick={() => setprofileSettingsModal(true)}
          >
            {t("editProfile")}
          </Menu.Item>
          <Menu.Item
            icon={<IconLink size={17} stroke={1} />}
            onClick={handleCopyProfileLink}
          >
            {t("profileLink")}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <Modal
        opened={profileSettingsModal}
        onClose={() => setprofileSettingsModal(false)}
        centered
        title={t("profileOptions")}
      >
        <ProfileSettingsModal
          publicProfileUser={profileUser}
          onSuccess={() => {
            onProfileUpdated?.();
            setprofileSettingsModal(false);
          }}
        />
      </Modal>
    </>
  );
}
