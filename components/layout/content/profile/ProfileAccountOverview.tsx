import { Loader } from "@mantine/core";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type ProfileAccountOverviewStats = {
  posts: number;
  collections: number;
  following: number;
  followers: number;
};

interface ProfileAccountOverviewProps {
  loading: boolean;
  stats: ProfileAccountOverviewStats | null;
}

export default function ProfileAccountOverview({
  loading,
  stats,
}: ProfileAccountOverviewProps) {
  const { t } = useTranslation();

  const display = (
    key: keyof ProfileAccountOverviewStats,
  ): string | ReactNode => {
    if (loading) {
      return <Loader size={18} color="#58b4d1" />;
    }

    if (!stats) {
      return "—";
    }

    return String(stats[key]);
  };

  return (
    <div className="mb-4 rounded border border-solid border-neutral-200 bg-neutral-50 px-3 py-3 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          {t("profileAccountOverviewTitle")}
        </p>
        {loading ? (
          <span className="text-xs text-neutral-500">
            {t("profileOverviewLoading")}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 gap-y-3 sm:grid-cols-4">
        <div className="min-h-[40px]">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t("profileOverviewPosts")}
          </p>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            {display("posts")}
          </p>
        </div>
        <div className="min-h-[40px]">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t("profileOverviewCollections")}
          </p>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            {display("collections")}
          </p>
        </div>
        <div className="min-h-[40px]">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t("profileOverviewFollowing")}
          </p>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            {display("following")}
          </p>
        </div>
        <div className="min-h-[40px]">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t("profileOverviewFollowers")}
          </p>
          <p className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            {display("followers")}
          </p>
        </div>
      </div>
    </div>
  );
}
