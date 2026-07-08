import { resolvePostAuthorProfileImage } from "@/src/avatarUrl";
import { pickPostImageUrl } from "@/src/postImageUrl";
import PostItem from "@/components/layout/content/post/PostItem";
import Footer from "@/components/main/footer/Footer";
import Header from "@/components/main/header/Index";
import FeedMasonryGrid from "@/components/FeedMasonryGrid";
import {
  getPostById,
  getProfileByUserName,
  getProfilePosts,
} from "@/configs/client-services";
import {
  findPostInProfilePayload,
  normalizeApiPostPayload,
  type PostDetailShape,
} from "@/src/postDetailHelpers";
import { explorePostToMasonryCard } from "@/src/feedMasonryHelpers";
import { type MasonryPostCardData } from "@/components/MasonryPostCard";
import { prepareExplorePosts, type ExplorePost } from "@/src/feedPostTypes";

import { IconArrowNarrowLeft } from "@tabler/icons-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGuestFeedReadOnly } from "@/src/useGuestFeedReadOnly";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import axios from "axios";
import { extractPostFromApiPayload } from "@/src/normalizePostMedia";
import { decodeHtmlEntities } from "@/src/decodeHtmlEntities";

interface SsrPostMeta {
  subject?: string;
  userName?: string;
  image?: string;
  description?: string;
}

export const getServerSideProps: GetServerSideProps<{
  ssrMeta: SsrPostMeta | null;
}> = async (ctx) => {
  const profileSlug = typeof ctx.params?.profile === "string" ? ctx.params.profile : "";
  const postId = typeof ctx.params?.postId === "string" ? ctx.params.postId : "";

  if (!profileSlug || !postId) {
    return { props: { ssrMeta: null } };
  }

  const wordPressBaseUrl = (
    process.env.WORDPRESS_API_URL ?? process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? ""
  ).replace(/\/$/, "");

  if (!wordPressBaseUrl) {
    return { props: { ssrMeta: null } };
  }

  try {
    const { data } = await axios.get(
      `${wordPressBaseUrl}/wp-json/pikcir/v1/posts/${encodeURIComponent(postId)}`,
      { headers: { "Content-Type": "application/json" }, timeout: 5000 },
    );

    const post = extractPostFromApiPayload(data);
    const subject = post?.subject ?? (typeof data?.post?.subject === "string" ? data.post.subject : undefined);
    const decodedSubject = subject ? decodeHtmlEntities(subject) : undefined;
    const image = post?.image ?? post?.imageUrls?.large ?? post?.imageUrls?.medium ?? undefined;

    return {
      props: {
        ssrMeta: {
          subject: decodedSubject ?? null,
          userName: profileSlug,
          image: image ?? null,
          description: decodedSubject ? `${decodedSubject} - @${profileSlug} tarafından paylaşıldı` : null,
        } as SsrPostMeta,
      },
    };
  } catch {
    return { props: { ssrMeta: null } };
  }
};


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

export default function PostDetail({ ssrMeta }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { t } = useTranslation();
  const { feedReadOnly } = useGuestFeedReadOnly();
  const [post, setPost] = useState<PostDetailShape | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Yazarın diğer postları (mevcut post hariç). İlk sayfa gerekli.
  const [relatedPosts, setRelatedPosts] = useState<ExplorePost[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);


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

  // Yazarın diğer postlarını sayfa altında listele. Mevcut post hariç tutulur.
  useEffect(() => {
    if (!router.isReady || !post || !post.userName) {
      return;
    }
    const author = post.userName;
    let cancelled = false;
    setRelatedLoading(true);
    getProfilePosts(author, { page: 1, perPage: 18 })
      .then((res) => {
        if (cancelled) return;
        const raw = (res?.data?.posts ?? []) as ExplorePost[];
        const dedup = raw.filter(
          (p) => String(p?.id ?? "") !== String(post.id ?? ""),
        );
        setRelatedPosts(prepareExplorePosts(dedup));
      })
      .catch(() => {
        if (!cancelled) setRelatedPosts([]);
      })
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [post, router.isReady]);

  const relatedCards = useMemo<MasonryPostCardData[]>(
    () => relatedPosts.map(explorePostToMasonryCard),
    [relatedPosts],
  );

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
            : ssrMeta?.subject
              ? `${ssrMeta.subject} - @${ssrMeta.userName} / Pikcir`
              : `Post / Pikcir`}
        </title>
        <meta
          name="description"
          content={
            post?.subject
              ? `${post.subject} - @${profileSlug} tarafından paylaşıldı`
              : ssrMeta?.description ?? "Kafanın içinde biri var ve sürekli espri yapıyorsa bize katıl. Resmini al gel, koleksiyonlar oluştur, eğlen!"
          }
        />
        <meta property="og:title" content={post?.subject ?? ssrMeta?.subject ?? "Pikcir"} />
        <meta
          property="og:description"
          content={
            post?.subject
              ? `${post.subject} - @${profileSlug} tarafından paylaşıldı`
              : ssrMeta?.description ?? "Pikcir - Resmini al gel!"
          }
        />
        {(post?.image || post?.imageUrls?.large || ssrMeta?.image) && (
          <meta
            property="og:image"
            content={
              pickPostImageUrl(post?.image, post?.imageUrls, "large") ||
              ssrMeta?.image ||
              ""
            }
          />
        )}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
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

              {/* Yazarın diğer postları — masonry grid */}
              {(relatedLoading || relatedCards.length > 0) ? (
                <section className="mt-6">
                  <h2 className="mb-3 text-sm font-bold text-202124">
                    @{post?.userName || profileSlug} · {t("moreFromAuthor")}
                  </h2>
                  {relatedLoading && relatedCards.length === 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={`skeleton-${i}`}
                          className="h-40 w-full animate-pulse rounded-xl bg-gray-100"
                        />
                      ))}
                    </div>
                  ) : (
                    <FeedMasonryGrid
                      posts={relatedCards}
                      resetKey={`related-${post?.id ?? "x"}`}
                      showMeta
                      imageSizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
