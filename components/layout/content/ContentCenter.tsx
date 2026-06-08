import CreatePost from "./contentCenter/CreatePost";
import TagList from "./contentCenter/TagList";
import HomeTagBar from "./contentCenter/HomeTagBar";
import ExploreFeed from "./contentCenter/ExploreFeed";
import Search from "@/components/main/Search";
import SearchPage from "./search/SearchPage";
import { useCallback, useEffect, useState } from "react";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";
import {
  readHomeTagVisibilityCookie,
  writeHomeTagVisibilityCookie,
} from "@/src/homeTagVisibilityCookie";

interface ContentCenterProps {
  type: string;
  /** Misafir: gönderi / etkileşim kapalı */
  feedReadOnly?: boolean;
}

export default function ContentCenter({ type, feedReadOnly = false }: ContentCenterProps) {
  const [selectedExploreTag, setSelectedExploreTag] = useState("");
  // Ana sayfada gizlenen etiket slug'ları. Boş array = hepsi görünür.
  // İlk değer cookie'den gelir; cookie yoksa tüm etiketler açık.
  const [hiddenHomeTagSlugs, setHiddenHomeTagSlugs] = useState<string[]>(() => {
    const stored = readHomeTagVisibilityCookie();
    return stored ?? [];
  });
  const [authRefreshKey, setAuthRefreshKey] = useState(0);

  useEffect(() => {
    if (type !== "home") {
      return undefined;
    }
    return subscribeAuthSessionChanged(() => {
      setAuthRefreshKey((key) => key + 1);
    });
  }, [type]);

  /**
   * Etiket görünürlüğünü tersine çevir ve cookie'ye yaz.
   * Eğer slug gizli ise → gizliler listesinden çıkar (görünür yap);
   * değilse → gizliler listesine ekle (gizle).
   */
  const handleToggleHomeTagVisibility = useCallback((slug: string) => {
    setHiddenHomeTagSlugs((current) => {
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      writeHomeTagVisibilityCookie(next);
      return next;
    });
  }, []);

  /**
   * Tüm gizli etiketleri geri getir (gizliler listesini temizle) ve cookie'ye yaz.
   */
  const handleShowAllHomeTags = useCallback(() => {
    setHiddenHomeTagSlugs(() => {
      writeHomeTagVisibilityCookie([]);
      return [];
    });
  }, []);

  return (
    <>
      <div className="col-span-12 relative mb-4 mt-4 lg:mt-0">
        {type === "home" ? (
          <>
            {!feedReadOnly ? <CreatePost showOnMobile={true} /> : null}
            <HomeTagBar
              hiddenSlugs={hiddenHomeTagSlugs}
              onToggleTagVisibility={handleToggleHomeTagVisibility}
              onShowAll={handleShowAllHomeTags}
              readOnly={feedReadOnly}
            />
            <ExploreFeed
              key={authRefreshKey}
              readOnly={feedReadOnly}
              hiddenSlugs={hiddenHomeTagSlugs}
            />
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
