/**
 * Decode common HTML entities returned by the WordPress REST API
 * (e.g. &#8217; → ', &amp; → &).
 *
 * Works on both server (Node) and client (browser).
 */
export function decodeHtmlEntities(text: string): string {
  if (!text || !text.includes("&")) return text;

  return text
    .replace(/&#(\d+);/g, (_match, dec: string) =>
      String.fromCharCode(Number(dec)),
    )
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}
