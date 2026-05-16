import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  enrichRecentUsersWithFollowing,
  fetchViewerFollowingUserNames,
  type SidebarRecentUser,
} from "@/src/server/sidebar-suggestions";
import { setApiCacheHeaders } from "@/src/apiResponseCache";

const AUTH_COOKIE_NAME = "auth_token";

const getWordPressBaseUrl = () => {
  const baseUrl =
    process.env.WORDPRESS_API_URL ?? process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

  return baseUrl?.replace(/\/$/, "") ?? "";
};

function decodeAuthToken(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  const wordPressBaseUrl = getWordPressBaseUrl();
  const authToken = decodeAuthToken(req.cookies[AUTH_COOKIE_NAME]);

  if (!wordPressBaseUrl) {
    return res.status(500).json({
      message: "WORDPRESS_API_URL tanimli degil",
    });
  }

  try {
    const { data, status } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/sidebar-suggestions`,
      {
        headers: authToken
          ? {
              Authorization: `Bearer ${authToken}`,
            }
          : undefined,
      },
    );

    const recentRegisteredUsers = Array.isArray(data.recentRegisteredUsers)
      ? (data.recentRegisteredUsers as SidebarRecentUser[])
      : [];

    let enrichedRecentUsers = recentRegisteredUsers;

    if (authToken) {
      const followingUserNames = await fetchViewerFollowingUserNames(
        wordPressBaseUrl,
        authToken,
      );
      enrichedRecentUsers = enrichRecentUsersWithFollowing(
        recentRegisteredUsers,
        followingUserNames,
      );
    }

    setApiCacheHeaders(res, "sidebar");

    return res.status(status).json({
      mostPopularUsers: data.mostPopularUsers ?? [],
      mostProductiveUsers: data.mostProductiveUsers ?? [],
      recentRegisteredUsers: enrichedRecentUsers,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status ?? 500;
      const message =
        error.response?.data?.message ?? "Yeni kullanicilar alinamadi";

      return res.status(statusCode).json({ message });
    }

    return res.status(500).json({
      message: "WordPress sidebar istegi sirasinda beklenmeyen bir hata olustu",
    });
  }
}
