/** Timeline feed'lerde ilk yükleme ve her scroll adımı */
export const FEED_PAGE_SIZE = 10;

/** 3 sütunlu grid için (~4 satır) */
export const FEED_GRID_PAGE_SIZE = 12;

export function hasMoreFromBatch(
  batchLength: number,
  pageSize: number,
): boolean {
  return batchLength >= Math.max(1, pageSize);
}

export function normalizePage(value: unknown): number {
  const parsed =
    typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function normalizePageSize(
  value: unknown,
  fallback = FEED_PAGE_SIZE,
): number {
  const parsed =
    typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(50, parsed);
}

/** WP page desteği yokken: daha geniş çekip dilimle */
export function slicePageFromFetched<T>(
  allItems: T[],
  page: number,
  pageSize: number,
): { items: T[]; hasMore: boolean } {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, pageSize);
  const start = (safePage - 1) * safeSize;
  const items = allItems.slice(start, start + safeSize);
  const fetchedThroughEnd = start + safeSize;
  const hasMore =
    allItems.length > fetchedThroughEnd ||
    (allItems.length === safePage * safeSize && allItems.length >= safeSize);
  return { items, hasMore };
}
