import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const AUTH_COOKIE_NAME = "auth_token";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

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

  if (!wordPressBaseUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  if (!authToken) {
    return res.status(401).json({
      message: "Yetkilendirme bilgisi bulunamadi",
    });
  }

  try {
    const { data, status } = await axios.post(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/posts`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
    );

    return res.status(status).json({
      post: data.post ?? null,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : error.message ?? "Post olusturulamadi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress post istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}