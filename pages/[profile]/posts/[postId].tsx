import { resolvePostAuthorProfileImage } from "@/src/avatarUrl";
import { pickPostImageUrl } from "@/src/postImageUrl";
import PostItem from "@/components/layout/content/post/PostItem";
import Footer from "@/components/main/footer/Footer";
import Header from "@/components/main/header/Index";
import { getPostById, getProfileByUserName } from "@/configs/client-services";
import {
  findPostInProfilePayload,
  normalizeApiPostPayload,
  type PostDetailShape,
} from "@/src/postDetailHelpers";
import { IconArrowNarrowLeft } from "@tabler/icons-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGuestFeedReadOnly } from "@/src/useGuestFeedReadOnly";

interface ProfileData {
  userName?: string;
  displayName?: string;
  firstName?: string;
  isOwnProfile?: boolean;
  avatarUrls?: Record<string, string>;
  posts?: Array<Record<string, unknown>>;
  favoritePosts?: Array<Record<string, unknown>>;
  collections?: Array<{ posts?: Array<Record<string, unknown>> }>;
}

export default function PostDetail() {
  const router = useRouter();
  const { t } = useTranslation();
  const { feedReadOnly } = useGuestFeedReadOnly();
  const [post, setPost] = useState<PostDetailShape | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const profileSlug =
    typeof router.query.profile === "string" ? router.query.profile : null;
  const postId =
    typeof router.query.postId === "string" ? router.query.postId : null;

  useEffect(() => {
    if (!router.isReady || !profileSlug || !postId) return;

    let isCancelled = false;

    const fetchData = async () => {
      try {
        const [postRes, profileRes] = await Promise.allSettled([
          getPostById(postId),
          getProfileByUserName(profileSlug),
        ]);

        if (isCancelled) return;

        let resolved: PostDetailShape | null = null;
        let profileUser: ProfileData | null = null;

        if (
          profileRes.status === "fulfilled" &&
          profileRes.value.data?.user
        ) {
          profileUser = profileRes.value.data.user as ProfileData;
          setProfile(profileUser);
        }

        if (postRes.status === "fulfilled" && postRes.value.data) {
          resolved = normalizeApiPostPayload(postRes.value.data);
        }

        if (!resolved && profileUser) {
          resolved = findPostInProfilePayload(profileUser, postId);
        }

        setPost(resolved);
        setError(!resolved);
      } catch {
        if (!isCancelled) {
          setError(true);
          setPost(null);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [profileSlug, postId, router.isReady]);

  const handleGoBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    const slug = profileSlug?.trim();
    if (slug) {
      void router.push(`/${slug}`);
      return;
    }
    void router.push("/");
  }, [profileSlug, router]);

  if (!router.isReady || loading) return null;

  return (
    <>
      <Head>
        <title>
          {post?.subject
            ? `${post.subject} - @${profileSlug} / Pikcir`
            : `Post / Pikcir`}
        </title>
        <meta
          id="meta-description"
          name="description"
          content="Kafanın içinde biri var ve sürekli espri yapıyorsa bize katıl. Resmini al gel, koleksiyonlar oluştur, eğlen!"
        />
      </Head>
      <Header user={profile} />
      <main className="h-auto app-main-with-tab-bar">
        <div className="container lg:mt-3">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 relative mb-4 mt-4 lg:mt-0">
              <div
                className="w-full bg-white rounded mb-4 text-sm text-center min-h-[40px] flex justify-center items-center relative mt-3"
                style={{
                  boxShadow: "rgba(33, 35, 38, 0.1) 0px 10px 10px -10px",
                }}
              >
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="absolute left-4 top-2 flex items-center justify-center gap-0.5"
                  aria-label={t("goBack")}
                >
                  <IconArrowNarrowLeft />
                  <span className="font-bold text-xs text-343a40">
                    {t("goBack")}
                  </span>
                </button>
                <div className="font-bold text-sm text-126782">
                  {t("pikcirDetail")}
                </div>
              </div>

              {error || !post ? (
                <div className="bg-white flex justify-center items-center min-h-[100px] text-center text-sm rounded">
                  <span>Bu gönderi bulunamadı.</span>
                </div>
              ) : (
                <PostItem
                  postId={post.id}
                  userName={post.userName || profileSlug || ""}
                  userLink={`/${post.userName || profileSlug || ""}`}
                  profileImage={resolvePostAuthorProfileImage(
                    post.profileImage,
                    profile?.avatarUrls,
                  )}
                  time={post.createDate || ""}
                  image={
                    pickPostImageUrl(post.image, post.imageUrls, "large") ||
                    "/postExample/F5Z00CEaEAAFPgi.jpg"
                  }
                  commentCount={post.commentCount ?? 0}
                  pikCount={post.favoriteCount ?? 0}
                  isFavorited={post.isFavorited}
                  admin={false}
                  postTitle={post.subject}
                  postLink={`/${post.userName || profileSlug || ""}/posts/${post.id}`}
                  tags={post.tags}
                  categoryName={post.categoryName}
                  isSensitive={post.isSensitive}
                  readOnly={feedReadOnly}
                  onDeleted={() => {
                    const slug = (post.userName || profileSlug || "").trim();
                    if (slug) {
                      void router.push(`/${slug}`);
                    } else {
                      void router.push("/");
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
