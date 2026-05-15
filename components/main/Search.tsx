import { IconMoodSearch } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

interface SearchProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  defaultTab?: string;
}

export default function Search({
  value,
  onValueChange,
  onSubmit,
  placeholder,
  defaultTab = "posts",
}: SearchProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [internalValue, setInternalValue] = useState("");
  const isControlled = value !== undefined;
  const query = isControlled ? value : internalValue;

  const setQuery = (next: string) => {
    onValueChange?.(next);
    if (!isControlled) {
      setInternalValue(next);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();

    if (onSubmit) {
      onSubmit(trimmed);
      return;
    }

    router.push({
      pathname: "/search",
      query: {
        ...(trimmed ? { q: trimmed } : {}),
        tab: defaultTab,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder ?? t("searchPlaceholder")}
        className="w-full rounded-3xl h-10 bg-white border border-gray-200 px-4 pl-10 text-gray-700 text-sm placeholder:text-gray-400"
        aria-label={placeholder ?? t("searchPlaceholder")}
      />
      <button type="submit" className="absolute left-2 top-1/2 z-10 -translate-y-1/2" aria-label={t("searchPlaceholder")}>
        <IconMoodSearch size="1.7rem" stroke={1.0} className="text-gray-400" />
      </button>
    </form>
  );
}
