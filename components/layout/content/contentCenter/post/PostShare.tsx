import { Menu } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconShare2,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandWhatsapp,
  IconLink,
  IconBrandPinterest,
  IconDownload,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { deletePost } from "@/configs/client-services";
import { isSameUserName, useCurrentUserName } from "@/src/useCurrentUserName";
import {
  buildFacebookShareUrl,
  buildPinterestShareUrl,
  buildPostShareUrl,
  buildTwitterShareUrl,
  buildWhatsAppShareUrl,
  resolveShareImageUrl,
} from "@/src/postShare";

export type PostShareProps = {
  postLink: string;
  postTitle?: string;
  imageUrl?: string;
  postId?: string;
  authorUserName?: string;
  onDeleted?: () => void;
  onEdit?: () => void;
};

function openShareWindow(url: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=520");
}

export default function PostShare({
  postLink,
  postTitle,
  imageUrl,
  postId,
  authorUserName,
  onDeleted,
  onEdit,
}: PostShareProps) {
  const { t } = useTranslation();
  const { userName: viewerUserName } = useCurrentUserName();
  const [isDeleting, setIsDeleting] = useState(false);

  const shareUrl = useMemo(() => buildPostShareUrl(postLink), [postLink]);
  const absoluteImageUrl = useMemo(() => resolveShareImageUrl(imageUrl), [imageUrl]);
  const hasShareTarget = shareUrl.length > 0 && postLink !== "#";
  const canDelete =
    Boolean(postId) &&
    isSameUserName(viewerUserName, authorUserName) &&
    !isDeleting;

  const handleCopyLink = useCallback(async () => {
    if (!hasShareTarget) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      notifications.show({
        title: t("copyLink"),
        message: t("linkCopied"),
        color: "teal",
      });
    } catch {
      notifications.show({
        title: t("copyLink"),
        message: t("linkCopyFailed"),
        color: "red",
      });
    }
  }, [hasShareTarget, shareUrl, t]);

  const handleDownloadImage = useCallback(async () => {
    if (!absoluteImageUrl) {
      return;
    }
    try {
      const res = await fetch(absoluteImageUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `pikcir-${Date.now()}.jpg`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(absoluteImageUrl, "_blank", "noopener,noreferrer");
    }
  }, [absoluteImageUrl]);

  const handleDeletePost = useCallback(async () => {
    if (!postId || !canDelete) {
      return;
    }
    if (!window.confirm(t("postDeleteConfirm"))) {
      return;
    }
    setIsDeleting(true);
    try {
      await deletePost(postId);
      onDeleted?.();
    } catch {
      alert(t("postDeleteError"));
    } finally {
      setIsDeleting(false);
    }
  }, [canDelete, onDeleted, postId, t]);

  return (
    <Menu shadow="md" width={220} withinPortal position="bottom-end">
      <Menu.Target>
        <button
          type="button"
          className="flex items-center gap-1 text-sm text-343a40"
          aria-label={t("share")}
          disabled={!hasShareTarget}
        >
          <IconShare2 stroke={1.0} size={20} />
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          icon={<IconLink size={18} />}
          onClick={() => void handleCopyLink()}
          disabled={!hasShareTarget}
        >
          {t("copyLink")}
        </Menu.Item>
        <Menu.Item
          icon={<IconDownload size={18} />}
          onClick={() => void handleDownloadImage()}
          disabled={!absoluteImageUrl}
        >
          {t("downloadPicture")}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          icon={<IconBrandWhatsapp size={18} />}
          onClick={() => openShareWindow(buildWhatsAppShareUrl(shareUrl, postTitle))}
          disabled={!hasShareTarget}
        >
          {t("sendWhatsapp")}
        </Menu.Item>
        <Menu.Item
          icon={<IconBrandTwitter size={18} />}
          onClick={() => openShareWindow(buildTwitterShareUrl(shareUrl, postTitle))}
          disabled={!hasShareTarget}
        >
          Twitter
        </Menu.Item>
        <Menu.Item
          icon={<IconBrandFacebook size={18} />}
          onClick={() => openShareWindow(buildFacebookShareUrl(shareUrl))}
          disabled={!hasShareTarget}
        >
          Facebook
        </Menu.Item>
        <Menu.Item
          icon={<IconBrandPinterest size={18} />}
          onClick={() =>
            openShareWindow(buildPinterestShareUrl(shareUrl, absoluteImageUrl, postTitle))
          }
          disabled={!hasShareTarget || !absoluteImageUrl}
        >
          Pinterest
        </Menu.Item>
        {canDelete ? (
          <>
            <Menu.Divider />
            <Menu.Item
              icon={<IconEdit size={18} />}
              onClick={() => onEdit?.()}
            >
              {t("editPost")}
            </Menu.Item>
            <Menu.Item
              color="red"
              icon={<IconTrash size={18} />}
              onClick={() => void handleDeletePost()}
            >
              {t("deleteFull")}
            </Menu.Item>
          </>
        ) : null}
      </Menu.Dropdown>
    </Menu>
  );
}
