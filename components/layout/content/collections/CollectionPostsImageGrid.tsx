import Image from "next/image";
import Link from "next/link";
import { pickPostImageUrl } from "@/src/postImageUrl";

export interface CollectionGridPost {
  id: string;
  subject?: string;
  userName?: string;
  image?: string;
  imageUrls?: Record<string, string>;
}

interface CollectionPostsImageGridProps {
  posts: CollectionGridPost[];
  /** Gönderi linki için kullanıcı adı yedeği */
  fallbackUserName: string;
}

function postHref(post: CollectionGridPost, fallbackUserName: string): string {
  const author = (post.userName || fallbackUserName || "").trim();
  const id = String(post.id ?? "").trim();
  if (!author || !id) {
    return "#";
  }
  return `/${author}/posts/${id}`;
}

export default function CollectionPostsImageGrid({
  posts,
  fallbackUserName,
}: CollectionPostsImageGridProps) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
      {posts.map((post) => {
        const href = postHref(post, fallbackUserName);
        const src =
          pickPostImageUrl(post.image, post.imageUrls, "thumb") ||
          "/postExample/F5Z00CEaEAAFPgi.jpg";
        const label = post.subject?.trim() || `post ${post.id}`;
        return (
          <Link
            key={post.id}
            href={href}
            className="relative block aspect-square w-full overflow-hidden rounded-sm bg-gray-100 outline-none ring-58b4d1 transition hover:opacity-95 focus-visible:ring-2"
            aria-label={label}
            title={label}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 33vw, 220px"
            />
          </Link>
        );
      })}
    </div>
  );
}
