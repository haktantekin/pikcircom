import { Tabs } from "@mantine/core";
import CreatePost from "./contentCenter/CreatePost";
import TagList from "./contentCenter/TagList";
import ExploreFeed from "./contentCenter/ExploreFeed";
import Search from "@/components/main/Search";
import SearchPage from "./search/SearchPage";
import { useEffect, useState } from "react";
import HomeFeed from "./contentCenter/HomeFeed";
import type { HomeFeedScope } from "./contentCenter/HomeFeed";
import { useTranslation } from "react-i18next";
import { subscribePostCreated } from "@/src/postCreatedEvent";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";

interface ContentCenterProps {
  type: string;
}

export default function ContentCenter({ type }: ContentCenterProps) {
  const [selectedExploreTag, setSelectedExploreTag] = useState("");
  const [homeFeedTab, setHomeFeedTab] = useState<HomeFeedScope>("karma");
  const [authRefreshKey, setAuthRefreshKey] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (type !== "home") {
      return undefined;
    }
    return subscribePostCreated(() => {
      setHomeFeedTab("followed");
    });
  }, [type]);

  useEffect(() => {
    if (type !== "home") {
      return undefined;
    }
    return subscribeAuthSessionChanged(() => {
      setHomeFeedTab("karma");
      setAuthRefreshKey((key) => key + 1);
    });
  }, [type]);
  return (
    <>
      <div className="col-span-12 lg:col-span-7 relative mb-4 mt-4 lg:mt-0">
        {type === "home" ? (
          <>
            <CreatePost />
            <Tabs
              value={homeFeedTab}
              onTabChange={(value) =>
                setHomeFeedTab((value as HomeFeedScope) || "karma")
              }
              className="tab-active"
            >
              <Tabs.List className="w-full justify-around bg-white mb-5 py-2 font-bold rounded-tl rounded-tr rounded-bl-none rounded-none border border-gray-200">
                <Tabs.Tab
                  className="px-0 text-58b4d1 hover:bg-transparent"
                  value="karma"
                >
                  {t("karma")}
                </Tabs.Tab>
                <Tabs.Tab
                  className="px-0 text-58b4d1 hover:bg-transparent"
                  value="followed"
                >
                  {t("followed")}
                </Tabs.Tab>
              </Tabs.List>

            </Tabs>
            <HomeFeed scope={homeFeedTab} refreshKey={authRefreshKey} />
          </>
        ) : (
          <>
            {type === "explore" && (
              <>
                <div className="flex lg:hidden relative mt-4 justify-center items-center">
                  <Search />
                </div>
                <TagList
                  selectedTag={selectedExploreTag}
                  onTagSelect={setSelectedExploreTag}
                />
                <ExploreFeed selectedTag={selectedExploreTag} />
              </>
            )}
            {type === "search" ? <SearchPage /> : null}
          </>
        )}
      </div>
    </>
  );
}
