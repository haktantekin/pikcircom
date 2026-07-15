import { ingestPostSensitivity } from "@/src/sensitiveContent";
import { decodeHtmlEntities } from "@/src/decodeHtmlEntities";

export interface PostDetailTag {
  slug: string;
  name: string;
  imageUrl?: string;
}

export interface PostDetailShape {
  id: string;
  subject?: string;
  userName?: string;
  badge?: string;
  createDate?: string;
  image?: string;
  imageUrls?: Record<string, string>;
  profileImage?: string;
  commentCount?: number;
  favoriteCount?: number;
  isFavorited?: boolean;
  tags?: PostDetailTag[];
  categoryName?: string;
  isSensitive?: boolean;
}

function normalizeTags(raw: unknown): PostDetailTag[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }
  const tags: PostDetailTag[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const tag = item as Record<string, unknown>;
    const slug = typeof tag.slug === "string" ? tag.slug.trim() : "";
    const name = typeof tag.name === "string" ? tag.name.trim() : "";
    if (!slug && !name) {
      continue;
    }
    tags.push({
      slug: slug || name,
      name: name || slug,
      ...(typeof tag.imageUrl === "string"
        ? { imageUrl: tag.imageUrl }
        : {}),
    });
  }
  return tags.length > 0 ? tags : undefined;
}

export function normalizeApiPostPayload(data: unknown): PostDetailShape | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const raw =
    root.post && typeof root.post === "object"
      ? (root.post as Record<string, unknown>)
      : root;
  const id =
    raw.id !== undefined && raw.id !== null ? String(raw.id) : "";
  if (!id) return null;

  const categoryName =
    typeof raw.categoryName === "string"
      ? raw.categoryName
      : undefined;
  const isSensitive =
    raw.isSensitive === true || raw.is_sensitive === true
      ? true
      : undefined;
  const tags = normalizeTags(raw.tags);

  const shape: PostDetailShape = {
    id,
    subject:
      typeof raw.subject === "string"
        ? decodeHtmlEntities(raw.subject)
        : typeof raw.title === "string"
          ? decodeHtmlEntities(raw.title)
          : undefined,
    userName: typeof raw.userName === "string" ? raw.userName : undefined,
    badge: typeof raw.badge === "string" ? raw.badge : undefined,
    createDate:
      typeof raw.createDate === "string"
        ? raw.createDate
        : typeof raw.createdDate === "string"
          ? raw.createdDate
          : undefined,
    image: typeof raw.image === "string" ? raw.image : undefined,
    imageUrls:
      raw.imageUrls && typeof raw.imageUrls === "object"
        ? (raw.imageUrls as Record<string, string>)
        : undefined,
    profileImage:
      typeof raw.profileImage === "string" ? raw.profileImage : undefined,
    commentCount:
      typeof raw.commentCount === "number" ? raw.commentCount : undefined,
    favoriteCount:
      typeof raw.favoriteCount === "number" ? raw.favoriteCount : undefined,
    isFavorited:
      typeof raw.isFavorited === "boolean" ? raw.isFavorited : undefined,
    tags,
    categoryName,
    isSensitive,
  };

  ingestPostSensitivity(id, {
    tags,
    categoryName,
    isSensitive,
  });

  return shape;
}

interface ProfilePostsPayload {
  posts?: Array<Record<string, unknown>>;
  favoritePosts?: Array<Record<string, unknown>>;
  collections?: Array<{ posts?: Array<Record<string, unknown>> }>;
}

export function findPostInProfilePayload(
  user: ProfilePostsPayload | null | undefined,
  postId: string,
): PostDetailShape | null {
  if (!user) return null;
  const wanted = String(postId);
  const buckets: Array<Record<string, unknown>> = [
    ...(user.posts ?? []),
    ...(user.favoritePosts ?? []),
    ...(user.collections?.flatMap((c) => c.posts ?? []) ?? []),
  ];
  for (const raw of buckets) {
    if (String(raw.id ?? "") !== wanted) continue;
    const normalized = normalizeApiPostPayload(raw);
    if (normalized) return normalized;
  }
  return null;
}
