import {
  buildCacheKey,
  CLIENT_CACHE_TTL,
  getCached,
  invalidateClientCache,
} from "@/src/clientCache";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";

export type AuthProfileData = {
  userName?: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrls?: Record<string, string>;
  coverUrls?: Record<string, string>;
  coverImageUrl?: string | null;
  [key: string]: unknown;
};

export type AuthProfileResult = {
  ok: boolean;
  status: number;
  data: AuthProfileData | null;
};

const AUTH_PROFILE_KEY = buildCacheKey("GET", "/api/auth/profile");

let authInvalidationBound = false;

function bindAuthInvalidation(): void {
  if (authInvalidationBound || typeof window === "undefined") {
    return;
  }
  authInvalidationBound = true;
  subscribeAuthSessionChanged(() => {
    invalidateClientCache("GET:/api/auth/profile");
    invalidateClientCache("GET:/api/home-feed");
    invalidateClientCache("GET:/api/sidebar-suggestions");
  });
}

export async function fetchAuthProfile(options?: {
  refresh?: boolean;
}): Promise<AuthProfileResult> {
  bindAuthInvalidation();

  return getCached(
    AUTH_PROFILE_KEY,
    CLIENT_CACHE_TTL.authProfile,
    async () => {
      const response = await fetch("/api/auth/profile", {
        credentials: "include",
      });

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          data: null,
        };
      }

      const data = (await response.json()) as AuthProfileData;
      return {
        ok: true,
        status: response.status,
        data,
      };
    },
    { force: options?.refresh },
  );
}
