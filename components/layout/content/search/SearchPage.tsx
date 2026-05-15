import { Tabs } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { search } from "@/configs/client-services";
import Search from "@/components/main/Search";
import Skeleton from "@/components/Skeleton";
import SearchPostResults from "./SearchPostResults";
import SearchHashtagResults from "./SearchHashtagResults";
import SearchUserResults from "./SearchUserResults";
import SearchListResults from "./SearchListResults";
import SearchTagResults from "./SearchTagResults";
import {
  normalizeSearchTab,
  type SearchResponse,
  type SearchTab,
} from "@/src/searchTypes";

const EMPTY_RESULTS: SearchResponse = {
  type: "posts",
  query: "",
  posts: [],
  hashtags: [],
  hashtagPosts: [],
  users: [],
  lists: [],
  tags: [],
};

export default function SearchPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SearchTab>("posts");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>(EMPTY_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const q = typeof router.query.q === "string" ? router.query.q : "";
    const tab = normalizeSearchTab(router.query.tab);
    setQuery(q);
    setActiveTab(tab);
  }, [router.isReady, router.query.q, router.query.tab]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const q = typeof router.query.q === "string" ? router.query.q.trim() : "";
    const tab = normalizeSearchTab(router.query.tab);

    if (q.length < 2) {
      setResults({ ...EMPTY_RESULTS, type: tab, query: q });
      setError("");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await search({ q, type: tab });
        if (cancelled) {
          return;
        }
        const data = response.data as SearchResponse;
        setResults({
          type: data.type ?? tab,
          query: data.query ?? q,
          posts: data.posts ?? [],
          hashtags: data.hashtags ?? [],
          hashtagPosts: data.hashtagPosts ?? [],
          users: data.users ?? [],
          lists: data.lists ?? [],
          tags: data.tags ?? [],
        });
      } catch {
        if (!cancelled) {
          setResults({ ...EMPTY_RESULTS, type: tab, query: q });
          setError(t("searchLoadError"));
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
  }, [router.isReady, router.query.q, router.query.tab, t]);

  const handleTabChange = (value: string | null) => {
    const tab = normalizeSearchTab(value);
    setActiveTab(tab);
    if (!router.isReady) {
      return;
    }
    router.replace(
      {
        pathname: "/search",
        query: {
          ...(query.trim() ? { q: query.trim() } : {}),
          tab,
        },
      },
      undefined,
      { shallow: true },
    );
  };

  const handleSearchSubmit = (value: string) => {
    const trimmed = value.trim();
    setQuery(trimmed);
    router.push({
      pathname: "/search",
      query: {
        ...(trimmed ? { q: trimmed } : {}),
        tab: activeTab,
      },
    });
  };

  const trimmedQuery = query.trim();
  const showHint = trimmedQuery.length > 0 && trimmedQuery.length < 2;

  return (
    <>
      <div className="mb-4">
        <Search
          value={query}
          onValueChange={setQuery}
          onSubmit={handleSearchSubmit}
          placeholder={t("searchPlaceholder")}
        />
      </div>

      <Tabs value={activeTab} onTabChange={handleTabChange} className="tab-active">
        <Tabs.List className="mb-4 w-full flex-nowrap justify-start gap-1 overflow-x-auto border border-gray-200 bg-white py-2">
          <Tabs.Tab value="posts" className="whitespace-nowrap px-2 text-sm">
            {t("searchTabPosts")}
          </Tabs.Tab>
          <Tabs.Tab value="hashtags" className="whitespace-nowrap px-2 text-sm">
            {t("searchTabHashtags")}
          </Tabs.Tab>
          <Tabs.Tab value="users" className="whitespace-nowrap px-2 text-sm">
            {t("searchTabUsers")}
          </Tabs.Tab>
          <Tabs.Tab value="lists" className="whitespace-nowrap px-2 text-sm">
            {t("searchTabLists")}
          </Tabs.Tab>
          <Tabs.Tab value="tags" className="whitespace-nowrap px-2 text-sm">
            {t("searchTabTags")}
          </Tabs.Tab>
        </Tabs.List>

        {trimmedQuery ? (
          <p className="mb-3 text-sm text-gray-600">
            <span className="font-bold text-126782">&quot;{trimmedQuery}&quot;</span>{" "}
            {t("searchTitle")}
          </p>
        ) : (
          <p className="mb-3 text-sm text-gray-500">{t("searchHint")}</p>
        )}

        {showHint ? (
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
            {t("searchMinLength")}
          </p>
        ) : null}

        {error ? (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <Skeleton />
        ) : !showHint && trimmedQuery.length >= 2 ? (
          <>
            {activeTab === "posts" ? (
              <SearchPostResults posts={results.posts} />
            ) : null}
            {activeTab === "hashtags" ? (
              <SearchHashtagResults
                hashtags={results.hashtags}
                posts={results.hashtagPosts}
              />
            ) : null}
            {activeTab === "users" ? <SearchUserResults users={results.users} /> : null}
            {activeTab === "lists" ? <SearchListResults lists={results.lists} /> : null}
            {activeTab === "tags" ? <SearchTagResults tags={results.tags} /> : null}
          </>
        ) : null}
      </Tabs>
    </>
  );
}
