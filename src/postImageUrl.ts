export type PostImageUrls = Record<string, string>;

export type PostImageVariant = "feed" | "grid" | "thumb" | "large" | "full";

const VARIANT_KEYS: Record<PostImageVariant, readonly string[]> = {
  feed: ["feed", "pikcir_feed", "large", "medium", "full"],
  grid: ["grid", "pikcir_grid", "feed", "large", "medium", "full"],
  thumb: ["thumb", "pikcir_thumb", "grid", "thumbnail", "medium", "full"],
  large: ["large", "feed", "full"],
  full: ["full", "large", "feed"],
};

function pickFromMap(
  map: PostImageUrls | null | undefined,
  keys: readonly string[],
): string {
  if (!map || typeof map !== "object") {
    return "";
  }
  for (const key of keys) {
    const value = map[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  for (const value of Object.values(map)) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return "";
}

/** Akış / kart için görsel URL (API imageUrls veya düz image). */
export function pickPostImageUrl(
  image?: string | null,
  imageUrls?: PostImageUrls | null,
  variant: PostImageVariant = "feed",
): string {
  const fromMap = pickFromMap(imageUrls, VARIANT_KEYS[variant]);
  if (fromMap) {
    return fromMap;
  }
  const flat = typeof image === "string" ? image.trim() : "";
  return flat;
}
