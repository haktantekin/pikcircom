import axios from "axios";
import {
  extractPostFromApiPayload,
  mergePostsById,
  normalizePostsMediaFields,
  type PostLike,
} from "@/src/normalizePostMedia";

function getWordPressBaseUrl(): string {
  const baseUrl =
    process.env.WORDPRESS_API_URL ?? process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

  return baseUrl?.replace(/\/$/, "") ?? "";
}

export async function fetchPostsByIdsFromWordPress(
  postIds: string[],
  authToken?: string,
): Promise<PostLike[]> {
  const wordPressBaseUrl = getWordPressBaseUrl();
  if (!wordPressBaseUrl || postIds.length === 0) {
    return [];
  }

  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : undefined;
  const uniqueIds = [...new Set(postIds.map((id) => String(id).trim()).filter(Boolean))];

  const results = await Promise.all(
    uniqueIds.map(async (postId) => {
      try {
        const { data } = await axios.get(
          `${wordPressBaseUrl}/wp-json/pikcir/v1/posts/${encodeURIComponent(postId)}`,
          { headers },
        );
        return extractPostFromApiPayload(data);
      } catch {
        return null;
      }
    }),
  );

  return normalizePostsMediaFields(
    results.filter((post): post is PostLike => post !== null),
  );
}

export function resolveMissingPostIds(
  embeddedPosts: Array<{ id?: string | number }>,
  postIds: Array<string | number> | undefined,
): string[] {
  const embedded = new Set(
    embeddedPosts
      .map((post) => String(post.id ?? "").trim())
      .filter(Boolean),
  );

  const wanted = postIds ?? embeddedPosts.map((post) => post.id).filter(Boolean);
  return [...new Set(wanted.map((id) => String(id).trim()).filter(Boolean))].filter(
    (id) => !embedded.has(id),
  );
}

export async function hydratePostsWithMissingIds(
  embeddedPosts: PostLike[],
  postIds: Array<string | number> | undefined,
  authToken?: string,
): Promise<PostLike[]> {
  const normalizedEmbedded = normalizePostsMediaFields(embeddedPosts);
  const missingIds = resolveMissingPostIds(normalizedEmbedded, postIds);

  if (missingIds.length === 0) {
    return normalizedEmbedded;
  }

  const fetched = await fetchPostsByIdsFromWordPress(missingIds, authToken);
  return mergePostsById(
    normalizedEmbedded.filter((post) => String(post.id ?? "").trim()) as Array<
      PostLike & { id: string }
    >,
    fetched.filter((post) => String(post.id ?? "").trim()) as Array<
      PostLike & { id: string }
    >,
  );
}
