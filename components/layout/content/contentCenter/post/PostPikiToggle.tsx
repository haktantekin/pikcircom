import Piki from "@/components/icons/Piki";
import { favoritePost, unfavoritePost } from "@/configs/client-services";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const isNumericPostId = (id?: string) => Boolean(id && /^\d+$/.test(String(id)));

export interface PostPikiToggleProps {
  postId?: string;
  favoriteCount: number;
  isFavorited?: boolean;
  variant: "compact" | "labeled";
  onFavoriteMetaChange?: (meta: {
    favoriteCount: number;
    isFavorited: boolean;
  }) => void;
  className?: string;
}

export default function PostPikiToggle({
  postId,
  favoriteCount,
  isFavorited = false,
  variant,
  onFavoriteMetaChange,
  className = "",
}: PostPikiToggleProps) {
  const { t } = useTranslation();
  const canPik = useMemo(() => isNumericPostId(postId), [postId]);
  const [count, setCount] = useState(favoriteCount);
  const [fav, setFav] = useState(Boolean(isFavorited));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCount(favoriteCount);
    setFav(Boolean(isFavorited));
  }, [postId, favoriteCount, isFavorited]);

  const toggle = async () => {
    if (!canPik || busy) return;
    setBusy(true);
    try {
      const res = fav
        ? await unfavoritePost(postId)
        : await favoritePost(postId);
      const payload = res.data ?? {};
      const nextCount =
        typeof payload.favoriteCount === "number"
          ? payload.favoriteCount
          : count;
      const nextFav =
        typeof payload.isFavorited === "boolean" ? payload.isFavorited : !fav;
      setCount(nextCount);
      setFav(nextFav);
      onFavoriteMetaChange?.({
        favoriteCount: nextCount,
        isFavorited: nextFav,
      });
    } catch {
      alert(t("pikToggleError"));
    } finally {
      setBusy(false);
    }
  };

  if (!canPik) {
    if (variant === "compact") {
      return (
        <span
          className={`flex items-center gap-1 text-sm font-bold text-gray-500 ${className}`}
        >
          <Piki />
          {count}
        </span>
      );
    }
    return null;
  }

  const baseBtn =
    "flex items-center gap-1 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed";

  if (variant === "compact") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => void toggle()}
        className={`${baseBtn} ${fav ? "text-58b4d1" : "text-gray-500"} ${className}`}
        title={fav ? t("pikRemove") : t("pikAdd")}
      >
        <Piki />
        {count}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void toggle()}
      className={`${baseBtn} ${fav ? "text-58b4d1" : "text-202124"} ${className}`}
      title={fav ? t("pikRemove") : t("pikAdd")}
    >
      <Piki />
      <span>{fav ? t("pikDone") : t("pikAddVerb")}</span>
    </button>
  );
}
