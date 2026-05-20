import type { Ref } from "react";
import { useTranslation } from "react-i18next";

interface FeedLoadMoreSentinelProps {
  sentinelRef: Ref<HTMLDivElement>;
  hasMore: boolean;
  isLoadingMore?: boolean;
}

export default function FeedLoadMoreSentinel({
  sentinelRef,
  hasMore,
  isLoadingMore = false,
}: FeedLoadMoreSentinelProps) {
  const { t } = useTranslation();

  if (!hasMore) {
    return null;
  }

  return (
    <div
      ref={sentinelRef}
      className="flex min-h-[48px] items-center justify-center py-4"
      aria-busy={isLoadingMore}
    >
      {isLoadingMore ? (
        <span className="text-sm text-gray-500">{t("feedLoadingMore")}</span>
      ) : (
        <span className="sr-only">{t("feedLoadingMore")}</span>
      )}
    </div>
  );
}
