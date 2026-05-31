import { normalizeMediaUrl } from "@/src/normalizePostMedia";
import {
  pickPostImageUrl,
  type PostImageVariant,
} from "@/src/postImageUrl";
import { shouldGatePost, type PostTagLike } from "@/src/sensitiveContent";

export interface PrefetchPostLike {
  id: string;
  image?: string;
  imageUrls?: Record<string, string>;
  tags?: PostTagLike[];
  categoryName?: string;
  isSensitive?: boolean;
}

const prefetchedUrls = new Set<string>();
const prefetchedPostIds = new Set<string>();

export function resolvePostImageSrc(
  post: PrefetchPostLike,
  variant: PostImageVariant = "thumb",
): string {
  const raw = pickPostImageUrl(post.image, post.imageUrls, variant);
  return normalizeMediaUrl(raw);
}

function shouldSkipPrefetch(post: PrefetchPostLike): boolean {
  return shouldGatePost(post.id, {
    tags: post.tags,
    categoryName: post.categoryName,
    isSensitive: post.isSensitive,
  });
}

export function prefetchImageUrl(url: string): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed || prefetchedUrls.has(trimmed)) {
    return Promise.resolve();
  }

  prefetchedUrls.add(trimmed);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = trimmed;
  });
}

async function runWithConcurrency(
  tasks: Array<() => Promise<void>>,
  concurrency: number,
): Promise<void> {
  if (tasks.length === 0) {
    return;
  }

  let index = 0;

  const worker = async () => {
    while (index < tasks.length) {
      const current = index;
      index += 1;
      await tasks[current]();
    }
  };

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    () => worker(),
  );

  await Promise.all(workers);
}

export interface PrefetchPostImagesOptions {
  variant?: PostImageVariant;
  concurrency?: number;
  /** Yalnızca bu postId'leri prefetch et (hook yeni batch için kullanır) */
  onlyPostIds?: string[];
}

export function scheduleIdleWork(task: () => void): void {
  if (typeof window === "undefined") {
    return;
  }

  const idle = (
    window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
    }
  ).requestIdleCallback;

  if (idle) {
    idle(task);
    return;
  }

  window.setTimeout(task, 0);
}

export async function prefetchPostImages(
  posts: PrefetchPostLike[],
  {
    variant = "thumb",
    concurrency = 4,
    onlyPostIds,
  }: PrefetchPostImagesOptions = {},
): Promise<void> {
  if (typeof window === "undefined" || posts.length === 0) {
    return;
  }

  const allowedIds =
    onlyPostIds && onlyPostIds.length > 0
      ? new Set(onlyPostIds.map((id) => id.trim()).filter(Boolean))
      : null;

  const tasks: Array<() => Promise<void>> = [];

  for (const post of posts) {
    const postId = String(post.id ?? "").trim();
    if (!postId) {
      continue;
    }

    if (allowedIds && !allowedIds.has(postId)) {
      continue;
    }

    if (prefetchedPostIds.has(postId)) {
      continue;
    }

    if (shouldSkipPrefetch(post)) {
      continue;
    }

    const url = resolvePostImageSrc(post, variant);
    if (!url) {
      continue;
    }

    prefetchedPostIds.add(postId);

    tasks.push(async () => {
      await prefetchImageUrl(url);
    });
  }

  await runWithConcurrency(tasks, concurrency);
}
