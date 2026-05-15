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
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const postIdRaw = req.query.postId;
  const commentIdRaw = req.query.commentId;
  const postId = Array.isArray(postIdRaw) ? postIdRaw[0] : postIdRaw;
  const commentId = Array.isArray(commentIdRaw) ? commentIdRaw[0] : commentIdRaw;

  if (typeof postId !== "string" || !postId) {
    return res.status(400).json({ message: "Gecersiz post ID" });
  }
  if (typeof commentId !== "string" || !commentId) {
    return res.status(400).json({ message: "Gecersiz yorum ID" });
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

  const url = `${wordPressBaseUrl}/wp-json/pikcir/v1/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`;

  try {
    const { data, status } = await axios.delete(url, {
      headers: {
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
          : error.message ?? "Yorum silinemedi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress yorum silme istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}
