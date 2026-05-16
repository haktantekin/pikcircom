export interface PostDetailShape {
  id: string;
  subject?: string;
  userName?: string;
  createDate?: string;
  image?: string;
  imageUrls?: Record<string, string>;
  profileImage?: string;
  commentCount?: number;
  favoriteCount?: number;
  isFavorited?: boolean;
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
  return {
    id,
    subject:
      typeof raw.subject === "string"
        ? raw.subject
        : typeof raw.title === "string"
          ? raw.title
          : undefined,
    userName: typeof raw.userName === "string" ? raw.userName : undefined,
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
  };
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
