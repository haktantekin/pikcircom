export const formatRelativeTime = (
  value: string | number | Date,
  locale = "tr",
) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffYears = Math.round(diffMs / (1000 * 60 * 60 * 24 * 365));
  const normalizedLocale = locale.startsWith("en") ? "en" : "tr";
  const formatter = new Intl.RelativeTimeFormat(normalizedLocale, {
    numeric: "always",
  });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  if (Math.abs(diffDays) < 365) {
    return formatter.format(diffDays, "day");
  }

  return formatter.format(diffYears, "year");
};