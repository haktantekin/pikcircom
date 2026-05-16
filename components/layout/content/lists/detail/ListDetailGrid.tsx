import Image from "next/image";
import Link from "next/link";
import { listPostPath } from "@/src/listPaths";
import { pickPostImageUrl } from "@/src/postImageUrl";

export interface ListDetailPost {
  id: string;
  userName?: string;
  image?: string;
  imageUrls?: Record<string, string>;
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
        const image =
          pickPostImageUrl(post.image, post.imageUrls, "grid") ||
          "/postExample/F5Z00CEaEAAFPgi.jpg";

        return (
          <Link
            key={post.id}
            href={href}
            className="rounded overflow-hidden aspect-square relative block hover:opacity-90 transition-opacity border border-gray-100"
          >
            <Image
              src={image}
              alt={post.subject || ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 220px"
            />
          </Link>
        );
      })}
    </section>
  );
}
