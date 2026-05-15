import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const AUTH_COOKIE_NAME = "auth_token";

const getWordPressBaseUrl = () => {
  const baseUrl =
    process.env.WORDPRESS_API_URL ?? process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

  return baseUrl?.replace(/\/$/, "") ?? "";
};

const getWordPressJwtUrl = () => {
  const baseUrl = getWordPressBaseUrl();

  if (!baseUrl) {
    return "";
  }

  return `${baseUrl}/wp-json/pikcir/v1/auth/login`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressJwtUrl = getWordPressJwtUrl();

  if (!wordPressJwtUrl) {
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
    const { data } = await axios.post(wordPressJwtUrl, {
      username: userName,
      password,
    });

    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const maxAge = Number(data.expires_in ?? 3600);

    res.setHeader("Set-Cookie", [
      `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`,
      `${AUTH_COOKIE_NAME}=${encodeURIComponent(data.access_token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
    ]);

    return res.status(200).json({
      id: data.user?.id,
      userName: data.user?.userName ?? userName,
      email: data.user?.email ?? null,
      displayName: data.user?.displayName ?? data.user?.userName ?? userName,
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
      const statusCode = error.response?.status ?? 500;
      const message =
        error.response?.data?.message ?? "Kullanici adi ya da sifre eslesmedi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress login sirasinda beklenmeyen bir hata olustu",
    });
  }
}