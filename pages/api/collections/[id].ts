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
  if (req.method !== "PATCH" && req.method !== "DELETE") {
    res.setHeader("Allow", ["PATCH", "DELETE"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressBaseUrl = getWordPressBaseUrl();
  const authToken = req.cookies[AUTH_COOKIE_NAME];
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (!wordPressBaseUrl) {
    return res.status(500).json({ message: "WORDPRESS_API_URL tanimli degil" });
  }

  if (!authToken) {
    return res.status(401).json({ message: "Yetkilendirme bilgisi bulunamadi" });
  }

  if (!id) {
    return res.status(400).json({ message: "Koleksiyon bulunamadi" });
  }

  try {
    const { data, status } = await axios({
      method: req.method,
      url: `${wordPressBaseUrl}/wp-json/pikcir/v1/collections/${encodeURIComponent(id)}`,
      data: req.method === "PATCH" ? req.body : undefined,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    return res.status(status).json({
      collection: data.collection ?? null,
      deletedId: data.deletedId ?? null,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : error.message ?? "Koleksiyon islemi tamamlanamadi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress koleksiyon detay istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}