import axios from "axios";
import {
  normalizePage,
  normalizePageSize,
  slicePageFromFetched,
} from "@/src/feedPagination";
import { fetchFlatAuthProfileFromWordPress } from "@/src/server/wp-auth-me-profile";

export type HomeFeedScope = "karma" | "followed";

type FeedPost = {
  id?: string;
  userName?: string;
  createDate?: string;
  [key: string]: unknown;
};

type FollowedUser = {
  followedId?: string;
  followedUserName?: string;
};

type FollowingContext = {
  viewerUserName: string;
  viewerId: number;
  followingUserNames: Set<string>;
  followingIds: number[];
};

const WP_FEED_PATHS = ["/home-feed", "/feed"] as const;

function decodeAuthToken(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function normalizeUserName(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function shouldTryFeedFallback(error: unknown): boolean {
  if (!axios.isAxiosError(error) || !error.response?.status) {
    return false;
  }
  const status = error.response.status;
  return status === 404 || status === 405 || status >= 500;
}

function sortPostsByDateDesc(posts: FeedPost[]): FeedPost[] {
  return [...posts].sort((left, right) => {
    const leftTime = Date.parse(String(left.createDate ?? "")) || 0;
    const rightTime = Date.parse(String(right.createDate ?? "")) || 0;
    return rightTime - leftTime;
  });
}

function postDedupeKey(post: FeedPost): string {
  const id =
    post.id != null && String(post.id).trim() !== ""
      ? String(post.id).trim()
      : "";
  if (id) {
    return `id:${id}`;
  }

  const user = normalizeUserName(post.userName);
  const date = String(post.createDate ?? "").trim();
  const subject = String(post.subject ?? "").trim().toLowerCase();
  const image = String(post.image ?? "").trim();

  return `fp:${user}|${date}|${subject}|${image}`;
}

function dedupePosts(posts: FeedPost[]): FeedPost[] {
  const seen = new Map<string, FeedPost>();

  for (const post of posts) {
    if (!post) {
      continue;
    }
    const key = postDedupeKey(post);
    if (!seen.has(key)) {
      seen.set(key, post);
    }
  }

  return sortPostsByDateDesc([...seen.values()]);
}

function mergePostsById(...groups: FeedPost[][]): FeedPost[] {
  return dedupePosts(groups.flat());
}

async function fetchFollowingContext(
  wordPressBaseUrl: string,
  authToken: string,
): Promise<FollowingContext> {
  const empty: FollowingContext = {
    viewerUserName: "",
    viewerId: 0,
    followingUserNames: new Set(),
    followingIds: [],
  };

  const token = decodeAuthToken(authToken);
  if (!token) {
    return empty;
  }

  const me = await fetchFlatAuthProfileFromWordPress(wordPressBaseUrl, token);
  if (!me.ok) {
    return empty;
  }

  const viewerUserName = normalizeUserName(me.data.userName);
  const viewerId = Number(me.data.id) || 0;

  if (!viewerUserName) {
    return { ...empty, viewerId };
  }

  try {
    const { data } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/profile/${encodeURIComponent(viewerUserName)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { _nocache: Date.now() },
      },
    );

    const followeds = Array.isArray(
      (data?.user as { followeds?: FollowedUser[] } | undefined)?.followeds,
    )
      ? ((data.user as { followeds: FollowedUser[] }).followeds ?? [])
      : [];

    const followingUserNames = new Set<string>();
    const followingIds: number[] = [];

    for (const item of followeds) {
      const name = normalizeUserName(item.followedUserName);
      if (name) {
        followingUserNames.add(name);
      }
      const id = Number(item.followedId);
      if (id > 0) {
        followingIds.push(id);
      }
    }

    return { viewerUserName, viewerId, followingUserNames, followingIds };
  } catch {
    return { viewerUserName, viewerId, followingUserNames: new Set(), followingIds: [] };
  }
}

function filterPostsByScope(
  posts: FeedPost[],
  scope: HomeFeedScope,
  followingUserNames: Set<string>,
  viewerUserName: string,
): FeedPost[] {
  if (scope === "followed") {
    if (followingUserNames.size === 0 && !viewerUserName) {
      return [];
    }
    return posts.filter((post) => {
      const author = normalizeUserName(post.userName);
      if (viewerUserName && author === viewerUserName) {
        return true;
      }
      return followingUserNames.has(author);
    });
  }

  return posts.filter((post) => {
    const author = normalizeUserName(post.userName);
    if (!author) {
      return true;
    }
    if (viewerUserName && author === viewerUserName) {
      return false;
    }
    return !followingUserNames.has(author);
  });
}

async function fetchWpHomeFeed(
  wordPressBaseUrl: string,
  scope: HomeFeedScope,
  authToken: string | undefined,
  perPage?: string,
): Promise<FeedPost[]> {
  const token = decodeAuthToken(authToken);
  let lastError: unknown;

  for (const path of WP_FEED_PATHS) {
    try {
      const { data } = await axios.get(
        `${wordPressBaseUrl}/wp-json/pikcir/v1${path}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          params: {
            scope,
            ...(perPage ? { per_page: perPage } : {}),
          },
        },
      );

      return Array.isArray(data?.posts) ? (data.posts as FeedPost[]) : [];
    } catch (error) {
      lastError = error;
      if (shouldTryFeedFallback(error)) {
        continue;
      }
      throw error;
    }
  }

  if (lastError && shouldTryFeedFallback(lastError)) {
    return [];
  }

  if (lastError) {
    throw lastError;
  }

  return [];
}

async function fetchExplorePosts(
  wordPressBaseUrl: string,
  authToken: string | undefined,
  perPage: number,
): Promise<FeedPost[]> {
  const token = decodeAuthToken(authToken);

  try {
    const { data } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/explore`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params: { per_page: perPage },
      },
    );

    return Array.isArray(data?.posts) ? (data.posts as FeedPost[]) : [];
  } catch {
    return [];
  }
}

async function fetchFollowedFeed(
  wordPressBaseUrl: string,
  authToken: string,
  perPage?: string,
): Promise<{ scope: HomeFeedScope; posts: FeedPost[] }> {
  const limit = Math.min(
    50,
    Math.max(1, perPage ? Number.parseInt(perPage, 10) || 20 : 50),
  );
  const exploreLimit = Math.max(limit * 3, 60);

  const context = await fetchFollowingContext(wordPressBaseUrl, authToken);

  if (!context.viewerUserName && context.followingUserNames.size === 0) {
    return { scope: "followed", posts: [] };
  }

  const wpPosts = dedupePosts(
    await fetchWpHomeFeed(
      wordPressBaseUrl,
      "followed",
      authToken,
      String(exploreLimit),
    ),
  );

  const authorsInWp = new Set(
    wpPosts.map((post) => normalizeUserName(post.userName)).filter(Boolean),
  );
  const missingFollowedPosts =
    context.followingUserNames.size > 0 &&
    [...context.followingUserNames].some((name) => !authorsInWp.has(name));

  let posts = wpPosts;

  if (wpPosts.length === 0 || missingFollowedPosts) {
    const explorePosts = await fetchExplorePosts(
      wordPressBaseUrl,
      authToken,
      exploreLimit,
    );
    const filteredExplore = filterPostsByScope(
      explorePosts,
      "followed",
      context.followingUserNames,
      context.viewerUserName,
    );
    posts = mergePostsById(wpPosts, filteredExplore);
  }

  /** WP bazen takip akışına genel listeyi koyabiliyor; her zaman sadece kendi + takip edilenler. */
  const followedOnly = filterPostsByScope(
    dedupePosts(posts),
    "followed",
    context.followingUserNames,
    context.viewerUserName,
  );

  return { scope: "followed", posts: followedOnly.slice(0, limit) };
}

async function fetchHomeFeedFallback(
  wordPressBaseUrl: string,
  scope: HomeFeedScope,
  authToken?: string,
  perPage?: string,
): Promise<{ scope: HomeFeedScope; posts: FeedPost[] }> {
  const limit = Math.min(
    50,
    Math.max(1, perPage ? Number.parseInt(perPage, 10) || 50 : 50),
  );

  try {
    const explorePosts = await fetchExplorePosts(
      wordPressBaseUrl,
      authToken,
      Math.max(limit, 50),
    );

    if (!authToken) {
      return {
        scope,
        posts:
          scope === "followed"
            ? []
            : dedupePosts(explorePosts).slice(0, limit),
      };
    }

    const context = await fetchFollowingContext(wordPressBaseUrl, authToken);
    const posts = dedupePosts(
      filterPostsByScope(
        explorePosts,
        scope,
        context.followingUserNames,
        context.viewerUserName,
      ),
    ).slice(0, limit);

    return { scope, posts };
  } catch {
    return { scope, posts: [] };
  }
}

function applyFeedPagination(
  posts: FeedPost[],
  page?: string,
  perPage?: string,
): { posts: FeedPost[]; has_more?: boolean } {
  if (!page || !perPage) {
    return { posts };
  }
  const pageNum = normalizePage(page);
  const pageSize = normalizePageSize(perPage);
  const { items, hasMore } = slicePageFromFetched(posts, pageNum, pageSize);
  return { posts: items, has_more: hasMore };
}

export async function fetchHomeFeedFromWordPress(
  wordPressBaseUrl: string,
  scope: HomeFeedScope,
  authToken?: string,
  perPage?: string,
  page?: string,
): Promise<{ scope: HomeFeedScope; posts: FeedPost[]; has_more?: boolean }> {
  if (scope === "followed" && authToken) {
    return fetchFollowedFeed(wordPressBaseUrl, authToken, perPage);
  }

  const pageNum = page ? normalizePage(page) : 0;
  const pageSize = perPage ? normalizePageSize(perPage) : 0;
  const usePagination = pageNum > 0 && pageSize > 0;
  const wpPerPage = usePagination
    ? String(pageNum * pageSize)
    : perPage;

  try {
    const rawPosts = await fetchWpHomeFeed(
      wordPressBaseUrl,
      scope,
      authToken,
      wpPerPage,
    );

    let posts = dedupePosts(rawPosts);

    if (authToken) {
      const context = await fetchFollowingContext(wordPressBaseUrl, authToken);
      posts = filterPostsByScope(
        posts,
        "karma",
        context.followingUserNames,
        context.viewerUserName,
      );
    }

    if (posts.length === 0) {
      const fallback = await fetchHomeFeedFallback(
        wordPressBaseUrl,
        scope,
        authToken,
        wpPerPage,
      );
      return {
        scope: fallback.scope,
        ...applyFeedPagination(fallback.posts, page, perPage),
      };
    }

    return {
      scope,
      ...applyFeedPagination(posts, page, perPage),
    };
  } catch (error) {
    if (shouldTryFeedFallback(error)) {
      const fallback = await fetchHomeFeedFallback(
        wordPressBaseUrl,
        scope,
        authToken,
        wpPerPage,
      );
      return {
        scope: fallback.scope,
        ...applyFeedPagination(fallback.posts, page, perPage),
      };
    }
    throw error;
  }
}
