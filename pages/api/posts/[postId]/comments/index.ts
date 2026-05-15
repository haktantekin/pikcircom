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

  const url = `${wordPressBaseUrl}/wp-json/pikcir/v1/posts/${encodeURIComponent(wpPostId)}/comments`;

  try {
    if (req.method === "GET") {
      /** Herkese açık liste; geçersiz/expired Bearer bazı ortamlarda 401 üretebiliyor, axios da ana sayfaya atıyor. */
      const { data, status } = await axios.get(url, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: { _nocache: Date.now() },
      });
      res.setHeader("Cache-Control", "private, no-store, max-age=0");
      return res.status(status).json(data);
    }

    if (req.method === "POST") {
      if (!authToken) {
        return res.status(401).json({
          message: "Yorum icin giris yapmalisin",
        });
      }
      const { data, status } = await axios.post(url, req.body ?? {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      return res.status(status).json(data);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return res.status(502).json({
          message:
            "WordPress API'ye baglanilamadi (baglanti reddedildi veya zaman asimi). WORDPRESS_API_URL ve calisan WP sunucusunu kontrol edin.",
          detail: error.code ?? error.message,
        });
      }
      const statusCode = error.response.status;
      const body = error.response.data as { message?: string };
      const message =
        typeof body?.message === "string"
          ? body.message
          : error.message ?? "Yorum istegi basarisiz";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress yorum istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}
