import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  AUTH_TOKEN_COOKIE_NAME,
  getWordPressPikcirApiRoot,
  getWordPressSiteRoot,
} from "@/src/server/wp-auth-me-profile";
import { mapWordPressProxyError } from "@/src/server/wordpressErrors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressSiteRoot = getWordPressSiteRoot();
  const wordPressLoginUrl = wordPressSiteRoot
    ? `${getWordPressPikcirApiRoot(wordPressSiteRoot)}/auth/login`
    : "";

  if (!wordPressLoginUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  const { userName, password } = req.body ?? {};

  if (!userName || !password) {
    return res.status(400).json({
      message: "Kullanici adi ve sifre zorunludur",
    });
  }

  try {
    const { data } = await axios.post(wordPressLoginUrl, {
      username: userName,
      password,
    });

    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const maxAge = Number(data.expires_in ?? 3600);

    res.setHeader("Set-Cookie", [
      `${AUTH_TOKEN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`,
      `${AUTH_TOKEN_COOKIE_NAME}=${encodeURIComponent(data.access_token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
    ]);

    return res.status(200).json({
      id: data.user?.id,
      userName: data.user?.userName ?? userName,
      email: data.user?.email ?? null,
      displayName: data.user?.displayName ?? data.user?.userName ?? userName,
      firstName: data.user?.firstName ?? null,
      lastName: data.user?.lastName ?? null,
      birthDate: data.user?.birthDate ?? null,
      userDescription: data.user?.userDescription ?? null,
      profileImageId: data.user?.profileImageId ?? null,
      avatarUrls: data.user?.avatarUrls ?? {},
    });
  } catch (error) {
    const mapped = mapWordPressProxyError(
      error,
      "Kullanici adi ya da sifre eslesmedi",
    );
    return res.status(mapped.status).json({
      message: mapped.message,
      ...(mapped.code ? { code: mapped.code } : {}),
    });
  }
}
