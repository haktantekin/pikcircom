import { applySensitiveMetadataToPosts } from "@/src/sensitiveContent";

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
  return applySensitiveMetadataToPosts(posts);
}
