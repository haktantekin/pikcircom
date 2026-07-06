import Link from "next/link";
import { listPath } from "@/src/listPaths";

interface ListItemProps {
  slug: string;
  name: string;
  postCount: number;
  previewImages: string[];
}

export default function ListItem({
  slug,
  name,
  postCount,
}: ListItemProps) {
  const href = listPath(slug);

  return (
    <Link
      href={href}
      className="group flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-card transition-all duration-200 hover:border-58b4d1/30 hover:shadow-card-hover"
    >
      <span className="text-base font-semibold text-58b4d1">{name}</span>
      <span className="text-sm tabular-nums text-gray-500">({postCount})</span>
    </Link>
  );
}
