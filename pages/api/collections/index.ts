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
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressBaseUrl = getWordPressBaseUrl();
  const authToken = req.cookies[AUTH_COOKIE_NAME];

  if (!wordPressBaseUrl) {
    return res.status(500).json({ message: "WORDPRESS_API_URL tanimli degil" });
  }

  if (!authToken) {
    return res.status(401).json({ message: "Yetkilendirme bilgisi bulunamadi" });
  }

  try {
    const { data, status } = await axios({
      method: req.method,
      url: `${wordPressBaseUrl}/wp-json/pikcir/v1/collections`,
      data: req.method === "POST" ? req.body : undefined,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    return res.status(status).json({
      collections: data.collections ?? undefined,
      collection: data.collection ?? undefined,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const upstreamMessage =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "";
      const message =
        statusCode === 404
          ? "WordPress koleksiyon route'u yayinda bulunamadi. wp-theme degisikliklerini deploy etmeniz gerekiyor."
          : upstreamMessage || error.message || "Koleksiyon istegi tamamlanamadi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress koleksiyon istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}