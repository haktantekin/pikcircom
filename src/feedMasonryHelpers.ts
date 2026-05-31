import type { MasonryPostCardData } from "@/components/MasonryPostCard";
import type { ExplorePost } from "@/src/feedPostTypes";

export function postDetailPath(post: {
  id: string;
  userName?: string | null;
}): string {
  const author = (post.userName ?? "").trim();
  const id = String(post.id ?? "").trim();
  if (!author || !id) {
    return "#";
  }
  return `/${author}/posts/${id}`;
}

export function explorePostToMasonryCard(
  post: ExplorePost,
): MasonryPostCardData {
  return {
    id: post.id,
    subject: post.subject,
    userName: post.userName,
    image: post.image,
    imageUrls: post.imageUrls,
    tags: post.tags,
    categoryName: post.categoryName,
    isSensitive: post.isSensitive,
  };
}

export interface ProfileMasonrySource {
  id: string;
  subject?: string;
  userName?: string;
  image?: string;
  imageUrls?: Record<string, string>;
  tags?: MasonryPostCardData["tags"];
  categoryName?: string;
  isSensitive?: boolean;
}

export function profilePostToMasonryCard(
  post: ProfileMasonrySource,
  fallbackUserName?: string,
): MasonryPostCardData {
  return {
    id: post.id,
    subject: post.subject,
    userName: post.userName || fallbackUserName,
    image: post.image,
    imageUrls: post.imageUrls,
    tags: post.tags,
    categoryName: post.categoryName,
    isSensitive: post.isSensitive,
  };
}
