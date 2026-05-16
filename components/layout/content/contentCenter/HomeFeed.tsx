import { useCallback, useEffect, useRef, useState } from "react";
import PostList from "./post/PostList";
import Skeleton from "@/components/Skeleton";
import { getHomeFeed } from "@/configs/client-services";
import { resolveProfileImageUrl } from "@/src/avatarUrl";
import { subscribePostCreated } from "@/src/postCreatedEvent";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";
import { useTranslation } from "react-i18next";
import type { ExplorePost } from "@/src/feedPostTypes";
import { pickPostImageUrl } from "@/src/postImageUrl";
import { fetchAuthProfile } from "@/src/fetchAuthProfile";
import Link from "next/link";

export type HomeFeedScope = "karma" | "followed";

const NEW_PIKS_POLL_MS = 45_000;

function postIdKey(post: ExplorePost): string {
  return post?.id != null ? String(post.id).trim() : "";
}

function sliceNewPostsFromFresh(
  freshRaw: ExplorePost[],
  current: ExplorePost[],
): ExplorePost[] {
  const seen = new Set<string>();
  const fresh = freshRaw.filter((post) => {
    const id = postIdKey(post);
    const key =
      id ||
      `${post.userName ?? ""}|${post.createDate ?? ""}|${post.subject ?? ""}|${post.image ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  const existingIds = new Set(
    current.map((p) => postIdKey(p)).filter(Boolean),
  );

  if (existingIds.size === 0) {
    return fresh;
  }

  const newPosts: ExplorePost[] = [];
  for (const post of fresh) {
    const id = postIdKey(post);
    if (id && existingIds.has(id)) {
      break;
    }
    newPosts.push(post);
  }
  return newPosts;
}

function mergePostsAtTop(
  newer: ExplorePost[],
  current: ExplorePost[],
): ExplorePost[] {
  const seen = new Set<string>();
  const merged: ExplorePost[] = [];

  const pushUnique = (post: ExplorePost) => {
    const id = postIdKey(post);
    const key =
      id ||
      `${post.userName ?? ""}|${post.createDate ?? ""}|${post.subject ?? ""}|${post.image ?? ""}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    merged.push(post);
  };

  for (const post of newer) {
    pushUnique(post);
  }
  for (const post of current) {
    pushUnique(post);
  }
  return merged;
}

interface NewPiksFloatingBarProps {
  count: number;
  onActivate: () => void;
  labelOver: string;
  labelCount: string;
}

function NewPiksFloatingBar({
  count,
  onActivate,
  labelOver,
  labelCount,
}: NewPiksFloatingBarProps) {
  if (count <= 0) {
    return null;
  }
  return (
    <div className="pointer-events-none sticky top-2 z-20 -mb-1 flex justify-center px-2 lg:top-4">
      <button
        type="button"
        onClick={onActivate}
        className="pointer-events-auto rounded-full border border-white/30 bg-58b4d1 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:brightness-105 active:scale-[0.98]"
        aria-live="polite"
      >
        {count > 99 ? labelOver : labelCount}
      </button>
    </div>
  );
}

interface HomeFeedProps {
  scope: HomeFeedScope;
  refreshKey?: number;
  readOnly?: boolean;
  /** API'den en fazla bu kadar gönderi (misafir ana sayfada 10) */
  perPage?: number;
}

export default function HomeFeed({ scope, refreshKey = 0, readOnly = false, perPage }: HomeFeedProps) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [authTick, setAuthTick] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [pendingNewCount, setPendingNewCount] = useState(0);

  const postsRef = useRef<ExplorePost[]>([]);
  const pendingNewPostsRef = useRef<ExplorePost[]>([]);
  postsRef.current = posts;

  const enqueuePendingPosts = useCallback((incoming: ExplorePost[]) => {
    if (incoming.length === 0) {
      return;
    }
    const visibleIds = new Set(
      postsRef.current.map((p) => postIdKey(p)).filter(Boolean),
    );
    const toAdd = incoming.filter((post) => {
      const id = postIdKey(post);
      return !id || !visibleIds.has(id);
    });
    if (toAdd.length === 0) {
      return;
    }
    const merged = mergePostsAtTop(toAdd, pendingNewPostsRef.current);
    pendingNewPostsRef.current = merged;
    setPendingNewCount(merged.length);
  }, []);

  useEffect(
    () =>
      subscribePostCreated((detail) => {
        if (!detail.post) {
          return;
        }
        enqueuePendingPosts([detail.post]);
      }),
    [enqueuePendingPosts],
  );

  useEffect(
    () =>
      subscribeAuthSessionChanged(() => {
        setPosts([]);
        setAuthTick((n) => n + 1);
      }),
    [],
  );

  useEffect(() => {
    setPendingNewCount(0);
    pendingNewPostsRef.current = [];
  }, [scope, refreshKey, authTick]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");

      if (scope === "followed") {
        try {
          const profileRes = await fetchAuthProfile();
          if (!cancelled) {
            setIsGuest(!profileRes.ok);
          }
        } catch {
          if (!cancelled) {
            setIsGuest(true);
          }
        }
      } else if (!cancelled) {
        setIsGuest(false);
      }

      try {
        const response = await getHomeFeed({
          scope,
          ...(perPage != null ? { perPage } : {}),
        });
        if (cancelled) {
          return;
        }
        const rawPosts = response.data.posts ?? [];
        const seen = new Set<string>();
        const uniquePosts = rawPosts.filter((post: ExplorePost) => {
          const id = post?.id != null ? String(post.id).trim() : "";
          const key =
            id ||
            `${post.userName ?? ""}|${post.createDate ?? ""}|${post.subject ?? ""}|${post.image ?? ""}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
        setPosts(
          perPage != null ? uniquePosts.slice(0, perPage) : uniquePosts,
        );
        setPendingNewCount(0);
        pendingNewPostsRef.current = [];
      } catch {
        if (!cancelled) {
          setPosts([]);
          setError(t("homeFeedLoadError"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [scope, refreshKey, authTick, t, perPage]);

  useEffect(() => {
    if (isLoading || error) {
      return undefined;
    }
    if (scope === "followed" && isGuest) {
      return undefined;
    }

    let cancelled = false;

    const poll = async () => {
      if (typeof document !== "undefined" && document.hidden) {
        return;
      }
      try {
        const response = await getHomeFeed({
          scope,
          ...(perPage != null ? { perPage } : {}),
          refresh: true,
        });
        if (cancelled) {
          return;
        }
        const rawPosts = response.data.posts ?? [];
        const seen = new Set<string>();
        const fresh = rawPosts.filter((post: ExplorePost) => {
          const id = post?.id != null ? String(post.id).trim() : "";
          const key =
            id ||
            `${post.userName ?? ""}|${post.createDate ?? ""}|${post.subject ?? ""}|${post.image ?? ""}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
        const sliced =
          perPage != null ? fresh.slice(0, perPage) : fresh;
        const baseline = mergePostsAtTop(
          pendingNewPostsRef.current,
          postsRef.current,
        );
        const nextNew = sliceNewPostsFromFresh(sliced, baseline);
        if (cancelled) {
          return;
        }
        if (nextNew.length > 0) {
          const merged = mergePostsAtTop(
            nextNew,
            pendingNewPostsRef.current,
          );
          pendingNewPostsRef.current = merged;
          setPendingNewCount(merged.length);
        }
      } catch {
        /* ignore; next interval retries */
      }
    };

    const interval = setInterval(poll, NEW_PIKS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLoading, error, scope, isGuest, perPage]);

  const applyPendingNewPiks = useCallback(() => {
    const incoming = pendingNewPostsRef.current;
    if (incoming.length === 0) {
      setPendingNewCount(0);
      return;
    }
    setPosts((prev) => {
      const capped =
        perPage != null ? mergePostsAtTop(incoming, prev).slice(0, perPage) : mergePostsAtTop(incoming, prev);
      return capped;
    });
    pendingNewPostsRef.current = [];
    setPendingNewCount(0);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }, [perPage]);

  if (isLoading) {
    return (
      <div className="mt-4">
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <section className="mb-4 w-full rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-red-600 shadow-card">
        {error}
      </section>
    );
  }

  if (scope === "followed" && isGuest) {
    return (
      <section className="mb-4 w-full rounded-xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-600 shadow-card">
        {t("followedFeedLoginHint")}{" "}
        <Link href="/login" className="font-bold text-58b4d1 hover:underline">
          {t("logIn")}
        </Link>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        <NewPiksFloatingBar
          count={pendingNewCount}
          onActivate={applyPendingNewPiks}
          labelOver={t("feedNewPiksBarOver")}
          labelCount={t("feedNewPiksBar", { count: pendingNewCount })}
        />
        <section className="mb-4 w-full rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-card">
          {scope === "followed" ? t("followedFeedEmpty") : t("karmaFeedEmpty")}
        </section>
      </>
    );
  }

  return (
    <>
      <NewPiksFloatingBar
        count={pendingNewCount}
        onActivate={applyPendingNewPiks}
        labelOver={t("feedNewPiksBarOver")}
        labelCount={t("feedNewPiksBar", { count: pendingNewCount })}
      />
      {posts.map((post) => {
        const author = post.userName?.trim() || "";
        return (
          <PostList
            key={post.id}
            postId={post.id}
            userName={author}
            userLink={author ? `/${author}` : "#"}
            postLink={author ? `/${author}/posts/${post.id}` : "#"}
            profileImage={resolveProfileImageUrl(post.profileImage)}
            time={post.createDate || ""}
            image={
              pickPostImageUrl(post.image, post.imageUrls, "feed") ||
              "/postExample/F5Z00CEaEAAFPgi.jpg"
            }
            commentCount={post.commentCount ?? 0}
            pikCount={post.favoriteCount ?? 0}
            isFavorited={post.isFavorited}
            admin={false}
            postTitle={post.subject}
            tags={post.tags}
            authorIsFollowing={
              scope === "followed" || post.authorIsFollowing === true
            }
            profile={false}
            collectionItem={false}
            readOnly={readOnly}
          />
        );
      })}
    </>
  );
}
