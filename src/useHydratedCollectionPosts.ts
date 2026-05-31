import { useEffect, useState } from "react";
import { hydratePostsByIds } from "@/configs/client-services";
import { applySensitiveMetadataToPosts } from "@/src/sensitiveContent";

export interface HydratablePost {
  id: string;
  subject?: string;
  userName?: string;
  createDate?: string;
  addedAt?: string;
  image?: string;
  imageUrls?: Record<string, string>;
  tags?: { slug: string; name: string }[];
  categoryName?: string;
  isSensitive?: boolean;
}

export function useHydratedCollectionPosts(
  embeddedPosts: HydratablePost[],
  postIds: Array<string | number> | undefined,
) {
  const [posts, setPosts] = useState<HydratablePost[]>(embeddedPosts);
  const [isHydrating, setIsHydrating] = useState(false);

  useEffect(() => {
    setPosts(embeddedPosts);
  }, [embeddedPosts]);

  useEffect(() => {
    const embeddedIds = new Set(
      embeddedPosts.map((post) => String(post.id ?? "").trim()).filter(Boolean),
    );
    const wantedIds = (postIds ?? embeddedPosts.map((post) => post.id))
      .map((id) => String(id ?? "").trim())
      .filter(Boolean);
    const missingIds = [...new Set(wantedIds)].filter((id) => !embeddedIds.has(id));

    if (missingIds.length === 0) {
      return undefined;
    }

    let cancelled = false;
    setIsHydrating(true);

    void hydratePostsByIds(missingIds)
      .then((response) => {
        if (cancelled) {
          return;
        }

        const fetched = (response.data?.posts ?? []) as HydratablePost[];
        if (fetched.length === 0) {
          return;
        }

        const merged = applySensitiveMetadataToPosts([
          ...embeddedPosts,
          ...fetched.filter(
            (post) => !embeddedIds.has(String(post.id ?? "").trim()),
          ),
        ]);

        setPosts(merged);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setIsHydrating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [embeddedPosts, postIds]);

  return { posts, isHydrating };
}
