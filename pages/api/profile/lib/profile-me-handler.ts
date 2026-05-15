/**
 * Ortak işleyici — GET/PATCH/POST /api/profile/me.
 * Bazı Next sürümlerinde yol `pages/api/profile/[username]` ile özdeş olduğundan
 * `username === "me"` istekleri de buradan yürütülür.
 */

import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  AUTH_TOKEN_COOKIE_NAME,
  fetchFlatAuthProfileFromWordPress,
  getWordPressSiteRoot,
} from "@/src/server/wp-auth-me-profile";

const shouldTryNextWpUrl = (status: number | undefined) =>
  status === 404 || status === 405;

function resolveProfilePostUrls(wordPressSiteRoot: string): string[] {
  const custom = process.env.WORDPRESS_PROFILE_POST_PATH?.trim();

  if (custom) {
    if (/^https?:\/\//i.test(custom)) {
      return [custom];
    }

    const path = custom.replace(/^\/+/, "");
    return [`${wordPressSiteRoot}/${path}`];
  }

  const apiRoot = `${wordPressSiteRoot}/wp-json/pikcir/v1`;
  return [`${apiRoot}/auth/profile`, `${apiRoot}/profile`];
}

export async function handleProfileMe(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (
    req.method !== "GET" &&
    req.method !== "PATCH" &&
    req.method !== "POST"
  ) {
    res.setHeader("Allow", ["GET", "PATCH", "POST"]);
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

  if (req.method === "GET") {
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

  const urls = resolveProfilePostUrls(wordPressBaseUrl);
  let lastAxiosError: unknown;

  try {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];

      try {
        const { data, status } = await axios.post(url, req.body, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          validateStatus: () => true,
        });

        if (shouldTryNextWpUrl(status) && i < urls.length - 1) {
          lastAxiosError = { response: { status, data }, config: { url } };
          continue;
        }

        if (status >= 400) {
          const message =
            typeof (data as { message?: unknown })?.message === "string"
              ? (data as { message: string }).message
              : typeof (data as { code?: unknown })?.code === "string"
                ? `${(data as { code: string }).code}`
                : "Profil guncellenemedi";

          return res.status(status).json({ message });
        }

        res.setHeader("Cache-Control", "private, no-store, max-age=0");

        return res.status(status).json({
          user:
            (data as { user?: unknown }).user ?? null,
        });
      } catch (err) {
        if (!axios.isAxiosError(err)) {
          throw err;
        }

        lastAxiosError = err;

        const st = err.response?.status;
        if (shouldTryNextWpUrl(st) && i < urls.length - 1) {
          continue;
        }

        const statusCode = st ?? 500;
        const data = err.response?.data;
        const message =
          typeof data === "object" &&
          data !== null &&
          typeof (data as { message?: string }).message === "string"
            ? (data as { message: string }).message.trim()
            : err.message ?? "Profil guncellenemedi";

        return res.status(statusCode).json({ message });
      }
    }

    if (axios.isAxiosError(lastAxiosError) && lastAxiosError.response) {
      const d = lastAxiosError.response.data;
      const message =
        typeof d === "object" &&
        d !== null &&
        typeof (d as { message?: string }).message === "string"
          ? (d as { message: string }).message
          : "Profil guncellenemedi";

      return res
        .status(lastAxiosError.response.status ?? 500)
        .json({ message });
    }

    return res.status(500).json({
      message: "Profil guncellenemedi (WordPress yolu bulunamadi)",
    });
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      return res.status(500).json({
        message:
          "WordPress profil guncellemesi sirasinda beklenmeyen bir hata olustu",
      });
    }

    const statusCode = error.response?.status ?? 500;
    const message =
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : error.message ?? "Profil guncellenemedi";

    return res.status(statusCode).json({ message });
  }
}
