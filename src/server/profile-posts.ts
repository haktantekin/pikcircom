import axios from "axios";
import {
  FEED_GRID_PAGE_SIZE,
  normalizePage,
  normalizePageSize,
  slicePageFromFetched,
} from "@/src/feedPagination";

export type ProfilePostRecord = Record<string, unknown> & {
  id?: string;
};

export interface ProfilePostsResult {
  posts: ProfilePostRecord[];
  has_more: boolean;
  post_count?: number;
  page: number;
  per_page: number;
}

function extractPostsFromProfilePayload(data: unknown): ProfilePostRecord[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const root = data as Record<string, unknown>;
  const user = root.user;

  if (Array.isArray(root.posts)) {
    return root.posts as ProfilePostRecord[];
  }

  if (user && typeof user === "object" && Array.isArray((user as { posts?: unknown }).posts)) {
    return (user as { posts: ProfilePostRecord[] }).posts;
  }

  return [];
}

function extractPostCount(data: unknown): number | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const root = data as Record<string, unknown>;
  const user = root.user;

  if (typeof root.post_count === "number") {
    return root.post_count;
  }

  if (typeof root.postCount === "number") {
    return root.postCount;
  }

  if (user && typeof user === "object") {
    const userObj = user as { postCount?: number; post_count?: number };
    if (typeof userObj.postCount === "number") {
      return userObj.postCount;
    }
    if (typeof userObj.post_count === "number") {
      return userObj.post_count;
    }
  }

  return undefined;
}

function extractHasMore(data: unknown): boolean | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const root = data as Record<string, unknown>;
  if (typeof root.has_more === "boolean") {
    return root.has_more;
  }
  if (typeof root.posts_has_more === "boolean") {
    return root.posts_has_more;
  }

  return undefined;
}

export async function fetchProfilePostsFromWordPress(
  wordPressBaseUrl: string,
  username: string,
  page: number,
  pageSize: number,
  authToken?: string,
): Promise<ProfilePostsResult> {
  const safePage = normalizePage(page);
  const safeSize = normalizePageSize(pageSize, FEED_GRID_PAGE_SIZE);
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : undefined;
  const encodedUser = encodeURIComponent(username);

  const dedicatedUrl = `${wordPressBaseUrl}/wp-json/pikcir/v1/profile/${encodedUser}/posts`;

  try {
    const { data, status } = await axios.get(dedicatedUrl, {
      headers,
      params: {
        page: safePage,
        per_page: safeSize,
      },
      validateStatus: () => true,
    });

    if (status >= 200 && status < 300) {
      const posts = extractPostsFromProfilePayload(data);
      const postCount = extractPostCount(data);
      const wpHasMore = extractHasMore(data);
      const hasMore =
        wpHasMore ??
        (postCount != null
          ? safePage * safeSize < postCount
          : posts.length >= safeSize);

      return {
        posts,
        has_more: hasMore,
        post_count: postCount,
        page: safePage,
        per_page: safeSize,
      };
    }
  } catch {
    /* dedicated route yoksa profile fallback */
  }

  const wpFetchSize = safePage * safeSize;
  const profileUrl = `${wordPressBaseUrl}/wp-json/pikcir/v1/profile/${encodedUser}`;
  const { data } = await axios.get(profileUrl, {
    headers,
    params: {
      page: safePage,
      per_page: wpFetchSize,
      posts_page: safePage,
      posts_per_page: safeSize,
    },
  });

  const allPosts = extractPostsFromProfilePayload(data);
  const postCount = extractPostCount(data);
  const wpHasMore = extractHasMore(data);
  const { items, hasMore: sliceHasMore } = slicePageFromFetched(
    allPosts,
    safePage,
    safeSize,
  );

  const countHasMore =
    postCount != null ? safePage * safeSize < postCount : undefined;

  return {
    posts: items,
    has_more: wpHasMore ?? countHasMore ?? sliceHasMore,
    post_count: postCount,
    page: safePage,
    per_page: safeSize,
  };
}
