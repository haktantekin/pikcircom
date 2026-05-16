import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  buildCacheKey,
  getCached,
  invalidateClientCache,
  ttlForGetUrl,
} from "@/src/clientCache";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";
import { subscribePostCreated } from "@/src/postCreatedEvent";
import { subscribeFollowChanged } from "@/src/followChangedEvent";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** true ise önbelleği atla (ör. yeni pik poll). */
    pikcirRefresh?: boolean;
  }
}

let wired = false;

function bindInvalidation(): void {
  if (wired || typeof window === "undefined") {
    return;
  }
  wired = true;

  subscribeAuthSessionChanged(() => {
    invalidateClientCache();
  });

  subscribePostCreated(() => {
    invalidateClientCache("GET:/api/home-feed");
    invalidateClientCache("GET:/api/explore");
  });

  subscribeFollowChanged(() => {
    invalidateClientCache("GET:/api/home-feed");
    invalidateClientCache("GET:/api/sidebar-suggestions");
    invalidateClientCache("GET:/api/profile/");
  });
}

export function setupClientCache(client: AxiosInstance): void {
  bindInvalidation();

  const originalGet = client.get.bind(client);

  client.get = function pikcirCachedGet<T>(
    url: string,
    config?: InternalAxiosRequestConfig,
  ) {
    const refresh = Boolean(config?.pikcirRefresh);
    const params =
      config?.params && typeof config.params === "object"
        ? (config.params as Record<string, unknown>)
        : null;
    const key = buildCacheKey("GET", url, params);
    const ttl = ttlForGetUrl(url);

    return getCached(
      key,
      ttl,
      () => originalGet<T>(url, config),
      { force: refresh },
    ) as Promise<AxiosResponse<T>>;
  } as AxiosInstance["get"];
}
