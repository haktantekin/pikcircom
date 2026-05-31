import Image from "next/image";
import Link from "next/link";
import MasonryPostGrid from "@/components/MasonryPostGrid";
import SensitivePostMedia from "@/components/SensitivePostMedia";
import { distributePreviewUrlsToColumns } from "@/src/masonryLayout";
import type { PostImageVariant } from "@/src/postImageUrl";
import { pickPostImageUrl } from "@/src/postImageUrl";
import type { PostTagLike } from "@/src/sensitiveContent";

export interface MasonryPostCardData {
  id: string;
  subject?: string;
  userName?: string;
  image?: string;
  imageUrls?: Record<string, string>;
  tags?: PostTagLike[];
  categoryName?: string;
  isSensitive?: boolean;
  imageWidth?: number;
  imageHeight?: number;
}

interface MasonryPostCardProps {
  post: MasonryPostCardData;
  href: string;
  imageVariant?: PostImageVariant;
  sizes?: string;
  linkClassName?: string;
  imageClassName?: string;
  roundedClassName?: string;
  /** Pinterest tarzı hover: başlık + kullanıcı */
  showMeta?: boolean;
}

const DEFAULT_FALLBACK = "/postExample/F5Z00CEaEAAFPgi.jpg";

export default function MasonryPostCard({
  post,
  href,
  imageVariant = "thumb",
  sizes = "(max-width: 1024px) 33vw, 220px",
  linkClassName = "block w-full overflow-hidden rounded-sm outline-none ring-58b4d1 transition hover:opacity-95 focus-visible:ring-2",
  imageClassName = "h-auto w-full block",
  roundedClassName = "rounded-sm",
  showMeta = false,
}: MasonryPostCardProps) {
  const src =
    pickPostImageUrl(post.image, post.imageUrls, imageVariant) ||
    DEFAULT_FALLBACK;
  const label = post.subject?.trim() || `post ${post.id}`;
  const author = post.userName?.trim();

  return (
    <SensitivePostMedia
      postId={post.id}
      tags={post.tags}
      categoryName={post.categoryName}
      isSensitive={post.isSensitive}
      variant="masonry"
      className={roundedClassName}
    >
      <Link
        href={href}
        className={linkClassName}
        aria-label={label}
        title={label}
      >
        <Image
          src={src}
          alt=""
          width={740}
          height={1000}
          className={imageClassName}
          sizes={sizes}
        />
        {showMeta && (post.subject?.trim() || author) ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2.5 pb-2.5 pt-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            {post.subject?.trim() ? (
              <p className="line-clamp-2 text-xs font-medium leading-snug text-white">
                {post.subject.trim()}
              </p>
            ) : null}
            {author ? (
              <p className="mt-0.5 text-[11px] text-white/85">@{author}</p>
            ) : null}
          </div>
        ) : null}
      </Link>
    </SensitivePostMedia>
  );
}

interface MasonryPreviewImageProps {
  src: string;
  alt?: string;
  sizes?: string;
  className?: string;
}

export function MasonryPreviewImage({
  src,
  alt = "",
  sizes = "120px",
  className = "h-auto w-full block",
}: MasonryPreviewImageProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-100 transition-transform duration-200 group-hover:ring-58b4d1/20">
      <Image
        src={src}
        alt={alt}
        width={300}
        height={400}
        className={className}
        sizes={sizes}
        unoptimized
      />
    </div>
  );
}

interface MasonryPreviewGridProps {
  urls: string[];
  columnCount?: number;
  gapClassName?: string;
  className?: string;
}

export function MasonryPreviewGrid({
  urls,
  columnCount = 2,
  gapClassName = "gap-2",
  className = "",
}: MasonryPreviewGridProps) {
  const columns = distributePreviewUrlsToColumns(urls, columnCount);

  return (
    <MasonryPostGrid
      columns={columns}
      gapClassName={gapClassName}
      className={className}
      renderItem={(src, columnIndex) => (
        <MasonryPreviewImage key={`${columnIndex}-${src}`} src={src} />
      )}
    />
  );
}
