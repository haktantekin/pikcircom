import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  isPostSensitive,
  revealSensitivePost,
  shouldGatePost,
  type PostTagLike,
  type SensitivePostInput,
} from "@/src/sensitiveContent";

export type SensitivePostMediaVariant = "feed" | "thumb" | "grid";

interface SensitivePostMediaProps {
  postId?: string;
  tags?: PostTagLike[];
  categoryName?: string;
  isSensitive?: boolean;
  variant?: SensitivePostMediaVariant;
  className?: string;
  onRevealed?: () => void;
  children: ReactNode;
}

const VARIANT_CLASS: Record<SensitivePostMediaVariant, string> = {
  feed: "relative min-h-[200px] w-full overflow-hidden bg-gray-200",
  thumb: "relative min-h-[180px] w-full overflow-hidden rounded bg-gray-200",
  grid: "relative aspect-square w-full overflow-hidden rounded-sm bg-gray-200",
};

export default function SensitivePostMedia({
  postId,
  tags,
  categoryName,
  isSensitive,
  variant = "feed",
  className = "",
  onRevealed,
  children,
}: SensitivePostMediaProps) {
  const { t } = useTranslation();
  const sensitivityInput: SensitivePostInput = {
    tags,
    categoryName,
    isSensitive,
  };
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!postId?.trim()) {
      setRevealed(false);
      return;
    }
    setRevealed(!shouldGatePost(postId, sensitivityInput));
  }, [postId, tags, categoryName, isSensitive]);

  const handleReveal = useCallback(() => {
    if (postId) {
      revealSensitivePost(postId);
    }
    setRevealed(true);
    onRevealed?.();
  }, [postId, onRevealed]);

  const showGate =
    Boolean(postId?.trim()) &&
    isPostSensitive(postId, sensitivityInput) &&
    !revealed;

  if (!showGate) {
    return <>{children}</>;
  }

  const shellClass = [VARIANT_CLASS[variant], className].filter(Boolean).join(" ");

  return (
    <div
      className={shellClass}
      role="group"
      aria-label={t("sensitiveContentWarning")}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 py-6 text-center">
        <p className="max-w-sm text-sm font-medium text-gray-700">
          {t("sensitiveContentWarning")}
        </p>
        <button
          type="button"
          onClick={handleReveal}
          className="rounded-full bg-58b4d1 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98]"
        >
          {t("sensitiveContentReveal")}
        </button>
      </div>
    </div>
  );
}
