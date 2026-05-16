export type ProfileTab = "piklerim" | "piklediklerim" | "collection";

function encodeUserName(userName: string): string {
  return encodeURIComponent(userName.trim());
}

export function profilePath(userName: string): string {
  const slug = userName.trim();
  if (!slug) {
    return "/";
  }
  return `/${encodeUserName(slug)}`;
}

export function profileLikedPath(userName: string): string {
  const slug = userName.trim();
  if (!slug) {
    return "/";
  }
  return `/${encodeUserName(slug)}/liked`;
}

export function profileCollectionsPath(userName: string): string {
  const slug = userName.trim();
  if (!slug) {
    return "/";
  }
  return `/${encodeUserName(slug)}/collections`;
}
