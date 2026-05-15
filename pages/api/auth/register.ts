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

  if (!wordPressBaseUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  try {
    const { data, status } = await axios.post(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/auth/register`,
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
    if (axios.isAxiosError(error)) {
      const responseMessage =
        typeof error.response?.data === "string"
          ? error.response.data.trim()
          : typeof error.response?.data?.message === "string"
            ? error.response.data.message.trim()
            : "";

      const fallbackMessage = error.code === "ECONNREFUSED"
        ? "WordPress baglantisi kurulamadi"
        : error.message ?? "Kayit olusturulamadi";

      return res.status(error.response?.status ?? 500).json({
        message: responseMessage || fallbackMessage,
      });
    }

    return res.status(500).json({
      message: "Kayit sirasinda beklenmeyen bir hata olustu",
    });
  }
}