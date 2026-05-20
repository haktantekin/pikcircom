import { fetchAuthProfile } from "@/src/fetchAuthProfile";
import { useEffect, useState } from "react";

/** Oturum açmış kullanıcının userName değeri; misafirde null. */
export function useCurrentUserName(): {
  userName: string | null;
  ready: boolean;
} {
  const [userName, setUserName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchAuthProfile()
      .then((result) => {
        if (cancelled) {
          return;
        }
        const name =
          result.ok && typeof result.data?.userName === "string"
            ? result.data.userName.trim()
            : "";
        setUserName(name || null);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { userName, ready };
}

export function isSameUserName(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const left = (a ?? "").trim().toLowerCase();
  const right = (b ?? "").trim().toLowerCase();
  return left !== "" && left === right;
}
