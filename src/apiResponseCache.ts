import type { NextApiResponse } from "next";

export type ApiCacheProfile =
  | "auth"
  | "feed"
  | "explore"
  | "profile"
  | "tags"
  | "sidebar"
  | "lists"
  | "post"
  | "comments"
  | "search"
  | "none";

const PROFILES: Record<ApiCacheProfile, string> = {
  auth: "private, no-store, max-age=0, must-revalidate",
  feed: "private, max-age=45, stale-while-revalidate=90",
  explore: "private, max-age=90, stale-while-revalidate=180",
  profile: "private, max-age=180, stale-while-revalidate=360",
  tags: "public, max-age=600, stale-while-revalidate=1200",
  sidebar: "private, max-age=300, stale-while-revalidate=600",
  lists: "private, max-age=180, stale-while-revalidate=360",
  post: "private, max-age=60, stale-while-revalidate=120",
  comments: "private, max-age=30, stale-while-revalidate=60",
  search: "private, max-age=45, stale-while-revalidate=90",
  none: "private, no-store, max-age=0",
};

export function setApiCacheHeaders(
  res: NextApiResponse,
  profile: ApiCacheProfile = "none",
): void {
  res.setHeader("Cache-Control", PROFILES[profile]);
}
