import type { ReactNode } from "react";

interface MasonryPostGridProps<T> {
  columns: T[][];
  gapClassName?: string;
  columnClassName?: string;
  renderItem: (item: T, columnIndex: number) => ReactNode;
  className?: string;
}

export default function MasonryPostGrid<T>({
  columns,
  gapClassName = "gap-2",
  columnClassName = "flex min-w-0 flex-1 flex-col gap-2",
  renderItem,
  className = "",
}: MasonryPostGridProps<T>) {
  return (
    <div className={`flex w-full ${gapClassName} ${className}`.trim()}>
      {columns.map((columnItems, columnIndex) => (
        <div key={columnIndex} className={columnClassName}>
          {columnItems.map((item) => renderItem(item, columnIndex))}
        </div>
      ))}
    </div>
  );
}
