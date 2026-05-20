import PostList from "@/components/layout/content/contentCenter/post/PostList";
import { resolveProfileImageUrl } from "@/src/avatarUrl";
import type { SearchPostItem } from "@/src/searchTypes";
import { pickPostImageUrl } from "@/src/postImageUrl";
import { useTranslation } from "react-i18next";

interface SearchPostResultsProps {
  posts: SearchPostItem[];
  readOnly?: boolean;
  onPostDeleted?: (postId: string) => void;
}

export default function SearchPostResults({
  posts,
  readOnly = false,
  onPostDeleted,
}: SearchPostResultsProps) {
  const { t } = useTranslation();

  if (posts.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        {t("searchEmptyPosts")}
      </p>
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
            onDeleted={
              onPostDeleted ? () => onPostDeleted(post.id) : undefined
            }
          />
        );
      })}
    </>
  );
}
