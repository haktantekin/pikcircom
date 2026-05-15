/** Göreli veya mutlak post yolundan tam paylaşım URL’si. */
export function buildPostShareUrl(postLink: string): string {
  const trimmed = postLink.trim();
  if (trimmed === "" || trimmed === "#") {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return path;
}

export function buildWhatsAppShareUrl(shareUrl: string, title?: string): string {
  const text = title?.trim() ? `${title.trim()}\n${shareUrl}` : shareUrl;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildTwitterShareUrl(shareUrl: string, title?: string): string {
  const params = new URLSearchParams({ url: shareUrl });
  if (title?.trim()) {
    params.set("text", title.trim());
  }
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function buildFacebookShareUrl(shareUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
}

export function buildPinterestShareUrl(
  shareUrl: string,
  imageUrl: string,
  description?: string,
): string {
  const params = new URLSearchParams({
    url: shareUrl,
    media: imageUrl,
  });
  if (description?.trim()) {
    params.set("description", description.trim());
  }
  return `https://pinterest.com/pin/create/button/?${params.toString()}`;
}

export function resolveShareImageUrl(image?: string): string {
  const trimmed = image?.trim() ?? "";
  if (trimmed === "") {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (typeof window !== "undefined") {
    const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${window.location.origin}${path}`;
  }
  return trimmed;
}
