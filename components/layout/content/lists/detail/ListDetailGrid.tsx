import Image from "next/image";
import Link from "next/link";
import { listPostPath } from "@/src/listPaths";

export interface ListDetailPost {
  id: string;
  userName?: string;
  image?: string;
  subject?: string;
}

interface ListDetailGridProps {
  posts: ListDetailPost[];
}

export default function ListDetailGrid({ posts }: ListDetailGridProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="w-full grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded">
      {posts.map((post) => {
        const author = post.userName?.trim() || "";
        const href = listPostPath(author, post.id);
        const image = post.image || "/postExample/F5Z00CEaEAAFPgi.jpg";

        return (
          <Link
            key={post.id}
            href={href}
            className="rounded overflow-hidden aspect-square relative block hover:opacity-90 transition-opacity border border-gray-100"
          >
            <Image src={image} alt={post.subject || ""} fill className="object-cover" unoptimized />
          </Link>
        );
      })}
    </section>
  );
}
