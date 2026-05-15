import Link from "next/link";
import TagOptionRow from "@/components/layout/content/contentCenter/TagOptionRow";
import type { SearchTagItem } from "@/src/searchTypes";

interface SearchTagChipProps {
  tag: SearchTagItem;
  href: string;
  subtitle?: string;
}

export default function SearchTagChip({ tag, href, subtitle }: SearchTagChipProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-colors hover:border-58b4d1"
    >
      <TagOptionRow name={tag.name} imageUrl={tag.imageUrl} />
      {subtitle ? <span className="shrink-0 text-xs text-gray-500">{subtitle}</span> : null}
    </Link>
  );
}
