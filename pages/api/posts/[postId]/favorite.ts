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
  if (req.method !== "POST" && req.method !== "DELETE") {
    res.setHeader("Allow", ["POST", "DELETE"]);
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

  if (!authToken) {
    return res.status(401).json({
      message: "Pik icin giris yapmalisin",
    });
  }

  const url = `${wordPressBaseUrl}/wp-json/pikcir/v1/posts/${encodeURIComponent(wpPostId)}/favorite`;

  try {
    const { data, status } = await axios({
      method: req.method,
      url,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    return res.status(status).json(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return res.status(502).json({
          message:
            "WordPress API'ye baglanilamadi. WORDPRESS_API_URL ve WP sunucusunu kontrol edin.",
        });
      }
      const statusCode = error.response.status;
      const body = error.response.data as { message?: string };
      const message =
        typeof body?.message === "string"
          ? body.message
          : error.message ?? "Pik islemi basarisiz";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress pik istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}
