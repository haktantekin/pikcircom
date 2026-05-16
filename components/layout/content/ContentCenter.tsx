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
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";

interface ContentCenterProps {
  type: string;
  /** Misafir: gönderi / etkileşim kapalı */
  feedReadOnly?: boolean;
}

export default function ContentCenter({ type, feedReadOnly = false }: ContentCenterProps) {
  const [selectedExploreTag, setSelectedExploreTag] = useState("");
  const [homeFeedTab, setHomeFeedTab] = useState<HomeFeedScope>("karma");
  const [authRefreshKey, setAuthRefreshKey] = useState(0);
  const { t } = useTranslation();

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
            {!feedReadOnly ? <CreatePost /> : null}
            {feedReadOnly ? (
              <HomeFeed
                scope="karma"
                refreshKey={authRefreshKey}
                readOnly
                perPage={10}
              />
            ) : (
              <>
                <Tabs
                  value={homeFeedTab}
                  onTabChange={(value) =>
                    setHomeFeedTab((value as HomeFeedScope) || "karma")
                  }
                  className="tab-active"
                >
                  <Tabs.List className="mb-5 flex w-full justify-around rounded-xl border border-gray-100 bg-white px-2 py-2 font-bold shadow-card">
                    <Tabs.Tab
                      className="rounded-lg px-3 text-58b4d1 data-[active]:bg-58b4d1/10"
                      value="karma"
                    >
                      {t("karma")}
                    </Tabs.Tab>
                    <Tabs.Tab
                      className="rounded-lg px-3 text-58b4d1 data-[active]:bg-58b4d1/10"
                      value="followed"
                    >
                      {t("followed")}
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs>
                <HomeFeed
                  scope={homeFeedTab}
                  refreshKey={authRefreshKey}
                  readOnly={false}
                />
              </>
            )}
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
                  readOnly={feedReadOnly}
                />
                <ExploreFeed selectedTag={selectedExploreTag} readOnly={feedReadOnly} />
              </>
            )}
            {type === "search" ? <SearchPage feedReadOnly={feedReadOnly} /> : null}
          </>
        )}
      </div>
    </>
  );
}
