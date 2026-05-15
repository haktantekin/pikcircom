import Image from "next/image";
import Link from "next/link";
import { listPath } from "@/src/listPaths";

interface ListItemProps {
  slug: string;
  name: string;
  postCount: number;
  previewImages: string[];
}

export default function ListItem({ slug, name, postCount, previewImages }: ListItemProps) {
  const href = listPath(slug);
  const images = previewImages.length > 0 ? previewImages : ["/postExample/F5Z00CEaEAAFPgi.jpg"];

  return (
    <Link href={href} className="bg-white min-h-[50px] rounded border border-126782 border-dashed flex flex-col text-base mx-auto">
      <div className="pt-4 pl-4 text-58b4d1">
        <strong>{name}</strong> &nbsp;({postCount})
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {images.slice(0, 4).map((src, index) => (
          <div className="w-full rounded overflow-hidden aspect-square relative" key={`${slug}-${index}`}>
            <Image src={src} alt="" fill className="object-cover" unoptimized />
          </div>
        ))}
      </div>
    </Link>
  );
}
