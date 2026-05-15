export type ListPeriod = "today" | "yesterday" | "all";

export function listIndexPath(): string {
  return "/lists";
}

export function listPath(slug: string): string {
  const normalized = slug.trim();
  if (!normalized) {
    return listIndexPath();
  }
  return `/lists/${encodeURIComponent(normalized)}`;
}

export function listPostPath(userName: string, postId: string): string {
  const author = userName.trim();
  if (!author || !postId) {
    return "#";
  }
  return `/${encodeURIComponent(author)}/posts/${encodeURIComponent(postId)}`;
}
