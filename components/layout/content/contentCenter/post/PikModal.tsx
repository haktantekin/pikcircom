import { IconBrandMailgun } from "@tabler/icons-react";
import Link from "next/link";
import { ScrollArea } from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import FollowModalAvatar from "../../profile/FollowModalAvatar";
import { getPostFavorites } from "@/configs/client-services";

interface PostFavoriteRow {
  followerId: string;
  followerUserName: string;
  displayName?: string;
  avatarUrls?: Record<string, string>;
  isFollowed?: boolean;
}

interface PikModalProps {
  postId?: string;
  opened: boolean;
}

export default function PikModal({ postId, opened }: PikModalProps) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<PostFavoriteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !postId?.trim()) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPostFavorites(postId.trim());
        const list = res.data?.favorites;
        if (!cancelled) {
          setRows(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        if (cancelled) return;
        const msg =
          axios.isAxiosError(e) &&
          typeof e.response?.data?.message === "string"
            ? e.response.data.message
            : t("pikFavoritesError");
        setError(msg);
        setRows([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [opened, postId, t]);

  if (!postId?.trim()) {
    return (
      <p className="text-center text-sm text-343a40">{t("pikFavoritesNoPostId")}</p>
    );
  }

  if (loading) {
    return (
      <p className="text-center text-sm text-343a40">{t("pikFavoritesLoading")}</p>
    );
  }

  if (error) {
    return <p className="text-center text-sm text-red-600">{error}</p>;
  }

  if (rows.length === 0) {
    return (
      <p className="text-center text-sm text-343a40">{t("pikFavoritesEmpty")}</p>
    );
  }

  return (
    <ScrollArea h={250}>
      <ul>
        {rows.map((row) => (
          <li
            key={`${row.followerId}-${row.followerUserName}`}
            className="flex min-h-[50px] items-center justify-between border-b"
          >
            <Link
              href={`/${encodeURIComponent(row.followerUserName)}`}
              className="flex flex-row items-center gap-2"
            >
              <FollowModalAvatar
                avatarUrls={row.avatarUrls}
                userName={row.followerUserName}
              />
              <span className="flex items-center gap-[2px] text-xs font-bold text-343a40">
                <IconBrandMailgun size={20} /> {row.followerUserName}
              </span>
            </Link>
            <div className="ml-auto">
              <button
                type="button"
                className={
                  row.isFollowed
                    ? "rounded bg-003049 p-2 text-xs font-bold text-white"
                    : "rounded bg-58b4d1 p-2 text-xs font-bold text-white"
                }
              >
                {row.isFollowed ? t("followYou") : t("followUp")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
