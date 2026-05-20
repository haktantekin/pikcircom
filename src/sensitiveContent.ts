/**
 * Hassas içerik — postId kaydı. wp-theme gereksinimleri: docs/wp-theme-sensitive-posts.md
 */
export const SENSITIVE_TAG_SLUG = "yetiskin";

const REVEALED_STORAGE_PREFIX = "pikcir:sensitive-revealed:";
/** Kalıcı: bir kez hassas olduğu bilinen postId listesi */
export const SENSITIVE_IDS_STORAGE_KEY = "pikcir:sensitive-post-ids";

export interface PostTagLike {
  slug?: string;
  name?: string;
}

export interface SensitivePostInput {
  tags?: PostTagLike[];
  categoryName?: string;
  /** wp-theme: GET listelerinde isSensitive: true */
  isSensitive?: boolean;
}

const sensitiveIdsMemory = new Set<string>();
let sensitiveIdsHydrated = false;

function normalizeTagToken(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function isSensitiveTag(tag: PostTagLike): boolean {
  const slug = tag.slug ? normalizeTagToken(tag.slug) : "";
  const name = tag.name ? normalizeTagToken(tag.name) : "";
  return slug === SENSITIVE_TAG_SLUG || name === SENSITIVE_TAG_SLUG;
}

export function isSensitiveCategoryName(categoryName?: string): boolean {
  if (!categoryName?.trim()) {
    return false;
  }
  return normalizeTagToken(categoryName) === SENSITIVE_TAG_SLUG;
}

export function isSensitiveTaggedPost(tags?: PostTagLike[]): boolean {
  if (!tags?.length) {
    return false;
  }
  return tags.some(isSensitiveTag);
}

export function isSensitivePost({
  tags,
  categoryName,
  isSensitive,
}: SensitivePostInput = {}): boolean {
  if (isSensitive === true) {
    return true;
  }
  return isSensitiveTaggedPost(tags) || isSensitiveCategoryName(categoryName);
}

function hydrateSensitiveIdsFromStorage(): void {
  if (sensitiveIdsHydrated || typeof window === "undefined") {
    sensitiveIdsHydrated = true;
    return;
  }
  sensitiveIdsHydrated = true;
  try {
    const raw = window.localStorage.getItem(SENSITIVE_IDS_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return;
    }
    for (const id of parsed) {
      const key = String(id ?? "").trim();
      if (key) {
        sensitiveIdsMemory.add(key);
      }
    }
  } catch {
    /* corrupt storage */
  }
}

function persistSensitiveIds(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      SENSITIVE_IDS_STORAGE_KEY,
      JSON.stringify([...sensitiveIdsMemory]),
    );
  } catch {
    /* quota / private mode */
  }
}

export function registerSensitivePostId(postId: string | undefined): void {
  const id = String(postId ?? "").trim();
  if (!id) {
    return;
  }
  hydrateSensitiveIdsFromStorage();
  if (sensitiveIdsMemory.has(id)) {
    return;
  }
  sensitiveIdsMemory.add(id);
  persistSensitiveIds();
}

export function isRegisteredSensitivePostId(
  postId: string | undefined,
): boolean {
  const id = String(postId ?? "").trim();
  if (!id) {
    return false;
  }
  hydrateSensitiveIdsFromStorage();
  return sensitiveIdsMemory.has(id);
}

export function ingestPostSensitivity(
  postId: string | undefined,
  input: SensitivePostInput = {},
): void {
  if (isSensitivePost(input)) {
    registerSensitivePostId(postId);
  }
}

export function isPostSensitive(
  postId: string | undefined,
  input: SensitivePostInput = {},
): boolean {
  return isRegisteredSensitivePostId(postId) || isSensitivePost(input);
}

export function applySensitiveMetadataToPosts<
  T extends {
    id: string;
    tags?: PostTagLike[];
    categoryName?: string;
    isSensitive?: boolean;
  },
>(posts: T[]): T[] {
  for (const post of posts) {
    ingestPostSensitivity(post.id, {
      tags: post.tags,
      categoryName: post.categoryName,
      isSensitive: post.isSensitive,
    });
  }
  return posts;
}

export function enrichPostsWithTagsFromCatalog<
  T extends { id: string; tags?: PostTagLike[] },
>(
  posts: T[],
  catalog: Array<{ id: string; tags?: PostTagLike[] }>,
): T[] {
  const tagById = new Map<string, PostTagLike[]>();
  for (const entry of catalog) {
    const id = String(entry.id ?? "").trim();
    if (!id || !entry.tags?.length) {
      continue;
    }
    tagById.set(id, entry.tags);
  }

  const enriched = posts.map((post) => {
    if (post.tags?.length) {
      return post;
    }
    const id = String(post.id ?? "").trim();
    const fromCatalog = id ? tagById.get(id) : undefined;
    if (!fromCatalog?.length) {
      return post;
    }
    return { ...post, tags: fromCatalog };
  });

  return applySensitiveMetadataToPosts(enriched);
}

function revealedStorageKey(postId: string): string {
  return `${REVEALED_STORAGE_PREFIX}${postId.trim()}`;
}

export function isSensitivePostRevealed(postId: string | undefined): boolean {
  if (!postId?.trim() || typeof window === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(revealedStorageKey(postId)) === "1";
  } catch {
    return false;
  }
}

export function revealSensitivePost(postId: string | undefined): void {
  if (!postId?.trim() || typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(revealedStorageKey(postId), "1");
  } catch {
    /* quota / private mode */
  }
}

/** Gate açık mı: hassas post ve kullanıcı henüz onaylamadı */
export function shouldGatePost(
  postId: string | undefined,
  input: SensitivePostInput = {},
): boolean {
  if (!postId?.trim()) {
    return false;
  }
  ingestPostSensitivity(postId, input);
  if (!isPostSensitive(postId, input)) {
    return false;
  }
  return !isSensitivePostRevealed(postId);
}

/** @deprecated shouldGatePost kullanın */
export function shouldGateSensitiveMedia(
  postId: string | undefined,
  input: SensitivePostInput = {},
): boolean {
  return shouldGatePost(postId, input);
}
