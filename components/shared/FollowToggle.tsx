import { followUser, unfollowUser } from "@/configs/client-services";
import {
  emitFollowChanged,
  subscribeFollowChanged,
} from "@/src/followChangedEvent";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type FollowToggleVariant = "inline" | "sidebar";

interface FollowToggleProps {
  userName: string;
  initialIsFollowing?: boolean;
  variant?: FollowToggleVariant;
  className?: string;
}

export default function FollowToggle({
  userName,
  initialIsFollowing = false,
  variant = "inline",
  className = "",
}: FollowToggleProps) {
  const { t } = useTranslation();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewerUserName, setViewerUserName] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);

  const normalizedTarget = userName.trim().toLowerCase();

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing, normalizedTarget]);

  useEffect(
    () =>
      subscribeFollowChanged((changedUser, following) => {
        if (changedUser.trim().toLowerCase() === normalizedTarget) {
          setIsFollowing(following);
        }
      }),
    [normalizedTarget],
  );

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/profile", { credentials: "include", cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled) {
          return;
        }
        const name =
          typeof data?.userName === "string"
            ? data.userName
            : typeof data?.user?.userName === "string"
              ? data.user.userName
              : "";
        setViewerUserName(name.trim() || null);
        setViewerReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setViewerReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isOwnProfile = useMemo(() => {
    if (!viewerReady || !viewerUserName || !normalizedTarget) {
      return false;
    }
    return viewerUserName.toLowerCase() === normalizedTarget;
  }, [viewerReady, viewerUserName, normalizedTarget]);

  const handleClick = async () => {
    if (!normalizedTarget || isOwnProfile || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = isFollowing
        ? await unfollowUser(userName)
        : await followUser(userName);

      const relation = response.data?.relation;
      const resolved =
        typeof relation?.isFollowing === "boolean"
          ? relation.isFollowing
          : !isFollowing;

      setIsFollowing(resolved);
      emitFollowChanged(userName, resolved);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!normalizedTarget || isOwnProfile) {
    return null;
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={isSubmitting}
        className={`rounded p-2 text-xs font-bold disabled:opacity-60 ${
          isFollowing
            ? "border border-58b4d1 bg-white text-58b4d1"
            : "bg-58b4d1 text-white"
        } ${className}`}
      >
        {isFollowing ? t("followYou") : t("followUp")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={isSubmitting}
      className={`ml-0 flex flex-row text-xs lowercase disabled:opacity-60 ${
        isFollowing ? "font-bold text-58b4d1" : "text-343a40"
      } ${className}`}
    >
      {isFollowing ? t("followYou") : t("followUp")}
    </button>
  );
}
