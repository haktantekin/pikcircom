import Link from "next/link";
import { MasonryPreviewGrid } from "@/components/MasonryPostCard";
import { useResponsiveMasonryColumnCount } from "@/src/useResponsiveMasonryColumnCount";
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
  previewImages,
}: ListItemProps) {
  const href = listPath(slug);
  const images = previewImages.filter(
    (src) => typeof src === "string" && src.trim() !== "",
  );
  const showPreview = images.length > 0;
  const previewColumns = useResponsiveMasonryColumnCount(2, 2, "(min-width: 1024px)");

  return (
    <Link
      href={href}
      className="group mx-auto flex min-h-[50px] w-full max-w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card transition-all duration-200 hover:border-58b4d1/30 hover:shadow-card-hover"
    >
      <div
        className={`bg-gradient-to-r from-gray-50/80 to-white px-4 py-3 ${showPreview ? "border-b border-gray-100" : ""}`}
      >
        <span className="text-base font-semibold text-58b4d1">{name}</span>
        <span className="ml-1.5 text-sm font-normal tabular-nums text-gray-500">
          ({postCount})
        </span>
      </div>
      {showPreview ? (
        <div className="p-3">
          <MasonryPreviewGrid
            urls={images.slice(0, 4)}
            columnCount={previewColumns}
            gapClassName="gap-2 lg:gap-3"
          />
        </div>
      ) : null}
    </Link>
  );
}
