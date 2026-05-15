import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { handleProfileMe } from "./lib/profile-me-handler";
import { AUTH_TOKEN_COOKIE_NAME } from "@/src/server/wp-auth-me-profile";

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
  const usernameRaw = Array.isArray(req.query.username)
    ? req.query.username[0]
    : req.query.username;

  if (
    typeof usernameRaw === "string" &&
    usernameRaw.toLowerCase() === "me"
  ) {
    return handleProfileMe(req, res);
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressBaseUrl = getWordPressBaseUrl();
  const username = usernameRaw;
  const authToken = req.cookies[AUTH_TOKEN_COOKIE_NAME];

  if (!wordPressBaseUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  if (!username) {
    return res.status(400).json({
      message: "Kullanici adi bulunamadi",
    });
  }

  try {
    const { data } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/profile/${encodeURIComponent(username)}`,
      {
        headers: {
          ...(authToken
            ? { Authorization: `Bearer ${authToken}` }
            : {}),
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: { _nocache: Date.now() },
      },
    );

    res.setHeader("Cache-Control", "private, no-store, max-age=0");

    return res.status(200).json({
      user: data.user ?? null,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        error.response?.data?.message ?? "Profil bilgisi alinamadi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress profil istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}
