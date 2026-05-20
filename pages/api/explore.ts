import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

import { setApiCacheHeaders } from "@/src/apiResponseCache";
import {
  FEED_PAGE_SIZE,
  normalizePage,
  normalizePageSize,
  slicePageFromFetched,
} from "@/src/feedPagination";

const AUTH_COOKIE_NAME = "auth_token";

const getWordPressBaseUrl = () => {
  const baseUrl =
    process.env.WORDPRESS_API_URL ?? process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

  return baseUrl?.replace(/\/$/, "") ?? "";
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressBaseUrl = getWordPressBaseUrl();
  const authToken = req.cookies[AUTH_COOKIE_NAME];

  if (!wordPressBaseUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  const tagRaw = req.query.tag;
  const tag = typeof tagRaw === "string" ? tagRaw : undefined;
  const pageNum = normalizePage(req.query.page);
  const pageSize = normalizePageSize(req.query.per_page, FEED_PAGE_SIZE);
  const wpFetchSize = pageNum * pageSize;

  try {
    const { data, status } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/explore`,
      {
        headers: authToken
          ? { Authorization: `Bearer ${authToken}` }
          : undefined,
        params: {
          ...(tag ? { tag } : {}),
          per_page: String(wpFetchSize),
          page: String(pageNum),
        },
      },
    );

    setApiCacheHeaders(res, "explore");

    const allPosts = Array.isArray(data?.posts) ? data.posts : [];
    const wpHasMore =
      typeof data?.has_more === "boolean" ? data.has_more : undefined;
    const { items, hasMore } = slicePageFromFetched(
      allPosts,
      pageNum,
      pageSize,
    );

    return res.status(status).json({
      tag: data.tag ?? "",
      posts: items,
      has_more: wpHasMore ?? hasMore,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Kesfet icerigi alinamadi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress kesfet istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}
