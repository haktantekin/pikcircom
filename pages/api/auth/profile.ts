import type { NextApiRequest, NextApiResponse } from "next";
import {
  AUTH_TOKEN_COOKIE_NAME,
  fetchFlatAuthProfileFromWordPress,
  getWordPressSiteRoot,
} from "@/src/server/wp-auth-me-profile";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressBaseUrl = getWordPressSiteRoot();
  const authToken = req.cookies[AUTH_TOKEN_COOKIE_NAME];

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

  const result = await fetchFlatAuthProfileFromWordPress(
    wordPressBaseUrl,
    authToken,
  );

  if (!result.ok) {
    return res.status(result.status).json({ message: result.message });
  }

  res.setHeader("Cache-Control", "private, no-store, max-age=0");

  return res.status(200).json(result.data);
}
