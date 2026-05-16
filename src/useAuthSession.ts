import { useCallback, useEffect, useState } from "react";
import { fetchAuthProfile } from "@/src/fetchAuthProfile";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";

/**
 * Oturum çerezi /api/auth/profile üzerinden doğrulanır (paylaşımlı önbellek).
 * `sessionResolved` false iken login sayfasına yönlendirme yapılmamalı.
 */
export function useAuthSession() {
  const [userName, setUserName] = useState<string | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);

  const load = useCallback(async (refresh = false) => {
    const result = await fetchAuthProfile({ refresh });
    const name =
      result.ok && result.data?.userName
        ? String(result.data.userName).trim()
        : "";
    setUserName(name || null);
    setSessionResolved(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await load(false);
      if (cancelled) {
        return;
      }
    })();

    const unsub = subscribeAuthSessionChanged(() => {
      void load(true);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [load]);

  return {
    userName,
    sessionResolved,
    isLoggedIn: Boolean(userName),
  };
}

/** Oturum doğrulanmadan login; doğrulandıktan sonra yalnızca misafir login. */
export function authNavHref(
  sessionResolved: boolean,
  userName: string | null | undefined,
  authedPath: string,
  loginPath = "/login",
): string {
  if (!sessionResolved) {
    return "#";
  }
  const name = userName?.trim();
  if (name) {
    return authedPath;
  }
  return loginPath;
}
