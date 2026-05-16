import { useEffect, useState } from "react";
import PostList from "./post/PostList";
import Skeleton from "@/components/Skeleton";
import { getExplorePosts } from "@/configs/client-services";
import { resolveProfileImageUrl } from "@/src/avatarUrl";
import { pickPostImageUrl } from "@/src/postImageUrl";
import { useTranslation } from "react-i18next";

export interface ExplorePost {
  id: string;
  subject?: string;
  userName?: string;
  createDate?: string;
  commentCount?: number;
  favoriteCount?: number;
  isFavorited?: boolean;
  authorIsFollowing?: boolean;
  image?: string;
  imageUrls?: Record<string, string>;
  profileImage?: string;
  tags?: { slug: string; name: string; imageUrl?: string }[];
}

interface ExploreFeedProps {
  selectedTag?: string;
  readOnly?: boolean;
}

export default function ExploreFeed({ selectedTag = "", readOnly = false }: ExploreFeedProps) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getExplorePosts({
          tag: selectedTag || undefined,
        });
        if (cancelled) {
          return;
        }
        setPosts(response.data.posts ?? []);
      } catch {
        if (!cancelled) {
          setPosts([]);
          setError(t("exploreLoadError"));
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
  }, [selectedTag, t]);

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

  if (posts.length === 0) {
    return (
      <section className="mb-4 w-full rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-card">
        {selectedTag ? t("exploreTagEmpty") : t("exploreEmpty")}
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
            authorIsFollowing={post.authorIsFollowing === true}
            profile={false}
            collectionItem={false}
            readOnly={readOnly}
          />
        );
      })}
    </>
  );
}
