import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { fetchPostsByIdsFromWordPress } from "@/src/server/hydratePostsByIds";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/server/wp-auth-me-profile";

function parseIds(raw: unknown): string[] {
  if (typeof raw === "string") {
    return [...new Set(raw.split(",").map((id) => id.trim()).filter(Boolean))];
  }

  if (Array.isArray(raw)) {
    return [...new Set(raw.map((id) => String(id).trim()).filter(Boolean))];
  }

  return [];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const ids = parseIds(req.query.ids);
  if (ids.length === 0) {
    return res.status(400).json({ message: "Gecersiz post ID listesi" });
  }

  if (ids.length > 50) {
    return res.status(400).json({ message: "En fazla 50 post istenebilir" });
  }

  const authToken = req.cookies[AUTH_TOKEN_COOKIE_NAME];

  try {
    const posts = await fetchPostsByIdsFromWordPress(ids, authToken);
    res.setHeader("Cache-Control", "private, max-age=60, stale-while-revalidate=120");
    return res.status(200).json({ posts });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Gonderiler alinamadi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "Gonderi listesi alinirken beklenmeyen bir hata olustu",
    });
  }
}
