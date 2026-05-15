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
} from "@tabler/icons-react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
}: PostShareProps) {
  const { t } = useTranslation();

  const shareUrl = useMemo(() => buildPostShareUrl(postLink), [postLink]);
  const absoluteImageUrl = useMemo(() => resolveShareImageUrl(imageUrl), [imageUrl]);
  const hasShareTarget = shareUrl.length > 0 && postLink !== "#";

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
      </Menu.Dropdown>
    </Menu>
  );
}
