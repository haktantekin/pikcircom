import { useEffect, useState } from "react";
import { fetchAuthProfile } from "@/src/fetchAuthProfile";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";

/**
 * Profil yoksa (misafir) akış salt okunur; giriş sonrası etkileşim açılır.
 */
export function useGuestFeedReadOnly() {
  const [isGuest, setIsGuest] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const load = async (refresh = false) => {
      const result = await fetchAuthProfile({ refresh });
      if (!cancelled) {
        setIsGuest(!result.ok);
      }
    };

    void load(false);
    const unsub = subscribeAuthSessionChanged(() => {
      void load(true);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return {
    feedReadOnly: isGuest === true,
    sessionResolved: isGuest !== undefined,
  };
}
