import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { getWordPressSiteRoot } from "@/src/server/wp-auth-me-profile";

const AUTH_COOKIE_NAME = "auth_token";

export type SearchType = "posts" | "hashtags" | "users" | "lists" | "tags";

function normalizeType(raw: unknown): SearchType {
  const value = typeof raw === "string" ? raw : "posts";
  if (
    value === "hashtags" ||
    value === "users" ||
    value === "lists" ||
    value === "tags"
  ) {
    return value;
  }
  return "posts";
}

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressBaseUrl = getWordPressSiteRoot();
  const authToken = decodeAuthToken(req.cookies[AUTH_COOKIE_NAME]);

  if (!wordPressBaseUrl) {
    return res.status(500).json({ message: "WORDPRESS_API_URL tanimli degil" });
  }

  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const type = normalizeType(req.query.type);
  const perPageRaw = req.query.per_page;
  const perPage =
    typeof perPageRaw === "string" && perPageRaw !== ""
      ? perPageRaw
      : undefined;

  try {
    const { data, status } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/search`,
      {
        headers: authToken
          ? { Authorization: `Bearer ${authToken}` }
          : undefined,
        // per_page en sonda ve type=posts ile bitince WP REST rotayi bulamiyor.
        params: {
          q,
          ...(perPage ? { per_page: perPage } : {}),
          type,
        },
      },
    );

    res.setHeader("Cache-Control", "private, no-store, max-age=0");

    return res.status(status).json(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Arama sonuclari alinamadi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "Arama istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}
