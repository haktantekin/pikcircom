import { useEffect, useRef, useState } from "react";
import { dispatchAuthSessionChanged } from "@/src/authSessionEvent";
import axios from "axios";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode?: string;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
              locale?: string;
            },
          ) => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, callback?: () => void) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !containerRef.current) return;

    const handleCredentialResponse = async (response: {
      credential: string;
    }) => {
      setError(null);
      setLoading(true);
      try {
        await axios.post("/api/auth/google", {
          credential: response.credential,
        });
        dispatchAuthSessionChanged();
        window.location.assign("/");
      } catch (err) {
        const message =
          axios.isAxiosError(err)
            ? err.response?.data?.message ?? "Google ile giriş başarısız"
            : "Google ile giriş başarısız";
        setError(message);
        setLoading(false);
      }
    };

    const initGoogle = () => {
      if (!window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: containerRef.current.offsetWidth,
        text: "signin_with",
        shape: "rectangular",
      });
    };

    if (window.google) {
      initGoogle();
      return;
    }

    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", initGoogle);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="w-full">
      <div className="my-3 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-300" />
        <span className="text-xs text-gray-400">veya</span>
        <div className="h-px flex-1 bg-gray-300" />
      </div>
      <div
        ref={containerRef}
        className="flex w-full items-center justify-center"
      />
      {loading && (
        <p className="mt-2 text-center text-sm text-gray-500">
          Giriş yapılıyor…
        </p>
      )}
      {error && (
        <p className="mt-2 text-center text-sm font-bold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
