import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  AUTH_TOKEN_COOKIE_NAME,
  getWordPressPikcirApiRoot,
  getWordPressSiteRoot,
} from "@/src/server/wp-auth-me-profile";
import { mapWordPressProxyError } from "@/src/server/wordpressErrors";

const AUTH_COOKIE_NAME = AUTH_TOKEN_COOKIE_NAME;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressSiteRoot = getWordPressSiteRoot();
  const registerUrl = wordPressSiteRoot
    ? `${getWordPressPikcirApiRoot(wordPressSiteRoot)}/auth/register`
    : "";

  if (!registerUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  try {
    const { data, status } = await axios.post(
      registerUrl,
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      },
    );

    const cookieParts = [
      `${AUTH_COOKIE_NAME}=${encodeURIComponent(data.access_token)}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${Number(data.expires_in ?? 3600)}`,
    ];

    if (process.env.NODE_ENV === "production") {
      cookieParts.push("Secure");
    }

    res.setHeader("Set-Cookie", cookieParts.join("; "));

    return res.status(status).json({
      id: data.user?.id,
      userName: data.user?.userName,
      email: data.user?.email ?? null,
      displayName: data.user?.displayName,
      firstName: data.user?.firstName ?? null,
      lastName: data.user?.lastName ?? null,
      phoneNumber: data.user?.phoneNumber ?? null,
      birthDate: data.user?.birthDate ?? null,
      userDescription: data.user?.userDescription ?? null,
      profileImageId: data.user?.profileImageId ?? null,
      avatarUrls: data.user?.avatarUrls ?? {},
    });
  } catch (error) {
    const fallbackMessage =
      axios.isAxiosError(error) && error.code === "ECONNREFUSED"
        ? "WordPress baglantisi kurulamadi"
        : "Kayit olusturulamadi";
    const mapped = mapWordPressProxyError(error, fallbackMessage);
    return res.status(mapped.status).json({
      message: mapped.message,
      ...(mapped.code ? { code: mapped.code } : {}),
    });
  }
}