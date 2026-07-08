import { applySensitiveMetadataToPosts } from "@/src/sensitiveContent";
import { decodeHtmlEntities } from "@/src/decodeHtmlEntities";

export interface ExplorePost {
  id: string;
  subject?: string;
  userName?: string;
  createDate?: string;
  commentCount?: number;
  favoriteCount?: number;
  isFavorited?: boolean;
  authorIsFollowing?: boolean;
  image?: string;
  imageUrls?: Record<string, string>;
  profileImage?: string;
  tags?: { slug: string; name: string; imageUrl?: string }[];
  categoryName?: string;
  /** wp-theme list endpoint */
  isSensitive?: boolean;
}

/** Feed batch: hassas postId kaydı + aynı dizi */
export function prepareExplorePosts(posts: ExplorePost[]): ExplorePost[] {
  for (const p of posts) {
    if (p.subject) {
      p.subject = decodeHtmlEntities(p.subject);
    }
  }
  return applySensitiveMetadataToPosts(posts);
}
