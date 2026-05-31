import ContentLeft from "@/components/layout/content/ContentLeft";
import Footer from "@/components/main/footer/Footer";
import Header from "@/components/main/header/Index";
import {
  collectionSlugFromHref,
  profileCollectionsPath,
} from "@/src/profilePaths";
import CollectionPostsImageGrid from "@/components/layout/content/collections/CollectionPostsImageGrid";
import { getProfileByUserName } from "@/configs/client-services";
import { IconArrowNarrowLeft } from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { enrichPostsWithTagsFromCatalog } from "@/src/sensitiveContent";

interface CollectionPostProps {
  id: string;
  category?: number;
  categoryName?: string;
  commentCount?: number;
  favoriteCount?: number;
  isFavorited?: boolean;
  subject?: string;
  userName?: string;
  createDate?: string;
  addedAt?: string;
  image?: string;
  imageUrls?: Record<string, string>;
  profileImage?: string;
  tags?: { slug: string; name: string; imageUrl?: string }[];
}

interface CollectionProps {
  id: string;
  name: string;
  slug?: string;
  link?: string;
  item?: string[];
  count?: number;
  postIds?: number[];
  posts?: CollectionPostProps[];
}

interface ProfilePostCatalogEntry {
  id: string;
  tags?: { slug: string; name: string }[];
}

interface ProfileData {
  userName?: string;
  displayName?: string;
  firstName?: string;
  avatarUrls?: Record<string, string>;
  isOwnProfile?: boolean;
  posts?: ProfilePostCatalogEntry[];
  favoritePosts?: ProfilePostCatalogEntry[];
  collections?: CollectionProps[];
}

export default function CollectionDetail() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const profileSlug = typeof router.query.profile === "string" ? router.query.profile : null;
  const collectionSlug = typeof router.query.slug === "string" ? router.query.slug : null;

  useEffect(() => {
    if (!router.isReady || !profileSlug) return;

    let isCancelled = false;

    getProfileByUserName(profileSlug)
      .then((res) => {
        if (isCancelled) return;
        if (res.data?.user && res.status === 200) {
          setUser(res.data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        if (isCancelled) return;
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [profileSlug, router.isReady]);

  const collection = useMemo(() => {
    if (!user?.collections || !collectionSlug) return null;
    const wanted = collectionSlug.toLowerCase();
    return (
      user.collections.find((c) => {
        const fromLink = c.link
          ? collectionSlugFromHref(c.link).toLowerCase()
          : "";
        const fromSlug = c.slug?.trim().toLowerCase() ?? "";
        const fromName = c.name.trim().toLowerCase().replace(/\s+/g, "-");
        return (
          fromLink === wanted ||
          fromSlug === wanted ||
          fromName === wanted ||
          c.id === collectionSlug
        );
      }) ?? null
    );
  }, [user?.collections, collectionSlug]);

  const enrichedPosts = useMemo(() => {
    const catalog = [...(user?.posts ?? []), ...(user?.favoritePosts ?? [])];
    return enrichPostsWithTagsFromCatalog(collection?.posts ?? [], catalog);
  }, [collection?.posts, user?.posts, user?.favoritePosts]);

  if (!router.isReady || loading) return null;

  return (
    <>
      <Head>
        <title>
          {collection
            ? `${collection.name} - @${profileSlug} / Pikcir`
            : `Koleksiyon / Pikcir`}
        </title>
        <meta
          id="meta-description"
          name="description"
          content="Kafanın içinde biri var ve sürekli espri yapıyorsa bize katıl. Resmini al gel, koleksiyonlar oluştur, eğlen!"
        />
      </Head>
      <Header user={user} />
      <main className="h-auto pb-10 lg:pb-0">
        <div className="container lg:mt-3">
          <div className="grid grid-cols-12 gap-4">
            <ContentLeft />
            <div className="col-span-12 lg:col-span-10 relative mb-4 mt-4 lg:mt-0">
              {!collection ? (
                <div className="bg-white flex justify-center items-center min-h-[100px] px-24 text-center text-sm rounded">
                  <span>Bu koleksiyon bulunamadı.</span>
                </div>
              ) : (
                <>
                  <div
                    className="w-full bg-white rounded mb-4 text-sm text-center min-h-[40px] flex justify-center items-center relative"
                    style={{
                      boxShadow: "rgba(33, 35, 38, 0.1) 0px 10px 10px -10px",
                    }}
                  >
                    <Link
                      href={profileSlug ? profileCollectionsPath(profileSlug) : "/home"}
                      className="absolute left-4 top-2"
                    >
                      <IconArrowNarrowLeft />
                    </Link>
                    <span className="font-bold text-sm text-126782">
                      {collection.name}
                    </span>
                    &nbsp;{t("collectionNameTitle")}
                  </div>
                  {(collection.posts ?? []).length > 0 ? (
                    <div className="rounded-lg bg-white p-1 shadow-card sm:p-2">
                      <CollectionPostsImageGrid
                        posts={enrichedPosts}
                        fallbackUserName={user?.userName || profileSlug || ""}
                      />
                    </div>
                  ) : (
                    <div className="flex min-h-[100px] items-center justify-center rounded-lg bg-white text-center text-sm shadow-card">
                      <span>Bu koleksiyonda henüz gönderi yok.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
