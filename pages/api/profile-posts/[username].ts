import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { setApiCacheHeaders } from "@/src/apiResponseCache";
import { FEED_GRID_PAGE_SIZE, normalizePage, normalizePageSize } from "@/src/feedPagination";
import { fetchProfilePostsFromWordPress } from "@/src/server/profile-posts";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/server/wp-auth-me-profile";

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

  const usernameRaw = Array.isArray(req.query.username)
    ? req.query.username[0]
    : req.query.username;

  if (!usernameRaw || typeof usernameRaw !== "string") {
    return res.status(400).json({ message: "Kullanici adi bulunamadi" });
  }

  const wordPressBaseUrl = getWordPressBaseUrl();
  if (!wordPressBaseUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  const page = normalizePage(req.query.page);
  const perPage = normalizePageSize(req.query.per_page, FEED_GRID_PAGE_SIZE);
  const authToken = req.cookies[AUTH_TOKEN_COOKIE_NAME];

  try {
    const result = await fetchProfilePostsFromWordPress(
      wordPressBaseUrl,
      usernameRaw,
      page,
      perPage,
      authToken,
    );

    setApiCacheHeaders(res, "profile");

    return res.status(200).json(result);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Profil gonderileri alinamadi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "Profil gonderileri alinirken beklenmeyen bir hata olustu",
    });
  }
}
