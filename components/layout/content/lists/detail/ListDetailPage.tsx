import { IconArrowNarrowLeft, IconLayoutGrid, IconList } from "@tabler/icons-react";
import { Tabs } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getListBySlug } from "@/configs/client-services";
import type { ListPeriod } from "@/src/listPaths";
import { listIndexPath } from "@/src/listPaths";
import ListDetailGrid, { type ListDetailPost } from "./ListDetailGrid";
import ListDetailTimeline from "./ListDetailTimeline";
import Skeleton from "@/components/Skeleton";
import PostComposer from "@/components/layout/content/contentCenter/PostComposer";

type ViewMode = "grid" | "timeline";

interface ListDetailPageProps {
  slug: string;
}

export default function ListDetailPage({ slug }: ListDetailPageProps) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<ListPeriod>("today");
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
        setPosts(response.data.posts ?? []);
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
    <div className="col-span-12 lg:col-span-7 relative mb-4 mt-4 lg:mt-0">
      <Tabs value={period} onTabChange={(value) => setPeriod((value as ListPeriod) || "all")}>
        <div
          className="w-full bg-white rounded mb-4 text-sm min-h-[40px] relative grid grid-cols-12 items-center px-2 gap-2"
          style={{ boxShadow: "rgba(33, 35, 38, 0.1) 0px 10px 10px -10px" }}
        >
          <Link href={listIndexPath()} className="col-span-1 flex justify-center" aria-label={t("goBack")}>
            <IconArrowNarrowLeft />
          </Link>
          <div className="col-span-5 sm:col-span-6 text-center truncate">
            <span className="font-bold text-sm text-126782">{listName || slug}</span>
            &nbsp;{t("list")}
          </div>
          <div className="col-span-3 flex justify-end gap-1">
            <button
              type="button"
              title={t("listViewGrid")}
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded ${viewMode === "grid" ? "bg-58b4d1/20 text-58b4d1" : "text-gray-500"}`}
            >
              <IconLayoutGrid size={20} stroke={1.2} />
            </button>
            <button
              type="button"
              title={t("listViewTimeline")}
              onClick={() => setViewMode("timeline")}
              className={`p-1 rounded ${viewMode === "timeline" ? "bg-58b4d1/20 text-58b4d1" : "text-gray-500"}`}
            >
              <IconList size={20} stroke={1.2} />
            </button>
          </div>
          <div className="col-span-3">
            <Tabs.List className="w-full justify-end border-b-0 tab-active flex-nowrap">
              <Tabs.Tab value="today" className="text-xs px-1">{t("today")}</Tabs.Tab>
              <Tabs.Tab value="yesterday" className="text-xs px-1">{t("yesterday")}</Tabs.Tab>
              <Tabs.Tab value="all" className="text-xs px-1">{t("all")}</Tabs.Tab>
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
            ) : viewMode === "grid" ? (
              <ListDetailGrid posts={posts} />
            ) : (
              <ListDetailTimeline posts={posts} />
            )}
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}
