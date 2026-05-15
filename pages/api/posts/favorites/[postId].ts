import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const AUTH_COOKIE_NAME = "auth_token";

const getWordPressBaseUrl = () => {
  const baseUrl =
    process.env.WORDPRESS_API_URL ?? process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

  return baseUrl?.replace(/\/$/, "") ?? "";
};

/**
 * GET /api/posts/favorites/:postId — Pikleyenler (WordPress …/posts/{id}/favorites).
 * Segment sırası, Turbopack’ın [postId]/favorites alt yolunu 404 yapma sorunundan kaçınır.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const postIdRaw = req.query.postId;
  const postId = Array.isArray(postIdRaw) ? postIdRaw[0] : postIdRaw;

  if (typeof postId !== "string" || !postId.trim()) {
    return res.status(400).json({ message: "Gecersiz post ID" });
  }

  const wpPostId = postId.trim();
  if (!/^\d+$/.test(wpPostId)) {
    return res.status(400).json({ message: "Gecersiz post ID" });
  }

  const wordPressBaseUrl = getWordPressBaseUrl();
  const authToken = req.cookies[AUTH_COOKIE_NAME];

  if (!wordPressBaseUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const { data, status } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/posts/${encodeURIComponent(wpPostId)}/favorites`,
      { headers },
    );

    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    return res.status(status).json(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 502;
      const body = error.response?.data as { message?: string };
      const message =
        typeof body?.message === "string"
          ? body.message
          : error.message ??
            "Pikleyenler listesi alinirken bir hata olustu";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress fav listesi sirasinda beklenmeyen bir hata olustu",
    });
  }
}
