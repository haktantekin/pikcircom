import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { extractPostFromApiPayload } from "@/src/normalizePostMedia";

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
  const postIdRaw = req.query.postId;
  const postId = Array.isArray(postIdRaw) ? postIdRaw[0] : postIdRaw;

  if (typeof postId !== "string" || !postId) {
    return res.status(400).json({ message: "Gecersiz post ID" });
  }

  const wordPressBaseUrl = getWordPressBaseUrl();
  const authToken = req.cookies[AUTH_COOKIE_NAME];

  if (!wordPressBaseUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  const postUrl = `${wordPressBaseUrl}/wp-json/pikcir/v1/posts/${encodeURIComponent(postId)}`;

  if (req.method === "GET") {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const { data, status } = await axios.get(postUrl, { headers });

      const normalized = extractPostFromApiPayload(data);
      return res.status(status).json(normalized ? { post: normalized } : data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status ?? 500;
        const message =
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : error.message ?? "Post bulunamadi";

        return res.status(statusCode).json({ message });
      }

      return res.status(500).json({
        message: "WordPress post istegi sirasinda beklenmeyen bir hata olustu",
      });
    }
  }

  if (req.method === "DELETE") {
    if (!authToken) {
      return res.status(401).json({
        message: "Yetkilendirme bilgisi bulunamadi",
      });
    }

    try {
      const { data, status } = await axios.delete(postUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return res.status(status).json(data ?? { ok: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status ?? 500;
        const message =
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : error.message ?? "Gonderi silinemedi";

        return res.status(statusCode).json({ message });
      }

      return res.status(500).json({
        message: "WordPress gonderi silme istegi sirasinda beklenmeyen bir hata olustu",
      });
    }
  }

  if (req.method === "PATCH") {
    if (!authToken) {
      return res.status(401).json({
        message: "Yetkilendirme bilgisi bulunamadi",
      });
    }

    try {
      const { data, status } = await axios.patch(postUrl, req.body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      return res.status(status).json(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status ?? 500;
        const message =
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : error.message ?? "Gonderi guncellenemedi";

        return res.status(statusCode).json({ message });
      }

      return res.status(500).json({
        message: "WordPress gonderi guncelleme istegi sirasinda beklenmeyen bir hata olustu",
      });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).json({ message: "Method not allowed" });
}
