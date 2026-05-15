/** Profil resmi yoksa site logosu (public/logo.png). */
export const DEFAULT_AVATAR_SRC = "/logo.png";

const AVATAR_SIZE_KEYS = ["full", "96", "72", "48"] as const;

/** WordPress avatarUrls haritasından URL; yoksa logo. */
export function pickAvatarUrlFromMap(
  avatarUrls?: Record<string, string> | null,
): string {
  if (!avatarUrls) {
    return DEFAULT_AVATAR_SRC;
  }

  for (const key of AVATAR_SIZE_KEYS) {
    const u = avatarUrls[key];
    if (typeof u === "string" && u.trim() !== "") {
      return u.trim();
    }
  }

  for (const value of Object.values(avatarUrls)) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return DEFAULT_AVATAR_SRC;
}

/** Post/yorum vb. düz profileImage alanı; boş veya eski placeholder ise logo. */
export function resolveProfileImageUrl(profileImage?: string | null): string {
  const trimmed = typeof profileImage === "string" ? profileImage.trim() : "";
  if (trimmed === "" || trimmed === "/profile.jpg") {
    return DEFAULT_AVATAR_SRC;
  }
  return trimmed;
}

/** Gönderi/yorum yazarının resmi; yoksa profil avatarUrls, o da yoksa logo. */
export function resolvePostAuthorProfileImage(
  profileImage?: string | null,
  avatarUrls?: Record<string, string> | null,
): string {
  const fromPost = typeof profileImage === "string" ? profileImage.trim() : "";
  if (fromPost !== "" && fromPost !== "/profile.jpg") {
    return fromPost;
  }
  return pickAvatarUrlFromMap(avatarUrls);
}
