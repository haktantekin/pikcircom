import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import {
  fetchHomeFeedFromWordPress,
  type HomeFeedScope,
} from "@/src/server/home-feed";
import { getWordPressSiteRoot } from "@/src/server/wp-auth-me-profile";

const AUTH_COOKIE_NAME = "auth_token";

function normalizeScope(raw: unknown): HomeFeedScope {
  return raw === "followed" ? "followed" : "karma";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressBaseUrl = getWordPressSiteRoot();
  const authToken = req.cookies[AUTH_COOKIE_NAME];

  if (!wordPressBaseUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  const scope = normalizeScope(req.query.scope);
  const perPageRaw = req.query.per_page;
  const perPage =
    typeof perPageRaw === "string" && perPageRaw !== ""
      ? perPageRaw
      : undefined;

  try {
    const result = await fetchHomeFeedFromWordPress(
      wordPressBaseUrl,
      scope,
      authToken,
      perPage,
    );

    res.setHeader("Cache-Control", "private, no-store, max-age=0");

    return res.status(200).json(result);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Ana sayfa akisi alinamadi";

      return res.status(200).json({
        scope,
        posts: [],
        warning: message,
      });
    }

    return res.status(200).json({
      scope,
      posts: [],
      warning: "Ana sayfa akisi alinamadi",
    });
  }
}
