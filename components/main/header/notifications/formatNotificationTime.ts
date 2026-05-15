export function formatNotificationTime(iso: string, locale: string): string {
  if (!iso) return "";

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const now = Date.now();
  const diffMs = Math.max(0, now - d.getTime());
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "";

  if (minutes < 60) {
    return locale.startsWith("tr") ? `${minutes} dk` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 48) {
    return locale.startsWith("tr") ? `${hours} sa` : `${hours}h`;
  }

  return d.toLocaleDateString(locale.startsWith("tr") ? "tr-TR" : "en-US", {
    month: "short",
    day: "numeric",
  });
}
