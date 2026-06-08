/**
 * Ana sayfadaki etiket barında kullanıcının gizlediği etiket slug'larını
 * tarayıcı cookie'sinde saklamak için yardımcılar.
 *
 * - Saklanan veri: gizlenen slug'ların string[] listesi.
 * - İlk açılışta cookie yoksa / bozuksa: tüm etiketler görünür (boş array = hepsi açık).
 * - SSR güvenli: document yoksa no-op.
 */

const COOKIE_NAME = "home_tag_visibility";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function isBrowser(): boolean {
  return typeof document !== "undefined" && typeof document.cookie === "string";
}

function readCookieValue(name: string): string | null {
  if (!isBrowser()) {
    return null;
  }
  const target = `${encodeURIComponent(name)}=`;
  const segments = document.cookie ? document.cookie.split("; ") : [];
  for (const segment of segments) {
    if (segment.startsWith(target)) {
      return decodeURIComponent(segment.slice(target.length));
    }
  }
  return null;
}

function writeCookieValue(
  name: string,
  value: string,
  maxAgeSeconds: number,
): void {
  if (!isBrowser()) {
    return;
  }
  const cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
  document.cookie = cookie;
}

function sanitizeSlugList(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of input) {
    if (typeof value !== "string") {
      continue;
    }
    const slug = value.trim();
    if (!slug || seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    result.push(slug);
  }
  return result;
}

/**
 * Cookie'den gizlenen etiket slug'larını oku.
 * Cookie yoksa, bozuksa veya SSR'daysa null döner.
 */
export function readHomeTagVisibilityCookie(): string[] | null {
  const raw = readCookieValue(COOKIE_NAME);
  if (raw === null) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return sanitizeSlugList(parsed);
    }
    if (parsed && Array.isArray((parsed as { hidden?: unknown }).hidden)) {
      return sanitizeSlugList((parsed as { hidden: unknown[] }).hidden);
    }
    return [];
  } catch {
    return null;
  }
}

/**
 * Gizlenen etiket slug'larını cookie'ye yaz.
 * Boş array da yazılabilir (tüm etiketler görünür durumu).
 */
export function writeHomeTagVisibilityCookie(slugs: string[]): void {
  const clean = sanitizeSlugList(slugs);
  writeCookieValue(
    COOKIE_NAME,
    JSON.stringify(clean),
    ONE_YEAR_SECONDS,
  );
}
