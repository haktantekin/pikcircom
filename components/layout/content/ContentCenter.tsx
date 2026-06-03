import CreatePost from "./contentCenter/CreatePost";
import TagList from "./contentCenter/TagList";
import ExploreFeed from "./contentCenter/ExploreFeed";
import Search from "@/components/main/Search";
import SearchPage from "./search/SearchPage";
import { useEffect, useState } from "react";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";

interface ContentCenterProps {
  type: string;
  /** Misafir: gönderi / etkileşim kapalı */
  feedReadOnly?: boolean;
}

export default function ContentCenter({ type, feedReadOnly = false }: ContentCenterProps) {
  const [selectedExploreTag, setSelectedExploreTag] = useState("");
  const [authRefreshKey, setAuthRefreshKey] = useState(0);

  useEffect(() => {
    if (type !== "home") {
      return undefined;
    }
    return subscribeAuthSessionChanged(() => {
      setAuthRefreshKey((key) => key + 1);
    });
  }, [type]);
  return (
    <>
      <div className="col-span-12 relative mb-4 mt-4 lg:mt-0">
        {type === "home" ? (
          <>
            {!feedReadOnly ? <CreatePost /> : null}
            <ExploreFeed key={authRefreshKey} readOnly={feedReadOnly} />
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
