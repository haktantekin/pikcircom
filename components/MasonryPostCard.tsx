import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MasonryPostGrid from "@/components/MasonryPostGrid";
import SensitivePostMedia from "@/components/SensitivePostMedia";
import { distributePreviewUrlsToColumns } from "@/src/masonryLayout";
import type { PostImageVariant } from "@/src/postImageUrl";
import { pickPostImageUrl } from "@/src/postImageUrl";
import { normalizeMediaUrl } from "@/src/normalizePostMedia";
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

/**
 * WordPress / REST API'den gelen alanlar bazen `&#8217;`, `"` gibi
 * HTML entity kodlaması içerebiliyor. Bu yardımcı, metni güvenli şekilde
 * düz metne çevirir. `& < > " &#39; ' &nbsp;`
 * başta olmak üzere sık karşılaşılan entity'leri manuel olarak çevirir
 * (SSR güvenli, document bağımlılığı yok).
 */
function decodeHtmlEntities(input: string): string {
  if (!input || input.indexOf("&") === -1) {
    return input;
  }
  return input
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&#(\d+);/g, (_match, code) => {
      const num = Number.parseInt(code, 10);
      if (!Number.isFinite(num) || num < 0 || num > 0x10ffff) {
        return _match;
      }
      try {
        return String.fromCodePoint(num);
      } catch {
        return _match;
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) => {
      const num = Number.parseInt(hex, 16);
      if (!Number.isFinite(num) || num < 0 || num > 0x10ffff) {
        return _match;
      }
      try {
        return String.fromCodePoint(num);
      } catch {
        return _match;
      }
    });
}

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
  const initialSrc =
    normalizeMediaUrl(
      pickPostImageUrl(post.image, post.imageUrls, imageVariant),
    ) || DEFAULT_FALLBACK;
  const [imageSrc, setImageSrc] = useState(initialSrc);

  // `subject` bazen WordPress'ten `&#8217;` gibi HTML entity'lerle gelir.
  // Bunları kullanıcıya göstermeden önce decode ediyoruz.
  const subject = useMemo(
    () => (post.subject ? decodeHtmlEntities(post.subject) : post.subject),
    [post.subject],
  );
  const label = subject?.trim() || `post ${post.id}`;
  const author = post.userName?.trim();

  useEffect(() => {
    setImageSrc(initialSrc);
  }, [initialSrc, post.id]);

  return (
    <SensitivePostMedia
      postId={post.id}
      tags={post.tags}
      categoryName={post.categoryName}
      isSensitive={post.isSensitive}
      variant="masonry"
      className={roundedClassName}
      previewLabel={label}
    >
      <Link
        href={href}
        className={linkClassName}
        aria-label={label}
        title={label}
      >
        <Image
          src={imageSrc}
          alt=""
          width={740}
          height={1000}
          className={imageClassName}
          sizes={sizes}
          unoptimized
          onError={() => {
            if (imageSrc !== DEFAULT_FALLBACK) {
              setImageSrc(DEFAULT_FALLBACK);
            }
          }}
        />
        {showMeta && (subject?.trim() || author) ? (
          <>
            {/* Kalıcı alt bilgi şeridi — Pinterest tarzı, kartın dışına taşmaz */}
            {subject?.trim() || author ? (
              <div className="pointer-events-none flex items-center gap-1.5 px-2.5 pb-3 pt-3 text-left">
                {subject?.trim() ? (
                  <p className="line-clamp-1 min-w-0 flex-1 text-[12px] font-medium leading-snug text-202124">
                    {subject.trim()}
                  </p>
                ) : (
                  <span className="flex-1" />
                )}
                {author ? (
                  <span className="shrink-0 text-[11px] text-gray-500">
                    @{author}
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Hover'da görünen gradient + uzun başlık overlay (Pinterest detayı) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[34px] bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2.5 pb-2.5 pt-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
              {subject?.trim() ? (
                <p className="line-clamp-2 text-xs font-medium leading-snug text-white">
                  {subject.trim()}
                </p>
              ) : null}
              {author ? (
                <p className="mt-0.5 text-[11px] text-white/85">@{author}</p>
              ) : null}
            </div>
          </>
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
