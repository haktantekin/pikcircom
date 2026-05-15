import Image from "next/image";
import { IconHash } from "@tabler/icons-react";

interface TagOptionRowProps {
  name: string;
  imageUrl?: string;
  showCount?: number;
  variant?: "inline" | "stacked";
}

export default function TagOptionRow({
  name,
  imageUrl,
  showCount,
  variant = "inline",
}: TagOptionRowProps) {
  const imageNode = imageUrl ? (
    <Image
      src={imageUrl}
      alt=""
      width={variant === "stacked" ? 40 : 28}
      height={variant === "stacked" ? 40 : 28}
      className={`shrink-0 rounded object-cover ${
        variant === "stacked" ? "h-10 w-10" : ""
      }`}
      unoptimized
    />
  ) : (
    <span
      className={`flex shrink-0 items-center justify-center rounded bg-gray-100 ${
        variant === "stacked" ? "h-10 w-10" : "h-7 w-7"
      }`}
    >
      <IconHash size={variant === "stacked" ? 18 : 14} stroke={1.2} className="text-gray-500" />
    </span>
  );

  if (variant === "stacked") {
    return (
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {imageNode}
          <span className="truncate text-sm font-semibold text-202124">#{name}</span>
        </div>
        {typeof showCount === "number" && (
          <span className="shrink-0 text-xs tabular-nums text-gray-500">{showCount}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      {imageNode}
      <span className="truncate">#{name}</span>
      {typeof showCount === "number" && (
        <span className="ml-auto shrink-0 text-xs text-gray-500">{showCount}</span>
      )}
    </div>
  );
}
