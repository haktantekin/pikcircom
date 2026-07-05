import { IconArrowNarrowLeft, IconLayoutGrid, IconList } from "@tabler/icons-react";
import { Tabs } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { getListBySlug } from "@/configs/client-services";
import type { ListPeriod } from "@/src/listPaths";
import { listIndexPath } from "@/src/listPaths";
import ListDetailGrid, { type ListDetailPost } from "./ListDetailGrid";
import ListDetailTimeline from "./ListDetailTimeline";
import Skeleton from "@/components/Skeleton";
import FeedLoadMoreSentinel from "@/components/FeedLoadMoreSentinel";
import PostComposer from "@/components/layout/content/contentCenter/PostComposer";
import { applySensitiveMetadataToPosts } from "@/src/sensitiveContent";
import { FEED_GRID_PAGE_SIZE, FEED_PAGE_SIZE } from "@/src/feedPagination";
import { useClientPaginatedSlice } from "@/src/useClientPaginatedSlice";

type ViewMode = "grid" | "timeline";

interface ListDetailPageProps {
  slug: string;
}

function ListDetailPostsView({
  posts,
  viewMode,
  resetKey,
}: {
  posts: ListDetailPost[];
  viewMode: ViewMode;
  resetKey: string;
}) {
  const pageSize =
    viewMode === "grid" ? FEED_GRID_PAGE_SIZE : FEED_PAGE_SIZE;
  const { visibleItems, hasMore, isLoadingMore, sentinelRef } =
    useClientPaginatedSlice({
      items: posts,
      pageSize,
      resetKey,
    });

  return (
    <>
      {viewMode === "grid" ? (
        <ListDetailGrid posts={visibleItems} resetKey={resetKey} />
      ) : (
        <ListDetailTimeline posts={visibleItems} resetKey={resetKey} />
      )}
      <FeedLoadMoreSentinel
        sentinelRef={sentinelRef}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      />
    </>
  );
}

export default function ListDetailPage({ slug }: ListDetailPageProps) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<ListPeriod>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [listName, setListName] = useState("");
  const [listId, setListId] = useState("");
  const [posts, setPosts] = useState<ListDetailPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const response = await getListBySlug(slug, { period });
        if (cancelled) {
          return;
        }
        setListName(response.data.list?.name ?? "");
        setListId(String(response.data.list?.id ?? ""));
        setPosts(
          applySensitiveMetadataToPosts(
            (response.data.posts ?? []) as ListDetailPost[],
          ),
        );
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setPosts([]);
          setListId("");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [slug, period, refreshKey]);

  const handlePostCreated = () => {
    setRefreshKey((key) => key + 1);
  };

  return (
    <div className="col-span-12 relative mb-4 mt-4 lg:mt-0">
      <Tabs
        value={period}
        onTabChange={(value) => setPeriod((value as ListPeriod) || "all")}
        styles={
          {
            tab: {
              border: "none",
              borderBottom: "none",
              fontWeight: 500,
            },
            list: {
              border: "none",
              gap: 4,
              backgroundColor: "transparent",
            },
          } as Record<string, CSSProperties>
        }
      >
        <div
          className="mb-4 grid w-full grid-cols-12 items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-card sm:px-4"
        >
          <Link href={listIndexPath()} className="col-span-2 flex justify-center sm:col-span-1" aria-label={t("goBack")}>
            <IconArrowNarrowLeft className="text-gray-700" />
          </Link>
          <div className="col-span-6 truncate text-center sm:col-span-5">
            <span className="text-sm font-bold text-58b4d1">{listName || slug}</span>
            <span className="text-sm text-gray-600">&nbsp;{t("list")}</span>
          </div>
          <div className="col-span-4 flex justify-end gap-1 sm:col-span-3">
            <button
              type="button"
              title={t("listViewGrid")}
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-1.5 transition-colors ${viewMode === "grid" ? "bg-58b4d1/15 text-58b4d1 shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <IconLayoutGrid size={20} stroke={1.2} />
            </button>
            <button
              type="button"
              title={t("listViewTimeline")}
              onClick={() => setViewMode("timeline")}
              className={`rounded-lg p-1.5 transition-colors ${viewMode === "timeline" ? "bg-58b4d1/15 text-58b4d1 shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <IconList size={20} stroke={1.2} />
            </button>
          </div>
          <div className="col-span-12 mt-2 sm:col-span-3 sm:mt-0">
            <Tabs.List className="hide-scrollbar flex w-full flex-nowrap justify-stretch gap-1 overflow-x-auto rounded-xl bg-gray-100/75 p-1">
              <Tabs.Tab
                value="today"
                className="min-w-0 flex-1 rounded-lg border-0 px-2 py-1.5 text-center text-[11px] font-medium text-gray-600 data-[active]:bg-white data-[active]:font-semibold data-[active]:text-58b4d1 data-[active]:shadow-sm sm:text-xs"
              >
                {t("today")}
              </Tabs.Tab>
              <Tabs.Tab
                value="yesterday"
                className="min-w-0 flex-1 rounded-lg border-0 px-2 py-1.5 text-center text-[11px] font-medium text-gray-600 data-[active]:bg-white data-[active]:font-semibold data-[active]:text-58b4d1 data-[active]:shadow-sm sm:text-xs"
              >
                {t("yesterday")}
              </Tabs.Tab>
              <Tabs.Tab
                value="all"
                className="min-w-0 flex-1 rounded-lg border-0 px-2 py-1.5 text-center text-[11px] font-medium text-gray-600 data-[active]:bg-white data-[active]:font-semibold data-[active]:text-58b4d1 data-[active]:shadow-sm sm:text-xs"
              >
                {t("all")}
              </Tabs.Tab>
            </Tabs.List>
          </div>
        </div>

        {!notFound && listId && listName ? (
          <PostComposer
            variant="inline"
            showOnMobile
            fixedList={{ id: listId, name: listName }}
            onCreated={handlePostCreated}
          />
        ) : null}

        {(["today", "yesterday", "all"] as ListPeriod[]).map((tab) => (
          <Tabs.Panel key={tab} value={tab} pt="xs">
            {isLoading ? (
              <div className="mt-4">
                <Skeleton />
              </div>
            ) : notFound ? (
              <p className="text-sm text-center text-gray-500 py-8">{t("listNotFound")}</p>
            ) : posts.length === 0 ? (
              <p className="text-sm text-center text-gray-500 py-8">{t("listEmpty")}</p>
            ) : (
              <ListDetailPostsView
                posts={posts}
                viewMode={viewMode}
                resetKey={`${slug}-${tab}-${period}-${refreshKey}-${viewMode}`}
              />
            )}
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}
