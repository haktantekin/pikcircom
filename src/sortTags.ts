/**
 * Etiketleri önce post sayısına göre azalan, eşitlikte Türkçe alfabetik
 * sıralayan ortak helper. Backend `postCount` döndürdüğü sürece
 * `ExploreTagItem` tarzı nesneler post sayısına göre sıralanır;
 * `postCount` alanı olmayan kaynaklar için doğal olarak alfabetik
 * (TR `localeCompare`, case-insensitive) sıralamaya düşer.
 *
 * Kullanım:
 *   const sorted = sortTagsByPostCountDesc(tags);
 *   useMemo(() => sortTagsByPostCountDesc(tags), [tags]);
 */
export interface SortableTagLike {
  postCount?: number;
  name?: string;
  slug?: string;
}

export function sortTagsByPostCountDesc<T extends SortableTagLike>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) => {
    const countDiff = (b.postCount ?? 0) - (a.postCount ?? 0);
    if (countDiff !== 0) {
      return countDiff;
    }
    return (a.name ?? "").localeCompare(b.name ?? "", "tr", {
      sensitivity: "base",
    });
  });
}
