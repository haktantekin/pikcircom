import ContentLeft from "@/components/layout/content/ContentLeft";
import ContentRight from "@/components/layout/content/ContentRight";
import ProfileCenterLayout from "@/components/layout/content/ProfileCenterLayout";
import Footer from "@/components/main/footer/Footer";
import Header from "@/components/main/header/Index";
import { getProfileByUserName } from "@/configs/client-services";
import { profilePath, type ProfileTab } from "@/src/profilePaths";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

export interface ProfilePageUser {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  userName: string;
  userTypeName?: string;
  userDescription?: string;
  phoneNumber?: string;
  birthDate?: string;
  avatarUrls?: Record<string, string>;
  coverUrls?: Record<string, string>;
  coverImageUrl?: string | null;
  postCount?: number;
  followersCount?: number;
  followedCount?: number;
  createdDate?: string;
  followeds?: unknown[];
  followers?: unknown[];
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  followsYou?: boolean;
  posts?: {
    category: number;
    categoryName?: string;
    commentCount: number;
    favoriteCount: number;
    id: string;
    subject: string;
    userName: string;
    createDate: string;
    image?: string;
    profileImage?: string;
    tags?: { slug: string; name: string }[];
  }[];
  favoritePosts?: {
    category?: number;
    categoryName?: string;
    commentCount?: number;
    favoriteCount?: number;
    id: string;
    subject?: string;
    userName?: string;
    createDate?: string;
    image?: string;
    profileImage?: string;
    tags?: { slug: string; name: string }[];
  }[];
  collections?: {
    id: string;
    name: string;
    link?: string;
    count?: number;
    item?: string[];
    postIds?: number[];
    posts?: {
      id: string;
      subject?: string;
      userName?: string;
      createDate?: string;
      image?: string;
      profileImage?: string;
      commentCount?: number;
      favoriteCount?: number;
      isFavorited?: boolean;
    }[];
  }[];
}

interface ProfilePageShellProps {
  activeTab: ProfileTab;
}

export default function ProfilePageShell({ activeTab }: ProfilePageShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<ProfilePageUser>();
  const [noUser, setNoUser] = useState(0);
  const [loadedProfile, setLoadedProfile] = useState<string | null>(null);
  const profileSlug =
    typeof router.query.profile === "string" ? router.query.profile : null;

  const applyProfileResponse = useCallback(
    (res: { data?: { user?: ProfilePageUser }; status: number }) => {
      if (res.data?.user) {
        setNoUser(1);
        if (res.status === 200) {
          setUser(res.data.user);
        }
      } else {
        setUser(undefined);
        setNoUser(2);
      }
    },
    [],
  );

  useEffect(() => {
    if (!router.isReady || !profileSlug) {
      return;
    }

    let isCancelled = false;

    getProfileByUserName(profileSlug)
      .then((res) => {
        if (isCancelled) {
          return;
        }
        applyProfileResponse(res);
        setLoadedProfile(profileSlug);
      })
      .catch(() => {
        if (isCancelled) {
          return;
        }
        setUser(undefined);
        setNoUser(2);
        setLoadedProfile(profileSlug);
      });

    return () => {
      isCancelled = true;
    };
  }, [profileSlug, router.isReady, applyProfileResponse]);

  const refreshProfile = useCallback(() => {
    if (!profileSlug) {
      return;
    }

    void getProfileByUserName(profileSlug)
      .then(applyProfileResponse)
      .catch(() => {
        setUser(undefined);
        setNoUser(2);
      });
  }, [profileSlug, applyProfileResponse]);

  useEffect(() => {
    if (!user || activeTab !== "collection" || user.isOwnProfile) {
      return;
    }

    void router.replace(profilePath(user.userName));
  }, [user, activeTab, router]);

  if (!router.isReady || !profileSlug || loadedProfile !== profileSlug) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {noUser === 1
            ? `${(user?.displayName || user?.firstName || user?.userName || "").toLocaleLowerCase()}- (@${user?.userName}) / Pikcir`
            : "Profil / Pikcir"}
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
            <ProfileCenterLayout
              key={`${profileSlug}-${activeTab}`}
              user={user}
              userCheck={noUser}
              activeTab={activeTab}
              onProfileUpdated={refreshProfile}
            />
            <ContentRight />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
