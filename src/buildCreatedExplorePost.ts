import type { ExplorePost } from "@/src/feedPostTypes";
import type { AuthProfileData } from "@/src/fetchAuthProfile";
import { pickAvatarUrlFromMap } from "@/src/avatarUrl";
import { normalizeApiPostPayload } from "@/src/postDetailHelpers";

export function buildCreatedExplorePost(options: {
  postId: string;
  apiPost: unknown;
  profile: AuthProfileData;
  description: string;
  tagNames: string[];
  previewImageUrl: string | null;
}): ExplorePost {
  const { postId, apiPost, profile, description, tagNames, previewImageUrl } =
    options;
  const normalized = normalizeApiPostPayload(apiPost ?? { id: postId });
  const userName =
    (typeof profile.userName === "string" ? profile.userName : "") ||
    normalized?.userName ||
    "";

  const profileImage =
    normalized?.profileImage ??
    (profile.avatarUrls
      ? pickAvatarUrlFromMap(profile.avatarUrls)
      : undefined);

  const tags = tagNames.map((name) => {
    const slug = name.replace(/^#/, "").trim();
    return { slug, name: slug };
  });

  return {
    id: postId,
    subject: normalized?.subject ?? description,
    userName,
    createDate: normalized?.createDate ?? new Date().toISOString(),
    image: normalized?.image ?? previewImageUrl ?? undefined,
    imageUrls: normalized?.imageUrls,
    profileImage,
    commentCount: normalized?.commentCount ?? 0,
    favoriteCount: normalized?.favoriteCount ?? 0,
    isFavorited: normalized?.isFavorited ?? false,
    authorIsFollowing: true,
    tags: tags.length > 0 ? tags : undefined,
  };
}
