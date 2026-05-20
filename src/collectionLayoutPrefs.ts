export type CollectionLayoutMode = "timeline" | "cols2" | "cols3";

const STORAGE_KEY = "pikcir:collection-layout";
const DEFAULT_MODE: CollectionLayoutMode = "cols3";

function isCollectionLayoutMode(value: string): value is CollectionLayoutMode {
  return value === "timeline" || value === "cols2" || value === "cols3";
}

export function getCollectionLayoutMode(): CollectionLayoutMode {
  if (typeof window === "undefined") {
    return DEFAULT_MODE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && isCollectionLayoutMode(raw)) {
      return raw;
    }
  } catch {
    /* private mode / quota */
  }
  return DEFAULT_MODE;
}

export function setCollectionLayoutMode(mode: CollectionLayoutMode): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}
