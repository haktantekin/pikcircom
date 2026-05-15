import { useEffect, useState } from "react";
import PostList from "./post/PostList";
import Skeleton from "@/components/Skeleton";
import { getHomeFeed } from "@/configs/client-services";
import { resolveProfileImageUrl } from "@/src/avatarUrl";
import { subscribePostCreated } from "@/src/postCreatedEvent";
import { subscribeAuthSessionChanged } from "@/src/authSessionEvent";
import { useTranslation } from "react-i18next";
import type { ExplorePost } from "./ExploreFeed";
import Link from "next/link";

export type HomeFeedScope = "karma" | "followed";

interface HomeFeedProps {
  scope: HomeFeedScope;
  refreshKey?: number;
}

export default function HomeFeed({ scope, refreshKey = 0 }: HomeFeedProps) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventTick, setEventTick] = useState(0);
  const [authTick, setAuthTick] = useState(0);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => subscribePostCreated(() => setEventTick((n) => n + 1)), []);

  useEffect(
    () =>
      subscribeAuthSessionChanged(() => {
        setPosts([]);
        setAuthTick((n) => n + 1);
      }),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");

      if (scope === "followed") {
        try {
          const profileRes = await fetch("/api/auth/profile", {
            credentials: "include",
            cache: "no-store",
          });
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
        const response = await getHomeFeed({ scope });
        if (cancelled) {
          return;
        }
        const rawPosts = response.data.posts ?? [];
        const seen = new Set<string>();
        const uniquePosts = rawPosts.filter((post) => {
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
        setPosts(uniquePosts);
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
  }, [scope, refreshKey, eventTick, authTick, t]);

  if (isLoading) {
    return (
      <div className="mt-4">
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-white rounded mb-4 p-4 text-sm text-center text-red-600">
        {error}
      </section>
    );
  }

  if (scope === "followed" && isGuest) {
    return (
      <section className="w-full bg-white rounded mb-4 p-4 text-sm text-center text-gray-500 border border-gray-200">
        {t("followedFeedLoginHint")}{" "}
        <Link href="/" className="text-58b4d1 font-bold">
          {t("logIn")}
        </Link>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="w-full bg-white rounded mb-4 p-4 text-sm text-center text-gray-500 border border-gray-200">
        {scope === "followed" ? t("followedFeedEmpty") : t("karmaFeedEmpty")}
      </section>
    );
  }

  return (
    <>
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
            image={post.image || "/postExample/F5Z00CEaEAAFPgi.jpg"}
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
          />
        );
      })}
    </>
  );
}
