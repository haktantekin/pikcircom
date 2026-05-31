import Link from "next/link";
import { useTranslation } from "react-i18next";
import { MasonryPreviewGrid } from "@/components/MasonryPostCard";
import { useResponsiveMasonryColumnCount } from "@/src/useResponsiveMasonryColumnCount";
import CollectionSettings from "./CollectionSettings";

interface CollectionListItemProps {
  canManage?: boolean;
  name: string;
  link: string;
  item: string[];
  count: number;
  onUpdate?: (name: string) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

export default function CollectionListItem({
  canManage = false,
  name,
  link,
  item,
  count,
  onUpdate,
  onDelete,
}: CollectionListItemProps) {
  const { t } = useTranslation();
  const previewColumns = useResponsiveMasonryColumnCount(2, 2, "(min-width: 1024px)");

  return (
    <div className="mb-4 min-h-[200px] w-full rounded border bg-white p-4">
      <div className="flex justify-between px-2">
        <Link href={link}>
          <div className="mb-3 text-base font-bold">
            {name}
            <span className="ml-1.5 font-normal text-gray-500">({count})</span>
          </div>
        </Link>
        {canManage && (
          <CollectionSettings
            key={name}
            name={name}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        )}
      </div>
      <Link href={link}>
        {item.length > 0 ? (
          <MasonryPreviewGrid
            urls={item.slice(0, 4)}
            columnCount={previewColumns}
            gapClassName="gap-2 lg:gap-4"
          />
        ) : null}
      </Link>
      <Link
        href={link}
        className="font-base mx-auto mt-4 flex text-center text-xs font-bold text-58b4d1 hover:underline"
      >
        {t("lookTheCollection")}
      </Link>
    </div>
  );
}
