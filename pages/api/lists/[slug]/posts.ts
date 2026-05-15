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
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressBaseUrl = getWordPressBaseUrl();
  const authToken = req.cookies[AUTH_COOKIE_NAME];
  const slugRaw = req.query.slug;
  const listId = typeof slugRaw === "string" ? slugRaw : "";

  if (!wordPressBaseUrl) {
    return res.status(500).json({ message: "WORDPRESS_API_URL tanimli degil" });
  }

  if (!authToken) {
    return res.status(401).json({ message: "Yetkilendirme bilgisi bulunamadi" });
  }

  if (!listId) {
    return res.status(400).json({ message: "Liste ID bulunamadi" });
  }

  try {
    const { data, status } = await axios.post(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/lists/${encodeURIComponent(listId)}/posts`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.status(status).json({
      list: data.list ?? null,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Post listeye eklenemedi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress listeye post ekleme istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}
