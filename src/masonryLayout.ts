import { useEffect, useMemo, useRef } from "react";

export interface MasonryHeightSource {
  imageWidth?: number;
  imageHeight?: number;
}

export function estimateMasonryItemHeight(
  item: MasonryHeightSource,
  fallback = 1,
): number {
  const w = item.imageWidth;
  const h = item.imageHeight;
  if (
    typeof w === "number" &&
    typeof h === "number" &&
    w > 0 &&
    h > 0
  ) {
    return h / w;
  }
  return fallback;
}

function emptyColumns<T>(count: number): T[][] {
  return Array.from({ length: Math.max(1, count) }, () => []);
}

function shortestColumnIndex(heights: number[]): number {
  let minIdx = 0;
  for (let i = 1; i < heights.length; i++) {
    if (heights[i]! < heights[minIdx]!) {
      minIdx = i;
    }
  }
  return minIdx;
}

export interface UseMasonryColumnsOptions<T> {
  items: readonly T[];
  columnCount: number;
  getItemId: (item: T) => string;
  estimateHeight: (item: T) => number;
  /** Değişince sütun atamaları sıfırlanır */
  resetKey?: string | number;
}

/**
 * Pinterest tarzı mazgal: mevcut postId sütunu sabit kalır;
 * yalnızca yeni öğeler en kısa sütuna eklenir (infinite scroll güvenli).
 */
export function useMasonryColumns<T>({
  items,
  columnCount,
  getItemId,
  estimateHeight,
  resetKey = "",
}: UseMasonryColumnsOptions<T>): T[][] {
  const assignmentRef = useRef<Map<string, number>>(new Map());
  const columnHeightsRef = useRef<number[]>([]);

  useEffect(() => {
    assignmentRef.current = new Map();
    columnHeightsRef.current = [];
  }, [resetKey]);

  return useMemo(() => {
    const count = Math.max(1, Math.floor(columnCount));
    const columns = emptyColumns<T>(count);
    let heights = columnHeightsRef.current;

    if (heights.length !== count) {
      heights = Array.from({ length: count }, () => 0);
    } else {
      heights = [...heights];
    }

    const assignment = assignmentRef.current;

    for (const item of items) {
      const id = getItemId(item).trim();
      if (!id) {
        continue;
      }

      let colIdx = assignment.get(id);
      if (colIdx === undefined || colIdx >= count) {
        colIdx = shortestColumnIndex(heights);
        assignment.set(id, colIdx);
        heights[colIdx]! += estimateHeight(item);
      }

      columns[colIdx]!.push(item);
    }

    columnHeightsRef.current = heights;
    return columns;
  }, [items, columnCount, getItemId, estimateHeight, resetKey]);
}

/** URL önizlemeleri (postId yok) — tek seferlik en kısa sütun dağıtımı */
export function distributePreviewUrlsToColumns(
  urls: string[],
  columnCount: number,
): string[][] {
  const count = Math.max(1, Math.floor(columnCount));
  const columns: string[][] = Array.from({ length: count }, () => []);
  const heights = Array.from({ length: count }, () => 0);

  for (let i = 0; i < urls.length; i++) {
    const colIdx = shortestColumnIndex(heights);
    columns[colIdx]!.push(urls[i]!);
    heights[colIdx]! += 1;
  }

  return columns;
}
