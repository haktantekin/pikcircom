export type PostLike = Record<string, unknown> & {
  id?: string;
  image?: string;
  imageUrls?: Record<string, string>;
};

export function getCmsSiteOrigin(): string {
  const raw =
    process.env.WORDPRESS_API_URL ??
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ??
    "";

  return raw
    .replace(/\/$/, "")
    .replace(/\/wp-json(?:\/.*)?$/, "");
}

/** Göreli veya eksik köklü medya URL'lerini CMS köküne çevirir. */
export function normalizeMediaUrl(url?: string | null): string {
  const trimmed = typeof url === "string" ? url.trim() : "";
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  const origin = getCmsSiteOrigin();
  if (!origin) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${origin}${trimmed}`;
  }

  return `${origin}/${trimmed.replace(/^\/+/, "")}`;
}

export function normalizePostImageUrls(
  imageUrls?: Record<string, string> | null,
): Record<string, string> | undefined {
  if (!imageUrls || typeof imageUrls !== "object") {
    return undefined;
  }

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(imageUrls)) {
    const next = normalizeMediaUrl(value);
    if (next) {
      normalized[key] = next;
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export function normalizePostMediaFields<T extends PostLike>(post: T): T {
  const imageUrls = normalizePostImageUrls(post.imageUrls);
  const image =
    normalizeMediaUrl(post.image) ||
    imageUrls?.full ||
    imageUrls?.feed ||
    imageUrls?.thumb;

  return {
    ...post,
    ...(image ? { image } : {}),
    ...(imageUrls ? { imageUrls } : {}),
  };
}

export function normalizePostsMediaFields<T extends PostLike>(posts: T[]): T[] {
  return posts.map((post) => normalizePostMediaFields(post));
}

export function extractPostFromApiPayload(data: unknown): PostLike | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const root = data as Record<string, unknown>;
  const raw =
    root.post && typeof root.post === "object"
      ? (root.post as PostLike)
      : (root as PostLike);

  const id = raw.id != null ? String(raw.id).trim() : "";
  if (!id) {
    return null;
  }

  return normalizePostMediaFields({ ...raw, id });
}

export function mergePostsById<T extends { id: string }>(
  primary: T[],
  secondary: T[],
): T[] {
  const seen = new Set(primary.map((post) => String(post.id).trim()));
  const merged = [...primary];

  for (const post of secondary) {
    const id = String(post.id ?? "").trim();
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    merged.push(post);
  }

  return merged;
}
