export type SearchTab = "posts" | "hashtags" | "users" | "lists" | "tags";

export interface SearchTagItem {
  slug: string;
  name: string;
  imageUrl?: string;
  postCount?: number;
}

export interface SearchUserItem {
  id: string;
  userName: string;
  displayName: string;
  profileImage?: string;
  avatarUrls?: Record<string, string>;
}

export interface SearchListItem {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  previewImages: string[];
}

export interface SearchPostItem {
  id: string;
  userName?: string;
  subject?: string;
  createDate?: string;
  commentCount?: number;
  favoriteCount?: number;
  isFavorited?: boolean;
  authorIsFollowing?: boolean;
  image?: string;
  profileImage?: string;
  tags?: Array<{ slug: string; name: string; imageUrl?: string }>;
}

export interface SearchResponse {
  type: SearchTab;
  query: string;
  posts: SearchPostItem[];
  hashtags: SearchTagItem[];
  hashtagPosts: SearchPostItem[];
  users: SearchUserItem[];
  lists: SearchListItem[];
  tags: SearchTagItem[];
}

export function normalizeSearchTab(raw: unknown): SearchTab {
  if (
    raw === "hashtags" ||
    raw === "users" ||
    raw === "lists" ||
    raw === "tags"
  ) {
    return raw;
  }
  return "posts";
}
