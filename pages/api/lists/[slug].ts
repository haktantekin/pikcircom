import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

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
  const slugRaw = req.query.slug;
  const slug = typeof slugRaw === "string" ? slugRaw : "";

  if (!wordPressBaseUrl) {
    return res.status(500).json({ message: "WORDPRESS_API_URL tanimli degil" });
  }

  if (!slug) {
    return res.status(400).json({ message: "Liste slug bulunamadi" });
  }

  const period =
    typeof req.query.period === "string" ? req.query.period : undefined;

  try {
    const { data, status } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/lists/${encodeURIComponent(slug)}`,
      {
        headers: authToken
          ? { Authorization: `Bearer ${authToken}` }
          : undefined,
        params: period ? { period } : undefined,
      },
    );

    return res.status(status).json({
      list: data.list ?? null,
      posts: data.posts ?? [],
      period: data.period ?? "all",
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Liste detayi alinamadi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress liste detay istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}
