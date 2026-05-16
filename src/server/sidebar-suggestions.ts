import axios from "axios";
import {
  fetchFlatAuthProfileFromWordPress,
} from "@/src/server/wp-auth-me-profile";

export type SidebarRecentUser = {
  id?: string;
  userName: string;
  firstName?: string;
  avatarUrls?: Record<string, string>;
  createdDate?: string;
  isFollowing?: boolean;
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

export async function fetchViewerFollowingUserNames(
  wordPressBaseUrl: string,
  authToken: string,
): Promise<Set<string>> {
  const token = decodeAuthToken(authToken);
  if (!token) {
    return new Set();
  }

  const me = await fetchFlatAuthProfileFromWordPress(wordPressBaseUrl, token);
  if (!me.ok) {
    return new Set();
  }

  const viewerUserName =
    typeof me.data.userName === "string" ? me.data.userName.trim() : "";
  if (!viewerUserName) {
    return new Set();
  }

  try {
    const { data } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/profile/${encodeURIComponent(viewerUserName)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: { _nocache: Date.now() },
      },
    );

    const followeds = Array.isArray(data?.user?.followeds)
      ? data.user.followeds
      : [];
    const following = new Set<string>();

    for (const row of followeds) {
      const name =
        typeof row?.followedUserName === "string"
          ? row.followedUserName.trim().toLowerCase()
          : "";
      if (name) {
        following.add(name);
      }
    }

    return following;
  } catch {
    return new Set();
  }
}

export function enrichRecentUsersWithFollowing(
  users: SidebarRecentUser[],
  followingUserNames: Set<string>,
): SidebarRecentUser[] {
  return users.map((user) => {
    const userName =
      typeof user.userName === "string" ? user.userName.trim() : "";
    const fromApi = user.isFollowing === true;
    const fromFollowingList =
      userName !== "" && followingUserNames.has(userName.toLowerCase());

    return {
      ...user,
      isFollowing: fromApi || fromFollowingList,
    };
  });
}
