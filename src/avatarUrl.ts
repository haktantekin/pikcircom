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

/** Kapak yoksa varsayılan örnek görsel. */
export const DEFAULT_COVER_SRC = "/coverExample.jpg";

const COVER_URL_KEYS = [
  "cover",
  "pikcir_cover",
  "large",
  "medium",
  "960",
  "medium_large",
  "1024x1024",
  "300",
  "1536x1536",
  "96",
  "full",
  "2048x2048",
] as const;

/**
 * WordPress coverUrls haritası + düz coverImageUrl; tüm bilinen boyut anahtarları ve
 * kalan string değerler taranır (çoğu kurulumda `full` yerine `large` vb. gelir).
 */
export function pickCoverUrlFromMap(
  coverUrls?: Record<string, unknown> | null,
  coverImageUrl?: string | null,
): string {
  const flat = typeof coverImageUrl === "string" ? coverImageUrl.trim() : "";
  if (flat !== "") {
    return flat;
  }

  if (!coverUrls || typeof coverUrls !== "object") {
    return DEFAULT_COVER_SRC;
  }

  for (const key of COVER_URL_KEYS) {
    const u = coverUrls[key];
    if (typeof u === "string" && u.trim() !== "") {
      return u.trim();
    }
  }

  for (const value of Object.values(coverUrls)) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }

  return DEFAULT_COVER_SRC;
}

/** CSS background-image: url(...) için güvenli sarma (özel karakterler kırılmasın). */
export function cssUrlValue(href: string): string {
  return `url(${JSON.stringify(href.trim())})`;
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
