export const AUTH_SESSION_CHANGED_EVENT = "pikcir:auth-session-changed";

export function dispatchAuthSessionChanged() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_CHANGED_EVENT));
}

export function subscribeAuthSessionChanged(handler: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handler);
  return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handler);
}
