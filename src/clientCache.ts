type CacheEntry<T> = {
  data?: T;
  expiresAt: number;
  inFlight?: Promise<T>;
};

const store = new Map<string, CacheEntry<unknown>>();

export function buildCacheKey(
  method: string,
  url: string,
  params?: Record<string, unknown> | null,
): string {
  const base = `${method.toUpperCase()}:${url}`;
  if (!params || Object.keys(params).length === 0) {
    return base;
  }
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${String(params[key])}`)
    .join("&");
  return `${base}?${sorted}`;
}

export function invalidateClientCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

export async function getCached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  options?: { force?: boolean },
): Promise<T> {
  const now = Date.now();
  const existing = store.get(key) as CacheEntry<T> | undefined;

  if (!options?.force && existing?.data !== undefined && existing.expiresAt > now) {
    return existing.data;
  }

  if (existing?.inFlight) {
    return existing.inFlight;
  }

  const inFlight = fetcher()
    .then((data) => {
      store.set(key, { data, expiresAt: now + ttlMs });
      return data;
    })
    .catch((error) => {
      const current = store.get(key);
      if (current?.inFlight === inFlight) {
        store.delete(key);
      }
      throw error;
    });

  store.set(key, {
    data: options?.force ? undefined : existing?.data,
    expiresAt: now + ttlMs,
    inFlight,
  });

  return inFlight;
}

/** GET istekleri için TTL (ms). */
export const CLIENT_CACHE_TTL = {
  authProfile: 2 * 60 * 1000,
  homeFeed: 45 * 1000,
  explore: 90 * 1000,
  profile: 3 * 60 * 1000,
  tags: 10 * 60 * 1000,
  sidebar: 5 * 60 * 1000,
  lists: 3 * 60 * 1000,
  post: 60 * 1000,
  comments: 30 * 1000,
  search: 45 * 1000,
  default: 60 * 1000,
} as const;

export function ttlForGetUrl(url: string): number {
  if (url.includes("/api/auth/profile")) {
    return CLIENT_CACHE_TTL.authProfile;
  }
  if (url.includes("/api/home-feed")) {
    return CLIENT_CACHE_TTL.homeFeed;
  }
  if (url.includes("/api/explore")) {
    return CLIENT_CACHE_TTL.explore;
  }
  if (url.includes("/api/tags")) {
    return CLIENT_CACHE_TTL.tags;
  }
  if (url.includes("/api/sidebar-suggestions")) {
    return CLIENT_CACHE_TTL.sidebar;
  }
  if (url.includes("/api/lists")) {
    return CLIENT_CACHE_TTL.lists;
  }
  if (url.includes("/api/search")) {
    return CLIENT_CACHE_TTL.search;
  }
  if (/\/api\/profile-posts\//.test(url)) {
    return CLIENT_CACHE_TTL.profile;
  }
  if (/\/api\/profile\//.test(url)) {
    return CLIENT_CACHE_TTL.profile;
  }
  if (/\/api\/posts\/[^/]+\/comments/.test(url)) {
    return CLIENT_CACHE_TTL.comments;
  }
  if (/\/api\/posts\//.test(url)) {
    return CLIENT_CACHE_TTL.post;
  }
  return CLIENT_CACHE_TTL.default;
}
