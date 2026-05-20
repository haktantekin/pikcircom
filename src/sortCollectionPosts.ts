export interface CollectionPostSortable {
  addedAt?: string;
  createDate?: string;
}

function postSortTime(post: CollectionPostSortable): number {
  const raw = post.addedAt?.trim() || post.createDate?.trim() || "";
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** En yeni cap üstte (addedAt öncelikli, yoksa createDate). */
export function sortCollectionPostsByNewest<T extends CollectionPostSortable>(
  posts: T[],
): T[] {
  return [...posts].sort((left, right) => {
    const leftTime = postSortTime(left);
    const rightTime = postSortTime(right);
    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }
    return 0;
  });
}
