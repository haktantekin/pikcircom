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

export function profileCollectionDetailPath(
  userName: string,
  collectionSlug: string,
): string {
  const user = userName.trim();
  const slug = collectionSlug.trim();
  if (!user || !slug) {
    return profileCollectionsPath(userName);
  }
  return `${profileCollectionsPath(user)}/${encodeURIComponent(slug)}`;
}

export type CollectionLinkSource = {
  link?: string;
  slug?: string;
  name: string;
};

/** WP `link` alanını veya slug/isim yedeğini kullanarak koleksiyon detay URL'si üretir. */
export function resolveCollectionHref(
  userName: string,
  collection: CollectionLinkSource,
): string {
  const user = userName.trim();
  if (!user) {
    return "/";
  }

  const rawLink = collection.link?.trim();
  if (rawLink) {
    let path = rawLink;
    if (rawLink.startsWith("http://") || rawLink.startsWith("https://")) {
      try {
        path = new URL(rawLink).pathname;
      } catch {
        path = rawLink;
      }
    }
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    return path.replace(/\/+$/, "") || profileCollectionsPath(user);
  }

  const slug =
    collection.slug?.trim() ||
    collection.name.trim().toLowerCase().replace(/\s+/g, "-");
  return profileCollectionDetailPath(user, slug);
}

export function collectionSlugFromHref(href: string): string {
  const segment = href.split("/").filter(Boolean).pop() ?? "";
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
