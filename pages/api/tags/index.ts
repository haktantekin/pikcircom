import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { setApiCacheHeaders } from "@/src/apiResponseCache";

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

  if (!wordPressBaseUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  try {
    const { data, status } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/tags`,
      {
        headers: authToken
          ? { Authorization: `Bearer ${authToken}` }
          : undefined,
      },
    );

    setApiCacheHeaders(res, "tags");

    return res.status(status).json({
      tags: data.tags ?? [],
      exploreTags: data.exploreTags ?? [],
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Etiketler alinamadi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress etiket istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}
